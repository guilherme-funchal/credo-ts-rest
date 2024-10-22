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
const rxjs_1 = require("rxjs");
const InMemoryStorageService_1 = require("../../../../../tests/InMemoryStorageService");
const tests_1 = require("../../../../core/tests");
const src_1 = require("../../../../indy-sdk/src");
const pool_1 = require("../../pool");
const IndyVdrIndyDidRegistrar_1 = require("../IndyVdrIndyDidRegistrar");
jest.mock('../../pool/IndyVdrPool');
const IndyVdrPoolMock = pool_1.IndyVdrPool;
const poolMock = new IndyVdrPoolMock();
(0, tests_1.mockProperty)(poolMock, 'indyNamespace', 'ns1');
const agentConfig = (0, tests_1.getAgentConfig)('IndyVdrIndyDidRegistrar');
const wallet = new src_1.IndySdkWallet(tests_1.indySdk, agentConfig.logger, new core_1.SigningProviderRegistry([]));
jest
    .spyOn(wallet, 'createKey')
    .mockResolvedValue(core_1.Key.fromPublicKeyBase58('E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu', core_1.KeyType.Ed25519));
const storageService = new InMemoryStorageService_1.InMemoryStorageService();
const eventEmitter = new core_1.EventEmitter(tests_1.agentDependencies, new rxjs_1.Subject());
const didRepository = new core_1.DidRepository(storageService, eventEmitter);
const agentContext = (0, tests_1.getAgentContext)({
    wallet,
    registerInstances: [
        [core_1.DidRepository, didRepository],
        [pool_1.IndyVdrPoolService, { getPoolForNamespace: jest.fn().mockReturnValue(poolMock) }],
        [
            core_1.DidsApi,
            {
                resolve: jest.fn().mockResolvedValue({
                    didDocument: new core_1.DidDocument({
                        id: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                        authentication: [
                            new core_1.VerificationMethod({
                                id: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg#verkey',
                                type: 'Ed25519VerificationKey2018',
                                controller: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                                publicKeyBase58: 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu',
                            }),
                        ],
                    }),
                }),
            },
        ],
    ],
    agentConfig,
});
const indyVdrIndyDidRegistrar = new IndyVdrIndyDidRegistrar_1.IndyVdrIndyDidRegistrar();
describe('IndyVdrIndyDidRegistrar', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test('returns an error state if both did and privateKey are provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield indyVdrIndyDidRegistrar.create(agentContext, {
            did: 'did:indy:pool1:did-value',
            options: {
                alias: 'Hello',
                endorserMode: 'internal',
                endorserDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
            },
            secret: {
                privateKey: core_1.TypedArrayEncoder.fromString('key'),
            },
        });
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'failed',
                reason: `Only one of 'seed', 'privateKey' and 'did' must be provided`,
            },
        });
    }));
    test('returns an error state if the endorser did is not a valid did:indy did', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield indyVdrIndyDidRegistrar.create(agentContext, {
            method: 'indy',
            options: {
                endorserMode: 'internal',
                endorserDid: 'BzCbsNYhMrjHiqZDTUASHg',
                alias: 'Hello',
            },
        });
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'failed',
                reason: 'unknownError: BzCbsNYhMrjHiqZDTUASHg is not a valid did:indy did',
            },
        });
    }));
    test('returns an error state if did is provided, but it is not a valid did:indy did', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield indyVdrIndyDidRegistrar.create(agentContext, {
            did: 'BzCbsNYhMrjHiqZDTUASHg',
            options: {
                endorserMode: 'internal',
                endorserDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                verkey: 'verkey',
                alias: 'Hello',
            },
        });
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'failed',
                reason: 'unknownError: BzCbsNYhMrjHiqZDTUASHg is not a valid did:indy did',
            },
        });
    }));
    test('returns an error state if did is provided, but no verkey', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield indyVdrIndyDidRegistrar.create(agentContext, {
            did: 'BzCbsNYhMrjHiqZDTUASHg',
            options: {
                endorserMode: 'internal',
                endorserDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                alias: 'Hello',
            },
        });
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'failed',
                reason: 'If a did is defined, a matching verkey must be provided',
            },
        });
    }));
    test('returns an error state if did and verkey are provided, but the did is not self certifying', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield indyVdrIndyDidRegistrar.create(agentContext, {
            did: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
            options: {
                endorserMode: 'internal',
                endorserDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                verkey: 'verkey',
                alias: 'Hello',
            },
        });
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'failed',
                reason: 'Initial verkey verkey does not match did did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
            },
        });
    }));
    test('returns an error state if did is provided, but does not match with the namespace from the endorserDid', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield indyVdrIndyDidRegistrar.create(agentContext, {
            did: 'did:indy:pool2:B6xaJg1c2xU3D9ppCtt1CZ',
            options: {
                endorserMode: 'internal',
                endorserDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                verkey: 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu',
                alias: 'Hello',
            },
        });
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'failed',
                reason: "The endorser did uses namespace: 'pool1' and the did to register uses namespace: 'pool2'. Namespaces must match.",
            },
        });
    }));
    test('creates a did:indy document without services', () => __awaiter(void 0, void 0, void 0, function* () {
        const privateKey = core_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c712fd969598e');
        // @ts-ignore - method is private
        const createRegisterDidWriteRequest = jest.spyOn(indyVdrIndyDidRegistrar, 'createRegisterDidWriteRequest');
        // @ts-ignore type check fails because method is private
        createRegisterDidWriteRequest.mockImplementationOnce(() => Promise.resolve());
        // @ts-ignore - method is private
        const registerPublicDidSpy = jest.spyOn(indyVdrIndyDidRegistrar, 'registerPublicDid');
        // @ts-ignore type check fails because method is private
        registerPublicDidSpy.mockImplementationOnce(() => Promise.resolve());
        const result = yield indyVdrIndyDidRegistrar.create(agentContext, {
            method: 'indy',
            options: {
                alias: 'Hello',
                endorserMode: 'internal',
                endorserDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                role: 'STEWARD',
            },
            secret: {
                privateKey,
            },
        });
        expect(createRegisterDidWriteRequest).toHaveBeenCalledWith({
            agentContext,
            pool: poolMock,
            signingKey: expect.any(core_1.Key),
            submitterNamespaceIdentifier: 'BzCbsNYhMrjHiqZDTUASHg',
            namespaceIdentifier: 'B6xaJg1c2xU3D9ppCtt1CZ',
            verificationKey: expect.any(core_1.Key),
            alias: 'Hello',
            diddocContent: undefined,
            role: 'STEWARD',
        });
        expect(registerPublicDidSpy).toHaveBeenCalledWith(agentContext, poolMock, undefined);
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'finished',
                did: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                didDocument: {
                    '@context': ['https://w3id.org/did/v1', 'https://w3id.org/security/suites/ed25519-2018/v1'],
                    id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                    verificationMethod: [
                        {
                            id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#verkey',
                            type: 'Ed25519VerificationKey2018',
                            controller: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                            publicKeyBase58: 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu',
                        },
                    ],
                    authentication: ['did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#verkey'],
                    assertionMethod: undefined,
                    keyAgreement: undefined,
                },
                secret: {
                    privateKey,
                },
            },
        });
    }));
    test('creates a did:indy document by passing did', () => __awaiter(void 0, void 0, void 0, function* () {
        // @ts-ignore - method is private
        const createRegisterDidWriteRequest = jest.spyOn(indyVdrIndyDidRegistrar, 'createRegisterDidWriteRequest');
        // @ts-ignore type check fails because method is private
        createRegisterDidWriteRequest.mockImplementationOnce(() => Promise.resolve());
        // @ts-ignore - method is private
        const registerPublicDidSpy = jest.spyOn(indyVdrIndyDidRegistrar, 'registerPublicDid');
        // @ts-ignore type check fails because method is private
        registerPublicDidSpy.mockImplementationOnce(() => Promise.resolve());
        const result = yield indyVdrIndyDidRegistrar.create(agentContext, {
            did: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
            options: {
                verkey: 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu',
                alias: 'Hello',
                endorserMode: 'internal',
                endorserDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                role: 'STEWARD',
            },
            secret: {},
        });
        expect(createRegisterDidWriteRequest).toHaveBeenCalledWith({
            agentContext,
            pool: poolMock,
            signingKey: expect.any(core_1.Key),
            submitterNamespaceIdentifier: 'BzCbsNYhMrjHiqZDTUASHg',
            namespaceIdentifier: 'B6xaJg1c2xU3D9ppCtt1CZ',
            verificationKey: expect.any(core_1.Key),
            alias: 'Hello',
            diddocContent: undefined,
            role: 'STEWARD',
        });
        expect(registerPublicDidSpy).toHaveBeenCalledWith(agentContext, poolMock, 
        // writeRequest
        undefined);
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'finished',
                did: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                didDocument: {
                    '@context': ['https://w3id.org/did/v1', 'https://w3id.org/security/suites/ed25519-2018/v1'],
                    id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                    verificationMethod: [
                        {
                            id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#verkey',
                            type: 'Ed25519VerificationKey2018',
                            controller: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                            publicKeyBase58: 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu',
                        },
                    ],
                    authentication: ['did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#verkey'],
                    assertionMethod: undefined,
                    keyAgreement: undefined,
                },
                secret: {},
            },
        });
    }));
    test('creates a did:indy document with services using diddocContent', () => __awaiter(void 0, void 0, void 0, function* () {
        const privateKey = core_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c712fd969598e');
        // @ts-ignore - method is private
        const createRegisterDidWriteRequestSpy = jest.spyOn(indyVdrIndyDidRegistrar, 'createRegisterDidWriteRequest');
        // @ts-ignore type check fails because method is private
        createRegisterDidWriteRequestSpy.mockImplementationOnce(() => Promise.resolve());
        // @ts-ignore - method is private
        const registerPublicDidSpy = jest.spyOn(indyVdrIndyDidRegistrar, 'registerPublicDid');
        // @ts-ignore type check fails because method is private
        registerPublicDidSpy.mockImplementationOnce(() => Promise.resolve());
        // @ts-ignore - method is private
        const setEndpointsForDidSpy = jest.spyOn(indyVdrIndyDidRegistrar, 'setEndpointsForDid');
        const result = yield indyVdrIndyDidRegistrar.create(agentContext, {
            method: 'indy',
            options: {
                alias: 'Hello',
                endorserMode: 'internal',
                endorserDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                role: 'STEWARD',
                services: [
                    new core_1.DidDocumentService({
                        id: `#endpoint`,
                        serviceEndpoint: 'https://example.com/endpoint',
                        type: 'endpoint',
                    }),
                    new core_1.DidCommV1Service({
                        id: `#did-communication`,
                        priority: 0,
                        recipientKeys: [`#key-agreement-1`],
                        routingKeys: ['key-1'],
                        serviceEndpoint: 'https://example.com/endpoint',
                        accept: ['didcomm/aip2;env=rfc19'],
                    }),
                    new core_1.DidCommV2Service({
                        accept: ['didcomm/v2'],
                        id: `#didcomm-1`,
                        routingKeys: ['key-1'],
                        serviceEndpoint: 'https://example.com/endpoint',
                    }),
                ],
            },
            secret: {
                privateKey,
            },
        });
        expect(createRegisterDidWriteRequestSpy).toHaveBeenCalledWith({
            agentContext,
            pool: poolMock,
            signingKey: expect.any(core_1.Key),
            submitterNamespaceIdentifier: 'BzCbsNYhMrjHiqZDTUASHg',
            namespaceIdentifier: 'B6xaJg1c2xU3D9ppCtt1CZ',
            verificationKey: expect.any(core_1.Key),
            alias: 'Hello',
            role: 'STEWARD',
            diddocContent: {
                '@context': [],
                authentication: [],
                id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                keyAgreement: ['did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#key-agreement-1'],
                service: [
                    {
                        id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#endpoint',
                        serviceEndpoint: 'https://example.com/endpoint',
                        type: 'endpoint',
                    },
                    {
                        accept: ['didcomm/aip2;env=rfc19'],
                        id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#did-communication',
                        priority: 0,
                        recipientKeys: ['did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#key-agreement-1'],
                        routingKeys: ['key-1'],
                        serviceEndpoint: 'https://example.com/endpoint',
                        type: 'did-communication',
                    },
                    {
                        accept: ['didcomm/v2'],
                        id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#didcomm-1',
                        routingKeys: ['key-1'],
                        serviceEndpoint: 'https://example.com/endpoint',
                        type: 'DIDComm',
                    },
                ],
                verificationMethod: [
                    {
                        controller: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                        id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#key-agreement-1',
                        publicKeyBase58: 'Fbv17ZbnUSbafsiUBJbdGeC62M8v8GEscVMMcE59mRPt',
                        type: 'X25519KeyAgreementKey2019',
                    },
                ],
            },
        });
        expect(registerPublicDidSpy).toHaveBeenCalledWith(agentContext, poolMock, 
        // writeRequest
        undefined);
        expect(setEndpointsForDidSpy).not.toHaveBeenCalled();
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'finished',
                did: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                didDocument: {
                    '@context': [
                        'https://w3id.org/did/v1',
                        'https://w3id.org/security/suites/ed25519-2018/v1',
                        'https://w3id.org/security/suites/x25519-2019/v1',
                        'https://didcomm.org/messaging/contexts/v2',
                    ],
                    id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                    verificationMethod: [
                        {
                            id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#verkey',
                            type: 'Ed25519VerificationKey2018',
                            controller: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                            publicKeyBase58: 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu',
                        },
                        {
                            id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#key-agreement-1',
                            type: 'X25519KeyAgreementKey2019',
                            controller: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                            publicKeyBase58: 'Fbv17ZbnUSbafsiUBJbdGeC62M8v8GEscVMMcE59mRPt',
                        },
                    ],
                    service: [
                        {
                            id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#endpoint',
                            serviceEndpoint: 'https://example.com/endpoint',
                            type: 'endpoint',
                        },
                        {
                            id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#did-communication',
                            serviceEndpoint: 'https://example.com/endpoint',
                            type: 'did-communication',
                            priority: 0,
                            recipientKeys: ['did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#key-agreement-1'],
                            routingKeys: ['key-1'],
                            accept: ['didcomm/aip2;env=rfc19'],
                        },
                        {
                            id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#didcomm-1',
                            serviceEndpoint: 'https://example.com/endpoint',
                            type: 'DIDComm',
                            routingKeys: ['key-1'],
                            accept: ['didcomm/v2'],
                        },
                    ],
                    authentication: ['did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#verkey'],
                    assertionMethod: undefined,
                    keyAgreement: ['did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#key-agreement-1'],
                },
                secret: {
                    privateKey,
                },
            },
        });
    }));
    test('creates a did:indy document with services using attrib', () => __awaiter(void 0, void 0, void 0, function* () {
        const privateKey = core_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c712fd969598e');
        // @ts-ignore - method is private
        const createRegisterDidWriteRequestSpy = jest.spyOn(indyVdrIndyDidRegistrar, 'createRegisterDidWriteRequest');
        // @ts-ignore type check fails because method is private
        createRegisterDidWriteRequestSpy.mockImplementationOnce(() => Promise.resolve());
        // @ts-ignore - method is private
        const registerPublicDidSpy = jest.spyOn(indyVdrIndyDidRegistrar, 'registerPublicDid');
        // @ts-ignore type check fails because method is private
        registerPublicDidSpy.mockImplementationOnce(() => Promise.resolve());
        // @ts-ignore - method is private
        const createSetDidEndpointsRequestSpy = jest.spyOn(indyVdrIndyDidRegistrar, 'createSetDidEndpointsRequest');
        // @ts-ignore type check fails because method is private
        createSetDidEndpointsRequestSpy.mockImplementationOnce(() => Promise.resolve(undefined));
        // @ts-ignore - method is private
        const setEndpointsForDidSpy = jest.spyOn(indyVdrIndyDidRegistrar, 'setEndpointsForDid');
        // @ts-ignore type check fails because method is private
        setEndpointsForDidSpy.mockImplementationOnce(() => Promise.resolve(undefined));
        const result = yield indyVdrIndyDidRegistrar.create(agentContext, {
            method: 'indy',
            options: {
                alias: 'Hello',
                endorserMode: 'internal',
                endorserDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                role: 'STEWARD',
                useEndpointAttrib: true,
                services: [
                    new core_1.DidDocumentService({
                        id: `#endpoint`,
                        serviceEndpoint: 'https://example.com/endpoint',
                        type: 'endpoint',
                    }),
                    new core_1.DidCommV1Service({
                        id: `#did-communication`,
                        priority: 0,
                        recipientKeys: [`#key-agreement-1`],
                        routingKeys: ['key-1'],
                        serviceEndpoint: 'https://example.com/endpoint',
                        accept: ['didcomm/aip2;env=rfc19'],
                    }),
                    new core_1.DidCommV2Service({
                        accept: ['didcomm/v2'],
                        id: `#didcomm-1`,
                        routingKeys: ['key-1'],
                        serviceEndpoint: 'https://example.com/endpoint',
                    }),
                ],
            },
            secret: {
                privateKey,
            },
        });
        expect(createRegisterDidWriteRequestSpy).toHaveBeenCalledWith({
            agentContext,
            pool: poolMock,
            signingKey: expect.any(core_1.Key),
            submitterNamespaceIdentifier: 'BzCbsNYhMrjHiqZDTUASHg',
            namespaceIdentifier: 'B6xaJg1c2xU3D9ppCtt1CZ',
            verificationKey: expect.any(core_1.Key),
            alias: 'Hello',
            diddocContent: undefined,
            role: 'STEWARD',
        });
        expect(registerPublicDidSpy).toHaveBeenCalledWith(agentContext, poolMock, 
        // writeRequest
        undefined);
        expect(createSetDidEndpointsRequestSpy).toHaveBeenCalledWith({
            agentContext,
            pool: poolMock,
            signingKey: expect.any(core_1.Key),
            endorserDid: undefined,
            // Unqualified created indy did
            unqualifiedDid: 'B6xaJg1c2xU3D9ppCtt1CZ',
            endpoints: {
                endpoint: 'https://example.com/endpoint',
                routingKeys: ['key-1'],
                types: ['endpoint', 'did-communication', 'DIDComm'],
            },
        });
        expect(setEndpointsForDidSpy).not.toHaveBeenCalled();
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'finished',
                did: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                didDocument: {
                    '@context': [
                        'https://w3id.org/did/v1',
                        'https://w3id.org/security/suites/ed25519-2018/v1',
                        'https://w3id.org/security/suites/x25519-2019/v1',
                        'https://didcomm.org/messaging/contexts/v2',
                    ],
                    id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                    verificationMethod: [
                        {
                            id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#verkey',
                            type: 'Ed25519VerificationKey2018',
                            controller: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                            publicKeyBase58: 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu',
                        },
                        {
                            id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#key-agreement-1',
                            type: 'X25519KeyAgreementKey2019',
                            controller: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
                            publicKeyBase58: 'Fbv17ZbnUSbafsiUBJbdGeC62M8v8GEscVMMcE59mRPt',
                        },
                    ],
                    service: [
                        {
                            id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#endpoint',
                            serviceEndpoint: 'https://example.com/endpoint',
                            type: 'endpoint',
                        },
                        {
                            id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#did-communication',
                            serviceEndpoint: 'https://example.com/endpoint',
                            type: 'did-communication',
                            priority: 0,
                            recipientKeys: ['did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#key-agreement-1'],
                            routingKeys: ['key-1'],
                            accept: ['didcomm/aip2;env=rfc19'],
                        },
                        {
                            id: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#didcomm-1',
                            serviceEndpoint: 'https://example.com/endpoint',
                            type: 'DIDComm',
                            routingKeys: ['key-1'],
                            accept: ['didcomm/v2'],
                        },
                    ],
                    authentication: ['did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#verkey'],
                    assertionMethod: undefined,
                    keyAgreement: ['did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ#key-agreement-1'],
                },
                secret: {
                    privateKey,
                },
            },
        });
    }));
    test('stores the did document', () => __awaiter(void 0, void 0, void 0, function* () {
        const privateKey = core_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c712fd969598e');
        // @ts-ignore - method is private
        const createRegisterDidWriteRequestSpy = jest.spyOn(indyVdrIndyDidRegistrar, 'createRegisterDidWriteRequest');
        // @ts-ignore type check fails because method is private
        createRegisterDidWriteRequestSpy.mockImplementationOnce(() => Promise.resolve());
        // @ts-ignore - method is private
        const registerPublicDidSpy = jest.spyOn(indyVdrIndyDidRegistrar, 'registerPublicDid');
        // @ts-ignore type check fails because method is private
        registerPublicDidSpy.mockImplementationOnce(() => Promise.resolve());
        // @ts-ignore - method is private
        const setEndpointsForDidSpy = jest.spyOn(indyVdrIndyDidRegistrar, 'setEndpointsForDid');
        // @ts-ignore type check fails because method is private
        setEndpointsForDidSpy.mockImplementationOnce(() => Promise.resolve(undefined));
        const saveCalled = jest.fn();
        eventEmitter.on(core_1.RepositoryEventTypes.RecordSaved, saveCalled);
        yield indyVdrIndyDidRegistrar.create(agentContext, {
            method: 'indy',
            options: {
                alias: 'Hello',
                endorserMode: 'internal',
                endorserDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                role: 'STEWARD',
                services: [
                    new core_1.DidDocumentService({
                        id: `#endpoint`,
                        serviceEndpoint: 'https://example.com/endpoint',
                        type: 'endpoint',
                    }),
                    new core_1.DidCommV1Service({
                        id: `#did-communication`,
                        priority: 0,
                        recipientKeys: [`#key-agreement-1`],
                        routingKeys: ['key-1'],
                        serviceEndpoint: 'https://example.com/endpoint',
                        accept: ['didcomm/aip2;env=rfc19'],
                    }),
                    new core_1.DidCommV2Service({
                        accept: ['didcomm/v2'],
                        id: `#didcomm-1`,
                        routingKeys: ['key-1'],
                        serviceEndpoint: 'https://example.com/endpoint',
                    }),
                ],
            },
            secret: {
                privateKey,
            },
        });
        expect(saveCalled).toHaveBeenCalledTimes(1);
        const [saveEvent] = saveCalled.mock.calls[0];
        expect(saveEvent.payload.record).toMatchObject({
            did: 'did:indy:pool1:B6xaJg1c2xU3D9ppCtt1CZ',
            role: core_1.DidDocumentRole.Created,
            _tags: {
                recipientKeyFingerprints: ['z6LSrH6AdsQeZuKKmG6Ehx7abEQZsVg2psR2VU536gigUoAe'],
            },
            didDocument: undefined,
        });
    }));
    test('returns an error state when calling update', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield indyVdrIndyDidRegistrar.update();
        expect(result).toEqual({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'failed',
                reason: `notImplemented: updating did:indy not implemented yet`,
            },
        });
    }));
    test('returns an error state when calling deactivate', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield indyVdrIndyDidRegistrar.deactivate();
        expect(result).toEqual({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'failed',
                reason: `notImplemented: deactivating did:indy not implemented yet`,
            },
        });
    }));
});
