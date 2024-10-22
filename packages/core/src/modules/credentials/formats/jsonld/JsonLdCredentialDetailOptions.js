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
exports.JsonLdCredentialDetailOptions = exports.JsonLdCredentialDetailCredentialStatus = void 0;
const class_validator_1 = require("class-validator");
let JsonLdCredentialDetailCredentialStatus = (() => {
    var _a;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    return _a = class JsonLdCredentialDetailCredentialStatus {
            constructor(options) {
                this.type = __runInitializers(this, _type_initializers, void 0);
                __runInitializers(this, _type_extraInitializers);
                if (options) {
                    this.type = options.type;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.JsonLdCredentialDetailCredentialStatus = JsonLdCredentialDetailCredentialStatus;
let JsonLdCredentialDetailOptions = (() => {
    var _a;
    let _proofPurpose_decorators;
    let _proofPurpose_initializers = [];
    let _proofPurpose_extraInitializers = [];
    let _created_decorators;
    let _created_initializers = [];
    let _created_extraInitializers = [];
    let _domain_decorators;
    let _domain_initializers = [];
    let _domain_extraInitializers = [];
    let _challenge_decorators;
    let _challenge_initializers = [];
    let _challenge_extraInitializers = [];
    let _proofType_decorators;
    let _proofType_initializers = [];
    let _proofType_extraInitializers = [];
    let _credentialStatus_decorators;
    let _credentialStatus_initializers = [];
    let _credentialStatus_extraInitializers = [];
    return _a = class JsonLdCredentialDetailOptions {
            constructor(options) {
                this.proofPurpose = __runInitializers(this, _proofPurpose_initializers, void 0);
                this.created = (__runInitializers(this, _proofPurpose_extraInitializers), __runInitializers(this, _created_initializers, void 0));
                this.domain = (__runInitializers(this, _created_extraInitializers), __runInitializers(this, _domain_initializers, void 0));
                this.challenge = (__runInitializers(this, _domain_extraInitializers), __runInitializers(this, _challenge_initializers, void 0));
                this.proofType = (__runInitializers(this, _challenge_extraInitializers), __runInitializers(this, _proofType_initializers, void 0));
                this.credentialStatus = (__runInitializers(this, _proofType_extraInitializers), __runInitializers(this, _credentialStatus_initializers, void 0));
                __runInitializers(this, _credentialStatus_extraInitializers);
                if (options) {
                    this.proofPurpose = options.proofPurpose;
                    this.created = options.created;
                    this.domain = options.domain;
                    this.challenge = options.challenge;
                    this.credentialStatus = options.credentialStatus;
                    this.proofType = options.proofType;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _proofPurpose_decorators = [(0, class_validator_1.IsString)()];
            _created_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _domain_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _challenge_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _proofType_decorators = [(0, class_validator_1.IsString)()];
            _credentialStatus_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsObject)()];
            __esDecorate(null, null, _proofPurpose_decorators, { kind: "field", name: "proofPurpose", static: false, private: false, access: { has: obj => "proofPurpose" in obj, get: obj => obj.proofPurpose, set: (obj, value) => { obj.proofPurpose = value; } }, metadata: _metadata }, _proofPurpose_initializers, _proofPurpose_extraInitializers);
            __esDecorate(null, null, _created_decorators, { kind: "field", name: "created", static: false, private: false, access: { has: obj => "created" in obj, get: obj => obj.created, set: (obj, value) => { obj.created = value; } }, metadata: _metadata }, _created_initializers, _created_extraInitializers);
            __esDecorate(null, null, _domain_decorators, { kind: "field", name: "domain", static: false, private: false, access: { has: obj => "domain" in obj, get: obj => obj.domain, set: (obj, value) => { obj.domain = value; } }, metadata: _metadata }, _domain_initializers, _domain_extraInitializers);
            __esDecorate(null, null, _challenge_decorators, { kind: "field", name: "challenge", static: false, private: false, access: { has: obj => "challenge" in obj, get: obj => obj.challenge, set: (obj, value) => { obj.challenge = value; } }, metadata: _metadata }, _challenge_initializers, _challenge_extraInitializers);
            __esDecorate(null, null, _proofType_decorators, { kind: "field", name: "proofType", static: false, private: false, access: { has: obj => "proofType" in obj, get: obj => obj.proofType, set: (obj, value) => { obj.proofType = value; } }, metadata: _metadata }, _proofType_initializers, _proofType_extraInitializers);
            __esDecorate(null, null, _credentialStatus_decorators, { kind: "field", name: "credentialStatus", static: false, private: false, access: { has: obj => "credentialStatus" in obj, get: obj => obj.credentialStatus, set: (obj, value) => { obj.credentialStatus = value; } }, metadata: _metadata }, _credentialStatus_initializers, _credentialStatus_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.JsonLdCredentialDetailOptions = JsonLdCredentialDetailOptions;
