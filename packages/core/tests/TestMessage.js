"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestMessage = void 0;
const AgentMessage_1 = require("../src/agent/AgentMessage");
class TestMessage extends AgentMessage_1.AgentMessage {
    constructor() {
        super();
        this.type = 'https://didcomm.org/connections/1.0/invitation';
        this.id = this.generateId();
    }
}
exports.TestMessage = TestMessage;
