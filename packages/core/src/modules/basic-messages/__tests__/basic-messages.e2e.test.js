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
const SubjectInboundTransport_1 = require("../../../../../../tests/transport/SubjectInboundTransport");
const SubjectOutboundTransport_1 = require("../../../../../../tests/transport/SubjectOutboundTransport");
const setupIndySdkModule_1 = require("../../../../../indy-sdk/tests/setupIndySdkModule");
const helpers_1 = require("../../../../tests/helpers");
const logger_1 = __importDefault(require("../../../../tests/logger"));
const Agent_1 = require("../../../agent/Agent");
const error_1 = require("../../../error");
const messages_1 = require("../messages");
const repository_1 = require("../repository");
const faberConfig = (0, helpers_1.getAgentOptions)('Faber Basic Messages', {
    endpoints: ['rxjs:faber'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
const aliceConfig = (0, helpers_1.getAgentOptions)('Alice Basic Messages', {
    endpoints: ['rxjs:alice'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
describe('Basic Messages E2E', () => {
    let faberAgent;
    let aliceAgent;
    let faberConnection;
    let aliceConnection;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const faberMessages = new rxjs_1.Subject();
        const aliceMessages = new rxjs_1.Subject();
        const subjectMap = {
            'rxjs:faber': faberMessages,
            'rxjs:alice': aliceMessages,
        };
        faberAgent = new Agent_1.Agent(faberConfig);
        faberAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(faberMessages));
        faberAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield faberAgent.initialize();
        aliceAgent = new Agent_1.Agent(aliceConfig);
        aliceAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(aliceMessages));
        aliceAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield aliceAgent.initialize();
        [aliceConnection, faberConnection] = yield (0, helpers_1.makeConnection)(aliceAgent, faberAgent);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('Alice and Faber exchange messages', () => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.test('Alice sends message to Faber');
        const helloRecord = yield aliceAgent.basicMessages.sendMessage(aliceConnection.id, 'Hello');
        expect(helloRecord.content).toBe('Hello');
        logger_1.default.test('Faber waits for message from Alice');
        yield (0, helpers_1.waitForBasicMessage)(faberAgent, {
            content: 'Hello',
        });
        logger_1.default.test('Faber sends message to Alice');
        const replyRecord = yield faberAgent.basicMessages.sendMessage(faberConnection.id, 'How are you?');
        expect(replyRecord.content).toBe('How are you?');
        logger_1.default.test('Alice waits until she receives message from faber');
        yield (0, helpers_1.waitForBasicMessage)(aliceAgent, {
            content: 'How are you?',
        });
    }));
    test('Alice and Faber exchange messages using threadId', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        logger_1.default.test('Alice sends message to Faber');
        const helloRecord = yield aliceAgent.basicMessages.sendMessage(aliceConnection.id, 'Hello');
        expect(helloRecord.content).toBe('Hello');
        logger_1.default.test('Faber waits for message from Alice');
        const helloMessage = yield (0, helpers_1.waitForBasicMessage)(faberAgent, {
            content: 'Hello',
        });
        logger_1.default.test('Faber sends message to Alice');
        const replyRecord = yield faberAgent.basicMessages.sendMessage(faberConnection.id, 'How are you?', helloMessage.id);
        expect(replyRecord.content).toBe('How are you?');
        expect(replyRecord.parentThreadId).toBe(helloMessage.id);
        logger_1.default.test('Alice waits until she receives message from faber');
        const replyMessage = yield (0, helpers_1.waitForBasicMessage)(aliceAgent, {
            content: 'How are you?',
        });
        expect(replyMessage.content).toBe('How are you?');
        expect((_a = replyMessage.thread) === null || _a === void 0 ? void 0 : _a.parentThreadId).toBe(helloMessage.id);
        // Both sender and recipient shall be able to find the threaded messages
        // Hello message
        const aliceHelloMessage = yield aliceAgent.basicMessages.getByThreadId(helloMessage.id);
        const faberHelloMessage = yield faberAgent.basicMessages.getByThreadId(helloMessage.id);
        expect(aliceHelloMessage).toMatchObject({
            content: helloRecord.content,
            threadId: helloRecord.threadId,
        });
        expect(faberHelloMessage).toMatchObject({
            content: helloRecord.content,
            threadId: helloRecord.threadId,
        });
        // Reply message
        const aliceReplyMessages = yield aliceAgent.basicMessages.findAllByQuery({ parentThreadId: helloMessage.id });
        const faberReplyMessages = yield faberAgent.basicMessages.findAllByQuery({ parentThreadId: helloMessage.id });
        expect(aliceReplyMessages.length).toBe(1);
        expect(aliceReplyMessages[0]).toMatchObject({
            content: replyRecord.content,
            parentThreadId: replyRecord.parentThreadId,
            threadId: replyRecord.threadId,
        });
        expect(faberReplyMessages.length).toBe(1);
        expect(faberReplyMessages[0]).toMatchObject(replyRecord);
    }));
    test('Alice is unable to send a message', () => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.test('Alice sends message to Faber that is undeliverable');
        const spy = jest.spyOn(aliceAgent.outboundTransports[0], 'sendMessage').mockRejectedValue(new Error('any error'));
        yield expect(aliceAgent.basicMessages.sendMessage(aliceConnection.id, 'Hello')).rejects.toThrowError(error_1.MessageSendingError);
        try {
            yield aliceAgent.basicMessages.sendMessage(aliceConnection.id, 'Hello undeliverable');
        }
        catch (error) {
            const thrownError = error;
            expect(thrownError.message).toEqual(`Message is undeliverable to connection ${aliceConnection.id} (${aliceConnection.theirLabel})`);
            logger_1.default.test('Error thrown includes the outbound message and recently created record id');
            expect(thrownError.outboundMessageContext.associatedRecord).toBeInstanceOf(repository_1.BasicMessageRecord);
            expect(thrownError.outboundMessageContext.message).toBeInstanceOf(messages_1.BasicMessage);
            expect(thrownError.outboundMessageContext.message.content).toBe('Hello undeliverable');
            logger_1.default.test('Created record can be found and deleted by id');
            const storedRecord = yield aliceAgent.basicMessages.getById(thrownError.outboundMessageContext.associatedRecord.id);
            expect(storedRecord).toBeInstanceOf(repository_1.BasicMessageRecord);
            expect(storedRecord.content).toBe('Hello undeliverable');
            yield aliceAgent.basicMessages.deleteById(storedRecord.id);
            yield expect(aliceAgent.basicMessages.getById(thrownError.outboundMessageContext.associatedRecord.id)).rejects.toThrowError(error_1.RecordNotFoundError);
        }
        spy.mockClear();
    }));
});
