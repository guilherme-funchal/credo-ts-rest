"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
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
exports.OutOfBandController = void 0;
const core_1 = require("@credo-ts/core");
const messageType_1 = require("@credo-ts/core/build/utils/messageType");
const tsoa_1 = require("tsoa");
const tsyringe_1 = require("tsyringe");
const response_1 = require("../../../utils/response");
const ConnectionsControllerExamples_1 = require("../connections/ConnectionsControllerExamples");
const ConnectionsControllerTypes_1 = require("../connections/ConnectionsControllerTypes");
const OutOfBandControllerExamples_1 = require("./OutOfBandControllerExamples");
const OutOfBandControllerTypes_1 = require("./OutOfBandControllerTypes");
let OutOfBandController = (() => {
    let _classDecorators = [(0, tsoa_1.Tags)('DIDComm Out Of Band'), (0, tsoa_1.Route)('/didcomm/out-of-band'), (0, tsoa_1.Security)('tenants', ['tenant']), (0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = tsoa_1.Controller;
    let _instanceExtraInitializers = [];
    let _findOutOfBandRecordsByQuery_decorators;
    let _getOutOfBandRecordById_decorators;
    let _createInvitation_decorators;
    let _createLegacyInvitation_decorators;
    let _createLegacyConnectionlessInvitation_decorators;
    let _receiveInvitation_decorators;
    let _acceptInvitation_decorators;
    let _deleteOutOfBandRecord_decorators;
    var OutOfBandController = _classThis = class extends _classSuper {
        /**
         * Retrieve all out of band records by query
         */
        findOutOfBandRecordsByQuery(request, invitationId, role, state, threadId) {
            return __awaiter(this, void 0, void 0, function* () {
                const outOfBandRecords = yield request.user.agent.oob.findAllByQuery({
                    invitationId,
                    role,
                    state,
                    threadId,
                });
                return outOfBandRecords.map(OutOfBandControllerTypes_1.outOfBandRecordToApiModel);
            });
        }
        /**
         * Retrieve an out of band record by id
         */
        getOutOfBandRecordById(request, outOfBandId) {
            return __awaiter(this, void 0, void 0, function* () {
                const outOfBandRecord = yield request.user.agent.oob.findById(outOfBandId);
                if (!outOfBandRecord) {
                    this.setStatus(404);
                    return (0, response_1.apiErrorResponse)(`Out of band record with id "${outOfBandId}" not found.`);
                }
                return (0, OutOfBandControllerTypes_1.outOfBandRecordToApiModel)(outOfBandRecord);
            });
        }
        /**
         * Creates an outbound out-of-band record containing out-of-band invitation message defined in
         * Aries RFC 0434: Out-of-Band Protocol 1.1.
         */
        createInvitation(request, body) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    const outOfBandRecord = yield request.user.agent.oob.createInvitation(Object.assign(Object.assign({}, body), { messages: (_a = body === null || body === void 0 ? void 0 : body.messages) === null || _a === void 0 ? void 0 : _a.map((m) => core_1.JsonTransformer.fromJSON(m, core_1.AgentMessage)) }));
                    return {
                        invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({
                            domain: request.user.agent.config.endpoints[0],
                        }),
                        invitation: outOfBandRecord.outOfBandInvitation.toJSON({
                            useDidSovPrefixWhereAllowed: request.user.agent.config.useDidSovPrefixWhereAllowed,
                        }),
                        outOfBandRecord: (0, OutOfBandControllerTypes_1.outOfBandRecordToApiModel)(outOfBandRecord),
                    };
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Creates an outbound out-of-band record in the same way how `createInvitation` method does it,
         * but it also converts out-of-band invitation message to an "legacy" invitation message defined
         * in RFC 0160: Connection Protocol and returns it together with out-of-band record.
         *
         * @param config configuration of how a invitation should be created
         * @returns out-of-band record and invitation
         */
        createLegacyInvitation(request, body) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const { outOfBandRecord, invitation } = yield request.user.agent.oob.createLegacyInvitation(body);
                    return {
                        invitationUrl: invitation.toUrl({
                            domain: request.user.agent.config.endpoints[0],
                            useDidSovPrefixWhereAllowed: request.user.agent.config.useDidSovPrefixWhereAllowed,
                        }),
                        invitation: invitation.toJSON({
                            useDidSovPrefixWhereAllowed: request.user.agent.config.useDidSovPrefixWhereAllowed,
                        }),
                        outOfBandRecord: (0, OutOfBandControllerTypes_1.outOfBandRecordToApiModel)(outOfBandRecord),
                    };
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Creates a new connectionless legacy invitation.
         *
         * Only works with messages created from:
         * - /didcomm/credentials/create-offer
         * - /didcomm/poofs/create-request
         */
        createLegacyConnectionlessInvitation(request, config) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const agentMessage = core_1.JsonTransformer.fromJSON(config.message, core_1.AgentMessage);
                    return yield request.user.agent.oob.createLegacyConnectionlessInvitation(Object.assign(Object.assign({}, config), { message: agentMessage }));
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Receive an out of band invitation. Supports urls as well as JSON messages. Also supports legacy
         * connection invitations
         */
        receiveInvitation(request, body) {
            return __awaiter(this, void 0, void 0, function* () {
                const { invitation } = body, config = __rest(body, ["invitation"]);
                try {
                    let invitationMessage;
                    if (typeof invitation === 'string') {
                        invitationMessage = yield request.user.agent.oob.parseInvitation(invitation);
                    }
                    else if ((0, messageType_1.supportsIncomingMessageType)((0, messageType_1.parseMessageType)(invitation['@type']), core_1.ConnectionInvitationMessage.type)) {
                        invitationMessage = core_1.JsonTransformer.fromJSON(invitation, core_1.ConnectionInvitationMessage);
                    }
                    else if ((0, messageType_1.supportsIncomingMessageType)((0, messageType_1.parseMessageType)(invitation['@type']), core_1.OutOfBandInvitation.type)) {
                        invitationMessage = core_1.JsonTransformer.fromJSON(invitation, core_1.OutOfBandInvitation);
                    }
                    else {
                        return (0, response_1.apiErrorResponse)(`Invalid invitation message type ${invitation['@type']}`);
                    }
                    const { outOfBandRecord, connectionRecord } = yield request.user.agent.oob.receiveInvitation(invitationMessage, config);
                    return {
                        outOfBandRecord: (0, OutOfBandControllerTypes_1.outOfBandRecordToApiModel)(outOfBandRecord),
                        connectionRecord: connectionRecord ? (0, ConnectionsControllerTypes_1.connectionRecordToApiModel)(connectionRecord) : undefined,
                    };
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Accept a connection invitation as invitee (by sending a connection request message) for the connection with the specified connection id.
         * This is not needed when auto accepting of connections is enabled.
         */
        acceptInvitation(request, outOfBandId, acceptInvitationConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const { outOfBandRecord, connectionRecord } = yield request.user.agent.oob.acceptInvitation(outOfBandId, acceptInvitationConfig);
                    return {
                        outOfBandRecord: (0, OutOfBandControllerTypes_1.outOfBandRecordToApiModel)(outOfBandRecord),
                        connectionRecord: connectionRecord ? (0, ConnectionsControllerTypes_1.connectionRecordToApiModel)(connectionRecord) : undefined,
                    };
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Deletes an out of band record from the repository.
         */
        deleteOutOfBandRecord(request, outOfBandId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    this.setStatus(204);
                    yield request.user.agent.oob.deleteById(outOfBandId);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`Out of band record with id ${outOfBandId} not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _instanceExtraInitializers);
        }
    };
    __setFunctionName(_classThis, "OutOfBandController");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _findOutOfBandRecordsByQuery_decorators = [(0, tsoa_1.Example)([OutOfBandControllerExamples_1.outOfBandRecordExample]), (0, tsoa_1.Get)()];
        _getOutOfBandRecordById_decorators = [(0, tsoa_1.Example)(OutOfBandControllerExamples_1.outOfBandRecordExample), (0, tsoa_1.Get)('/:outOfBandId')];
        _createInvitation_decorators = [(0, tsoa_1.Example)(OutOfBandControllerExamples_1.outOfBandCreateInvitationResponseExample), (0, tsoa_1.Post)('/create-invitation')];
        _createLegacyInvitation_decorators = [(0, tsoa_1.Example)({
                invitation: OutOfBandControllerExamples_1.legacyInvitationExample,
                outOfBandRecord: OutOfBandControllerExamples_1.outOfBandRecordExample,
            }), (0, tsoa_1.Post)('/create-legacy-invitation')];
        _createLegacyConnectionlessInvitation_decorators = [(0, tsoa_1.Example)({
                message: {
                    '@id': 'eac4ff4e-b4fb-4c1d-aef3-b29c89d1cc00',
                    '@type': 'https://didcomm.org/issue-credential/1.0/offer-credential',
                },
                invitationUrl: 'http://example.com/invitation_url',
            }), (0, tsoa_1.Post)('/create-legacy-connectionless-invitation')];
        _receiveInvitation_decorators = [(0, tsoa_1.Example)({
                outOfBandRecord: OutOfBandControllerExamples_1.outOfBandRecordExample,
                connectionRecord: ConnectionsControllerExamples_1.connectionRecordExample,
            }), (0, tsoa_1.Post)('/receive-invitation')];
        _acceptInvitation_decorators = [(0, tsoa_1.Example)({
                outOfBandRecord: OutOfBandControllerExamples_1.outOfBandRecordExample,
                connectionRecord: ConnectionsControllerExamples_1.connectionRecordExample,
            }), (0, tsoa_1.Post)('/:outOfBandId/accept-invitation')];
        _deleteOutOfBandRecord_decorators = [(0, tsoa_1.Delete)('/:outOfBandId')];
        __esDecorate(_classThis, null, _findOutOfBandRecordsByQuery_decorators, { kind: "method", name: "findOutOfBandRecordsByQuery", static: false, private: false, access: { has: obj => "findOutOfBandRecordsByQuery" in obj, get: obj => obj.findOutOfBandRecordsByQuery }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getOutOfBandRecordById_decorators, { kind: "method", name: "getOutOfBandRecordById", static: false, private: false, access: { has: obj => "getOutOfBandRecordById" in obj, get: obj => obj.getOutOfBandRecordById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createInvitation_decorators, { kind: "method", name: "createInvitation", static: false, private: false, access: { has: obj => "createInvitation" in obj, get: obj => obj.createInvitation }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createLegacyInvitation_decorators, { kind: "method", name: "createLegacyInvitation", static: false, private: false, access: { has: obj => "createLegacyInvitation" in obj, get: obj => obj.createLegacyInvitation }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createLegacyConnectionlessInvitation_decorators, { kind: "method", name: "createLegacyConnectionlessInvitation", static: false, private: false, access: { has: obj => "createLegacyConnectionlessInvitation" in obj, get: obj => obj.createLegacyConnectionlessInvitation }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _receiveInvitation_decorators, { kind: "method", name: "receiveInvitation", static: false, private: false, access: { has: obj => "receiveInvitation" in obj, get: obj => obj.receiveInvitation }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _acceptInvitation_decorators, { kind: "method", name: "acceptInvitation", static: false, private: false, access: { has: obj => "acceptInvitation" in obj, get: obj => obj.acceptInvitation }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteOutOfBandRecord_decorators, { kind: "method", name: "deleteOutOfBandRecord", static: false, private: false, access: { has: obj => "deleteOutOfBandRecord" in obj, get: obj => obj.deleteOutOfBandRecord }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OutOfBandController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OutOfBandController = _classThis;
})();
exports.OutOfBandController = OutOfBandController;
