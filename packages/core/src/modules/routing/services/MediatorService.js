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
exports.MediatorService = void 0;
const crypto_1 = require("../../../crypto");
const error_1 = require("../../../error");
const plugins_1 = require("../../../plugins");
const ConnectionMetadataTypes_1 = require("../../connections/repository/ConnectionMetadataTypes");
const helpers_1 = require("../../dids/helpers");
const RoutingEvents_1 = require("../RoutingEvents");
const messages_1 = require("../messages");
const MediationRole_1 = require("../models/MediationRole");
const MediationState_1 = require("../models/MediationState");
const repository_1 = require("../repository");
const MediationRecord_1 = require("../repository/MediationRecord");
let MediatorService = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MediatorService = _classThis = class {
        constructor(mediationRepository, mediatorRoutingRepository, eventEmitter, logger, connectionService) {
            this.mediationRepository = mediationRepository;
            this.mediatorRoutingRepository = mediatorRoutingRepository;
            this.eventEmitter = eventEmitter;
            this.logger = logger;
            this.connectionService = connectionService;
        }
        getRoutingKeys(agentContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const mediatorRoutingRecord = yield this.findMediatorRoutingRecord(agentContext);
                if (mediatorRoutingRecord) {
                    // Return the routing keys
                    this.logger.debug(`Returning mediator routing keys ${mediatorRoutingRecord.routingKeys}`);
                    return mediatorRoutingRecord.routingKeys;
                }
                throw new error_1.AriesFrameworkError(`Mediator has not been initialized yet.`);
            });
        }
        processForwardMessage(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const { message } = messageContext;
                // TODO: update to class-validator validation
                if (!message.to) {
                    throw new error_1.AriesFrameworkError('Invalid Message: Missing required attribute "to"');
                }
                const mediationRecord = yield this.mediationRepository.getSingleByRecipientKey(messageContext.agentContext, message.to);
                // Assert mediation record is ready to be used
                mediationRecord.assertReady();
                mediationRecord.assertRole(MediationRole_1.MediationRole.Mediator);
                return {
                    encryptedMessage: message.message,
                    mediationRecord,
                };
            });
        }
        processKeylistUpdateRequest(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                // Assert Ready connection
                const connection = messageContext.assertReadyConnection();
                const { message } = messageContext;
                const keylist = [];
                const mediationRecord = yield this.mediationRepository.getByConnectionId(messageContext.agentContext, connection.id);
                mediationRecord.assertReady();
                mediationRecord.assertRole(MediationRole_1.MediationRole.Mediator);
                // Update connection metadata to use their key format in further protocol messages
                const connectionUsesDidKey = message.updates.some((update) => (0, helpers_1.isDidKey)(update.recipientKey));
                yield this.updateUseDidKeysFlag(messageContext.agentContext, connection, messages_1.KeylistUpdateMessage.type.protocolUri, connectionUsesDidKey);
                for (const update of message.updates) {
                    const updated = new messages_1.KeylistUpdated({
                        action: update.action,
                        recipientKey: update.recipientKey,
                        result: messages_1.KeylistUpdateResult.NoChange,
                    });
                    // According to RFC 0211 key should be a did key, but base58 encoded verkey was used before
                    // RFC was accepted. This converts the key to a public key base58 if it is a did key.
                    const publicKeyBase58 = (0, helpers_1.didKeyToVerkey)(update.recipientKey);
                    if (update.action === messages_1.KeylistUpdateAction.add) {
                        mediationRecord.addRecipientKey(publicKeyBase58);
                        updated.result = messages_1.KeylistUpdateResult.Success;
                        keylist.push(updated);
                    }
                    else if (update.action === messages_1.KeylistUpdateAction.remove) {
                        const success = mediationRecord.removeRecipientKey(publicKeyBase58);
                        updated.result = success ? messages_1.KeylistUpdateResult.Success : messages_1.KeylistUpdateResult.NoChange;
                        keylist.push(updated);
                    }
                }
                yield this.mediationRepository.update(messageContext.agentContext, mediationRecord);
                return new messages_1.KeylistUpdateResponseMessage({ keylist, threadId: message.threadId });
            });
        }
        createGrantMediationMessage(agentContext, mediationRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                // Assert
                mediationRecord.assertState(MediationState_1.MediationState.Requested);
                mediationRecord.assertRole(MediationRole_1.MediationRole.Mediator);
                yield this.updateState(agentContext, mediationRecord, MediationState_1.MediationState.Granted);
                // Use our useDidKey configuration, as this is the first interaction for this protocol
                const useDidKey = agentContext.config.useDidKeyInProtocols;
                const message = new messages_1.MediationGrantMessage({
                    endpoint: agentContext.config.endpoints[0],
                    routingKeys: useDidKey
                        ? (yield this.getRoutingKeys(agentContext)).map(helpers_1.verkeyToDidKey)
                        : yield this.getRoutingKeys(agentContext),
                    threadId: mediationRecord.threadId,
                });
                return { mediationRecord, message };
            });
        }
        processMediationRequest(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                // Assert ready connection
                const connection = messageContext.assertReadyConnection();
                const mediationRecord = new MediationRecord_1.MediationRecord({
                    connectionId: connection.id,
                    role: MediationRole_1.MediationRole.Mediator,
                    state: MediationState_1.MediationState.Requested,
                    threadId: messageContext.message.threadId,
                });
                yield this.mediationRepository.save(messageContext.agentContext, mediationRecord);
                this.emitStateChangedEvent(messageContext.agentContext, mediationRecord, null);
                return mediationRecord;
            });
        }
        findById(agentContext, mediatorRecordId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.mediationRepository.findById(agentContext, mediatorRecordId);
            });
        }
        getById(agentContext, mediatorRecordId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.mediationRepository.getById(agentContext, mediatorRecordId);
            });
        }
        getAll(agentContext) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.mediationRepository.getAll(agentContext);
            });
        }
        findMediatorRoutingRecord(agentContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const routingRecord = yield this.mediatorRoutingRepository.findById(agentContext, this.mediatorRoutingRepository.MEDIATOR_ROUTING_RECORD_ID);
                return routingRecord;
            });
        }
        createMediatorRoutingRecord(agentContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const routingKey = yield agentContext.wallet.createKey({
                    keyType: crypto_1.KeyType.Ed25519,
                });
                const routingRecord = new repository_1.MediatorRoutingRecord({
                    id: this.mediatorRoutingRepository.MEDIATOR_ROUTING_RECORD_ID,
                    // FIXME: update to fingerprint to include the key type
                    routingKeys: [routingKey.publicKeyBase58],
                });
                try {
                    yield this.mediatorRoutingRepository.save(agentContext, routingRecord);
                    this.eventEmitter.emit(agentContext, {
                        type: RoutingEvents_1.RoutingEventTypes.RoutingCreatedEvent,
                        payload: {
                            routing: {
                                endpoints: agentContext.config.endpoints,
                                routingKeys: [],
                                recipientKey: routingKey,
                            },
                        },
                    });
                }
                catch (error) {
                    // This addresses some race conditions issues where we first check if the record exists
                    // then we create one if it doesn't, but another process has created one in the meantime
                    // Although not the most elegant solution, it addresses the issues
                    if (error instanceof error_1.RecordDuplicateError) {
                        // the record already exists, which is our intended end state
                        // we can ignore this error and fetch the existing record
                        return this.mediatorRoutingRepository.getById(agentContext, this.mediatorRoutingRepository.MEDIATOR_ROUTING_RECORD_ID);
                    }
                    else {
                        throw error;
                    }
                }
                return routingRecord;
            });
        }
        findAllByQuery(agentContext, query) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.mediationRepository.findByQuery(agentContext, query);
            });
        }
        updateState(agentContext, mediationRecord, newState) {
            return __awaiter(this, void 0, void 0, function* () {
                const previousState = mediationRecord.state;
                mediationRecord.state = newState;
                yield this.mediationRepository.update(agentContext, mediationRecord);
                this.emitStateChangedEvent(agentContext, mediationRecord, previousState);
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
    __setFunctionName(_classThis, "MediatorService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MediatorService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MediatorService = _classThis;
})();
exports.MediatorService = MediatorService;
