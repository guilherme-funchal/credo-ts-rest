"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSubjectTransports = setupSubjectTransports;
const rxjs_1 = require("rxjs");
const SubjectInboundTransport_1 = require("../../../tests/transport/SubjectInboundTransport");
const SubjectOutboundTransport_1 = require("../../../tests/transport/SubjectOutboundTransport");
function setupSubjectTransports(agents) {
    const subjectMap = {};
    for (const agent of agents) {
        const messages = new rxjs_1.Subject();
        subjectMap[agent.config.endpoints[0]] = messages;
        agent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(messages));
        agent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
    }
}
