"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsRsError = void 0;
const core_1 = require("@aries-framework/core");
class AnonCredsRsError extends core_1.AriesFrameworkError {
    constructor(message, { cause } = {}) {
        super(message, { cause });
    }
}
exports.AnonCredsRsError = AnonCredsRsError;
