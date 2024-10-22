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
exports.FeatureQuery = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
let FeatureQuery = (() => {
    var _a;
    let _featureType_decorators;
    let _featureType_initializers = [];
    let _featureType_extraInitializers = [];
    let _match_decorators;
    let _match_initializers = [];
    let _match_extraInitializers = [];
    return _a = class FeatureQuery {
            constructor(options) {
                this.featureType = __runInitializers(this, _featureType_initializers, void 0);
                this.match = (__runInitializers(this, _featureType_extraInitializers), __runInitializers(this, _match_initializers, void 0));
                __runInitializers(this, _match_extraInitializers);
                if (options) {
                    this.featureType = options.featureType;
                    this.match = options.match;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _featureType_decorators = [(0, class_transformer_1.Expose)({ name: 'feature-type' }), (0, class_validator_1.IsString)()];
            _match_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _featureType_decorators, { kind: "field", name: "featureType", static: false, private: false, access: { has: obj => "featureType" in obj, get: obj => obj.featureType, set: (obj, value) => { obj.featureType = value; } }, metadata: _metadata }, _featureType_initializers, _featureType_extraInitializers);
            __esDecorate(null, null, _match_decorators, { kind: "field", name: "match", static: false, private: false, access: { has: obj => "match" in obj, get: obj => obj.match, set: (obj, value) => { obj.match = value; } }, metadata: _metadata }, _match_initializers, _match_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.FeatureQuery = FeatureQuery;
