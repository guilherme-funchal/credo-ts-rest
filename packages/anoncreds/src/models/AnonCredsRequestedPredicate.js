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
exports.AnonCredsRequestedPredicate = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const models_1 = require("../models");
const AnonCredsRestriction_1 = require("./AnonCredsRestriction");
const AnonCredsRevocationInterval_1 = require("./AnonCredsRevocationInterval");
let AnonCredsRequestedPredicate = (() => {
    var _a;
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _predicateType_decorators;
    let _predicateType_initializers = [];
    let _predicateType_extraInitializers = [];
    let _predicateValue_decorators;
    let _predicateValue_initializers = [];
    let _predicateValue_extraInitializers = [];
    let _nonRevoked_decorators;
    let _nonRevoked_initializers = [];
    let _nonRevoked_extraInitializers = [];
    let _restrictions_decorators;
    let _restrictions_initializers = [];
    let _restrictions_extraInitializers = [];
    return _a = class AnonCredsRequestedPredicate {
            constructor(options) {
                var _b;
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.predicateType = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _predicateType_initializers, void 0));
                this.predicateValue = (__runInitializers(this, _predicateType_extraInitializers), __runInitializers(this, _predicateValue_initializers, void 0));
                this.nonRevoked = (__runInitializers(this, _predicateValue_extraInitializers), __runInitializers(this, _nonRevoked_initializers, void 0));
                this.restrictions = (__runInitializers(this, _nonRevoked_extraInitializers), __runInitializers(this, _restrictions_initializers, void 0));
                __runInitializers(this, _restrictions_extraInitializers);
                if (options) {
                    this.name = options.name;
                    this.nonRevoked = options.nonRevoked ? new AnonCredsRevocationInterval_1.AnonCredsRevocationInterval(options.nonRevoked) : undefined;
                    this.restrictions = (_b = options.restrictions) === null || _b === void 0 ? void 0 : _b.map((r) => new AnonCredsRestriction_1.AnonCredsRestriction(r));
                    this.predicateType = options.predicateType;
                    this.predicateValue = options.predicateValue;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)()];
            _predicateType_decorators = [(0, class_transformer_1.Expose)({ name: 'p_type' }), (0, class_validator_1.IsIn)(models_1.anonCredsPredicateType)];
            _predicateValue_decorators = [(0, class_transformer_1.Expose)({ name: 'p_value' }), (0, class_validator_1.IsInt)()];
            _nonRevoked_decorators = [(0, class_transformer_1.Expose)({ name: 'non_revoked' }), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => AnonCredsRevocationInterval_1.AnonCredsRevocationInterval), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInstance)(AnonCredsRevocationInterval_1.AnonCredsRevocationInterval)];
            _restrictions_decorators = [(0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(() => AnonCredsRestriction_1.AnonCredsRestriction), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, AnonCredsRestriction_1.AnonCredsRestrictionTransformer)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _predicateType_decorators, { kind: "field", name: "predicateType", static: false, private: false, access: { has: obj => "predicateType" in obj, get: obj => obj.predicateType, set: (obj, value) => { obj.predicateType = value; } }, metadata: _metadata }, _predicateType_initializers, _predicateType_extraInitializers);
            __esDecorate(null, null, _predicateValue_decorators, { kind: "field", name: "predicateValue", static: false, private: false, access: { has: obj => "predicateValue" in obj, get: obj => obj.predicateValue, set: (obj, value) => { obj.predicateValue = value; } }, metadata: _metadata }, _predicateValue_initializers, _predicateValue_extraInitializers);
            __esDecorate(null, null, _nonRevoked_decorators, { kind: "field", name: "nonRevoked", static: false, private: false, access: { has: obj => "nonRevoked" in obj, get: obj => obj.nonRevoked, set: (obj, value) => { obj.nonRevoked = value; } }, metadata: _metadata }, _nonRevoked_initializers, _nonRevoked_extraInitializers);
            __esDecorate(null, null, _restrictions_decorators, { kind: "field", name: "restrictions", static: false, private: false, access: { has: obj => "restrictions" in obj, get: obj => obj.restrictions, set: (obj, value) => { obj.restrictions = value; } }, metadata: _metadata }, _restrictions_initializers, _restrictions_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.AnonCredsRequestedPredicate = AnonCredsRequestedPredicate;
