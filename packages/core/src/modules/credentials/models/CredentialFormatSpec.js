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
exports.CredentialFormatSpec = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const uuid_1 = require("../../../utils/uuid");
let CredentialFormatSpec = (() => {
    var _a;
    let _attachmentId_decorators;
    let _attachmentId_initializers = [];
    let _attachmentId_extraInitializers = [];
    let _format_decorators;
    let _format_initializers = [];
    let _format_extraInitializers = [];
    return _a = class CredentialFormatSpec {
            constructor(options) {
                var _b;
                this.attachmentId = __runInitializers(this, _attachmentId_initializers, void 0);
                this.format = (__runInitializers(this, _attachmentId_extraInitializers), __runInitializers(this, _format_initializers, void 0));
                __runInitializers(this, _format_extraInitializers);
                if (options) {
                    this.attachmentId = (_b = options.attachmentId) !== null && _b !== void 0 ? _b : (0, uuid_1.uuid)();
                    this.format = options.format;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _attachmentId_decorators = [(0, class_transformer_1.Expose)({ name: 'attach_id' }), (0, class_validator_1.IsString)()];
            _format_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _attachmentId_decorators, { kind: "field", name: "attachmentId", static: false, private: false, access: { has: obj => "attachmentId" in obj, get: obj => obj.attachmentId, set: (obj, value) => { obj.attachmentId = value; } }, metadata: _metadata }, _attachmentId_initializers, _attachmentId_extraInitializers);
            __esDecorate(null, null, _format_decorators, { kind: "field", name: "format", static: false, private: false, access: { has: obj => "format" in obj, get: obj => obj.format, set: (obj, value) => { obj.format = value; } }, metadata: _metadata }, _format_initializers, _format_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CredentialFormatSpec = CredentialFormatSpec;
