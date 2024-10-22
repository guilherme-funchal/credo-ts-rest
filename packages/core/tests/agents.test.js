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
const setupIndySdkModule_1 = require("../../indy-sdk/tests/setupIndySdkModule");
const Agent_1 = require("../src/agent/Agent");
const connections_1 = require("../src/modules/connections");
const helpers_1 = require("./helpers");
const transport_1 = require("./transport");
const aliceAgentOptions = (0, helpers_1.getAgentOptions)('Agents Alice', {
    endpoints: ['rxjs:alice'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
const bobAgentOptions = (0, helpers_1.getAgentOptions)('Agents Bob', {
    endpoints: ['rxjs:bob'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
describe('agents', () => {
    let aliceAgent;
    let bobAgent;
    let aliceConnection;
    let bobConnection;
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield bobAgent.shutdown();
        yield bobAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('make a connection between agents', () => __awaiter(void 0, void 0, void 0, function* () {
        aliceAgent = new Agent_1.Agent(aliceAgentOptions);
        bobAgent = new Agent_1.Agent(bobAgentOptions);
        (0, transport_1.setupSubjectTransports)([aliceAgent, bobAgent]);
        yield aliceAgent.initialize();
        yield bobAgent.initialize();
        const aliceBobOutOfBandRecord = yield aliceAgent.oob.createInvitation({
            handshakeProtocols: [connections_1.HandshakeProtocol.Connections],
        });
        const { connectionRecord: bobConnectionAtBobAlice } = yield bobAgent.oob.receiveInvitation(aliceBobOutOfBandRecord.outOfBandInvitation);
        bobConnection = yield bobAgent.connections.returnWhenIsConnected(bobConnectionAtBobAlice.id);
        const [aliceConnectionAtAliceBob] = yield aliceAgent.connections.findAllByOutOfBandId(aliceBobOutOfBandRecord.id);
        aliceConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceConnectionAtAliceBob.id);
        expect(aliceConnection).toBeConnectedWith(bobConnection);
        expect(bobConnection).toBeConnectedWith(aliceConnection);
    }));
    test('send a message to connection', () => __awaiter(void 0, void 0, void 0, function* () {
        const message = 'hello, world';
        yield aliceAgent.basicMessages.sendMessage(aliceConnection.id, message);
        const basicMessage = yield (0, helpers_1.waitForBasicMessage)(bobAgent, {
            content: message,
        });
        expect(basicMessage.content).toBe(message);
    }));
    test('can shutdown and re-initialize the same agent', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(aliceAgent.isInitialized).toBe(true);
        yield aliceAgent.shutdown();
        expect(aliceAgent.isInitialized).toBe(false);
        yield aliceAgent.initialize();
        expect(aliceAgent.isInitialized).toBe(true);
    }));
});
