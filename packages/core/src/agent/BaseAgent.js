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
exports.BaseAgent = void 0;
const error_1 = require("../error");
const basic_messages_1 = require("../modules/basic-messages");
const connections_1 = require("../modules/connections");
const credentials_1 = require("../modules/credentials");
const dids_1 = require("../modules/dids");
const discover_features_1 = require("../modules/discover-features");
const generic_records_1 = require("../modules/generic-records");
const MessagePickupApi_1 = require("../modules/message-p\u00ECckup/MessagePickupApi");
const oob_1 = require("../modules/oob");
const proofs_1 = require("../modules/proofs");
const routing_1 = require("../modules/routing");
const W3cCredentialsApi_1 = require("../modules/vc/W3cCredentialsApi");
const storage_1 = require("../storage");
const UpdateAssistant_1 = require("../storage/migration/UpdateAssistant");
const updates_1 = require("../storage/migration/updates");
const wallet_1 = require("../wallet");
const error_2 = require("../wallet/error");
const AgentModules_1 = require("./AgentModules");
const EventEmitter_1 = require("./EventEmitter");
const FeatureRegistry_1 = require("./FeatureRegistry");
const MessageReceiver_1 = require("./MessageReceiver");
const MessageSender_1 = require("./MessageSender");
const TransportService_1 = require("./TransportService");
const context_1 = require("./context");
class BaseAgent {
    constructor(agentConfig, dependencyManager) {
        this._isInitialized = false;
        this.dependencyManager = dependencyManager;
        this.agentConfig = agentConfig;
        this.logger = this.agentConfig.logger;
        this.logger.info('Creating agent with config', {
            agentConfig: agentConfig.toJSON(),
        });
        if (!this.agentConfig.walletConfig) {
            this.logger.warn('Wallet config has not been set on the agent config. ' +
                'Make sure to initialize the wallet yourself before initializing the agent, ' +
                'or provide the required wallet configuration in the agent constructor');
        }
        // Resolve instances after everything is registered
        this.eventEmitter = this.dependencyManager.resolve(EventEmitter_1.EventEmitter);
        this.featureRegistry = this.dependencyManager.resolve(FeatureRegistry_1.FeatureRegistry);
        this.messageSender = this.dependencyManager.resolve(MessageSender_1.MessageSender);
        this.messageReceiver = this.dependencyManager.resolve(MessageReceiver_1.MessageReceiver);
        this.transportService = this.dependencyManager.resolve(TransportService_1.TransportService);
        this.agentContext = this.dependencyManager.resolve(context_1.AgentContext);
        this.connections = this.dependencyManager.resolve(connections_1.ConnectionsApi);
        this.credentials = this.dependencyManager.resolve(credentials_1.CredentialsApi);
        this.proofs = this.dependencyManager.resolve(proofs_1.ProofsApi);
        this.mediator = this.dependencyManager.resolve(routing_1.MediatorApi);
        this.mediationRecipient = this.dependencyManager.resolve(routing_1.MediationRecipientApi);
        this.messagePickup = this.dependencyManager.resolve(MessagePickupApi_1.MessagePickupApi);
        this.basicMessages = this.dependencyManager.resolve(basic_messages_1.BasicMessagesApi);
        this.genericRecords = this.dependencyManager.resolve(generic_records_1.GenericRecordsApi);
        this.discovery = this.dependencyManager.resolve(discover_features_1.DiscoverFeaturesApi);
        this.dids = this.dependencyManager.resolve(dids_1.DidsApi);
        this.wallet = this.dependencyManager.resolve(wallet_1.WalletApi);
        this.oob = this.dependencyManager.resolve(oob_1.OutOfBandApi);
        this.w3cCredentials = this.dependencyManager.resolve(W3cCredentialsApi_1.W3cCredentialsApi);
        const defaultApis = [
            this.connections,
            this.credentials,
            this.proofs,
            this.mediator,
            this.mediationRecipient,
            this.messagePickup,
            this.basicMessages,
            this.genericRecords,
            this.discovery,
            this.dids,
            this.wallet,
            this.oob,
            this.w3cCredentials,
        ];
        // Set the api of the registered modules on the agent, excluding the default apis
        this.modules = (0, AgentModules_1.getAgentApi)(this.dependencyManager, defaultApis);
    }
    get isInitialized() {
        return this._isInitialized && this.wallet.isInitialized;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { walletConfig } = this.agentConfig;
            if (this._isInitialized) {
                throw new error_1.AriesFrameworkError('Agent already initialized. Currently it is not supported to re-initialize an already initialized agent.');
            }
            if (!this.wallet.isInitialized && walletConfig) {
                yield this.wallet.initialize(walletConfig);
            }
            else if (!this.wallet.isInitialized) {
                throw new error_2.WalletError('Wallet config has not been set on the agent config. ' +
                    'Make sure to initialize the wallet yourself before initializing the agent, ' +
                    'or provide the required wallet configuration in the agent constructor');
            }
            // Make sure the storage is up to date
            const storageUpdateService = this.dependencyManager.resolve(storage_1.StorageUpdateService);
            const isStorageUpToDate = yield storageUpdateService.isUpToDate(this.agentContext);
            this.logger.info(`Agent storage is ${isStorageUpToDate ? '' : 'not '}up to date.`);
            if (!isStorageUpToDate && this.agentConfig.autoUpdateStorageOnStartup) {
                const updateAssistant = new UpdateAssistant_1.UpdateAssistant(this, updates_1.DEFAULT_UPDATE_CONFIG);
                yield updateAssistant.initialize();
                yield updateAssistant.update();
            }
            else if (!isStorageUpToDate) {
                const currentVersion = yield storageUpdateService.getCurrentStorageVersion(this.agentContext);
                // Close wallet to prevent un-initialized agent with initialized wallet
                yield this.wallet.close();
                throw new error_1.AriesFrameworkError(
                // TODO: add link to where documentation on how to update can be found.
                `Current agent storage is not up to date. ` +
                    `To prevent the framework state from getting corrupted the agent initialization is aborted. ` +
                    `Make sure to update the agent storage (currently at ${currentVersion}) to the latest version (${UpdateAssistant_1.UpdateAssistant.frameworkStorageVersion}). ` +
                    `You can also downgrade your version of Aries Framework JavaScript.`);
            }
        });
    }
    /**
     * Receive a message.
     *
     * @deprecated Use {@link OutOfBandApi.receiveInvitationFromUrl} instead for receiving legacy connection-less messages.
     * For receiving messages that originated from a transport, use the {@link MessageReceiver}
     * for this. The `receiveMessage` method on the `Agent` class will associate the current context to the message, which
     * may not be what should happen (e.g. in case of multi tenancy).
     */
    receiveMessage(inboundMessage, session) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.messageReceiver.receiveMessage(inboundMessage, {
                session,
                contextCorrelationId: this.agentContext.contextCorrelationId,
            });
        });
    }
    get config() {
        return this.agentConfig;
    }
    get context() {
        return this.agentContext;
    }
}
exports.BaseAgent = BaseAgent;
