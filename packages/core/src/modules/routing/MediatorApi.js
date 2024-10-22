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
exports.MediatorApi = void 0;
const models_1 = require("../../agent/models");
const plugins_1 = require("../../plugins");
const message_p_ckup_1 = require("../message-p\u00ECckup");
const handlers_1 = require("./handlers");
const MediationRequestHandler_1 = require("./handlers/MediationRequestHandler");
let MediatorApi = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MediatorApi = _classThis = class {
        constructor(messageHandlerRegistry, mediationService, messageSender, agentContext, connectionService, config) {
            this.mediatorService = mediationService;
            this.messageSender = messageSender;
            this.connectionService = connectionService;
            this.agentContext = agentContext;
            this.config = config;
            this.registerMessageHandlers(messageHandlerRegistry);
        }
        initialize() {
            return __awaiter(this, void 0, void 0, function* () {
                this.agentContext.config.logger.debug('Mediator routing record not loaded yet, retrieving from storage');
                const routingRecord = yield this.mediatorService.findMediatorRoutingRecord(this.agentContext);
                // If we don't have a routing record yet for this tenant, create it
                if (!routingRecord) {
                    this.agentContext.config.logger.debug('Mediator routing record does not exist yet, creating routing keys and record');
                    yield this.mediatorService.createMediatorRoutingRecord(this.agentContext);
                }
            });
        }
        grantRequestedMediation(mediatorId) {
            return __awaiter(this, void 0, void 0, function* () {
                const record = yield this.mediatorService.getById(this.agentContext, mediatorId);
                const connectionRecord = yield this.connectionService.getById(this.agentContext, record.connectionId);
                const { message, mediationRecord } = yield this.mediatorService.createGrantMediationMessage(this.agentContext, record);
                const outboundMessageContext = new models_1.OutboundMessageContext(message, {
                    agentContext: this.agentContext,
                    connection: connectionRecord,
                    associatedRecord: mediationRecord,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return mediationRecord;
            });
        }
        /**
         * @deprecated Use `MessagePickupApi.queueMessage` instead.
         * */
        queueMessage(connectionId, message) {
            const messagePickupApi = this.agentContext.dependencyManager.resolve(message_p_ckup_1.MessagePickupApi);
            return messagePickupApi.queueMessage({ connectionId, message });
        }
        registerMessageHandlers(messageHandlerRegistry) {
            messageHandlerRegistry.registerMessageHandler(new handlers_1.KeylistUpdateHandler(this.mediatorService));
            messageHandlerRegistry.registerMessageHandler(new handlers_1.ForwardHandler(this.mediatorService, this.connectionService, this.messageSender));
            messageHandlerRegistry.registerMessageHandler(new MediationRequestHandler_1.MediationRequestHandler(this.mediatorService, this.config));
        }
    };
    __setFunctionName(_classThis, "MediatorApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MediatorApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MediatorApi = _classThis;
})();
exports.MediatorApi = MediatorApi;
