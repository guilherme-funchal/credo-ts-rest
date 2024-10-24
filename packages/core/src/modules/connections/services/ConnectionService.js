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
exports.ConnectionService = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const Events_1 = require("../../../agent/Events");
const crypto_1 = require("../../../crypto");
const SignatureDecoratorUtils_1 = require("../../../decorators/signature/SignatureDecoratorUtils");
const error_1 = require("../../../error");
const plugins_1 = require("../../../plugins");
const JsonTransformer_1 = require("../../../utils/JsonTransformer");
const did_1 = require("../../../utils/did");
const dids_1 = require("../../dids");
const DidDocumentRole_1 = require("../../dids/domain/DidDocumentRole");
const helpers_1 = require("../../dids/helpers");
const peerDidNumAlgo1_1 = require("../../dids/methods/peer/peerDidNumAlgo1");
const repository_1 = require("../../dids/repository");
const didRecordMetadataTypes_1 = require("../../dids/repository/didRecordMetadataTypes");
const OutOfBandService_1 = require("../../oob/OutOfBandService");
const OutOfBandRole_1 = require("../../oob/domain/OutOfBandRole");
const OutOfBandState_1 = require("../../oob/domain/OutOfBandState");
const messages_1 = require("../../oob/messages");
const repository_2 = require("../../oob/repository");
const outOfBandRecordMetadataTypes_1 = require("../../oob/repository/outOfBandRecordMetadataTypes");
const ConnectionEvents_1 = require("../ConnectionEvents");
const errors_1 = require("../errors");
const messages_2 = require("../messages");
const models_1 = require("../models");
const ConnectionRecord_1 = require("../repository/ConnectionRecord");
const helpers_2 = require("./helpers");
let ConnectionService = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ConnectionService = _classThis = class {
        constructor(logger, connectionRepository, didRepository, eventEmitter) {
            this.connectionRepository = connectionRepository;
            this.didRepository = didRepository;
            this.eventEmitter = eventEmitter;
            this.logger = logger;
        }
        /**
         * Create a connection request message for a given out-of-band.
         *
         * @param outOfBandRecord out-of-band record for which to create a connection request
         * @param config config for creation of connection request
         * @returns outbound message containing connection request
         */
        createRequest(agentContext, outOfBandRecord, config) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Create message ${messages_2.ConnectionRequestMessage.type.messageTypeUri} start`, outOfBandRecord);
                outOfBandRecord.assertRole(OutOfBandRole_1.OutOfBandRole.Receiver);
                outOfBandRecord.assertState(OutOfBandState_1.OutOfBandState.PrepareResponse);
                // TODO check there is no connection record for particular oob record
                const { outOfBandInvitation } = outOfBandRecord;
                const { mediatorId } = config.routing;
                const didDoc = this.createDidDoc(config.routing);
                // TODO: We should store only one did that we'll use to send the request message with success.
                // We take just the first one for now.
                const [invitationDid] = outOfBandInvitation.invitationDids;
                const { did: peerDid } = yield this.createDid(agentContext, {
                    role: DidDocumentRole_1.DidDocumentRole.Created,
                    didDoc,
                });
                const { label, imageUrl } = config;
                const connectionRequest = new messages_2.ConnectionRequestMessage({
                    label: label !== null && label !== void 0 ? label : agentContext.config.label,
                    did: didDoc.id,
                    didDoc,
                    imageUrl: imageUrl !== null && imageUrl !== void 0 ? imageUrl : agentContext.config.connectionImageUrl,
                });
                connectionRequest.setThread({
                    threadId: connectionRequest.threadId,
                    parentThreadId: outOfBandRecord.outOfBandInvitation.id,
                });
                const connectionRecord = yield this.createConnection(agentContext, {
                    protocol: models_1.HandshakeProtocol.Connections,
                    role: models_1.DidExchangeRole.Requester,
                    state: models_1.DidExchangeState.InvitationReceived,
                    theirLabel: outOfBandInvitation.label,
                    alias: config === null || config === void 0 ? void 0 : config.alias,
                    did: peerDid,
                    mediatorId,
                    autoAcceptConnection: config === null || config === void 0 ? void 0 : config.autoAcceptConnection,
                    outOfBandId: outOfBandRecord.id,
                    invitationDid,
                    imageUrl: outOfBandInvitation.imageUrl,
                    threadId: connectionRequest.threadId,
                });
                yield this.updateState(agentContext, connectionRecord, models_1.DidExchangeState.RequestSent);
                return {
                    connectionRecord,
                    message: connectionRequest,
                };
            });
        }
        processRequest(messageContext, outOfBandRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Process message ${messages_2.ConnectionRequestMessage.type.messageTypeUri} start`, {
                    message: messageContext.message,
                });
                outOfBandRecord.assertRole(OutOfBandRole_1.OutOfBandRole.Sender);
                outOfBandRecord.assertState(OutOfBandState_1.OutOfBandState.AwaitResponse);
                // TODO check there is no connection record for particular oob record
                const { message } = messageContext;
                if (!message.connection.didDoc) {
                    throw new errors_1.ConnectionProblemReportError('Public DIDs are not supported yet', {
                        problemCode: errors_1.ConnectionProblemReportReason.RequestNotAccepted,
                    });
                }
                const { did: peerDid } = yield this.createDid(messageContext.agentContext, {
                    role: DidDocumentRole_1.DidDocumentRole.Received,
                    didDoc: message.connection.didDoc,
                });
                const connectionRecord = yield this.createConnection(messageContext.agentContext, {
                    protocol: models_1.HandshakeProtocol.Connections,
                    role: models_1.DidExchangeRole.Responder,
                    state: models_1.DidExchangeState.RequestReceived,
                    alias: outOfBandRecord.alias,
                    theirLabel: message.label,
                    imageUrl: message.imageUrl,
                    outOfBandId: outOfBandRecord.id,
                    theirDid: peerDid,
                    threadId: message.threadId,
                    mediatorId: outOfBandRecord.mediatorId,
                    autoAcceptConnection: outOfBandRecord.autoAcceptConnection,
                });
                yield this.connectionRepository.update(messageContext.agentContext, connectionRecord);
                this.emitStateChangedEvent(messageContext.agentContext, connectionRecord, null);
                this.logger.debug(`Process message ${messages_2.ConnectionRequestMessage.type.messageTypeUri} end`, connectionRecord);
                return connectionRecord;
            });
        }
        /**
         * Create a connection response message for the connection with the specified connection id.
         *
         * @param connectionRecord the connection for which to create a connection response
         * @returns outbound message containing connection response
         */
        createResponse(agentContext, connectionRecord, outOfBandRecord, routing) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Create message ${messages_2.ConnectionResponseMessage.type.messageTypeUri} start`, connectionRecord);
                connectionRecord.assertState(models_1.DidExchangeState.RequestReceived);
                connectionRecord.assertRole(models_1.DidExchangeRole.Responder);
                const didDoc = routing
                    ? this.createDidDoc(routing)
                    : this.createDidDocFromOutOfBandDidCommServices(outOfBandRecord.outOfBandInvitation.getInlineServices());
                const { did: peerDid } = yield this.createDid(agentContext, {
                    role: DidDocumentRole_1.DidDocumentRole.Created,
                    didDoc,
                });
                const connection = new models_1.Connection({
                    did: didDoc.id,
                    didDoc,
                });
                const connectionJson = JsonTransformer_1.JsonTransformer.toJSON(connection);
                if (!connectionRecord.threadId) {
                    throw new error_1.AriesFrameworkError(`Connection record with id ${connectionRecord.id} does not have a thread id`);
                }
                const signingKey = crypto_1.Key.fromFingerprint(outOfBandRecord.getTags().recipientKeyFingerprints[0]).publicKeyBase58;
                const connectionResponse = new messages_2.ConnectionResponseMessage({
                    threadId: connectionRecord.threadId,
                    connectionSig: yield (0, SignatureDecoratorUtils_1.signData)(connectionJson, agentContext.wallet, signingKey),
                });
                connectionRecord.did = peerDid;
                yield this.updateState(agentContext, connectionRecord, models_1.DidExchangeState.ResponseSent);
                this.logger.debug(`Create message ${messages_2.ConnectionResponseMessage.type.messageTypeUri} end`, {
                    connectionRecord,
                    message: connectionResponse,
                });
                return {
                    connectionRecord,
                    message: connectionResponse,
                };
            });
        }
        /**
         * Process a received connection response message. This will not accept the connection request
         * or send a connection acknowledgement message. It will only update the existing connection record
         * with all the new information from the connection response message. Use {@link ConnectionService.createTrustPing}
         * after calling this function to create a trust ping message.
         *
         * @param messageContext the message context containing a connection response message
         * @returns updated connection record
         */
        processResponse(messageContext, outOfBandRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Process message ${messages_2.ConnectionResponseMessage.type.messageTypeUri} start`, {
                    message: messageContext.message,
                });
                const { connection: connectionRecord, message, recipientKey, senderKey } = messageContext;
                if (!recipientKey || !senderKey) {
                    throw new error_1.AriesFrameworkError('Unable to process connection request without senderKey or recipientKey');
                }
                if (!connectionRecord) {
                    throw new error_1.AriesFrameworkError('No connection record in message context.');
                }
                connectionRecord.assertState(models_1.DidExchangeState.RequestSent);
                connectionRecord.assertRole(models_1.DidExchangeRole.Requester);
                let connectionJson = null;
                try {
                    connectionJson = yield (0, SignatureDecoratorUtils_1.unpackAndVerifySignatureDecorator)(message.connectionSig, messageContext.agentContext.wallet);
                }
                catch (error) {
                    if (error instanceof error_1.AriesFrameworkError) {
                        throw new errors_1.ConnectionProblemReportError(error.message, {
                            problemCode: errors_1.ConnectionProblemReportReason.ResponseProcessingError,
                        });
                    }
                    throw error;
                }
                const connection = JsonTransformer_1.JsonTransformer.fromJSON(connectionJson, models_1.Connection);
                // Per the Connection RFC we must check if the key used to sign the connection~sig is the same key
                // as the recipient key(s) in the connection invitation message
                const signerVerkey = message.connectionSig.signer;
                const invitationKey = crypto_1.Key.fromFingerprint(outOfBandRecord.getTags().recipientKeyFingerprints[0]).publicKeyBase58;
                if (signerVerkey !== invitationKey) {
                    throw new errors_1.ConnectionProblemReportError(`Connection object in connection response message is not signed with same key as recipient key in invitation expected='${invitationKey}' received='${signerVerkey}'`, { problemCode: errors_1.ConnectionProblemReportReason.ResponseNotAccepted });
                }
                if (!connection.didDoc) {
                    throw new error_1.AriesFrameworkError('DID Document is missing.');
                }
                const { did: peerDid } = yield this.createDid(messageContext.agentContext, {
                    role: DidDocumentRole_1.DidDocumentRole.Received,
                    didDoc: connection.didDoc,
                });
                connectionRecord.theirDid = peerDid;
                connectionRecord.threadId = message.threadId;
                yield this.updateState(messageContext.agentContext, connectionRecord, models_1.DidExchangeState.ResponseReceived);
                return connectionRecord;
            });
        }
        /**
         * Create a trust ping message for the connection with the specified connection id.
         *
         * By default a trust ping message should elicit a response. If this is not desired the
         * `config.responseRequested` property can be set to `false`.
         *
         * @param connectionRecord the connection for which to create a trust ping message
         * @param config the config for the trust ping message
         * @returns outbound message containing trust ping message
         */
        createTrustPing(agentContext_1, connectionRecord_1) {
            return __awaiter(this, arguments, void 0, function* (agentContext, connectionRecord, config = {}) {
                connectionRecord.assertState([models_1.DidExchangeState.ResponseReceived, models_1.DidExchangeState.Completed]);
                // TODO:
                //  - create ack message
                //  - maybe this shouldn't be in the connection service?
                const trustPing = new messages_2.TrustPingMessage(config);
                // Only update connection record and emit an event if the state is not already 'Complete'
                if (connectionRecord.state !== models_1.DidExchangeState.Completed) {
                    yield this.updateState(agentContext, connectionRecord, models_1.DidExchangeState.Completed);
                }
                return {
                    connectionRecord,
                    message: trustPing,
                };
            });
        }
        /**
         * Process a received ack message. This will update the state of the connection
         * to Completed if this is not already the case.
         *
         * @param messageContext the message context containing an ack message
         * @returns updated connection record
         */
        processAck(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const { connection, recipientKey } = messageContext;
                if (!connection) {
                    throw new error_1.AriesFrameworkError(`Unable to process connection ack: connection for recipient key ${recipientKey === null || recipientKey === void 0 ? void 0 : recipientKey.fingerprint} not found`);
                }
                // TODO: This is better addressed in a middleware of some kind because
                // any message can transition the state to complete, not just an ack or trust ping
                if (connection.state === models_1.DidExchangeState.ResponseSent && connection.role === models_1.DidExchangeRole.Responder) {
                    yield this.updateState(messageContext.agentContext, connection, models_1.DidExchangeState.Completed);
                }
                return connection;
            });
        }
        /**
         * Process a received {@link ProblemReportMessage}.
         *
         * @param messageContext The message context containing a connection problem report message
         * @returns connection record associated with the connection problem report message
         *
         */
        processProblemReport(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { message: connectionProblemReportMessage, recipientKey, senderKey } = messageContext;
                this.logger.debug(`Processing connection problem report for verkey ${recipientKey === null || recipientKey === void 0 ? void 0 : recipientKey.fingerprint}`);
                if (!recipientKey) {
                    throw new error_1.AriesFrameworkError('Unable to process connection problem report without recipientKey');
                }
                const ourDidRecord = yield this.didRepository.findCreatedDidByRecipientKey(messageContext.agentContext, recipientKey);
                if (!ourDidRecord) {
                    throw new error_1.AriesFrameworkError(`Unable to process connection problem report: created did record for recipient key ${recipientKey.fingerprint} not found`);
                }
                const connectionRecord = yield this.findByOurDid(messageContext.agentContext, ourDidRecord.did);
                if (!connectionRecord) {
                    throw new error_1.AriesFrameworkError(`Unable to process connection problem report: connection for recipient key ${recipientKey.fingerprint} not found`);
                }
                const theirDidRecord = connectionRecord.theirDid &&
                    (yield this.didRepository.findReceivedDid(messageContext.agentContext, connectionRecord.theirDid));
                if (!theirDidRecord) {
                    throw new error_1.AriesFrameworkError(`Received did record for did ${connectionRecord.theirDid} not found.`);
                }
                if (senderKey) {
                    if (!((_a = theirDidRecord === null || theirDidRecord === void 0 ? void 0 : theirDidRecord.getTags().recipientKeyFingerprints) === null || _a === void 0 ? void 0 : _a.includes(senderKey.fingerprint))) {
                        throw new error_1.AriesFrameworkError("Sender key doesn't match key of connection record");
                    }
                }
                connectionRecord.errorMessage = `${connectionProblemReportMessage.description.code} : ${connectionProblemReportMessage.description.en}`;
                yield this.update(messageContext.agentContext, connectionRecord);
                // Marking connection as abandoned in case of problem report from issuer agent
                // TODO: Can be conditionally abandoned - Like if another user is scanning already used connection invite where issuer will send invite-already-used problem code.
                yield this.updateState(messageContext.agentContext, connectionRecord, models_1.DidExchangeState.Abandoned);
                return connectionRecord;
            });
        }
        /**
         * Assert that an inbound message either has a connection associated with it,
         * or has everything correctly set up for connection-less exchange (optionally with out of band)
         *
         * @param messageContext - the inbound message context
         */
        assertConnectionOrOutOfBandExchange(messageContext_1) {
            return __awaiter(this, arguments, void 0, function* (messageContext, { lastSentMessage, lastReceivedMessage, } = {}) {
                var _a, _b, _c, _d, _e;
                const { connection, message } = messageContext;
                // Check if we have a ready connection. Verification is already done somewhere else. Return
                if (connection) {
                    connection.assertReady();
                    this.logger.debug(`Processing message with id ${message.id} and connection id ${connection.id}`, {
                        type: message.type,
                    });
                }
                else {
                    this.logger.debug(`Processing connection-less message with id ${message.id}`, {
                        type: message.type,
                    });
                    const recipientKey = messageContext.recipientKey && messageContext.recipientKey.publicKeyBase58;
                    const senderKey = messageContext.senderKey && messageContext.senderKey.publicKeyBase58;
                    // set theirService to the value of lastReceivedMessage.service
                    let theirService = (_c = (_b = (_a = messageContext.message) === null || _a === void 0 ? void 0 : _a.service) === null || _b === void 0 ? void 0 : _b.resolvedDidCommService) !== null && _c !== void 0 ? _c : (_d = lastReceivedMessage === null || lastReceivedMessage === void 0 ? void 0 : lastReceivedMessage.service) === null || _d === void 0 ? void 0 : _d.resolvedDidCommService;
                    let ourService = (_e = lastSentMessage === null || lastSentMessage === void 0 ? void 0 : lastSentMessage.service) === null || _e === void 0 ? void 0 : _e.resolvedDidCommService;
                    // 1. check if there's an oob record associated.
                    const outOfBandRepository = messageContext.agentContext.dependencyManager.resolve(repository_2.OutOfBandRepository);
                    const outOfBandService = messageContext.agentContext.dependencyManager.resolve(OutOfBandService_1.OutOfBandService);
                    const outOfBandRecord = yield outOfBandRepository.findSingleByQuery(messageContext.agentContext, {
                        invitationRequestsThreadIds: [message.threadId],
                    });
                    // If we have an out of band record, we can extract the service for our/the other party from the oob record
                    if ((outOfBandRecord === null || outOfBandRecord === void 0 ? void 0 : outOfBandRecord.role) === OutOfBandRole_1.OutOfBandRole.Sender) {
                        ourService = yield outOfBandService.getResolvedServiceForOutOfBandServices(messageContext.agentContext, outOfBandRecord.outOfBandInvitation.getServices());
                    }
                    else if ((outOfBandRecord === null || outOfBandRecord === void 0 ? void 0 : outOfBandRecord.role) === OutOfBandRole_1.OutOfBandRole.Receiver) {
                        theirService = yield outOfBandService.getResolvedServiceForOutOfBandServices(messageContext.agentContext, outOfBandRecord.outOfBandInvitation.getServices());
                    }
                    // theirService can be null when we receive an oob invitation and process the message.
                    // In this case there MUST be an oob record, otherwise there is no way for us to reply
                    // to the message
                    if (!theirService && !outOfBandRecord) {
                        throw new error_1.AriesFrameworkError('No service for incoming connection-less message and no associated out of band record found.');
                    }
                    // ourService can be null when we receive an oob invitation or legacy connectionless message and process the message.
                    // In this case lastSentMessage and lastReceivedMessage MUST be null, because there shouldn't be any previous exchange
                    if (!ourService && (lastReceivedMessage || lastSentMessage)) {
                        throw new error_1.AriesFrameworkError('No keys on our side to use for encrypting messages, and previous messages found (in which case our keys MUST also be present).');
                    }
                    // If the message is unpacked or AuthCrypt, there cannot be any previous exchange (this must be the first message).
                    // All exchange after the first unpacked oob exchange MUST be encrypted.
                    if ((!senderKey || !recipientKey) && (lastSentMessage || lastReceivedMessage)) {
                        throw new error_1.AriesFrameworkError('Incoming message must have recipientKey and senderKey (so cannot be AuthCrypt or unpacked) if there are lastSentMessage or lastReceivedMessage.');
                    }
                    // Check if recipientKey is in ourService
                    if (recipientKey && ourService) {
                        const recipientKeyFound = ourService.recipientKeys.some((key) => key.publicKeyBase58 === recipientKey);
                        if (!recipientKeyFound) {
                            throw new error_1.AriesFrameworkError(`Recipient key ${recipientKey} not found in our service`);
                        }
                    }
                    // Check if senderKey is in theirService
                    if (senderKey && theirService) {
                        const senderKeyFound = theirService.recipientKeys.some((key) => key.publicKeyBase58 === senderKey);
                        if (!senderKeyFound) {
                            throw new error_1.AriesFrameworkError(`Sender key ${senderKey} not found in their service.`);
                        }
                    }
                }
            });
        }
        /**
         * If knownConnectionId is passed, it will compare the incoming connection id with the knownConnectionId, and skip the other validation.
         *
         * If no known connection id is passed, it asserts that the incoming message is in response to an attached request message to an out of band invitation.
         * If is the case, and the state of the out of band record is still await response, the state will be updated to done
         *
         */
        matchIncomingMessageToRequestMessageInOutOfBandExchange(messageContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (messageContext, { expectedConnectionId }) {
                var _b, _c, _d, _e;
                if (expectedConnectionId && ((_b = messageContext.connection) === null || _b === void 0 ? void 0 : _b.id) === expectedConnectionId) {
                    throw new error_1.AriesFrameworkError(`Expecting incoming message to have connection ${expectedConnectionId}, but incoming connection is ${(_d = (_c = messageContext.connection) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : 'undefined'}`);
                }
                const outOfBandRepository = messageContext.agentContext.dependencyManager.resolve(repository_2.OutOfBandRepository);
                const outOfBandInvitationId = (_e = messageContext.message.thread) === null || _e === void 0 ? void 0 : _e.parentThreadId;
                // Find the out of band record that is associated with this request
                const outOfBandRecord = yield outOfBandRepository.findSingleByQuery(messageContext.agentContext, {
                    invitationId: outOfBandInvitationId,
                    role: OutOfBandRole_1.OutOfBandRole.Sender,
                    invitationRequestsThreadIds: [messageContext.message.threadId],
                });
                // There is no out of band record
                if (!outOfBandRecord) {
                    throw new error_1.AriesFrameworkError(`No out of band record found for credential request message with thread ${messageContext.message.threadId}, out of band invitation id ${outOfBandInvitationId} and role ${OutOfBandRole_1.OutOfBandRole.Sender}`);
                }
                const legacyInvitationMetadata = outOfBandRecord.metadata.get(outOfBandRecordMetadataTypes_1.OutOfBandRecordMetadataKeys.LegacyInvitation);
                // If the original invitation was a legacy connectionless invitation, it's okay if the message does not have a pthid.
                if ((legacyInvitationMetadata === null || legacyInvitationMetadata === void 0 ? void 0 : legacyInvitationMetadata.legacyInvitationType) !== messages_1.InvitationType.Connectionless &&
                    outOfBandRecord.outOfBandInvitation.id !== outOfBandInvitationId) {
                    throw new error_1.AriesFrameworkError('Response messages to out of band invitation requests MUST have a parent thread id that matches the out of band invitation id.');
                }
                // This should not happen, as it is not allowed to create reusable out of band invitations with attached messages
                // But should that implementation change, we at least cover it here.
                if (outOfBandRecord.reusable) {
                    throw new error_1.AriesFrameworkError('Receiving messages in response to reusable out of band invitations is not supported.');
                }
                if (outOfBandRecord.state === OutOfBandState_1.OutOfBandState.Done) {
                    if (!messageContext.connection) {
                        throw new error_1.AriesFrameworkError("Can't find connection associated with incoming message, while out of band state is done. State must be await response if no connection has been created");
                    }
                    if (messageContext.connection.outOfBandId !== outOfBandRecord.id) {
                        throw new error_1.AriesFrameworkError('Connection associated with incoming message is not associated with the out of band invitation containing the attached message.');
                    }
                    // We're good to go. Connection was created and points to the correct out of band record. And the message is in response to an attached request message from the oob invitation.
                }
                else if (outOfBandRecord.state === OutOfBandState_1.OutOfBandState.AwaitResponse) {
                    // We're good to go. Waiting for a response. And the message is in response to an attached request message from the oob invitation.
                    // Now that we have received the first response message to our out of band invitation, we mark the out of band record as done
                    outOfBandRecord.state = OutOfBandState_1.OutOfBandState.Done;
                    yield outOfBandRepository.update(messageContext.agentContext, outOfBandRecord);
                }
                else {
                    throw new error_1.AriesFrameworkError(`Out of band record is in incorrect state ${outOfBandRecord.state}`);
                }
            });
        }
        updateState(agentContext, connectionRecord, newState) {
            return __awaiter(this, void 0, void 0, function* () {
                const previousState = connectionRecord.state;
                connectionRecord.state = newState;
                yield this.connectionRepository.update(agentContext, connectionRecord);
                this.emitStateChangedEvent(agentContext, connectionRecord, previousState);
            });
        }
        emitStateChangedEvent(agentContext, connectionRecord, previousState) {
            this.eventEmitter.emit(agentContext, {
                type: ConnectionEvents_1.ConnectionEventTypes.ConnectionStateChanged,
                payload: {
                    // Connection record in event should be static
                    connectionRecord: connectionRecord.clone(),
                    previousState,
                },
            });
        }
        update(agentContext, connectionRecord) {
            return this.connectionRepository.update(agentContext, connectionRecord);
        }
        /**
         * Retrieve all connections records
         *
         * @returns List containing all connection records
         */
        getAll(agentContext) {
            return this.connectionRepository.getAll(agentContext);
        }
        /**
         * Retrieve a connection record by id
         *
         * @param connectionId The connection record id
         * @throws {RecordNotFoundError} If no record is found
         * @return The connection record
         *
         */
        getById(agentContext, connectionId) {
            return this.connectionRepository.getById(agentContext, connectionId);
        }
        /**
         * Find a connection record by id
         *
         * @param connectionId the connection record id
         * @returns The connection record or null if not found
         */
        findById(agentContext, connectionId) {
            return this.connectionRepository.findById(agentContext, connectionId);
        }
        /**
         * Delete a connection record by id
         *
         * @param connectionId the connection record id
         */
        deleteById(agentContext, connectionId) {
            return __awaiter(this, void 0, void 0, function* () {
                const connectionRecord = yield this.getById(agentContext, connectionId);
                return this.connectionRepository.delete(agentContext, connectionRecord);
            });
        }
        findByDids(agentContext, query) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.connectionRepository.findByDids(agentContext, query);
            });
        }
        /**
         * Retrieve a connection record by thread id
         *
         * @param threadId The thread id
         * @throws {RecordNotFoundError} If no record is found
         * @throws {RecordDuplicateError} If multiple records are found
         * @returns The connection record
         */
        getByThreadId(agentContext, threadId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.connectionRepository.getByThreadId(agentContext, threadId);
            });
        }
        getByRoleAndThreadId(agentContext, role, threadId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.connectionRepository.getByRoleAndThreadId(agentContext, role, threadId);
            });
        }
        findByTheirDid(agentContext, theirDid) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.connectionRepository.findSingleByQuery(agentContext, { theirDid });
            });
        }
        findByOurDid(agentContext, ourDid) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.connectionRepository.findSingleByQuery(agentContext, { did: ourDid });
            });
        }
        findAllByOutOfBandId(agentContext, outOfBandId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.connectionRepository.findByQuery(agentContext, { outOfBandId });
            });
        }
        findAllByConnectionTypes(agentContext, connectionTypes) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.connectionRepository.findByQuery(agentContext, { connectionTypes });
            });
        }
        findByInvitationDid(agentContext, invitationDid) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.connectionRepository.findByQuery(agentContext, { invitationDid });
            });
        }
        findByKeys(agentContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (agentContext, { senderKey, recipientKey }) {
                const theirDidRecord = yield this.didRepository.findReceivedDidByRecipientKey(agentContext, senderKey);
                if (theirDidRecord) {
                    const ourDidRecord = yield this.didRepository.findCreatedDidByRecipientKey(agentContext, recipientKey);
                    if (ourDidRecord) {
                        const connectionRecord = yield this.findByDids(agentContext, {
                            ourDid: ourDidRecord.did,
                            theirDid: theirDidRecord.did,
                        });
                        if (connectionRecord && connectionRecord.isReady)
                            return connectionRecord;
                    }
                }
                this.logger.debug(`No connection record found for encrypted message with recipient key ${recipientKey.fingerprint} and sender key ${senderKey.fingerprint}`);
                return null;
            });
        }
        findAllByQuery(agentContext, query) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.connectionRepository.findByQuery(agentContext, query);
            });
        }
        createConnection(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const connectionRecord = new ConnectionRecord_1.ConnectionRecord(options);
                yield this.connectionRepository.save(agentContext, connectionRecord);
                return connectionRecord;
            });
        }
        addConnectionType(agentContext, connectionRecord, type) {
            return __awaiter(this, void 0, void 0, function* () {
                const connectionTypes = connectionRecord.connectionTypes || [];
                connectionRecord.connectionTypes = [type, ...connectionTypes];
                yield this.update(agentContext, connectionRecord);
            });
        }
        removeConnectionType(agentContext, connectionRecord, type) {
            return __awaiter(this, void 0, void 0, function* () {
                connectionRecord.connectionTypes = connectionRecord.connectionTypes.filter((value) => value !== type);
                yield this.update(agentContext, connectionRecord);
            });
        }
        getConnectionTypes(connectionRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                return connectionRecord.connectionTypes || [];
            });
        }
        createDid(agentContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (agentContext, { role, didDoc }) {
                // Convert the legacy did doc to a new did document
                const didDocument = (0, helpers_2.convertToNewDidDocument)(didDoc);
                const peerDid = (0, peerDidNumAlgo1_1.didDocumentJsonToNumAlgo1Did)(didDocument.toJSON());
                didDocument.id = peerDid;
                const didRecord = new repository_1.DidRecord({
                    did: peerDid,
                    role,
                    didDocument,
                    tags: {
                        // We need to save the recipientKeys, so we can find the associated did
                        // of a key when we receive a message from another connection.
                        recipientKeyFingerprints: didDocument.recipientKeys.map((key) => key.fingerprint),
                    },
                });
                // Store the unqualified did with the legacy did document in the metadata
                // Can be removed at a later stage if we know for sure we don't need it anymore
                didRecord.metadata.set(didRecordMetadataTypes_1.DidRecordMetadataKeys.LegacyDid, {
                    unqualifiedDid: didDoc.id,
                    didDocumentString: JsonTransformer_1.JsonTransformer.serialize(didDoc),
                });
                this.logger.debug('Saving DID record', {
                    id: didRecord.id,
                    did: didRecord.did,
                    role: didRecord.role,
                    tags: didRecord.getTags(),
                    didDocument: 'omitted...',
                });
                yield this.didRepository.save(agentContext, didRecord);
                this.logger.debug('Did record created.', didRecord);
                return { did: peerDid, didDocument };
            });
        }
        createDidDoc(routing) {
            const indyDid = (0, did_1.indyDidFromPublicKeyBase58)(routing.recipientKey.publicKeyBase58);
            const publicKey = new models_1.Ed25119Sig2018({
                id: `${indyDid}#1`,
                controller: indyDid,
                publicKeyBase58: routing.recipientKey.publicKeyBase58,
            });
            const auth = new models_1.ReferencedAuthentication(publicKey, models_1.authenticationTypes.Ed25519VerificationKey2018);
            // IndyAgentService is old service type
            const services = routing.endpoints.map((endpoint, index) => new dids_1.IndyAgentService({
                id: `${indyDid}#IndyAgentService-${index + 1}`,
                serviceEndpoint: endpoint,
                recipientKeys: [routing.recipientKey.publicKeyBase58],
                routingKeys: routing.routingKeys.map((key) => key.publicKeyBase58),
                // Order of endpoint determines priority
                priority: index,
            }));
            return new models_1.DidDoc({
                id: indyDid,
                authentication: [auth],
                service: services,
                publicKey: [publicKey],
            });
        }
        createDidDocFromOutOfBandDidCommServices(services) {
            const [recipientDidKey] = services[0].recipientKeys;
            const recipientKey = dids_1.DidKey.fromDid(recipientDidKey).key;
            const did = (0, did_1.indyDidFromPublicKeyBase58)(recipientKey.publicKeyBase58);
            const publicKey = new models_1.Ed25119Sig2018({
                id: `${did}#1`,
                controller: did,
                publicKeyBase58: recipientKey.publicKeyBase58,
            });
            const auth = new models_1.ReferencedAuthentication(publicKey, models_1.authenticationTypes.Ed25519VerificationKey2018);
            // IndyAgentService is old service type
            const service = services.map((service, index) => {
                var _a;
                return new dids_1.IndyAgentService({
                    id: `${did}#IndyAgentService-${index + 1}`,
                    serviceEndpoint: service.serviceEndpoint,
                    recipientKeys: [recipientKey.publicKeyBase58],
                    routingKeys: (_a = service.routingKeys) === null || _a === void 0 ? void 0 : _a.map(helpers_1.didKeyToVerkey),
                    priority: index,
                });
            });
            return new models_1.DidDoc({
                id: did,
                authentication: [auth],
                service,
                publicKey: [publicKey],
            });
        }
        returnWhenIsConnected(agentContext_1, connectionId_1) {
            return __awaiter(this, arguments, void 0, function* (agentContext, connectionId, timeoutMs = 20000) {
                const isConnected = (connection) => {
                    return connection.id === connectionId && connection.state === models_1.DidExchangeState.Completed;
                };
                const observable = this.eventEmitter.observable(ConnectionEvents_1.ConnectionEventTypes.ConnectionStateChanged);
                const subject = new rxjs_1.ReplaySubject(1);
                observable
                    .pipe((0, Events_1.filterContextCorrelationId)(agentContext.contextCorrelationId), (0, operators_1.map)((e) => e.payload.connectionRecord), (0, operators_1.first)(isConnected), // Do not wait for longer than specified timeout
                (0, operators_1.timeout)(timeoutMs))
                    .subscribe(subject);
                const connection = yield this.getById(agentContext, connectionId);
                if (isConnected(connection)) {
                    subject.next(connection);
                }
                return (0, rxjs_1.firstValueFrom)(subject);
            });
        }
    };
    __setFunctionName(_classThis, "ConnectionService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ConnectionService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ConnectionService = _classThis;
})();
exports.ConnectionService = ConnectionService;
