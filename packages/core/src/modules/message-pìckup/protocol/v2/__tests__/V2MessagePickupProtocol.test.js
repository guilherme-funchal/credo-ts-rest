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
const helpers_1 = require("../../../../../../tests/helpers");
const EventEmitter_1 = require("../../../../../agent/EventEmitter");
const Events_1 = require("../../../../../agent/Events");
const MessageSender_1 = require("../../../../../agent/MessageSender");
const InboundMessageContext_1 = require("../../../../../agent/models/InboundMessageContext");
const constants_1 = require("../../../../../constants");
const Attachment_1 = require("../../../../../decorators/attachment/Attachment");
const error_1 = require("../../../../../error");
const InMemoryMessageRepository_1 = require("../../../../../storage/InMemoryMessageRepository");
const uuid_1 = require("../../../../../utils/uuid");
const connections_1 = require("../../../../connections");
const ConnectionService_1 = require("../../../../connections/services/ConnectionService");
const MessagePickupModuleConfig_1 = require("../../../MessagePickupModuleConfig");
const v1_1 = require("../../v1");
const V2MessagePickupProtocol_1 = require("../V2MessagePickupProtocol");
const messages_1 = require("../messages");
const mockConnection = (0, helpers_1.getMockConnection)({
    state: connections_1.DidExchangeState.Completed,
});
// Mock classes
jest.mock('../../../../../storage/InMemoryMessageRepository');
jest.mock('../../../../../agent/EventEmitter');
jest.mock('../../../../../agent/MessageSender');
jest.mock('../../../../connections/services/ConnectionService');
// Mock typed object
const InMessageRepositoryMock = InMemoryMessageRepository_1.InMemoryMessageRepository;
const EventEmitterMock = EventEmitter_1.EventEmitter;
const MessageSenderMock = MessageSender_1.MessageSender;
const ConnectionServiceMock = ConnectionService_1.ConnectionService;
const messagePickupModuleConfig = new MessagePickupModuleConfig_1.MessagePickupModuleConfig({
    maximumBatchSize: 10,
    protocols: [new v1_1.V1MessagePickupProtocol(), new V2MessagePickupProtocol_1.V2MessagePickupProtocol()],
});
const messageSender = new MessageSenderMock();
const eventEmitter = new EventEmitterMock();
const connectionService = new ConnectionServiceMock();
const messageRepository = new InMessageRepositoryMock();
const agentContext = (0, helpers_1.getAgentContext)({
    registerInstances: [
        [constants_1.InjectionSymbols.MessageRepository, messageRepository],
        [EventEmitter_1.EventEmitter, eventEmitter],
        [MessageSender_1.MessageSender, messageSender],
        [ConnectionService_1.ConnectionService, connectionService],
        [MessagePickupModuleConfig_1.MessagePickupModuleConfig, messagePickupModuleConfig],
    ],
});
const encryptedMessage = {
    protected: 'base64url',
    iv: 'base64url',
    ciphertext: 'base64url',
    tag: 'base64url',
};
const queuedMessages = [encryptedMessage, encryptedMessage, encryptedMessage];
describe('V2MessagePickupService', () => {
    let pickupProtocol;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        pickupProtocol = new V2MessagePickupProtocol_1.V2MessagePickupProtocol();
    }));
    describe('processStatusRequest', () => {
        test('no available messages in queue', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(messageRepository.getAvailableMessageCount).mockResolvedValue(0);
            const statusRequest = new messages_1.V2StatusRequestMessage({});
            const messageContext = new InboundMessageContext_1.InboundMessageContext(statusRequest, { connection: mockConnection, agentContext });
            const { connection, message } = yield pickupProtocol.processStatusRequest(messageContext);
            expect(connection).toEqual(mockConnection);
            expect(message).toEqual(new messages_1.V2StatusMessage({
                id: message.id,
                threadId: statusRequest.threadId,
                messageCount: 0,
            }));
            expect(messageRepository.getAvailableMessageCount).toHaveBeenCalledWith(mockConnection.id);
        }));
        test('multiple messages in queue', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(messageRepository.getAvailableMessageCount).mockResolvedValue(5);
            const statusRequest = new messages_1.V2StatusRequestMessage({});
            const messageContext = new InboundMessageContext_1.InboundMessageContext(statusRequest, { connection: mockConnection, agentContext });
            const { connection, message } = yield pickupProtocol.processStatusRequest(messageContext);
            expect(connection).toEqual(mockConnection);
            expect(message).toEqual(new messages_1.V2StatusMessage({
                id: message.id,
                threadId: statusRequest.threadId,
                messageCount: 5,
            }));
            expect(messageRepository.getAvailableMessageCount).toHaveBeenCalledWith(mockConnection.id);
        }));
        test('status request specifying recipient key', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(messageRepository.getAvailableMessageCount).mockResolvedValue(10);
            const statusRequest = new messages_1.V2StatusRequestMessage({
                recipientKey: 'recipientKey',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(statusRequest, { connection: mockConnection, agentContext });
            yield expect(pickupProtocol.processStatusRequest(messageContext)).rejects.toThrowError('recipient_key parameter not supported');
        }));
    });
    describe('processDeliveryRequest', () => {
        test('no available messages in queue', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(messageRepository.takeFromQueue).mockReturnValue([]);
            const deliveryRequest = new messages_1.V2DeliveryRequestMessage({ limit: 10 });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(deliveryRequest, { connection: mockConnection, agentContext });
            const { connection, message } = yield pickupProtocol.processDeliveryRequest(messageContext);
            expect(connection).toEqual(mockConnection);
            expect(message).toEqual(new messages_1.V2StatusMessage({
                id: message.id,
                threadId: deliveryRequest.threadId,
                messageCount: 0,
            }));
            expect(messageRepository.takeFromQueue).toHaveBeenCalledWith(mockConnection.id, 10, true);
        }));
        test('less messages in queue than limit', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            (0, helpers_1.mockFunction)(messageRepository.takeFromQueue).mockReturnValue(queuedMessages);
            const deliveryRequest = new messages_1.V2DeliveryRequestMessage({ limit: 10 });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(deliveryRequest, { connection: mockConnection, agentContext });
            const { connection, message } = yield pickupProtocol.processDeliveryRequest(messageContext);
            expect(connection).toEqual(mockConnection);
            expect(message).toBeInstanceOf(messages_1.V2MessageDeliveryMessage);
            expect(message.threadId).toEqual(deliveryRequest.threadId);
            expect((_a = message.appendedAttachments) === null || _a === void 0 ? void 0 : _a.length).toEqual(3);
            expect(message.appendedAttachments).toEqual(expect.arrayContaining(queuedMessages.map((msg) => expect.objectContaining({
                data: {
                    json: msg,
                },
            }))));
            expect(messageRepository.takeFromQueue).toHaveBeenCalledWith(mockConnection.id, 10, true);
        }));
        test('more messages in queue than limit', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            (0, helpers_1.mockFunction)(messageRepository.takeFromQueue).mockReturnValue(queuedMessages.slice(0, 2));
            const deliveryRequest = new messages_1.V2DeliveryRequestMessage({ limit: 2 });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(deliveryRequest, { connection: mockConnection, agentContext });
            const { connection, message } = yield pickupProtocol.processDeliveryRequest(messageContext);
            expect(connection).toEqual(mockConnection);
            expect(message).toBeInstanceOf(messages_1.V2MessageDeliveryMessage);
            expect(message.threadId).toEqual(deliveryRequest.threadId);
            expect((_a = message.appendedAttachments) === null || _a === void 0 ? void 0 : _a.length).toEqual(2);
            expect(message.appendedAttachments).toEqual(expect.arrayContaining(queuedMessages.slice(0, 2).map((msg) => expect.objectContaining({
                data: {
                    json: msg,
                },
            }))));
            expect(messageRepository.takeFromQueue).toHaveBeenCalledWith(mockConnection.id, 2, true);
        }));
        test('delivery request specifying recipient key', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(messageRepository.takeFromQueue).mockReturnValue(queuedMessages);
            const statusRequest = new messages_1.V2DeliveryRequestMessage({
                limit: 10,
                recipientKey: 'recipientKey',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(statusRequest, { connection: mockConnection, agentContext });
            yield expect(pickupProtocol.processStatusRequest(messageContext)).rejects.toThrowError('recipient_key parameter not supported');
        }));
    });
    describe('processMessagesReceived', () => {
        test('messages received partially', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(messageRepository.takeFromQueue).mockReturnValue(queuedMessages);
            (0, helpers_1.mockFunction)(messageRepository.getAvailableMessageCount).mockResolvedValue(4);
            const messagesReceived = new messages_1.V2MessagesReceivedMessage({
                messageIdList: ['1', '2'],
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(messagesReceived, { connection: mockConnection, agentContext });
            const { connection, message } = yield pickupProtocol.processMessagesReceived(messageContext);
            expect(connection).toEqual(mockConnection);
            expect(message).toEqual(new messages_1.V2StatusMessage({
                id: message.id,
                threadId: messagesReceived.threadId,
                messageCount: 4,
            }));
            expect(messageRepository.getAvailableMessageCount).toHaveBeenCalledWith(mockConnection.id);
            expect(messageRepository.takeFromQueue).toHaveBeenCalledWith(mockConnection.id, 2);
        }));
        test('all messages have been received', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(messageRepository.takeFromQueue).mockReturnValue(queuedMessages);
            (0, helpers_1.mockFunction)(messageRepository.getAvailableMessageCount).mockResolvedValue(0);
            const messagesReceived = new messages_1.V2MessagesReceivedMessage({
                messageIdList: ['1', '2'],
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(messagesReceived, { connection: mockConnection, agentContext });
            const { connection, message } = yield pickupProtocol.processMessagesReceived(messageContext);
            expect(connection).toEqual(mockConnection);
            expect(message).toEqual(new messages_1.V2StatusMessage({
                id: message.id,
                threadId: messagesReceived.threadId,
                messageCount: 0,
            }));
            expect(messageRepository.getAvailableMessageCount).toHaveBeenCalledWith(mockConnection.id);
            expect(messageRepository.takeFromQueue).toHaveBeenCalledWith(mockConnection.id, 2);
        }));
    });
    describe('pickupMessages', () => {
        it('creates a status request message', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message: statusRequestMessage } = yield pickupProtocol.pickupMessages(agentContext, {
                connectionRecord: mockConnection,
                recipientKey: 'a-key',
            });
            expect(statusRequestMessage).toMatchObject({
                id: expect.any(String),
                recipientKey: 'a-key',
            });
        }));
    });
    describe('processStatus', () => {
        it('if status request has a message count of zero returns nothing', () => __awaiter(void 0, void 0, void 0, function* () {
            const status = new messages_1.V2StatusMessage({
                threadId: (0, uuid_1.uuid)(),
                messageCount: 0,
            });
            (0, helpers_1.mockFunction)(connectionService.createTrustPing).mockResolvedValueOnce({
                message: new connections_1.TrustPingMessage({}),
                connectionRecord: mockConnection,
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(status, { connection: mockConnection, agentContext });
            const deliveryRequestMessage = yield pickupProtocol.processStatus(messageContext);
            expect(deliveryRequestMessage).toBeNull();
        }));
        it('if it has a message count greater than zero return a valid delivery request', () => __awaiter(void 0, void 0, void 0, function* () {
            const status = new messages_1.V2StatusMessage({
                threadId: (0, uuid_1.uuid)(),
                messageCount: 1,
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(status, { connection: mockConnection, agentContext });
            const deliveryRequestMessage = yield pickupProtocol.processStatus(messageContext);
            expect(deliveryRequestMessage);
            expect(deliveryRequestMessage).toEqual(new messages_1.V2DeliveryRequestMessage({ id: deliveryRequestMessage === null || deliveryRequestMessage === void 0 ? void 0 : deliveryRequestMessage.id, limit: 1 }));
        }));
    });
    describe('processDelivery', () => {
        it('if the delivery has no attachments expect an error', () => __awaiter(void 0, void 0, void 0, function* () {
            const messageContext = new InboundMessageContext_1.InboundMessageContext({}, {
                connection: mockConnection,
                agentContext,
            });
            yield expect(pickupProtocol.processDelivery(messageContext)).rejects.toThrowError(new error_1.AriesFrameworkError('Error processing attachments'));
        }));
        it('should return a message received with an message id list in it', () => __awaiter(void 0, void 0, void 0, function* () {
            const messageDeliveryMessage = new messages_1.V2MessageDeliveryMessage({
                threadId: (0, uuid_1.uuid)(),
                attachments: [
                    new Attachment_1.Attachment({
                        id: '1',
                        data: {
                            json: {
                                a: 'value',
                            },
                        },
                    }),
                ],
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(messageDeliveryMessage, {
                connection: mockConnection,
                agentContext,
            });
            const messagesReceivedMessage = yield pickupProtocol.processDelivery(messageContext);
            expect(messagesReceivedMessage).toEqual(new messages_1.V2MessagesReceivedMessage({
                id: messagesReceivedMessage.id,
                messageIdList: ['1'],
            }));
        }));
        it('calls the event emitter for each message', () => __awaiter(void 0, void 0, void 0, function* () {
            // This is to not take into account events previously emitted
            jest.clearAllMocks();
            const messageDeliveryMessage = new messages_1.V2MessageDeliveryMessage({
                threadId: (0, uuid_1.uuid)(),
                attachments: [
                    new Attachment_1.Attachment({
                        id: '1',
                        data: {
                            json: {
                                first: 'value',
                            },
                        },
                    }),
                    new Attachment_1.Attachment({
                        id: '2',
                        data: {
                            json: {
                                second: 'value',
                            },
                        },
                    }),
                ],
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(messageDeliveryMessage, {
                connection: mockConnection,
                agentContext,
            });
            yield pickupProtocol.processDelivery(messageContext);
            expect(eventEmitter.emit).toHaveBeenCalledTimes(2);
            expect(eventEmitter.emit).toHaveBeenNthCalledWith(1, agentContext, {
                type: Events_1.AgentEventTypes.AgentMessageReceived,
                payload: {
                    message: { first: 'value' },
                    contextCorrelationId: agentContext.contextCorrelationId,
                },
            });
            expect(eventEmitter.emit).toHaveBeenNthCalledWith(2, agentContext, {
                type: Events_1.AgentEventTypes.AgentMessageReceived,
                payload: {
                    message: { second: 'value' },
                    contextCorrelationId: agentContext.contextCorrelationId,
                },
            });
        }));
    });
});
