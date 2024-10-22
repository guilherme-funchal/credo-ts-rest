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
exports.V2RequestCredentialMessage = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const AgentMessage_1 = require("../../../../../agent/AgentMessage");
const Attachment_1 = require("../../../../../decorators/attachment/Attachment");
const messageType_1 = require("../../../../../utils/messageType");
const models_1 = require("../../../models");
let V2RequestCredentialMessage = (() => {
    var _a;
    let _classSuper = AgentMessage_1.AgentMessage;
    let _formats_decorators;
    let _formats_initializers = [];
    let _formats_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _requestAttachments_decorators;
    let _requestAttachments_initializers = [];
    let _requestAttachments_extraInitializers = [];
    let _comment_decorators;
    let _comment_initializers = [];
    let _comment_extraInitializers = [];
    return _a = class V2RequestCredentialMessage extends _classSuper {
            constructor(options) {
                var _b;
                super();
                this.formats = __runInitializers(this, _formats_initializers, void 0);
                this.type = (__runInitializers(this, _formats_extraInitializers), __runInitializers(this, _type_initializers, _a.type.messageTypeUri));
                this.requestAttachments = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _requestAttachments_initializers, void 0));
                /**
                 * Human readable information about this Credential Request,
                 * so the proposal can be evaluated by human judgment.
                 */
                this.comment = (__runInitializers(this, _requestAttachments_extraInitializers), __runInitializers(this, _comment_initializers, void 0));
                __runInitializers(this, _comment_extraInitializers);
                if (options) {
                    this.id = (_b = options.id) !== null && _b !== void 0 ? _b : this.generateId();
                    this.comment = options.comment;
                    this.formats = options.formats;
                    this.requestAttachments = options.requestAttachments;
                }
            }
            getRequestAttachmentById(id) {
                return this.requestAttachments.find((attachment) => attachment.id === id);
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _formats_decorators = [(0, class_transformer_1.Type)(() => models_1.CredentialFormatSpec), (0, class_validator_1.ValidateNested)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsInstance)(models_1.CredentialFormatSpec, { each: true })];
            _type_decorators = [(0, messageType_1.IsValidMessageType)(V2RequestCredentialMessage.type)];
            _requestAttachments_decorators = [(0, class_transformer_1.Expose)({ name: 'requests~attach' }), (0, class_transformer_1.Type)(() => Attachment_1.Attachment), (0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({
                    each: true,
                }), (0, class_validator_1.IsInstance)(Attachment_1.Attachment, { each: true })];
            _comment_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _formats_decorators, { kind: "field", name: "formats", static: false, private: false, access: { has: obj => "formats" in obj, get: obj => obj.formats, set: (obj, value) => { obj.formats = value; } }, metadata: _metadata }, _formats_initializers, _formats_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _requestAttachments_decorators, { kind: "field", name: "requestAttachments", static: false, private: false, access: { has: obj => "requestAttachments" in obj, get: obj => obj.requestAttachments, set: (obj, value) => { obj.requestAttachments = value; } }, metadata: _metadata }, _requestAttachments_initializers, _requestAttachments_extraInitializers);
            __esDecorate(null, null, _comment_decorators, { kind: "field", name: "comment", static: false, private: false, access: { has: obj => "comment" in obj, get: obj => obj.comment, set: (obj, value) => { obj.comment = value; } }, metadata: _metadata }, _comment_initializers, _comment_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, messageType_1.parseMessageType)('https://didcomm.org/issue-credential/2.0/request-credential'),
        _a;
})();
exports.V2RequestCredentialMessage = V2RequestCredentialMessage;
