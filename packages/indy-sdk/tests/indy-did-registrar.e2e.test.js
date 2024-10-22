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
const ed25519_1 = require("@stablelib/ed25519");
const tests_1 = require("../../core/tests");
const did_1 = require("../src/utils/did");
const setupIndySdkModule_1 = require("./setupIndySdkModule");
const agentOptions = (0, tests_1.getAgentOptions)('Indy Sdk Indy Did Registrar', {}, (0, setupIndySdkModule_1.getIndySdkModules)());
const agent = new core_1.Agent(agentOptions);
describe('Indy SDK Indy Did Registrar', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.initialize();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    it('should create a did:indy did', () => __awaiter(void 0, void 0, void 0, function* () {
        // Add existing endorser did to the wallet
        const unqualifiedSubmitterDid = yield (0, tests_1.importExistingIndyDidFromPrivateKey)(agent, core_1.TypedArrayEncoder.fromString(tests_1.publicDidSeed));
        // Generate a seed and the indy did. This allows us to create a new did every time
        // but still check if the created output document is as expected.
        const privateKey = core_1.TypedArrayEncoder.fromString(Array(32 + 1)
            .join((Math.random().toString(36) + '00000000000000000').slice(2, 18))
            .slice(0, 32));
        const publicKeyEd25519 = (0, ed25519_1.generateKeyPairFromSeed)(privateKey).publicKey;
        const x25519PublicKeyBase58 = core_1.TypedArrayEncoder.toBase58((0, core_1.convertPublicKeyToX25519)(publicKeyEd25519));
        const ed25519PublicKeyBase58 = core_1.TypedArrayEncoder.toBase58(publicKeyEd25519);
        const unqualifiedDid = (0, did_1.legacyIndyDidFromPublicKeyBase58)(ed25519PublicKeyBase58);
        const did = yield agent.dids.create({
            method: 'indy',
            options: {
                submitterDid: `did:indy:pool:localtest:${unqualifiedSubmitterDid}`,
                alias: 'Alias',
                endpoints: {
                    endpoint: 'https://example.com/endpoint',
                    types: ['DIDComm', 'did-communication', 'endpoint'],
                    routingKeys: ['a-routing-key'],
                },
            },
            secret: {
                privateKey,
            },
        });
        expect(core_1.JsonTransformer.toJSON(did)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'finished',
                did: `did:indy:pool:localtest:${unqualifiedDid}`,
                didDocument: {
                    '@context': [
                        'https://w3id.org/did/v1',
                        'https://w3id.org/security/suites/ed25519-2018/v1',
                        'https://w3id.org/security/suites/x25519-2019/v1',
                        'https://didcomm.org/messaging/contexts/v2',
                    ],
                    alsoKnownAs: undefined,
                    controller: undefined,
                    verificationMethod: [
                        {
                            id: `did:indy:pool:localtest:${unqualifiedDid}#verkey`,
                            type: 'Ed25519VerificationKey2018',
                            controller: `did:indy:pool:localtest:${unqualifiedDid}`,
                            publicKeyBase58: ed25519PublicKeyBase58,
                        },
                        {
                            id: `did:indy:pool:localtest:${unqualifiedDid}#key-agreement-1`,
                            type: 'X25519KeyAgreementKey2019',
                            controller: `did:indy:pool:localtest:${unqualifiedDid}`,
                            publicKeyBase58: x25519PublicKeyBase58,
                        },
                    ],
                    service: [
                        {
                            id: `did:indy:pool:localtest:${unqualifiedDid}#endpoint`,
                            serviceEndpoint: 'https://example.com/endpoint',
                            type: 'endpoint',
                        },
                        {
                            accept: ['didcomm/aip2;env=rfc19'],
                            id: `did:indy:pool:localtest:${unqualifiedDid}#did-communication`,
                            priority: 0,
                            recipientKeys: [`did:indy:pool:localtest:${unqualifiedDid}#key-agreement-1`],
                            routingKeys: ['a-routing-key'],
                            serviceEndpoint: 'https://example.com/endpoint',
                            type: 'did-communication',
                        },
                        {
                            accept: ['didcomm/v2'],
                            id: `did:indy:pool:localtest:${unqualifiedDid}#didcomm-1`,
                            routingKeys: ['a-routing-key'],
                            serviceEndpoint: 'https://example.com/endpoint',
                            type: 'DIDComm',
                        },
                    ],
                    authentication: [`did:indy:pool:localtest:${unqualifiedDid}#verkey`],
                    assertionMethod: undefined,
                    keyAgreement: [`did:indy:pool:localtest:${unqualifiedDid}#key-agreement-1`],
                    capabilityInvocation: undefined,
                    capabilityDelegation: undefined,
                    id: `did:indy:pool:localtest:${unqualifiedDid}`,
                },
                secret: {
                    privateKey,
                },
            },
        });
    }));
});
