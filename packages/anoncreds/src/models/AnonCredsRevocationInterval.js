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
exports.AnonCredsRevocationInterval = void 0;
const class_validator_1 = require("class-validator");
let AnonCredsRevocationInterval = (() => {
    var _a;
    let _from_decorators;
    let _from_initializers = [];
    let _from_extraInitializers = [];
    let _to_decorators;
    let _to_initializers = [];
    let _to_extraInitializers = [];
    return _a = class AnonCredsRevocationInterval {
            constructor(options) {
                this.from = __runInitializers(this, _from_initializers, void 0);
                this.to = (__runInitializers(this, _from_extraInitializers), __runInitializers(this, _to_initializers, void 0));
                __runInitializers(this, _to_extraInitializers);
                if (options) {
                    this.from = options.from;
                    this.to = options.to;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _from_decorators = [(0, class_validator_1.IsInt)(), (0, class_validator_1.IsOptional)()];
            _to_decorators = [(0, class_validator_1.IsInt)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _from_decorators, { kind: "field", name: "from", static: false, private: false, access: { has: obj => "from" in obj, get: obj => obj.from, set: (obj, value) => { obj.from = value; } }, metadata: _metadata }, _from_initializers, _from_extraInitializers);
            __esDecorate(null, null, _to_decorators, { kind: "field", name: "to", static: false, private: false, access: { has: obj => "to" in obj, get: obj => obj.to, set: (obj, value) => { obj.to = value; } }, metadata: _metadata }, _to_initializers, _to_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.AnonCredsRevocationInterval = AnonCredsRevocationInterval;
