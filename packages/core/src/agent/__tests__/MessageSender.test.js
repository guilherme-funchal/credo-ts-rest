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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const TestMessage_1 = require("../../../tests/TestMessage");
const helpers_1 = require("../../../tests/helpers");
const logger_1 = __importDefault(require("../../../tests/logger"));
const crypto_1 = require("../../crypto");
const TransportDecorator_1 = require("../../decorators/transport/TransportDecorator");
const didcomm_1 = require("../../modules/didcomm");
const dids_1 = require("../../modules/dids");
const DidCommV1Service_1 = require("../../modules/dids/domain/service/DidCommV1Service");
const helpers_2 = require("../../modules/dids/helpers");
const InMemoryMessageRepository_1 = require("../../storage/InMemoryMessageRepository");
const EnvelopeService_1 = require("../EnvelopeService");
const EventEmitter_1 = require("../EventEmitter");
const Events_1 = require("../Events");
const MessageSender_1 = require("../MessageSender");
const TransportService_1 = require("../TransportService");
const models_1 = require("../models");
const stubs_1 = require("./stubs");
jest.mock('../TransportService');
jest.mock('../EnvelopeService');
jest.mock('../../modules/dids/services/DidResolverService');
jest.mock('../../modules/didcomm/services/DidCommDocumentService');
const logger = logger_1.default;
const TransportServiceMock = TransportService_1.TransportService;
const DidResolverServiceMock = dids_1.DidResolverService;
const DidCommDocumentServiceMock = didcomm_1.DidCommDocumentService;
class DummyHttpOutboundTransport {
    constructor() {
        this.supportedSchemes = ['https'];
    }
    start() {
        throw new Error('Method not implemented.');
    }
    stop() {
        throw new Error('Method not implemented.');
    }
    sendMessage() {
        return Promise.resolve();
    }
}
class DummyWsOutboundTransport {
    constructor() {
        this.supportedSchemes = ['wss'];
    }
    start() {
        throw new Error('Method not implemented.');
    }
    stop() {
        throw new Error('Method not implemented.');
    }
    sendMessage() {
        return Promise.resolve();
    }
}
describe('MessageSender', () => {
    const EnvelopeService = EnvelopeService_1.EnvelopeService;
    const encryptedMessage = {
        protected: 'base64url',
        iv: 'base64url',
        ciphertext: 'base64url',
        tag: 'base64url',
    };
    const enveloperService = new EnvelopeService();
    const envelopeServicePackMessageMock = (0, helpers_1.mockFunction)(enveloperService.packMessage);
    const didResolverService = new DidResolverServiceMock();
    const didCommDocumentService = new DidCommDocumentServiceMock();
    const eventEmitter = new EventEmitter_1.EventEmitter(helpers_1.agentDependencies, new rxjs_1.Subject());
    const didResolverServiceResolveMock = (0, helpers_1.mockFunction)(didResolverService.resolveDidDocument);
    const didResolverServiceResolveDidServicesMock = (0, helpers_1.mockFunction)(didCommDocumentService.resolveServicesFromDid);
    const inboundMessage = new TestMessage_1.TestMessage();
    inboundMessage.setReturnRouting(TransportDecorator_1.ReturnRouteTypes.all);
    const recipientKey = crypto_1.Key.fromPublicKeyBase58('8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K', crypto_1.KeyType.Ed25519);
    const senderKey = crypto_1.Key.fromPublicKeyBase58('79CXkde3j8TNuMXxPdV7nLUrT2g7JAEjH5TreyVY7GEZ', crypto_1.KeyType.Ed25519);
    const session = new stubs_1.DummyTransportSession('session-123');
    session.keys = {
        recipientKeys: [recipientKey],
        routingKeys: [],
        senderKey: senderKey,
    };
    session.inboundMessage = inboundMessage;
    session.send = jest.fn();
    const sessionWithoutKeys = new stubs_1.DummyTransportSession('sessionWithoutKeys-123');
    sessionWithoutKeys.inboundMessage = inboundMessage;
    sessionWithoutKeys.send = jest.fn();
    const transportService = new TransportService_1.TransportService();
    const transportServiceFindSessionMock = (0, helpers_1.mockFunction)(transportService.findSessionByConnectionId);
    const transportServiceFindSessionByIdMock = (0, helpers_1.mockFunction)(transportService.findSessionById);
    const transportServiceHasInboundEndpoint = (0, helpers_1.mockFunction)(transportService.hasInboundEndpoint);
    const firstDidCommService = new DidCommV1Service_1.DidCommV1Service({
        id: `<did>;indy`,
        serviceEndpoint: 'https://www.first-endpoint.com',
        recipientKeys: ['#authentication-1'],
    });
    const secondDidCommService = new DidCommV1Service_1.DidCommV1Service({
        id: `<did>;indy`,
        serviceEndpoint: 'https://www.second-endpoint.com',
        recipientKeys: ['#authentication-1'],
    });
    let messageSender;
    let outboundTransport;
    let messageRepository;
    let connection;
    let outboundMessageContext;
    const agentConfig = (0, helpers_1.getAgentConfig)('MessageSender');
    const agentContext = (0, helpers_1.getAgentContext)();
    const eventListenerMock = jest.fn();
    describe('sendMessage', () => {
        beforeEach(() => {
            TransportServiceMock.mockClear();
            DidResolverServiceMock.mockClear();
            eventEmitter.on(Events_1.AgentEventTypes.AgentMessageSent, eventListenerMock);
            outboundTransport = new DummyHttpOutboundTransport();
            messageRepository = new InMemoryMessageRepository_1.InMemoryMessageRepository(agentConfig.logger);
            messageSender = new MessageSender_1.MessageSender(enveloperService, transportService, messageRepository, logger, didResolverService, didCommDocumentService, eventEmitter);
            connection = (0, helpers_1.getMockConnection)({
                id: 'test-123',
                did: 'did:peer:1mydid',
                theirDid: 'did:peer:1theirdid',
                theirLabel: 'Test 123',
            });
            outboundMessageContext = new models_1.OutboundMessageContext(new TestMessage_1.TestMessage(), { agentContext, connection });
            envelopeServicePackMessageMock.mockReturnValue(Promise.resolve(encryptedMessage));
            transportServiceHasInboundEndpoint.mockReturnValue(true);
            const didDocumentInstance = getMockDidDocument({
                service: [firstDidCommService, secondDidCommService],
            });
            didResolverServiceResolveMock.mockResolvedValue(didDocumentInstance);
            didResolverServiceResolveDidServicesMock.mockResolvedValue([
                getMockResolvedDidService(firstDidCommService),
                getMockResolvedDidService(secondDidCommService),
            ]);
        });
        afterEach(() => {
            eventEmitter.off(Events_1.AgentEventTypes.AgentMessageSent, eventListenerMock);
            jest.resetAllMocks();
        });
        test('throw error when there is no outbound transport', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(messageSender.sendMessage(outboundMessageContext)).rejects.toThrow(/Message is undeliverable to connection/);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: Events_1.AgentEventTypes.AgentMessageSent,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    message: outboundMessageContext,
                    status: models_1.OutboundMessageSendStatus.Undeliverable,
                },
            });
        }));
        test('throw error when there is no service or queue', () => __awaiter(void 0, void 0, void 0, function* () {
            messageSender.registerOutboundTransport(outboundTransport);
            didResolverServiceResolveMock.mockResolvedValue(getMockDidDocument({ service: [] }));
            didResolverServiceResolveDidServicesMock.mockResolvedValue([]);
            yield expect(messageSender.sendMessage(outboundMessageContext)).rejects.toThrow(`Message is undeliverable to connection test-123 (Test 123)`);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: Events_1.AgentEventTypes.AgentMessageSent,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    message: outboundMessageContext,
                    status: models_1.OutboundMessageSendStatus.Undeliverable,
                },
            });
        }));
        test('call send message when session send method fails', () => __awaiter(void 0, void 0, void 0, function* () {
            messageSender.registerOutboundTransport(outboundTransport);
            transportServiceFindSessionMock.mockReturnValue(session);
            session.send = jest.fn().mockRejectedValue(new Error('some error'));
            messageSender.registerOutboundTransport(outboundTransport);
            const sendMessageSpy = jest.spyOn(outboundTransport, 'sendMessage');
            yield messageSender.sendMessage(outboundMessageContext);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: Events_1.AgentEventTypes.AgentMessageSent,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    message: outboundMessageContext,
                    status: models_1.OutboundMessageSendStatus.SentToTransport,
                },
            });
            expect(sendMessageSpy).toHaveBeenCalledWith({
                connectionId: 'test-123',
                payload: encryptedMessage,
                endpoint: firstDidCommService.serviceEndpoint,
                responseRequested: false,
            });
            expect(sendMessageSpy).toHaveBeenCalledTimes(1);
        }));
        test("resolves the did service using the did resolver if connection.theirDid starts with 'did:'", () => __awaiter(void 0, void 0, void 0, function* () {
            messageSender.registerOutboundTransport(outboundTransport);
            const sendMessageSpy = jest.spyOn(outboundTransport, 'sendMessage');
            yield messageSender.sendMessage(outboundMessageContext);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: Events_1.AgentEventTypes.AgentMessageSent,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    message: outboundMessageContext,
                    status: models_1.OutboundMessageSendStatus.SentToTransport,
                },
            });
            expect(didResolverServiceResolveDidServicesMock).toHaveBeenCalledWith(agentContext, connection.theirDid);
            expect(sendMessageSpy).toHaveBeenCalledWith({
                connectionId: 'test-123',
                payload: encryptedMessage,
                endpoint: firstDidCommService.serviceEndpoint,
                responseRequested: false,
            });
            expect(sendMessageSpy).toHaveBeenCalledTimes(1);
        }));
        test("throws an error if connection.theirDid starts with 'did:' but the resolver can't resolve the did document", () => __awaiter(void 0, void 0, void 0, function* () {
            messageSender.registerOutboundTransport(outboundTransport);
            didResolverServiceResolveMock.mockRejectedValue(new Error(`Unable to resolve did document for did '${connection.theirDid}': notFound`));
            yield expect(messageSender.sendMessage(outboundMessageContext)).rejects.toThrowError(`Unable to resolve DID Document for '${connection.did}`);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: Events_1.AgentEventTypes.AgentMessageSent,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    message: outboundMessageContext,
                    status: models_1.OutboundMessageSendStatus.Undeliverable,
                },
            });
        }));
        test('call send message when session send method fails with missing keys', () => __awaiter(void 0, void 0, void 0, function* () {
            messageSender.registerOutboundTransport(outboundTransport);
            transportServiceFindSessionMock.mockReturnValue(sessionWithoutKeys);
            messageSender.registerOutboundTransport(outboundTransport);
            const sendMessageSpy = jest.spyOn(outboundTransport, 'sendMessage');
            yield messageSender.sendMessage(outboundMessageContext);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: Events_1.AgentEventTypes.AgentMessageSent,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    message: outboundMessageContext,
                    status: models_1.OutboundMessageSendStatus.SentToTransport,
                },
            });
            expect(sendMessageSpy).toHaveBeenCalledWith({
                connectionId: 'test-123',
                payload: encryptedMessage,
                endpoint: firstDidCommService.serviceEndpoint,
                responseRequested: false,
            });
            expect(sendMessageSpy).toHaveBeenCalledTimes(1);
        }));
        test('call send message on session when outbound message has sessionId attached', () => __awaiter(void 0, void 0, void 0, function* () {
            transportServiceFindSessionByIdMock.mockReturnValue(session);
            messageSender.registerOutboundTransport(outboundTransport);
            const sendMessageSpy = jest.spyOn(outboundTransport, 'sendMessage');
            const sendMessageToServiceSpy = jest.spyOn(messageSender, 'sendMessageToService');
            const contextWithSessionId = new models_1.OutboundMessageContext(outboundMessageContext.message, {
                agentContext: outboundMessageContext.agentContext,
                connection: outboundMessageContext.connection,
                sessionId: 'session-123',
            });
            yield messageSender.sendMessage(contextWithSessionId);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: Events_1.AgentEventTypes.AgentMessageSent,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    message: contextWithSessionId,
                    status: models_1.OutboundMessageSendStatus.SentToSession,
                },
            });
            expect(session.send).toHaveBeenCalledTimes(1);
            expect(session.send).toHaveBeenNthCalledWith(1, agentContext, encryptedMessage);
            expect(sendMessageSpy).toHaveBeenCalledTimes(0);
            expect(sendMessageToServiceSpy).toHaveBeenCalledTimes(0);
            expect(transportServiceFindSessionByIdMock).toHaveBeenCalledWith('session-123');
        }));
        test('call send message on session when there is a session for a given connection', () => __awaiter(void 0, void 0, void 0, function* () {
            messageSender.registerOutboundTransport(outboundTransport);
            const sendMessageSpy = jest.spyOn(outboundTransport, 'sendMessage');
            //@ts-ignore
            const sendToServiceSpy = jest.spyOn(messageSender, 'sendToService');
            yield messageSender.sendMessage(outboundMessageContext);
            //@ts-ignore
            const [[sendMessage]] = sendToServiceSpy.mock.calls;
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: Events_1.AgentEventTypes.AgentMessageSent,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    message: outboundMessageContext,
                    status: models_1.OutboundMessageSendStatus.SentToTransport,
                },
            });
            expect(sendMessage).toMatchObject({
                connection: {
                    id: 'test-123',
                },
                message: outboundMessageContext.message,
                serviceParams: {
                    returnRoute: false,
                    service: {
                        serviceEndpoint: firstDidCommService.serviceEndpoint,
                    },
                },
            });
            //@ts-ignore
            expect(sendMessage.serviceParams.senderKey.publicKeyBase58).toEqual('EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d');
            //@ts-ignore
            expect(sendMessage.serviceParams.service.recipientKeys.map((key) => key.publicKeyBase58)).toEqual([
                'EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d',
            ]);
            expect(sendToServiceSpy).toHaveBeenCalledTimes(1);
            expect(sendMessageSpy).toHaveBeenCalledTimes(1);
        }));
        test('calls sendToService with payload and endpoint from second DidComm service when the first fails', () => __awaiter(void 0, void 0, void 0, function* () {
            messageSender.registerOutboundTransport(outboundTransport);
            const sendMessageSpy = jest.spyOn(outboundTransport, 'sendMessage');
            //@ts-ignore
            const sendToServiceSpy = jest.spyOn(messageSender, 'sendToService');
            // Simulate the case when the first call fails
            sendMessageSpy.mockRejectedValueOnce(new Error());
            yield messageSender.sendMessage(outboundMessageContext);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: Events_1.AgentEventTypes.AgentMessageSent,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    message: outboundMessageContext,
                    status: models_1.OutboundMessageSendStatus.SentToTransport,
                },
            });
            //@ts-ignore
            const [, [sendMessage]] = sendToServiceSpy.mock.calls;
            expect(sendMessage).toMatchObject({
                agentContext,
                connection: {
                    id: 'test-123',
                },
                message: outboundMessageContext.message,
                serviceParams: {
                    returnRoute: false,
                    service: {
                        serviceEndpoint: secondDidCommService.serviceEndpoint,
                    },
                },
            });
            //@ts-ignore
            expect(sendMessage.serviceParams.senderKey.publicKeyBase58).toEqual('EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d');
            //@ts-ignore
            expect(sendMessage.serviceParams.service.recipientKeys.map((key) => key.publicKeyBase58)).toEqual([
                'EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d',
            ]);
            expect(sendToServiceSpy).toHaveBeenCalledTimes(2);
            expect(sendMessageSpy).toHaveBeenCalledTimes(2);
        }));
        test('throw error when message endpoint is not supported by outbound transport schemes', () => __awaiter(void 0, void 0, void 0, function* () {
            messageSender.registerOutboundTransport(new DummyWsOutboundTransport());
            yield expect(messageSender.sendMessage(outboundMessageContext)).rejects.toThrow(/Message is undeliverable to connection/);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: Events_1.AgentEventTypes.AgentMessageSent,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    message: outboundMessageContext,
                    status: models_1.OutboundMessageSendStatus.Undeliverable,
                },
            });
        }));
    });
    describe('sendMessageToService', () => {
        const service = {
            id: 'out-of-band',
            recipientKeys: [crypto_1.Key.fromFingerprint('z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL')],
            routingKeys: [],
            serviceEndpoint: 'https://example.com',
        };
        const senderKey = crypto_1.Key.fromFingerprint('z6MkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th');
        beforeEach(() => {
            outboundTransport = new DummyHttpOutboundTransport();
            messageSender = new MessageSender_1.MessageSender(enveloperService, transportService, new InMemoryMessageRepository_1.InMemoryMessageRepository(agentConfig.logger), logger, didResolverService, didCommDocumentService, eventEmitter);
            eventEmitter.on(Events_1.AgentEventTypes.AgentMessageSent, eventListenerMock);
            envelopeServicePackMessageMock.mockReturnValue(Promise.resolve(encryptedMessage));
        });
        afterEach(() => {
            jest.resetAllMocks();
            eventEmitter.off(Events_1.AgentEventTypes.AgentMessageSent, eventListenerMock);
        });
        test('throws error when there is no outbound transport', () => __awaiter(void 0, void 0, void 0, function* () {
            outboundMessageContext = new models_1.OutboundMessageContext(new TestMessage_1.TestMessage(), {
                agentContext,
                serviceParams: {
                    senderKey,
                    service,
                },
            });
            yield expect(messageSender.sendMessageToService(outboundMessageContext)).rejects.toThrow(`Agent has no outbound transport!`);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: Events_1.AgentEventTypes.AgentMessageSent,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    message: outboundMessageContext,
                    status: models_1.OutboundMessageSendStatus.Undeliverable,
                },
            });
        }));
        test('calls send message with payload and endpoint from DIDComm service', () => __awaiter(void 0, void 0, void 0, function* () {
            messageSender.registerOutboundTransport(outboundTransport);
            const sendMessageSpy = jest.spyOn(outboundTransport, 'sendMessage');
            outboundMessageContext = new models_1.OutboundMessageContext(new TestMessage_1.TestMessage(), {
                agentContext,
                serviceParams: {
                    senderKey,
                    service,
                },
            });
            yield messageSender.sendMessageToService(outboundMessageContext);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: Events_1.AgentEventTypes.AgentMessageSent,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    message: outboundMessageContext,
                    status: models_1.OutboundMessageSendStatus.SentToTransport,
                },
            });
            expect(sendMessageSpy).toHaveBeenCalledWith({
                payload: encryptedMessage,
                endpoint: service.serviceEndpoint,
                responseRequested: false,
            });
            expect(sendMessageSpy).toHaveBeenCalledTimes(1);
        }));
        test('call send message with responseRequested when message has return route', () => __awaiter(void 0, void 0, void 0, function* () {
            messageSender.registerOutboundTransport(outboundTransport);
            const sendMessageSpy = jest.spyOn(outboundTransport, 'sendMessage');
            const message = new TestMessage_1.TestMessage();
            message.setReturnRouting(TransportDecorator_1.ReturnRouteTypes.all);
            outboundMessageContext = new models_1.OutboundMessageContext(message, {
                agentContext,
                serviceParams: {
                    senderKey,
                    service,
                },
            });
            yield messageSender.sendMessageToService(outboundMessageContext);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: Events_1.AgentEventTypes.AgentMessageSent,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    message: outboundMessageContext,
                    status: models_1.OutboundMessageSendStatus.SentToTransport,
                },
            });
            expect(sendMessageSpy).toHaveBeenCalledWith({
                payload: encryptedMessage,
                endpoint: service.serviceEndpoint,
                responseRequested: true,
            });
            expect(sendMessageSpy).toHaveBeenCalledTimes(1);
        }));
        test('throw error when message endpoint is not supported by outbound transport schemes', () => __awaiter(void 0, void 0, void 0, function* () {
            messageSender.registerOutboundTransport(new DummyWsOutboundTransport());
            outboundMessageContext = new models_1.OutboundMessageContext(new TestMessage_1.TestMessage(), {
                agentContext,
                serviceParams: {
                    senderKey,
                    service,
                },
            });
            yield expect(messageSender.sendMessageToService(outboundMessageContext)).rejects.toThrow(/Unable to send message to service/);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: Events_1.AgentEventTypes.AgentMessageSent,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    message: outboundMessageContext,
                    status: models_1.OutboundMessageSendStatus.Undeliverable,
                },
            });
        }));
    });
    describe('packMessage', () => {
        beforeEach(() => {
            outboundTransport = new DummyHttpOutboundTransport();
            messageRepository = new InMemoryMessageRepository_1.InMemoryMessageRepository(agentConfig.logger);
            messageSender = new MessageSender_1.MessageSender(enveloperService, transportService, messageRepository, logger, didResolverService, didCommDocumentService, eventEmitter);
            connection = (0, helpers_1.getMockConnection)();
            envelopeServicePackMessageMock.mockReturnValue(Promise.resolve(encryptedMessage));
        });
        afterEach(() => {
            jest.resetAllMocks();
        });
        test('return outbound message context with connection, payload and endpoint', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = new TestMessage_1.TestMessage();
            const endpoint = 'https://example.com';
            const keys = {
                recipientKeys: [recipientKey],
                routingKeys: [],
                senderKey: senderKey,
            };
            const result = yield messageSender.packMessage(agentContext, { message, keys, endpoint });
            expect(result).toEqual({
                payload: encryptedMessage,
                responseRequested: message.hasAnyReturnRoute(),
                endpoint,
            });
        }));
    });
});
function getMockDidDocument({ service }) {
    return new dids_1.DidDocument({
        id: 'did:sov:SKJVx2kn373FNgvff1SbJo',
        alsoKnownAs: ['did:sov:SKJVx2kn373FNgvff1SbJo'],
        controller: ['did:sov:SKJVx2kn373FNgvff1SbJo'],
        verificationMethod: [],
        service,
        authentication: [
            new dids_1.VerificationMethod({
                id: 'did:sov:SKJVx2kn373FNgvff1SbJo#authentication-1',
                type: 'Ed25519VerificationKey2018',
                controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
                publicKeyBase58: 'EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d',
            }),
        ],
    });
}
function getMockResolvedDidService(service) {
    return {
        id: service.id,
        serviceEndpoint: service.serviceEndpoint,
        recipientKeys: [(0, helpers_2.verkeyToInstanceOfKey)('EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d')],
        routingKeys: [],
    };
}
