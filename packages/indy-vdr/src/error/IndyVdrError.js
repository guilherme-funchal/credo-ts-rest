"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyVdrError = void 0;
const core_1 = require("@aries-framework/core");
class IndyVdrError extends core_1.AriesFrameworkError {
    constructor(message, { cause } = {}) {
        super(message, { cause });
    }
}
exports.IndyVdrError = IndyVdrError;
