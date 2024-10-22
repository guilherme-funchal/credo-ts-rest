"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aries-framework/core");
const indy_vdr_nodejs_1 = require("@hyperledger/indy-vdr-nodejs");
const helpers_1 = require("../../core/tests/helpers");
const src_1 = require("../../indy-sdk/src");
const setupIndySdkModule_1 = require("../../indy-sdk/tests/setupIndySdkModule");
const src_2 = require("../src");
const dids_1 = require("../src/dids");
const helpers_2 = require("./helpers");
const agent = new core_1.Agent((0, helpers_1.getAgentOptions)('Indy VDR Indy DID resolver', {}, {
    indyVdr: new src_2.IndyVdrModule({
        indyVdr: indy_vdr_nodejs_1.indyVdr,
        networks: helpers_2.indyVdrModuleConfig.networks,
    }),
    indySdk: new src_1.IndySdkModule({
        indySdk: setupIndySdkModule_1.indySdk,
    }),
    dids: new core_1.DidsModule({
        registrars: [new dids_1.IndyVdrIndyDidRegistrar()],
        resolvers: [new dids_1.IndyVdrIndyDidResolver(), new dids_1.IndyVdrSovDidResolver()],
    }),
}));
describe('indy-vdr DID Resolver E2E', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.initialize();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    test('resolve a did:indy did', () => __awaiter(void 0, void 0, void 0, function* () {
        const did = 'did:indy:pool:localtest:TL1EaPFCZ8Si5aUrqScBDt';
        const didResult = yield agent.dids.resolve(did);
        expect(core_1.JsonTransformer.toJSON(didResult)).toMatchObject({
            didDocument: {
                '@context': ['https://w3id.org/did/v1', 'https://w3id.org/security/suites/ed25519-2018/v1'],
                id: did,
                alsoKnownAs: undefined,
                controller: undefined,
                verificationMethod: [
                    {
                        type: 'Ed25519VerificationKey2018',
                        controller: did,
                        id: `${did}#verkey`,
                        publicKeyBase58: expect.any(String),
                    },
                ],
                capabilityDelegation: undefined,
                capabilityInvocation: undefined,
                authentication: [`${did}#verkey`],
                assertionMethod: undefined,
                keyAgreement: undefined,
                service: undefined,
            },
            didDocumentMetadata: {},
            didResolutionMetadata: {
                contentType: 'application/did+ld+json',
            },
        });
    }));
    test('resolve a did with endpoints', () => __awaiter(void 0, void 0, void 0, function* () {
        const unqualifiedSubmitterDid = yield (0, helpers_1.importExistingIndyDidFromPrivateKey)(agent, core_1.TypedArrayEncoder.fromString('000000000000000000000000Trustee9'));
        // First we need to create a new DID and add ATTRIB endpoint to it
        const { did } = yield (0, helpers_2.createDidOnLedger)(agent, `did:indy:pool:localtest:${unqualifiedSubmitterDid}`);
        // DID created. Now resolve it
        const didResult = yield agent.dids.resolve(did);
        expect(core_1.JsonTransformer.toJSON(didResult)).toMatchObject({
            didDocument: {
                '@context': [
                    'https://w3id.org/did/v1',
                    'https://w3id.org/security/suites/ed25519-2018/v1',
                    'https://w3id.org/security/suites/x25519-2019/v1',
                    'https://didcomm.org/messaging/contexts/v2',
                ],
                id: did,
                alsoKnownAs: undefined,
                controller: undefined,
                verificationMethod: [
                    {
                        type: 'Ed25519VerificationKey2018',
                        controller: did,
                        id: `${did}#verkey`,
                        publicKeyBase58: expect.any(String),
                    },
                    {
                        controller: did,
                        type: 'X25519KeyAgreementKey2019',
                        id: `${did}#key-agreement-1`,
                        publicKeyBase58: expect.any(String),
                    },
                ],
                capabilityDelegation: undefined,
                capabilityInvocation: undefined,
                authentication: [`${did}#verkey`],
                assertionMethod: undefined,
                keyAgreement: [`${did}#key-agreement-1`],
                service: [
                    {
                        id: `${did}#endpoint`,
                        serviceEndpoint: 'http://localhost:3000',
                        type: 'endpoint',
                    },
                    {
                        id: `${did}#did-communication`,
                        accept: ['didcomm/aip2;env=rfc19'],
                        priority: 0,
                        recipientKeys: [`${did}#key-agreement-1`],
                        routingKeys: ['a-routing-key'],
                        serviceEndpoint: 'http://localhost:3000',
                        type: 'did-communication',
                    },
                    {
                        id: `${did}#didcomm-1`,
                        accept: ['didcomm/v2'],
                        routingKeys: ['a-routing-key'],
                        serviceEndpoint: 'http://localhost:3000',
                        type: 'DIDComm',
                    },
                ],
            },
            didDocumentMetadata: {},
            didResolutionMetadata: {
                contentType: 'application/did+ld+json',
            },
        });
    }));
});
