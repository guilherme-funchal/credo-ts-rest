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
const IndySdkPoolService_1 = require("../../ledger/IndySdkPoolService");
const wallet_1 = require("../../wallet");
const IndySdkIndyDidRegistrar_1 = require("../IndySdkIndyDidRegistrar");
jest.mock('../../ledger/IndySdkPoolService');
const IndySdkPoolServiceMock = IndySdkPoolService_1.IndySdkPoolService;
const indySdkPoolServiceMock = new IndySdkPoolServiceMock();
const pool = {
    config: { indyNamespace: 'pool1' },
};
(0, tests_1.mockFunction)(indySdkPoolServiceMock.getPoolForNamespace).mockReturnValue(pool);
const agentConfig = (0, tests_1.getAgentConfig)('IndySdkIndyDidRegistrar');
const wallet = new wallet_1.IndySdkWallet(tests_1.indySdk, agentConfig.logger, new core_1.SigningProviderRegistry([]));
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
        [IndySdkPoolService_1.IndySdkPoolService, indySdkPoolServiceMock],
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
const indySdkIndyDidRegistrar = new IndySdkIndyDidRegistrar_1.IndySdkIndyDidRegistrar();
describe('IndySdkIndyDidRegistrar', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test('returns an error state if both did and privateKey are provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield indySdkIndyDidRegistrar.create(agentContext, {
            did: 'did:indy:pool1:did-value',
            options: {
                submitterDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                alias: 'Hello',
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
                reason: `Only one of 'privateKey' or 'did' must be provided`,
            },
        });
    }));
    test('returns an error state if the submitter did is not a valid did:indy did', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield indySdkIndyDidRegistrar.create(agentContext, {
            method: 'indy',
            options: {
                submitterDid: 'BzCbsNYhMrjHiqZDTUASHg',
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
        const result = yield indySdkIndyDidRegistrar.create(agentContext, {
            did: 'BzCbsNYhMrjHiqZDTUASHg',
            options: {
                submitterDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
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
        const result = yield indySdkIndyDidRegistrar.create(agentContext, {
            did: 'BzCbsNYhMrjHiqZDTUASHg',
            options: {
                submitterDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
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
        const result = yield indySdkIndyDidRegistrar.create(agentContext, {
            did: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
            options: {
                submitterDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                verkey: 'verkey',
                alias: 'Hello',
            },
        });
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'failed',
                reason: 'Did must be first 16 bytes of the the verkey base58 encoded.',
            },
        });
    }));
    test('returns an error state if did is provided, but does not match with the namespace from the submitterDid', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield indySdkIndyDidRegistrar.create(agentContext, {
            did: 'did:indy:pool2:R1xKJw17sUoXhejEpugMYJ',
            options: {
                submitterDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                verkey: 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu',
                alias: 'Hello',
            },
        });
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'failed',
                reason: 'The submitter did uses namespace pool1 and the did to register uses namespace pool2. Namespaces must match.',
            },
        });
    }));
    test('creates a did:indy document without services', () => __awaiter(void 0, void 0, void 0, function* () {
        const privateKey = core_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c712fd969598e');
        // @ts-ignore method is private
        const registerPublicDidSpy = jest.spyOn(indySdkIndyDidRegistrar, 'registerPublicDid');
        // @ts-ignore type check fails because method is private
        registerPublicDidSpy.mockImplementationOnce(() => Promise.resolve());
        const result = yield indySdkIndyDidRegistrar.create(agentContext, {
            method: 'indy',
            options: {
                alias: 'Hello',
                submitterDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                role: 'STEWARD',
            },
            secret: {
                privateKey,
            },
        });
        expect(registerPublicDidSpy).toHaveBeenCalledWith(agentContext, pool, 
        // Unqualified submitter did
        'BzCbsNYhMrjHiqZDTUASHg', 
        // submitter signing key,
        expect.any(core_1.Key), 
        // Unqualified created indy did
        'R1xKJw17sUoXhejEpugMYJ', 
        // Verkey
        expect.any(core_1.Key), 
        // Alias
        'Hello', 
        // Role
        'STEWARD');
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'finished',
                did: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ',
                didDocument: {
                    '@context': ['https://w3id.org/did/v1', 'https://w3id.org/security/suites/ed25519-2018/v1'],
                    id: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ',
                    verificationMethod: [
                        {
                            id: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ#verkey',
                            type: 'Ed25519VerificationKey2018',
                            controller: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ',
                            publicKeyBase58: 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu',
                        },
                    ],
                    authentication: ['did:indy:pool1:R1xKJw17sUoXhejEpugMYJ#verkey'],
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
        // @ts-ignore method is private
        const registerPublicDidSpy = jest.spyOn(indySdkIndyDidRegistrar, 'registerPublicDid');
        // @ts-ignore type check fails because method is private
        registerPublicDidSpy.mockImplementationOnce(() => Promise.resolve());
        const result = yield indySdkIndyDidRegistrar.create(agentContext, {
            did: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ',
            options: {
                verkey: 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu',
                alias: 'Hello',
                submitterDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                role: 'STEWARD',
            },
            secret: {},
        });
        expect(registerPublicDidSpy).toHaveBeenCalledWith(agentContext, pool, 
        // Unqualified submitter did
        'BzCbsNYhMrjHiqZDTUASHg', 
        // submitter signing key,
        expect.any(core_1.Key), 
        // Unqualified created indy did
        'R1xKJw17sUoXhejEpugMYJ', 
        // Verkey
        expect.any(core_1.Key), 
        // Alias
        'Hello', 
        // Role
        'STEWARD');
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'finished',
                did: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ',
                didDocument: {
                    '@context': ['https://w3id.org/did/v1', 'https://w3id.org/security/suites/ed25519-2018/v1'],
                    id: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ',
                    verificationMethod: [
                        {
                            id: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ#verkey',
                            type: 'Ed25519VerificationKey2018',
                            controller: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ',
                            publicKeyBase58: 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu',
                        },
                    ],
                    authentication: ['did:indy:pool1:R1xKJw17sUoXhejEpugMYJ#verkey'],
                    assertionMethod: undefined,
                    keyAgreement: undefined,
                },
                secret: {},
            },
        });
    }));
    test('creates a did:indy document with services', () => __awaiter(void 0, void 0, void 0, function* () {
        const privateKey = core_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c712fd969598e');
        // @ts-ignore method is private
        const registerPublicDidSpy = jest.spyOn(indySdkIndyDidRegistrar, 'registerPublicDid');
        // @ts-ignore type check fails because method is private
        registerPublicDidSpy.mockImplementationOnce(() => Promise.resolve());
        // @ts-ignore method is private
        const setEndpointsForDidSpy = jest.spyOn(indySdkIndyDidRegistrar, 'setEndpointsForDid');
        // @ts-ignore type check fails because method is private
        setEndpointsForDidSpy.mockImplementationOnce(() => Promise.resolve(undefined));
        const result = yield indySdkIndyDidRegistrar.create(agentContext, {
            method: 'indy',
            options: {
                alias: 'Hello',
                submitterDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                role: 'STEWARD',
                endpoints: {
                    endpoint: 'https://example.com/endpoint',
                    routingKeys: ['key-1'],
                    types: ['DIDComm', 'did-communication', 'endpoint'],
                },
            },
            secret: {
                privateKey,
            },
        });
        expect(registerPublicDidSpy).toHaveBeenCalledWith(agentContext, pool, 
        // Unqualified submitter did
        'BzCbsNYhMrjHiqZDTUASHg', 
        // submitter signing key,
        expect.any(core_1.Key), 
        // Unqualified created indy did
        'R1xKJw17sUoXhejEpugMYJ', 
        // Verkey
        expect.any(core_1.Key), 
        // Alias
        'Hello', 
        // Role
        'STEWARD');
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'finished',
                did: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ',
                didDocument: {
                    '@context': [
                        'https://w3id.org/did/v1',
                        'https://w3id.org/security/suites/ed25519-2018/v1',
                        'https://w3id.org/security/suites/x25519-2019/v1',
                        'https://didcomm.org/messaging/contexts/v2',
                    ],
                    id: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ',
                    verificationMethod: [
                        {
                            id: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ#verkey',
                            type: 'Ed25519VerificationKey2018',
                            controller: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ',
                            publicKeyBase58: 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu',
                        },
                        {
                            id: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ#key-agreement-1',
                            type: 'X25519KeyAgreementKey2019',
                            controller: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ',
                            publicKeyBase58: 'Fbv17ZbnUSbafsiUBJbdGeC62M8v8GEscVMMcE59mRPt',
                        },
                    ],
                    service: [
                        {
                            id: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ#endpoint',
                            serviceEndpoint: 'https://example.com/endpoint',
                            type: 'endpoint',
                        },
                        {
                            id: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ#did-communication',
                            serviceEndpoint: 'https://example.com/endpoint',
                            type: 'did-communication',
                            priority: 0,
                            recipientKeys: ['did:indy:pool1:R1xKJw17sUoXhejEpugMYJ#key-agreement-1'],
                            routingKeys: ['key-1'],
                            accept: ['didcomm/aip2;env=rfc19'],
                        },
                        {
                            id: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ#didcomm-1',
                            serviceEndpoint: 'https://example.com/endpoint',
                            type: 'DIDComm',
                            routingKeys: ['key-1'],
                            accept: ['didcomm/v2'],
                        },
                    ],
                    authentication: ['did:indy:pool1:R1xKJw17sUoXhejEpugMYJ#verkey'],
                    assertionMethod: undefined,
                    keyAgreement: ['did:indy:pool1:R1xKJw17sUoXhejEpugMYJ#key-agreement-1'],
                },
                secret: {
                    privateKey,
                },
            },
        });
    }));
    test('stores the did document', () => __awaiter(void 0, void 0, void 0, function* () {
        const privateKey = core_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c712fd969598e');
        // @ts-ignore method is private
        const registerPublicDidSpy = jest.spyOn(indySdkIndyDidRegistrar, 'registerPublicDid');
        // @ts-ignore type check fails because method is private
        registerPublicDidSpy.mockImplementationOnce(() => Promise.resolve());
        // @ts-ignore method is private
        const setEndpointsForDidSpy = jest.spyOn(indySdkIndyDidRegistrar, 'setEndpointsForDid');
        // @ts-ignore type check fails because method is private
        setEndpointsForDidSpy.mockImplementationOnce(() => Promise.resolve(undefined));
        const saveCalled = jest.fn();
        eventEmitter.on(core_1.RepositoryEventTypes.RecordSaved, saveCalled);
        yield indySdkIndyDidRegistrar.create(agentContext, {
            method: 'indy',
            options: {
                alias: 'Hello',
                submitterDid: 'did:indy:pool1:BzCbsNYhMrjHiqZDTUASHg',
                role: 'STEWARD',
                endpoints: {
                    endpoint: 'https://example.com/endpoint',
                    routingKeys: ['key-1'],
                    types: ['DIDComm', 'did-communication', 'endpoint'],
                },
            },
            secret: {
                privateKey,
            },
        });
        expect(saveCalled).toHaveBeenCalledTimes(1);
        const [saveEvent] = saveCalled.mock.calls[0];
        expect(saveEvent.payload.record).toMatchObject({
            did: 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ',
            role: core_1.DidDocumentRole.Created,
            _tags: {
                recipientKeyFingerprints: ['z6LSrH6AdsQeZuKKmG6Ehx7abEQZsVg2psR2VU536gigUoAe'],
            },
            didDocument: undefined,
        });
    }));
    test('returns an error state when calling update', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield indySdkIndyDidRegistrar.update();
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
        const result = yield indySdkIndyDidRegistrar.deactivate();
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
