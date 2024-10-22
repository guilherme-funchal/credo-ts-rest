"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../../../tests/helpers");
const connections_1 = require("../../modules/connections");
const TransportService_1 = require("../TransportService");
const stubs_1 = require("./stubs");
describe('TransportService', () => {
    describe('removeSession', () => {
        let transportService;
        beforeEach(() => {
            transportService = new TransportService_1.TransportService();
        });
        test(`remove session saved for a given connection`, () => {
            const connection = (0, helpers_1.getMockConnection)({ id: 'test-123', role: connections_1.DidExchangeRole.Responder });
            const session = new stubs_1.DummyTransportSession('dummy-session-123');
            session.connectionId = connection.id;
            transportService.saveSession(session);
            expect(transportService.findSessionByConnectionId(connection.id)).toEqual(session);
            transportService.removeSession(session);
            expect(transportService.findSessionByConnectionId(connection.id)).toEqual(undefined);
        });
    });
});
