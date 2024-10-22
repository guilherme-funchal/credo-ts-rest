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
exports.AnonCredsProofRequest = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const utils_1 = require("../utils");
const AnonCredsRequestedAttribute_1 = require("./AnonCredsRequestedAttribute");
const AnonCredsRequestedPredicate_1 = require("./AnonCredsRequestedPredicate");
const AnonCredsRevocationInterval_1 = require("./AnonCredsRevocationInterval");
/**
 * Proof Request for AnonCreds based proof format
 */
let AnonCredsProofRequest = (() => {
    var _a;
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _version_decorators;
    let _version_initializers = [];
    let _version_extraInitializers = [];
    let _nonce_decorators;
    let _nonce_initializers = [];
    let _nonce_extraInitializers = [];
    let _requestedAttributes_decorators;
    let _requestedAttributes_initializers = [];
    let _requestedAttributes_extraInitializers = [];
    let _requestedPredicates_decorators;
    let _requestedPredicates_initializers = [];
    let _requestedPredicates_extraInitializers = [];
    let _nonRevoked_decorators;
    let _nonRevoked_initializers = [];
    let _nonRevoked_extraInitializers = [];
    let _ver_decorators;
    let _ver_initializers = [];
    let _ver_extraInitializers = [];
    return _a = class AnonCredsProofRequest {
            constructor(options) {
                var _b, _c;
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.version = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _version_initializers, void 0));
                this.nonce = (__runInitializers(this, _version_extraInitializers), __runInitializers(this, _nonce_initializers, void 0));
                this.requestedAttributes = (__runInitializers(this, _nonce_extraInitializers), __runInitializers(this, _requestedAttributes_initializers, void 0));
                this.requestedPredicates = (__runInitializers(this, _requestedAttributes_extraInitializers), __runInitializers(this, _requestedPredicates_initializers, void 0));
                this.nonRevoked = (__runInitializers(this, _requestedPredicates_extraInitializers), __runInitializers(this, _nonRevoked_initializers, void 0));
                this.ver = (__runInitializers(this, _nonRevoked_extraInitializers), __runInitializers(this, _ver_initializers, void 0));
                __runInitializers(this, _ver_extraInitializers);
                if (options) {
                    this.name = options.name;
                    this.version = options.version;
                    this.nonce = options.nonce;
                    this.requestedAttributes = new Map(Object.entries((_b = options.requestedAttributes) !== null && _b !== void 0 ? _b : {}).map(([key, attribute]) => [
                        key,
                        new AnonCredsRequestedAttribute_1.AnonCredsRequestedAttribute(attribute),
                    ]));
                    this.requestedPredicates = new Map(Object.entries((_c = options.requestedPredicates) !== null && _c !== void 0 ? _c : {}).map(([key, predicate]) => [
                        key,
                        new AnonCredsRequestedPredicate_1.AnonCredsRequestedPredicate(predicate),
                    ]));
                    this.nonRevoked = options.nonRevoked ? new AnonCredsRevocationInterval_1.AnonCredsRevocationInterval(options.nonRevoked) : undefined;
                    this.ver = options.ver;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)()];
            _version_decorators = [(0, class_validator_1.IsString)()];
            _nonce_decorators = [(0, class_validator_1.IsString)()];
            _requestedAttributes_decorators = [(0, class_transformer_1.Expose)({ name: 'requested_attributes' }), (0, utils_1.IsMap)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(() => AnonCredsRequestedAttribute_1.AnonCredsRequestedAttribute)];
            _requestedPredicates_decorators = [(0, class_transformer_1.Expose)({ name: 'requested_predicates' }), (0, utils_1.IsMap)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(() => AnonCredsRequestedPredicate_1.AnonCredsRequestedPredicate)];
            _nonRevoked_decorators = [(0, class_transformer_1.Expose)({ name: 'non_revoked' }), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => AnonCredsRevocationInterval_1.AnonCredsRevocationInterval), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInstance)(AnonCredsRevocationInterval_1.AnonCredsRevocationInterval)];
            _ver_decorators = [(0, class_validator_1.IsIn)(['1.0', '2.0']), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _version_decorators, { kind: "field", name: "version", static: false, private: false, access: { has: obj => "version" in obj, get: obj => obj.version, set: (obj, value) => { obj.version = value; } }, metadata: _metadata }, _version_initializers, _version_extraInitializers);
            __esDecorate(null, null, _nonce_decorators, { kind: "field", name: "nonce", static: false, private: false, access: { has: obj => "nonce" in obj, get: obj => obj.nonce, set: (obj, value) => { obj.nonce = value; } }, metadata: _metadata }, _nonce_initializers, _nonce_extraInitializers);
            __esDecorate(null, null, _requestedAttributes_decorators, { kind: "field", name: "requestedAttributes", static: false, private: false, access: { has: obj => "requestedAttributes" in obj, get: obj => obj.requestedAttributes, set: (obj, value) => { obj.requestedAttributes = value; } }, metadata: _metadata }, _requestedAttributes_initializers, _requestedAttributes_extraInitializers);
            __esDecorate(null, null, _requestedPredicates_decorators, { kind: "field", name: "requestedPredicates", static: false, private: false, access: { has: obj => "requestedPredicates" in obj, get: obj => obj.requestedPredicates, set: (obj, value) => { obj.requestedPredicates = value; } }, metadata: _metadata }, _requestedPredicates_initializers, _requestedPredicates_extraInitializers);
            __esDecorate(null, null, _nonRevoked_decorators, { kind: "field", name: "nonRevoked", static: false, private: false, access: { has: obj => "nonRevoked" in obj, get: obj => obj.nonRevoked, set: (obj, value) => { obj.nonRevoked = value; } }, metadata: _metadata }, _nonRevoked_initializers, _nonRevoked_extraInitializers);
            __esDecorate(null, null, _ver_decorators, { kind: "field", name: "ver", static: false, private: false, access: { has: obj => "ver" in obj, get: obj => obj.ver, set: (obj, value) => { obj.ver = value; } }, metadata: _metadata }, _ver_initializers, _ver_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.AnonCredsProofRequest = AnonCredsProofRequest;
