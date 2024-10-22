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
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const indy_vdr_nodejs_1 = require("@hyperledger/indy-vdr-nodejs");
const ed25519_1 = require("@stablelib/ed25519");
const sleep_1 = require("../../core/src/utils/sleep");
const helpers_1 = require("../../core/tests/helpers");
const src_1 = require("../../indy-sdk/src");
const setupIndySdkModule_1 = require("../../indy-sdk/tests/setupIndySdkModule");
const src_2 = require("../src");
const IndyVdrIndyDidRegistrar_1 = require("../src/dids/IndyVdrIndyDidRegistrar");
const IndyVdrIndyDidResolver_1 = require("../src/dids/IndyVdrIndyDidResolver");
const didIndyUtil_1 = require("../src/dids/didIndyUtil");
const helpers_2 = require("./helpers");
const endorser = new core_1.Agent((0, helpers_1.getAgentOptions)('Indy VDR Indy DID Registrar', {}, {
    indyVdr: new src_2.IndyVdrModule({
        networks: helpers_2.indyVdrModuleConfig.networks,
        indyVdr: indy_vdr_nodejs_1.indyVdr,
    }),
    indySdk: new src_1.IndySdkModule({
        indySdk: setupIndySdkModule_1.indySdk,
    }),
    dids: new core_1.DidsModule({
        registrars: [new IndyVdrIndyDidRegistrar_1.IndyVdrIndyDidRegistrar()],
        resolvers: [new IndyVdrIndyDidResolver_1.IndyVdrIndyDidResolver(), new src_2.IndyVdrSovDidResolver()],
    }),
}));
const agent = new core_1.Agent((0, helpers_1.getAgentOptions)('Indy VDR Indy DID Registrar', {}, {
    indyVdr: new src_2.IndyVdrModule({
        indyVdr: indy_vdr_nodejs_1.indyVdr,
        networks: helpers_2.indyVdrModuleConfig.networks,
    }),
    indySdk: new src_1.IndySdkModule({
        indySdk: setupIndySdkModule_1.indySdk,
    }),
    dids: new core_1.DidsModule({
        registrars: [new IndyVdrIndyDidRegistrar_1.IndyVdrIndyDidRegistrar()],
        resolvers: [new IndyVdrIndyDidResolver_1.IndyVdrIndyDidResolver(), new src_2.IndyVdrSovDidResolver()],
    }),
}));
describe('Indy VDR Indy Did Registrar', () => {
    let endorserDid;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield endorser.initialize();
        const unqualifiedSubmitterDid = yield (0, helpers_1.importExistingIndyDidFromPrivateKey)(endorser, core_1.TypedArrayEncoder.fromString('00000000000000000000000Endorser9'));
        endorserDid = `did:indy:pool:localtest:${unqualifiedSubmitterDid}`;
        yield agent.initialize();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield endorser.shutdown();
        yield endorser.wallet.delete();
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    test('can register a did:indy without services', () => __awaiter(void 0, void 0, void 0, function* () {
        const didRegistrationResult = yield endorser.dids.create({
            method: 'indy',
            options: {
                endorserDid,
                endorserMode: 'internal',
            },
        });
        expect(core_1.JsonTransformer.toJSON(didRegistrationResult)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'finished',
                did: expect.stringMatching(anoncreds_1.didIndyRegex),
                didDocument: {
                    '@context': ['https://w3id.org/did/v1', 'https://w3id.org/security/suites/ed25519-2018/v1'],
                    id: expect.stringMatching(anoncreds_1.didIndyRegex),
                    alsoKnownAs: undefined,
                    controller: undefined,
                    verificationMethod: [
                        {
                            type: 'Ed25519VerificationKey2018',
                            controller: expect.stringMatching(anoncreds_1.didIndyRegex),
                            id: expect.stringContaining('#verkey'),
                            publicKeyBase58: expect.any(String),
                        },
                    ],
                    capabilityDelegation: undefined,
                    capabilityInvocation: undefined,
                    authentication: [expect.stringContaining('#verkey')],
                    service: undefined,
                },
            },
        });
        const did = didRegistrationResult.didState.did;
        if (!did)
            throw Error('did not defined');
        // Wait some time pass to let ledger settle the object
        yield (0, sleep_1.sleep)(1000);
        const didResolutionResult = yield endorser.dids.resolve(did);
        expect(core_1.JsonTransformer.toJSON(didResolutionResult)).toMatchObject({
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
                service: undefined,
            },
            didDocumentMetadata: {},
            didResolutionMetadata: {
                contentType: 'application/did+ld+json',
            },
        });
    }));
    test('cannot create a did with TRUSTEE role', () => __awaiter(void 0, void 0, void 0, function* () {
        const didRegistrationResult = yield endorser.dids.create({
            method: 'indy',
            options: {
                endorserDid,
                endorserMode: 'internal',
                role: 'TRUSTEE',
            },
        });
        expect(core_1.JsonTransformer.toJSON(didRegistrationResult.didState.state)).toBe('failed');
    }));
    test('can register an endorsed did:indy without services - did and verkey specified', () => __awaiter(void 0, void 0, void 0, function* () {
        // Generate a seed and the indy did. This allows us to create a new did every time
        // but still check if the created output document is as expected.
        const seed = Array(32 + 1)
            .join((Math.random().toString(36) + '00000000000000000').slice(2, 18))
            .slice(0, 32);
        const keyPair = (0, ed25519_1.generateKeyPairFromSeed)(core_1.TypedArrayEncoder.fromString(seed));
        const ed25519PublicKeyBase58 = core_1.TypedArrayEncoder.toBase58(keyPair.publicKey);
        const { did, verkey } = (0, didIndyUtil_1.indyDidFromNamespaceAndInitialKey)('pool:localtest', core_1.Key.fromPublicKey(keyPair.publicKey, core_1.KeyType.Ed25519));
        const didCreateTobeEndorsedResult = (yield agent.dids.create({
            did,
            options: {
                endorserDid,
                endorserMode: 'external',
                verkey,
            },
        }));
        const didState = didCreateTobeEndorsedResult.didState;
        if (didState.state !== 'action' || didState.action !== 'endorseIndyTransaction')
            throw Error('unexpected did state');
        const signedNymRequest = yield endorser.modules.indyVdr.endorseTransaction(didState.nymRequest, didState.endorserDid);
        const didCreateSubmitResult = yield agent.dids.create({
            did: didState.did,
            options: {
                endorserMode: 'external',
                endorsedTransaction: {
                    nymRequest: signedNymRequest,
                },
            },
            secret: didState.secret,
        });
        expect(core_1.JsonTransformer.toJSON(didCreateSubmitResult)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'finished',
                did,
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
                            publicKeyBase58: ed25519PublicKeyBase58,
                        },
                    ],
                    capabilityDelegation: undefined,
                    capabilityInvocation: undefined,
                    authentication: [`${did}#verkey`],
                    service: undefined,
                },
            },
        });
        // Wait some time pass to let ledger settle the object
        yield (0, sleep_1.sleep)(1000);
        const didResult = yield endorser.dids.resolve(did);
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
                        publicKeyBase58: ed25519PublicKeyBase58,
                    },
                ],
                capabilityDelegation: undefined,
                capabilityInvocation: undefined,
                authentication: [`${did}#verkey`],
                service: undefined,
            },
            didDocumentMetadata: {},
            didResolutionMetadata: {
                contentType: 'application/did+ld+json',
            },
        });
    }));
    test('can register a did:indy without services - did and verkey specified', () => __awaiter(void 0, void 0, void 0, function* () {
        // Generate a seed and the indy did. This allows us to create a new did every time
        // but still check if the created output document is as expected.
        const seed = Array(32 + 1)
            .join((Math.random().toString(36) + '00000000000000000').slice(2, 18))
            .slice(0, 32);
        const keyPair = (0, ed25519_1.generateKeyPairFromSeed)(core_1.TypedArrayEncoder.fromString(seed));
        const ed25519PublicKeyBase58 = core_1.TypedArrayEncoder.toBase58(keyPair.publicKey);
        const { did, verkey } = (0, didIndyUtil_1.indyDidFromNamespaceAndInitialKey)('pool:localtest', core_1.Key.fromPublicKey(keyPair.publicKey, core_1.KeyType.Ed25519));
        const didRegistrationResult = yield endorser.dids.create({
            did,
            options: {
                endorserDid,
                endorserMode: 'internal',
                verkey,
            },
        });
        expect(core_1.JsonTransformer.toJSON(didRegistrationResult)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'finished',
                did,
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
                            publicKeyBase58: ed25519PublicKeyBase58,
                        },
                    ],
                    capabilityDelegation: undefined,
                    capabilityInvocation: undefined,
                    authentication: [`${did}#verkey`],
                    service: undefined,
                },
            },
        });
        // Wait some time pass to let ledger settle the object
        yield (0, sleep_1.sleep)(1000);
        const didResult = yield endorser.dids.resolve(did);
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
                        publicKeyBase58: ed25519PublicKeyBase58,
                    },
                ],
                capabilityDelegation: undefined,
                capabilityInvocation: undefined,
                authentication: [`${did}#verkey`],
                service: undefined,
            },
            didDocumentMetadata: {},
            didResolutionMetadata: {
                contentType: 'application/did+ld+json',
            },
        });
    }));
    test('can register a did:indy with services - did and verkey specified - using attrib endpoint', () => __awaiter(void 0, void 0, void 0, function* () {
        // Generate a private key and the indy did. This allows us to create a new did every time
        // but still check if the created output document is as expected.
        const privateKey = core_1.TypedArrayEncoder.fromString(Array(32 + 1)
            .join((Math.random().toString(36) + '00000000000000000').slice(2, 18))
            .slice(0, 32));
        const key = yield endorser.wallet.createKey({ privateKey, keyType: core_1.KeyType.Ed25519 });
        const x25519PublicKeyBase58 = core_1.TypedArrayEncoder.toBase58((0, ed25519_1.convertPublicKeyToX25519)(key.publicKey));
        const ed25519PublicKeyBase58 = core_1.TypedArrayEncoder.toBase58(key.publicKey);
        const { did, verkey } = (0, didIndyUtil_1.indyDidFromNamespaceAndInitialKey)('pool:localtest', core_1.Key.fromPublicKey(key.publicKey, core_1.KeyType.Ed25519));
        const didRegistrationResult = yield endorser.dids.create({
            did,
            options: {
                endorserDid,
                endorserMode: 'internal',
                useEndpointAttrib: true,
                verkey,
                services: [
                    new core_1.DidDocumentService({
                        id: `${did}#endpoint`,
                        serviceEndpoint: 'https://example.com/endpoint',
                        type: 'endpoint',
                    }),
                    new core_1.DidCommV1Service({
                        id: `${did}#did-communication`,
                        priority: 0,
                        recipientKeys: [`${did}#key-agreement-1`],
                        routingKeys: ['a-routing-key'],
                        serviceEndpoint: 'https://example.com/endpoint',
                        accept: ['didcomm/aip2;env=rfc19'],
                    }),
                    new core_1.DidCommV2Service({
                        accept: ['didcomm/v2'],
                        id: `${did}#didcomm-1`,
                        routingKeys: ['a-routing-key'],
                        serviceEndpoint: 'https://example.com/endpoint',
                    }),
                ],
            },
        });
        const expectedDidDocument = {
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
                    publicKeyBase58: ed25519PublicKeyBase58,
                },
                {
                    type: 'X25519KeyAgreementKey2019',
                    controller: did,
                    id: `${did}#key-agreement-1`,
                    publicKeyBase58: x25519PublicKeyBase58,
                },
            ],
            capabilityDelegation: undefined,
            capabilityInvocation: undefined,
            authentication: [`${did}#verkey`],
            service: [
                {
                    id: `${did}#endpoint`,
                    serviceEndpoint: 'https://example.com/endpoint',
                    type: 'endpoint',
                },
                {
                    accept: ['didcomm/aip2;env=rfc19'],
                    id: `${did}#did-communication`,
                    priority: 0,
                    recipientKeys: [`${did}#key-agreement-1`],
                    routingKeys: ['a-routing-key'],
                    serviceEndpoint: 'https://example.com/endpoint',
                    type: 'did-communication',
                },
                {
                    accept: ['didcomm/v2'],
                    id: `${did}#didcomm-1`,
                    routingKeys: ['a-routing-key'],
                    serviceEndpoint: 'https://example.com/endpoint',
                    type: 'DIDComm',
                },
            ],
        };
        expect(core_1.JsonTransformer.toJSON(didRegistrationResult)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'finished',
                did,
                didDocument: expectedDidDocument,
            },
        });
        // Wait some time pass to let ledger settle the object
        yield (0, sleep_1.sleep)(1000);
        const didResult = yield endorser.dids.resolve(did);
        expect(core_1.JsonTransformer.toJSON(didResult)).toMatchObject({
            didDocument: expectedDidDocument,
            didDocumentMetadata: {},
            didResolutionMetadata: {
                contentType: 'application/did+ld+json',
            },
        });
    }));
    test('can register an endorsed did:indy with services - did and verkey specified - using attrib endpoint', () => __awaiter(void 0, void 0, void 0, function* () {
        // Generate a private key and the indy did. This allows us to create a new did every time
        // but still check if the created output document is as expected.
        const privateKey = core_1.TypedArrayEncoder.fromString(Array(32 + 1)
            .join((Math.random().toString(36) + '00000000000000000').slice(2, 18))
            .slice(0, 32));
        const key = yield endorser.wallet.createKey({ privateKey, keyType: core_1.KeyType.Ed25519 });
        const x25519PublicKeyBase58 = core_1.TypedArrayEncoder.toBase58((0, ed25519_1.convertPublicKeyToX25519)(key.publicKey));
        const ed25519PublicKeyBase58 = core_1.TypedArrayEncoder.toBase58(key.publicKey);
        const { did, verkey } = (0, didIndyUtil_1.indyDidFromNamespaceAndInitialKey)('pool:localtest', core_1.Key.fromPublicKey(key.publicKey, core_1.KeyType.Ed25519));
        const didCreateTobeEndorsedResult = (yield endorser.dids.create({
            did,
            options: {
                endorserMode: 'external',
                endorserDid: endorserDid,
                useEndpointAttrib: true,
                verkey,
                services: [
                    new core_1.DidDocumentService({
                        id: `${did}#endpoint`,
                        serviceEndpoint: 'https://example.com/endpoint',
                        type: 'endpoint',
                    }),
                    new core_1.DidCommV1Service({
                        id: `${did}#did-communication`,
                        priority: 0,
                        recipientKeys: [`${did}#key-agreement-1`],
                        routingKeys: ['a-routing-key'],
                        serviceEndpoint: 'https://example.com/endpoint',
                        accept: ['didcomm/aip2;env=rfc19'],
                    }),
                    new core_1.DidCommV2Service({
                        accept: ['didcomm/v2'],
                        id: `${did}#didcomm-1`,
                        routingKeys: ['a-routing-key'],
                        serviceEndpoint: 'https://example.com/endpoint',
                    }),
                ],
            },
        }));
        const didState = didCreateTobeEndorsedResult.didState;
        if (didState.state !== 'action' || didState.action !== 'endorseIndyTransaction')
            throw Error('unexpected did state');
        const signedNymRequest = yield endorser.modules.indyVdr.endorseTransaction(didState.nymRequest, didState.endorserDid);
        if (!didState.attribRequest)
            throw Error('attrib request not found');
        const endorsedAttribRequest = yield endorser.modules.indyVdr.endorseTransaction(didState.attribRequest, didState.endorserDid);
        const didCreateSubmitResult = yield agent.dids.create({
            did: didState.did,
            options: {
                endorserMode: 'external',
                endorsedTransaction: {
                    nymRequest: signedNymRequest,
                    attribRequest: endorsedAttribRequest,
                },
            },
            secret: didState.secret,
        });
        const expectedDidDocument = {
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
                    publicKeyBase58: ed25519PublicKeyBase58,
                },
                {
                    type: 'X25519KeyAgreementKey2019',
                    controller: did,
                    id: `${did}#key-agreement-1`,
                    publicKeyBase58: x25519PublicKeyBase58,
                },
            ],
            capabilityDelegation: undefined,
            capabilityInvocation: undefined,
            authentication: [`${did}#verkey`],
            service: [
                {
                    id: `${did}#endpoint`,
                    serviceEndpoint: 'https://example.com/endpoint',
                    type: 'endpoint',
                },
                {
                    accept: ['didcomm/aip2;env=rfc19'],
                    id: `${did}#did-communication`,
                    priority: 0,
                    recipientKeys: [`${did}#key-agreement-1`],
                    routingKeys: ['a-routing-key'],
                    serviceEndpoint: 'https://example.com/endpoint',
                    type: 'did-communication',
                },
                {
                    accept: ['didcomm/v2'],
                    id: `${did}#didcomm-1`,
                    routingKeys: ['a-routing-key'],
                    serviceEndpoint: 'https://example.com/endpoint',
                    type: 'DIDComm',
                },
            ],
        };
        expect(core_1.JsonTransformer.toJSON(didCreateSubmitResult)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'finished',
                did,
                didDocument: expectedDidDocument,
            },
        });
        // Wait some time pass to let ledger settle the object
        yield (0, sleep_1.sleep)(1000);
        const didResult = yield endorser.dids.resolve(did);
        expect(core_1.JsonTransformer.toJSON(didResult)).toMatchObject({
            didDocument: expectedDidDocument,
            didDocumentMetadata: {},
            didResolutionMetadata: {
                contentType: 'application/did+ld+json',
            },
        });
    }));
});
