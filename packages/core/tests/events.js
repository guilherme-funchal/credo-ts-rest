"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEventReplaySubjects = setupEventReplaySubjects;
const rxjs_1 = require("rxjs");
function setupEventReplaySubjects(agents, eventTypes) {
    const replaySubjects = [];
    for (const agent of agents) {
        const replaySubject = new rxjs_1.ReplaySubject();
        for (const eventType of eventTypes) {
            agent.events.observable(eventType).subscribe(replaySubject);
        }
        replaySubjects.push(replaySubject);
    }
    return replaySubjects;
}
