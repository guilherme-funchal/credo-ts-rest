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
exports.TransportDecorated = TransportDecorated;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const TransportDecorator_1 = require("./TransportDecorator");
function TransportDecorated(Base) {
    let TransportDecoratorExtension = (() => {
        var _a;
        let _classSuper = Base;
        let _transport_decorators;
        let _transport_initializers = [];
        let _transport_extraInitializers = [];
        return _a = class TransportDecoratorExtension extends _classSuper {
                setReturnRouting(type, thread) {
                    this.transport = new TransportDecorator_1.TransportDecorator({
                        returnRoute: type,
                        returnRouteThread: thread,
                    });
                }
                hasReturnRouting(threadId) {
                    //   transport 'none' or undefined always false
                    if (!this.transport || !this.transport.returnRoute || this.transport.returnRoute === TransportDecorator_1.ReturnRouteTypes.none) {
                        return false;
                    }
                    // transport 'all' always true
                    else if (this.transport.returnRoute === TransportDecorator_1.ReturnRouteTypes.all)
                        return true;
                    // transport 'thread' with matching thread id is true
                    else if (this.transport.returnRoute === TransportDecorator_1.ReturnRouteTypes.thread && this.transport.returnRouteThread === threadId)
                        return true;
                    // transport is thread but threadId is either missing or doesn't match. Return false
                    return false;
                }
                hasAnyReturnRoute() {
                    var _b;
                    const returnRoute = (_b = this.transport) === null || _b === void 0 ? void 0 : _b.returnRoute;
                    return returnRoute === TransportDecorator_1.ReturnRouteTypes.all || returnRoute === TransportDecorator_1.ReturnRouteTypes.thread;
                }
                constructor() {
                    super(...arguments);
                    this.transport = __runInitializers(this, _transport_initializers, void 0);
                    __runInitializers(this, _transport_extraInitializers);
                }
            },
            (() => {
                var _b;
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
                _transport_decorators = [(0, class_transformer_1.Expose)({ name: '~transport' }), (0, class_transformer_1.Type)(() => TransportDecorator_1.TransportDecorator), (0, class_validator_1.ValidateNested)(), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInstance)(TransportDecorator_1.TransportDecorator)];
                __esDecorate(null, null, _transport_decorators, { kind: "field", name: "transport", static: false, private: false, access: { has: obj => "transport" in obj, get: obj => obj.transport, set: (obj, value) => { obj.transport = value; } }, metadata: _metadata }, _transport_initializers, _transport_extraInitializers);
                if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            })(),
            _a;
    })();
    return TransportDecoratorExtension;
}
