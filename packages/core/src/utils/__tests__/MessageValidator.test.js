"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ClassValidationError_1 = require("../../error/ClassValidationError");
const connections_1 = require("../../modules/connections");
const MessageValidator_1 = require("../MessageValidator");
describe('MessageValidator', () => {
    describe('validateSync', () => {
        it('validates a class instance correctly', () => {
            const invitation = new connections_1.ConnectionInvitationMessage({
                did: 'did:sov:test1234',
                id: 'afe2867e-58c3-4a8d-85b2-23370dd9c9f0',
                label: 'test-label',
            });
            expect(MessageValidator_1.MessageValidator.validateSync(invitation)).toBeUndefined();
        });
        it('throws an error for invalid class instance', () => {
            const invitation = new connections_1.ConnectionInvitationMessage({
                did: 'did:sov:test1234',
                id: 'afe2867e-58c3-4a8d-85b2-23370dd9c9f0',
                label: 'test-label',
            });
            invitation.did = undefined;
            expect(() => MessageValidator_1.MessageValidator.validateSync(invitation)).toThrow(ClassValidationError_1.ClassValidationError);
        });
    });
});
