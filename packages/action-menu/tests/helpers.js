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
exports.waitForActionMenuRecord = waitForActionMenuRecord;
exports.waitForActionMenuRecordSubject = waitForActionMenuRecordSubject;
const rxjs_1 = require("rxjs");
const action_menu_1 = require("@aries-framework/action-menu");
function waitForActionMenuRecord(agent, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const observable = agent.events.observable(action_menu_1.ActionMenuEventTypes.ActionMenuStateChanged);
        return waitForActionMenuRecordSubject(observable, options);
    });
}
function waitForActionMenuRecordSubject(subject, { threadId, role, state, previousState, timeoutMs = 10000, }) {
    const observable = subject instanceof rxjs_1.ReplaySubject ? subject.asObservable() : subject;
    return (0, rxjs_1.firstValueFrom)(observable.pipe((0, rxjs_1.filter)((e) => previousState === undefined || e.payload.previousState === previousState), (0, rxjs_1.filter)((e) => threadId === undefined || e.payload.actionMenuRecord.threadId === threadId), (0, rxjs_1.filter)((e) => role === undefined || e.payload.actionMenuRecord.role === role), (0, rxjs_1.filter)((e) => state === undefined || e.payload.actionMenuRecord.state === state), (0, rxjs_1.timeout)(timeoutMs), (0, rxjs_1.catchError)(() => {
        throw new Error(`ActionMenuStateChangedEvent event not emitted within specified timeout: {
    previousState: ${previousState},
    threadId: ${threadId},
    state: ${state}
  }`);
    }), (0, rxjs_1.map)((e) => e.payload.actionMenuRecord)));
}
