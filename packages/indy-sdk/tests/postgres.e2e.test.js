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
const SubjectInboundTransport_1 = require("../../../tests/transport/SubjectInboundTransport");
const SubjectOutboundTransport_1 = require("../../../tests/transport/SubjectOutboundTransport");
const Agent_1 = require("../../core/src/agent/Agent");
const connections_1 = require("../../core/src/modules/connections");
const helpers_1 = require("../../core/tests/helpers");
const src_1 = require("../../node/src");
const setupIndySdkModule_1 = require("./setupIndySdkModule");
const alicePostgresAgentOptions = (0, helpers_1.getPostgresAgentOptions)('AgentsAlice', {
    endpoints: ['rxjs:alice'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
const bobPostgresAgentOptions = (0, helpers_1.getPostgresAgentOptions)('AgentsBob', {
    endpoints: ['rxjs:bob'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
describe('postgres agents', () => {
    let aliceAgent;
    let bobAgent;
    let aliceConnection;
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield bobAgent.shutdown();
        yield bobAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('make a connection between postgres agents', () => __awaiter(void 0, void 0, void 0, function* () {
        const aliceMessages = new rxjs_1.Subject();
        const bobMessages = new rxjs_1.Subject();
        const subjectMap = {
            'rxjs:alice': aliceMessages,
            'rxjs:bob': bobMessages,
        };
        const storageConfig = {
            type: 'postgres_storage',
            config: {
                url: 'localhost:5432',
                wallet_scheme: src_1.IndySdkPostgresWalletScheme.DatabasePerWallet,
            },
            credentials: {
                account: 'postgres',
                password: 'postgres',
                admin_account: 'postgres',
                admin_password: 'postgres',
            },
        };
        // loading the postgres wallet plugin
        (0, src_1.loadIndySdkPostgresPlugin)(storageConfig.config, storageConfig.credentials);
        aliceAgent = new Agent_1.Agent(alicePostgresAgentOptions);
        aliceAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(aliceMessages));
        aliceAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield aliceAgent.initialize();
        bobAgent = new Agent_1.Agent(bobPostgresAgentOptions);
        bobAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(bobMessages));
        bobAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield bobAgent.initialize();
        const aliceBobOutOfBandRecord = yield aliceAgent.oob.createInvitation({
            handshakeProtocols: [connections_1.HandshakeProtocol.Connections],
        });
        const { connectionRecord: bobConnectionAtBobAlice } = yield bobAgent.oob.receiveInvitation(aliceBobOutOfBandRecord.outOfBandInvitation);
        yield bobAgent.connections.returnWhenIsConnected(bobConnectionAtBobAlice.id);
        const [aliceConnectionAtAliceBob] = yield aliceAgent.connections.findAllByOutOfBandId(aliceBobOutOfBandRecord.id);
        aliceConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceConnectionAtAliceBob.id);
    }));
    test('send a message to connection', () => __awaiter(void 0, void 0, void 0, function* () {
        const message = 'hello, world';
        yield aliceAgent.basicMessages.sendMessage(aliceConnection.id, message);
        const basicMessage = yield (0, helpers_1.waitForBasicMessage)(bobAgent, {
            content: message,
        });
        expect(basicMessage.content).toBe(message);
    }));
    test('can shutdown and re-initialize the same postgres agent', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(aliceAgent.isInitialized).toBe(true);
        yield aliceAgent.shutdown();
        expect(aliceAgent.isInitialized).toBe(false);
        yield aliceAgent.initialize();
        expect(aliceAgent.isInitialized).toBe(true);
    }));
});
