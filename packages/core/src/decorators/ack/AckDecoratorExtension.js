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
exports.AckDecorated = AckDecorated;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const AckDecorator_1 = require("./AckDecorator");
function AckDecorated(Base) {
    let AckDecoratorExtension = (() => {
        var _a;
        let _classSuper = Base;
        let _pleaseAck_decorators;
        let _pleaseAck_initializers = [];
        let _pleaseAck_extraInitializers = [];
        return _a = class AckDecoratorExtension extends _classSuper {
                setPleaseAck(on = [AckDecorator_1.AckValues.Receipt]) {
                    this.pleaseAck = new AckDecorator_1.AckDecorator({ on });
                }
                getPleaseAck() {
                    return this.pleaseAck;
                }
                requiresAck() {
                    return this.pleaseAck !== undefined;
                }
                constructor() {
                    super(...arguments);
                    this.pleaseAck = __runInitializers(this, _pleaseAck_initializers, void 0);
                    __runInitializers(this, _pleaseAck_extraInitializers);
                }
            },
            (() => {
                var _b;
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
                _pleaseAck_decorators = [(0, class_transformer_1.Expose)({ name: '~please_ack' }), (0, class_transformer_1.Type)(() => AckDecorator_1.AckDecorator), (0, class_validator_1.ValidateNested)(), (0, class_validator_1.IsInstance)(AckDecorator_1.AckDecorator), (0, class_validator_1.IsOptional)()];
                __esDecorate(null, null, _pleaseAck_decorators, { kind: "field", name: "pleaseAck", static: false, private: false, access: { has: obj => "pleaseAck" in obj, get: obj => obj.pleaseAck, set: (obj, value) => { obj.pleaseAck = value; } }, metadata: _metadata }, _pleaseAck_initializers, _pleaseAck_extraInitializers);
                if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            })(),
            _a;
    })();
    return AckDecoratorExtension;
}
