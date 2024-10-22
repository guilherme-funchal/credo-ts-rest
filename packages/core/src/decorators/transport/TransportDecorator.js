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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportDecorator = exports.ReturnRouteTypes = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const BaseMessage_1 = require("../../agent/BaseMessage");
/**
 * Return route types.
 */
var ReturnRouteTypes;
(function (ReturnRouteTypes) {
    /** No messages should be returned over this connection. */
    ReturnRouteTypes["none"] = "none";
    /**  All messages for this key should be returned over this connection. */
    ReturnRouteTypes["all"] = "all";
    /** Send all messages matching this thread over this connection. */
    ReturnRouteTypes["thread"] = "thread";
})(ReturnRouteTypes || (exports.ReturnRouteTypes = ReturnRouteTypes = {}));
/**
 * Represents `~transport` decorator
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0092-transport-return-route/README.md
 */
let TransportDecorator = (() => {
    var _a;
    let _returnRoute_decorators;
    let _returnRoute_initializers = [];
    let _returnRoute_extraInitializers = [];
    let _returnRouteThread_decorators;
    let _returnRouteThread_initializers = [];
    let _returnRouteThread_extraInitializers = [];
    return _a = class TransportDecorator {
            constructor(partial) {
                this.returnRoute = __runInitializers(this, _returnRoute_initializers, void 0);
                this.returnRouteThread = (__runInitializers(this, _returnRoute_extraInitializers), __runInitializers(this, _returnRouteThread_initializers, void 0));
                __runInitializers(this, _returnRouteThread_extraInitializers);
                this.returnRoute = partial === null || partial === void 0 ? void 0 : partial.returnRoute;
                this.returnRouteThread = partial === null || partial === void 0 ? void 0 : partial.returnRouteThread;
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _returnRoute_decorators = [(0, class_transformer_1.Expose)({ name: 'return_route' }), (0, class_validator_1.IsEnum)(ReturnRouteTypes), (0, class_validator_1.IsOptional)()];
            _returnRouteThread_decorators = [(0, class_transformer_1.Expose)({ name: 'return_route_thread' }), (0, class_validator_1.ValidateIf)((o) => o.returnRoute === ReturnRouteTypes.thread), (0, class_validator_1.Matches)(BaseMessage_1.MessageIdRegExp)];
            __esDecorate(null, null, _returnRoute_decorators, { kind: "field", name: "returnRoute", static: false, private: false, access: { has: obj => "returnRoute" in obj, get: obj => obj.returnRoute, set: (obj, value) => { obj.returnRoute = value; } }, metadata: _metadata }, _returnRoute_initializers, _returnRoute_extraInitializers);
            __esDecorate(null, null, _returnRouteThread_decorators, { kind: "field", name: "returnRouteThread", static: false, private: false, access: { has: obj => "returnRouteThread" in obj, get: obj => obj.returnRouteThread, set: (obj, value) => { obj.returnRouteThread = value; } }, metadata: _metadata }, _returnRouteThread_initializers, _returnRouteThread_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.TransportDecorator = TransportDecorator;
