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
exports.CredentialExchangeRecord = void 0;
const class_transformer_1 = require("class-transformer");
const Attachment_1 = require("../../../decorators/attachment/Attachment");
const error_1 = require("../../../error");
const BaseRecord_1 = require("../../../storage/BaseRecord");
const uuid_1 = require("../../../utils/uuid");
const CredentialPreviewAttribute_1 = require("../models/CredentialPreviewAttribute");
let CredentialExchangeRecord = (() => {
    var _a;
    let _classSuper = BaseRecord_1.BaseRecord;
    let _credentialAttributes_decorators;
    let _credentialAttributes_initializers = [];
    let _credentialAttributes_extraInitializers = [];
    let _linkedAttachments_decorators;
    let _linkedAttachments_initializers = [];
    let _linkedAttachments_extraInitializers = [];
    return _a = class CredentialExchangeRecord extends _classSuper {
            constructor(props) {
                var _b, _c, _d;
                super();
                this.credentials = [];
                this.credentialAttributes = __runInitializers(this, _credentialAttributes_initializers, void 0);
                this.linkedAttachments = (__runInitializers(this, _credentialAttributes_extraInitializers), __runInitializers(this, _linkedAttachments_initializers, void 0));
                this.type = (__runInitializers(this, _linkedAttachments_extraInitializers), _a.type);
                if (props) {
                    this.id = (_b = props.id) !== null && _b !== void 0 ? _b : (0, uuid_1.uuid)();
                    this.createdAt = (_c = props.createdAt) !== null && _c !== void 0 ? _c : new Date();
                    this.state = props.state;
                    this.connectionId = props.connectionId;
                    this.threadId = props.threadId;
                    this.parentThreadId = props.parentThreadId;
                    this.protocolVersion = props.protocolVersion;
                    this._tags = (_d = props.tags) !== null && _d !== void 0 ? _d : {};
                    this.credentialAttributes = props.credentialAttributes;
                    this.autoAcceptCredential = props.autoAcceptCredential;
                    this.linkedAttachments = props.linkedAttachments;
                    this.revocationNotification = props.revocationNotification;
                    this.errorMessage = props.errorMessage;
                    this.credentials = props.credentials || [];
                }
            }
            getTags() {
                const ids = this.credentials.map((c) => c.credentialRecordId);
                return Object.assign(Object.assign({}, this._tags), { threadId: this.threadId, parentThreadId: this.parentThreadId, connectionId: this.connectionId, state: this.state, credentialIds: ids });
            }
            assertProtocolVersion(version) {
                if (this.protocolVersion != version) {
                    throw new error_1.AriesFrameworkError(`Credential record has invalid protocol version ${this.protocolVersion}. Expected version ${version}`);
                }
            }
            assertState(expectedStates) {
                if (!Array.isArray(expectedStates)) {
                    expectedStates = [expectedStates];
                }
                if (!expectedStates.includes(this.state)) {
                    throw new error_1.AriesFrameworkError(`Credential record is in invalid state ${this.state}. Valid states are: ${expectedStates.join(', ')}.`);
                }
            }
            assertConnection(currentConnectionId) {
                if (!this.connectionId) {
                    throw new error_1.AriesFrameworkError(`Credential record is not associated with any connection. This is often the case with connection-less credential exchange`);
                }
                else if (this.connectionId !== currentConnectionId) {
                    throw new error_1.AriesFrameworkError(`Credential record is associated with connection '${this.connectionId}'. Current connection is '${currentConnectionId}'`);
                }
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _credentialAttributes_decorators = [(0, class_transformer_1.Type)(() => CredentialPreviewAttribute_1.CredentialPreviewAttribute)];
            _linkedAttachments_decorators = [(0, class_transformer_1.Type)(() => Attachment_1.Attachment)];
            __esDecorate(null, null, _credentialAttributes_decorators, { kind: "field", name: "credentialAttributes", static: false, private: false, access: { has: obj => "credentialAttributes" in obj, get: obj => obj.credentialAttributes, set: (obj, value) => { obj.credentialAttributes = value; } }, metadata: _metadata }, _credentialAttributes_initializers, _credentialAttributes_extraInitializers);
            __esDecorate(null, null, _linkedAttachments_decorators, { kind: "field", name: "linkedAttachments", static: false, private: false, access: { has: obj => "linkedAttachments" in obj, get: obj => obj.linkedAttachments, set: (obj, value) => { obj.linkedAttachments = value; } }, metadata: _metadata }, _linkedAttachments_initializers, _linkedAttachments_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        // Type is CredentialRecord on purpose (without Exchange) as this is how the record was initially called.
        _a.type = 'CredentialRecord',
        _a;
})();
exports.CredentialExchangeRecord = CredentialExchangeRecord;
