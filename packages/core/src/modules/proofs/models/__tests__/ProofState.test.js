"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProofState_1 = require("../ProofState");
describe('ProofState', () => {
    test('state matches Present Proof 1.0 (RFC 0037) state value', () => {
        expect(ProofState_1.ProofState.ProposalSent).toBe('proposal-sent');
        expect(ProofState_1.ProofState.ProposalReceived).toBe('proposal-received');
        expect(ProofState_1.ProofState.RequestSent).toBe('request-sent');
        expect(ProofState_1.ProofState.RequestReceived).toBe('request-received');
        expect(ProofState_1.ProofState.PresentationSent).toBe('presentation-sent');
        expect(ProofState_1.ProofState.PresentationReceived).toBe('presentation-received');
        expect(ProofState_1.ProofState.Declined).toBe('declined');
        expect(ProofState_1.ProofState.Done).toBe('done');
    });
});
