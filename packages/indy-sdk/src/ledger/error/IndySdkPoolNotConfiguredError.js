"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndySdkPoolNotConfiguredError = void 0;
const IndySdkPoolError_1 = require("./IndySdkPoolError");
class IndySdkPoolNotConfiguredError extends IndySdkPoolError_1.IndySdkPoolError {
    constructor(message, { cause } = {}) {
        super(message, { cause });
    }
}
exports.IndySdkPoolNotConfiguredError = IndySdkPoolNotConfiguredError;
