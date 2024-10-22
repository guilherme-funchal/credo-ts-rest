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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicDidSeed = exports.genesisPath = exports.RegisteredAskarTestWallet = exports.askarModuleConfig = void 0;
exports.getPostgresAgentOptions = getPostgresAgentOptions;
exports.getSqliteAgentOptions = getSqliteAgentOptions;
exports.e2eTest = e2eTest;
const core_1 = require("@aries-framework/core");
const aries_askar_nodejs_1 = require("@hyperledger/aries-askar-nodejs");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const path_1 = __importDefault(require("path"));
const helpers_1 = require("../../core/tests/helpers");
const logger_1 = require("../../core/tests/logger");
const src_1 = require("../../node/src");
const AskarModule_1 = require("../src/AskarModule");
const AskarModuleConfig_1 = require("../src/AskarModuleConfig");
const wallet_1 = require("../src/wallet");
exports.askarModuleConfig = new AskarModuleConfig_1.AskarModuleConfig({ ariesAskar: aries_askar_nodejs_1.ariesAskar });
(0, aries_askar_shared_1.registerAriesAskar)({ askar: exports.askarModuleConfig.ariesAskar });
// When using the AskarWallet directly, the native dependency won't be loaded by default.
// So in tests depending on Askar, we import this wallet so we're sure the native dependency is loaded.
exports.RegisteredAskarTestWallet = wallet_1.AskarWallet;
exports.genesisPath = process.env.GENESIS_TXN_PATH
    ? path_1.default.resolve(process.env.GENESIS_TXN_PATH)
    : path_1.default.join(__dirname, '../../../../network/genesis/local-genesis.txn');
exports.publicDidSeed = (_a = process.env.TEST_AGENT_PUBLIC_DID_SEED) !== null && _a !== void 0 ? _a : '000000000000000000000000Trustee9';
function getPostgresAgentOptions(name, storageConfig, extraConfig = {}) {
    const random = core_1.utils.uuid().slice(0, 4);
    const config = Object.assign({ label: `PostgresAgent: ${name} - ${random}`, walletConfig: {
            id: `PostgresWallet${name}${random}`,
            key: `Key${name}`,
            storage: storageConfig,
        }, autoUpdateStorageOnStartup: false, logger: new logger_1.TestLogger(core_1.LogLevel.off, name) }, extraConfig);
    return {
        config,
        dependencies: src_1.agentDependencies,
        modules: {
            askar: new AskarModule_1.AskarModule(exports.askarModuleConfig),
            connections: new core_1.ConnectionsModule({
                autoAcceptConnections: true,
            }),
        },
    };
}
function getSqliteAgentOptions(name, extraConfig = {}, inMemory) {
    const random = core_1.utils.uuid().slice(0, 4);
    const config = Object.assign({ label: `SQLiteAgent: ${name} - ${random}`, walletConfig: {
            id: `SQLiteWallet${name} - ${random}`,
            key: `Key${name}`,
            storage: { type: 'sqlite', inMemory },
        }, autoUpdateStorageOnStartup: false, logger: new logger_1.TestLogger(core_1.LogLevel.off, name) }, extraConfig);
    return {
        config,
        dependencies: src_1.agentDependencies,
        modules: {
            askar: new AskarModule_1.AskarModule(exports.askarModuleConfig),
            connections: new core_1.ConnectionsModule({
                autoAcceptConnections: true,
            }),
        },
    };
}
/**
 * Basic E2E test: connect two agents, send a basic message and verify it they can be re initialized
 * @param senderAgent
 * @param receiverAgent
 */
function e2eTest(senderAgent, receiverAgent) {
    return __awaiter(this, void 0, void 0, function* () {
        const senderReceiverOutOfBandRecord = yield senderAgent.oob.createInvitation({
            handshakeProtocols: [core_1.HandshakeProtocol.Connections],
        });
        const { connectionRecord: bobConnectionAtReceiversender } = yield receiverAgent.oob.receiveInvitation(senderReceiverOutOfBandRecord.outOfBandInvitation);
        if (!bobConnectionAtReceiversender)
            throw new Error('Connection not created');
        yield receiverAgent.connections.returnWhenIsConnected(bobConnectionAtReceiversender.id);
        const [senderConnectionAtReceiver] = yield senderAgent.connections.findAllByOutOfBandId(senderReceiverOutOfBandRecord.id);
        const senderConnection = yield senderAgent.connections.returnWhenIsConnected(senderConnectionAtReceiver.id);
        const message = 'hello, world';
        yield senderAgent.basicMessages.sendMessage(senderConnection.id, message);
        const basicMessage = yield (0, helpers_1.waitForBasicMessage)(receiverAgent, {
            content: message,
        });
        expect(basicMessage.content).toBe(message);
        expect(senderAgent.isInitialized).toBe(true);
        yield senderAgent.shutdown();
        expect(senderAgent.isInitialized).toBe(false);
        yield senderAgent.initialize();
        expect(senderAgent.isInitialized).toBe(true);
    });
}
