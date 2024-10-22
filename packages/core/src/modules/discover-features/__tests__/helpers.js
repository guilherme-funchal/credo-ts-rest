"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForDisclosureSubject = waitForDisclosureSubject;
exports.waitForQuerySubject = waitForQuerySubject;
const rxjs_1 = require("rxjs");
function waitForDisclosureSubject(subject, { timeoutMs = 10000 }) {
    const observable = subject instanceof rxjs_1.ReplaySubject ? subject.asObservable() : subject;
    return (0, rxjs_1.firstValueFrom)(observable.pipe((0, rxjs_1.timeout)(timeoutMs), (0, rxjs_1.catchError)(() => {
        throw new Error(`DiscoverFeaturesDisclosureReceivedEvent event not emitted within specified timeout`);
    }), (0, rxjs_1.map)((e) => e.payload)));
}
function waitForQuerySubject(subject, { timeoutMs = 10000 }) {
    const observable = subject instanceof rxjs_1.ReplaySubject ? subject.asObservable() : subject;
    return (0, rxjs_1.firstValueFrom)(observable.pipe((0, rxjs_1.timeout)(timeoutMs), (0, rxjs_1.catchError)(() => {
        throw new Error(`DiscoverFeaturesQueryReceivedEvent event not emitted within specified timeout`);
    }), (0, rxjs_1.map)((e) => e.payload)));
}
