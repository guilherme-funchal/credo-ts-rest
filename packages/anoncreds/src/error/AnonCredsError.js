"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsError = void 0;
const core_1 = require("@aries-framework/core");
class AnonCredsError extends core_1.AriesFrameworkError {
    constructor(message, { cause } = {}) {
        super(message, { cause });
    }
}
exports.AnonCredsError = AnonCredsError;