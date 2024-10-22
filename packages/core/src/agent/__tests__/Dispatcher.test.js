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
const helpers_1 = require("../../../tests/helpers");
const messageType_1 = require("../../utils/messageType");
const AgentMessage_1 = require("../AgentMessage");
const Dispatcher_1 = require("../Dispatcher");
const EventEmitter_1 = require("../EventEmitter");
const MessageHandlerRegistry_1 = require("../MessageHandlerRegistry");
const MessageSender_1 = require("../MessageSender");
const InboundMessageContext_1 = require("../models/InboundMessageContext");
class CustomProtocolMessage extends AgentMessage_1.AgentMessage {
    constructor() {
        super(...arguments);
        this.type = CustomProtocolMessage.type.messageTypeUri;
    }
}
CustomProtocolMessage.type = (0, messageType_1.parseMessageType)('https://didcomm.org/fake-protocol/1.5/message');
describe('Dispatcher', () => {
    const agentConfig = (0, helpers_1.getAgentConfig)('DispatcherTest');
    const agentContext = (0, helpers_1.getAgentContext)();
    const MessageSenderMock = MessageSender_1.MessageSender;
    const eventEmitter = new EventEmitter_1.EventEmitter(agentConfig.agentDependencies, new rxjs_1.Subject());
    describe('dispatch()', () => {
        it('calls the handle method of the handler', () => __awaiter(void 0, void 0, void 0, function* () {
            const messageHandlerRegistry = new MessageHandlerRegistry_1.MessageHandlerRegistry();
            const dispatcher = new Dispatcher_1.Dispatcher(new MessageSenderMock(), eventEmitter, messageHandlerRegistry, agentConfig.logger);
            const customProtocolMessage = new CustomProtocolMessage();
            const inboundMessageContext = new InboundMessageContext_1.InboundMessageContext(customProtocolMessage, { agentContext });
            const mockHandle = jest.fn();
            messageHandlerRegistry.registerMessageHandler({ supportedMessages: [CustomProtocolMessage], handle: mockHandle });
            yield dispatcher.dispatch(inboundMessageContext);
            expect(mockHandle).toHaveBeenNthCalledWith(1, inboundMessageContext);
        }));
        it('throws an error if no handler for the message could be found', () => __awaiter(void 0, void 0, void 0, function* () {
            const messageHandlerRegistry = new MessageHandlerRegistry_1.MessageHandlerRegistry();
            const dispatcher = new Dispatcher_1.Dispatcher(new MessageSenderMock(), eventEmitter, new MessageHandlerRegistry_1.MessageHandlerRegistry(), agentConfig.logger);
            const customProtocolMessage = new CustomProtocolMessage();
            const inboundMessageContext = new InboundMessageContext_1.InboundMessageContext(customProtocolMessage, { agentContext });
            const mockHandle = jest.fn();
            messageHandlerRegistry.registerMessageHandler({ supportedMessages: [], handle: mockHandle });
            yield expect(dispatcher.dispatch(inboundMessageContext)).rejects.toThrow('No handler for message type "https://didcomm.org/fake-protocol/1.5/message" found');
        }));
    });
});
