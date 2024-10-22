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
exports.AckDecorator = exports.AckValues = void 0;
const class_validator_1 = require("class-validator");
var AckValues;
(function (AckValues) {
    AckValues["Receipt"] = "RECEIPT";
    AckValues["Outcome"] = "OUTCOME";
})(AckValues || (exports.AckValues = AckValues = {}));
/**
 * Represents `~please_ack` decorator
 */
let AckDecorator = (() => {
    var _a;
    let _on_decorators;
    let _on_initializers = [];
    let _on_extraInitializers = [];
    return _a = class AckDecorator {
            constructor(options) {
                // pre-aip 2 the on value was not defined yet. We interpret this as
                // the value being set to on receipt
                this.on = __runInitializers(this, _on_initializers, [AckValues.Receipt]);
                __runInitializers(this, _on_extraInitializers);
                if (options) {
                    this.on = options.on;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _on_decorators = [(0, class_validator_1.IsEnum)(AckValues, { each: true }), (0, class_validator_1.IsArray)()];
            __esDecorate(null, null, _on_decorators, { kind: "field", name: "on", static: false, private: false, access: { has: obj => "on" in obj, get: obj => obj.on, set: (obj, value) => { obj.on = value; } }, metadata: _metadata }, _on_initializers, _on_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.AckDecorator = AckDecorator;
