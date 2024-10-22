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
exports.TenantAgentContextProvider = void 0;
const core_1 = require("@aries-framework/core");
let TenantAgentContextProvider = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TenantAgentContextProvider = _classThis = class {
        constructor(tenantRecordService, rootAgentContext, eventEmitter, tenantSessionCoordinator, logger) {
            this.tenantRecordService = tenantRecordService;
            this.rootAgentContext = rootAgentContext;
            this.eventEmitter = eventEmitter;
            this.tenantSessionCoordinator = tenantSessionCoordinator;
            this.logger = logger;
            // Start listener for newly created routing keys, so we can register a mapping for each new key for the tenant
            this.listenForRoutingKeyCreatedEvents();
        }
        getAgentContextForContextCorrelationId(tenantId) {
            return __awaiter(this, void 0, void 0, function* () {
                // TODO: maybe we can look at not having to retrieve the tenant record if there's already a context available.
                const tenantRecord = yield this.tenantRecordService.getTenantById(this.rootAgentContext, tenantId);
                const agentContext = this.tenantSessionCoordinator.getContextForSession(tenantRecord);
                this.logger.debug(`Created tenant agent context for tenant '${tenantId}'`);
                return agentContext;
            });
        }
        getContextForInboundMessage(inboundMessage, options) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug('Getting context for inbound message in tenant agent context provider', {
                    contextCorrelationId: options === null || options === void 0 ? void 0 : options.contextCorrelationId,
                });
                let tenantId = options === null || options === void 0 ? void 0 : options.contextCorrelationId;
                let recipientKeys = [];
                if (!tenantId && (0, core_1.isValidJweStructure)(inboundMessage)) {
                    this.logger.trace("Inbound message is a JWE, extracting tenant id from JWE's protected header");
                    recipientKeys = this.getRecipientKeysFromEncryptedMessage(inboundMessage);
                    this.logger.trace(`Found ${recipientKeys.length} recipient keys in JWE's protected header`);
                    // FIXME: what if there are multiple recipients in the same agent? If we receive the messages twice we will process it for
                    // the first found recipient multiple times. This is however a case I've never seen before and will add quite some complexity
                    // to resolve. I think we're fine to ignore this case for now.
                    for (const recipientKey of recipientKeys) {
                        const tenantRoutingRecord = yield this.tenantRecordService.findTenantRoutingRecordByRecipientKey(this.rootAgentContext, recipientKey);
                        if (tenantRoutingRecord) {
                            this.logger.debug(`Found tenant routing record for recipient key ${recipientKeys[0].fingerprint}`, {
                                tenantId: tenantRoutingRecord.tenantId,
                            });
                            tenantId = tenantRoutingRecord.tenantId;
                            break;
                        }
                    }
                }
                if (!tenantId) {
                    this.logger.error("Couldn't determine tenant id for inbound message. Unable to create context", {
                        inboundMessage,
                        recipientKeys: recipientKeys.map((key) => key.fingerprint),
                    });
                    throw new core_1.AriesFrameworkError("Couldn't determine tenant id for inbound message. Unable to create context");
                }
                const agentContext = yield this.getAgentContextForContextCorrelationId(tenantId);
                return agentContext;
            });
        }
        endSessionForAgentContext(agentContext) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.tenantSessionCoordinator.endAgentContextSession(agentContext);
            });
        }
        getRecipientKeysFromEncryptedMessage(jwe) {
            const jweProtected = core_1.JsonEncoder.fromBase64(jwe.protected);
            if (!Array.isArray(jweProtected.recipients))
                return [];
            const recipientKeys = [];
            for (const recipient of jweProtected.recipients) {
                // Check if recipient.header.kid is a string
                if ((0, core_1.isJsonObject)(recipient) && (0, core_1.isJsonObject)(recipient.header) && typeof recipient.header.kid === 'string') {
                    // This won't work with other key types, we should detect what the encoding is of kid, and based on that
                    // determine how we extract the key from the message
                    const key = core_1.Key.fromPublicKeyBase58(recipient.header.kid, core_1.KeyType.Ed25519);
                    recipientKeys.push(key);
                }
            }
            return recipientKeys;
        }
        registerRecipientKeyForTenant(tenantId, recipientKey) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Registering recipient key ${recipientKey.fingerprint} for tenant ${tenantId}`);
                const tenantRecord = yield this.tenantRecordService.getTenantById(this.rootAgentContext, tenantId);
                yield this.tenantRecordService.addTenantRoutingRecord(this.rootAgentContext, tenantRecord.id, recipientKey);
            });
        }
        listenForRoutingKeyCreatedEvents() {
            this.logger.debug('Listening for routing key created events in tenant agent context provider');
            this.eventEmitter.on(core_1.RoutingEventTypes.RoutingCreatedEvent, (event) => __awaiter(this, void 0, void 0, function* () {
                const contextCorrelationId = event.metadata.contextCorrelationId;
                const recipientKey = event.payload.routing.recipientKey;
                // We don't want to register the key if it's for the root agent context
                if (contextCorrelationId === this.rootAgentContext.contextCorrelationId)
                    return;
                this.logger.debug(`Received routing key created event for tenant ${contextCorrelationId}, registering recipient key ${recipientKey.fingerprint} in base wallet`);
                yield this.registerRecipientKeyForTenant(contextCorrelationId, recipientKey);
            }));
        }
    };
    __setFunctionName(_classThis, "TenantAgentContextProvider");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TenantAgentContextProvider = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TenantAgentContextProvider = _classThis;
})();
exports.TenantAgentContextProvider = TenantAgentContextProvider;
