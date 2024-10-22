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
exports.V1RequestCredentialMessage = exports.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID = void 0;
const core_1 = require("@aries-framework/core");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
exports.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID = 'libindy-cred-request-0';
let V1RequestCredentialMessage = (() => {
    var _a;
    let _classSuper = core_1.AgentMessage;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _comment_decorators;
    let _comment_initializers = [];
    let _comment_extraInitializers = [];
    let _requestAttachments_decorators;
    let _requestAttachments_initializers = [];
    let _requestAttachments_extraInitializers = [];
    return _a = class V1RequestCredentialMessage extends _classSuper {
            constructor(options) {
                super();
                this.allowDidSovPrefix = true;
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                this.comment = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _comment_initializers, void 0));
                this.requestAttachments = (__runInitializers(this, _comment_extraInitializers), __runInitializers(this, _requestAttachments_initializers, void 0));
                __runInitializers(this, _requestAttachments_extraInitializers);
                if (options) {
                    this.id = options.id || this.generateId();
                    this.comment = options.comment;
                    this.requestAttachments = options.requestAttachments;
                    this.appendedAttachments = options.attachments;
                }
            }
            get indyCredentialRequest() {
                var _b;
                const attachment = this.requestAttachments.find((attachment) => attachment.id === exports.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID);
                // Extract proof request from attachment
                const credentialReqJson = (_b = attachment === null || attachment === void 0 ? void 0 : attachment.getDataAsJson()) !== null && _b !== void 0 ? _b : null;
                return credentialReqJson;
            }
            getRequestAttachmentById(id) {
                return this.requestAttachments.find((attachment) => attachment.id === id);
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _type_decorators = [(0, core_1.IsValidMessageType)(V1RequestCredentialMessage.type)];
            _comment_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _requestAttachments_decorators = [(0, class_transformer_1.Expose)({ name: 'requests~attach' }), (0, class_transformer_1.Type)(() => core_1.Attachment), (0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({
                    each: true,
                }), (0, class_validator_1.IsInstance)(core_1.Attachment, { each: true })];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _comment_decorators, { kind: "field", name: "comment", static: false, private: false, access: { has: obj => "comment" in obj, get: obj => obj.comment, set: (obj, value) => { obj.comment = value; } }, metadata: _metadata }, _comment_initializers, _comment_extraInitializers);
            __esDecorate(null, null, _requestAttachments_decorators, { kind: "field", name: "requestAttachments", static: false, private: false, access: { has: obj => "requestAttachments" in obj, get: obj => obj.requestAttachments, set: (obj, value) => { obj.requestAttachments = value; } }, metadata: _metadata }, _requestAttachments_initializers, _requestAttachments_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, core_1.parseMessageType)('https://didcomm.org/issue-credential/1.0/request-credential'),
        _a;
})();
exports.V1RequestCredentialMessage = V1RequestCredentialMessage;
