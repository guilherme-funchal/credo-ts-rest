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
exports.InvitationType = exports.OutOfBandInvitation = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const query_string_1 = require("query-string");
const AgentMessage_1 = require("../../../agent/AgentMessage");
const Attachment_1 = require("../../../decorators/attachment/Attachment");
const error_1 = require("../../../error");
const JsonEncoder_1 = require("../../../utils/JsonEncoder");
const JsonTransformer_1 = require("../../../utils/JsonTransformer");
const messageType_1 = require("../../../utils/messageType");
const validators_1 = require("../../../utils/validators");
const peerDidNumAlgo2_1 = require("../../dids/methods/peer/peerDidNumAlgo2");
const OutOfBandDidCommService_1 = require("../domain/OutOfBandDidCommService");
let OutOfBandInvitation = (() => {
    var _a;
    let _classSuper = AgentMessage_1.AgentMessage;
    let _invitationType_decorators;
    let _invitationType_initializers = [];
    let _invitationType_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _goalCode_decorators;
    let _goalCode_initializers = [];
    let _goalCode_extraInitializers = [];
    let _handshakeProtocols_decorators;
    let _handshakeProtocols_initializers = [];
    let _handshakeProtocols_extraInitializers = [];
    let _requests_decorators;
    let _requests_initializers = [];
    let _requests_extraInitializers = [];
    let _services_decorators;
    let _services_initializers = [];
    let _services_extraInitializers = [];
    let _imageUrl_decorators;
    let _imageUrl_initializers = [];
    let _imageUrl_extraInitializers = [];
    return _a = class OutOfBandInvitation extends _classSuper {
            constructor(options) {
                var _b;
                super();
                /**
                 * The original type of the invitation. This is not part of the RFC, but allows to identify
                 * from what the oob invitation was originally created (e.g. legacy connectionless invitation).
                 */
                this.invitationType = __runInitializers(this, _invitationType_initializers, void 0);
                this.type = (__runInitializers(this, _invitationType_extraInitializers), __runInitializers(this, _type_initializers, _a.type.messageTypeUri));
                this.label = __runInitializers(this, _type_extraInitializers);
                this.goalCode = __runInitializers(this, _goalCode_initializers, void 0);
                this.goal = __runInitializers(this, _goalCode_extraInitializers);
                this.handshakeProtocols = __runInitializers(this, _handshakeProtocols_initializers, void 0);
                this.requests = (__runInitializers(this, _handshakeProtocols_extraInitializers), __runInitializers(this, _requests_initializers, void 0));
                this.services = (__runInitializers(this, _requests_extraInitializers), __runInitializers(this, _services_initializers, void 0));
                /**
                 * Custom property. It is not part of the RFC.
                 */
                this.imageUrl = (__runInitializers(this, _services_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
                __runInitializers(this, _imageUrl_extraInitializers);
                if (options) {
                    this.id = (_b = options.id) !== null && _b !== void 0 ? _b : this.generateId();
                    this.label = options.label;
                    this.goalCode = options.goalCode;
                    this.goal = options.goal;
                    this.accept = options.accept;
                    this.handshakeProtocols = options.handshakeProtocols;
                    this.services = options.services;
                    this.imageUrl = options.imageUrl;
                    this.appendedAttachments = options.appendedAttachments;
                }
            }
            addRequest(message) {
                if (!this.requests)
                    this.requests = [];
                const requestAttachment = new Attachment_1.Attachment({
                    id: this.generateId(),
                    mimeType: 'application/json',
                    data: new Attachment_1.AttachmentData({
                        base64: JsonEncoder_1.JsonEncoder.toBase64(message.toJSON()),
                    }),
                });
                this.requests.push(requestAttachment);
            }
            getRequests() {
                var _b;
                return (_b = this.requests) === null || _b === void 0 ? void 0 : _b.map((request) => request.getDataAsJson());
            }
            toUrl({ domain }) {
                const invitationJson = this.toJSON();
                const encodedInvitation = JsonEncoder_1.JsonEncoder.toBase64URL(invitationJson);
                const invitationUrl = `${domain}?oob=${encodedInvitation}`;
                return invitationUrl;
            }
            static fromUrl(invitationUrl) {
                const parsedUrl = (0, query_string_1.parseUrl)(invitationUrl).query;
                const encodedInvitation = parsedUrl['oob'];
                if (typeof encodedInvitation === 'string') {
                    const invitationJson = JsonEncoder_1.JsonEncoder.fromBase64(encodedInvitation);
                    const invitation = this.fromJson(invitationJson);
                    return invitation;
                }
                else {
                    throw new error_1.AriesFrameworkError('InvitationUrl is invalid. It needs to contain one, and only one, of the following parameters; `oob`');
                }
            }
            static fromJson(json) {
                return JsonTransformer_1.JsonTransformer.fromJSON(json, _a);
            }
            get invitationDids() {
                const dids = this.getServices().map((didOrService) => {
                    if (typeof didOrService === 'string') {
                        return didOrService;
                    }
                    return (0, peerDidNumAlgo2_1.outOfBandServiceToNumAlgo2Did)(didOrService);
                });
                return dids;
            }
            // shorthand for services without the need to deal with the String DIDs
            getServices() {
                return this.services.map((service) => {
                    if (service instanceof String)
                        return service.toString();
                    return service;
                });
            }
            getDidServices() {
                return this.getServices().filter((service) => typeof service === 'string');
            }
            getInlineServices() {
                return this.getServices().filter((service) => typeof service !== 'string');
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _invitationType_decorators = [(0, class_transformer_1.Exclude)()];
            _type_decorators = [(0, class_transformer_1.Transform)(({ value }) => (0, messageType_1.replaceLegacyDidSovPrefix)(value), {
                    toClassOnly: true,
                }), (0, messageType_1.IsValidMessageType)(OutOfBandInvitation.type)];
            _goalCode_decorators = [(0, class_transformer_1.Expose)({ name: 'goal_code' })];
            _handshakeProtocols_decorators = [(0, class_transformer_1.Transform)(({ value }) => value === null || value === void 0 ? void 0 : value.map(messageType_1.replaceLegacyDidSovPrefix), { toClassOnly: true }), (0, class_transformer_1.Expose)({ name: 'handshake_protocols' })];
            _requests_decorators = [(0, class_transformer_1.Expose)({ name: 'requests~attach' }), (0, class_transformer_1.Type)(() => Attachment_1.Attachment), (0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({
                    each: true,
                }), (0, class_validator_1.IsInstance)(Attachment_1.Attachment, { each: true }), (0, class_validator_1.IsOptional)()];
            _services_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ArrayNotEmpty)(), OutOfBandServiceTransformer(), (0, validators_1.IsStringOrInstance)(OutOfBandDidCommService_1.OutOfBandDidCommService, { each: true })];
            _imageUrl_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUrl)()];
            __esDecorate(null, null, _invitationType_decorators, { kind: "field", name: "invitationType", static: false, private: false, access: { has: obj => "invitationType" in obj, get: obj => obj.invitationType, set: (obj, value) => { obj.invitationType = value; } }, metadata: _metadata }, _invitationType_initializers, _invitationType_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _goalCode_decorators, { kind: "field", name: "goalCode", static: false, private: false, access: { has: obj => "goalCode" in obj, get: obj => obj.goalCode, set: (obj, value) => { obj.goalCode = value; } }, metadata: _metadata }, _goalCode_initializers, _goalCode_extraInitializers);
            __esDecorate(null, null, _handshakeProtocols_decorators, { kind: "field", name: "handshakeProtocols", static: false, private: false, access: { has: obj => "handshakeProtocols" in obj, get: obj => obj.handshakeProtocols, set: (obj, value) => { obj.handshakeProtocols = value; } }, metadata: _metadata }, _handshakeProtocols_initializers, _handshakeProtocols_extraInitializers);
            __esDecorate(null, null, _requests_decorators, { kind: "field", name: "requests", static: false, private: false, access: { has: obj => "requests" in obj, get: obj => obj.requests, set: (obj, value) => { obj.requests = value; } }, metadata: _metadata }, _requests_initializers, _requests_extraInitializers);
            __esDecorate(null, null, _services_decorators, { kind: "field", name: "services", static: false, private: false, access: { has: obj => "services" in obj, get: obj => obj.services, set: (obj, value) => { obj.services = value; } }, metadata: _metadata }, _services_initializers, _services_extraInitializers);
            __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: obj => "imageUrl" in obj, get: obj => obj.imageUrl, set: (obj, value) => { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, messageType_1.parseMessageType)('https://didcomm.org/out-of-band/1.1/invitation'),
        _a;
})();
exports.OutOfBandInvitation = OutOfBandInvitation;
/**
 * Decorator that transforms services json to corresponding class instances
 * @note Because of ValidateNested limitation, this produces instances of String for DID services except plain js string
 */
function OutOfBandServiceTransformer() {
    return (0, class_transformer_1.Transform)(({ value, type }) => {
        if (type === class_transformer_1.TransformationType.PLAIN_TO_CLASS) {
            return value.map((service) => {
                // did
                if (typeof service === 'string')
                    return new String(service);
                // inline didcomm service
                return JsonTransformer_1.JsonTransformer.fromJSON(service, OutOfBandDidCommService_1.OutOfBandDidCommService);
            });
        }
        else if (type === class_transformer_1.TransformationType.CLASS_TO_PLAIN) {
            return value.map((service) => typeof service === 'string' || service instanceof String ? service.toString() : JsonTransformer_1.JsonTransformer.toJSON(service));
        }
        // PLAIN_TO_PLAIN
        return value;
    });
}
/**
 * The original invitation an out of band invitation was derived from.
 */
var InvitationType;
(function (InvitationType) {
    InvitationType["OutOfBand"] = "out-of-band/1.x";
    InvitationType["Connection"] = "connections/1.x";
    InvitationType["Connectionless"] = "connectionless";
})(InvitationType || (exports.InvitationType = InvitationType = {}));
