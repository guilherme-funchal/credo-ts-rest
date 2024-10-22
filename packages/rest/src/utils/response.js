"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alternativeResponse = alternativeResponse;
exports.apiErrorResponse = apiErrorResponse;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function alternativeResponse(input) {
    return input;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function apiErrorResponse(error, details) {
    const message = typeof error === 'string' ? error : error instanceof Error ? error.message : 'Unknown error';
    return {
        message,
        details,
    };
}
