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
exports.W3cCredential = void 0;
exports.IsCredentialType = IsCredentialType;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const utils_1 = require("../../../../utils");
const validators_1 = require("../../../../utils/validators");
const constants_1 = require("../../constants");
const validators_2 = require("../../validators");
const W3cCredentialSchema_1 = require("./W3cCredentialSchema");
const W3cCredentialStatus_1 = require("./W3cCredentialStatus");
const W3cCredentialSubject_1 = require("./W3cCredentialSubject");
const W3cIssuer_1 = require("./W3cIssuer");
let W3cCredential = (() => {
    var _a;
    let _context_decorators;
    let _context_initializers = [];
    let _context_extraInitializers = [];
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _issuer_decorators;
    let _issuer_initializers = [];
    let _issuer_extraInitializers = [];
    let _issuanceDate_decorators;
    let _issuanceDate_initializers = [];
    let _issuanceDate_extraInitializers = [];
    let _expirationDate_decorators;
    let _expirationDate_initializers = [];
    let _expirationDate_extraInitializers = [];
    let _credentialSubject_decorators;
    let _credentialSubject_initializers = [];
    let _credentialSubject_extraInitializers = [];
    let _credentialSchema_decorators;
    let _credentialSchema_initializers = [];
    let _credentialSchema_extraInitializers = [];
    let _credentialStatus_decorators;
    let _credentialStatus_initializers = [];
    let _credentialStatus_extraInitializers = [];
    return _a = class W3cCredential {
            constructor(options) {
                var _b;
                this.context = __runInitializers(this, _context_initializers, void 0);
                this.id = (__runInitializers(this, _context_extraInitializers), __runInitializers(this, _id_initializers, void 0));
                this.type = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _type_initializers, void 0));
                this.issuer = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _issuer_initializers, void 0));
                this.issuanceDate = (__runInitializers(this, _issuer_extraInitializers), __runInitializers(this, _issuanceDate_initializers, void 0));
                this.expirationDate = (__runInitializers(this, _issuanceDate_extraInitializers), __runInitializers(this, _expirationDate_initializers, void 0));
                this.credentialSubject = (__runInitializers(this, _expirationDate_extraInitializers), __runInitializers(this, _credentialSubject_initializers, void 0));
                this.credentialSchema = (__runInitializers(this, _credentialSubject_extraInitializers), __runInitializers(this, _credentialSchema_initializers, void 0));
                this.credentialStatus = (__runInitializers(this, _credentialSchema_extraInitializers), __runInitializers(this, _credentialStatus_initializers, void 0));
                __runInitializers(this, _credentialStatus_extraInitializers);
                if (options) {
                    this.context = (_b = options.context) !== null && _b !== void 0 ? _b : [constants_1.CREDENTIALS_CONTEXT_V1_URL];
                    this.id = options.id;
                    this.type = options.type || ['VerifiableCredential'];
                    this.issuer =
                        typeof options.issuer === 'string' || options.issuer instanceof W3cIssuer_1.W3cIssuer
                            ? options.issuer
                            : new W3cIssuer_1.W3cIssuer(options.issuer);
                    this.issuanceDate = options.issuanceDate;
                    this.expirationDate = options.expirationDate;
                    this.credentialSubject = (0, utils_1.mapSingleOrArray)(options.credentialSubject, (subject) => subject instanceof W3cCredentialSubject_1.W3cCredentialSubject ? subject : new W3cCredentialSubject_1.W3cCredentialSubject(subject));
                    if (options.credentialStatus) {
                        this.credentialStatus =
                            options.credentialStatus instanceof W3cCredentialStatus_1.W3cCredentialStatus
                                ? options.credentialStatus
                                : new W3cCredentialStatus_1.W3cCredentialStatus(options.credentialStatus);
                    }
                }
            }
            get issuerId() {
                return this.issuer instanceof W3cIssuer_1.W3cIssuer ? this.issuer.id : this.issuer;
            }
            get credentialSchemaIds() {
                if (!this.credentialSchema)
                    return [];
                if (Array.isArray(this.credentialSchema)) {
                    return this.credentialSchema.map((credentialSchema) => credentialSchema.id);
                }
                return [this.credentialSchema.id];
            }
            get credentialSubjectIds() {
                if (Array.isArray(this.credentialSubject)) {
                    return this.credentialSubject
                        .map((credentialSubject) => credentialSubject.id)
                        .filter((v) => v !== undefined);
                }
                return this.credentialSubject.id ? [this.credentialSubject.id] : [];
            }
            get contexts() {
                return (0, utils_1.asArray)(this.context);
            }
            static fromJson(json) {
                return utils_1.JsonTransformer.fromJSON(json, _a);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _context_decorators = [(0, class_transformer_1.Expose)({ name: '@context' }), (0, validators_2.IsCredentialJsonLdContext)()];
            _id_decorators = [(0, class_validator_1.IsOptional)(), (0, validators_1.IsUri)()];
            _type_decorators = [IsCredentialType()];
            _issuer_decorators = [(0, W3cIssuer_1.W3cIssuerTransformer)(), (0, W3cIssuer_1.IsW3cIssuer)()];
            _issuanceDate_decorators = [(0, class_validator_1.IsRFC3339)()];
            _expirationDate_decorators = [(0, class_validator_1.IsRFC3339)(), (0, class_validator_1.IsOptional)()];
            _credentialSubject_decorators = [(0, class_transformer_1.Type)(() => W3cCredentialSubject_1.W3cCredentialSubject), (0, class_validator_1.ValidateNested)({ each: true }), (0, validators_1.IsInstanceOrArrayOfInstances)({ classType: W3cCredentialSubject_1.W3cCredentialSubject })];
            _credentialSchema_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(() => W3cCredentialSchema_1.W3cCredentialSchema), (0, class_validator_1.ValidateNested)({ each: true }), (0, validators_1.IsInstanceOrArrayOfInstances)({ classType: W3cCredentialSchema_1.W3cCredentialSchema, allowEmptyArray: true })];
            _credentialStatus_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(() => W3cCredentialStatus_1.W3cCredentialStatus), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_validator_1.IsInstance)(W3cCredentialStatus_1.W3cCredentialStatus)];
            __esDecorate(null, null, _context_decorators, { kind: "field", name: "context", static: false, private: false, access: { has: obj => "context" in obj, get: obj => obj.context, set: (obj, value) => { obj.context = value; } }, metadata: _metadata }, _context_initializers, _context_extraInitializers);
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _issuer_decorators, { kind: "field", name: "issuer", static: false, private: false, access: { has: obj => "issuer" in obj, get: obj => obj.issuer, set: (obj, value) => { obj.issuer = value; } }, metadata: _metadata }, _issuer_initializers, _issuer_extraInitializers);
            __esDecorate(null, null, _issuanceDate_decorators, { kind: "field", name: "issuanceDate", static: false, private: false, access: { has: obj => "issuanceDate" in obj, get: obj => obj.issuanceDate, set: (obj, value) => { obj.issuanceDate = value; } }, metadata: _metadata }, _issuanceDate_initializers, _issuanceDate_extraInitializers);
            __esDecorate(null, null, _expirationDate_decorators, { kind: "field", name: "expirationDate", static: false, private: false, access: { has: obj => "expirationDate" in obj, get: obj => obj.expirationDate, set: (obj, value) => { obj.expirationDate = value; } }, metadata: _metadata }, _expirationDate_initializers, _expirationDate_extraInitializers);
            __esDecorate(null, null, _credentialSubject_decorators, { kind: "field", name: "credentialSubject", static: false, private: false, access: { has: obj => "credentialSubject" in obj, get: obj => obj.credentialSubject, set: (obj, value) => { obj.credentialSubject = value; } }, metadata: _metadata }, _credentialSubject_initializers, _credentialSubject_extraInitializers);
            __esDecorate(null, null, _credentialSchema_decorators, { kind: "field", name: "credentialSchema", static: false, private: false, access: { has: obj => "credentialSchema" in obj, get: obj => obj.credentialSchema, set: (obj, value) => { obj.credentialSchema = value; } }, metadata: _metadata }, _credentialSchema_initializers, _credentialSchema_extraInitializers);
            __esDecorate(null, null, _credentialStatus_decorators, { kind: "field", name: "credentialStatus", static: false, private: false, access: { has: obj => "credentialStatus" in obj, get: obj => obj.credentialStatus, set: (obj, value) => { obj.credentialStatus = value; } }, metadata: _metadata }, _credentialStatus_initializers, _credentialStatus_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.W3cCredential = W3cCredential;
// Custom validator
function IsCredentialType(validationOptions) {
    return (0, class_validator_1.ValidateBy)({
        name: 'IsVerifiableCredentialType',
        validator: {
            validate: (value) => {
                if (Array.isArray(value)) {
                    return value.includes(constants_1.VERIFIABLE_CREDENTIAL_TYPE);
                }
                return false;
            },
            defaultMessage: (0, class_validator_1.buildMessage)((eachPrefix) => eachPrefix + '$property must be an array of strings which includes "VerifiableCredential"', validationOptions),
        },
    }, validationOptions);
}
