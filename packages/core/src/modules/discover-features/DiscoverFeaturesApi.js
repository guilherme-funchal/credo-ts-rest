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
exports.DiscoverFeaturesApi = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const models_1 = require("../../agent/models");
const error_1 = require("../../error");
const plugins_1 = require("../../plugins");
const DiscoverFeaturesEvents_1 = require("./DiscoverFeaturesEvents");
let DiscoverFeaturesApi = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DiscoverFeaturesApi = _classThis = class {
        constructor(connectionService, messageSender, v1Service, v2Service, eventEmitter, stop$, agentContext, config) {
            this.connectionService = connectionService;
            this.messageSender = messageSender;
            this.eventEmitter = eventEmitter;
            this.stop$ = stop$;
            this.agentContext = agentContext;
            this.config = config;
            // Dynamically build service map. This will be extracted once services are registered dynamically
            this.serviceMap = [v1Service, v2Service].reduce((serviceMap, service) => (Object.assign(Object.assign({}, serviceMap), { [service.version]: service })), {});
        }
        getService(protocolVersion) {
            if (!this.serviceMap[protocolVersion]) {
                throw new error_1.AriesFrameworkError(`No discover features service registered for protocol version ${protocolVersion}`);
            }
            return this.serviceMap[protocolVersion];
        }
        /**
         * Send a query to an existing connection for discovering supported features of any kind. If desired, do the query synchronously,
         * meaning that it will await the response (or timeout) before resolving. Otherwise, response can be hooked by subscribing to
         * {DiscoverFeaturesDisclosureReceivedEvent}.
         *
         * Note: V1 protocol only supports a single query and is limited to protocols
         *
         * @param options feature queries to perform, protocol version and optional comment string (only used
         * in V1 protocol). If awaitDisclosures is set, perform the query synchronously with awaitDisclosuresTimeoutMs timeout.
         */
        queryFeatures(options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const service = this.getService(options.protocolVersion);
                const connection = yield this.connectionService.getById(this.agentContext, options.connectionId);
                const { message: queryMessage } = yield service.createQuery({
                    queries: options.queries,
                    comment: options.comment,
                });
                const outboundMessageContext = new models_1.OutboundMessageContext(queryMessage, {
                    agentContext: this.agentContext,
                    connection,
                });
                const replaySubject = new rxjs_1.ReplaySubject(1);
                if (options.awaitDisclosures) {
                    // Listen for response to our feature query
                    this.eventEmitter
                        .observable(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.DisclosureReceived)
                        .pipe(
                    // Stop when the agent shuts down
                    (0, operators_1.takeUntil)(this.stop$), 
                    // filter by connection id
                    (0, operators_1.filter)((e) => { var _a; return ((_a = e.payload.connection) === null || _a === void 0 ? void 0 : _a.id) === connection.id; }), 
                    // Return disclosures
                    (0, operators_1.map)((e) => e.payload.disclosures), 
                    // If we don't have an answer in timeoutMs miliseconds (no response, not supported, etc...) error
                    (0, operators_1.timeout)((_a = options.awaitDisclosuresTimeoutMs) !== null && _a !== void 0 ? _a : 7000), // TODO: Harmonize default timeouts across the framework
                    // We want to return false if an error occurred
                    (0, operators_1.catchError)(() => (0, rxjs_1.of)([])))
                        .subscribe(replaySubject);
                }
                yield this.messageSender.sendMessage(outboundMessageContext);
                return { features: options.awaitDisclosures ? yield (0, rxjs_1.firstValueFrom)(replaySubject) : undefined };
            });
        }
        /**
         * Disclose features to a connection, either proactively or as a response to a query.
         *
         * Features are disclosed based on queries that will be performed to Agent's Feature Registry,
         * meaning that they should be registered prior to disclosure. When sending disclosure as response,
         * these queries will usually match those from the corresponding Query or Queries message.
         *
         * Note: V1 protocol only supports sending disclosures as a response to a query.
         *
         * @param options multiple properties like protocol version to use, disclosure queries and thread id
         * (in case of disclosure as response to query)
         */
        discloseFeatures(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const service = this.getService(options.protocolVersion);
                const connection = yield this.connectionService.getById(this.agentContext, options.connectionId);
                const { message: disclosuresMessage } = yield service.createDisclosure({
                    disclosureQueries: options.disclosureQueries,
                    threadId: options.threadId,
                });
                const outboundMessageContext = new models_1.OutboundMessageContext(disclosuresMessage, {
                    agentContext: this.agentContext,
                    connection,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
            });
        }
    };
    __setFunctionName(_classThis, "DiscoverFeaturesApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DiscoverFeaturesApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DiscoverFeaturesApi = _classThis;
})();
exports.DiscoverFeaturesApi = DiscoverFeaturesApi;
