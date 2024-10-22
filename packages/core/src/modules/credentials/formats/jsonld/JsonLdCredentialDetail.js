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
exports.JsonLdCredentialDetail = void 0;
const class_transformer_1 = require("class-transformer");
const W3cCredential_1 = require("../../../vc/models/credential/W3cCredential");
const JsonLdCredentialDetailOptions_1 = require("./JsonLdCredentialDetailOptions");
/**
 * Class providing validation for the V2 json ld credential as per RFC0593 (used to sign credentials)
 *
 */
let JsonLdCredentialDetail = (() => {
    var _a;
    let _credential_decorators;
    let _credential_initializers = [];
    let _credential_extraInitializers = [];
    let _options_decorators;
    let _options_initializers = [];
    let _options_extraInitializers = [];
    return _a = class JsonLdCredentialDetail {
            constructor(options) {
                this.credential = __runInitializers(this, _credential_initializers, void 0);
                this.options = (__runInitializers(this, _credential_extraInitializers), __runInitializers(this, _options_initializers, void 0));
                __runInitializers(this, _options_extraInitializers);
                if (options) {
                    this.credential = options.credential;
                    this.options = options.options;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _credential_decorators = [(0, class_transformer_1.Type)(() => W3cCredential_1.W3cCredential)];
            _options_decorators = [(0, class_transformer_1.Expose)({ name: 'options' }), (0, class_transformer_1.Type)(() => JsonLdCredentialDetailOptions_1.JsonLdCredentialDetailOptions)];
            __esDecorate(null, null, _credential_decorators, { kind: "field", name: "credential", static: false, private: false, access: { has: obj => "credential" in obj, get: obj => obj.credential, set: (obj, value) => { obj.credential = value; } }, metadata: _metadata }, _credential_initializers, _credential_extraInitializers);
            __esDecorate(null, null, _options_decorators, { kind: "field", name: "options", static: false, private: false, access: { has: obj => "options" in obj, get: obj => obj.options, set: (obj, value) => { obj.options = value; } }, metadata: _metadata }, _options_initializers, _options_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.JsonLdCredentialDetail = JsonLdCredentialDetail;
