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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attachment = exports.AttachmentData = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const error_1 = require("../../error");
const JsonEncoder_1 = require("../../utils/JsonEncoder");
const uuid_1 = require("../../utils/uuid");
/**
 * A JSON object that gives access to the actual content of the attachment
 */
let AttachmentData = (() => {
    var _a;
    let _base64_decorators;
    let _base64_initializers = [];
    let _base64_extraInitializers = [];
    let _json_decorators;
    let _json_initializers = [];
    let _json_extraInitializers = [];
    let _links_decorators;
    let _links_initializers = [];
    let _links_extraInitializers = [];
    let _jws_decorators;
    let _jws_initializers = [];
    let _jws_extraInitializers = [];
    let _sha256_decorators;
    let _sha256_initializers = [];
    let _sha256_extraInitializers = [];
    return _a = class AttachmentData {
            constructor(options) {
                /**
                 * Base64-encoded data, when representing arbitrary content inline instead of via links. Optional.
                 */
                this.base64 = __runInitializers(this, _base64_initializers, void 0);
                /**
                 *  Directly embedded JSON data, when representing content inline instead of via links, and when the content is natively conveyable as JSON. Optional.
                 */
                this.json = (__runInitializers(this, _base64_extraInitializers), __runInitializers(this, _json_initializers, void 0));
                /**
                 * A list of zero or more locations at which the content may be fetched. Optional.
                 */
                this.links = (__runInitializers(this, _json_extraInitializers), __runInitializers(this, _links_initializers, void 0));
                /**
                 * A JSON Web Signature over the content of the attachment. Optional.
                 */
                this.jws = (__runInitializers(this, _links_extraInitializers), __runInitializers(this, _jws_initializers, void 0));
                /**
                 * The hash of the content. Optional.
                 */
                this.sha256 = (__runInitializers(this, _jws_extraInitializers), __runInitializers(this, _sha256_initializers, void 0));
                __runInitializers(this, _sha256_extraInitializers);
                if (options) {
                    this.base64 = options.base64;
                    this.json = options.json;
                    this.links = options.links;
                    this.jws = options.jws;
                    this.sha256 = options.sha256;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _base64_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _json_decorators = [(0, class_validator_1.IsOptional)()];
            _links_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)({ each: true })];
            _jws_decorators = [(0, class_validator_1.IsOptional)()];
            _sha256_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsHash)('sha256')];
            __esDecorate(null, null, _base64_decorators, { kind: "field", name: "base64", static: false, private: false, access: { has: obj => "base64" in obj, get: obj => obj.base64, set: (obj, value) => { obj.base64 = value; } }, metadata: _metadata }, _base64_initializers, _base64_extraInitializers);
            __esDecorate(null, null, _json_decorators, { kind: "field", name: "json", static: false, private: false, access: { has: obj => "json" in obj, get: obj => obj.json, set: (obj, value) => { obj.json = value; } }, metadata: _metadata }, _json_initializers, _json_extraInitializers);
            __esDecorate(null, null, _links_decorators, { kind: "field", name: "links", static: false, private: false, access: { has: obj => "links" in obj, get: obj => obj.links, set: (obj, value) => { obj.links = value; } }, metadata: _metadata }, _links_initializers, _links_extraInitializers);
            __esDecorate(null, null, _jws_decorators, { kind: "field", name: "jws", static: false, private: false, access: { has: obj => "jws" in obj, get: obj => obj.jws, set: (obj, value) => { obj.jws = value; } }, metadata: _metadata }, _jws_initializers, _jws_extraInitializers);
            __esDecorate(null, null, _sha256_decorators, { kind: "field", name: "sha256", static: false, private: false, access: { has: obj => "sha256" in obj, get: obj => obj.sha256, set: (obj, value) => { obj.sha256 = value; } }, metadata: _metadata }, _sha256_initializers, _sha256_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.AttachmentData = AttachmentData;
/**
 * Represents DIDComm attachment
 * https://github.com/hyperledger/aries-rfcs/blob/master/concepts/0017-attachments/README.md
 */
let Attachment = (() => {
    var _a;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _filename_decorators;
    let _filename_initializers = [];
    let _filename_extraInitializers = [];
    let _mimeType_decorators;
    let _mimeType_initializers = [];
    let _mimeType_extraInitializers = [];
    let _lastmodTime_decorators;
    let _lastmodTime_initializers = [];
    let _lastmodTime_extraInitializers = [];
    let _byteCount_decorators;
    let _byteCount_initializers = [];
    let _byteCount_extraInitializers = [];
    let _data_decorators;
    let _data_initializers = [];
    let _data_extraInitializers = [];
    return _a = class Attachment {
            constructor(options) {
                var _b;
                this.id = __runInitializers(this, _id_initializers, void 0);
                /**
                 * An optional human-readable description of the content.
                 */
                this.description = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                /**
                 * A hint about the name that might be used if this attachment is persisted as a file. It is not required, and need not be unique. If this field is present and mime-type is not, the extension on the filename may be used to infer a MIME type.
                 */
                this.filename = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _filename_initializers, void 0));
                /**
                 * Describes the MIME type of the attached content. Optional but recommended.
                 */
                this.mimeType = (__runInitializers(this, _filename_extraInitializers), __runInitializers(this, _mimeType_initializers, void 0));
                /**
                 * A hint about when the content in this attachment was last modified.
                 */
                this.lastmodTime = (__runInitializers(this, _mimeType_extraInitializers), __runInitializers(this, _lastmodTime_initializers, void 0));
                /**
                 * Optional, and mostly relevant when content is included by reference instead of by value. Lets the receiver guess how expensive it will be, in time, bandwidth, and storage, to fully fetch the attachment.
                 */
                this.byteCount = (__runInitializers(this, _lastmodTime_extraInitializers), __runInitializers(this, _byteCount_initializers, void 0));
                this.data = (__runInitializers(this, _byteCount_extraInitializers), __runInitializers(this, _data_initializers, void 0));
                __runInitializers(this, _data_extraInitializers);
                if (options) {
                    this.id = (_b = options.id) !== null && _b !== void 0 ? _b : (0, uuid_1.uuid)();
                    this.description = options.description;
                    this.filename = options.filename;
                    this.mimeType = options.mimeType;
                    this.lastmodTime = options.lastmodTime;
                    this.byteCount = options.byteCount;
                    this.data = new AttachmentData(options.data);
                }
            }
            /*
             * Helper function returning JSON representation of attachment data (if present). Tries to obtain the data from .base64 or .json, throws an error otherwise
             */
            getDataAsJson() {
                if (typeof this.data.base64 === 'string') {
                    return JsonEncoder_1.JsonEncoder.fromBase64(this.data.base64);
                }
                else if (this.data.json) {
                    return this.data.json;
                }
                else {
                    throw new error_1.AriesFrameworkError('No attachment data found in `json` or `base64` data fields.');
                }
            }
            addJws(jws) {
                // Remove payload if user provided a non-detached JWS
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const _b = jws, { payload } = _b, detachedJws = __rest(_b, ["payload"]);
                // If no JWS yet, assign to current JWS
                if (!this.data.jws) {
                    this.data.jws = detachedJws;
                }
                // Is already jws array, add to it
                else if ('signatures' in this.data.jws) {
                    this.data.jws.signatures.push(detachedJws);
                }
                // If already single JWS, transform to general jws format
                else {
                    this.data.jws = {
                        signatures: [this.data.jws, detachedJws],
                    };
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, class_transformer_1.Expose)({ name: '@id' })];
            _description_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _filename_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _mimeType_decorators = [(0, class_transformer_1.Expose)({ name: 'mime-type' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsMimeType)()];
            _lastmodTime_decorators = [(0, class_transformer_1.Expose)({ name: 'lastmod_time' }), (0, class_transformer_1.Type)(() => Date), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDate)()];
            _byteCount_decorators = [(0, class_transformer_1.Expose)({ name: 'byte_count' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)()];
            _data_decorators = [(0, class_transformer_1.Type)(() => AttachmentData), (0, class_validator_1.ValidateNested)(), (0, class_validator_1.IsInstance)(AttachmentData)];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _filename_decorators, { kind: "field", name: "filename", static: false, private: false, access: { has: obj => "filename" in obj, get: obj => obj.filename, set: (obj, value) => { obj.filename = value; } }, metadata: _metadata }, _filename_initializers, _filename_extraInitializers);
            __esDecorate(null, null, _mimeType_decorators, { kind: "field", name: "mimeType", static: false, private: false, access: { has: obj => "mimeType" in obj, get: obj => obj.mimeType, set: (obj, value) => { obj.mimeType = value; } }, metadata: _metadata }, _mimeType_initializers, _mimeType_extraInitializers);
            __esDecorate(null, null, _lastmodTime_decorators, { kind: "field", name: "lastmodTime", static: false, private: false, access: { has: obj => "lastmodTime" in obj, get: obj => obj.lastmodTime, set: (obj, value) => { obj.lastmodTime = value; } }, metadata: _metadata }, _lastmodTime_initializers, _lastmodTime_extraInitializers);
            __esDecorate(null, null, _byteCount_decorators, { kind: "field", name: "byteCount", static: false, private: false, access: { has: obj => "byteCount" in obj, get: obj => obj.byteCount, set: (obj, value) => { obj.byteCount = value; } }, metadata: _metadata }, _byteCount_initializers, _byteCount_extraInitializers);
            __esDecorate(null, null, _data_decorators, { kind: "field", name: "data", static: false, private: false, access: { has: obj => "data" in obj, get: obj => obj.data, set: (obj, value) => { obj.data = value; } }, metadata: _metadata }, _data_initializers, _data_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.Attachment = Attachment;
