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
const helpers_1 = require("../../core/tests/helpers");
const setupIndySdkModule_1 = require("./setupIndySdkModule");
const agent = new core_1.Agent((0, helpers_1.getAgentOptions)('Indy SDK Indy DID resolver', {}, (0, setupIndySdkModule_1.getIndySdkModules)()));
describe('Indy SDK Indy DID resolver', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.initialize();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    it('should resolve a did:indy did', () => __awaiter(void 0, void 0, void 0, function* () {
        // Add existing endorser did to the wallet
        const unqualifiedSubmitterDid = yield (0, helpers_1.importExistingIndyDidFromPrivateKey)(agent, core_1.TypedArrayEncoder.fromString(helpers_1.publicDidSeed));
        const createResult = yield agent.dids.create({
            method: 'indy',
            options: {
                submitterDid: `did:indy:pool:localtest:${unqualifiedSubmitterDid}`,
                alias: 'Alias',
                role: 'TRUSTEE',
                endpoints: {
                    endpoint: 'http://localhost:3000',
                },
            },
        });
        // Terrible, but the did can't be immediately resolved, so we need to wait a bit
        yield new Promise((res) => setTimeout(res, 1000));
        if (!createResult.didState.did)
            throw new core_1.AriesFrameworkError('Unable to register did');
        const didResult = yield agent.dids.resolve(createResult.didState.did);
        expect(core_1.JsonTransformer.toJSON(didResult)).toMatchObject({
            didDocument: {
                '@context': [
                    'https://w3id.org/did/v1',
                    'https://w3id.org/security/suites/ed25519-2018/v1',
                    'https://w3id.org/security/suites/x25519-2019/v1',
                ],
                id: createResult.didState.did,
                alsoKnownAs: undefined,
                controller: undefined,
                verificationMethod: [
                    {
                        type: 'Ed25519VerificationKey2018',
                        controller: createResult.didState.did,
                        id: `${createResult.didState.did}#verkey`,
                        publicKeyBase58: expect.any(String),
                    },
                    {
                        controller: createResult.didState.did,
                        type: 'X25519KeyAgreementKey2019',
                        id: `${createResult.didState.did}#key-agreement-1`,
                        publicKeyBase58: expect.any(String),
                    },
                ],
                capabilityDelegation: undefined,
                capabilityInvocation: undefined,
                authentication: [`${createResult.didState.did}#verkey`],
                assertionMethod: undefined,
                keyAgreement: [`${createResult.didState.did}#key-agreement-1`],
                service: [
                    {
                        id: `${createResult.didState.did}#endpoint`,
                        serviceEndpoint: 'http://localhost:3000',
                        type: 'endpoint',
                    },
                    {
                        id: `${createResult.didState.did}#did-communication`,
                        accept: ['didcomm/aip2;env=rfc19'],
                        priority: 0,
                        recipientKeys: [`${createResult.didState.did}#key-agreement-1`],
                        routingKeys: [],
                        serviceEndpoint: 'http://localhost:3000',
                        type: 'did-communication',
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
