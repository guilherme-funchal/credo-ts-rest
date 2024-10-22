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
exports.V2DiscoverFeaturesService = void 0;
const plugins_1 = require("../../../../plugins");
const DiscoverFeaturesEvents_1 = require("../../DiscoverFeaturesEvents");
const services_1 = require("../../services");
const handlers_1 = require("./handlers");
const messages_1 = require("./messages");
let V2DiscoverFeaturesService = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = services_1.DiscoverFeaturesService;
    var V2DiscoverFeaturesService = _classThis = class extends _classSuper {
        constructor(featureRegistry, eventEmitter, messageHandlerRegistry, logger, discoverFeaturesModuleConfig) {
            super(featureRegistry, eventEmitter, logger, discoverFeaturesModuleConfig);
            /**
             * The version of the discover features protocol this service supports
             */
            this.version = 'v2';
            this.registerMessageHandlers(messageHandlerRegistry);
        }
        registerMessageHandlers(messageHandlerRegistry) {
            messageHandlerRegistry.registerMessageHandler(new handlers_1.V2DisclosuresMessageHandler(this));
            messageHandlerRegistry.registerMessageHandler(new handlers_1.V2QueriesMessageHandler(this));
        }
        createQuery(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const queryMessage = new messages_1.V2QueriesMessage({ queries: options.queries });
                return { message: queryMessage };
            });
        }
        processQuery(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const { queries, threadId } = messageContext.message;
                const connection = messageContext.assertReadyConnection();
                this.eventEmitter.emit(messageContext.agentContext, {
                    type: DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived,
                    payload: {
                        message: messageContext.message,
                        connection,
                        queries,
                        protocolVersion: this.version,
                        threadId,
                    },
                });
                // Process query and send responde automatically if configured to do so, otherwise
                // just send the event and let controller decide
                if (this.discoverFeaturesModuleConfig.autoAcceptQueries) {
                    return yield this.createDisclosure({
                        threadId,
                        disclosureQueries: queries,
                    });
                }
            });
        }
        createDisclosure(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const matches = this.featureRegistry.query(...options.disclosureQueries);
                const discloseMessage = new messages_1.V2DisclosuresMessage({
                    threadId: options.threadId,
                    features: matches,
                });
                return { message: discloseMessage };
            });
        }
        processDisclosure(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const { disclosures, threadId } = messageContext.message;
                const connection = messageContext.assertReadyConnection();
                this.eventEmitter.emit(messageContext.agentContext, {
                    type: DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.DisclosureReceived,
                    payload: {
                        message: messageContext.message,
                        connection,
                        disclosures,
                        protocolVersion: this.version,
                        threadId,
                    },
                });
            });
        }
    };
    __setFunctionName(_classThis, "V2DiscoverFeaturesService");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        V2DiscoverFeaturesService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return V2DiscoverFeaturesService = _classThis;
})();
exports.V2DiscoverFeaturesService = V2DiscoverFeaturesService;
