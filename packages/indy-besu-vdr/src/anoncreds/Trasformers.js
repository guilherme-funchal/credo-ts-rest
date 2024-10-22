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
exports.CredentialDefinitionValue = void 0;
const class_validator_1 = require("class-validator");
let CredentialDefinitionValue = (() => {
    var _a;
    let _primary_decorators;
    let _primary_initializers = [];
    let _primary_extraInitializers = [];
    let _revocation_decorators;
    let _revocation_initializers = [];
    let _revocation_extraInitializers = [];
    return _a = class CredentialDefinitionValue {
            constructor(primary, revocation) {
                this.primary = __runInitializers(this, _primary_initializers, void 0);
                this.revocation = (__runInitializers(this, _primary_extraInitializers), __runInitializers(this, _revocation_initializers, void 0));
                __runInitializers(this, _revocation_extraInitializers);
                this.primary = primary;
                this.revocation = revocation;
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _primary_decorators = [(0, class_validator_1.IsObject)()];
            _revocation_decorators = [(0, class_validator_1.IsObject)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _primary_decorators, { kind: "field", name: "primary", static: false, private: false, access: { has: obj => "primary" in obj, get: obj => obj.primary, set: (obj, value) => { obj.primary = value; } }, metadata: _metadata }, _primary_initializers, _primary_extraInitializers);
            __esDecorate(null, null, _revocation_decorators, { kind: "field", name: "revocation", static: false, private: false, access: { has: obj => "revocation" in obj, get: obj => obj.revocation, set: (obj, value) => { obj.revocation = value; } }, metadata: _metadata }, _revocation_initializers, _revocation_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CredentialDefinitionValue = CredentialDefinitionValue;
