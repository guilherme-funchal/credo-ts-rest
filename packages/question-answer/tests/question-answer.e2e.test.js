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
const tests_1 = require("../../core/tests");
const src_1 = require("../../indy-sdk/src");
const helpers_1 = require("./helpers");
const question_answer_1 = require("@aries-framework/question-answer");
const modules = {
    questionAnswer: new question_answer_1.QuestionAnswerModule(),
    indySdk: new src_1.IndySdkModule({
        indySdk: tests_1.indySdk,
    }),
};
const bobAgentOptions = (0, tests_1.getAgentOptions)('Bob Question Answer', {
    endpoints: ['rxjs:bob'],
}, modules);
const aliceAgentOptions = (0, tests_1.getAgentOptions)('Alice Question Answer', {
    endpoints: ['rxjs:alice'],
}, modules);
describe('Question Answer', () => {
    let bobAgent;
    let aliceAgent;
    let aliceConnection;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        bobAgent = new core_1.Agent(bobAgentOptions);
        aliceAgent = new core_1.Agent(aliceAgentOptions);
        (0, tests_1.setupSubjectTransports)([bobAgent, aliceAgent]);
        yield bobAgent.initialize();
        yield aliceAgent.initialize();
        [aliceConnection] = yield (0, tests_1.makeConnection)(aliceAgent, bobAgent);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield bobAgent.shutdown();
        yield bobAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('Alice sends a question and Bob answers', () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Alice sends question to Bob');
        let aliceQuestionAnswerRecord = yield aliceAgent.modules.questionAnswer.sendQuestion(aliceConnection.id, {
            question: 'Do you want to play?',
            validResponses: [{ text: 'Yes' }, { text: 'No' }],
        });
        tests_1.testLogger.test('Bob waits for question from Alice');
        const bobQuestionAnswerRecord = yield (0, helpers_1.waitForQuestionAnswerRecord)(bobAgent, {
            threadId: aliceQuestionAnswerRecord.threadId,
            state: question_answer_1.QuestionAnswerState.QuestionReceived,
        });
        expect(bobQuestionAnswerRecord.questionText).toEqual('Do you want to play?');
        expect(bobQuestionAnswerRecord.validResponses).toEqual([{ text: 'Yes' }, { text: 'No' }]);
        tests_1.testLogger.test('Bob sends answer to Alice');
        yield bobAgent.modules.questionAnswer.sendAnswer(bobQuestionAnswerRecord.id, 'Yes');
        tests_1.testLogger.test('Alice waits until Bob answers');
        aliceQuestionAnswerRecord = yield (0, helpers_1.waitForQuestionAnswerRecord)(aliceAgent, {
            threadId: aliceQuestionAnswerRecord.threadId,
            state: question_answer_1.QuestionAnswerState.AnswerReceived,
        });
        expect(aliceQuestionAnswerRecord.response).toEqual('Yes');
        const retrievedRecord = yield aliceAgent.modules.questionAnswer.findById(aliceQuestionAnswerRecord.id);
        expect(retrievedRecord).toMatchObject(expect.objectContaining({
            id: aliceQuestionAnswerRecord.id,
            threadId: aliceQuestionAnswerRecord.threadId,
            state: question_answer_1.QuestionAnswerState.AnswerReceived,
            role: question_answer_1.QuestionAnswerRole.Questioner,
        }));
    }));
});
