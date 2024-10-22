"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndySdkPoolNotFoundError = void 0;
const IndySdkPoolError_1 = require("./IndySdkPoolError");
class IndySdkPoolNotFoundError extends IndySdkPoolError_1.IndySdkPoolError {
    constructor(message, { cause } = {}) {
        super(message, { cause });
    }
}
exports.IndySdkPoolNotFoundError = IndySdkPoolNotFoundError;
