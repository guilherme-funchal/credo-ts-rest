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
exports.EmbeddedAuthentication = void 0;
const class_validator_1 = require("class-validator");
const PublicKey_1 = require("../publicKey/PublicKey");
const Authentication_1 = require("./Authentication");
let EmbeddedAuthentication = (() => {
    var _a;
    let _classSuper = Authentication_1.Authentication;
    let _publicKey_decorators;
    let _publicKey_initializers = [];
    let _publicKey_extraInitializers = [];
    return _a = class EmbeddedAuthentication extends _classSuper {
            constructor(publicKey) {
                super();
                this.publicKey = __runInitializers(this, _publicKey_initializers, void 0);
                __runInitializers(this, _publicKey_extraInitializers);
                this.publicKey = publicKey;
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _publicKey_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.ValidateNested)(), (0, class_validator_1.IsInstance)(PublicKey_1.PublicKey)];
            __esDecorate(null, null, _publicKey_decorators, { kind: "field", name: "publicKey", static: false, private: false, access: { has: obj => "publicKey" in obj, get: obj => obj.publicKey, set: (obj, value) => { obj.publicKey = value; } }, metadata: _metadata }, _publicKey_initializers, _publicKey_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.EmbeddedAuthentication = EmbeddedAuthentication;
