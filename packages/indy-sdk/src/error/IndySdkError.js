"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndySdkError = void 0;
const core_1 = require("@aries-framework/core");
class IndySdkError extends core_1.AriesFrameworkError {
    constructor(indyError, message) {
        const base = `${indyError.name}(${indyError.indyName}): ${indyError.message}`;
        super(message ? `${message}: ${base}` : base, { cause: indyError });
    }
}
exports.IndySdkError = IndySdkError;
