"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyTransportSession = void 0;
class DummyTransportSession {
    constructor(id) {
        this.type = 'http';
        this.id = id;
    }
    send() {
        throw new Error('Method not implemented.');
    }
    close() {
        throw new Error('Method not implemented.');
    }
}
exports.DummyTransportSession = DummyTransportSession;
