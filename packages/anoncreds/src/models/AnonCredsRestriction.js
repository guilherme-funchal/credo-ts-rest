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
exports.AnonCredsRestriction = void 0;
exports.AnonCredsRestrictionTransformer = AnonCredsRestrictionTransformer;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
let AnonCredsRestriction = (() => {
    var _a;
    let _schemaId_decorators;
    let _schemaId_initializers = [];
    let _schemaId_extraInitializers = [];
    let _schemaIssuerDid_decorators;
    let _schemaIssuerDid_initializers = [];
    let _schemaIssuerDid_extraInitializers = [];
    let _schemaIssuerId_decorators;
    let _schemaIssuerId_initializers = [];
    let _schemaIssuerId_extraInitializers = [];
    let _schemaName_decorators;
    let _schemaName_initializers = [];
    let _schemaName_extraInitializers = [];
    let _schemaVersion_decorators;
    let _schemaVersion_initializers = [];
    let _schemaVersion_extraInitializers = [];
    let _issuerDid_decorators;
    let _issuerDid_initializers = [];
    let _issuerDid_extraInitializers = [];
    let _issuerId_decorators;
    let _issuerId_initializers = [];
    let _issuerId_extraInitializers = [];
    let _credentialDefinitionId_decorators;
    let _credentialDefinitionId_initializers = [];
    let _credentialDefinitionId_extraInitializers = [];
    let _attributeMarkers_decorators;
    let _attributeMarkers_initializers = [];
    let _attributeMarkers_extraInitializers = [];
    let _attributeValues_decorators;
    let _attributeValues_initializers = [];
    let _attributeValues_extraInitializers = [];
    return _a = class AnonCredsRestriction {
            constructor(options) {
                var _b, _c;
                this.schemaId = __runInitializers(this, _schemaId_initializers, void 0);
                this.schemaIssuerDid = (__runInitializers(this, _schemaId_extraInitializers), __runInitializers(this, _schemaIssuerDid_initializers, void 0));
                this.schemaIssuerId = (__runInitializers(this, _schemaIssuerDid_extraInitializers), __runInitializers(this, _schemaIssuerId_initializers, void 0));
                this.schemaName = (__runInitializers(this, _schemaIssuerId_extraInitializers), __runInitializers(this, _schemaName_initializers, void 0));
                this.schemaVersion = (__runInitializers(this, _schemaName_extraInitializers), __runInitializers(this, _schemaVersion_initializers, void 0));
                this.issuerDid = (__runInitializers(this, _schemaVersion_extraInitializers), __runInitializers(this, _issuerDid_initializers, void 0));
                this.issuerId = (__runInitializers(this, _issuerDid_extraInitializers), __runInitializers(this, _issuerId_initializers, void 0));
                this.credentialDefinitionId = (__runInitializers(this, _issuerId_extraInitializers), __runInitializers(this, _credentialDefinitionId_initializers, void 0));
                this.attributeMarkers = (__runInitializers(this, _credentialDefinitionId_extraInitializers), __runInitializers(this, _attributeMarkers_initializers, {}));
                this.attributeValues = (__runInitializers(this, _attributeMarkers_extraInitializers), __runInitializers(this, _attributeValues_initializers, {}));
                __runInitializers(this, _attributeValues_extraInitializers);
                if (options) {
                    this.schemaId = options.schemaId;
                    this.schemaIssuerDid = options.schemaIssuerDid;
                    this.schemaIssuerId = options.schemaIssuerId;
                    this.schemaName = options.schemaName;
                    this.schemaVersion = options.schemaVersion;
                    this.issuerDid = options.issuerDid;
                    this.issuerId = options.issuerId;
                    this.credentialDefinitionId = options.credentialDefinitionId;
                    this.attributeMarkers = (_b = options.attributeMarkers) !== null && _b !== void 0 ? _b : {};
                    this.attributeValues = (_c = options.attributeValues) !== null && _c !== void 0 ? _c : {};
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _schemaId_decorators = [(0, class_transformer_1.Expose)({ name: 'schema_id' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _schemaIssuerDid_decorators = [(0, class_transformer_1.Expose)({ name: 'schema_issuer_did' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _schemaIssuerId_decorators = [(0, class_transformer_1.Expose)({ name: 'schema_issuer_id' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _schemaName_decorators = [(0, class_transformer_1.Expose)({ name: 'schema_name' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _schemaVersion_decorators = [(0, class_transformer_1.Expose)({ name: 'schema_version' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _issuerDid_decorators = [(0, class_transformer_1.Expose)({ name: 'issuer_did' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _issuerId_decorators = [(0, class_transformer_1.Expose)({ name: 'issuer_id' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _credentialDefinitionId_decorators = [(0, class_transformer_1.Expose)({ name: 'cred_def_id' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _attributeMarkers_decorators = [(0, class_transformer_1.Exclude)()];
            _attributeValues_decorators = [(0, class_transformer_1.Exclude)()];
            __esDecorate(null, null, _schemaId_decorators, { kind: "field", name: "schemaId", static: false, private: false, access: { has: obj => "schemaId" in obj, get: obj => obj.schemaId, set: (obj, value) => { obj.schemaId = value; } }, metadata: _metadata }, _schemaId_initializers, _schemaId_extraInitializers);
            __esDecorate(null, null, _schemaIssuerDid_decorators, { kind: "field", name: "schemaIssuerDid", static: false, private: false, access: { has: obj => "schemaIssuerDid" in obj, get: obj => obj.schemaIssuerDid, set: (obj, value) => { obj.schemaIssuerDid = value; } }, metadata: _metadata }, _schemaIssuerDid_initializers, _schemaIssuerDid_extraInitializers);
            __esDecorate(null, null, _schemaIssuerId_decorators, { kind: "field", name: "schemaIssuerId", static: false, private: false, access: { has: obj => "schemaIssuerId" in obj, get: obj => obj.schemaIssuerId, set: (obj, value) => { obj.schemaIssuerId = value; } }, metadata: _metadata }, _schemaIssuerId_initializers, _schemaIssuerId_extraInitializers);
            __esDecorate(null, null, _schemaName_decorators, { kind: "field", name: "schemaName", static: false, private: false, access: { has: obj => "schemaName" in obj, get: obj => obj.schemaName, set: (obj, value) => { obj.schemaName = value; } }, metadata: _metadata }, _schemaName_initializers, _schemaName_extraInitializers);
            __esDecorate(null, null, _schemaVersion_decorators, { kind: "field", name: "schemaVersion", static: false, private: false, access: { has: obj => "schemaVersion" in obj, get: obj => obj.schemaVersion, set: (obj, value) => { obj.schemaVersion = value; } }, metadata: _metadata }, _schemaVersion_initializers, _schemaVersion_extraInitializers);
            __esDecorate(null, null, _issuerDid_decorators, { kind: "field", name: "issuerDid", static: false, private: false, access: { has: obj => "issuerDid" in obj, get: obj => obj.issuerDid, set: (obj, value) => { obj.issuerDid = value; } }, metadata: _metadata }, _issuerDid_initializers, _issuerDid_extraInitializers);
            __esDecorate(null, null, _issuerId_decorators, { kind: "field", name: "issuerId", static: false, private: false, access: { has: obj => "issuerId" in obj, get: obj => obj.issuerId, set: (obj, value) => { obj.issuerId = value; } }, metadata: _metadata }, _issuerId_initializers, _issuerId_extraInitializers);
            __esDecorate(null, null, _credentialDefinitionId_decorators, { kind: "field", name: "credentialDefinitionId", static: false, private: false, access: { has: obj => "credentialDefinitionId" in obj, get: obj => obj.credentialDefinitionId, set: (obj, value) => { obj.credentialDefinitionId = value; } }, metadata: _metadata }, _credentialDefinitionId_initializers, _credentialDefinitionId_extraInitializers);
            __esDecorate(null, null, _attributeMarkers_decorators, { kind: "field", name: "attributeMarkers", static: false, private: false, access: { has: obj => "attributeMarkers" in obj, get: obj => obj.attributeMarkers, set: (obj, value) => { obj.attributeMarkers = value; } }, metadata: _metadata }, _attributeMarkers_initializers, _attributeMarkers_extraInitializers);
            __esDecorate(null, null, _attributeValues_decorators, { kind: "field", name: "attributeValues", static: false, private: false, access: { has: obj => "attributeValues" in obj, get: obj => obj.attributeValues, set: (obj, value) => { obj.attributeValues = value; } }, metadata: _metadata }, _attributeValues_initializers, _attributeValues_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.AnonCredsRestriction = AnonCredsRestriction;
/**
 * Decorator that transforms attribute values and attribute markers.
 *
 * It will transform between the following JSON structure:
 * ```json
 * {
 *  "attr::test_prop::value": "test_value"
 *  "attr::test_prop::marker": "1
 * }
 * ```
 *
 * And the following AnonCredsRestriction:
 * ```json
 * {
 *  "attributeValues": {
 *    "test_prop": "test_value"
 *  },
 *  "attributeMarkers": {
 *   "test_prop": true
 *  }
 * }
 * ```
 *
 * @example
 * class Example {
 *   AttributeFilterTransformer()
 *   public restrictions!: AnonCredsRestriction[]
 * }
 */
function AnonCredsRestrictionTransformer() {
    return (0, class_transformer_1.Transform)(({ value: restrictions, type }) => {
        switch (type) {
            case class_transformer_1.TransformationType.CLASS_TO_PLAIN:
                if (restrictions && Array.isArray(restrictions)) {
                    for (const restriction of restrictions) {
                        const r = restriction;
                        for (const [attributeName, attributeValue] of Object.entries(r.attributeValues)) {
                            restriction[`attr::${attributeName}::value`] = attributeValue;
                        }
                        for (const [attributeName] of Object.entries(r.attributeMarkers)) {
                            restriction[`attr::${attributeName}::marker`] = '1';
                        }
                    }
                }
                return restrictions;
            case class_transformer_1.TransformationType.PLAIN_TO_CLASS:
                if (restrictions && Array.isArray(restrictions)) {
                    for (const restriction of restrictions) {
                        const r = restriction;
                        for (const [attributeName, attributeValue] of Object.entries(r)) {
                            const match = new RegExp('^attr::([^:]+)::(value|marker)$').exec(attributeName);
                            if (match && match[2] === 'marker' && attributeValue === '1') {
                                r.attributeMarkers[match[1]] = true;
                                delete restriction[attributeName];
                            }
                            else if (match && match[2] === 'value') {
                                r.attributeValues[match[1]] = attributeValue;
                                delete restriction[attributeName];
                            }
                        }
                    }
                }
                return restrictions;
            default:
                return restrictions;
        }
    });
}
