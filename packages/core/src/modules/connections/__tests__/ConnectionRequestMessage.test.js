"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ClassValidationError_1 = require("../../../error/ClassValidationError");
const MessageValidator_1 = require("../../../utils/MessageValidator");
const ConnectionRequestMessage_1 = require("../messages/ConnectionRequestMessage");
describe('ConnectionRequestMessage', () => {
    it('throws an error when the message does not contain a connection parameter', () => {
        const connectionRequest = new ConnectionRequestMessage_1.ConnectionRequestMessage({
            did: 'did',
            label: 'test-label',
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete connectionRequest.connection;
        expect(() => MessageValidator_1.MessageValidator.validateSync(connectionRequest)).toThrowError(ClassValidationError_1.ClassValidationError);
    });
});
