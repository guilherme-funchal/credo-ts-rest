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
exports.MessagePickupApi = void 0;
const models_1 = require("../../agent/models");
const constants_1 = require("../../constants");
const error_1 = require("../../error");
const plugins_1 = require("../../plugins");
let MessagePickupApi = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MessagePickupApi = _classThis = class {
        constructor(messageSender, agentContext, connectionService, config, logger) {
            this.messageSender = messageSender;
            this.connectionService = connectionService;
            this.agentContext = agentContext;
            this.config = config;
            this.logger = logger;
        }
        getProtocol(protocolVersion) {
            const protocol = this.config.protocols.find((protocol) => protocol.version === protocolVersion);
            if (!protocol) {
                throw new error_1.AriesFrameworkError(`No message pickup protocol registered for protocol version ${protocolVersion}`);
            }
            return protocol;
        }
        /**
         * Add an encrypted message to the message pickup queue
         *
         * @param options: connectionId associated to the message and the encrypted message itself
         */
        queueMessage(options) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug('Queuing message...');
                const connectionRecord = yield this.connectionService.getById(this.agentContext, options.connectionId);
                const messageRepository = this.agentContext.dependencyManager.resolve(constants_1.InjectionSymbols.MessageRepository);
                yield messageRepository.add(connectionRecord.id, options.message);
            });
        }
        /**
         * Pickup queued messages from a message holder. It attempts to retrieve all current messages from the
         * queue, receiving up to `batchSize` messages per batch retrieval.
         *
         * @param options connectionId, protocol version to use and batch size
         */
        pickupMessages(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const connectionRecord = yield this.connectionService.getById(this.agentContext, options.connectionId);
                const protocol = this.getProtocol(options.protocolVersion);
                const { message } = yield protocol.pickupMessages(this.agentContext, {
                    connectionRecord,
                    batchSize: options.batchSize,
                    recipientKey: options.recipientKey,
                });
                yield this.messageSender.sendMessage(new models_1.OutboundMessageContext(message, {
                    agentContext: this.agentContext,
                    connection: connectionRecord,
                }));
            });
        }
    };
    __setFunctionName(_classThis, "MessagePickupApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MessagePickupApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MessagePickupApi = _classThis;
})();
exports.MessagePickupApi = MessagePickupApi;
