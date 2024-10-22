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
const helpers_1 = require("../../../../tests/helpers");
const EventEmitter_1 = require("../../../agent/EventEmitter");
const InboundMessageContext_1 = require("../../../agent/models/InboundMessageContext");
const BasicMessageRole_1 = require("../BasicMessageRole");
const messages_1 = require("../messages");
const BasicMessageRecord_1 = require("../repository/BasicMessageRecord");
const BasicMessageRepository_1 = require("../repository/BasicMessageRepository");
const services_1 = require("../services");
jest.mock('../repository/BasicMessageRepository');
const BasicMessageRepositoryMock = BasicMessageRepository_1.BasicMessageRepository;
const basicMessageRepository = new BasicMessageRepositoryMock();
jest.mock('../../../agent/EventEmitter');
const EventEmitterMock = EventEmitter_1.EventEmitter;
const eventEmitter = new EventEmitterMock();
const agentContext = (0, helpers_1.getAgentContext)();
describe('BasicMessageService', () => {
    let basicMessageService;
    const mockConnectionRecord = (0, helpers_1.getMockConnection)({
        id: 'd3849ac3-c981-455b-a1aa-a10bea6cead8',
        did: 'did:sov:C2SsBf5QUQpqSAQfhu3sd2',
    });
    beforeEach(() => {
        basicMessageService = new services_1.BasicMessageService(basicMessageRepository, eventEmitter);
    });
    describe('createMessage', () => {
        it(`creates message and record, and emits message and basic message record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const { message } = yield basicMessageService.createMessage(agentContext, 'hello', mockConnectionRecord);
            expect(message.content).toBe('hello');
            expect(basicMessageRepository.save).toHaveBeenCalledWith(agentContext, expect.any(BasicMessageRecord_1.BasicMessageRecord));
            expect(eventEmitter.emit).toHaveBeenCalledWith(agentContext, {
                type: 'BasicMessageStateChanged',
                payload: {
                    basicMessageRecord: expect.objectContaining({
                        connectionId: mockConnectionRecord.id,
                        id: expect.any(String),
                        sentTime: expect.any(String),
                        content: 'hello',
                        role: BasicMessageRole_1.BasicMessageRole.Sender,
                    }),
                    message,
                },
            });
        }));
    });
    describe('save', () => {
        it(`stores record and emits message and basic message record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const basicMessage = new messages_1.BasicMessage({
                id: '123',
                content: 'message',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(basicMessage, { agentContext });
            yield basicMessageService.save(messageContext, mockConnectionRecord);
            expect(basicMessageRepository.save).toHaveBeenCalledWith(agentContext, expect.any(BasicMessageRecord_1.BasicMessageRecord));
            expect(eventEmitter.emit).toHaveBeenCalledWith(agentContext, {
                type: 'BasicMessageStateChanged',
                payload: {
                    basicMessageRecord: expect.objectContaining({
                        connectionId: mockConnectionRecord.id,
                        id: expect.any(String),
                        sentTime: basicMessage.sentTime.toISOString(),
                        content: basicMessage.content,
                        role: BasicMessageRole_1.BasicMessageRole.Receiver,
                    }),
                    message: messageContext.message,
                },
            });
        }));
    });
});
