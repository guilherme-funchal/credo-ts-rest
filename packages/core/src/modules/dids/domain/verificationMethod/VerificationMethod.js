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
exports.VerificationMethod = void 0;
const class_validator_1 = require("class-validator");
let VerificationMethod = (() => {
    var _a;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _controller_decorators;
    let _controller_initializers = [];
    let _controller_extraInitializers = [];
    let _publicKeyBase58_decorators;
    let _publicKeyBase58_initializers = [];
    let _publicKeyBase58_extraInitializers = [];
    let _publicKeyBase64_decorators;
    let _publicKeyBase64_initializers = [];
    let _publicKeyBase64_extraInitializers = [];
    let _publicKeyHex_decorators;
    let _publicKeyHex_initializers = [];
    let _publicKeyHex_extraInitializers = [];
    let _publicKeyMultibase_decorators;
    let _publicKeyMultibase_initializers = [];
    let _publicKeyMultibase_extraInitializers = [];
    let _publicKeyPem_decorators;
    let _publicKeyPem_initializers = [];
    let _publicKeyPem_extraInitializers = [];
    let _blockchainAccountId_decorators;
    let _blockchainAccountId_initializers = [];
    let _blockchainAccountId_extraInitializers = [];
    let _ethereumAddress_decorators;
    let _ethereumAddress_initializers = [];
    let _ethereumAddress_extraInitializers = [];
    return _a = class VerificationMethod {
            constructor(options) {
                this.id = __runInitializers(this, _id_initializers, void 0);
                this.type = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _type_initializers, void 0));
                this.controller = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _controller_initializers, void 0));
                this.publicKeyBase58 = (__runInitializers(this, _controller_extraInitializers), __runInitializers(this, _publicKeyBase58_initializers, void 0));
                this.publicKeyBase64 = (__runInitializers(this, _publicKeyBase58_extraInitializers), __runInitializers(this, _publicKeyBase64_initializers, void 0));
                // TODO: validation of JWK
                this.publicKeyJwk = __runInitializers(this, _publicKeyBase64_extraInitializers);
                this.publicKeyHex = __runInitializers(this, _publicKeyHex_initializers, void 0);
                this.publicKeyMultibase = (__runInitializers(this, _publicKeyHex_extraInitializers), __runInitializers(this, _publicKeyMultibase_initializers, void 0));
                this.publicKeyPem = (__runInitializers(this, _publicKeyMultibase_extraInitializers), __runInitializers(this, _publicKeyPem_initializers, void 0));
                this.blockchainAccountId = (__runInitializers(this, _publicKeyPem_extraInitializers), __runInitializers(this, _blockchainAccountId_initializers, void 0));
                this.ethereumAddress = (__runInitializers(this, _blockchainAccountId_extraInitializers), __runInitializers(this, _ethereumAddress_initializers, void 0));
                __runInitializers(this, _ethereumAddress_extraInitializers);
                if (options) {
                    this.id = options.id;
                    this.type = options.type;
                    this.controller = options.controller;
                    this.publicKeyBase58 = options.publicKeyBase58;
                    this.publicKeyBase64 = options.publicKeyBase64;
                    this.publicKeyJwk = options.publicKeyJwk;
                    this.publicKeyHex = options.publicKeyHex;
                    this.publicKeyMultibase = options.publicKeyMultibase;
                    this.publicKeyPem = options.publicKeyPem;
                    this.blockchainAccountId = options.blockchainAccountId;
                    this.ethereumAddress = options.ethereumAddress;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, class_validator_1.IsString)()];
            _type_decorators = [(0, class_validator_1.IsString)()];
            _controller_decorators = [(0, class_validator_1.IsString)()];
            _publicKeyBase58_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _publicKeyBase64_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _publicKeyHex_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _publicKeyMultibase_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _publicKeyPem_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _blockchainAccountId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _ethereumAddress_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _controller_decorators, { kind: "field", name: "controller", static: false, private: false, access: { has: obj => "controller" in obj, get: obj => obj.controller, set: (obj, value) => { obj.controller = value; } }, metadata: _metadata }, _controller_initializers, _controller_extraInitializers);
            __esDecorate(null, null, _publicKeyBase58_decorators, { kind: "field", name: "publicKeyBase58", static: false, private: false, access: { has: obj => "publicKeyBase58" in obj, get: obj => obj.publicKeyBase58, set: (obj, value) => { obj.publicKeyBase58 = value; } }, metadata: _metadata }, _publicKeyBase58_initializers, _publicKeyBase58_extraInitializers);
            __esDecorate(null, null, _publicKeyBase64_decorators, { kind: "field", name: "publicKeyBase64", static: false, private: false, access: { has: obj => "publicKeyBase64" in obj, get: obj => obj.publicKeyBase64, set: (obj, value) => { obj.publicKeyBase64 = value; } }, metadata: _metadata }, _publicKeyBase64_initializers, _publicKeyBase64_extraInitializers);
            __esDecorate(null, null, _publicKeyHex_decorators, { kind: "field", name: "publicKeyHex", static: false, private: false, access: { has: obj => "publicKeyHex" in obj, get: obj => obj.publicKeyHex, set: (obj, value) => { obj.publicKeyHex = value; } }, metadata: _metadata }, _publicKeyHex_initializers, _publicKeyHex_extraInitializers);
            __esDecorate(null, null, _publicKeyMultibase_decorators, { kind: "field", name: "publicKeyMultibase", static: false, private: false, access: { has: obj => "publicKeyMultibase" in obj, get: obj => obj.publicKeyMultibase, set: (obj, value) => { obj.publicKeyMultibase = value; } }, metadata: _metadata }, _publicKeyMultibase_initializers, _publicKeyMultibase_extraInitializers);
            __esDecorate(null, null, _publicKeyPem_decorators, { kind: "field", name: "publicKeyPem", static: false, private: false, access: { has: obj => "publicKeyPem" in obj, get: obj => obj.publicKeyPem, set: (obj, value) => { obj.publicKeyPem = value; } }, metadata: _metadata }, _publicKeyPem_initializers, _publicKeyPem_extraInitializers);
            __esDecorate(null, null, _blockchainAccountId_decorators, { kind: "field", name: "blockchainAccountId", static: false, private: false, access: { has: obj => "blockchainAccountId" in obj, get: obj => obj.blockchainAccountId, set: (obj, value) => { obj.blockchainAccountId = value; } }, metadata: _metadata }, _blockchainAccountId_initializers, _blockchainAccountId_extraInitializers);
            __esDecorate(null, null, _ethereumAddress_decorators, { kind: "field", name: "ethereumAddress", static: false, private: false, access: { has: obj => "ethereumAddress" in obj, get: obj => obj.ethereumAddress, set: (obj, value) => { obj.ethereumAddress = value; } }, metadata: _metadata }, _ethereumAddress_initializers, _ethereumAddress_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.VerificationMethod = VerificationMethod;
