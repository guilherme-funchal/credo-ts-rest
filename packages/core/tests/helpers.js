"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentDependencies = exports.taaAcceptanceMechanism = exports.taaVersion = exports.publicDidSeed = exports.genesisTransactions = exports.genesisPath = void 0;
exports.getAgentOptions = getAgentOptions;
exports.getPostgresAgentOptions = getPostgresAgentOptions;
exports.importExistingIndyDidFromPrivateKey = importExistingIndyDidFromPrivateKey;
exports.getAgentConfig = getAgentConfig;
exports.getAgentContext = getAgentContext;
exports.waitForProofExchangeRecord = waitForProofExchangeRecord;
exports.waitForProofExchangeRecordSubject = waitForProofExchangeRecordSubject;
exports.waitForTrustPingReceivedEvent = waitForTrustPingReceivedEvent;
exports.waitForTrustPingReceivedEventSubject = waitForTrustPingReceivedEventSubject;
exports.waitForTrustPingResponseReceivedEvent = waitForTrustPingResponseReceivedEvent;
exports.waitForTrustPingResponseReceivedEventSubject = waitForTrustPingResponseReceivedEventSubject;
exports.waitForCredentialRecordSubject = waitForCredentialRecordSubject;
exports.waitForCredentialRecord = waitForCredentialRecord;
exports.waitForConnectionRecordSubject = waitForConnectionRecordSubject;
exports.waitForConnectionRecord = waitForConnectionRecord;
exports.waitForBasicMessage = waitForBasicMessage;
exports.getMockConnection = getMockConnection;
exports.getMockOutOfBand = getMockOutOfBand;
exports.makeConnection = makeConnection;
exports.mockFunction = mockFunction;
exports.mockProperty = mockProperty;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const src_1 = require("../../node/src");
Object.defineProperty(exports, "agentDependencies", { enumerable: true, get: function () { return src_1.agentDependencies; } });
const src_2 = require("../src");
const crypto_1 = require("../src/crypto");
const key_1 = require("../src/modules/dids/methods/key");
const OutOfBandRole_1 = require("../src/modules/oob/domain/OutOfBandRole");
const OutOfBandState_1 = require("../src/modules/oob/domain/OutOfBandState");
const messages_1 = require("../src/modules/oob/messages");
const repository_1 = require("../src/modules/oob/repository");
const types_1 = require("../src/types");
const uuid_1 = require("../src/utils/uuid");
const logger_1 = __importStar(require("./logger"));
exports.genesisPath = process.env.GENESIS_TXN_PATH
    ? path_1.default.resolve(process.env.GENESIS_TXN_PATH)
    : path_1.default.join(__dirname, '../../../network/genesis/local-genesis.txn');
exports.genesisTransactions = (0, fs_1.readFileSync)(exports.genesisPath).toString('utf-8');
exports.publicDidSeed = (_a = process.env.TEST_AGENT_PUBLIC_DID_SEED) !== null && _a !== void 0 ? _a : '000000000000000000000000Trustee9';
exports.taaVersion = ((_b = process.env.TEST_AGENT_TAA_VERSION) !== null && _b !== void 0 ? _b : '1');
exports.taaAcceptanceMechanism = (_c = process.env.TEST_AGENT_TAA_ACCEPTANCE_MECHANISM) !== null && _c !== void 0 ? _c : 'accept';
function getAgentOptions(name, extraConfig = {}, inputModules) {
    var _a;
    const random = (0, uuid_1.uuid)().slice(0, 4);
    const config = Object.assign({ label: `Agent: ${name} - ${random}`, walletConfig: {
            id: `Wallet: ${name} - ${random}`,
            key: 'DZ9hPqFWTPxemcGea72C1X1nusqk5wFNLq6QPjwXGqAa', // generated using indy.generateWalletKey
            keyDerivationMethod: types_1.KeyDerivationMethod.Raw,
        }, 
        // TODO: determine the log level based on an environment variable. This will make it
        // possible to run e.g. failed github actions in debug mode for extra logs
        logger: logger_1.TestLogger.fromLogger(logger_1.default, name) }, extraConfig);
    const m = (inputModules !== null && inputModules !== void 0 ? inputModules : {});
    const modules = Object.assign(Object.assign({}, m), { 
        // Make sure connections module is always defined so we can set autoAcceptConnections
        connections: (_a = m.connections) !== null && _a !== void 0 ? _a : new src_2.ConnectionsModule({
            autoAcceptConnections: true,
        }) });
    return { config, modules: modules, dependencies: src_1.agentDependencies };
}
function getPostgresAgentOptions(name, extraConfig = {}, inputModules) {
    var _a;
    const random = (0, uuid_1.uuid)().slice(0, 4);
    const config = Object.assign({ label: `Agent: ${name} - ${random}`, walletConfig: {
            // NOTE: IndySDK Postgres database per wallet doesn't support special characters/spaces in the wallet name
            id: `PostgresWallet${name}${random}`,
            key: `Key${name}`,
            storage: {
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
            },
        }, autoUpdateStorageOnStartup: false, logger: logger_1.TestLogger.fromLogger(logger_1.default, name) }, extraConfig);
    const m = (inputModules !== null && inputModules !== void 0 ? inputModules : {});
    const modules = Object.assign(Object.assign({}, m), { 
        // Make sure connections module is always defined so we can set autoAcceptConnections
        connections: (_a = m.connections) !== null && _a !== void 0 ? _a : new src_2.ConnectionsModule({}) });
    modules.connections.config.autoAcceptConnections = true;
    return { config, dependencies: src_1.agentDependencies, modules: modules };
}
function importExistingIndyDidFromPrivateKey(agent, privateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = yield agent.wallet.createKey({
            keyType: crypto_1.KeyType.Ed25519,
            privateKey,
        });
        // did is first 16 bytes of public key encoded as base58
        const unqualifiedIndyDid = src_2.TypedArrayEncoder.toBase58(key.publicKey.slice(0, 16));
        // import the did in the wallet so it can be used
        yield agent.dids.import({ did: `did:indy:pool:localtest:${unqualifiedIndyDid}` });
        return unqualifiedIndyDid;
    });
}
function getAgentConfig(name, extraConfig = {}) {
    const { config, dependencies } = getAgentOptions(name, extraConfig);
    return new src_2.AgentConfig(config, dependencies);
}
function getAgentContext({ dependencyManager = new src_2.DependencyManager(), wallet, agentConfig, contextCorrelationId = 'mock', registerInstances = [], } = {}) {
    if (wallet)
        dependencyManager.registerInstance(src_2.InjectionSymbols.Wallet, wallet);
    if (agentConfig)
        dependencyManager.registerInstance(src_2.AgentConfig, agentConfig);
    // Register custom instances on the dependency manager
    for (const [token, instance] of registerInstances.values()) {
        dependencyManager.registerInstance(token, instance);
    }
    return new src_2.AgentContext({ dependencyManager, contextCorrelationId });
}
function waitForProofExchangeRecord(agent, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const observable = agent.events.observable(src_2.ProofEventTypes.ProofStateChanged);
        return waitForProofExchangeRecordSubject(observable, options);
    });
}
const isProofStateChangedEvent = (e) => e.type === src_2.ProofEventTypes.ProofStateChanged;
const isCredentialStateChangedEvent = (e) => e.type === src_2.CredentialEventTypes.CredentialStateChanged;
const isConnectionStateChangedEvent = (e) => e.type === src_2.ConnectionEventTypes.ConnectionStateChanged;
const isTrustPingReceivedEvent = (e) => e.type === src_2.TrustPingEventTypes.TrustPingReceivedEvent;
const isTrustPingResponseReceivedEvent = (e) => e.type === src_2.TrustPingEventTypes.TrustPingResponseReceivedEvent;
function waitForProofExchangeRecordSubject(subject, { threadId, parentThreadId, state, previousState, timeoutMs = 10000, count = 1, }) {
    const observable = subject instanceof rxjs_1.ReplaySubject ? subject.asObservable() : subject;
    return (0, rxjs_1.lastValueFrom)(observable.pipe((0, operators_1.filter)(isProofStateChangedEvent), (0, operators_1.filter)((e) => previousState === undefined || e.payload.previousState === previousState), (0, operators_1.filter)((e) => threadId === undefined || e.payload.proofRecord.threadId === threadId), (0, operators_1.filter)((e) => parentThreadId === undefined || e.payload.proofRecord.parentThreadId === parentThreadId), (0, operators_1.filter)((e) => state === undefined || e.payload.proofRecord.state === state), (0, operators_1.timeout)(timeoutMs), (0, operators_1.catchError)(() => {
        throw new Error(`ProofStateChangedEvent event not emitted within specified timeout: ${timeoutMs}
          previousState: ${previousState},
          threadId: ${threadId},
          parentThreadId: ${parentThreadId},
          state: ${state}
        }`);
    }), (0, operators_1.take)(count), (0, operators_1.map)((e) => e.payload.proofRecord)));
}
function waitForTrustPingReceivedEvent(agent, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const observable = agent.events.observable(src_2.TrustPingEventTypes.TrustPingReceivedEvent);
        return waitForTrustPingReceivedEventSubject(observable, options);
    });
}
function waitForTrustPingReceivedEventSubject(subject, { threadId, timeoutMs = 10000, }) {
    const observable = subject instanceof rxjs_1.ReplaySubject ? subject.asObservable() : subject;
    return (0, rxjs_1.firstValueFrom)(observable.pipe((0, operators_1.filter)(isTrustPingReceivedEvent), (0, operators_1.filter)((e) => threadId === undefined || e.payload.message.threadId === threadId), (0, operators_1.timeout)(timeoutMs), (0, operators_1.catchError)(() => {
        throw new Error(`TrustPingReceivedEvent event not emitted within specified timeout: ${timeoutMs}
  threadId: ${threadId},
}`);
    }), (0, operators_1.map)((e) => e.payload.message)));
}
function waitForTrustPingResponseReceivedEvent(agent, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const observable = agent.events.observable(src_2.TrustPingEventTypes.TrustPingResponseReceivedEvent);
        return waitForTrustPingResponseReceivedEventSubject(observable, options);
    });
}
function waitForTrustPingResponseReceivedEventSubject(subject, { threadId, timeoutMs = 10000, }) {
    const observable = subject instanceof rxjs_1.ReplaySubject ? subject.asObservable() : subject;
    return (0, rxjs_1.firstValueFrom)(observable.pipe((0, operators_1.filter)(isTrustPingResponseReceivedEvent), (0, operators_1.filter)((e) => threadId === undefined || e.payload.message.threadId === threadId), (0, operators_1.timeout)(timeoutMs), (0, operators_1.catchError)(() => {
        throw new Error(`TrustPingResponseReceivedEvent event not emitted within specified timeout: ${timeoutMs}
  threadId: ${threadId},
}`);
    }), (0, operators_1.map)((e) => e.payload.message)));
}
function waitForCredentialRecordSubject(subject, { threadId, state, previousState, timeoutMs = 15000, // sign and store credential in W3c credential protocols take several seconds
 }) {
    const observable = subject instanceof rxjs_1.ReplaySubject ? subject.asObservable() : subject;
    return (0, rxjs_1.firstValueFrom)(observable.pipe((0, operators_1.filter)(isCredentialStateChangedEvent), (0, operators_1.filter)((e) => previousState === undefined || e.payload.previousState === previousState), (0, operators_1.filter)((e) => threadId === undefined || e.payload.credentialRecord.threadId === threadId), (0, operators_1.filter)((e) => state === undefined || e.payload.credentialRecord.state === state), (0, operators_1.timeout)(timeoutMs), (0, operators_1.catchError)(() => {
        throw new Error(`CredentialStateChanged event not emitted within specified timeout: {
  previousState: ${previousState},
  threadId: ${threadId},
  state: ${state}
}`);
    }), (0, operators_1.map)((e) => e.payload.credentialRecord)));
}
function waitForCredentialRecord(agent, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const observable = agent.events.observable(src_2.CredentialEventTypes.CredentialStateChanged);
        return waitForCredentialRecordSubject(observable, options);
    });
}
function waitForConnectionRecordSubject(subject, { threadId, state, previousState, timeoutMs = 15000, // sign and store credential in W3c credential protocols take several seconds
 }) {
    const observable = subject instanceof rxjs_1.ReplaySubject ? subject.asObservable() : subject;
    return (0, rxjs_1.firstValueFrom)(observable.pipe((0, operators_1.filter)(isConnectionStateChangedEvent), (0, operators_1.filter)((e) => previousState === undefined || e.payload.previousState === previousState), (0, operators_1.filter)((e) => threadId === undefined || e.payload.connectionRecord.threadId === threadId), (0, operators_1.filter)((e) => state === undefined || e.payload.connectionRecord.state === state), (0, operators_1.timeout)(timeoutMs), (0, operators_1.catchError)(() => {
        throw new Error(`ConnectionStateChanged event not emitted within specified timeout: {
  previousState: ${previousState},
  threadId: ${threadId},
  state: ${state}
}`);
    }), (0, operators_1.map)((e) => e.payload.connectionRecord)));
}
function waitForConnectionRecord(agent, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const observable = agent.events.observable(src_2.ConnectionEventTypes.ConnectionStateChanged);
        return waitForConnectionRecordSubject(observable, options);
    });
}
function waitForBasicMessage(agent_1, _a) {
    return __awaiter(this, arguments, void 0, function* (agent, { content }) {
        return new Promise((resolve) => {
            const listener = (event) => {
                const contentMatches = content === undefined || event.payload.message.content === content;
                if (contentMatches) {
                    agent.events.off(src_2.BasicMessageEventTypes.BasicMessageStateChanged, listener);
                    resolve(event.payload.message);
                }
            };
            agent.events.on(src_2.BasicMessageEventTypes.BasicMessageStateChanged, listener);
        });
    });
}
function getMockConnection({ state = src_2.DidExchangeState.InvitationReceived, role = src_2.DidExchangeRole.Requester, id = 'test', did = 'test-did', threadId = 'threadId', tags = {}, theirLabel, theirDid = 'their-did', } = {}) {
    return new src_2.ConnectionRecord({
        did,
        threadId,
        theirDid,
        id,
        role,
        state,
        tags,
        theirLabel,
    });
}
function getMockOutOfBand({ label, serviceEndpoint, recipientKeys = [
    new key_1.DidKey(crypto_1.Key.fromPublicKeyBase58('ByHnpUCFb1vAfh9CFZ8ZkmUZguURW8nSw889hy6rD8L7', crypto_1.KeyType.Ed25519)).did,
], mediatorId, role, state, reusable, reuseConnectionId, imageUrl, } = {}) {
    const options = {
        label: label !== null && label !== void 0 ? label : 'label',
        imageUrl: imageUrl !== null && imageUrl !== void 0 ? imageUrl : undefined,
        accept: ['didcomm/aip1', 'didcomm/aip2;env=rfc19'],
        handshakeProtocols: [src_2.HandshakeProtocol.DidExchange],
        services: [
            new src_2.OutOfBandDidCommService({
                id: `#inline-0`,
                serviceEndpoint: serviceEndpoint !== null && serviceEndpoint !== void 0 ? serviceEndpoint : 'http://example.com',
                recipientKeys,
                routingKeys: [],
            }),
        ],
    };
    const outOfBandInvitation = new messages_1.OutOfBandInvitation(options);
    const outOfBandRecord = new repository_1.OutOfBandRecord({
        mediatorId,
        role: role || OutOfBandRole_1.OutOfBandRole.Receiver,
        state: state || OutOfBandState_1.OutOfBandState.Initial,
        outOfBandInvitation: outOfBandInvitation,
        reusable,
        reuseConnectionId,
        tags: {
            recipientKeyFingerprints: recipientKeys.map((didKey) => key_1.DidKey.fromDid(didKey).key.fingerprint),
        },
    });
    return outOfBandRecord;
}
function makeConnection(agentA, agentB) {
    return __awaiter(this, void 0, void 0, function* () {
        const agentAOutOfBand = yield agentA.oob.createInvitation({
            handshakeProtocols: [src_2.HandshakeProtocol.Connections],
        });
        let { connectionRecord: agentBConnection } = yield agentB.oob.receiveInvitation(agentAOutOfBand.outOfBandInvitation);
        agentBConnection = yield agentB.connections.returnWhenIsConnected(agentBConnection.id);
        let [agentAConnection] = yield agentA.connections.findAllByOutOfBandId(agentAOutOfBand.id);
        agentAConnection = yield agentA.connections.returnWhenIsConnected(agentAConnection.id);
        return [agentAConnection, agentBConnection];
    });
}
/**
 * Returns mock of function with correct type annotations according to original function `fn`.
 * It can be used also for class methods.
 *
 * @param fn function you want to mock
 * @returns mock function with type annotations
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockFunction(fn) {
    return fn;
}
/**
 * Set a property using a getter value on a mocked oject.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function mockProperty(object, property, value) {
    Object.defineProperty(object, property, { get: () => value });
}
