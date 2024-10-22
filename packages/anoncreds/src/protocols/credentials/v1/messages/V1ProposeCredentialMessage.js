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
exports.V1ProposeCredentialMessage = void 0;
const core_1 = require("@aries-framework/core");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const utils_1 = require("../../../../utils");
const V1CredentialPreview_1 = require("./V1CredentialPreview");
/**
 * Message part of Issue Credential Protocol used to initiate credential exchange by prover.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0036-issue-credential/README.md#propose-credential
 */
let V1ProposeCredentialMessage = (() => {
    var _a;
    let _classSuper = core_1.AgentMessage;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _comment_decorators;
    let _comment_initializers = [];
    let _comment_extraInitializers = [];
    let _credentialPreview_decorators;
    let _credentialPreview_initializers = [];
    let _credentialPreview_extraInitializers = [];
    let _schemaIssuerDid_decorators;
    let _schemaIssuerDid_initializers = [];
    let _schemaIssuerDid_extraInitializers = [];
    let _schemaId_decorators;
    let _schemaId_initializers = [];
    let _schemaId_extraInitializers = [];
    let _schemaName_decorators;
    let _schemaName_initializers = [];
    let _schemaName_extraInitializers = [];
    let _schemaVersion_decorators;
    let _schemaVersion_initializers = [];
    let _schemaVersion_extraInitializers = [];
    let _credentialDefinitionId_decorators;
    let _credentialDefinitionId_initializers = [];
    let _credentialDefinitionId_extraInitializers = [];
    let _issuerDid_decorators;
    let _issuerDid_initializers = [];
    let _issuerDid_extraInitializers = [];
    return _a = class V1ProposeCredentialMessage extends _classSuper {
            constructor(options) {
                var _b;
                super();
                this.allowDidSovPrefix = true;
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                /**
                 * Human readable information about this Credential Proposal,
                 * so the proposal can be evaluated by human judgment.
                 */
                this.comment = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _comment_initializers, void 0));
                /**
                 * Represents the credential data that Prover wants to receive.
                 */
                this.credentialPreview = (__runInitializers(this, _comment_extraInitializers), __runInitializers(this, _credentialPreview_initializers, void 0));
                /**
                 * Filter to request credential based on a particular Schema issuer DID.
                 */
                this.schemaIssuerDid = (__runInitializers(this, _credentialPreview_extraInitializers), __runInitializers(this, _schemaIssuerDid_initializers, void 0));
                /**
                 * Filter to request credential based on a particular Schema.
                 */
                this.schemaId = (__runInitializers(this, _schemaIssuerDid_extraInitializers), __runInitializers(this, _schemaId_initializers, void 0));
                /**
                 * Filter to request credential based on a schema name.
                 */
                this.schemaName = (__runInitializers(this, _schemaId_extraInitializers), __runInitializers(this, _schemaName_initializers, void 0));
                /**
                 * Filter  to request credential based on a schema version.
                 */
                this.schemaVersion = (__runInitializers(this, _schemaName_extraInitializers), __runInitializers(this, _schemaVersion_initializers, void 0));
                /**
                 * Filter to request credential based on a particular Credential Definition.
                 */
                this.credentialDefinitionId = (__runInitializers(this, _schemaVersion_extraInitializers), __runInitializers(this, _credentialDefinitionId_initializers, void 0));
                /**
                 * Filter to request a credential issued by the owner of a particular DID.
                 */
                this.issuerDid = (__runInitializers(this, _credentialDefinitionId_extraInitializers), __runInitializers(this, _issuerDid_initializers, void 0));
                __runInitializers(this, _issuerDid_extraInitializers);
                if (options) {
                    this.id = (_b = options.id) !== null && _b !== void 0 ? _b : this.generateId();
                    this.comment = options.comment;
                    this.credentialPreview = options.credentialPreview;
                    this.schemaIssuerDid = options.schemaIssuerDid;
                    this.schemaId = options.schemaId;
                    this.schemaName = options.schemaName;
                    this.schemaVersion = options.schemaVersion;
                    this.credentialDefinitionId = options.credentialDefinitionId;
                    this.issuerDid = options.issuerDid;
                    this.appendedAttachments = options.attachments;
                }
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _type_decorators = [(0, core_1.IsValidMessageType)(V1ProposeCredentialMessage.type)];
            _comment_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _credentialPreview_decorators = [(0, class_transformer_1.Expose)({ name: 'credential_proposal' }), (0, class_transformer_1.Type)(() => V1CredentialPreview_1.V1CredentialPreview), (0, class_validator_1.ValidateNested)(), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInstance)(V1CredentialPreview_1.V1CredentialPreview)];
            _schemaIssuerDid_decorators = [(0, class_transformer_1.Expose)({ name: 'schema_issuer_did' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)(), (0, class_validator_1.Matches)(utils_1.unqualifiedIndyDidRegex)];
            _schemaId_decorators = [(0, class_transformer_1.Expose)({ name: 'schema_id' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)(), (0, class_validator_1.Matches)(utils_1.unqualifiedSchemaIdRegex)];
            _schemaName_decorators = [(0, class_transformer_1.Expose)({ name: 'schema_name' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _schemaVersion_decorators = [(0, class_transformer_1.Expose)({ name: 'schema_version' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)(), (0, class_validator_1.Matches)(utils_1.unqualifiedSchemaVersionRegex, {
                    message: 'Version must be X.X or X.X.X',
                })];
            _credentialDefinitionId_decorators = [(0, class_transformer_1.Expose)({ name: 'cred_def_id' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)(), (0, class_validator_1.Matches)(utils_1.unqualifiedCredentialDefinitionIdRegex)];
            _issuerDid_decorators = [(0, class_transformer_1.Expose)({ name: 'issuer_did' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)(), (0, class_validator_1.Matches)(utils_1.unqualifiedIndyDidRegex)];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _comment_decorators, { kind: "field", name: "comment", static: false, private: false, access: { has: obj => "comment" in obj, get: obj => obj.comment, set: (obj, value) => { obj.comment = value; } }, metadata: _metadata }, _comment_initializers, _comment_extraInitializers);
            __esDecorate(null, null, _credentialPreview_decorators, { kind: "field", name: "credentialPreview", static: false, private: false, access: { has: obj => "credentialPreview" in obj, get: obj => obj.credentialPreview, set: (obj, value) => { obj.credentialPreview = value; } }, metadata: _metadata }, _credentialPreview_initializers, _credentialPreview_extraInitializers);
            __esDecorate(null, null, _schemaIssuerDid_decorators, { kind: "field", name: "schemaIssuerDid", static: false, private: false, access: { has: obj => "schemaIssuerDid" in obj, get: obj => obj.schemaIssuerDid, set: (obj, value) => { obj.schemaIssuerDid = value; } }, metadata: _metadata }, _schemaIssuerDid_initializers, _schemaIssuerDid_extraInitializers);
            __esDecorate(null, null, _schemaId_decorators, { kind: "field", name: "schemaId", static: false, private: false, access: { has: obj => "schemaId" in obj, get: obj => obj.schemaId, set: (obj, value) => { obj.schemaId = value; } }, metadata: _metadata }, _schemaId_initializers, _schemaId_extraInitializers);
            __esDecorate(null, null, _schemaName_decorators, { kind: "field", name: "schemaName", static: false, private: false, access: { has: obj => "schemaName" in obj, get: obj => obj.schemaName, set: (obj, value) => { obj.schemaName = value; } }, metadata: _metadata }, _schemaName_initializers, _schemaName_extraInitializers);
            __esDecorate(null, null, _schemaVersion_decorators, { kind: "field", name: "schemaVersion", static: false, private: false, access: { has: obj => "schemaVersion" in obj, get: obj => obj.schemaVersion, set: (obj, value) => { obj.schemaVersion = value; } }, metadata: _metadata }, _schemaVersion_initializers, _schemaVersion_extraInitializers);
            __esDecorate(null, null, _credentialDefinitionId_decorators, { kind: "field", name: "credentialDefinitionId", static: false, private: false, access: { has: obj => "credentialDefinitionId" in obj, get: obj => obj.credentialDefinitionId, set: (obj, value) => { obj.credentialDefinitionId = value; } }, metadata: _metadata }, _credentialDefinitionId_initializers, _credentialDefinitionId_extraInitializers);
            __esDecorate(null, null, _issuerDid_decorators, { kind: "field", name: "issuerDid", static: false, private: false, access: { has: obj => "issuerDid" in obj, get: obj => obj.issuerDid, set: (obj, value) => { obj.issuerDid = value; } }, metadata: _metadata }, _issuerDid_initializers, _issuerDid_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, core_1.parseMessageType)('https://didcomm.org/issue-credential/1.0/propose-credential'),
        _a;
})();
exports.V1ProposeCredentialMessage = V1ProposeCredentialMessage;
