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
const node_1 = require("@aries-framework/node");
const rxjs_1 = require("rxjs");
const helpers_1 = require("../../../core/tests/helpers");
const src_1 = require("../../../indy-sdk/src");
const setupIndySdkModule_1 = require("../../../indy-sdk/tests/setupIndySdkModule");
const question_answer_1 = require("@aries-framework/question-answer");
jest.mock('../repository/QuestionAnswerRepository');
const QuestionAnswerRepositoryMock = question_answer_1.QuestionAnswerRepository;
describe('QuestionAnswerService', () => {
    const mockConnectionRecord = (0, helpers_1.getMockConnection)({
        id: 'd3849ac3-c981-455b-a1aa-a10bea6cead8',
        did: 'did:sov:C2SsBf5QUQpqSAQfhu3sd2',
        state: core_1.DidExchangeState.Completed,
    });
    let wallet;
    let agentConfig;
    let questionAnswerRepository;
    let questionAnswerService;
    let eventEmitter;
    let agentContext;
    const mockQuestionAnswerRecord = (options) => {
        return new question_answer_1.QuestionAnswerRecord({
            questionText: options.questionText,
            questionDetail: options.questionDetail,
            connectionId: options.connectionId,
            role: options.role,
            signatureRequired: options.signatureRequired,
            state: options.state,
            threadId: options.threadId,
            validResponses: options.validResponses,
        });
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agentConfig = (0, helpers_1.getAgentConfig)('QuestionAnswerServiceTest');
        wallet = new src_1.IndySdkWallet(setupIndySdkModule_1.indySdk, agentConfig.logger, new core_1.SigningProviderRegistry([]));
        agentContext = (0, helpers_1.getAgentContext)();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        yield wallet.createAndOpen(agentConfig.walletConfig);
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        questionAnswerRepository = new QuestionAnswerRepositoryMock();
        eventEmitter = new core_1.EventEmitter(node_1.agentDependencies, new rxjs_1.Subject());
        questionAnswerService = new question_answer_1.QuestionAnswerService(questionAnswerRepository, eventEmitter, agentConfig.logger);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield wallet.delete();
    }));
    describe('create question', () => {
        it(`emits a question with question text, valid responses, and question answer record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(question_answer_1.QuestionAnswerEventTypes.QuestionAnswerStateChanged, eventListenerMock);
            const questionMessage = new question_answer_1.QuestionMessage({
                questionText: 'Alice, are you on the phone with Bob?',
                signatureRequired: false,
                validResponses: [{ text: 'Yes' }, { text: 'No' }],
            });
            yield questionAnswerService.createQuestion(agentContext, mockConnectionRecord.id, {
                question: questionMessage.questionText,
                validResponses: questionMessage.validResponses,
            });
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'QuestionAnswerStateChanged',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: null,
                    questionAnswerRecord: expect.objectContaining({
                        connectionId: mockConnectionRecord.id,
                        questionText: questionMessage.questionText,
                        role: question_answer_1.QuestionAnswerRole.Questioner,
                        state: question_answer_1.QuestionAnswerState.QuestionSent,
                        validResponses: questionMessage.validResponses,
                    }),
                },
            });
        }));
    });
    describe('create answer', () => {
        let mockRecord;
        beforeAll(() => {
            mockRecord = mockQuestionAnswerRecord({
                questionText: 'Alice, are you on the phone with Bob?',
                connectionId: mockConnectionRecord.id,
                role: question_answer_1.QuestionAnswerRole.Responder,
                signatureRequired: false,
                state: question_answer_1.QuestionAnswerState.QuestionReceived,
                threadId: '123',
                validResponses: [{ text: 'Yes' }, { text: 'No' }],
            });
        });
        it(`throws an error when invalid response is provided`, () => __awaiter(void 0, void 0, void 0, function* () {
            expect(questionAnswerService.createAnswer(agentContext, mockRecord, 'Maybe')).rejects.toThrowError(`Response does not match valid responses`);
        }));
        it(`emits an answer with a valid response and question answer record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(question_answer_1.QuestionAnswerEventTypes.QuestionAnswerStateChanged, eventListenerMock);
            (0, helpers_1.mockFunction)(questionAnswerRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockRecord));
            yield questionAnswerService.createAnswer(agentContext, mockRecord, 'Yes');
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'QuestionAnswerStateChanged',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: question_answer_1.QuestionAnswerState.QuestionReceived,
                    questionAnswerRecord: expect.objectContaining({
                        connectionId: mockConnectionRecord.id,
                        role: question_answer_1.QuestionAnswerRole.Responder,
                        state: question_answer_1.QuestionAnswerState.AnswerSent,
                        response: 'Yes',
                    }),
                },
            });
        }));
    });
    describe('processReceiveQuestion', () => {
        let mockRecord;
        beforeAll(() => {
            mockRecord = mockQuestionAnswerRecord({
                questionText: 'Alice, are you on the phone with Bob?',
                connectionId: mockConnectionRecord.id,
                role: question_answer_1.QuestionAnswerRole.Responder,
                signatureRequired: false,
                state: question_answer_1.QuestionAnswerState.QuestionReceived,
                threadId: '123',
                validResponses: [{ text: 'Yes' }, { text: 'No' }],
            });
        });
        it('creates record when no previous question with that thread exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const questionMessage = new question_answer_1.QuestionMessage({
                questionText: 'Alice, are you on the phone with Bob?',
                validResponses: [{ text: 'Yes' }, { text: 'No' }],
            });
            const messageContext = new core_1.InboundMessageContext(questionMessage, {
                agentContext,
                connection: mockConnectionRecord,
            });
            const questionAnswerRecord = yield questionAnswerService.processReceiveQuestion(messageContext);
            expect(questionAnswerRecord).toMatchObject(expect.objectContaining({
                role: question_answer_1.QuestionAnswerRole.Responder,
                state: question_answer_1.QuestionAnswerState.QuestionReceived,
                threadId: questionMessage.id,
                questionText: 'Alice, are you on the phone with Bob?',
                validResponses: [{ text: 'Yes' }, { text: 'No' }],
            }));
        }));
        it(`throws an error when question from the same thread exists `, () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(questionAnswerRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockRecord));
            const questionMessage = new question_answer_1.QuestionMessage({
                id: '123',
                questionText: 'Alice, are you on the phone with Bob?',
                validResponses: [{ text: 'Yes' }, { text: 'No' }],
            });
            const messageContext = new core_1.InboundMessageContext(questionMessage, {
                agentContext,
                connection: mockConnectionRecord,
            });
            expect(questionAnswerService.processReceiveQuestion(messageContext)).rejects.toThrowError(`Question answer record with thread Id ${questionMessage.id} already exists.`);
            jest.resetAllMocks();
        }));
    });
    describe('receiveAnswer', () => {
        let mockRecord;
        beforeAll(() => {
            mockRecord = mockQuestionAnswerRecord({
                questionText: 'Alice, are you on the phone with Bob?',
                connectionId: mockConnectionRecord.id,
                role: question_answer_1.QuestionAnswerRole.Questioner,
                signatureRequired: false,
                state: question_answer_1.QuestionAnswerState.QuestionReceived,
                threadId: '123',
                validResponses: [{ text: 'Yes' }, { text: 'No' }],
            });
        });
        it('updates state and emits event when valid response is received', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRecord.state = question_answer_1.QuestionAnswerState.QuestionSent;
            (0, helpers_1.mockFunction)(questionAnswerRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockRecord));
            const answerMessage = new question_answer_1.AnswerMessage({
                response: 'Yes',
                threadId: '123',
            });
            const messageContext = new core_1.InboundMessageContext(answerMessage, {
                agentContext,
                connection: mockConnectionRecord,
            });
            const questionAnswerRecord = yield questionAnswerService.receiveAnswer(messageContext);
            expect(questionAnswerRecord).toMatchObject(expect.objectContaining({
                role: question_answer_1.QuestionAnswerRole.Questioner,
                state: question_answer_1.QuestionAnswerState.AnswerReceived,
                threadId: '123',
                questionText: 'Alice, are you on the phone with Bob?',
                validResponses: [{ text: 'Yes' }, { text: 'No' }],
            }));
            jest.resetAllMocks();
        }));
        it(`throws an error when no existing question is found`, () => __awaiter(void 0, void 0, void 0, function* () {
            const answerMessage = new question_answer_1.AnswerMessage({
                response: 'Yes',
                threadId: '123',
            });
            const messageContext = new core_1.InboundMessageContext(answerMessage, {
                agentContext,
                connection: mockConnectionRecord,
            });
            expect(questionAnswerService.receiveAnswer(messageContext)).rejects.toThrowError(`Question Answer record with thread Id ${answerMessage.threadId} not found.`);
        }));
        it(`throws an error when record is in invalid state`, () => __awaiter(void 0, void 0, void 0, function* () {
            mockRecord.state = question_answer_1.QuestionAnswerState.AnswerReceived;
            (0, helpers_1.mockFunction)(questionAnswerRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockRecord));
            const answerMessage = new question_answer_1.AnswerMessage({
                response: 'Yes',
                threadId: '123',
            });
            const messageContext = new core_1.InboundMessageContext(answerMessage, {
                agentContext,
                connection: mockConnectionRecord,
            });
            expect(questionAnswerService.receiveAnswer(messageContext)).rejects.toThrowError(`Question answer record is in invalid state ${mockRecord.state}. Valid states are: ${question_answer_1.QuestionAnswerState.QuestionSent}`);
            jest.resetAllMocks();
        }));
        it(`throws an error when record is in invalid role`, () => __awaiter(void 0, void 0, void 0, function* () {
            mockRecord.state = question_answer_1.QuestionAnswerState.QuestionSent;
            mockRecord.role = question_answer_1.QuestionAnswerRole.Responder;
            (0, helpers_1.mockFunction)(questionAnswerRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockRecord));
            const answerMessage = new question_answer_1.AnswerMessage({
                response: 'Yes',
                threadId: '123',
            });
            const messageContext = new core_1.InboundMessageContext(answerMessage, {
                agentContext,
                connection: mockConnectionRecord,
            });
            expect(questionAnswerService.receiveAnswer(messageContext)).rejects.toThrowError(`Invalid question answer record role ${mockRecord.role}, expected is ${question_answer_1.QuestionAnswerRole.Questioner}`);
        }));
        jest.resetAllMocks();
    });
});
