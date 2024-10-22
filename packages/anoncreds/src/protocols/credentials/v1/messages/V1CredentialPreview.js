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
exports.V1CredentialPreview = void 0;
const core_1 = require("@aries-framework/core");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
/**
 * Credential preview inner message class.
 *
 * This is not a message but an inner object for other messages in this protocol. It is used construct a preview of the data for the credential.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0036-issue-credential/README.md#preview-credential
 */
let V1CredentialPreview = (() => {
    var _a;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _attributes_decorators;
    let _attributes_initializers = [];
    let _attributes_extraInitializers = [];
    return _a = class V1CredentialPreview {
            constructor(options) {
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                this.attributes = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _attributes_initializers, void 0));
                __runInitializers(this, _attributes_extraInitializers);
                if (options) {
                    this.attributes = options.attributes.map((a) => new core_1.CredentialPreviewAttribute(a));
                }
            }
            toJSON() {
                return core_1.JsonTransformer.toJSON(this);
            }
            /**
             * Create a credential preview from a record with name and value entries.
             *
             * @example
             * const preview = CredentialPreview.fromRecord({
             *   name: "Bob",
             *   age: "20"
             * })
             */
            static fromRecord(record) {
                const attributes = Object.entries(record).map(([name, value]) => new core_1.CredentialPreviewAttribute({
                    name,
                    mimeType: 'text/plain',
                    value,
                }));
                return new _a({
                    attributes,
                });
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [(0, class_transformer_1.Expose)({ name: '@type' }), (0, core_1.IsValidMessageType)(V1CredentialPreview.type), (0, class_transformer_1.Transform)(({ value }) => (0, core_1.replaceLegacyDidSovPrefix)(value), {
                    toClassOnly: true,
                })];
            _attributes_decorators = [(0, class_transformer_1.Type)(() => core_1.CredentialPreviewAttribute), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_validator_1.IsInstance)(core_1.CredentialPreviewAttribute, { each: true })];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _attributes_decorators, { kind: "field", name: "attributes", static: false, private: false, access: { has: obj => "attributes" in obj, get: obj => obj.attributes, set: (obj, value) => { obj.attributes = value; } }, metadata: _metadata }, _attributes_initializers, _attributes_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, core_1.parseMessageType)('https://didcomm.org/issue-credential/1.0/credential-preview'),
        _a;
})();
exports.V1CredentialPreview = V1CredentialPreview;
