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
exports.Feature = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const error_1 = require("../../../error");
const JsonTransformer_1 = require("../../../utils/JsonTransformer");
let Feature = (() => {
    var _a;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    return _a = class Feature {
            constructor(props) {
                this.type = __runInitializers(this, _type_initializers, void 0);
                __runInitializers(this, _type_extraInitializers);
                if (props) {
                    this.id = props.id;
                    this.type = props.type;
                }
            }
            /**
             * Combine this feature with another one, provided both are from the same type
             * and have the same id
             *
             * @param feature object to combine with this one
             * @returns a new object resulting from the combination between this and feature
             */
            combine(feature) {
                if (feature.id !== this.id) {
                    throw new error_1.AriesFrameworkError('Can only combine with a feature with the same id');
                }
                const obj1 = JsonTransformer_1.JsonTransformer.toJSON(this);
                const obj2 = JsonTransformer_1.JsonTransformer.toJSON(feature);
                for (const key in obj2) {
                    try {
                        if (Array.isArray(obj2[key])) {
                            obj1[key] = [...new Set([...obj1[key], ...obj2[key]])];
                        }
                        else {
                            obj1[key] = obj2[key];
                        }
                    }
                    catch (e) {
                        obj1[key] = obj2[key];
                    }
                }
                return JsonTransformer_1.JsonTransformer.fromJSON(obj1, _a);
            }
            toJSON() {
                return JsonTransformer_1.JsonTransformer.toJSON(this);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [(0, class_validator_1.IsString)(), (0, class_transformer_1.Expose)({ name: 'feature-type' })];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.Feature = Feature;
