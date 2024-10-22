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
exports.JweEnvelope = exports.JweRecipient = void 0;
const core_1 = require("@aries-framework/core");
const class_transformer_1 = require("class-transformer");
let JweRecipient = (() => {
    var _a;
    let _encryptedKey_decorators;
    let _encryptedKey_initializers = [];
    let _encryptedKey_extraInitializers = [];
    return _a = class JweRecipient {
            constructor(options) {
                this.encryptedKey = __runInitializers(this, _encryptedKey_initializers, void 0);
                this.header = __runInitializers(this, _encryptedKey_extraInitializers);
                if (options) {
                    this.encryptedKey = core_1.TypedArrayEncoder.toBase64URL(options.encryptedKey);
                    this.header = options.header;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _encryptedKey_decorators = [(0, class_transformer_1.Expose)({ name: 'encrypted_key' })];
            __esDecorate(null, null, _encryptedKey_decorators, { kind: "field", name: "encryptedKey", static: false, private: false, access: { has: obj => "encryptedKey" in obj, get: obj => obj.encryptedKey, set: (obj, value) => { obj.encryptedKey = value; } }, metadata: _metadata }, _encryptedKey_initializers, _encryptedKey_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.JweRecipient = JweRecipient;
let JweEnvelope = (() => {
    var _a;
    let _recipients_decorators;
    let _recipients_initializers = [];
    let _recipients_extraInitializers = [];
    let _encryptedKey_decorators;
    let _encryptedKey_initializers = [];
    let _encryptedKey_extraInitializers = [];
    return _a = class JweEnvelope {
            constructor(options) {
                this.recipients = __runInitializers(this, _recipients_initializers, void 0);
                this.ciphertext = __runInitializers(this, _recipients_extraInitializers);
                this.encryptedKey = __runInitializers(this, _encryptedKey_initializers, void 0);
                __runInitializers(this, _encryptedKey_extraInitializers);
                if (options) {
                    this.protected = options.protected;
                    this.unprotected = options.unprotected;
                    this.recipients = options.recipients;
                    this.ciphertext = options.ciphertext;
                    this.iv = options.iv;
                    this.tag = options.tag;
                    this.aad = options.aad;
                    this.header = options.header;
                    this.encryptedKey = options.encryptedKey;
                }
            }
            toJson() {
                return core_1.JsonTransformer.toJSON(this);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _recipients_decorators = [(0, class_transformer_1.Type)(() => JweRecipient)];
            _encryptedKey_decorators = [(0, class_transformer_1.Expose)({ name: 'encrypted_key' })];
            __esDecorate(null, null, _recipients_decorators, { kind: "field", name: "recipients", static: false, private: false, access: { has: obj => "recipients" in obj, get: obj => obj.recipients, set: (obj, value) => { obj.recipients = value; } }, metadata: _metadata }, _recipients_initializers, _recipients_extraInitializers);
            __esDecorate(null, null, _encryptedKey_decorators, { kind: "field", name: "encryptedKey", static: false, private: false, access: { has: obj => "encryptedKey" in obj, get: obj => obj.encryptedKey, set: (obj, value) => { obj.encryptedKey = value; } }, metadata: _metadata }, _encryptedKey_initializers, _encryptedKey_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.JweEnvelope = JweEnvelope;
