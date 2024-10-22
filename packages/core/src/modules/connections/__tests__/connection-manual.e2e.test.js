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
const operators_1 = require("rxjs/operators");
const setupIndySdkModule_1 = require("../../../../../indy-sdk/tests/setupIndySdkModule");
const tests_1 = require("../../../../tests");
const helpers_1 = require("../../../../tests/helpers");
const Agent_1 = require("../../../agent/Agent");
const ConnectionEvents_1 = require("../ConnectionEvents");
const ConnectionsModule_1 = require("../ConnectionsModule");
const models_1 = require("../models");
function waitForRequest(agent, theirLabel) {
    return (0, rxjs_1.firstValueFrom)(agent.events.observable(ConnectionEvents_1.ConnectionEventTypes.ConnectionStateChanged).pipe((0, operators_1.map)((event) => event.payload.connectionRecord), 
    // Wait for request received
    (0, operators_1.filter)((connectionRecord) => connectionRecord.state === models_1.DidExchangeState.RequestReceived && connectionRecord.theirLabel === theirLabel), (0, operators_1.first)(), (0, operators_1.timeout)(5000)));
}
function waitForResponse(agent, connectionId) {
    return (0, rxjs_1.firstValueFrom)(agent.events.observable(ConnectionEvents_1.ConnectionEventTypes.ConnectionStateChanged).pipe(
    // Wait for response received
    (0, operators_1.map)((event) => event.payload.connectionRecord), (0, operators_1.filter)((connectionRecord) => connectionRecord.state === models_1.DidExchangeState.ResponseReceived && connectionRecord.id === connectionId), (0, operators_1.first)(), (0, operators_1.timeout)(5000)));
}
describe('Manual Connection Flow', () => {
    // This test was added to reproduce a bug where all connections based on a reusable invitation would use the same keys
    // This was only present in the manual flow, which is almost never used.
    it('can connect multiple times using the same reusable invitation without manually using the connections api', () => __awaiter(void 0, void 0, void 0, function* () {
        const aliceAgentOptions = (0, helpers_1.getAgentOptions)('Manual Connection Flow Alice', {
            label: 'alice',
            endpoints: ['rxjs:alice'],
        }, Object.assign(Object.assign({}, (0, setupIndySdkModule_1.getIndySdkModules)()), { connections: new ConnectionsModule_1.ConnectionsModule({
                autoAcceptConnections: false,
            }) }));
        const bobAgentOptions = (0, helpers_1.getAgentOptions)('Manual Connection Flow Bob', {
            label: 'bob',
            endpoints: ['rxjs:bob'],
        }, Object.assign(Object.assign({}, (0, setupIndySdkModule_1.getIndySdkModules)()), { connections: new ConnectionsModule_1.ConnectionsModule({
                autoAcceptConnections: false,
            }) }));
        const faberAgentOptions = (0, helpers_1.getAgentOptions)('Manual Connection Flow Faber', {
            endpoints: ['rxjs:faber'],
        }, Object.assign(Object.assign({}, (0, setupIndySdkModule_1.getIndySdkModules)()), { connections: new ConnectionsModule_1.ConnectionsModule({
                autoAcceptConnections: false,
            }) }));
        const aliceAgent = new Agent_1.Agent(aliceAgentOptions);
        const bobAgent = new Agent_1.Agent(bobAgentOptions);
        const faberAgent = new Agent_1.Agent(faberAgentOptions);
        (0, tests_1.setupSubjectTransports)([aliceAgent, bobAgent, faberAgent]);
        yield aliceAgent.initialize();
        yield bobAgent.initialize();
        yield faberAgent.initialize();
        const faberOutOfBandRecord = yield faberAgent.oob.createInvitation({
            autoAcceptConnection: false,
            multiUseInvitation: true,
        });
        const waitForAliceRequest = waitForRequest(faberAgent, 'alice');
        const waitForBobRequest = waitForRequest(faberAgent, 'bob');
        let { connectionRecord: aliceConnectionRecord } = yield aliceAgent.oob.receiveInvitation(faberOutOfBandRecord.outOfBandInvitation, {
            autoAcceptInvitation: true,
            autoAcceptConnection: false,
        });
        let { connectionRecord: bobConnectionRecord } = yield bobAgent.oob.receiveInvitation(faberOutOfBandRecord.outOfBandInvitation, {
            autoAcceptInvitation: true,
            autoAcceptConnection: false,
        });
        let faberAliceConnectionRecord = yield waitForAliceRequest;
        let faberBobConnectionRecord = yield waitForBobRequest;
        const waitForAliceResponse = waitForResponse(aliceAgent, aliceConnectionRecord.id);
        const waitForBobResponse = waitForResponse(bobAgent, bobConnectionRecord.id);
        yield faberAgent.connections.acceptRequest(faberAliceConnectionRecord.id);
        yield faberAgent.connections.acceptRequest(faberBobConnectionRecord.id);
        aliceConnectionRecord = yield waitForAliceResponse;
        yield aliceAgent.connections.acceptResponse(aliceConnectionRecord.id);
        bobConnectionRecord = yield waitForBobResponse;
        yield bobAgent.connections.acceptResponse(bobConnectionRecord.id);
        aliceConnectionRecord = yield aliceAgent.connections.returnWhenIsConnected(aliceConnectionRecord.id);
        bobConnectionRecord = yield bobAgent.connections.returnWhenIsConnected(bobConnectionRecord.id);
        faberAliceConnectionRecord = yield faberAgent.connections.returnWhenIsConnected(faberAliceConnectionRecord.id);
        faberBobConnectionRecord = yield faberAgent.connections.returnWhenIsConnected(faberBobConnectionRecord.id);
        expect(aliceConnectionRecord).toBeConnectedWith(faberAliceConnectionRecord);
        expect(bobConnectionRecord).toBeConnectedWith(faberBobConnectionRecord);
        yield aliceAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield bobAgent.wallet.delete();
        yield bobAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield faberAgent.shutdown();
    }));
});
