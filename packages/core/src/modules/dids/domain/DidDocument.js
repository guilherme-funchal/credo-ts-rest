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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DidDocument = void 0;
exports.keyReferenceToKey = keyReferenceToKey;
exports.findVerificationMethodByKeyType = findVerificationMethodByKeyType;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const Key_1 = require("../../../crypto/Key");
const KeyType_1 = require("../../../crypto/KeyType");
const error_1 = require("../../../error");
const JsonTransformer_1 = require("../../../utils/JsonTransformer");
const transformers_1 = require("../../../utils/transformers");
const key_type_1 = require("./key-type");
const service_1 = require("./service");
const verificationMethod_1 = require("./verificationMethod");
let DidDocument = (() => {
    var _a;
    let _context_decorators;
    let _context_initializers = [];
    let _context_extraInitializers = [];
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _alsoKnownAs_decorators;
    let _alsoKnownAs_initializers = [];
    let _alsoKnownAs_extraInitializers = [];
    let _controller_decorators;
    let _controller_initializers = [];
    let _controller_extraInitializers = [];
    let _verificationMethod_decorators;
    let _verificationMethod_initializers = [];
    let _verificationMethod_extraInitializers = [];
    let _service_decorators;
    let _service_initializers = [];
    let _service_extraInitializers = [];
    let _authentication_decorators;
    let _authentication_initializers = [];
    let _authentication_extraInitializers = [];
    let _assertionMethod_decorators;
    let _assertionMethod_initializers = [];
    let _assertionMethod_extraInitializers = [];
    let _keyAgreement_decorators;
    let _keyAgreement_initializers = [];
    let _keyAgreement_extraInitializers = [];
    let _capabilityInvocation_decorators;
    let _capabilityInvocation_initializers = [];
    let _capabilityInvocation_extraInitializers = [];
    let _capabilityDelegation_decorators;
    let _capabilityDelegation_initializers = [];
    let _capabilityDelegation_extraInitializers = [];
    return _a = class DidDocument {
            constructor(options) {
                var _b;
                this.context = __runInitializers(this, _context_initializers, ['https://w3id.org/did/v1']);
                this.id = (__runInitializers(this, _context_extraInitializers), __runInitializers(this, _id_initializers, void 0));
                this.alsoKnownAs = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _alsoKnownAs_initializers, void 0));
                this.controller = (__runInitializers(this, _alsoKnownAs_extraInitializers), __runInitializers(this, _controller_initializers, void 0));
                this.verificationMethod = (__runInitializers(this, _controller_extraInitializers), __runInitializers(this, _verificationMethod_initializers, void 0));
                this.service = (__runInitializers(this, _verificationMethod_extraInitializers), __runInitializers(this, _service_initializers, void 0));
                this.authentication = (__runInitializers(this, _service_extraInitializers), __runInitializers(this, _authentication_initializers, void 0));
                this.assertionMethod = (__runInitializers(this, _authentication_extraInitializers), __runInitializers(this, _assertionMethod_initializers, void 0));
                this.keyAgreement = (__runInitializers(this, _assertionMethod_extraInitializers), __runInitializers(this, _keyAgreement_initializers, void 0));
                this.capabilityInvocation = (__runInitializers(this, _keyAgreement_extraInitializers), __runInitializers(this, _capabilityInvocation_initializers, void 0));
                this.capabilityDelegation = (__runInitializers(this, _capabilityInvocation_extraInitializers), __runInitializers(this, _capabilityDelegation_initializers, void 0));
                __runInitializers(this, _capabilityDelegation_extraInitializers);
                if (options) {
                    this.context = (_b = options.context) !== null && _b !== void 0 ? _b : this.context;
                    this.id = options.id;
                    this.alsoKnownAs = options.alsoKnownAs;
                    this.controller = options.controller;
                    this.verificationMethod = options.verificationMethod;
                    this.service = options.service;
                    this.authentication = options.authentication;
                    this.assertionMethod = options.assertionMethod;
                    this.keyAgreement = options.keyAgreement;
                    this.capabilityInvocation = options.capabilityInvocation;
                    this.capabilityDelegation = options.capabilityDelegation;
                }
            }
            dereferenceVerificationMethod(keyId) {
                var _b;
                // TODO: once we use JSON-LD we should use that to resolve references in did documents.
                // for now we check whether the key id ends with the keyId.
                // so if looking for #123 and key.id is did:key:123#123, it is valid. But #123 as key.id is also valid
                const verificationMethod = (_b = this.verificationMethod) === null || _b === void 0 ? void 0 : _b.find((key) => key.id.endsWith(keyId));
                if (!verificationMethod) {
                    throw new error_1.AriesFrameworkError(`Unable to locate verification method with id '${keyId}'`);
                }
                return verificationMethod;
            }
            dereferenceKey(keyId, allowedPurposes) {
                var _b;
                const allPurposes = [
                    'authentication',
                    'keyAgreement',
                    'assertionMethod',
                    'capabilityInvocation',
                    'capabilityDelegation',
                ];
                const purposes = allowedPurposes !== null && allowedPurposes !== void 0 ? allowedPurposes : allPurposes;
                for (const purpose of purposes) {
                    for (const key of (_b = this[purpose]) !== null && _b !== void 0 ? _b : []) {
                        if (typeof key === 'string' && key.endsWith(keyId)) {
                            return this.dereferenceVerificationMethod(key);
                        }
                        else if (typeof key !== 'string' && key.id.endsWith(keyId)) {
                            return key;
                        }
                    }
                }
                throw new error_1.AriesFrameworkError(`Unable to locate verification method with id '${keyId}' in purposes ${purposes}`);
            }
            /**
             * Returns all of the service endpoints matching the given type.
             *
             * @param type The type of service(s) to query.
             */
            getServicesByType(type) {
                var _b, _c;
                return ((_c = (_b = this.service) === null || _b === void 0 ? void 0 : _b.filter((service) => service.type === type)) !== null && _c !== void 0 ? _c : []);
            }
            /**
             * Returns all of the service endpoints matching the given class
             *
             * @param classType The class to query services.
             */
            getServicesByClassType(classType) {
                var _b, _c;
                return ((_c = (_b = this.service) === null || _b === void 0 ? void 0 : _b.filter((service) => service instanceof classType)) !== null && _c !== void 0 ? _c : []);
            }
            /**
             * Get all DIDComm services ordered by priority descending. This means the highest
             * priority will be the first entry.
             */
            get didCommServices() {
                var _b, _c;
                const didCommServiceTypes = [service_1.IndyAgentService.type, service_1.DidCommV1Service.type];
                const services = ((_c = (_b = this.service) === null || _b === void 0 ? void 0 : _b.filter((service) => didCommServiceTypes.includes(service.type))) !== null && _c !== void 0 ? _c : []);
                // Sort services based on indicated priority
                return services.sort((a, b) => a.priority - b.priority);
            }
            // TODO: it would probably be easier if we add a utility to each service so we don't have to handle logic for all service types here
            get recipientKeys() {
                let recipientKeys = [];
                for (const service of this.didCommServices) {
                    if (service instanceof service_1.IndyAgentService) {
                        recipientKeys = [
                            ...recipientKeys,
                            ...service.recipientKeys.map((publicKeyBase58) => Key_1.Key.fromPublicKeyBase58(publicKeyBase58, KeyType_1.KeyType.Ed25519)),
                        ];
                    }
                    else if (service instanceof service_1.DidCommV1Service) {
                        recipientKeys = [
                            ...recipientKeys,
                            ...service.recipientKeys.map((recipientKey) => keyReferenceToKey(this, recipientKey)),
                        ];
                    }
                }
                return recipientKeys;
            }
            toJSON() {
                return JsonTransformer_1.JsonTransformer.toJSON(this);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _context_decorators = [(0, class_transformer_1.Expose)({ name: '@context' }), (0, transformers_1.IsStringOrStringArray)()];
            _id_decorators = [(0, class_validator_1.IsString)()];
            _alsoKnownAs_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true }), (0, class_validator_1.IsOptional)()];
            _controller_decorators = [(0, transformers_1.IsStringOrStringArray)(), (0, class_validator_1.IsOptional)()];
            _verificationMethod_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(() => verificationMethod_1.VerificationMethod), (0, class_validator_1.IsOptional)()];
            _service_decorators = [(0, class_validator_1.IsArray)(), (0, service_1.ServiceTransformer)(), (0, class_validator_1.IsOptional)()];
            _authentication_decorators = [(0, class_validator_1.IsArray)(), (0, verificationMethod_1.VerificationMethodTransformer)(), (0, verificationMethod_1.IsStringOrVerificationMethod)({ each: true }), (0, class_validator_1.IsOptional)()];
            _assertionMethod_decorators = [(0, class_validator_1.IsArray)(), (0, verificationMethod_1.VerificationMethodTransformer)(), (0, verificationMethod_1.IsStringOrVerificationMethod)({ each: true }), (0, class_validator_1.IsOptional)()];
            _keyAgreement_decorators = [(0, class_validator_1.IsArray)(), (0, verificationMethod_1.VerificationMethodTransformer)(), (0, verificationMethod_1.IsStringOrVerificationMethod)({ each: true }), (0, class_validator_1.IsOptional)()];
            _capabilityInvocation_decorators = [(0, class_validator_1.IsArray)(), (0, verificationMethod_1.VerificationMethodTransformer)(), (0, verificationMethod_1.IsStringOrVerificationMethod)({ each: true }), (0, class_validator_1.IsOptional)()];
            _capabilityDelegation_decorators = [(0, class_validator_1.IsArray)(), (0, verificationMethod_1.VerificationMethodTransformer)(), (0, verificationMethod_1.IsStringOrVerificationMethod)({ each: true }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _context_decorators, { kind: "field", name: "context", static: false, private: false, access: { has: obj => "context" in obj, get: obj => obj.context, set: (obj, value) => { obj.context = value; } }, metadata: _metadata }, _context_initializers, _context_extraInitializers);
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _alsoKnownAs_decorators, { kind: "field", name: "alsoKnownAs", static: false, private: false, access: { has: obj => "alsoKnownAs" in obj, get: obj => obj.alsoKnownAs, set: (obj, value) => { obj.alsoKnownAs = value; } }, metadata: _metadata }, _alsoKnownAs_initializers, _alsoKnownAs_extraInitializers);
            __esDecorate(null, null, _controller_decorators, { kind: "field", name: "controller", static: false, private: false, access: { has: obj => "controller" in obj, get: obj => obj.controller, set: (obj, value) => { obj.controller = value; } }, metadata: _metadata }, _controller_initializers, _controller_extraInitializers);
            __esDecorate(null, null, _verificationMethod_decorators, { kind: "field", name: "verificationMethod", static: false, private: false, access: { has: obj => "verificationMethod" in obj, get: obj => obj.verificationMethod, set: (obj, value) => { obj.verificationMethod = value; } }, metadata: _metadata }, _verificationMethod_initializers, _verificationMethod_extraInitializers);
            __esDecorate(null, null, _service_decorators, { kind: "field", name: "service", static: false, private: false, access: { has: obj => "service" in obj, get: obj => obj.service, set: (obj, value) => { obj.service = value; } }, metadata: _metadata }, _service_initializers, _service_extraInitializers);
            __esDecorate(null, null, _authentication_decorators, { kind: "field", name: "authentication", static: false, private: false, access: { has: obj => "authentication" in obj, get: obj => obj.authentication, set: (obj, value) => { obj.authentication = value; } }, metadata: _metadata }, _authentication_initializers, _authentication_extraInitializers);
            __esDecorate(null, null, _assertionMethod_decorators, { kind: "field", name: "assertionMethod", static: false, private: false, access: { has: obj => "assertionMethod" in obj, get: obj => obj.assertionMethod, set: (obj, value) => { obj.assertionMethod = value; } }, metadata: _metadata }, _assertionMethod_initializers, _assertionMethod_extraInitializers);
            __esDecorate(null, null, _keyAgreement_decorators, { kind: "field", name: "keyAgreement", static: false, private: false, access: { has: obj => "keyAgreement" in obj, get: obj => obj.keyAgreement, set: (obj, value) => { obj.keyAgreement = value; } }, metadata: _metadata }, _keyAgreement_initializers, _keyAgreement_extraInitializers);
            __esDecorate(null, null, _capabilityInvocation_decorators, { kind: "field", name: "capabilityInvocation", static: false, private: false, access: { has: obj => "capabilityInvocation" in obj, get: obj => obj.capabilityInvocation, set: (obj, value) => { obj.capabilityInvocation = value; } }, metadata: _metadata }, _capabilityInvocation_initializers, _capabilityInvocation_extraInitializers);
            __esDecorate(null, null, _capabilityDelegation_decorators, { kind: "field", name: "capabilityDelegation", static: false, private: false, access: { has: obj => "capabilityDelegation" in obj, get: obj => obj.capabilityDelegation, set: (obj, value) => { obj.capabilityDelegation = value; } }, metadata: _metadata }, _capabilityDelegation_initializers, _capabilityDelegation_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.DidDocument = DidDocument;
function keyReferenceToKey(didDocument, keyId) {
    // FIXME: we allow authentication keys as historically ed25519 keys have been used in did documents
    // for didcomm. In the future we should update this to only be allowed for IndyAgent and DidCommV1 services
    // as didcomm v2 doesn't have this issue anymore
    const verificationMethod = didDocument.dereferenceKey(keyId, ['authentication', 'keyAgreement']);
    const key = (0, key_type_1.getKeyFromVerificationMethod)(verificationMethod);
    return key;
}
/**
 * Extracting the verification method for signature type
 * @param type Signature type
 * @param didDocument DidDocument
 * @returns verification method
 */
function findVerificationMethodByKeyType(keyType, didDocument) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c, _d, e_2, _e, _f;
        const didVerificationMethods = [
            'verificationMethod',
            'authentication',
            'keyAgreement',
            'assertionMethod',
            'capabilityInvocation',
            'capabilityDelegation',
        ];
        try {
            for (var _g = true, didVerificationMethods_1 = __asyncValues(didVerificationMethods), didVerificationMethods_1_1; didVerificationMethods_1_1 = yield didVerificationMethods_1.next(), _a = didVerificationMethods_1_1.done, !_a; _g = true) {
                _c = didVerificationMethods_1_1.value;
                _g = false;
                const purpose = _c;
                const key = didDocument[purpose];
                if (key instanceof Array) {
                    try {
                        for (var _h = true, key_1 = (e_2 = void 0, __asyncValues(key)), key_1_1; key_1_1 = yield key_1.next(), _d = key_1_1.done, !_d; _h = true) {
                            _f = key_1_1.value;
                            _h = false;
                            const method = _f;
                            if (typeof method !== 'string') {
                                if (method.type === keyType) {
                                    return method;
                                }
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (!_h && !_d && (_e = key_1.return)) yield _e.call(key_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_g && !_a && (_b = didVerificationMethods_1.return)) yield _b.call(didVerificationMethods_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    });
}
