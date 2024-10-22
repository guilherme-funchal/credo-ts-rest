"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConnectionState_1 = require("../ConnectionState");
const DidExchangeState_1 = require("../DidExchangeState");
describe('ConnectionState', () => {
    test('state matches Connection 1.0 (RFC 0160) state value', () => {
        expect(ConnectionState_1.ConnectionState.Null).toBe('null');
        expect(ConnectionState_1.ConnectionState.Invited).toBe('invited');
        expect(ConnectionState_1.ConnectionState.Requested).toBe('requested');
        expect(ConnectionState_1.ConnectionState.Responded).toBe('responded');
        expect(ConnectionState_1.ConnectionState.Complete).toBe('complete');
    });
    describe('rfc0160StateFromDidExchangeState', () => {
        it('should return the connection state for all did exchanges states', () => {
            expect((0, ConnectionState_1.rfc0160StateFromDidExchangeState)(DidExchangeState_1.DidExchangeState.Abandoned)).toEqual(ConnectionState_1.ConnectionState.Null);
            expect((0, ConnectionState_1.rfc0160StateFromDidExchangeState)(DidExchangeState_1.DidExchangeState.Start)).toEqual(ConnectionState_1.ConnectionState.Null);
            expect((0, ConnectionState_1.rfc0160StateFromDidExchangeState)(DidExchangeState_1.DidExchangeState.InvitationReceived)).toEqual(ConnectionState_1.ConnectionState.Invited);
            expect((0, ConnectionState_1.rfc0160StateFromDidExchangeState)(DidExchangeState_1.DidExchangeState.InvitationSent)).toEqual(ConnectionState_1.ConnectionState.Invited);
            expect((0, ConnectionState_1.rfc0160StateFromDidExchangeState)(DidExchangeState_1.DidExchangeState.RequestReceived)).toEqual(ConnectionState_1.ConnectionState.Requested);
            expect((0, ConnectionState_1.rfc0160StateFromDidExchangeState)(DidExchangeState_1.DidExchangeState.RequestSent)).toEqual(ConnectionState_1.ConnectionState.Requested);
            expect((0, ConnectionState_1.rfc0160StateFromDidExchangeState)(DidExchangeState_1.DidExchangeState.ResponseReceived)).toEqual(ConnectionState_1.ConnectionState.Responded);
            expect((0, ConnectionState_1.rfc0160StateFromDidExchangeState)(DidExchangeState_1.DidExchangeState.ResponseReceived)).toEqual(ConnectionState_1.ConnectionState.Responded);
            expect((0, ConnectionState_1.rfc0160StateFromDidExchangeState)(DidExchangeState_1.DidExchangeState.Completed)).toEqual(ConnectionState_1.ConnectionState.Complete);
        });
    });
});
