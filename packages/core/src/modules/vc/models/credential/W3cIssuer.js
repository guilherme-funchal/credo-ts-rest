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
exports.W3cIssuer = void 0;
exports.W3cIssuerTransformer = W3cIssuerTransformer;
exports.IsW3cIssuer = IsW3cIssuer;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const validators_1 = require("../../../../utils/validators");
let W3cIssuer = (() => {
    var _a;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    return _a = class W3cIssuer {
            constructor(options) {
                this.id = __runInitializers(this, _id_initializers, void 0);
                __runInitializers(this, _id_extraInitializers);
                if (options) {
                    this.id = options.id;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, validators_1.IsUri)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.W3cIssuer = W3cIssuer;
// Custom transformers
function W3cIssuerTransformer() {
    return (0, class_transformer_1.Transform)(({ value, type }) => {
        if (type === class_transformer_1.TransformationType.PLAIN_TO_CLASS) {
            if ((0, class_validator_1.isString)(value))
                return value;
            return (0, class_transformer_1.plainToInstance)(W3cIssuer, value);
        }
        else if (type === class_transformer_1.TransformationType.CLASS_TO_PLAIN) {
            if ((0, class_validator_1.isString)(value))
                return value;
            return (0, class_transformer_1.instanceToPlain)(value);
        }
        // PLAIN_TO_PLAIN
        return value;
    });
}
// Custom validators
function IsW3cIssuer(validationOptions) {
    return (0, class_validator_1.ValidateBy)({
        name: 'IsW3cIssuer',
        validator: {
            validate: (value) => {
                if (typeof value === 'string') {
                    return (0, validators_1.isUri)(value);
                }
                if ((0, class_validator_1.isInstance)(value, W3cIssuer)) {
                    return (0, validators_1.isUri)(value.id);
                }
                return false;
            },
            defaultMessage: (0, class_validator_1.buildMessage)((eachPrefix) => eachPrefix + '$property must be an URI or an object with an id property which is an URI', validationOptions),
        },
    }, validationOptions);
}
