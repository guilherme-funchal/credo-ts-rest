"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const SubjectInboundTransport_1 = require("../../../../../../tests/transport/SubjectInboundTransport");
const SubjectOutboundTransport_1 = require("../../../../../../tests/transport/SubjectOutboundTransport");
const setupIndySdkModule_1 = require("../../../../../indy-sdk/tests/setupIndySdkModule");
const helpers_1 = require("../../../../tests/helpers");
const connections_1 = require("../../connections");
const OutOfBandState_1 = require("../domain/OutOfBandState");
const core_1 = require("@aries-framework/core");
const faberAgentOptions = (0, helpers_1.getAgentOptions)('Faber Agent OOB Connect to Self', {
    endpoints: ['rxjs:faber'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
describe('out of band', () => {
    let faberAgent;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const faberMessages = new rxjs_1.Subject();
        const subjectMap = {
            'rxjs:faber': faberMessages,
        };
        faberAgent = new core_1.Agent(faberAgentOptions);
        faberAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(faberMessages));
        faberAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield faberAgent.initialize();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
    }));
    describe('connect with self', () => {
        test(`make a connection with self using ${connections_1.HandshakeProtocol.DidExchange} protocol`, () => __awaiter(void 0, void 0, void 0, function* () {
            const outOfBandRecord = yield faberAgent.oob.createInvitation();
            const { outOfBandInvitation } = outOfBandRecord;
            const urlMessage = outOfBandInvitation.toUrl({ domain: 'http://example.com' });
            // eslint-disable-next-line prefer-const
            let { outOfBandRecord: receivedOutOfBandRecord, connectionRecord: receiverSenderConnection } = yield faberAgent.oob.receiveInvitationFromUrl(urlMessage);
            expect(receivedOutOfBandRecord.state).toBe(OutOfBandState_1.OutOfBandState.PrepareResponse);
            receiverSenderConnection = yield faberAgent.connections.returnWhenIsConnected(receiverSenderConnection.id);
            expect(receiverSenderConnection.state).toBe(connections_1.DidExchangeState.Completed);
            let [senderReceiverConnection] = yield faberAgent.connections.findAllByOutOfBandId(outOfBandRecord.id);
            senderReceiverConnection = yield faberAgent.connections.returnWhenIsConnected(senderReceiverConnection.id);
            expect(senderReceiverConnection.state).toBe(connections_1.DidExchangeState.Completed);
            expect(senderReceiverConnection.protocol).toBe(connections_1.HandshakeProtocol.DidExchange);
            expect(receiverSenderConnection).toBeConnectedWith(senderReceiverConnection);
            expect(senderReceiverConnection).toBeConnectedWith(receiverSenderConnection);
        }));
        test(`make a connection with self using ${connections_1.HandshakeProtocol.Connections} protocol`, () => __awaiter(void 0, void 0, void 0, function* () {
            const outOfBandRecord = yield faberAgent.oob.createInvitation({
                handshakeProtocols: [connections_1.HandshakeProtocol.Connections],
            });
            const { outOfBandInvitation } = outOfBandRecord;
            const urlMessage = outOfBandInvitation.toUrl({ domain: 'http://example.com' });
            // eslint-disable-next-line prefer-const
            let { outOfBandRecord: receivedOutOfBandRecord, connectionRecord: receiverSenderConnection } = yield faberAgent.oob.receiveInvitationFromUrl(urlMessage);
            expect(receivedOutOfBandRecord.state).toBe(OutOfBandState_1.OutOfBandState.PrepareResponse);
            receiverSenderConnection = yield faberAgent.connections.returnWhenIsConnected(receiverSenderConnection.id);
            expect(receiverSenderConnection.state).toBe(connections_1.DidExchangeState.Completed);
            let [senderReceiverConnection] = yield faberAgent.connections.findAllByOutOfBandId(outOfBandRecord.id);
            senderReceiverConnection = yield faberAgent.connections.returnWhenIsConnected(senderReceiverConnection.id);
            expect(senderReceiverConnection.state).toBe(connections_1.DidExchangeState.Completed);
            expect(senderReceiverConnection.protocol).toBe(connections_1.HandshakeProtocol.Connections);
            expect(receiverSenderConnection).toBeConnectedWith(senderReceiverConnection);
            expect(senderReceiverConnection).toBeConnectedWith(receiverSenderConnection);
        }));
    });
});
