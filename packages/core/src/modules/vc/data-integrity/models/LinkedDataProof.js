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
exports.LinkedDataProof = void 0;
exports.LinkedDataProofTransformer = LinkedDataProofTransformer;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const utils_1 = require("../../../../utils");
/**
 * Linked Data Proof
 * @see https://w3c.github.io/vc-data-model/#proofs-signatures
 *
 * @class LinkedDataProof
 */
let LinkedDataProof = (() => {
    var _a;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _proofPurpose_decorators;
    let _proofPurpose_initializers = [];
    let _proofPurpose_extraInitializers = [];
    let _verificationMethod_decorators;
    let _verificationMethod_initializers = [];
    let _verificationMethod_extraInitializers = [];
    let _created_decorators;
    let _created_initializers = [];
    let _created_extraInitializers = [];
    let _domain_decorators;
    let _domain_initializers = [];
    let _domain_extraInitializers = [];
    let _challenge_decorators;
    let _challenge_initializers = [];
    let _challenge_extraInitializers = [];
    let _jws_decorators;
    let _jws_initializers = [];
    let _jws_extraInitializers = [];
    let _proofValue_decorators;
    let _proofValue_initializers = [];
    let _proofValue_extraInitializers = [];
    let _nonce_decorators;
    let _nonce_initializers = [];
    let _nonce_extraInitializers = [];
    return _a = class LinkedDataProof {
            constructor(options) {
                this.type = __runInitializers(this, _type_initializers, void 0);
                this.proofPurpose = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _proofPurpose_initializers, void 0));
                this.verificationMethod = (__runInitializers(this, _proofPurpose_extraInitializers), __runInitializers(this, _verificationMethod_initializers, void 0));
                this.created = (__runInitializers(this, _verificationMethod_extraInitializers), __runInitializers(this, _created_initializers, void 0));
                this.domain = (__runInitializers(this, _created_extraInitializers), __runInitializers(this, _domain_initializers, void 0));
                this.challenge = (__runInitializers(this, _domain_extraInitializers), __runInitializers(this, _challenge_initializers, void 0));
                this.jws = (__runInitializers(this, _challenge_extraInitializers), __runInitializers(this, _jws_initializers, void 0));
                this.proofValue = (__runInitializers(this, _jws_extraInitializers), __runInitializers(this, _proofValue_initializers, void 0));
                this.nonce = (__runInitializers(this, _proofValue_extraInitializers), __runInitializers(this, _nonce_initializers, void 0));
                __runInitializers(this, _nonce_extraInitializers);
                if (options) {
                    this.type = options.type;
                    this.proofPurpose = options.proofPurpose;
                    this.verificationMethod = options.verificationMethod;
                    this.created = options.created;
                    this.domain = options.domain;
                    this.challenge = options.challenge;
                    this.jws = options.jws;
                    this.proofValue = options.proofValue;
                    this.nonce = options.nonce;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [(0, class_validator_1.IsString)()];
            _proofPurpose_decorators = [(0, class_validator_1.IsString)()];
            _verificationMethod_decorators = [(0, class_validator_1.IsString)()];
            _created_decorators = [(0, class_validator_1.IsString)()];
            _domain_decorators = [(0, utils_1.IsUri)(), (0, class_validator_1.IsOptional)()];
            _challenge_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _jws_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _proofValue_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _nonce_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _proofPurpose_decorators, { kind: "field", name: "proofPurpose", static: false, private: false, access: { has: obj => "proofPurpose" in obj, get: obj => obj.proofPurpose, set: (obj, value) => { obj.proofPurpose = value; } }, metadata: _metadata }, _proofPurpose_initializers, _proofPurpose_extraInitializers);
            __esDecorate(null, null, _verificationMethod_decorators, { kind: "field", name: "verificationMethod", static: false, private: false, access: { has: obj => "verificationMethod" in obj, get: obj => obj.verificationMethod, set: (obj, value) => { obj.verificationMethod = value; } }, metadata: _metadata }, _verificationMethod_initializers, _verificationMethod_extraInitializers);
            __esDecorate(null, null, _created_decorators, { kind: "field", name: "created", static: false, private: false, access: { has: obj => "created" in obj, get: obj => obj.created, set: (obj, value) => { obj.created = value; } }, metadata: _metadata }, _created_initializers, _created_extraInitializers);
            __esDecorate(null, null, _domain_decorators, { kind: "field", name: "domain", static: false, private: false, access: { has: obj => "domain" in obj, get: obj => obj.domain, set: (obj, value) => { obj.domain = value; } }, metadata: _metadata }, _domain_initializers, _domain_extraInitializers);
            __esDecorate(null, null, _challenge_decorators, { kind: "field", name: "challenge", static: false, private: false, access: { has: obj => "challenge" in obj, get: obj => obj.challenge, set: (obj, value) => { obj.challenge = value; } }, metadata: _metadata }, _challenge_initializers, _challenge_extraInitializers);
            __esDecorate(null, null, _jws_decorators, { kind: "field", name: "jws", static: false, private: false, access: { has: obj => "jws" in obj, get: obj => obj.jws, set: (obj, value) => { obj.jws = value; } }, metadata: _metadata }, _jws_initializers, _jws_extraInitializers);
            __esDecorate(null, null, _proofValue_decorators, { kind: "field", name: "proofValue", static: false, private: false, access: { has: obj => "proofValue" in obj, get: obj => obj.proofValue, set: (obj, value) => { obj.proofValue = value; } }, metadata: _metadata }, _proofValue_initializers, _proofValue_extraInitializers);
            __esDecorate(null, null, _nonce_decorators, { kind: "field", name: "nonce", static: false, private: false, access: { has: obj => "nonce" in obj, get: obj => obj.nonce, set: (obj, value) => { obj.nonce = value; } }, metadata: _metadata }, _nonce_initializers, _nonce_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.LinkedDataProof = LinkedDataProof;
// Custom transformers
function LinkedDataProofTransformer() {
    return (0, class_transformer_1.Transform)(({ value, type }) => {
        if (type === class_transformer_1.TransformationType.PLAIN_TO_CLASS) {
            if (Array.isArray(value))
                return value.map((v) => (0, class_transformer_1.plainToInstance)(LinkedDataProof, v));
            return (0, class_transformer_1.plainToInstance)(LinkedDataProof, value);
        }
        else if (type === class_transformer_1.TransformationType.CLASS_TO_PLAIN) {
            if (Array.isArray(value))
                return value.map((v) => (0, class_transformer_1.instanceToPlain)(v));
            return (0, class_transformer_1.instanceToPlain)(value);
        }
        // PLAIN_TO_PLAIN
        return value;
    });
}
