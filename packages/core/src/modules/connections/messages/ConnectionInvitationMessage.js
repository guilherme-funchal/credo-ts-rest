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
exports.ConnectionInvitationMessage = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const query_string_1 = require("query-string");
const AgentMessage_1 = require("../../../agent/AgentMessage");
const error_1 = require("../../../error");
const JsonEncoder_1 = require("../../../utils/JsonEncoder");
const JsonTransformer_1 = require("../../../utils/JsonTransformer");
const messageType_1 = require("../../../utils/messageType");
/**
 * Message to invite another agent to create a connection
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0160-connection-protocol/README.md#0-invitation-to-connect
 */
let ConnectionInvitationMessage = (() => {
    var _a;
    let _classSuper = AgentMessage_1.AgentMessage;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _label_decorators;
    let _label_initializers = [];
    let _label_extraInitializers = [];
    let _did_decorators;
    let _did_initializers = [];
    let _did_extraInitializers = [];
    let _recipientKeys_decorators;
    let _recipientKeys_initializers = [];
    let _recipientKeys_extraInitializers = [];
    let _serviceEndpoint_decorators;
    let _serviceEndpoint_initializers = [];
    let _serviceEndpoint_extraInitializers = [];
    let _routingKeys_decorators;
    let _routingKeys_initializers = [];
    let _routingKeys_extraInitializers = [];
    let _imageUrl_decorators;
    let _imageUrl_initializers = [];
    let _imageUrl_extraInitializers = [];
    return _a = class ConnectionInvitationMessage extends _classSuper {
            /**
             * Create new ConnectionInvitationMessage instance.
             * @param options
             */
            constructor(options) {
                super();
                this.allowDidSovPrefix = true;
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                this.label = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _label_initializers, void 0));
                this.did = (__runInitializers(this, _label_extraInitializers), __runInitializers(this, _did_initializers, void 0));
                this.recipientKeys = (__runInitializers(this, _did_extraInitializers), __runInitializers(this, _recipientKeys_initializers, void 0));
                this.serviceEndpoint = (__runInitializers(this, _recipientKeys_extraInitializers), __runInitializers(this, _serviceEndpoint_initializers, void 0));
                this.routingKeys = (__runInitializers(this, _serviceEndpoint_extraInitializers), __runInitializers(this, _routingKeys_initializers, void 0));
                this.imageUrl = (__runInitializers(this, _routingKeys_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
                __runInitializers(this, _imageUrl_extraInitializers);
                if (options) {
                    this.id = options.id || this.generateId();
                    this.label = options.label;
                    this.imageUrl = options.imageUrl;
                    this.appendedAttachments = options.appendedAttachments;
                    if (isDidInvitation(options)) {
                        this.did = options.did;
                    }
                    else {
                        this.recipientKeys = options.recipientKeys;
                        this.serviceEndpoint = options.serviceEndpoint;
                        this.routingKeys = options.routingKeys;
                    }
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    if (options.did && (options.recipientKeys || options.routingKeys || options.serviceEndpoint)) {
                        throw new error_1.AriesFrameworkError('either the did or the recipientKeys/serviceEndpoint/routingKeys must be set, but not both');
                    }
                }
            }
            /**
             * Create an invitation url from this instance
             *
             * @param domain domain name to use for invitation url
             * @returns invitation url with base64 encoded invitation
             */
            toUrl({ domain, useDidSovPrefixWhereAllowed = false, }) {
                const invitationJson = this.toJSON({ useDidSovPrefixWhereAllowed });
                const encodedInvitation = JsonEncoder_1.JsonEncoder.toBase64URL(invitationJson);
                const invitationUrl = `${domain}?c_i=${encodedInvitation}`;
                return invitationUrl;
            }
            /**
             * Create a `ConnectionInvitationMessage` instance from the `c_i` or `d_m` parameter of an URL
             *
             * @param invitationUrl invitation url containing c_i or d_m parameter
             *
             * @throws Error when the url can not be decoded to JSON, or decoded message is not a valid 'ConnectionInvitationMessage'
             */
            static fromUrl(invitationUrl) {
                var _b;
                const parsedUrl = (0, query_string_1.parseUrl)(invitationUrl).query;
                const encodedInvitation = (_b = parsedUrl['c_i']) !== null && _b !== void 0 ? _b : parsedUrl['d_m'];
                if (typeof encodedInvitation === 'string') {
                    const invitationJson = JsonEncoder_1.JsonEncoder.fromBase64(encodedInvitation);
                    const invitation = JsonTransformer_1.JsonTransformer.fromJSON(invitationJson, _a);
                    return invitation;
                }
                else {
                    throw new error_1.AriesFrameworkError('InvitationUrl is invalid. Needs to be encoded with either c_i, d_m, or oob');
                }
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _type_decorators = [(0, messageType_1.IsValidMessageType)(ConnectionInvitationMessage.type), (0, class_transformer_1.Transform)(({ value }) => (0, messageType_1.replaceLegacyDidSovPrefix)(value), {
                    toClassOnly: true,
                })];
            _label_decorators = [(0, class_validator_1.IsString)()];
            _did_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.ValidateIf)((o) => o.recipientKeys === undefined)];
            _recipientKeys_decorators = [(0, class_validator_1.IsString)({
                    each: true,
                }), (0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateIf)((o) => o.did === undefined), (0, class_validator_1.ArrayNotEmpty)()];
            _serviceEndpoint_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.ValidateIf)((o) => o.did === undefined)];
            _routingKeys_decorators = [(0, class_validator_1.IsString)({
                    each: true,
                }), (0, class_validator_1.ValidateIf)((o) => o.did === undefined), (0, class_validator_1.IsOptional)()];
            _imageUrl_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUrl)()];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _label_decorators, { kind: "field", name: "label", static: false, private: false, access: { has: obj => "label" in obj, get: obj => obj.label, set: (obj, value) => { obj.label = value; } }, metadata: _metadata }, _label_initializers, _label_extraInitializers);
            __esDecorate(null, null, _did_decorators, { kind: "field", name: "did", static: false, private: false, access: { has: obj => "did" in obj, get: obj => obj.did, set: (obj, value) => { obj.did = value; } }, metadata: _metadata }, _did_initializers, _did_extraInitializers);
            __esDecorate(null, null, _recipientKeys_decorators, { kind: "field", name: "recipientKeys", static: false, private: false, access: { has: obj => "recipientKeys" in obj, get: obj => obj.recipientKeys, set: (obj, value) => { obj.recipientKeys = value; } }, metadata: _metadata }, _recipientKeys_initializers, _recipientKeys_extraInitializers);
            __esDecorate(null, null, _serviceEndpoint_decorators, { kind: "field", name: "serviceEndpoint", static: false, private: false, access: { has: obj => "serviceEndpoint" in obj, get: obj => obj.serviceEndpoint, set: (obj, value) => { obj.serviceEndpoint = value; } }, metadata: _metadata }, _serviceEndpoint_initializers, _serviceEndpoint_extraInitializers);
            __esDecorate(null, null, _routingKeys_decorators, { kind: "field", name: "routingKeys", static: false, private: false, access: { has: obj => "routingKeys" in obj, get: obj => obj.routingKeys, set: (obj, value) => { obj.routingKeys = value; } }, metadata: _metadata }, _routingKeys_initializers, _routingKeys_extraInitializers);
            __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: obj => "imageUrl" in obj, get: obj => obj.imageUrl, set: (obj, value) => { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, messageType_1.parseMessageType)('https://didcomm.org/connections/1.0/invitation'),
        _a;
})();
exports.ConnectionInvitationMessage = ConnectionInvitationMessage;
/**
 * Check whether an invitation is a `DIDInvitationData` object
 *
 * @param invitation invitation object
 */
function isDidInvitation(invitation) {
    return invitation.did !== undefined;
}
