"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndySdkPoolError = void 0;
const core_1 = require("@aries-framework/core");
class IndySdkPoolError extends core_1.AriesFrameworkError {
    constructor(message, { cause } = {}) {
        super(message, { cause });
    }
}
exports.IndySdkPoolError = IndySdkPoolError;
