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
exports.Connection = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const DidDoc_1 = require("./did/DidDoc");
let Connection = (() => {
    var _a;
    let _did_decorators;
    let _did_initializers = [];
    let _did_extraInitializers = [];
    let _didDoc_decorators;
    let _didDoc_initializers = [];
    let _didDoc_extraInitializers = [];
    return _a = class Connection {
            constructor(options) {
                this.did = __runInitializers(this, _did_initializers, void 0);
                this.didDoc = (__runInitializers(this, _did_extraInitializers), __runInitializers(this, _didDoc_initializers, void 0));
                __runInitializers(this, _didDoc_extraInitializers);
                if (options) {
                    this.did = options.did;
                    this.didDoc = options.didDoc;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _did_decorators = [(0, class_validator_1.IsString)(), (0, class_transformer_1.Expose)({ name: 'DID' })];
            _didDoc_decorators = [(0, class_transformer_1.Expose)({ name: 'DIDDoc' }), (0, class_transformer_1.Type)(() => DidDoc_1.DidDoc), (0, class_validator_1.ValidateNested)(), (0, class_validator_1.IsInstance)(DidDoc_1.DidDoc), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _did_decorators, { kind: "field", name: "did", static: false, private: false, access: { has: obj => "did" in obj, get: obj => obj.did, set: (obj, value) => { obj.did = value; } }, metadata: _metadata }, _did_initializers, _did_extraInitializers);
            __esDecorate(null, null, _didDoc_decorators, { kind: "field", name: "didDoc", static: false, private: false, access: { has: obj => "didDoc" in obj, get: obj => obj.didDoc, set: (obj, value) => { obj.didDoc = value; } }, metadata: _metadata }, _didDoc_initializers, _didDoc_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.Connection = Connection;
