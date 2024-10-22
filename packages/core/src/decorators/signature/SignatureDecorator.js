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
exports.SignatureDecorator = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const BaseMessage_1 = require("../../agent/BaseMessage");
const messageType_1 = require("../../utils/messageType");
/**
 * Represents `[field]~sig` decorator
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0234-signature-decorator/README.md
 */
let SignatureDecorator = (() => {
    var _a;
    let _signatureType_decorators;
    let _signatureType_initializers = [];
    let _signatureType_extraInitializers = [];
    let _signatureData_decorators;
    let _signatureData_initializers = [];
    let _signatureData_extraInitializers = [];
    let _signer_decorators;
    let _signer_initializers = [];
    let _signer_extraInitializers = [];
    let _signature_decorators;
    let _signature_initializers = [];
    let _signature_extraInitializers = [];
    return _a = class SignatureDecorator {
            constructor(options) {
                this.signatureType = __runInitializers(this, _signatureType_initializers, void 0);
                this.signatureData = (__runInitializers(this, _signatureType_extraInitializers), __runInitializers(this, _signatureData_initializers, void 0));
                this.signer = (__runInitializers(this, _signatureData_extraInitializers), __runInitializers(this, _signer_initializers, void 0));
                this.signature = (__runInitializers(this, _signer_extraInitializers), __runInitializers(this, _signature_initializers, void 0));
                __runInitializers(this, _signature_extraInitializers);
                if (options) {
                    this.signatureType = options.signatureType;
                    this.signatureData = options.signatureData;
                    this.signer = options.signer;
                    this.signature = options.signature;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _signatureType_decorators = [(0, class_transformer_1.Expose)({ name: '@type' }), (0, class_transformer_1.Transform)(({ value }) => (0, messageType_1.replaceLegacyDidSovPrefix)(value), {
                    toClassOnly: true,
                }), (0, class_validator_1.Matches)(BaseMessage_1.MessageTypeRegExp)];
            _signatureData_decorators = [(0, class_transformer_1.Expose)({ name: 'sig_data' }), (0, class_validator_1.IsString)()];
            _signer_decorators = [(0, class_transformer_1.Expose)({ name: 'signer' }), (0, class_validator_1.IsString)()];
            _signature_decorators = [(0, class_transformer_1.Expose)({ name: 'signature' }), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _signatureType_decorators, { kind: "field", name: "signatureType", static: false, private: false, access: { has: obj => "signatureType" in obj, get: obj => obj.signatureType, set: (obj, value) => { obj.signatureType = value; } }, metadata: _metadata }, _signatureType_initializers, _signatureType_extraInitializers);
            __esDecorate(null, null, _signatureData_decorators, { kind: "field", name: "signatureData", static: false, private: false, access: { has: obj => "signatureData" in obj, get: obj => obj.signatureData, set: (obj, value) => { obj.signatureData = value; } }, metadata: _metadata }, _signatureData_initializers, _signatureData_extraInitializers);
            __esDecorate(null, null, _signer_decorators, { kind: "field", name: "signer", static: false, private: false, access: { has: obj => "signer" in obj, get: obj => obj.signer, set: (obj, value) => { obj.signer = value; } }, metadata: _metadata }, _signer_initializers, _signer_extraInitializers);
            __esDecorate(null, null, _signature_decorators, { kind: "field", name: "signature", static: false, private: false, access: { has: obj => "signature" in obj, get: obj => obj.signature, set: (obj, value) => { obj.signature = value; } }, metadata: _metadata }, _signature_initializers, _signature_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.SignatureDecorator = SignatureDecorator;
