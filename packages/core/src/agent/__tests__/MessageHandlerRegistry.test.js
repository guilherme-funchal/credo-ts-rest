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
const messageType_1 = require("../../utils/messageType");
const AgentMessage_1 = require("../AgentMessage");
const MessageHandlerRegistry_1 = require("../MessageHandlerRegistry");
class ConnectionInvitationTestMessage extends AgentMessage_1.AgentMessage {
}
ConnectionInvitationTestMessage.type = (0, messageType_1.parseMessageType)('https://didcomm.org/connections/1.0/invitation');
class ConnectionRequestTestMessage extends AgentMessage_1.AgentMessage {
}
ConnectionRequestTestMessage.type = (0, messageType_1.parseMessageType)('https://didcomm.org/connections/1.0/request');
class ConnectionResponseTestMessage extends AgentMessage_1.AgentMessage {
}
ConnectionResponseTestMessage.type = (0, messageType_1.parseMessageType)('https://didcomm.org/connections/1.0/response');
class NotificationAckTestMessage extends AgentMessage_1.AgentMessage {
}
NotificationAckTestMessage.type = (0, messageType_1.parseMessageType)('https://didcomm.org/notification/1.0/ack');
class CredentialProposalTestMessage extends AgentMessage_1.AgentMessage {
    constructor() {
        super(...arguments);
        this.type = CredentialProposalTestMessage.type.messageTypeUri;
    }
}
CredentialProposalTestMessage.type = (0, messageType_1.parseMessageType)('https://didcomm.org/issue-credential/1.0/credential-proposal');
class CustomProtocolMessage extends AgentMessage_1.AgentMessage {
    constructor() {
        super(...arguments);
        this.type = CustomProtocolMessage.type.messageTypeUri;
    }
}
CustomProtocolMessage.type = (0, messageType_1.parseMessageType)('https://didcomm.org/fake-protocol/1.5/message');
class TestHandler {
    // We want to pass various classes to test various behaviours so we dont need to strictly type it.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(classes) {
        this.supportedMessages = classes;
    }
    // We don't need an implementation in test handler so we can disable lint.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    handle() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
describe('MessageHandlerRegistry', () => {
    const fakeProtocolHandler = new TestHandler([CustomProtocolMessage]);
    const connectionHandler = new TestHandler([
        ConnectionInvitationTestMessage,
        ConnectionRequestTestMessage,
        ConnectionResponseTestMessage,
    ]);
    const messageHandlerRegistry = new MessageHandlerRegistry_1.MessageHandlerRegistry();
    messageHandlerRegistry.registerMessageHandler(connectionHandler);
    messageHandlerRegistry.registerMessageHandler(new TestHandler([NotificationAckTestMessage]));
    messageHandlerRegistry.registerMessageHandler(new TestHandler([CredentialProposalTestMessage]));
    messageHandlerRegistry.registerMessageHandler(fakeProtocolHandler);
    describe('supportedMessageTypes', () => {
        test('return all supported message types URIs', () => __awaiter(void 0, void 0, void 0, function* () {
            const messageTypes = messageHandlerRegistry.supportedMessageTypes;
            expect(messageTypes).toMatchObject([
                { messageTypeUri: 'https://didcomm.org/connections/1.0/invitation' },
                { messageTypeUri: 'https://didcomm.org/connections/1.0/request' },
                { messageTypeUri: 'https://didcomm.org/connections/1.0/response' },
                { messageTypeUri: 'https://didcomm.org/notification/1.0/ack' },
                { messageTypeUri: 'https://didcomm.org/issue-credential/1.0/credential-proposal' },
                { messageTypeUri: 'https://didcomm.org/fake-protocol/1.5/message' },
            ]);
        }));
    });
    describe('supportedProtocols', () => {
        test('return all supported message protocols URIs', () => __awaiter(void 0, void 0, void 0, function* () {
            const messageTypes = messageHandlerRegistry.supportedProtocols;
            expect(messageTypes).toEqual([
                'https://didcomm.org/connections/1.0',
                'https://didcomm.org/notification/1.0',
                'https://didcomm.org/issue-credential/1.0',
                'https://didcomm.org/fake-protocol/1.5',
            ]);
        }));
    });
    describe('filterSupportedProtocolsByMessageFamilies', () => {
        it('should return empty array when input is empty array', () => __awaiter(void 0, void 0, void 0, function* () {
            const supportedProtocols = messageHandlerRegistry.filterSupportedProtocolsByMessageFamilies([]);
            expect(supportedProtocols).toEqual([]);
        }));
        it('should return empty array when input contains only unsupported protocol', () => __awaiter(void 0, void 0, void 0, function* () {
            const supportedProtocols = messageHandlerRegistry.filterSupportedProtocolsByMessageFamilies([
                'https://didcomm.org/unsupported-protocol/1.0',
            ]);
            expect(supportedProtocols).toEqual([]);
        }));
        it('should return array with only supported protocol when input contains supported and unsupported protocol', () => __awaiter(void 0, void 0, void 0, function* () {
            const supportedProtocols = messageHandlerRegistry.filterSupportedProtocolsByMessageFamilies([
                'https://didcomm.org/connections',
                'https://didcomm.org/didexchange',
            ]);
            expect(supportedProtocols).toEqual(['https://didcomm.org/connections/1.0']);
        }));
    });
    describe('getMessageClassForMessageType()', () => {
        it('should return the correct message class for a registered message type', () => {
            const messageClass = messageHandlerRegistry.getMessageClassForMessageType('https://didcomm.org/connections/1.0/invitation');
            expect(messageClass).toBe(ConnectionInvitationTestMessage);
        });
        it('should return undefined if no message class is registered for the message type', () => {
            const messageClass = messageHandlerRegistry.getMessageClassForMessageType('https://didcomm.org/non-existing/1.0/invitation');
            expect(messageClass).toBeUndefined();
        });
        it('should return the message class with a higher minor version for the message type', () => {
            const messageClass = messageHandlerRegistry.getMessageClassForMessageType('https://didcomm.org/fake-protocol/1.0/message');
            expect(messageClass).toBe(CustomProtocolMessage);
        });
        it('should not return the message class with a different major version', () => {
            const messageClass = messageHandlerRegistry.getMessageClassForMessageType('https://didcomm.org/fake-protocol/2.0/message');
            expect(messageClass).toBeUndefined();
        });
    });
});
