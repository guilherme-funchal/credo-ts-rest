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
exports.W3cPresentation = void 0;
exports.IsVerifiablePresentationType = IsVerifiablePresentationType;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const validators_1 = require("../../../../utils/validators");
const constants_1 = require("../../constants");
const W3cJsonLdVerifiableCredential_1 = require("../../data-integrity/models/W3cJsonLdVerifiableCredential");
const W3cJwtVerifiableCredential_1 = require("../../jwt-vc/W3cJwtVerifiableCredential");
const validators_2 = require("../../validators");
const W3cVerifiableCredential_1 = require("../credential/W3cVerifiableCredential");
const W3cHolder_1 = require("./W3cHolder");
let W3cPresentation = (() => {
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
    let _holder_decorators;
    let _holder_initializers = [];
    let _holder_extraInitializers = [];
    let _verifiableCredential_decorators;
    let _verifiableCredential_initializers = [];
    let _verifiableCredential_extraInitializers = [];
    return _a = class W3cPresentation {
            constructor(options) {
                var _b, _c;
                this.context = __runInitializers(this, _context_initializers, void 0);
                this.id = (__runInitializers(this, _context_extraInitializers), __runInitializers(this, _id_initializers, void 0));
                this.type = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _type_initializers, void 0));
                this.holder = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _holder_initializers, void 0));
                this.verifiableCredential = (__runInitializers(this, _holder_extraInitializers), __runInitializers(this, _verifiableCredential_initializers, void 0));
                __runInitializers(this, _verifiableCredential_extraInitializers);
                if (options) {
                    this.id = options.id;
                    this.context = (_b = options.context) !== null && _b !== void 0 ? _b : [constants_1.CREDENTIALS_CONTEXT_V1_URL];
                    this.type = (_c = options.type) !== null && _c !== void 0 ? _c : [constants_1.VERIFIABLE_PRESENTATION_TYPE];
                    this.verifiableCredential = options.verifiableCredential;
                    if (options.holder) {
                        this.holder = typeof options.holder === 'string' ? options.holder : new W3cHolder_1.W3cHolder(options.holder);
                    }
                }
            }
            get holderId() {
                if (!this.holder)
                    return null;
                return this.holder instanceof W3cHolder_1.W3cHolder ? this.holder.id : this.holder;
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _context_decorators = [(0, class_transformer_1.Expose)({ name: '@context' }), (0, validators_2.IsCredentialJsonLdContext)()];
            _id_decorators = [(0, class_validator_1.IsOptional)(), (0, validators_1.IsUri)()];
            _type_decorators = [IsVerifiablePresentationType()];
            _holder_decorators = [(0, W3cHolder_1.W3cHolderTransformer)(), (0, W3cHolder_1.IsW3cHolder)(), (0, class_validator_1.IsOptional)()];
            _verifiableCredential_decorators = [(0, W3cVerifiableCredential_1.W3cVerifiableCredentialTransformer)(), (0, validators_1.IsInstanceOrArrayOfInstances)({ classType: [W3cJsonLdVerifiableCredential_1.W3cJsonLdVerifiableCredential, W3cJwtVerifiableCredential_1.W3cJwtVerifiableCredential] }), (0, class_validator_1.ValidateNested)({ each: true })];
            __esDecorate(null, null, _context_decorators, { kind: "field", name: "context", static: false, private: false, access: { has: obj => "context" in obj, get: obj => obj.context, set: (obj, value) => { obj.context = value; } }, metadata: _metadata }, _context_initializers, _context_extraInitializers);
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _holder_decorators, { kind: "field", name: "holder", static: false, private: false, access: { has: obj => "holder" in obj, get: obj => obj.holder, set: (obj, value) => { obj.holder = value; } }, metadata: _metadata }, _holder_initializers, _holder_extraInitializers);
            __esDecorate(null, null, _verifiableCredential_decorators, { kind: "field", name: "verifiableCredential", static: false, private: false, access: { has: obj => "verifiableCredential" in obj, get: obj => obj.verifiableCredential, set: (obj, value) => { obj.verifiableCredential = value; } }, metadata: _metadata }, _verifiableCredential_initializers, _verifiableCredential_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.W3cPresentation = W3cPresentation;
// Custom validators
function IsVerifiablePresentationType(validationOptions) {
    return (0, class_validator_1.ValidateBy)({
        name: 'IsVerifiablePresentationType',
        validator: {
            validate: (value) => {
                if (Array.isArray(value)) {
                    return value.includes(constants_1.VERIFIABLE_PRESENTATION_TYPE);
                }
                return false;
            },
            defaultMessage: (0, class_validator_1.buildMessage)((eachPrefix) => eachPrefix + '$property must be an array of strings which includes "VerifiablePresentation"', validationOptions),
        },
    }, validationOptions);
}
