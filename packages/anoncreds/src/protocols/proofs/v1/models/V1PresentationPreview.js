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
exports.V1PresentationPreview = exports.V1PresentationPreviewPredicate = exports.V1PresentationPreviewAttribute = void 0;
const core_1 = require("@aries-framework/core");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const models_1 = require("../../../../models");
const utils_1 = require("../../../../utils");
let V1PresentationPreviewAttribute = (() => {
    var _a;
    let _credentialDefinitionId_decorators;
    let _credentialDefinitionId_initializers = [];
    let _credentialDefinitionId_extraInitializers = [];
    let _mimeType_decorators;
    let _mimeType_initializers = [];
    let _mimeType_extraInitializers = [];
    let _value_decorators;
    let _value_initializers = [];
    let _value_extraInitializers = [];
    let _referent_decorators;
    let _referent_initializers = [];
    let _referent_extraInitializers = [];
    return _a = class V1PresentationPreviewAttribute {
            constructor(options) {
                this.credentialDefinitionId = __runInitializers(this, _credentialDefinitionId_initializers, void 0);
                this.mimeType = (__runInitializers(this, _credentialDefinitionId_extraInitializers), __runInitializers(this, _mimeType_initializers, void 0));
                this.value = (__runInitializers(this, _mimeType_extraInitializers), __runInitializers(this, _value_initializers, void 0));
                this.referent = (__runInitializers(this, _value_extraInitializers), __runInitializers(this, _referent_initializers, void 0));
                __runInitializers(this, _referent_extraInitializers);
                if (options) {
                    this.name = options.name;
                    this.credentialDefinitionId = options.credentialDefinitionId;
                    this.mimeType = options.mimeType;
                    this.value = options.value;
                    this.referent = options.referent;
                }
            }
            toJSON() {
                return core_1.JsonTransformer.toJSON(this);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _credentialDefinitionId_decorators = [(0, class_transformer_1.Expose)({ name: 'cred_def_id' }), (0, class_validator_1.IsString)(), (0, class_validator_1.ValidateIf)((o) => o.referent !== undefined), (0, class_validator_1.Matches)(utils_1.unqualifiedCredentialDefinitionIdRegex)];
            _mimeType_decorators = [(0, class_transformer_1.Expose)({ name: 'mime-type' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsMimeType)()];
            _value_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _referent_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _credentialDefinitionId_decorators, { kind: "field", name: "credentialDefinitionId", static: false, private: false, access: { has: obj => "credentialDefinitionId" in obj, get: obj => obj.credentialDefinitionId, set: (obj, value) => { obj.credentialDefinitionId = value; } }, metadata: _metadata }, _credentialDefinitionId_initializers, _credentialDefinitionId_extraInitializers);
            __esDecorate(null, null, _mimeType_decorators, { kind: "field", name: "mimeType", static: false, private: false, access: { has: obj => "mimeType" in obj, get: obj => obj.mimeType, set: (obj, value) => { obj.mimeType = value; } }, metadata: _metadata }, _mimeType_initializers, _mimeType_extraInitializers);
            __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
            __esDecorate(null, null, _referent_decorators, { kind: "field", name: "referent", static: false, private: false, access: { has: obj => "referent" in obj, get: obj => obj.referent, set: (obj, value) => { obj.referent = value; } }, metadata: _metadata }, _referent_initializers, _referent_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.V1PresentationPreviewAttribute = V1PresentationPreviewAttribute;
let V1PresentationPreviewPredicate = (() => {
    var _a;
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _credentialDefinitionId_decorators;
    let _credentialDefinitionId_initializers = [];
    let _credentialDefinitionId_extraInitializers = [];
    let _predicate_decorators;
    let _predicate_initializers = [];
    let _predicate_extraInitializers = [];
    let _threshold_decorators;
    let _threshold_initializers = [];
    let _threshold_extraInitializers = [];
    return _a = class V1PresentationPreviewPredicate {
            constructor(options) {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.credentialDefinitionId = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _credentialDefinitionId_initializers, void 0));
                this.predicate = (__runInitializers(this, _credentialDefinitionId_extraInitializers), __runInitializers(this, _predicate_initializers, void 0));
                this.threshold = (__runInitializers(this, _predicate_extraInitializers), __runInitializers(this, _threshold_initializers, void 0));
                __runInitializers(this, _threshold_extraInitializers);
                if (options) {
                    this.name = options.name;
                    this.credentialDefinitionId = options.credentialDefinitionId;
                    this.predicate = options.predicate;
                    this.threshold = options.threshold;
                }
            }
            toJSON() {
                return core_1.JsonTransformer.toJSON(this);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)()];
            _credentialDefinitionId_decorators = [(0, class_transformer_1.Expose)({ name: 'cred_def_id' }), (0, class_validator_1.IsString)(), (0, class_validator_1.Matches)(utils_1.unqualifiedCredentialDefinitionIdRegex)];
            _predicate_decorators = [(0, class_validator_1.IsIn)(models_1.anonCredsPredicateType)];
            _threshold_decorators = [(0, class_validator_1.IsInt)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _credentialDefinitionId_decorators, { kind: "field", name: "credentialDefinitionId", static: false, private: false, access: { has: obj => "credentialDefinitionId" in obj, get: obj => obj.credentialDefinitionId, set: (obj, value) => { obj.credentialDefinitionId = value; } }, metadata: _metadata }, _credentialDefinitionId_initializers, _credentialDefinitionId_extraInitializers);
            __esDecorate(null, null, _predicate_decorators, { kind: "field", name: "predicate", static: false, private: false, access: { has: obj => "predicate" in obj, get: obj => obj.predicate, set: (obj, value) => { obj.predicate = value; } }, metadata: _metadata }, _predicate_initializers, _predicate_extraInitializers);
            __esDecorate(null, null, _threshold_decorators, { kind: "field", name: "threshold", static: false, private: false, access: { has: obj => "threshold" in obj, get: obj => obj.threshold, set: (obj, value) => { obj.threshold = value; } }, metadata: _metadata }, _threshold_initializers, _threshold_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.V1PresentationPreviewPredicate = V1PresentationPreviewPredicate;
/**
 * Presentation preview inner message class.
 *
 * This is not a message but an inner object for other messages in this protocol. It is used to construct a preview of the data for the presentation.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0037-present-proof/README.md#presentation-preview
 */
let V1PresentationPreview = (() => {
    var _a;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _attributes_decorators;
    let _attributes_initializers = [];
    let _attributes_extraInitializers = [];
    let _predicates_decorators;
    let _predicates_initializers = [];
    let _predicates_extraInitializers = [];
    return _a = class V1PresentationPreview {
            constructor(options) {
                var _b, _c, _d, _e;
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                this.attributes = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _attributes_initializers, void 0));
                this.predicates = (__runInitializers(this, _attributes_extraInitializers), __runInitializers(this, _predicates_initializers, void 0));
                __runInitializers(this, _predicates_extraInitializers);
                if (options) {
                    this.attributes = (_c = (_b = options.attributes) === null || _b === void 0 ? void 0 : _b.map((a) => new V1PresentationPreviewAttribute(a))) !== null && _c !== void 0 ? _c : [];
                    this.predicates = (_e = (_d = options.predicates) === null || _d === void 0 ? void 0 : _d.map((p) => new V1PresentationPreviewPredicate(p))) !== null && _e !== void 0 ? _e : [];
                }
            }
            toJSON() {
                return core_1.JsonTransformer.toJSON(this);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [(0, class_transformer_1.Expose)({ name: '@type' }), (0, core_1.IsValidMessageType)(V1PresentationPreview.type), (0, class_transformer_1.Transform)(({ value }) => (0, core_1.replaceLegacyDidSovPrefix)(value), {
                    toClassOnly: true,
                })];
            _attributes_decorators = [(0, class_transformer_1.Type)(() => V1PresentationPreviewAttribute), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_validator_1.IsInstance)(V1PresentationPreviewAttribute, { each: true })];
            _predicates_decorators = [(0, class_transformer_1.Type)(() => V1PresentationPreviewPredicate), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_validator_1.IsInstance)(V1PresentationPreviewPredicate, { each: true })];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _attributes_decorators, { kind: "field", name: "attributes", static: false, private: false, access: { has: obj => "attributes" in obj, get: obj => obj.attributes, set: (obj, value) => { obj.attributes = value; } }, metadata: _metadata }, _attributes_initializers, _attributes_extraInitializers);
            __esDecorate(null, null, _predicates_decorators, { kind: "field", name: "predicates", static: false, private: false, access: { has: obj => "predicates" in obj, get: obj => obj.predicates, set: (obj, value) => { obj.predicates = value; } }, metadata: _metadata }, _predicates_initializers, _predicates_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, core_1.parseMessageType)('https://didcomm.org/present-proof/1.0/presentation-preview'),
        _a;
})();
exports.V1PresentationPreview = V1PresentationPreview;
