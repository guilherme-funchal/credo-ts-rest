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
exports.V1MessagePickupProtocol = void 0;
const models_1 = require("../../../../agent/models");
const constants_1 = require("../../../../constants");
const plugins_1 = require("../../../../plugins");
const MessagePickupModuleConfig_1 = require("../../MessagePickupModuleConfig");
const BaseMessagePickupProtocol_1 = require("../BaseMessagePickupProtocol");
const handlers_1 = require("./handlers");
const messages_1 = require("./messages");
let V1MessagePickupProtocol = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseMessagePickupProtocol_1.BaseMessagePickupProtocol;
    var V1MessagePickupProtocol = _classThis = class extends _classSuper {
        constructor() {
            super();
            /**
             * The version of the message pickup protocol this class supports
             */
            this.version = 'v1';
        }
        /**
         * Registers the protocol implementation (handlers, feature registry) on the agent.
         */
        register(dependencyManager, featureRegistry) {
            dependencyManager.registerMessageHandlers([new handlers_1.V1BatchPickupHandler(this), new handlers_1.V1BatchHandler()]);
            featureRegistry.register(new models_1.Protocol({
                id: 'https://didcomm.org/messagepickup/1.0',
                roles: ['message_holder', 'recipient', 'batch_sender', 'batch_recipient'],
            }));
        }
        pickupMessages(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { connectionRecord, batchSize } = options;
                connectionRecord.assertReady();
                const config = agentContext.dependencyManager.resolve(MessagePickupModuleConfig_1.MessagePickupModuleConfig);
                const message = new messages_1.V1BatchPickupMessage({
                    batchSize: batchSize !== null && batchSize !== void 0 ? batchSize : config.maximumBatchSize,
                });
                return { message };
            });
        }
        processBatchPickup(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                // Assert ready connection
                const connection = messageContext.assertReadyConnection();
                const { message } = messageContext;
                const messageRepository = messageContext.agentContext.dependencyManager.resolve(constants_1.InjectionSymbols.MessageRepository);
                const messages = yield messageRepository.takeFromQueue(connection.id, message.batchSize);
                // TODO: each message should be stored with an id. to be able to conform to the id property
                // of batch message
                const batchMessages = messages.map((msg) => new messages_1.BatchMessageMessage({
                    message: msg,
                }));
                const batchMessage = new messages_1.V1BatchMessage({
                    messages: batchMessages,
                });
                return new models_1.OutboundMessageContext(batchMessage, { agentContext: messageContext.agentContext, connection });
            });
        }
    };
    __setFunctionName(_classThis, "V1MessagePickupProtocol");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        V1MessagePickupProtocol = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return V1MessagePickupProtocol = _classThis;
})();
exports.V1MessagePickupProtocol = V1MessagePickupProtocol;
