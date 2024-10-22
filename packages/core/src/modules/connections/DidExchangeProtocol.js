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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DidExchangeProtocol = void 0;
const crypto_1 = require("../../crypto");
const jwa_1 = require("../../crypto/jose/jwa");
const jwk_1 = require("../../crypto/jose/jwk");
const Attachment_1 = require("../../decorators/attachment/Attachment");
const error_1 = require("../../error");
const plugins_1 = require("../../plugins");
const utils_1 = require("../../utils");
const JsonEncoder_1 = require("../../utils/JsonEncoder");
const JsonTransformer_1 = require("../../utils/JsonTransformer");
const base64_1 = require("../../utils/base64");
const dids_1 = require("../dids");
const key_type_1 = require("../dids/domain/key-type");
const parse_1 = require("../dids/domain/parse");
const helpers_1 = require("../dids/helpers");
const repository_1 = require("../dids/repository");
const OutOfBandRole_1 = require("../oob/domain/OutOfBandRole");
const OutOfBandState_1 = require("../oob/domain/OutOfBandState");
const DidExchangeStateMachine_1 = require("./DidExchangeStateMachine");
const errors_1 = require("./errors");
const DidExchangeCompleteMessage_1 = require("./messages/DidExchangeCompleteMessage");
const DidExchangeRequestMessage_1 = require("./messages/DidExchangeRequestMessage");
const DidExchangeResponseMessage_1 = require("./messages/DidExchangeResponseMessage");
const models_1 = require("./models");
let DidExchangeProtocol = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DidExchangeProtocol = _classThis = class {
        constructor(connectionService, didRegistrarService, didRepository, jwsService, logger) {
            this.connectionService = connectionService;
            this.didRegistrarService = didRegistrarService;
            this.didRepository = didRepository;
            this.jwsService = jwsService;
            this.logger = logger;
        }
        createRequest(agentContext, outOfBandRecord, params) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                this.logger.debug(`Create message ${DidExchangeRequestMessage_1.DidExchangeRequestMessage.type.messageTypeUri} start`, {
                    outOfBandRecord,
                    params,
                });
                const { outOfBandInvitation } = outOfBandRecord;
                const { alias, goal, goalCode, routing, autoAcceptConnection } = params;
                // TODO: We should store only one did that we'll use to send the request message with success.
                // We take just the first one for now.
                const [invitationDid] = outOfBandInvitation.invitationDids;
                const connectionRecord = yield this.connectionService.createConnection(agentContext, {
                    protocol: models_1.HandshakeProtocol.DidExchange,
                    role: models_1.DidExchangeRole.Requester,
                    alias,
                    state: models_1.DidExchangeState.InvitationReceived,
                    theirLabel: outOfBandInvitation.label,
                    mediatorId: routing.mediatorId,
                    autoAcceptConnection: outOfBandRecord.autoAcceptConnection,
                    outOfBandId: outOfBandRecord.id,
                    invitationDid,
                    imageUrl: outOfBandInvitation.imageUrl,
                });
                DidExchangeStateMachine_1.DidExchangeStateMachine.assertCreateMessageState(DidExchangeRequestMessage_1.DidExchangeRequestMessage.type, connectionRecord);
                // Create message
                const label = (_a = params.label) !== null && _a !== void 0 ? _a : agentContext.config.label;
                const didDocument = yield this.createPeerDidDoc(agentContext, this.routingToServices(routing));
                const parentThreadId = outOfBandRecord.outOfBandInvitation.id;
                const message = new DidExchangeRequestMessage_1.DidExchangeRequestMessage({ label, parentThreadId, did: didDocument.id, goal, goalCode });
                // Create sign attachment containing didDoc
                if ((0, dids_1.getNumAlgoFromPeerDid)(didDocument.id) === dids_1.PeerDidNumAlgo.GenesisDoc) {
                    const didDocAttach = yield this.createSignedAttachment(agentContext, didDocument, [
                        routing.recipientKey.publicKeyBase58,
                    ]);
                    message.didDoc = didDocAttach;
                }
                connectionRecord.did = didDocument.id;
                connectionRecord.threadId = message.id;
                if (autoAcceptConnection !== undefined || autoAcceptConnection !== null) {
                    connectionRecord.autoAcceptConnection = autoAcceptConnection;
                }
                yield this.updateState(agentContext, DidExchangeRequestMessage_1.DidExchangeRequestMessage.type, connectionRecord);
                this.logger.debug(`Create message ${DidExchangeRequestMessage_1.DidExchangeRequestMessage.type.messageTypeUri} end`, {
                    connectionRecord,
                    message,
                });
                return { message, connectionRecord };
            });
        }
        processRequest(messageContext, outOfBandRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                this.logger.debug(`Process message ${DidExchangeRequestMessage_1.DidExchangeRequestMessage.type.messageTypeUri} start`, {
                    message: messageContext.message,
                });
                outOfBandRecord.assertRole(OutOfBandRole_1.OutOfBandRole.Sender);
                outOfBandRecord.assertState(OutOfBandState_1.OutOfBandState.AwaitResponse);
                // TODO check there is no connection record for particular oob record
                const { message } = messageContext;
                // Check corresponding invitation ID is the request's ~thread.pthid or pthid is a public did
                // TODO Maybe we can do it in handler, but that actually does not make sense because we try to find oob by parent thread ID there.
                const parentThreadId = (_a = message.thread) === null || _a === void 0 ? void 0 : _a.parentThreadId;
                if (!parentThreadId ||
                    (!(0, parse_1.tryParseDid)(parentThreadId) && parentThreadId !== outOfBandRecord.getTags().invitationId)) {
                    throw new errors_1.DidExchangeProblemReportError('Missing reference to invitation.', {
                        problemCode: errors_1.DidExchangeProblemReportReason.RequestNotAccepted,
                    });
                }
                // If the responder wishes to continue the exchange, they will persist the received information in their wallet.
                if (!(0, utils_1.isDid)(message.did, 'peer')) {
                    throw new errors_1.DidExchangeProblemReportError(`Message contains unsupported did ${message.did}. Supported dids are [did:peer]`, {
                        problemCode: errors_1.DidExchangeProblemReportReason.RequestNotAccepted,
                    });
                }
                const numAlgo = (0, dids_1.getNumAlgoFromPeerDid)(message.did);
                if (numAlgo !== dids_1.PeerDidNumAlgo.GenesisDoc) {
                    throw new errors_1.DidExchangeProblemReportError(`Unsupported numalgo ${numAlgo}. Supported numalgos are [${dids_1.PeerDidNumAlgo.GenesisDoc}]`, {
                        problemCode: errors_1.DidExchangeProblemReportReason.RequestNotAccepted,
                    });
                }
                // TODO: Move this into the didcomm module, and add a method called store received did document.
                // This can be called from both the did exchange and the connection protocol.
                const didDocument = yield this.extractDidDocument(messageContext.agentContext, message);
                const didRecord = new repository_1.DidRecord({
                    did: message.did,
                    role: dids_1.DidDocumentRole.Received,
                    // It is important to take the did document from the PeerDid class
                    // as it will have the id property
                    didDocument,
                    tags: {
                        // We need to save the recipientKeys, so we can find the associated did
                        // of a key when we receive a message from another connection.
                        recipientKeyFingerprints: didDocument.recipientKeys.map((key) => key.fingerprint),
                    },
                });
                this.logger.debug('Saving DID record', {
                    id: didRecord.id,
                    did: didRecord.did,
                    role: didRecord.role,
                    tags: didRecord.getTags(),
                    didDocument: 'omitted...',
                });
                yield this.didRepository.save(messageContext.agentContext, didRecord);
                const connectionRecord = yield this.connectionService.createConnection(messageContext.agentContext, {
                    protocol: models_1.HandshakeProtocol.DidExchange,
                    role: models_1.DidExchangeRole.Responder,
                    state: models_1.DidExchangeState.RequestReceived,
                    alias: outOfBandRecord.alias,
                    theirDid: message.did,
                    theirLabel: message.label,
                    threadId: message.threadId,
                    mediatorId: outOfBandRecord.mediatorId,
                    autoAcceptConnection: outOfBandRecord.autoAcceptConnection,
                    outOfBandId: outOfBandRecord.id,
                });
                yield this.updateState(messageContext.agentContext, DidExchangeRequestMessage_1.DidExchangeRequestMessage.type, connectionRecord);
                this.logger.debug(`Process message ${DidExchangeRequestMessage_1.DidExchangeRequestMessage.type.messageTypeUri} end`, connectionRecord);
                return connectionRecord;
            });
        }
        createResponse(agentContext, connectionRecord, outOfBandRecord, routing) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Create message ${DidExchangeResponseMessage_1.DidExchangeResponseMessage.type.messageTypeUri} start`, connectionRecord);
                DidExchangeStateMachine_1.DidExchangeStateMachine.assertCreateMessageState(DidExchangeResponseMessage_1.DidExchangeResponseMessage.type, connectionRecord);
                const { threadId } = connectionRecord;
                if (!threadId) {
                    throw new error_1.AriesFrameworkError('Missing threadId on connection record.');
                }
                let services = [];
                if (routing) {
                    services = this.routingToServices(routing);
                }
                else if (outOfBandRecord) {
                    const inlineServices = outOfBandRecord.outOfBandInvitation.getInlineServices();
                    services = inlineServices.map((service) => {
                        var _a, _b;
                        return ({
                            id: service.id,
                            serviceEndpoint: service.serviceEndpoint,
                            recipientKeys: service.recipientKeys.map(helpers_1.didKeyToInstanceOfKey),
                            routingKeys: (_b = (_a = service.routingKeys) === null || _a === void 0 ? void 0 : _a.map(helpers_1.didKeyToInstanceOfKey)) !== null && _b !== void 0 ? _b : [],
                        });
                    });
                }
                const didDocument = yield this.createPeerDidDoc(agentContext, services);
                const message = new DidExchangeResponseMessage_1.DidExchangeResponseMessage({ did: didDocument.id, threadId });
                if ((0, dids_1.getNumAlgoFromPeerDid)(didDocument.id) === dids_1.PeerDidNumAlgo.GenesisDoc) {
                    const didDocAttach = yield this.createSignedAttachment(agentContext, didDocument, Array.from(new Set(services
                        .map((s) => s.recipientKeys)
                        .reduce((acc, curr) => acc.concat(curr), [])
                        .map((key) => key.publicKeyBase58))));
                    message.didDoc = didDocAttach;
                }
                connectionRecord.did = didDocument.id;
                yield this.updateState(agentContext, DidExchangeResponseMessage_1.DidExchangeResponseMessage.type, connectionRecord);
                this.logger.debug(`Create message ${DidExchangeResponseMessage_1.DidExchangeResponseMessage.type.messageTypeUri} end`, {
                    connectionRecord,
                    message,
                });
                return message;
            });
        }
        processResponse(messageContext, outOfBandRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                this.logger.debug(`Process message ${DidExchangeResponseMessage_1.DidExchangeResponseMessage.type.messageTypeUri} start`, {
                    message: messageContext.message,
                });
                const { connection: connectionRecord, message } = messageContext;
                if (!connectionRecord) {
                    throw new error_1.AriesFrameworkError('No connection record in message context.');
                }
                DidExchangeStateMachine_1.DidExchangeStateMachine.assertProcessMessageState(DidExchangeResponseMessage_1.DidExchangeResponseMessage.type, connectionRecord);
                if (!((_a = message.thread) === null || _a === void 0 ? void 0 : _a.threadId) || ((_b = message.thread) === null || _b === void 0 ? void 0 : _b.threadId) !== connectionRecord.threadId) {
                    throw new errors_1.DidExchangeProblemReportError('Invalid or missing thread ID.', {
                        problemCode: errors_1.DidExchangeProblemReportReason.ResponseNotAccepted,
                    });
                }
                if (!(0, utils_1.isDid)(message.did, 'peer')) {
                    throw new errors_1.DidExchangeProblemReportError(`Message contains unsupported did ${message.did}. Supported dids are [did:peer]`, {
                        problemCode: errors_1.DidExchangeProblemReportReason.ResponseNotAccepted,
                    });
                }
                const numAlgo = (0, dids_1.getNumAlgoFromPeerDid)(message.did);
                if (numAlgo !== dids_1.PeerDidNumAlgo.GenesisDoc) {
                    throw new errors_1.DidExchangeProblemReportError(`Unsupported numalgo ${numAlgo}. Supported numalgos are [${dids_1.PeerDidNumAlgo.GenesisDoc}]`, {
                        problemCode: errors_1.DidExchangeProblemReportReason.ResponseNotAccepted,
                    });
                }
                const didDocument = yield this.extractDidDocument(messageContext.agentContext, message, outOfBandRecord
                    .getTags()
                    .recipientKeyFingerprints.map((fingerprint) => crypto_1.Key.fromFingerprint(fingerprint).publicKeyBase58));
                const didRecord = new repository_1.DidRecord({
                    did: message.did,
                    role: dids_1.DidDocumentRole.Received,
                    didDocument,
                    tags: {
                        // We need to save the recipientKeys, so we can find the associated did
                        // of a key when we receive a message from another connection.
                        recipientKeyFingerprints: didDocument.recipientKeys.map((key) => key.fingerprint),
                    },
                });
                this.logger.debug('Saving DID record', {
                    id: didRecord.id,
                    did: didRecord.did,
                    role: didRecord.role,
                    tags: didRecord.getTags(),
                    didDocument: 'omitted...',
                });
                yield this.didRepository.save(messageContext.agentContext, didRecord);
                connectionRecord.theirDid = message.did;
                yield this.updateState(messageContext.agentContext, DidExchangeResponseMessage_1.DidExchangeResponseMessage.type, connectionRecord);
                this.logger.debug(`Process message ${DidExchangeResponseMessage_1.DidExchangeResponseMessage.type.messageTypeUri} end`, connectionRecord);
                return connectionRecord;
            });
        }
        createComplete(agentContext, connectionRecord, outOfBandRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Create message ${DidExchangeCompleteMessage_1.DidExchangeCompleteMessage.type.messageTypeUri} start`, connectionRecord);
                DidExchangeStateMachine_1.DidExchangeStateMachine.assertCreateMessageState(DidExchangeCompleteMessage_1.DidExchangeCompleteMessage.type, connectionRecord);
                const threadId = connectionRecord.threadId;
                const parentThreadId = outOfBandRecord.outOfBandInvitation.id;
                if (!threadId) {
                    throw new error_1.AriesFrameworkError(`Connection record ${connectionRecord.id} does not have 'threadId' attribute.`);
                }
                if (!parentThreadId) {
                    throw new error_1.AriesFrameworkError(`Connection record ${connectionRecord.id} does not have 'parentThreadId' attribute.`);
                }
                const message = new DidExchangeCompleteMessage_1.DidExchangeCompleteMessage({ threadId, parentThreadId });
                yield this.updateState(agentContext, DidExchangeCompleteMessage_1.DidExchangeCompleteMessage.type, connectionRecord);
                this.logger.debug(`Create message ${DidExchangeCompleteMessage_1.DidExchangeCompleteMessage.type.messageTypeUri} end`, {
                    connectionRecord,
                    message,
                });
                return message;
            });
        }
        processComplete(messageContext, outOfBandRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                this.logger.debug(`Process message ${DidExchangeCompleteMessage_1.DidExchangeCompleteMessage.type.messageTypeUri} start`, {
                    message: messageContext.message,
                });
                const { connection: connectionRecord, message } = messageContext;
                if (!connectionRecord) {
                    throw new error_1.AriesFrameworkError('No connection record in message context.');
                }
                DidExchangeStateMachine_1.DidExchangeStateMachine.assertProcessMessageState(DidExchangeCompleteMessage_1.DidExchangeCompleteMessage.type, connectionRecord);
                if (message.threadId !== connectionRecord.threadId) {
                    throw new errors_1.DidExchangeProblemReportError('Invalid or missing thread ID.', {
                        problemCode: errors_1.DidExchangeProblemReportReason.CompleteRejected,
                    });
                }
                const pthid = (_a = message.thread) === null || _a === void 0 ? void 0 : _a.parentThreadId;
                if (!pthid || pthid !== outOfBandRecord.outOfBandInvitation.id) {
                    throw new errors_1.DidExchangeProblemReportError('Invalid or missing parent thread ID referencing to the invitation.', {
                        problemCode: errors_1.DidExchangeProblemReportReason.CompleteRejected,
                    });
                }
                yield this.updateState(messageContext.agentContext, DidExchangeCompleteMessage_1.DidExchangeCompleteMessage.type, connectionRecord);
                this.logger.debug(`Process message ${DidExchangeCompleteMessage_1.DidExchangeCompleteMessage.type.messageTypeUri} end`, { connectionRecord });
                return connectionRecord;
            });
        }
        updateState(agentContext, messageType, connectionRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Updating state`, { connectionRecord });
                const nextState = DidExchangeStateMachine_1.DidExchangeStateMachine.nextState(messageType, connectionRecord);
                return this.connectionService.updateState(agentContext, connectionRecord, nextState);
            });
        }
        createPeerDidDoc(agentContext, services) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                // Create did document without the id property
                const didDocument = (0, dids_1.createPeerDidDocumentFromServices)(services);
                // Register did:peer document. This will generate the id property and save it to a did record
                const result = yield this.didRegistrarService.create(agentContext, {
                    method: 'peer',
                    didDocument,
                    options: {
                        numAlgo: dids_1.PeerDidNumAlgo.GenesisDoc,
                    },
                });
                if (((_a = result.didState) === null || _a === void 0 ? void 0 : _a.state) !== 'finished') {
                    throw new error_1.AriesFrameworkError(`Did document creation failed: ${JSON.stringify(result.didState)}`);
                }
                this.logger.debug(`Did document with did ${result.didState.did} created.`, {
                    did: result.didState.did,
                    didDocument: result.didState.didDocument,
                });
                return result.didState.didDocument;
            });
        }
        createSignedAttachment(agentContext, didDoc, verkeys) {
            return __awaiter(this, void 0, void 0, function* () {
                const didDocAttach = new Attachment_1.Attachment({
                    mimeType: 'application/json',
                    data: new Attachment_1.AttachmentData({
                        base64: JsonEncoder_1.JsonEncoder.toBase64(didDoc),
                    }),
                });
                yield Promise.all(verkeys.map((verkey) => __awaiter(this, void 0, void 0, function* () {
                    const key = crypto_1.Key.fromPublicKeyBase58(verkey, crypto_1.KeyType.Ed25519);
                    const kid = new dids_1.DidKey(key).did;
                    const payload = JsonEncoder_1.JsonEncoder.toBuffer(didDoc);
                    const jws = yield this.jwsService.createJws(agentContext, {
                        payload,
                        key,
                        header: {
                            kid,
                        },
                        protectedHeaderOptions: {
                            alg: jwa_1.JwaSignatureAlgorithm.EdDSA,
                            jwk: (0, jwk_1.getJwkFromKey)(key),
                        },
                    });
                    didDocAttach.addJws(jws);
                })));
                return didDocAttach;
            });
        }
        /**
         * Extracts DID document as is from request or response message attachment and verifies its signature.
         *
         * @param message DID request or DID response message
         * @param invitationKeys array containing keys from connection invitation that could be used for signing of DID document
         * @returns verified DID document content from message attachment
         */
        extractDidDocument(agentContext_1, message_1) {
            return __awaiter(this, arguments, void 0, function* (agentContext, message, invitationKeysBase58 = []) {
                var _a;
                if (!message.didDoc) {
                    const problemCode = message instanceof DidExchangeRequestMessage_1.DidExchangeRequestMessage
                        ? errors_1.DidExchangeProblemReportReason.RequestNotAccepted
                        : errors_1.DidExchangeProblemReportReason.ResponseNotAccepted;
                    throw new errors_1.DidExchangeProblemReportError('DID Document attachment is missing.', { problemCode });
                }
                const didDocumentAttachment = message.didDoc;
                const jws = didDocumentAttachment.data.jws;
                if (!jws) {
                    const problemCode = message instanceof DidExchangeRequestMessage_1.DidExchangeRequestMessage
                        ? errors_1.DidExchangeProblemReportReason.RequestNotAccepted
                        : errors_1.DidExchangeProblemReportReason.ResponseNotAccepted;
                    throw new errors_1.DidExchangeProblemReportError('DID Document signature is missing.', { problemCode });
                }
                if (!didDocumentAttachment.data.base64) {
                    throw new error_1.AriesFrameworkError('DID Document attachment is missing base64 property for signed did document.');
                }
                // JWS payload must be base64url encoded
                const base64UrlPayload = (0, base64_1.base64ToBase64URL)(didDocumentAttachment.data.base64);
                const json = JsonEncoder_1.JsonEncoder.fromBase64(didDocumentAttachment.data.base64);
                const { isValid, signerKeys } = yield this.jwsService.verifyJws(agentContext, {
                    jws: Object.assign(Object.assign({}, jws), { payload: base64UrlPayload }),
                    jwkResolver: ({ jws: { header } }) => {
                        if (typeof header.kid !== 'string' || !(0, utils_1.isDid)(header.kid, 'key')) {
                            throw new error_1.AriesFrameworkError('JWS header kid must be a did:key DID.');
                        }
                        const didKey = dids_1.DidKey.fromDid(header.kid);
                        return (0, jwk_1.getJwkFromKey)(didKey.key);
                    },
                });
                const didDocument = JsonTransformer_1.JsonTransformer.fromJSON(json, dids_1.DidDocument);
                const didDocumentKeysBase58 = (_a = didDocument.authentication) === null || _a === void 0 ? void 0 : _a.map((authentication) => {
                    const verificationMethod = typeof authentication === 'string'
                        ? didDocument.dereferenceVerificationMethod(authentication)
                        : authentication;
                    const key = (0, key_type_1.getKeyFromVerificationMethod)(verificationMethod);
                    return key.publicKeyBase58;
                }).concat(invitationKeysBase58);
                this.logger.trace('JWS verification result', { isValid, signerKeys, didDocumentKeysBase58 });
                if (!isValid || !signerKeys.every((key) => didDocumentKeysBase58 === null || didDocumentKeysBase58 === void 0 ? void 0 : didDocumentKeysBase58.includes(key.publicKeyBase58))) {
                    const problemCode = message instanceof DidExchangeRequestMessage_1.DidExchangeRequestMessage
                        ? errors_1.DidExchangeProblemReportReason.RequestNotAccepted
                        : errors_1.DidExchangeProblemReportReason.ResponseNotAccepted;
                    throw new errors_1.DidExchangeProblemReportError('DID Document signature is invalid.', { problemCode });
                }
                return didDocument;
            });
        }
        routingToServices(routing) {
            return routing.endpoints.map((endpoint, index) => ({
                id: `#inline-${index}`,
                serviceEndpoint: endpoint,
                recipientKeys: [routing.recipientKey],
                routingKeys: routing.routingKeys,
            }));
        }
    };
    __setFunctionName(_classThis, "DidExchangeProtocol");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DidExchangeProtocol = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DidExchangeProtocol = _classThis;
})();
exports.DidExchangeProtocol = DidExchangeProtocol;
