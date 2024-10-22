"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusException = void 0;
class StatusException extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
exports.StatusException = StatusException;
