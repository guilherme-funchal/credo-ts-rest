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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediationRecipientService = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const Events_1 = require("../../../agent/Events");
const models_1 = require("../../../agent/models");
const crypto_1 = require("../../../crypto");
const error_1 = require("../../../error");
const plugins_1 = require("../../../plugins");
const ConnectionType_1 = require("../../connections/models/ConnectionType");
const ConnectionMetadataTypes_1 = require("../../connections/repository/ConnectionMetadataTypes");
const dids_1 = require("../../dids");
const helpers_1 = require("../../dids/helpers");
const RoutingEvents_1 = require("../RoutingEvents");
const messages_1 = require("../messages");
const KeylistUpdateMessage_1 = require("../messages/KeylistUpdateMessage");
const models_2 = require("../models");
const MediationRecord_1 = require("../repository/MediationRecord");
let MediationRecipientService = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MediationRecipientService = _classThis = class {
        constructor(connectionService, messageSender, mediatorRepository, eventEmitter) {
            this.mediationRepository = mediatorRepository;
            this.eventEmitter = eventEmitter;
            this.connectionService = connectionService;
            this.messageSender = messageSender;
        }
        createRequest(agentContext, connection) {
            return __awaiter(this, void 0, void 0, function* () {
                const message = new messages_1.MediationRequestMessage({});
                const mediationRecord = new MediationRecord_1.MediationRecord({
                    threadId: message.threadId,
                    state: models_2.MediationState.Requested,
                    role: models_2.MediationRole.Recipient,
                    connectionId: connection.id,
                });
                yield this.connectionService.addConnectionType(agentContext, connection, ConnectionType_1.ConnectionType.Mediator);
                yield this.mediationRepository.save(agentContext, mediationRecord);
                this.emitStateChangedEvent(agentContext, mediationRecord, null);
                return { mediationRecord, message };
            });
        }
        processMediationGrant(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                // Assert ready connection
                const connection = messageContext.assertReadyConnection();
                // Mediation record must already exists to be updated to granted status
                const mediationRecord = yield this.mediationRepository.getByConnectionId(messageContext.agentContext, connection.id);
                // Assert
                mediationRecord.assertState(models_2.MediationState.Requested);
                mediationRecord.assertRole(models_2.MediationRole.Recipient);
                // Update record
                mediationRecord.endpoint = messageContext.message.endpoint;
                // Update connection metadata to use their key format in further protocol messages
                const connectionUsesDidKey = messageContext.message.routingKeys.some(helpers_1.isDidKey);
                yield this.updateUseDidKeysFlag(messageContext.agentContext, connection, messages_1.MediationGrantMessage.type.protocolUri, connectionUsesDidKey);
                // According to RFC 0211 keys should be a did key, but base58 encoded verkey was used before
                // RFC was accepted. This converts the key to a public key base58 if it is a did key.
                mediationRecord.routingKeys = messageContext.message.routingKeys.map(helpers_1.didKeyToVerkey);
                return yield this.updateState(messageContext.agentContext, mediationRecord, models_2.MediationState.Granted);
            });
        }
        processKeylistUpdateResults(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                // Assert ready connection
                const connection = messageContext.assertReadyConnection();
                const mediationRecord = yield this.mediationRepository.getByConnectionId(messageContext.agentContext, connection.id);
                // Assert
                mediationRecord.assertReady();
                mediationRecord.assertRole(models_2.MediationRole.Recipient);
                const keylist = messageContext.message.updated;
                // Update connection metadata to use their key format in further protocol messages
                const connectionUsesDidKey = keylist.some((key) => (0, helpers_1.isDidKey)(key.recipientKey));
                yield this.updateUseDidKeysFlag(messageContext.agentContext, connection, messages_1.KeylistUpdateResponseMessage.type.protocolUri, connectionUsesDidKey);
                // update keylist in mediationRecord
                for (const update of keylist) {
                    if (update.action === messages_1.KeylistUpdateAction.add) {
                        mediationRecord.addRecipientKey((0, helpers_1.didKeyToVerkey)(update.recipientKey));
                    }
                    else if (update.action === messages_1.KeylistUpdateAction.remove) {
                        mediationRecord.removeRecipientKey((0, helpers_1.didKeyToVerkey)(update.recipientKey));
                    }
                }
                yield this.mediationRepository.update(messageContext.agentContext, mediationRecord);
                this.eventEmitter.emit(messageContext.agentContext, {
                    type: RoutingEvents_1.RoutingEventTypes.RecipientKeylistUpdated,
                    payload: {
                        mediationRecord,
                        keylist,
                    },
                });
            });
        }
        keylistUpdateAndAwait(agentContext_1, mediationRecord_1, updates_1) {
            return __awaiter(this, arguments, void 0, function* (agentContext, mediationRecord, updates, timeoutMs = 15000 // TODO: this should be a configurable value in agent config
            ) {
                var _a;
                const connection = yield this.connectionService.getById(agentContext, mediationRecord.connectionId);
                // Use our useDidKey configuration unless we know the key formatting other party is using
                let useDidKey = agentContext.config.useDidKeyInProtocols;
                const useDidKeysConnectionMetadata = connection.metadata.get(ConnectionMetadataTypes_1.ConnectionMetadataKeys.UseDidKeysForProtocol);
                if (useDidKeysConnectionMetadata) {
                    useDidKey = (_a = useDidKeysConnectionMetadata[KeylistUpdateMessage_1.KeylistUpdateMessage.type.protocolUri]) !== null && _a !== void 0 ? _a : useDidKey;
                }
                const message = this.createKeylistUpdateMessage(updates.map((item) => new KeylistUpdateMessage_1.KeylistUpdate({
                    action: item.action,
                    recipientKey: useDidKey ? new dids_1.DidKey(item.recipientKey).did : item.recipientKey.publicKeyBase58,
                })));
                mediationRecord.assertReady();
                mediationRecord.assertRole(models_2.MediationRole.Recipient);
                // Create observable for event
                const observable = this.eventEmitter.observable(RoutingEvents_1.RoutingEventTypes.RecipientKeylistUpdated);
                const subject = new rxjs_1.ReplaySubject(1);
                // Apply required filters to observable stream and create promise to subscribe to observable
                observable
                    .pipe((0, Events_1.filterContextCorrelationId)(agentContext.contextCorrelationId), 
                // Only take event for current mediation record
                (0, operators_1.filter)((event) => mediationRecord.id === event.payload.mediationRecord.id), 
                // Only wait for first event that matches the criteria
                (0, operators_1.first)(), 
                // Do not wait for longer than specified timeout
                (0, operators_1.timeout)(timeoutMs))
                    .subscribe(subject);
                const outboundMessageContext = new models_1.OutboundMessageContext(message, { agentContext, connection });
                yield this.messageSender.sendMessage(outboundMessageContext);
                const keylistUpdate = yield (0, rxjs_1.firstValueFrom)(subject);
                return keylistUpdate.payload.mediationRecord;
            });
        }
        createKeylistUpdateMessage(updates) {
            const keylistUpdateMessage = new KeylistUpdateMessage_1.KeylistUpdateMessage({
                updates,
            });
            return keylistUpdateMessage;
        }
        addMediationRouting(agentContext_1, routing_1) {
            return __awaiter(this, arguments, void 0, function* (agentContext, routing, { mediatorId, useDefaultMediator = true } = {}) {
                let mediationRecord = null;
                if (mediatorId) {
                    mediationRecord = yield this.getById(agentContext, mediatorId);
                }
                else if (useDefaultMediator) {
                    // If no mediatorId is provided, and useDefaultMediator is true (default)
                    // We use the default mediator if available
                    mediationRecord = yield this.findDefaultMediator(agentContext);
                }
                // Return early if no mediation record
                if (!mediationRecord)
                    return routing;
                // new did has been created and mediator needs to be updated with the public key.
                mediationRecord = yield this.keylistUpdateAndAwait(agentContext, mediationRecord, [
                    {
                        recipientKey: routing.recipientKey,
                        action: messages_1.KeylistUpdateAction.add,
                    },
                ]);
                return Object.assign(Object.assign({}, routing), { mediatorId: mediationRecord.id, endpoints: mediationRecord.endpoint ? [mediationRecord.endpoint] : routing.endpoints, routingKeys: mediationRecord.routingKeys.map((key) => crypto_1.Key.fromPublicKeyBase58(key, crypto_1.KeyType.Ed25519)) });
            });
        }
        removeMediationRouting(agentContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (agentContext, { recipientKeys, mediatorId }) {
                const mediationRecord = yield this.getById(agentContext, mediatorId);
                if (!mediationRecord) {
                    throw new error_1.AriesFrameworkError('No mediation record to remove routing from has been found');
                }
                yield this.keylistUpdateAndAwait(agentContext, mediationRecord, recipientKeys.map((item) => {
                    return {
                        recipientKey: item,
                        action: messages_1.KeylistUpdateAction.remove,
                    };
                }));
            });
        }
        processMediationDeny(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const connection = messageContext.assertReadyConnection();
                // Mediation record already exists
                const mediationRecord = yield this.findByConnectionId(messageContext.agentContext, connection.id);
                if (!mediationRecord) {
                    throw new Error(`No mediation has been requested for this connection id: ${connection.id}`);
                }
                // Assert
                mediationRecord.assertRole(models_2.MediationRole.Recipient);
                mediationRecord.assertState(models_2.MediationState.Requested);
                // Update record
                yield this.updateState(messageContext.agentContext, mediationRecord, models_2.MediationState.Denied);
                return mediationRecord;
            });
        }
        /**
         * Update the record to a new state and emit an state changed event. Also updates the record
         * in storage.
         *
         * @param MediationRecord The proof record to update the state for
         * @param newState The state to update to
         *
         */
        updateState(agentContext, mediationRecord, newState) {
            return __awaiter(this, void 0, void 0, function* () {
                const previousState = mediationRecord.state;
                mediationRecord.state = newState;
                yield this.mediationRepository.update(agentContext, mediationRecord);
                this.emitStateChangedEvent(agentContext, mediationRecord, previousState);
                return mediationRecord;
            });
        }
        emitStateChangedEvent(agentContext, mediationRecord, previousState) {
            this.eventEmitter.emit(agentContext, {
                type: RoutingEvents_1.RoutingEventTypes.MediationStateChanged,
                payload: {
                    mediationRecord: mediationRecord.clone(),
                    previousState,
                },
            });
        }
        getById(agentContext, id) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.mediationRepository.getById(agentContext, id);
            });
        }
        findByConnectionId(agentContext, connectionId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.mediationRepository.findSingleByQuery(agentContext, { connectionId });
            });
        }
        getMediators(agentContext) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.mediationRepository.getAll(agentContext);
            });
        }
        findAllMediatorsByQuery(agentContext, query) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.mediationRepository.findByQuery(agentContext, query);
            });
        }
        findDefaultMediator(agentContext) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.mediationRepository.findSingleByQuery(agentContext, { default: true });
            });
        }
        discoverMediation(agentContext, mediatorId) {
            return __awaiter(this, void 0, void 0, function* () {
                // If mediatorId is passed, always use it (and error if it is not found)
                if (mediatorId) {
                    return this.mediationRepository.getById(agentContext, mediatorId);
                }
                const defaultMediator = yield this.findDefaultMediator(agentContext);
                if (defaultMediator) {
                    if (defaultMediator.state !== models_2.MediationState.Granted) {
                        throw new error_1.AriesFrameworkError(`Mediation State for ${defaultMediator.id} is not granted, but is set as default mediator!`);
                    }
                    return defaultMediator;
                }
            });
        }
        setDefaultMediator(agentContext, mediator) {
            return __awaiter(this, void 0, void 0, function* () {
                const mediationRecords = yield this.mediationRepository.findByQuery(agentContext, { default: true });
                for (const record of mediationRecords) {
                    record.setTag('default', false);
                    yield this.mediationRepository.update(agentContext, record);
                }
                // Set record coming in tag to true and then update.
                mediator.setTag('default', true);
                yield this.mediationRepository.update(agentContext, mediator);
            });
        }
        clearDefaultMediator(agentContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const mediationRecord = yield this.findDefaultMediator(agentContext);
                if (mediationRecord) {
                    mediationRecord.setTag('default', false);
                    yield this.mediationRepository.update(agentContext, mediationRecord);
                }
            });
        }
        updateUseDidKeysFlag(agentContext, connection, protocolUri, connectionUsesDidKey) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const useDidKeysForProtocol = (_a = connection.metadata.get(ConnectionMetadataTypes_1.ConnectionMetadataKeys.UseDidKeysForProtocol)) !== null && _a !== void 0 ? _a : {};
                useDidKeysForProtocol[protocolUri] = connectionUsesDidKey;
                connection.metadata.set(ConnectionMetadataTypes_1.ConnectionMetadataKeys.UseDidKeysForProtocol, useDidKeysForProtocol);
                yield this.connectionService.update(agentContext, connection);
            });
        }
    };
    __setFunctionName(_classThis, "MediationRecipientService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MediationRecipientService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MediationRecipientService = _classThis;
})();
exports.MediationRecipientService = MediationRecipientService;
