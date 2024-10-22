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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustPingService = void 0;
const models_1 = require("../../../agent/models");
const plugins_1 = require("../../../plugins");
const TrustPingEvents_1 = require("../TrustPingEvents");
const messages_1 = require("../messages");
let TrustPingService = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TrustPingService = _classThis = class {
        constructor(eventEmitter) {
            this.eventEmitter = eventEmitter;
        }
        processPing({ message, agentContext }, connection) {
            this.eventEmitter.emit(agentContext, {
                type: TrustPingEvents_1.TrustPingEventTypes.TrustPingReceivedEvent,
                payload: {
                    connectionRecord: connection,
                    message: message,
                },
            });
            if (message.responseRequested) {
                const response = new messages_1.TrustPingResponseMessage({
                    threadId: message.threadId,
                });
                return new models_1.OutboundMessageContext(response, { agentContext, connection });
            }
        }
        processPingResponse(inboundMessage) {
            const { agentContext, message } = inboundMessage;
            const connection = inboundMessage.assertReadyConnection();
            this.eventEmitter.emit(agentContext, {
                type: TrustPingEvents_1.TrustPingEventTypes.TrustPingResponseReceivedEvent,
                payload: {
                    connectionRecord: connection,
                    message: message,
                },
            });
        }
    };
    __setFunctionName(_classThis, "TrustPingService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TrustPingService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TrustPingService = _classThis;
})();
exports.TrustPingService = TrustPingService;
