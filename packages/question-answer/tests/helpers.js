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
exports.waitForQuestionAnswerRecord = waitForQuestionAnswerRecord;
exports.waitForQuestionAnswerRecordSubject = waitForQuestionAnswerRecordSubject;
const rxjs_1 = require("rxjs");
const question_answer_1 = require("@aries-framework/question-answer");
function waitForQuestionAnswerRecord(agent, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const observable = agent.events.observable(question_answer_1.QuestionAnswerEventTypes.QuestionAnswerStateChanged);
        return waitForQuestionAnswerRecordSubject(observable, options);
    });
}
function waitForQuestionAnswerRecordSubject(subject, { threadId, role, state, previousState, timeoutMs = 10000, }) {
    const observable = subject instanceof rxjs_1.ReplaySubject ? subject.asObservable() : subject;
    return (0, rxjs_1.firstValueFrom)(observable.pipe((0, rxjs_1.filter)((e) => previousState === undefined || e.payload.previousState === previousState), (0, rxjs_1.filter)((e) => threadId === undefined || e.payload.questionAnswerRecord.threadId === threadId), (0, rxjs_1.filter)((e) => role === undefined || e.payload.questionAnswerRecord.role === role), (0, rxjs_1.filter)((e) => state === undefined || e.payload.questionAnswerRecord.state === state), (0, rxjs_1.timeout)(timeoutMs), (0, rxjs_1.catchError)(() => {
        throw new Error(`QuestionAnswerChangedEvent event not emitted within specified timeout: {
    previousState: ${previousState},
    threadId: ${threadId},
    state: ${state}
  }`);
    }), (0, rxjs_1.map)((e) => e.payload.questionAnswerRecord)));
}
