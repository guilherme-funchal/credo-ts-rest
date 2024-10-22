"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLedgerRejectResponse = isLedgerRejectResponse;
exports.isLedgerReqnackResponse = isLedgerReqnackResponse;
function isLedgerRejectResponse(response) {
    return response.op === 'REJECT';
}
function isLedgerReqnackResponse(response) {
    return response.op === 'REQNACK';
}
