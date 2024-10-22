"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const setupIndySdkModule_1 = require("../../../../indy-sdk/tests/setupIndySdkModule");
const helpers_1 = require("../../../tests/helpers");
const constants_1 = require("../../constants");
const basic_messages_1 = require("../../modules/basic-messages");
const BasicMessagesApi_1 = require("../../modules/basic-messages/BasicMessagesApi");
const ConnectionsApi_1 = require("../../modules/connections/ConnectionsApi");
const ConnectionRepository_1 = require("../../modules/connections/repository/ConnectionRepository");
const ConnectionService_1 = require("../../modules/connections/services/ConnectionService");
const TrustPingService_1 = require("../../modules/connections/services/TrustPingService");
const credentials_1 = require("../../modules/credentials");
const CredentialsApi_1 = require("../../modules/credentials/CredentialsApi");
const message_p_ckup_1 = require("../../modules/message-p\u00ECckup");
const proofs_1 = require("../../modules/proofs");
const ProofsApi_1 = require("../../modules/proofs/ProofsApi");
const routing_1 = require("../../modules/routing");
const InMemoryMessageRepository_1 = require("../../storage/InMemoryMessageRepository");
const error_1 = require("../../wallet/error");
const Agent_1 = require("../Agent");
const Dispatcher_1 = require("../Dispatcher");
const EnvelopeService_1 = require("../EnvelopeService");
const FeatureRegistry_1 = require("../FeatureRegistry");
const MessageReceiver_1 = require("../MessageReceiver");
const MessageSender_1 = require("../MessageSender");
const agentOptions = (0, helpers_1.getAgentOptions)('Agent Class Test', {}, (0, setupIndySdkModule_1.getIndySdkModules)());
const myModuleMethod = jest.fn();
let MyApi = (() => {
    let _classDecorators = [(0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MyApi = _classThis = class {
        constructor() {
            this.myModuleMethod = myModuleMethod;
        }
    };
    __setFunctionName(_classThis, "MyApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MyApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MyApi = _classThis;
})();
class MyModule {
    constructor() {
        this.api = MyApi;
    }
    register(dependencyManager) {
        dependencyManager.registerContextScoped(MyApi);
    }
}
describe('Agent', () => {
    describe('Module registration', () => {
        test('does not return default modules on modules key if no modules were provided', () => {
            const agent = new Agent_1.Agent(agentOptions);
            expect(agent.modules).toEqual({});
        });
        test('registers custom and default modules if custom modules are provided', () => {
            const agent = new Agent_1.Agent(Object.assign(Object.assign({}, agentOptions), { modules: Object.assign({ myModule: new MyModule() }, (0, setupIndySdkModule_1.getIndySdkModules)()) }));
            expect(agent.modules.myModule.myModuleMethod).toBe(myModuleMethod);
            expect(agent.modules).toEqual({
                myModule: expect.any(MyApi),
            });
        });
        test('override default module configuration', () => {
            const agent = new Agent_1.Agent(Object.assign(Object.assign({}, agentOptions), { modules: Object.assign({ myModule: new MyModule(), mediationRecipient: new routing_1.MediationRecipientModule({
                        maximumMessagePickup: 42,
                    }) }, (0, setupIndySdkModule_1.getIndySdkModules)()) }));
            // Should be custom module config property, not the default value
            expect(agent.mediationRecipient.config.maximumMessagePickup).toBe(42);
            expect(agent.modules).toEqual({
                myModule: expect.any(MyApi),
            });
        });
    });
    describe('Initialization', () => {
        let agent;
        afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const wallet = agent.context.wallet;
            if (wallet.isInitialized) {
                yield wallet.delete();
            }
        }));
        it('isInitialized should only return true after initialization', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(2);
            agent = new Agent_1.Agent(agentOptions);
            expect(agent.isInitialized).toBe(false);
            yield agent.initialize();
            expect(agent.isInitialized).toBe(true);
        }));
        it('wallet isInitialized should return true after agent initialization if wallet config is set in agent constructor', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(4);
            agent = new Agent_1.Agent(agentOptions);
            const wallet = agent.context.wallet;
            expect(agent.isInitialized).toBe(false);
            expect(wallet.isInitialized).toBe(false);
            yield agent.initialize();
            expect(agent.isInitialized).toBe(true);
            expect(wallet.isInitialized).toBe(true);
        }));
        it('wallet must be initialized if wallet config is not set before agent can be initialized', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(9);
            const _a = agentOptions.config, { walletConfig } = _a, withoutWalletConfig = __rest(_a, ["walletConfig"]);
            agent = new Agent_1.Agent(Object.assign(Object.assign({}, agentOptions), { config: withoutWalletConfig }));
            expect(agent.isInitialized).toBe(false);
            expect(agent.wallet.isInitialized).toBe(false);
            expect(agent.initialize()).rejects.toThrowError(error_1.WalletError);
            expect(agent.isInitialized).toBe(false);
            expect(agent.wallet.isInitialized).toBe(false);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            yield agent.wallet.initialize(walletConfig);
            expect(agent.isInitialized).toBe(false);
            expect(agent.wallet.isInitialized).toBe(true);
            yield agent.initialize();
            expect(agent.wallet.isInitialized).toBe(true);
            expect(agent.isInitialized).toBe(true);
        }));
    });
    describe('Dependency Injection', () => {
        it('should be able to resolve registered instances', () => {
            const agent = new Agent_1.Agent(agentOptions);
            const container = agent.dependencyManager;
            // Modules
            expect(container.resolve(ConnectionsApi_1.ConnectionsApi)).toBeInstanceOf(ConnectionsApi_1.ConnectionsApi);
            expect(container.resolve(ConnectionService_1.ConnectionService)).toBeInstanceOf(ConnectionService_1.ConnectionService);
            expect(container.resolve(ConnectionRepository_1.ConnectionRepository)).toBeInstanceOf(ConnectionRepository_1.ConnectionRepository);
            expect(container.resolve(TrustPingService_1.TrustPingService)).toBeInstanceOf(TrustPingService_1.TrustPingService);
            expect(container.resolve(ProofsApi_1.ProofsApi)).toBeInstanceOf(ProofsApi_1.ProofsApi);
            expect(container.resolve(proofs_1.ProofRepository)).toBeInstanceOf(proofs_1.ProofRepository);
            expect(container.resolve(CredentialsApi_1.CredentialsApi)).toBeInstanceOf(CredentialsApi_1.CredentialsApi);
            expect(container.resolve(credentials_1.CredentialRepository)).toBeInstanceOf(credentials_1.CredentialRepository);
            expect(container.resolve(BasicMessagesApi_1.BasicMessagesApi)).toBeInstanceOf(BasicMessagesApi_1.BasicMessagesApi);
            expect(container.resolve(basic_messages_1.BasicMessageService)).toBeInstanceOf(basic_messages_1.BasicMessageService);
            expect(container.resolve(basic_messages_1.BasicMessageRepository)).toBeInstanceOf(basic_messages_1.BasicMessageRepository);
            expect(container.resolve(routing_1.MediatorApi)).toBeInstanceOf(routing_1.MediatorApi);
            expect(container.resolve(routing_1.MediationRecipientApi)).toBeInstanceOf(routing_1.MediationRecipientApi);
            expect(container.resolve(message_p_ckup_1.MessagePickupApi)).toBeInstanceOf(message_p_ckup_1.MessagePickupApi);
            expect(container.resolve(routing_1.MediationRepository)).toBeInstanceOf(routing_1.MediationRepository);
            expect(container.resolve(routing_1.MediatorService)).toBeInstanceOf(routing_1.MediatorService);
            expect(container.resolve(routing_1.MediationRecipientService)).toBeInstanceOf(routing_1.MediationRecipientService);
            // Symbols, interface based
            expect(container.resolve(constants_1.InjectionSymbols.Logger)).toBe(agentOptions.config.logger);
            expect(container.resolve(constants_1.InjectionSymbols.MessageRepository)).toBeInstanceOf(InMemoryMessageRepository_1.InMemoryMessageRepository);
            // Agent
            expect(container.resolve(MessageSender_1.MessageSender)).toBeInstanceOf(MessageSender_1.MessageSender);
            expect(container.resolve(MessageReceiver_1.MessageReceiver)).toBeInstanceOf(MessageReceiver_1.MessageReceiver);
            expect(container.resolve(Dispatcher_1.Dispatcher)).toBeInstanceOf(Dispatcher_1.Dispatcher);
            expect(container.resolve(EnvelopeService_1.EnvelopeService)).toBeInstanceOf(EnvelopeService_1.EnvelopeService);
        });
        it('should return the same instance for consequent resolves', () => {
            const agent = new Agent_1.Agent(agentOptions);
            const container = agent.dependencyManager;
            // Modules
            expect(container.resolve(ConnectionsApi_1.ConnectionsApi)).toBe(container.resolve(ConnectionsApi_1.ConnectionsApi));
            expect(container.resolve(ConnectionService_1.ConnectionService)).toBe(container.resolve(ConnectionService_1.ConnectionService));
            expect(container.resolve(ConnectionRepository_1.ConnectionRepository)).toBe(container.resolve(ConnectionRepository_1.ConnectionRepository));
            expect(container.resolve(TrustPingService_1.TrustPingService)).toBe(container.resolve(TrustPingService_1.TrustPingService));
            expect(container.resolve(ProofsApi_1.ProofsApi)).toBe(container.resolve(ProofsApi_1.ProofsApi));
            expect(container.resolve(proofs_1.ProofRepository)).toBe(container.resolve(proofs_1.ProofRepository));
            expect(container.resolve(CredentialsApi_1.CredentialsApi)).toBe(container.resolve(CredentialsApi_1.CredentialsApi));
            expect(container.resolve(credentials_1.CredentialRepository)).toBe(container.resolve(credentials_1.CredentialRepository));
            expect(container.resolve(BasicMessagesApi_1.BasicMessagesApi)).toBe(container.resolve(BasicMessagesApi_1.BasicMessagesApi));
            expect(container.resolve(basic_messages_1.BasicMessageService)).toBe(container.resolve(basic_messages_1.BasicMessageService));
            expect(container.resolve(basic_messages_1.BasicMessageRepository)).toBe(container.resolve(basic_messages_1.BasicMessageRepository));
            expect(container.resolve(routing_1.MediatorApi)).toBe(container.resolve(routing_1.MediatorApi));
            expect(container.resolve(routing_1.MediationRecipientApi)).toBe(container.resolve(routing_1.MediationRecipientApi));
            expect(container.resolve(message_p_ckup_1.MessagePickupApi)).toBe(container.resolve(message_p_ckup_1.MessagePickupApi));
            expect(container.resolve(routing_1.MediationRepository)).toBe(container.resolve(routing_1.MediationRepository));
            expect(container.resolve(routing_1.MediatorService)).toBe(container.resolve(routing_1.MediatorService));
            expect(container.resolve(routing_1.MediationRecipientService)).toBe(container.resolve(routing_1.MediationRecipientService));
            // Symbols, interface based
            expect(container.resolve(constants_1.InjectionSymbols.Logger)).toBe(container.resolve(constants_1.InjectionSymbols.Logger));
            expect(container.resolve(constants_1.InjectionSymbols.MessageRepository)).toBe(container.resolve(constants_1.InjectionSymbols.MessageRepository));
            expect(container.resolve(constants_1.InjectionSymbols.StorageService)).toBe(container.resolve(constants_1.InjectionSymbols.StorageService));
            // Agent
            expect(container.resolve(MessageSender_1.MessageSender)).toBe(container.resolve(MessageSender_1.MessageSender));
            expect(container.resolve(MessageReceiver_1.MessageReceiver)).toBe(container.resolve(MessageReceiver_1.MessageReceiver));
            expect(container.resolve(Dispatcher_1.Dispatcher)).toBe(container.resolve(Dispatcher_1.Dispatcher));
            expect(container.resolve(FeatureRegistry_1.FeatureRegistry)).toBe(container.resolve(FeatureRegistry_1.FeatureRegistry));
            expect(container.resolve(EnvelopeService_1.EnvelopeService)).toBe(container.resolve(EnvelopeService_1.EnvelopeService));
        });
    });
    it('all core features are properly registered', () => {
        const agent = new Agent_1.Agent(agentOptions);
        const registry = agent.dependencyManager.resolve(FeatureRegistry_1.FeatureRegistry);
        const protocols = registry.query({ featureType: 'protocol', match: '*' }).map((p) => p.id);
        expect(protocols).toEqual(expect.arrayContaining([
            'https://didcomm.org/basicmessage/1.0',
            'https://didcomm.org/connections/1.0',
            'https://didcomm.org/coordinate-mediation/1.0',
            'https://didcomm.org/issue-credential/2.0',
            'https://didcomm.org/present-proof/2.0',
            'https://didcomm.org/didexchange/1.0',
            'https://didcomm.org/discover-features/1.0',
            'https://didcomm.org/discover-features/2.0',
            'https://didcomm.org/messagepickup/1.0',
            'https://didcomm.org/messagepickup/2.0',
            'https://didcomm.org/out-of-band/1.1',
            'https://didcomm.org/revocation_notification/1.0',
            'https://didcomm.org/revocation_notification/2.0',
        ]));
        expect(protocols.length).toEqual(13);
    });
});
