"use strict";
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.
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
exports.CheqdRevocationStatusList = exports.CheqdRevocationRegistryDefinition = exports.CheqdRevocationRegistryDefinitionValue = exports.PublicKeys = exports.AccumKey = exports.CheqdCredentialDefinition = exports.CheqdCredentialDefinitionValue = exports.CheqdSchema = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
let CheqdSchema = (() => {
    var _a;
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _attrNames_decorators;
    let _attrNames_initializers = [];
    let _attrNames_extraInitializers = [];
    let _version_decorators;
    let _version_initializers = [];
    let _version_extraInitializers = [];
    return _a = class CheqdSchema {
            constructor(options) {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.attrNames = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _attrNames_initializers, void 0));
                this.version = (__runInitializers(this, _attrNames_extraInitializers), __runInitializers(this, _version_initializers, void 0));
                __runInitializers(this, _version_extraInitializers);
                if (options) {
                    this.name = options.name;
                    this.attrNames = options.attrNames;
                    this.version = options.version;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)()];
            _attrNames_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true }), (0, class_validator_1.ArrayMinSize)(1)];
            _version_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _attrNames_decorators, { kind: "field", name: "attrNames", static: false, private: false, access: { has: obj => "attrNames" in obj, get: obj => obj.attrNames, set: (obj, value) => { obj.attrNames = value; } }, metadata: _metadata }, _attrNames_initializers, _attrNames_extraInitializers);
            __esDecorate(null, null, _version_decorators, { kind: "field", name: "version", static: false, private: false, access: { has: obj => "version" in obj, get: obj => obj.version, set: (obj, value) => { obj.version = value; } }, metadata: _metadata }, _version_initializers, _version_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CheqdSchema = CheqdSchema;
let CheqdCredentialDefinitionValue = (() => {
    var _a;
    let _primary_decorators;
    let _primary_initializers = [];
    let _primary_extraInitializers = [];
    let _revocation_decorators;
    let _revocation_initializers = [];
    let _revocation_extraInitializers = [];
    return _a = class CheqdCredentialDefinitionValue {
            constructor() {
                this.primary = __runInitializers(this, _primary_initializers, void 0);
                this.revocation = (__runInitializers(this, _primary_extraInitializers), __runInitializers(this, _revocation_initializers, void 0));
                __runInitializers(this, _revocation_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _primary_decorators = [(0, class_validator_1.IsObject)()];
            _revocation_decorators = [(0, class_validator_1.IsObject)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _primary_decorators, { kind: "field", name: "primary", static: false, private: false, access: { has: obj => "primary" in obj, get: obj => obj.primary, set: (obj, value) => { obj.primary = value; } }, metadata: _metadata }, _primary_initializers, _primary_extraInitializers);
            __esDecorate(null, null, _revocation_decorators, { kind: "field", name: "revocation", static: false, private: false, access: { has: obj => "revocation" in obj, get: obj => obj.revocation, set: (obj, value) => { obj.revocation = value; } }, metadata: _metadata }, _revocation_initializers, _revocation_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CheqdCredentialDefinitionValue = CheqdCredentialDefinitionValue;
let CheqdCredentialDefinition = (() => {
    var _a;
    let _schemaId_decorators;
    let _schemaId_initializers = [];
    let _schemaId_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _tag_decorators;
    let _tag_initializers = [];
    let _tag_extraInitializers = [];
    let _value_decorators;
    let _value_initializers = [];
    let _value_extraInitializers = [];
    return _a = class CheqdCredentialDefinition {
            constructor(options) {
                this.schemaId = __runInitializers(this, _schemaId_initializers, void 0);
                this.type = (__runInitializers(this, _schemaId_extraInitializers), __runInitializers(this, _type_initializers, void 0));
                this.tag = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _tag_initializers, void 0));
                this.value = (__runInitializers(this, _tag_extraInitializers), __runInitializers(this, _value_initializers, void 0));
                __runInitializers(this, _value_extraInitializers);
                if (options) {
                    this.schemaId = options.schemaId;
                    this.type = options.type;
                    this.tag = options.tag;
                    this.value = options.value;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _schemaId_decorators = [(0, class_validator_1.IsString)()];
            _type_decorators = [(0, class_validator_1.Contains)('CL')];
            _tag_decorators = [(0, class_validator_1.IsString)()];
            _value_decorators = [(0, class_validator_1.ValidateNested)(), (0, class_validator_1.IsInstance)(CheqdCredentialDefinitionValue), (0, class_transformer_1.Type)(() => CheqdCredentialDefinitionValue)];
            __esDecorate(null, null, _schemaId_decorators, { kind: "field", name: "schemaId", static: false, private: false, access: { has: obj => "schemaId" in obj, get: obj => obj.schemaId, set: (obj, value) => { obj.schemaId = value; } }, metadata: _metadata }, _schemaId_initializers, _schemaId_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _tag_decorators, { kind: "field", name: "tag", static: false, private: false, access: { has: obj => "tag" in obj, get: obj => obj.tag, set: (obj, value) => { obj.tag = value; } }, metadata: _metadata }, _tag_initializers, _tag_extraInitializers);
            __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CheqdCredentialDefinition = CheqdCredentialDefinition;
let AccumKey = (() => {
    var _a;
    let _z_decorators;
    let _z_initializers = [];
    let _z_extraInitializers = [];
    return _a = class AccumKey {
            constructor() {
                this.z = __runInitializers(this, _z_initializers, void 0);
                __runInitializers(this, _z_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _z_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _z_decorators, { kind: "field", name: "z", static: false, private: false, access: { has: obj => "z" in obj, get: obj => obj.z, set: (obj, value) => { obj.z = value; } }, metadata: _metadata }, _z_initializers, _z_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.AccumKey = AccumKey;
let PublicKeys = (() => {
    var _a;
    let _accumKey_decorators;
    let _accumKey_initializers = [];
    let _accumKey_extraInitializers = [];
    return _a = class PublicKeys {
            constructor() {
                this.accumKey = __runInitializers(this, _accumKey_initializers, void 0);
                __runInitializers(this, _accumKey_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _accumKey_decorators = [(0, class_validator_1.ValidateNested)(), (0, class_validator_1.IsInstance)(AccumKey), (0, class_transformer_1.Type)(() => AccumKey)];
            __esDecorate(null, null, _accumKey_decorators, { kind: "field", name: "accumKey", static: false, private: false, access: { has: obj => "accumKey" in obj, get: obj => obj.accumKey, set: (obj, value) => { obj.accumKey = value; } }, metadata: _metadata }, _accumKey_initializers, _accumKey_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.PublicKeys = PublicKeys;
let CheqdRevocationRegistryDefinitionValue = (() => {
    var _a;
    let _publicKeys_decorators;
    let _publicKeys_initializers = [];
    let _publicKeys_extraInitializers = [];
    let _maxCredNum_decorators;
    let _maxCredNum_initializers = [];
    let _maxCredNum_extraInitializers = [];
    let _tailsLocation_decorators;
    let _tailsLocation_initializers = [];
    let _tailsLocation_extraInitializers = [];
    let _tailsHash_decorators;
    let _tailsHash_initializers = [];
    let _tailsHash_extraInitializers = [];
    return _a = class CheqdRevocationRegistryDefinitionValue {
            constructor() {
                this.publicKeys = __runInitializers(this, _publicKeys_initializers, void 0);
                this.maxCredNum = (__runInitializers(this, _publicKeys_extraInitializers), __runInitializers(this, _maxCredNum_initializers, void 0));
                this.tailsLocation = (__runInitializers(this, _maxCredNum_extraInitializers), __runInitializers(this, _tailsLocation_initializers, void 0));
                this.tailsHash = (__runInitializers(this, _tailsLocation_extraInitializers), __runInitializers(this, _tailsHash_initializers, void 0));
                __runInitializers(this, _tailsHash_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _publicKeys_decorators = [(0, class_validator_1.ValidateNested)(), (0, class_validator_1.IsInstance)(PublicKeys), (0, class_transformer_1.Type)(() => PublicKeys)];
            _maxCredNum_decorators = [(0, class_validator_1.IsNumber)()];
            _tailsLocation_decorators = [(0, class_validator_1.IsString)()];
            _tailsHash_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _publicKeys_decorators, { kind: "field", name: "publicKeys", static: false, private: false, access: { has: obj => "publicKeys" in obj, get: obj => obj.publicKeys, set: (obj, value) => { obj.publicKeys = value; } }, metadata: _metadata }, _publicKeys_initializers, _publicKeys_extraInitializers);
            __esDecorate(null, null, _maxCredNum_decorators, { kind: "field", name: "maxCredNum", static: false, private: false, access: { has: obj => "maxCredNum" in obj, get: obj => obj.maxCredNum, set: (obj, value) => { obj.maxCredNum = value; } }, metadata: _metadata }, _maxCredNum_initializers, _maxCredNum_extraInitializers);
            __esDecorate(null, null, _tailsLocation_decorators, { kind: "field", name: "tailsLocation", static: false, private: false, access: { has: obj => "tailsLocation" in obj, get: obj => obj.tailsLocation, set: (obj, value) => { obj.tailsLocation = value; } }, metadata: _metadata }, _tailsLocation_initializers, _tailsLocation_extraInitializers);
            __esDecorate(null, null, _tailsHash_decorators, { kind: "field", name: "tailsHash", static: false, private: false, access: { has: obj => "tailsHash" in obj, get: obj => obj.tailsHash, set: (obj, value) => { obj.tailsHash = value; } }, metadata: _metadata }, _tailsHash_initializers, _tailsHash_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CheqdRevocationRegistryDefinitionValue = CheqdRevocationRegistryDefinitionValue;
let CheqdRevocationRegistryDefinition = (() => {
    var _a;
    let _revocDefType_decorators;
    let _revocDefType_initializers = [];
    let _revocDefType_extraInitializers = [];
    let _credDefId_decorators;
    let _credDefId_initializers = [];
    let _credDefId_extraInitializers = [];
    let _tag_decorators;
    let _tag_initializers = [];
    let _tag_extraInitializers = [];
    let _value_decorators;
    let _value_initializers = [];
    let _value_extraInitializers = [];
    return _a = class CheqdRevocationRegistryDefinition {
            constructor(options) {
                this.revocDefType = __runInitializers(this, _revocDefType_initializers, void 0);
                this.credDefId = (__runInitializers(this, _revocDefType_extraInitializers), __runInitializers(this, _credDefId_initializers, void 0));
                this.tag = (__runInitializers(this, _credDefId_extraInitializers), __runInitializers(this, _tag_initializers, void 0));
                this.value = (__runInitializers(this, _tag_extraInitializers), __runInitializers(this, _value_initializers, void 0));
                __runInitializers(this, _value_extraInitializers);
                if (options) {
                    this.revocDefType = options.revocDefType;
                    this.credDefId = options.credDefId;
                    this.tag = options.tag;
                    this.value = options.value;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _revocDefType_decorators = [(0, class_validator_1.Contains)('CL_ACCUM')];
            _credDefId_decorators = [(0, class_validator_1.IsString)()];
            _tag_decorators = [(0, class_validator_1.IsString)()];
            _value_decorators = [(0, class_validator_1.ValidateNested)(), (0, class_validator_1.IsInstance)(CheqdRevocationRegistryDefinitionValue), (0, class_transformer_1.Type)(() => CheqdRevocationRegistryDefinitionValue)];
            __esDecorate(null, null, _revocDefType_decorators, { kind: "field", name: "revocDefType", static: false, private: false, access: { has: obj => "revocDefType" in obj, get: obj => obj.revocDefType, set: (obj, value) => { obj.revocDefType = value; } }, metadata: _metadata }, _revocDefType_initializers, _revocDefType_extraInitializers);
            __esDecorate(null, null, _credDefId_decorators, { kind: "field", name: "credDefId", static: false, private: false, access: { has: obj => "credDefId" in obj, get: obj => obj.credDefId, set: (obj, value) => { obj.credDefId = value; } }, metadata: _metadata }, _credDefId_initializers, _credDefId_extraInitializers);
            __esDecorate(null, null, _tag_decorators, { kind: "field", name: "tag", static: false, private: false, access: { has: obj => "tag" in obj, get: obj => obj.tag, set: (obj, value) => { obj.tag = value; } }, metadata: _metadata }, _tag_initializers, _tag_extraInitializers);
            __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CheqdRevocationRegistryDefinition = CheqdRevocationRegistryDefinition;
let CheqdRevocationStatusList = (() => {
    var _a;
    let _revRegDefId_decorators;
    let _revRegDefId_initializers = [];
    let _revRegDefId_extraInitializers = [];
    let _revocationList_decorators;
    let _revocationList_initializers = [];
    let _revocationList_extraInitializers = [];
    let _currentAccumulator_decorators;
    let _currentAccumulator_initializers = [];
    let _currentAccumulator_extraInitializers = [];
    return _a = class CheqdRevocationStatusList {
            constructor(options) {
                this.revRegDefId = __runInitializers(this, _revRegDefId_initializers, void 0);
                this.revocationList = (__runInitializers(this, _revRegDefId_extraInitializers), __runInitializers(this, _revocationList_initializers, void 0));
                this.currentAccumulator = (__runInitializers(this, _revocationList_extraInitializers), __runInitializers(this, _currentAccumulator_initializers, void 0));
                __runInitializers(this, _currentAccumulator_extraInitializers);
                if (options) {
                    this.revRegDefId = options.revRegDefId;
                    this.revocationList = options.revocationList;
                    this.currentAccumulator = options.currentAccumulator;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _revRegDefId_decorators = [(0, class_validator_1.IsString)()];
            _revocationList_decorators = [(0, class_validator_1.IsNumber)({}, { each: true })];
            _currentAccumulator_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _revRegDefId_decorators, { kind: "field", name: "revRegDefId", static: false, private: false, access: { has: obj => "revRegDefId" in obj, get: obj => obj.revRegDefId, set: (obj, value) => { obj.revRegDefId = value; } }, metadata: _metadata }, _revRegDefId_initializers, _revRegDefId_extraInitializers);
            __esDecorate(null, null, _revocationList_decorators, { kind: "field", name: "revocationList", static: false, private: false, access: { has: obj => "revocationList" in obj, get: obj => obj.revocationList, set: (obj, value) => { obj.revocationList = value; } }, metadata: _metadata }, _revocationList_initializers, _revocationList_extraInitializers);
            __esDecorate(null, null, _currentAccumulator_decorators, { kind: "field", name: "currentAccumulator", static: false, private: false, access: { has: obj => "currentAccumulator" in obj, get: obj => obj.currentAccumulator, set: (obj, value) => { obj.currentAccumulator = value; } }, metadata: _metadata }, _currentAccumulator_initializers, _currentAccumulator_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CheqdRevocationStatusList = CheqdRevocationStatusList;
