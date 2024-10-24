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
exports.Agent = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const constants_1 = require("../constants");
const crypto_1 = require("../crypto");
const JwsService_1 = require("../crypto/JwsService");
const error_1 = require("../error");
const plugins_1 = require("../plugins");
const storage_1 = require("../storage");
const InMemoryMessageRepository_1 = require("../storage/InMemoryMessageRepository");
const AgentConfig_1 = require("./AgentConfig");
const AgentModules_1 = require("./AgentModules");
const BaseAgent_1 = require("./BaseAgent");
const Dispatcher_1 = require("./Dispatcher");
const EnvelopeService_1 = require("./EnvelopeService");
const EventEmitter_1 = require("./EventEmitter");
const Events_1 = require("./Events");
const FeatureRegistry_1 = require("./FeatureRegistry");
const MessageHandlerRegistry_1 = require("./MessageHandlerRegistry");
const MessageReceiver_1 = require("./MessageReceiver");
const MessageSender_1 = require("./MessageSender");
const TransportService_1 = require("./TransportService");
const context_1 = require("./context");
// Any makes sure you can use Agent as a type without always needing to specify the exact generics for the agent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class Agent extends BaseAgent_1.BaseAgent {
    constructor(options, dependencyManager = new plugins_1.DependencyManager()) {
        const agentConfig = new AgentConfig_1.AgentConfig(options.config, options.dependencies);
        const modulesWithDefaultModules = (0, AgentModules_1.extendModulesWithDefaultModules)(options.modules);
        // Register internal dependencies
        dependencyManager.registerSingleton(MessageHandlerRegistry_1.MessageHandlerRegistry);
        dependencyManager.registerSingleton(EventEmitter_1.EventEmitter);
        dependencyManager.registerSingleton(MessageSender_1.MessageSender);
        dependencyManager.registerSingleton(MessageReceiver_1.MessageReceiver);
        dependencyManager.registerSingleton(TransportService_1.TransportService);
        dependencyManager.registerSingleton(Dispatcher_1.Dispatcher);
        dependencyManager.registerSingleton(EnvelopeService_1.EnvelopeService);
        dependencyManager.registerSingleton(FeatureRegistry_1.FeatureRegistry);
        dependencyManager.registerSingleton(JwsService_1.JwsService);
        dependencyManager.registerSingleton(storage_1.DidCommMessageRepository);
        dependencyManager.registerSingleton(storage_1.StorageVersionRepository);
        dependencyManager.registerSingleton(storage_1.StorageUpdateService);
        // This is a really ugly hack to make tsyringe work without any SigningProviders registered
        // It is currently impossible to use @injectAll if there are no instances registered for the
        // token. We register a value of `default` by default and will filter that out in the registry.
        // Once we have a signing provider that should always be registered we can remove this. We can make an ed25519
        // signer using the @stablelib/ed25519 library.
        dependencyManager.registerInstance(crypto_1.SigningProviderToken, 'default');
        dependencyManager.registerInstance(AgentConfig_1.AgentConfig, agentConfig);
        dependencyManager.registerInstance(constants_1.InjectionSymbols.AgentDependencies, agentConfig.agentDependencies);
        dependencyManager.registerInstance(constants_1.InjectionSymbols.Stop$, new rxjs_1.Subject());
        dependencyManager.registerInstance(constants_1.InjectionSymbols.FileSystem, new agentConfig.agentDependencies.FileSystem());
        // Register all modules. This will also include the default modules
        dependencyManager.registerModules(modulesWithDefaultModules);
        // Register possibly already defined services
        if (!dependencyManager.isRegistered(constants_1.InjectionSymbols.Wallet)) {
            throw new error_1.AriesFrameworkError("Missing required dependency: 'Wallet'. You can register it using one of the provided modules such as the AskarModule or the IndySdkModule, or implement your own.");
        }
        if (!dependencyManager.isRegistered(constants_1.InjectionSymbols.Logger)) {
            dependencyManager.registerInstance(constants_1.InjectionSymbols.Logger, agentConfig.logger);
        }
        if (!dependencyManager.isRegistered(constants_1.InjectionSymbols.StorageService)) {
            throw new error_1.AriesFrameworkError("Missing required dependency: 'StorageService'. You can register it using one of the provided modules such as the AskarModule or the IndySdkModule, or implement your own.");
        }
        if (!dependencyManager.isRegistered(constants_1.InjectionSymbols.MessageRepository)) {
            dependencyManager.registerSingleton(constants_1.InjectionSymbols.MessageRepository, InMemoryMessageRepository_1.InMemoryMessageRepository);
        }
        // TODO: contextCorrelationId for base wallet
        // Bind the default agent context to the container for use in modules etc.
        dependencyManager.registerInstance(context_1.AgentContext, new context_1.AgentContext({
            dependencyManager,
            contextCorrelationId: 'default',
        }));
        // If no agent context provider has been registered we use the default agent context provider.
        if (!dependencyManager.isRegistered(constants_1.InjectionSymbols.AgentContextProvider)) {
            dependencyManager.registerSingleton(constants_1.InjectionSymbols.AgentContextProvider, context_1.DefaultAgentContextProvider);
        }
        super(agentConfig, dependencyManager);
    }
    registerInboundTransport(inboundTransport) {
        this.messageReceiver.registerInboundTransport(inboundTransport);
    }
    unregisterInboundTransport(inboundTransport) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.messageReceiver.unregisterInboundTransport(inboundTransport);
        });
    }
    get inboundTransports() {
        return this.messageReceiver.inboundTransports;
    }
    registerOutboundTransport(outboundTransport) {
        this.messageSender.registerOutboundTransport(outboundTransport);
    }
    unregisterOutboundTransport(outboundTransport) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.messageSender.unregisterOutboundTransport(outboundTransport);
        });
    }
    get outboundTransports() {
        return this.messageSender.outboundTransports;
    }
    get events() {
        return this.eventEmitter;
    }
    /**
     * Agent's feature registry
     */
    get features() {
        return this.featureRegistry;
    }
    initialize() {
        const _super = Object.create(null, {
            initialize: { get: () => super.initialize }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const stop$ = this.dependencyManager.resolve(constants_1.InjectionSymbols.Stop$);
            // Listen for new messages (either from transports or somewhere else in the framework / extensions)
            // We create this before doing any other initialization, so the initialization could already receive messages
            this.messageSubscription = this.eventEmitter
                .observable(Events_1.AgentEventTypes.AgentMessageReceived)
                .pipe((0, operators_1.takeUntil)(stop$), (0, operators_1.concatMap)((e) => this.messageReceiver
                .receiveMessage(e.payload.message, {
                connection: e.payload.connection,
                contextCorrelationId: e.payload.contextCorrelationId,
            })
                .catch((error) => {
                this.logger.error('Failed to process message', { error });
            })))
                .subscribe();
            yield _super.initialize.call(this);
            for (const [, module] of Object.entries(this.dependencyManager.registeredModules)) {
                if (module.initialize) {
                    yield module.initialize(this.agentContext);
                }
            }
            for (const transport of this.inboundTransports) {
                yield transport.start(this);
            }
            for (const transport of this.outboundTransports) {
                yield transport.start(this);
            }
            // Connect to mediator through provided invitation if provided in config
            // Also requests mediation ans sets as default mediator
            // Because this requires the connections module, we do this in the agent constructor
            if (this.mediationRecipient.config.mediatorInvitationUrl) {
                this.logger.debug('Provision mediation with invitation', {
                    mediatorInvitationUrl: this.mediationRecipient.config.mediatorInvitationUrl,
                });
                const mediationConnection = yield this.getMediationConnection(this.mediationRecipient.config.mediatorInvitationUrl);
                yield this.mediationRecipient.provision(mediationConnection);
            }
            yield this.mediator.initialize();
            yield this.mediationRecipient.initialize();
            this._isInitialized = true;
        });
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            const stop$ = this.dependencyManager.resolve(constants_1.InjectionSymbols.Stop$);
            // All observables use takeUntil with the stop$ observable
            // this means all observables will stop running if a value is emitted on this observable
            stop$.next(true);
            // Stop transports
            const allTransports = [...this.inboundTransports, ...this.outboundTransports];
            const transportPromises = allTransports.map((transport) => transport.stop());
            yield Promise.all(transportPromises);
            if (this.wallet.isInitialized) {
                yield this.wallet.close();
            }
            this._isInitialized = false;
        });
    }
    getMediationConnection(mediatorInvitationUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const outOfBandInvitation = yield this.oob.parseInvitation(mediatorInvitationUrl);
            const outOfBandRecord = yield this.oob.findByReceivedInvitationId(outOfBandInvitation.id);
            const [connection] = outOfBandRecord ? yield this.connections.findAllByOutOfBandId(outOfBandRecord.id) : [];
            if (!connection) {
                this.logger.debug('Mediation connection does not exist, creating connection');
                // We don't want to use the current default mediator when connecting to another mediator
                const routing = yield this.mediationRecipient.getRouting({ useDefaultMediator: false });
                this.logger.debug('Routing created', routing);
                const { connectionRecord: newConnection } = yield this.oob.receiveInvitation(outOfBandInvitation, {
                    routing,
                });
                this.logger.debug(`Mediation invitation processed`, { outOfBandInvitation });
                if (!newConnection) {
                    throw new error_1.AriesFrameworkError('No connection record to provision mediation.');
                }
                return this.connections.returnWhenIsConnected(newConnection.id);
            }
            if (!connection.isReady) {
                return this.connections.returnWhenIsConnected(connection.id);
            }
            return connection;
        });
    }
}
exports.Agent = Agent;
