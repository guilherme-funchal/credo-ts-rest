"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const LedgerUtil = __importStar(require("../util"));
describe('LedgerUtils', () => {
    // IsLedgerRejectResponse
    it('Should return true if the response op is: REJECT', () => {
        const ledgerResponse = {
            op: 'REJECT',
            reqId: 1,
            reason: 'Why not',
            identifier: '123456',
        };
        expect(LedgerUtil.isLedgerRejectResponse(ledgerResponse)).toEqual(true);
    });
    it('Should return false if the response op is not: REJECT', () => {
        const ledgerResponse = {
            op: 'REQNACK',
            reqId: 1,
            reason: 'Why not',
            identifier: '123456',
        };
        expect(LedgerUtil.isLedgerRejectResponse(ledgerResponse)).toEqual(false);
    });
    // isLedgerReqnackResponse
    it('Should return true if the response op is: REQNACK', () => {
        const ledgerResponse = {
            op: 'REQNACK',
            reqId: 1,
            reason: 'Why not',
            identifier: '123456',
        };
        expect(LedgerUtil.isLedgerReqnackResponse(ledgerResponse)).toEqual(true);
    });
    it('Should return false if the response op is NOT: REQNACK', () => {
        const ledgerResponse = {
            op: 'REJECT',
            reqId: 1,
            reason: 'Why not',
            identifier: '123456',
        };
        expect(LedgerUtil.isLedgerReqnackResponse(ledgerResponse)).toEqual(false);
    });
});
