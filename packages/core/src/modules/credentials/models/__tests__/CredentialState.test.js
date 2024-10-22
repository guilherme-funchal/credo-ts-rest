"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CredentialState_1 = require("../CredentialState");
describe('CredentialState', () => {
    test('state matches Issue Credential 1.0 (RFC 0036) state value', () => {
        expect(CredentialState_1.CredentialState.ProposalSent).toBe('proposal-sent');
        expect(CredentialState_1.CredentialState.ProposalReceived).toBe('proposal-received');
        expect(CredentialState_1.CredentialState.OfferSent).toBe('offer-sent');
        expect(CredentialState_1.CredentialState.OfferReceived).toBe('offer-received');
        expect(CredentialState_1.CredentialState.Declined).toBe('declined');
        expect(CredentialState_1.CredentialState.RequestSent).toBe('request-sent');
        expect(CredentialState_1.CredentialState.RequestReceived).toBe('request-received');
        expect(CredentialState_1.CredentialState.CredentialIssued).toBe('credential-issued');
        expect(CredentialState_1.CredentialState.CredentialReceived).toBe('credential-received');
        expect(CredentialState_1.CredentialState.Done).toBe('done');
    });
    test('state matches Issue Credential 2.0 (RFC 0453) state value', () => {
        expect(CredentialState_1.CredentialState.ProposalSent).toBe('proposal-sent');
        expect(CredentialState_1.CredentialState.ProposalReceived).toBe('proposal-received');
        expect(CredentialState_1.CredentialState.OfferSent).toBe('offer-sent');
        expect(CredentialState_1.CredentialState.OfferReceived).toBe('offer-received');
        expect(CredentialState_1.CredentialState.Declined).toBe('declined');
        expect(CredentialState_1.CredentialState.RequestSent).toBe('request-sent');
        expect(CredentialState_1.CredentialState.RequestReceived).toBe('request-received');
        expect(CredentialState_1.CredentialState.CredentialIssued).toBe('credential-issued');
        expect(CredentialState_1.CredentialState.CredentialReceived).toBe('credential-received');
        expect(CredentialState_1.CredentialState.Done).toBe('done');
    });
});
