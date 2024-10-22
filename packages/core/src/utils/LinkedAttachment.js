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
exports.LinkedAttachment = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const Attachment_1 = require("../decorators/attachment/Attachment");
const attachment_1 = require("./attachment");
let LinkedAttachment = (() => {
    var _a;
    let _attributeName_decorators;
    let _attributeName_initializers = [];
    let _attributeName_extraInitializers = [];
    let _attachment_decorators;
    let _attachment_initializers = [];
    let _attachment_extraInitializers = [];
    return _a = class LinkedAttachment {
            constructor(options) {
                /**
                 * The name that will be used to generate the linked credential
                 */
                this.attributeName = __runInitializers(this, _attributeName_initializers, void 0);
                /**
                 * The attachment that needs to be linked to the credential
                 */
                this.attachment = (__runInitializers(this, _attributeName_extraInitializers), __runInitializers(this, _attachment_initializers, void 0));
                __runInitializers(this, _attachment_extraInitializers);
                this.attributeName = options.name;
                this.attachment = options.attachment;
                this.attachment.id = this.getId(options.attachment);
            }
            /**
             * Generates an ID based on the data in the attachment
             *
             * @param attachment the attachment that requires a hashlink
             * @returns the id
             */
            getId(attachment) {
                // Take the second element since the id property
                // of a decorator MUST not contain a colon and has a maximum size of 64 characters
                return (0, attachment_1.encodeAttachment)(attachment).split(':')[1].substring(0, 64);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _attributeName_decorators = [(0, class_validator_1.IsString)()];
            _attachment_decorators = [(0, class_transformer_1.Type)(() => Attachment_1.Attachment)];
            __esDecorate(null, null, _attributeName_decorators, { kind: "field", name: "attributeName", static: false, private: false, access: { has: obj => "attributeName" in obj, get: obj => obj.attributeName, set: (obj, value) => { obj.attributeName = value; } }, metadata: _metadata }, _attributeName_initializers, _attributeName_extraInitializers);
            __esDecorate(null, null, _attachment_decorators, { kind: "field", name: "attachment", static: false, private: false, access: { has: obj => "attachment" in obj, get: obj => obj.attachment, set: (obj, value) => { obj.attachment = value; } }, metadata: _metadata }, _attachment_initializers, _attachment_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.LinkedAttachment = LinkedAttachment;
