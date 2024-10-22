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
const rxjs_1 = require("rxjs");
const src_1 = require("../../../../../indy-sdk/src");
const setupIndySdkModule_1 = require("../../../../../indy-sdk/tests/setupIndySdkModule");
const helpers_1 = require("../../../../tests/helpers");
const AgentMessage_1 = require("../../../agent/AgentMessage");
const EventEmitter_1 = require("../../../agent/EventEmitter");
const InboundMessageContext_1 = require("../../../agent/models/InboundMessageContext");
const crypto_1 = require("../../../crypto");
const signing_provider_1 = require("../../../crypto/signing-provider");
const SignatureDecoratorUtils_1 = require("../../../decorators/signature/SignatureDecoratorUtils");
const JsonTransformer_1 = require("../../../utils/JsonTransformer");
const did_1 = require("../../../utils/did");
const uuid_1 = require("../../../utils/uuid");
const common_1 = require("../../common");
const dids_1 = require("../../dids");
const DidDocumentRole_1 = require("../../dids/domain/DidDocumentRole");
const DidCommV1Service_1 = require("../../dids/domain/service/DidCommV1Service");
const peerDidNumAlgo1_1 = require("../../dids/methods/peer/peerDidNumAlgo1");
const repository_1 = require("../../dids/repository");
const DidRegistrarService_1 = require("../../dids/services/DidRegistrarService");
const OutOfBandService_1 = require("../../oob/OutOfBandService");
const OutOfBandRole_1 = require("../../oob/domain/OutOfBandRole");
const OutOfBandState_1 = require("../../oob/domain/OutOfBandState");
const OutOfBandRepository_1 = require("../../oob/repository/OutOfBandRepository");
const messages_1 = require("../messages");
const models_1 = require("../models");
const ConnectionRepository_1 = require("../repository/ConnectionRepository");
const ConnectionService_1 = require("../services/ConnectionService");
const helpers_2 = require("../services/helpers");
jest.mock('../repository/ConnectionRepository');
jest.mock('../../oob/repository/OutOfBandRepository');
jest.mock('../../oob/OutOfBandService');
jest.mock('../../dids/services/DidRegistrarService');
jest.mock('../../dids/repository/DidRepository');
const ConnectionRepositoryMock = ConnectionRepository_1.ConnectionRepository;
const OutOfBandRepositoryMock = OutOfBandRepository_1.OutOfBandRepository;
const OutOfBandServiceMock = OutOfBandService_1.OutOfBandService;
const DidRepositoryMock = repository_1.DidRepository;
const DidRegistrarServiceMock = DidRegistrarService_1.DidRegistrarService;
const didRegistrarService = new DidRegistrarServiceMock();
(0, helpers_1.mockFunction)(didRegistrarService.create).mockResolvedValue({
    didDocumentMetadata: {},
    didRegistrationMetadata: {},
    didState: {
        state: 'finished',
        did: 'did:peer:123',
        didDocument: {},
    },
});
const connectionImageUrl = 'https://example.com/image.png';
const agentConfig = (0, helpers_1.getAgentConfig)('ConnectionServiceTest', {
    endpoints: ['http://agent.com:8080'],
    connectionImageUrl,
});
const outOfBandRepository = new OutOfBandRepositoryMock();
const outOfBandService = new OutOfBandServiceMock();
describe('ConnectionService', () => {
    let wallet;
    let connectionRepository;
    let didRepository;
    let connectionService;
    let eventEmitter;
    let myRouting;
    let agentContext;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        wallet = new src_1.IndySdkWallet(setupIndySdkModule_1.indySdk, agentConfig.logger, new signing_provider_1.SigningProviderRegistry([]));
        agentContext = (0, helpers_1.getAgentContext)({
            wallet,
            agentConfig,
            registerInstances: [
                [OutOfBandRepository_1.OutOfBandRepository, outOfBandRepository],
                [OutOfBandService_1.OutOfBandService, outOfBandService],
            ],
        });
        yield wallet.createAndOpen(agentConfig.walletConfig);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield wallet.delete();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        eventEmitter = new EventEmitter_1.EventEmitter(agentConfig.agentDependencies, new rxjs_1.Subject());
        connectionRepository = new ConnectionRepositoryMock();
        didRepository = new DidRepositoryMock();
        connectionService = new ConnectionService_1.ConnectionService(agentConfig.logger, connectionRepository, didRepository, eventEmitter);
        myRouting = {
            recipientKey: crypto_1.Key.fromFingerprint('z6MkwFkSP4uv5PhhKJCGehtjuZedkotC7VF64xtMsxuM8R3W'),
            endpoints: (_a = agentConfig.endpoints) !== null && _a !== void 0 ? _a : [],
            routingKeys: [],
            mediatorId: 'fakeMediatorId',
        };
        (0, helpers_1.mockFunction)(didRepository.getById).mockResolvedValue(new repository_1.DidRecord({
            did: 'did:peer:123',
            role: DidDocumentRole_1.DidDocumentRole.Created,
        }));
    }));
    describe('createRequest', () => {
        it('returns a connection request message containing the information from the connection record', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(5);
            const outOfBand = (0, helpers_1.getMockOutOfBand)({ state: OutOfBandState_1.OutOfBandState.PrepareResponse });
            const config = { routing: myRouting };
            const { connectionRecord, message } = yield connectionService.createRequest(agentContext, outOfBand, config);
            expect(connectionRecord.state).toBe(models_1.DidExchangeState.RequestSent);
            expect(message.label).toBe(agentConfig.label);
            expect(message.connection.did).toBe('XpwgBjsC2wh3eHcMW6ZRJT');
            const publicKey = new models_1.Ed25119Sig2018({
                id: `XpwgBjsC2wh3eHcMW6ZRJT#1`,
                controller: 'XpwgBjsC2wh3eHcMW6ZRJT',
                publicKeyBase58: 'HoVPnpfUjrDECoMZy8vu4U6dwEcLhbzjNwyS3gwLDCG8',
            });
            expect(message.connection.didDoc).toEqual(new models_1.DidDoc({
                id: 'XpwgBjsC2wh3eHcMW6ZRJT',
                publicKey: [publicKey],
                authentication: [new models_1.ReferencedAuthentication(publicKey, models_1.authenticationTypes.Ed25519VerificationKey2018)],
                service: [
                    new dids_1.IndyAgentService({
                        id: `XpwgBjsC2wh3eHcMW6ZRJT#IndyAgentService-1`,
                        serviceEndpoint: agentConfig.endpoints[0],
                        recipientKeys: ['HoVPnpfUjrDECoMZy8vu4U6dwEcLhbzjNwyS3gwLDCG8'],
                        routingKeys: [],
                    }),
                ],
            }));
            expect(message.imageUrl).toBe(connectionImageUrl);
        }));
        it('returns a connection request message containing a custom label', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const outOfBand = (0, helpers_1.getMockOutOfBand)({ state: OutOfBandState_1.OutOfBandState.PrepareResponse });
            const config = { label: 'Custom label', routing: myRouting };
            const { message } = yield connectionService.createRequest(agentContext, outOfBand, config);
            expect(message.label).toBe('Custom label');
        }));
        it('returns a connection record containing image url', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const outOfBand = (0, helpers_1.getMockOutOfBand)({ state: OutOfBandState_1.OutOfBandState.PrepareResponse, imageUrl: connectionImageUrl });
            const config = { label: 'Custom label', routing: myRouting };
            const { connectionRecord } = yield connectionService.createRequest(agentContext, outOfBand, config);
            expect(connectionRecord.imageUrl).toBe(connectionImageUrl);
        }));
        it('returns a connection request message containing a custom image url', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const outOfBand = (0, helpers_1.getMockOutOfBand)({ state: OutOfBandState_1.OutOfBandState.PrepareResponse });
            const config = { imageUrl: 'custom-image-url', routing: myRouting };
            const { message } = yield connectionService.createRequest(agentContext, outOfBand, config);
            expect(message.imageUrl).toBe('custom-image-url');
        }));
        it(`throws an error when out-of-band role is not ${OutOfBandRole_1.OutOfBandRole.Receiver}`, () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const outOfBand = (0, helpers_1.getMockOutOfBand)({ role: OutOfBandRole_1.OutOfBandRole.Sender, state: OutOfBandState_1.OutOfBandState.PrepareResponse });
            const config = { routing: myRouting };
            return expect(connectionService.createRequest(agentContext, outOfBand, config)).rejects.toThrowError(`Invalid out-of-band record role ${OutOfBandRole_1.OutOfBandRole.Sender}, expected is ${OutOfBandRole_1.OutOfBandRole.Receiver}.`);
        }));
        const invalidConnectionStates = [OutOfBandState_1.OutOfBandState.Initial, OutOfBandState_1.OutOfBandState.AwaitResponse, OutOfBandState_1.OutOfBandState.Done];
        test.each(invalidConnectionStates)(`throws an error when out-of-band state is %s and not ${OutOfBandState_1.OutOfBandState.PrepareResponse}`, (state) => {
            expect.assertions(1);
            const outOfBand = (0, helpers_1.getMockOutOfBand)({ state });
            const config = { routing: myRouting };
            return expect(connectionService.createRequest(agentContext, outOfBand, config)).rejects.toThrowError(`Invalid out-of-band record state ${state}, valid states are: ${OutOfBandState_1.OutOfBandState.PrepareResponse}.`);
        });
    });
    describe('processRequest', () => {
        it('returns a connection record containing the information from the connection request', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(5);
            const theirDid = 'their-did';
            const theirKey = crypto_1.Key.fromPublicKeyBase58('79CXkde3j8TNuMXxPdV7nLUrT2g7JAEjH5TreyVY7GEZ', crypto_1.KeyType.Ed25519);
            const theirDidDoc = new models_1.DidDoc({
                id: theirDid,
                publicKey: [],
                authentication: [
                    new models_1.EmbeddedAuthentication(new models_1.Ed25119Sig2018({
                        id: `${theirDid}#key-id`,
                        controller: theirDid,
                        publicKeyBase58: theirKey.publicKeyBase58,
                    })),
                ],
                service: [
                    new DidCommV1Service_1.DidCommV1Service({
                        id: `${theirDid};indy`,
                        serviceEndpoint: 'https://endpoint.com',
                        recipientKeys: [`${theirDid}#key-id`],
                    }),
                ],
            });
            const connectionRequest = new messages_1.ConnectionRequestMessage({
                did: theirDid,
                didDoc: theirDidDoc,
                label: 'test-label',
                imageUrl: connectionImageUrl,
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(connectionRequest, {
                agentContext,
                senderKey: theirKey,
                recipientKey: crypto_1.Key.fromPublicKeyBase58('8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K', crypto_1.KeyType.Ed25519),
            });
            const outOfBand = (0, helpers_1.getMockOutOfBand)({
                mediatorId: 'fakeMediatorId',
                role: OutOfBandRole_1.OutOfBandRole.Sender,
                state: OutOfBandState_1.OutOfBandState.AwaitResponse,
            });
            const processedConnection = yield connectionService.processRequest(messageContext, outOfBand);
            expect(processedConnection.state).toBe(models_1.DidExchangeState.RequestReceived);
            expect(processedConnection.theirDid).toBe('did:peer:1zQmW2esSyEVGzrh3CFt1eQZUHEAb3Li1hyPudPhSoFevrFY');
            expect(processedConnection.theirLabel).toBe('test-label');
            expect(processedConnection.threadId).toBe(connectionRequest.id);
            expect(processedConnection.imageUrl).toBe(connectionImageUrl);
        }));
        it('returns a new connection record containing the information from the connection request when multiUseInvitation is enabled on the connection', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(8);
            const connectionRecord = (0, helpers_1.getMockConnection)({
                id: 'test',
                state: models_1.DidExchangeState.InvitationSent,
                role: models_1.DidExchangeRole.Responder,
            });
            const theirDid = 'their-did';
            const theirKey = crypto_1.Key.fromPublicKeyBase58('79CXkde3j8TNuMXxPdV7nLUrT2g7JAEjH5TreyVY7GEZ', crypto_1.KeyType.Ed25519);
            const theirDidDoc = new models_1.DidDoc({
                id: theirDid,
                publicKey: [],
                authentication: [
                    new models_1.EmbeddedAuthentication(new models_1.Ed25119Sig2018({
                        id: `${theirDid}#key-id`,
                        controller: theirDid,
                        publicKeyBase58: theirKey.publicKeyBase58,
                    })),
                ],
                service: [
                    new DidCommV1Service_1.DidCommV1Service({
                        id: `${theirDid};indy`,
                        serviceEndpoint: 'https://endpoint.com',
                        recipientKeys: [`${theirDid}#key-id`],
                    }),
                ],
            });
            const connectionRequest = new messages_1.ConnectionRequestMessage({
                did: theirDid,
                didDoc: theirDidDoc,
                label: 'test-label',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(connectionRequest, {
                agentContext,
                connection: connectionRecord,
                senderKey: theirKey,
                recipientKey: crypto_1.Key.fromPublicKeyBase58('8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K', crypto_1.KeyType.Ed25519),
            });
            const outOfBand = (0, helpers_1.getMockOutOfBand)({
                mediatorId: 'fakeMediatorId',
                role: OutOfBandRole_1.OutOfBandRole.Sender,
                state: OutOfBandState_1.OutOfBandState.AwaitResponse,
            });
            const processedConnection = yield connectionService.processRequest(messageContext, outOfBand);
            expect(processedConnection.state).toBe(models_1.DidExchangeState.RequestReceived);
            expect(processedConnection.theirDid).toBe('did:peer:1zQmW2esSyEVGzrh3CFt1eQZUHEAb3Li1hyPudPhSoFevrFY');
            expect(processedConnection.theirLabel).toBe('test-label');
            expect(processedConnection.threadId).toBe(connectionRequest.id);
            expect(connectionRepository.save).toHaveBeenCalledTimes(1);
            expect(processedConnection.id).not.toBe(connectionRecord.id);
            expect(connectionRecord.id).toBe('test');
            expect(connectionRecord.state).toBe(models_1.DidExchangeState.InvitationSent);
        }));
        it('throws an error when the message does not contain a did doc', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const connectionRequest = new messages_1.ConnectionRequestMessage({
                did: 'did',
                label: 'test-label',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(connectionRequest, {
                agentContext,
                recipientKey: crypto_1.Key.fromPublicKeyBase58('8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K', crypto_1.KeyType.Ed25519),
                senderKey: crypto_1.Key.fromPublicKeyBase58('79CXkde3j8TNuMXxPdV7nLUrT2g7JAEjH5TreyVY7GEZ', crypto_1.KeyType.Ed25519),
            });
            const outOfBand = (0, helpers_1.getMockOutOfBand)({ role: OutOfBandRole_1.OutOfBandRole.Sender, state: OutOfBandState_1.OutOfBandState.AwaitResponse });
            return expect(connectionService.processRequest(messageContext, outOfBand)).rejects.toThrowError(`Public DIDs are not supported yet`);
        }));
        it(`throws an error when out-of-band role is not ${OutOfBandRole_1.OutOfBandRole.Sender}`, () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const inboundMessage = new InboundMessageContext_1.InboundMessageContext(jest.fn()(), {
                agentContext,
                recipientKey: crypto_1.Key.fromPublicKeyBase58('8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K', crypto_1.KeyType.Ed25519),
                senderKey: crypto_1.Key.fromPublicKeyBase58('79CXkde3j8TNuMXxPdV7nLUrT2g7JAEjH5TreyVY7GEZ', crypto_1.KeyType.Ed25519),
            });
            const outOfBand = (0, helpers_1.getMockOutOfBand)({ role: OutOfBandRole_1.OutOfBandRole.Receiver, state: OutOfBandState_1.OutOfBandState.AwaitResponse });
            return expect(connectionService.processRequest(inboundMessage, outOfBand)).rejects.toThrowError(`Invalid out-of-band record role ${OutOfBandRole_1.OutOfBandRole.Receiver}, expected is ${OutOfBandRole_1.OutOfBandRole.Sender}.`);
        }));
        const invalidOutOfBandStates = [OutOfBandState_1.OutOfBandState.Initial, OutOfBandState_1.OutOfBandState.PrepareResponse, OutOfBandState_1.OutOfBandState.Done];
        test.each(invalidOutOfBandStates)(`throws an error when out-of-band state is %s and not ${OutOfBandState_1.OutOfBandState.AwaitResponse}`, (state) => {
            expect.assertions(1);
            const inboundMessage = new InboundMessageContext_1.InboundMessageContext(jest.fn()(), { agentContext });
            const outOfBand = (0, helpers_1.getMockOutOfBand)({ role: OutOfBandRole_1.OutOfBandRole.Sender, state });
            return expect(connectionService.processRequest(inboundMessage, outOfBand)).rejects.toThrowError(`Invalid out-of-band record state ${state}, valid states are: ${OutOfBandState_1.OutOfBandState.AwaitResponse}.`);
        });
    });
    describe('createResponse', () => {
        it('returns a connection response message containing the information from the connection record', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(2);
            const key = yield wallet.createKey({ keyType: crypto_1.KeyType.Ed25519 });
            const did = (0, did_1.indyDidFromPublicKeyBase58)(key.publicKeyBase58);
            // Needed for signing connection~sig
            const mockConnection = (0, helpers_1.getMockConnection)({
                state: models_1.DidExchangeState.RequestReceived,
                role: models_1.DidExchangeRole.Responder,
                tags: {
                    threadId: 'test',
                },
            });
            const recipientKeys = [new dids_1.DidKey(key)];
            const outOfBand = (0, helpers_1.getMockOutOfBand)({ recipientKeys: recipientKeys.map((did) => did.did) });
            const publicKey = new models_1.Ed25119Sig2018({
                id: `${did}#1`,
                controller: did,
                publicKeyBase58: key.publicKeyBase58,
            });
            const mockDidDoc = new models_1.DidDoc({
                id: did,
                publicKey: [publicKey],
                authentication: [new models_1.ReferencedAuthentication(publicKey, models_1.authenticationTypes.Ed25519VerificationKey2018)],
                service: [
                    new dids_1.IndyAgentService({
                        id: `${did}#IndyAgentService-1`,
                        serviceEndpoint: 'http://example.com',
                        recipientKeys: recipientKeys.map((did) => did.key.publicKeyBase58),
                        routingKeys: [],
                    }),
                ],
            });
            const { message, connectionRecord: connectionRecord } = yield connectionService.createResponse(agentContext, mockConnection, outOfBand);
            const connection = new models_1.Connection({
                did,
                didDoc: mockDidDoc,
            });
            const plainConnection = JsonTransformer_1.JsonTransformer.toJSON(connection);
            expect(connectionRecord.state).toBe(models_1.DidExchangeState.ResponseSent);
            expect(yield (0, SignatureDecoratorUtils_1.unpackAndVerifySignatureDecorator)(message.connectionSig, wallet)).toEqual(plainConnection);
        }));
        it(`throws an error when connection role is ${models_1.DidExchangeRole.Requester} and not ${models_1.DidExchangeRole.Responder}`, () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const connection = (0, helpers_1.getMockConnection)({
                role: models_1.DidExchangeRole.Requester,
                state: models_1.DidExchangeState.RequestReceived,
            });
            const outOfBand = (0, helpers_1.getMockOutOfBand)();
            return expect(connectionService.createResponse(agentContext, connection, outOfBand)).rejects.toThrowError(`Connection record has invalid role ${models_1.DidExchangeRole.Requester}. Expected role ${models_1.DidExchangeRole.Responder}.`);
        }));
        const invalidOutOfBandStates = [
            models_1.DidExchangeState.InvitationSent,
            models_1.DidExchangeState.InvitationReceived,
            models_1.DidExchangeState.RequestSent,
            models_1.DidExchangeState.ResponseSent,
            models_1.DidExchangeState.ResponseReceived,
            models_1.DidExchangeState.Completed,
            models_1.DidExchangeState.Abandoned,
            models_1.DidExchangeState.Start,
        ];
        test.each(invalidOutOfBandStates)(`throws an error when connection state is %s and not ${models_1.DidExchangeState.RequestReceived}`, (state) => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const connection = (0, helpers_1.getMockConnection)({ state });
            const outOfBand = (0, helpers_1.getMockOutOfBand)();
            return expect(connectionService.createResponse(agentContext, connection, outOfBand)).rejects.toThrowError(`Connection record is in invalid state ${state}. Valid states are: ${models_1.DidExchangeState.RequestReceived}.`);
        }));
    });
    describe('processResponse', () => {
        it('returns a connection record containing the information from the connection response', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(2);
            const key = yield wallet.createKey({ keyType: crypto_1.KeyType.Ed25519 });
            const did = (0, did_1.indyDidFromPublicKeyBase58)(key.publicKeyBase58);
            const theirKey = yield wallet.createKey({ keyType: crypto_1.KeyType.Ed25519 });
            const theirDid = (0, did_1.indyDidFromPublicKeyBase58)(key.publicKeyBase58);
            const connectionRecord = (0, helpers_1.getMockConnection)({
                did,
                state: models_1.DidExchangeState.RequestSent,
                role: models_1.DidExchangeRole.Requester,
            });
            const otherPartyConnection = new models_1.Connection({
                did: theirDid,
                didDoc: new models_1.DidDoc({
                    id: theirDid,
                    publicKey: [],
                    authentication: [
                        new models_1.EmbeddedAuthentication(new models_1.Ed25119Sig2018({
                            id: `${theirDid}#key-id`,
                            controller: theirDid,
                            publicKeyBase58: theirKey.publicKeyBase58,
                        })),
                    ],
                    service: [
                        new DidCommV1Service_1.DidCommV1Service({
                            id: `${did};indy`,
                            serviceEndpoint: 'https://endpoint.com',
                            recipientKeys: [`${theirDid}#key-id`],
                        }),
                    ],
                }),
            });
            const plainConnection = JsonTransformer_1.JsonTransformer.toJSON(otherPartyConnection);
            const connectionSig = yield (0, SignatureDecoratorUtils_1.signData)(plainConnection, wallet, theirKey.publicKeyBase58);
            const connectionResponse = new messages_1.ConnectionResponseMessage({
                threadId: (0, uuid_1.uuid)(),
                connectionSig,
            });
            const outOfBandRecord = (0, helpers_1.getMockOutOfBand)({
                recipientKeys: [new dids_1.DidKey(theirKey).did],
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(connectionResponse, {
                agentContext,
                connection: connectionRecord,
                senderKey: theirKey,
                recipientKey: key,
            });
            const processedConnection = yield connectionService.processResponse(messageContext, outOfBandRecord);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const peerDid = (0, peerDidNumAlgo1_1.didDocumentJsonToNumAlgo1Did)((0, helpers_2.convertToNewDidDocument)(otherPartyConnection.didDoc).toJSON());
            expect(processedConnection.state).toBe(models_1.DidExchangeState.ResponseReceived);
            expect(processedConnection.theirDid).toBe(peerDid);
        }));
        it(`throws an error when connection role is ${models_1.DidExchangeRole.Responder} and not ${models_1.DidExchangeRole.Requester}`, () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const outOfBandRecord = (0, helpers_1.getMockOutOfBand)();
            const connectionRecord = (0, helpers_1.getMockConnection)({
                role: models_1.DidExchangeRole.Responder,
                state: models_1.DidExchangeState.RequestSent,
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(jest.fn()(), {
                agentContext,
                connection: connectionRecord,
                recipientKey: crypto_1.Key.fromPublicKeyBase58('8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K', crypto_1.KeyType.Ed25519),
                senderKey: crypto_1.Key.fromPublicKeyBase58('79CXkde3j8TNuMXxPdV7nLUrT2g7JAEjH5TreyVY7GEZ', crypto_1.KeyType.Ed25519),
            });
            return expect(connectionService.processResponse(messageContext, outOfBandRecord)).rejects.toThrowError(`Connection record has invalid role ${models_1.DidExchangeRole.Responder}. Expected role ${models_1.DidExchangeRole.Requester}.`);
        }));
        it('throws an error when the connection sig is not signed with the same key as the recipient key from the invitation', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const key = yield wallet.createKey({ keyType: crypto_1.KeyType.Ed25519 });
            const did = (0, did_1.indyDidFromPublicKeyBase58)(key.publicKeyBase58);
            const theirKey = yield wallet.createKey({ keyType: crypto_1.KeyType.Ed25519 });
            const theirDid = (0, did_1.indyDidFromPublicKeyBase58)(key.publicKeyBase58);
            const connectionRecord = (0, helpers_1.getMockConnection)({
                did,
                role: models_1.DidExchangeRole.Requester,
                state: models_1.DidExchangeState.RequestSent,
            });
            const otherPartyConnection = new models_1.Connection({
                did: theirDid,
                didDoc: new models_1.DidDoc({
                    id: theirDid,
                    publicKey: [],
                    authentication: [
                        new models_1.EmbeddedAuthentication(new models_1.Ed25119Sig2018({
                            id: `${theirDid}#key-id`,
                            controller: theirDid,
                            publicKeyBase58: theirKey.publicKeyBase58,
                        })),
                    ],
                    service: [
                        new DidCommV1Service_1.DidCommV1Service({
                            id: `${did};indy`,
                            serviceEndpoint: 'https://endpoint.com',
                            recipientKeys: [`${theirDid}#key-id`],
                        }),
                    ],
                }),
            });
            const plainConnection = JsonTransformer_1.JsonTransformer.toJSON(otherPartyConnection);
            const connectionSig = yield (0, SignatureDecoratorUtils_1.signData)(plainConnection, wallet, theirKey.publicKeyBase58);
            const connectionResponse = new messages_1.ConnectionResponseMessage({
                threadId: (0, uuid_1.uuid)(),
                connectionSig,
            });
            // Recipient key `verkey` is not the same as theirVerkey which was used to sign message,
            // therefore it should cause a failure.
            const outOfBandRecord = (0, helpers_1.getMockOutOfBand)({
                recipientKeys: [new dids_1.DidKey(key).did],
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(connectionResponse, {
                agentContext,
                connection: connectionRecord,
                senderKey: theirKey,
                recipientKey: key,
            });
            return expect(connectionService.processResponse(messageContext, outOfBandRecord)).rejects.toThrowError(new RegExp('Connection object in connection response message is not signed with same key as recipient key in invitation'));
        }));
        it('throws an error when the message does not contain a DID Document', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const key = yield wallet.createKey({ keyType: crypto_1.KeyType.Ed25519 });
            const did = (0, did_1.indyDidFromPublicKeyBase58)(key.publicKeyBase58);
            const theirKey = yield wallet.createKey({ keyType: crypto_1.KeyType.Ed25519 });
            const theirDid = (0, did_1.indyDidFromPublicKeyBase58)(key.publicKeyBase58);
            const connectionRecord = (0, helpers_1.getMockConnection)({
                did,
                state: models_1.DidExchangeState.RequestSent,
                theirDid: undefined,
            });
            const otherPartyConnection = new models_1.Connection({ did: theirDid });
            const plainConnection = JsonTransformer_1.JsonTransformer.toJSON(otherPartyConnection);
            const connectionSig = yield (0, SignatureDecoratorUtils_1.signData)(plainConnection, wallet, theirKey.publicKeyBase58);
            const connectionResponse = new messages_1.ConnectionResponseMessage({ threadId: (0, uuid_1.uuid)(), connectionSig });
            const outOfBandRecord = (0, helpers_1.getMockOutOfBand)({ recipientKeys: [new dids_1.DidKey(theirKey).did] });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(connectionResponse, {
                agentContext,
                connection: connectionRecord,
                recipientKey: crypto_1.Key.fromPublicKeyBase58('8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K', crypto_1.KeyType.Ed25519),
                senderKey: crypto_1.Key.fromPublicKeyBase58('79CXkde3j8TNuMXxPdV7nLUrT2g7JAEjH5TreyVY7GEZ', crypto_1.KeyType.Ed25519),
            });
            return expect(connectionService.processResponse(messageContext, outOfBandRecord)).rejects.toThrowError(`DID Document is missing.`);
        }));
    });
    describe('createTrustPing', () => {
        it('returns a trust ping message', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(2);
            const mockConnection = (0, helpers_1.getMockConnection)({ state: models_1.DidExchangeState.ResponseReceived });
            const { message, connectionRecord: connectionRecord } = yield connectionService.createTrustPing(agentContext, mockConnection);
            expect(connectionRecord.state).toBe(models_1.DidExchangeState.Completed);
            expect(message).toEqual(expect.any(messages_1.TrustPingMessage));
        }));
        const invalidConnectionStates = [
            models_1.DidExchangeState.InvitationSent,
            models_1.DidExchangeState.InvitationReceived,
            models_1.DidExchangeState.RequestSent,
            models_1.DidExchangeState.RequestReceived,
            models_1.DidExchangeState.ResponseSent,
            models_1.DidExchangeState.Abandoned,
            models_1.DidExchangeState.Start,
        ];
        test.each(invalidConnectionStates)(`throws an error when connection state is %s and not ${models_1.DidExchangeState.ResponseReceived} or ${models_1.DidExchangeState.Completed}`, (state) => {
            expect.assertions(1);
            const connection = (0, helpers_1.getMockConnection)({ state });
            return expect(connectionService.createTrustPing(agentContext, connection)).rejects.toThrowError(`Connection record is in invalid state ${state}. Valid states are: ${models_1.DidExchangeState.ResponseReceived}, ${models_1.DidExchangeState.Completed}.`);
        });
    });
    describe('processAck', () => {
        it('throws an error when the message context does not have a connection', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const ack = new common_1.AckMessage({
                status: common_1.AckStatus.OK,
                threadId: 'thread-id',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(ack, { agentContext });
            return expect(connectionService.processAck(messageContext)).rejects.toThrowError('Unable to process connection ack: connection for recipient key undefined not found');
        }));
        it('updates the state to Completed when the state is ResponseSent and role is Responder', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const connection = (0, helpers_1.getMockConnection)({
                state: models_1.DidExchangeState.ResponseSent,
                role: models_1.DidExchangeRole.Responder,
            });
            const ack = new common_1.AckMessage({
                status: common_1.AckStatus.OK,
                threadId: 'thread-id',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(ack, { agentContext, connection });
            const updatedConnection = yield connectionService.processAck(messageContext);
            expect(updatedConnection.state).toBe(models_1.DidExchangeState.Completed);
        }));
        it('does not update the state when the state is not ResponseSent or the role is not Responder', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const connection = (0, helpers_1.getMockConnection)({
                state: models_1.DidExchangeState.ResponseReceived,
                role: models_1.DidExchangeRole.Requester,
            });
            const ack = new common_1.AckMessage({
                status: common_1.AckStatus.OK,
                threadId: 'thread-id',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(ack, { agentContext, connection });
            const updatedConnection = yield connectionService.processAck(messageContext);
            expect(updatedConnection.state).toBe(models_1.DidExchangeState.ResponseReceived);
        }));
    });
    describe('assertConnectionOrOutOfBandExchange', () => {
        it('should not throw an error when a connection record with state complete is present in the messageContext', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const messageContext = new InboundMessageContext_1.InboundMessageContext(new AgentMessage_1.AgentMessage(), {
                agentContext,
                connection: (0, helpers_1.getMockConnection)({ state: models_1.DidExchangeState.Completed }),
            });
            yield expect(connectionService.assertConnectionOrOutOfBandExchange(messageContext)).resolves.not.toThrow();
        }));
        it('should throw an error when a connection record is present and state not complete in the messageContext', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const messageContext = new InboundMessageContext_1.InboundMessageContext(new AgentMessage_1.AgentMessage(), {
                agentContext,
                connection: (0, helpers_1.getMockConnection)({ state: models_1.DidExchangeState.InvitationReceived }),
            });
            yield expect(connectionService.assertConnectionOrOutOfBandExchange(messageContext)).rejects.toThrowError('Connection record is not ready to be used');
        }));
        it('should not throw an error when no connection record is present in the messageContext and no additional data, but the message has a ~service decorator', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            (0, helpers_1.mockFunction)(outOfBandRepository.findSingleByQuery).mockResolvedValue(null);
            const message = new AgentMessage_1.AgentMessage();
            message.setService({
                recipientKeys: [],
                serviceEndpoint: '',
                routingKeys: [],
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(message, { agentContext });
            yield expect(connectionService.assertConnectionOrOutOfBandExchange(messageContext)).resolves.not.toThrow();
        }));
        it('should not throw when a fully valid connection-less input is passed', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const recipientKey = crypto_1.Key.fromPublicKeyBase58('8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K', crypto_1.KeyType.Ed25519);
            const senderKey = crypto_1.Key.fromPublicKeyBase58('79CXkde3j8TNuMXxPdV7nLUrT2g7JAEjH5TreyVY7GEZ', crypto_1.KeyType.Ed25519);
            const lastSentMessage = new AgentMessage_1.AgentMessage();
            lastSentMessage.setService({
                recipientKeys: [recipientKey.publicKeyBase58],
                serviceEndpoint: '',
                routingKeys: [],
            });
            const lastReceivedMessage = new AgentMessage_1.AgentMessage();
            lastReceivedMessage.setService({
                recipientKeys: [senderKey.publicKeyBase58],
                serviceEndpoint: '',
                routingKeys: [],
            });
            const message = new AgentMessage_1.AgentMessage();
            message.setService({
                recipientKeys: [senderKey.publicKeyBase58],
                serviceEndpoint: '',
                routingKeys: [],
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(message, { agentContext, recipientKey, senderKey });
            yield expect(connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
                lastReceivedMessage,
                lastSentMessage,
            })).resolves.not.toThrow();
        }));
        it('should throw an error when lastSentMessage is present, but recipientVerkey is not ', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const lastSentMessage = new AgentMessage_1.AgentMessage();
            lastSentMessage.setService({
                recipientKeys: [],
                serviceEndpoint: '',
                routingKeys: [],
            });
            const message = new AgentMessage_1.AgentMessage();
            message.setService({
                recipientKeys: [],
                serviceEndpoint: '',
                routingKeys: [],
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(message, { agentContext });
            yield expect(connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
                lastSentMessage,
            })).rejects.toThrowError('Incoming message must have recipientKey and senderKey (so cannot be AuthCrypt or unpacked) if there are lastSentMessage or lastReceivedMessage.');
        }));
        it('should throw an error when lastSentMessage and recipientKey are present, but recipient key is not present in recipientKeys of previously sent message ~service decorator', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const recipientKey = crypto_1.Key.fromPublicKeyBase58('8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K', crypto_1.KeyType.Ed25519);
            const senderKey = crypto_1.Key.fromPublicKeyBase58('8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K', crypto_1.KeyType.Ed25519);
            const lastSentMessage = new AgentMessage_1.AgentMessage();
            lastSentMessage.setService({
                recipientKeys: ['anotherKey'],
                serviceEndpoint: '',
                routingKeys: [],
            });
            const message = new AgentMessage_1.AgentMessage();
            message.setService({
                recipientKeys: [],
                serviceEndpoint: '',
                routingKeys: [],
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(message, { agentContext, recipientKey, senderKey });
            yield expect(connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
                lastSentMessage,
            })).rejects.toThrowError('Recipient key 8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K not found in our service');
        }));
        it('should throw an error when lastReceivedMessage is present, but senderVerkey is not ', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const lastReceivedMessage = new AgentMessage_1.AgentMessage();
            lastReceivedMessage.setService({
                recipientKeys: [],
                serviceEndpoint: '',
                routingKeys: [],
            });
            const message = new AgentMessage_1.AgentMessage();
            const messageContext = new InboundMessageContext_1.InboundMessageContext(message, { agentContext });
            yield expect(connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
                lastReceivedMessage,
            })).rejects.toThrowError('No keys on our side to use for encrypting messages, and previous messages found (in which case our keys MUST also be present).');
        }));
        it('should throw an error when lastReceivedMessage and senderKey are present, but sender key is not present in recipientKeys of previously received message ~service decorator', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const senderKey = 'senderKey';
            const lastReceivedMessage = new AgentMessage_1.AgentMessage();
            lastReceivedMessage.setService({
                recipientKeys: ['anotherKey'],
                serviceEndpoint: '',
                routingKeys: [],
            });
            const lastSentMessage = new AgentMessage_1.AgentMessage();
            lastSentMessage.setService({
                recipientKeys: [senderKey],
                serviceEndpoint: '',
                routingKeys: [],
            });
            const message = new AgentMessage_1.AgentMessage();
            const messageContext = new InboundMessageContext_1.InboundMessageContext(message, {
                agentContext,
                senderKey: crypto_1.Key.fromPublicKeyBase58('randomKey', crypto_1.KeyType.Ed25519),
                recipientKey: crypto_1.Key.fromPublicKeyBase58(senderKey, crypto_1.KeyType.Ed25519),
            });
            yield expect(connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
                lastReceivedMessage,
                lastSentMessage,
            })).rejects.toThrowError('Sender key randomKey not found in their service');
        }));
    });
    describe('repository methods', () => {
        it('getById should return value from connectionRepository.getById', () => __awaiter(void 0, void 0, void 0, function* () {
            const expected = (0, helpers_1.getMockConnection)();
            (0, helpers_1.mockFunction)(connectionRepository.getById).mockReturnValue(Promise.resolve(expected));
            const result = yield connectionService.getById(agentContext, expected.id);
            expect(connectionRepository.getById).toBeCalledWith(agentContext, expected.id);
            expect(result).toBe(expected);
        }));
        it('getByThreadId should return value from connectionRepository.getSingleByQuery', () => __awaiter(void 0, void 0, void 0, function* () {
            const expected = (0, helpers_1.getMockConnection)();
            (0, helpers_1.mockFunction)(connectionRepository.getByThreadId).mockReturnValue(Promise.resolve(expected));
            const result = yield connectionService.getByThreadId(agentContext, 'threadId');
            expect(connectionRepository.getByThreadId).toBeCalledWith(agentContext, 'threadId');
            expect(result).toBe(expected);
        }));
        it('findById should return value from connectionRepository.findById', () => __awaiter(void 0, void 0, void 0, function* () {
            const expected = (0, helpers_1.getMockConnection)();
            (0, helpers_1.mockFunction)(connectionRepository.findById).mockReturnValue(Promise.resolve(expected));
            const result = yield connectionService.findById(agentContext, expected.id);
            expect(connectionRepository.findById).toBeCalledWith(agentContext, expected.id);
            expect(result).toBe(expected);
        }));
        it('getAll should return value from connectionRepository.getAll', () => __awaiter(void 0, void 0, void 0, function* () {
            const expected = [(0, helpers_1.getMockConnection)(), (0, helpers_1.getMockConnection)()];
            (0, helpers_1.mockFunction)(connectionRepository.getAll).mockReturnValue(Promise.resolve(expected));
            const result = yield connectionService.getAll(agentContext);
            expect(connectionRepository.getAll).toBeCalledWith(agentContext);
            expect(result).toEqual(expect.arrayContaining(expected));
        }));
        it('findAllByQuery should return value from connectionRepository.findByQuery', () => __awaiter(void 0, void 0, void 0, function* () {
            const expected = [(0, helpers_1.getMockConnection)(), (0, helpers_1.getMockConnection)()];
            (0, helpers_1.mockFunction)(connectionRepository.findByQuery).mockReturnValue(Promise.resolve(expected));
            const result = yield connectionService.findAllByQuery(agentContext, {
                state: models_1.DidExchangeState.InvitationReceived,
            });
            expect(connectionRepository.findByQuery).toBeCalledWith(agentContext, {
                state: models_1.DidExchangeState.InvitationReceived,
            });
            expect(result).toEqual(expect.arrayContaining(expected));
        }));
    });
    describe('connectionType', () => {
        it('addConnectionType', () => __awaiter(void 0, void 0, void 0, function* () {
            const connection = (0, helpers_1.getMockConnection)();
            yield connectionService.addConnectionType(agentContext, connection, 'type-1');
            let connectionTypes = yield connectionService.getConnectionTypes(connection);
            expect(connectionTypes).toMatchObject(['type-1']);
            yield connectionService.addConnectionType(agentContext, connection, 'type-2');
            yield connectionService.addConnectionType(agentContext, connection, 'type-3');
            connectionTypes = yield connectionService.getConnectionTypes(connection);
            expect(connectionTypes.sort()).toMatchObject(['type-1', 'type-2', 'type-3'].sort());
        }));
        it('removeConnectionType - existing type', () => __awaiter(void 0, void 0, void 0, function* () {
            const connection = (0, helpers_1.getMockConnection)();
            connection.connectionTypes = ['type-1', 'type-2', 'type-3'];
            let connectionTypes = yield connectionService.getConnectionTypes(connection);
            expect(connectionTypes.sort()).toMatchObject(['type-1', 'type-2', 'type-3'].sort());
            yield connectionService.removeConnectionType(agentContext, connection, 'type-2');
            connectionTypes = yield connectionService.getConnectionTypes(connection);
            expect(connectionTypes.sort()).toMatchObject(['type-1', 'type-3'].sort());
        }));
        it('removeConnectionType - type not existent', () => __awaiter(void 0, void 0, void 0, function* () {
            const connection = (0, helpers_1.getMockConnection)();
            connection.connectionTypes = ['type-1', 'type-2', 'type-3'];
            let connectionTypes = yield connectionService.getConnectionTypes(connection);
            expect(connectionTypes).toMatchObject(['type-1', 'type-2', 'type-3']);
            yield connectionService.removeConnectionType(agentContext, connection, 'type-4');
            connectionTypes = yield connectionService.getConnectionTypes(connection);
            expect(connectionTypes.sort()).toMatchObject(['type-1', 'type-2', 'type-3'].sort());
        }));
        it('removeConnectionType - no previous types', () => __awaiter(void 0, void 0, void 0, function* () {
            const connection = (0, helpers_1.getMockConnection)();
            let connectionTypes = yield connectionService.getConnectionTypes(connection);
            expect(connectionTypes).toMatchObject([]);
            yield connectionService.removeConnectionType(agentContext, connection, 'type-4');
            connectionTypes = yield connectionService.getConnectionTypes(connection);
            expect(connectionTypes).toMatchObject([]);
        }));
    });
});
