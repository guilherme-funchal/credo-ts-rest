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
exports.OutOfBandApi = void 0;
const rxjs_1 = require("rxjs");
const Events_1 = require("../../agent/Events");
const models_1 = require("../../agent/models");
const crypto_1 = require("../../crypto");
const ServiceDecorator_1 = require("../../decorators/service/ServiceDecorator");
const error_1 = require("../../error");
const plugins_1 = require("../../plugins");
const utils_1 = require("../../utils");
const messageType_1 = require("../../utils/messageType");
const parseInvitation_1 = require("../../utils/parseInvitation");
const connections_1 = require("../connections");
const dids_1 = require("../dids");
const OutOfBandDidCommService_1 = require("./domain/OutOfBandDidCommService");
const OutOfBandEvents_1 = require("./domain/OutOfBandEvents");
const OutOfBandRole_1 = require("./domain/OutOfBandRole");
const OutOfBandState_1 = require("./domain/OutOfBandState");
const handlers_1 = require("./handlers");
const HandshakeReuseAcceptedHandler_1 = require("./handlers/HandshakeReuseAcceptedHandler");
const helpers_1 = require("./helpers");
const messages_1 = require("./messages");
const repository_1 = require("./repository");
const OutOfBandRecord_1 = require("./repository/OutOfBandRecord");
const outOfBandRecordMetadataTypes_1 = require("./repository/outOfBandRecordMetadataTypes");
const didCommProfiles = ['didcomm/aip1', 'didcomm/aip2;env=rfc19'];
let OutOfBandApi = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var OutOfBandApi = _classThis = class {
        constructor(messageHandlerRegistry, didCommDocumentService, outOfBandService, routingService, connectionsApi, messageSender, eventEmitter, logger, agentContext) {
            this.messageHandlerRegistry = messageHandlerRegistry;
            this.didCommDocumentService = didCommDocumentService;
            this.agentContext = agentContext;
            this.logger = logger;
            this.outOfBandService = outOfBandService;
            this.routingService = routingService;
            this.connectionsApi = connectionsApi;
            this.messageSender = messageSender;
            this.eventEmitter = eventEmitter;
            this.registerMessageHandlers(messageHandlerRegistry);
        }
        /**
         * Creates an outbound out-of-band record containing out-of-band invitation message defined in
         * Aries RFC 0434: Out-of-Band Protocol 1.1.
         *
         * It automatically adds all supported handshake protocols by agent to `handshake_protocols`. You
         * can modify this by setting `handshakeProtocols` in `config` parameter. If you want to create
         * invitation without handshake, you can set `handshake` to `false`.
         *
         * If `config` parameter contains `messages` it adds them to `requests~attach` attribute.
         *
         * Agent role: sender (inviter)
         *
         * @param config configuration of how out-of-band invitation should be created
         * @returns out-of-band record
         */
        createInvitation() {
            return __awaiter(this, arguments, void 0, function* (config = {}) {
                var _a, _b, _c, _d, _e, _f;
                const multiUseInvitation = (_a = config.multiUseInvitation) !== null && _a !== void 0 ? _a : false;
                const handshake = (_b = config.handshake) !== null && _b !== void 0 ? _b : true;
                const customHandshakeProtocols = config.handshakeProtocols;
                const autoAcceptConnection = (_c = config.autoAcceptConnection) !== null && _c !== void 0 ? _c : this.connectionsApi.config.autoAcceptConnections;
                // We don't want to treat an empty array as messages being provided
                const messages = config.messages && config.messages.length > 0 ? config.messages : undefined;
                const label = (_d = config.label) !== null && _d !== void 0 ? _d : this.agentContext.config.label;
                const imageUrl = (_e = config.imageUrl) !== null && _e !== void 0 ? _e : this.agentContext.config.connectionImageUrl;
                const appendedAttachments = config.appendedAttachments && config.appendedAttachments.length > 0 ? config.appendedAttachments : undefined;
                if (!handshake && !messages) {
                    throw new error_1.AriesFrameworkError('One or both of handshake_protocols and requests~attach MUST be included in the message.');
                }
                if (!handshake && customHandshakeProtocols) {
                    throw new error_1.AriesFrameworkError(`Attribute 'handshake' can not be 'false' when 'handshakeProtocols' is defined.`);
                }
                // For now we disallow creating multi-use invitation with attachments. This would mean we need multi-use
                // credential and presentation exchanges.
                if (messages && multiUseInvitation) {
                    throw new error_1.AriesFrameworkError("Attribute 'multiUseInvitation' can not be 'true' when 'messages' is defined.");
                }
                let handshakeProtocols;
                if (handshake) {
                    // Find supported handshake protocol preserving the order of handshake protocols defined
                    // by agent
                    if (customHandshakeProtocols) {
                        this.assertHandshakeProtocols(customHandshakeProtocols);
                        handshakeProtocols = customHandshakeProtocols;
                    }
                    else {
                        handshakeProtocols = this.getSupportedHandshakeProtocols();
                    }
                }
                const routing = (_f = config.routing) !== null && _f !== void 0 ? _f : (yield this.routingService.getRouting(this.agentContext, {}));
                const services = routing.endpoints.map((endpoint, index) => {
                    return new OutOfBandDidCommService_1.OutOfBandDidCommService({
                        id: `#inline-${index}`,
                        serviceEndpoint: endpoint,
                        recipientKeys: [routing.recipientKey].map((key) => new dids_1.DidKey(key).did),
                        routingKeys: routing.routingKeys.map((key) => new dids_1.DidKey(key).did),
                    });
                });
                const options = {
                    label,
                    goal: config.goal,
                    goalCode: config.goalCode,
                    imageUrl,
                    accept: didCommProfiles,
                    services,
                    handshakeProtocols,
                    appendedAttachments,
                };
                const outOfBandInvitation = new messages_1.OutOfBandInvitation(options);
                if (messages) {
                    messages.forEach((message) => {
                        if (message.service) {
                            // We can remove `~service` attribute from message. Newer OOB messages have `services` attribute instead.
                            message.service = undefined;
                        }
                        outOfBandInvitation.addRequest(message);
                    });
                }
                const outOfBandRecord = new OutOfBandRecord_1.OutOfBandRecord({
                    mediatorId: routing.mediatorId,
                    role: OutOfBandRole_1.OutOfBandRole.Sender,
                    state: OutOfBandState_1.OutOfBandState.AwaitResponse,
                    alias: config.alias,
                    outOfBandInvitation: outOfBandInvitation,
                    reusable: multiUseInvitation,
                    autoAcceptConnection,
                    tags: {
                        recipientKeyFingerprints: services
                            .reduce((aggr, { recipientKeys }) => [...aggr, ...recipientKeys], [])
                            .map((didKey) => dids_1.DidKey.fromDid(didKey).key.fingerprint),
                    },
                });
                yield this.outOfBandService.save(this.agentContext, outOfBandRecord);
                this.outOfBandService.emitStateChangedEvent(this.agentContext, outOfBandRecord, null);
                return outOfBandRecord;
            });
        }
        /**
         * Creates an outbound out-of-band record in the same way how `createInvitation` method does it,
         * but it also converts out-of-band invitation message to an "legacy" invitation message defined
         * in RFC 0160: Connection Protocol and returns it together with out-of-band record.
         *
         * Agent role: sender (inviter)
         *
         * @param config configuration of how a connection invitation should be created
         * @returns out-of-band record and connection invitation
         */
        createLegacyInvitation() {
            return __awaiter(this, arguments, void 0, function* (config = {}) {
                const outOfBandRecord = yield this.createInvitation(Object.assign(Object.assign({}, config), { handshakeProtocols: [connections_1.HandshakeProtocol.Connections] }));
                // Set legacy invitation type
                outOfBandRecord.metadata.set(outOfBandRecordMetadataTypes_1.OutOfBandRecordMetadataKeys.LegacyInvitation, {
                    legacyInvitationType: messages_1.InvitationType.Connection,
                });
                const outOfBandRepository = this.agentContext.dependencyManager.resolve(repository_1.OutOfBandRepository);
                yield outOfBandRepository.update(this.agentContext, outOfBandRecord);
                return { outOfBandRecord, invitation: (0, helpers_1.convertToOldInvitation)(outOfBandRecord.outOfBandInvitation) };
            });
        }
        createLegacyConnectionlessInvitation(config) {
            return __awaiter(this, void 0, void 0, function* () {
                const outOfBandRecord = yield this.createInvitation({
                    messages: [config.message],
                    routing: config.routing,
                });
                // Set legacy invitation type
                outOfBandRecord.metadata.set(outOfBandRecordMetadataTypes_1.OutOfBandRecordMetadataKeys.LegacyInvitation, {
                    legacyInvitationType: messages_1.InvitationType.Connectionless,
                });
                const outOfBandRepository = this.agentContext.dependencyManager.resolve(repository_1.OutOfBandRepository);
                yield outOfBandRepository.update(this.agentContext, outOfBandRecord);
                // Resolve the service and set it on the message
                const resolvedService = yield this.outOfBandService.getResolvedServiceForOutOfBandServices(this.agentContext, outOfBandRecord.outOfBandInvitation.getServices());
                config.message.service = ServiceDecorator_1.ServiceDecorator.fromResolvedDidCommService(resolvedService);
                return {
                    message: config.message,
                    invitationUrl: `${config.domain}?d_m=${utils_1.JsonEncoder.toBase64URL(utils_1.JsonTransformer.toJSON(config.message))}`,
                    outOfBandRecord,
                };
            });
        }
        /**
         * Parses URL, decodes invitation and calls `receiveMessage` with parsed invitation message.
         *
         * Agent role: receiver (invitee)
         *
         * @param invitationUrl url containing a base64 encoded invitation to receive
         * @param config configuration of how out-of-band invitation should be processed
         * @returns out-of-band record and connection record if one has been created
         */
        receiveInvitationFromUrl(invitationUrl_1) {
            return __awaiter(this, arguments, void 0, function* (invitationUrl, config = {}) {
                const message = yield this.parseInvitation(invitationUrl);
                return this.receiveInvitation(message, config);
            });
        }
        /**
         * Parses URL containing encoded invitation and returns invitation message.
         *
         * Will fetch the url if the url does not contain a base64 encoded invitation.
         *
         * @param invitationUrl URL containing encoded invitation
         *
         * @returns OutOfBandInvitation
         */
        parseInvitation(invitationUrl) {
            return __awaiter(this, void 0, void 0, function* () {
                return (0, parseInvitation_1.parseInvitationShortUrl)(invitationUrl, this.agentContext.config.agentDependencies);
            });
        }
        /**
         * Creates inbound out-of-band record and assigns out-of-band invitation message to it if the
         * message is valid. It automatically passes out-of-band invitation for further processing to
         * `acceptInvitation` method. If you don't want to do that you can set `autoAcceptInvitation`
         * attribute in `config` parameter to `false` and accept the message later by calling
         * `acceptInvitation`.
         *
         * It supports both OOB (Aries RFC 0434: Out-of-Band Protocol 1.1) and Connection Invitation
         * (0160: Connection Protocol).
         *
         * Agent role: receiver (invitee)
         *
         * @param invitation either OutOfBandInvitation or ConnectionInvitationMessage
         * @param config config for handling of invitation
         *
         * @returns out-of-band record and connection record if one has been created.
         */
        receiveInvitation(invitation_1) {
            return __awaiter(this, arguments, void 0, function* (invitation, config = {}) {
                return this._receiveInvitation(invitation, config);
            });
        }
        /**
         * Creates inbound out-of-band record from an implicit invitation, given as a public DID the agent
         * should be capable of resolving. It automatically passes out-of-band invitation for further
         * processing to `acceptInvitation` method. If you don't want to do that you can set
         * `autoAcceptInvitation` attribute in `config` parameter to `false` and accept the message later by
         * calling `acceptInvitation`.
         *
         * It supports both OOB (Aries RFC 0434: Out-of-Band Protocol 1.1) and Connection Invitation
         * (0160: Connection Protocol). Handshake protocol to be used depends on handshakeProtocols
         * (DID Exchange by default)
         *
         * Agent role: receiver (invitee)
         *
         * @param config config for creating and handling invitation
         *
         * @returns out-of-band record and connection record if one has been created.
         */
        receiveImplicitInvitation(config) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const invitation = new messages_1.OutOfBandInvitation({
                    id: config.did,
                    label: (_a = config.label) !== null && _a !== void 0 ? _a : '',
                    services: [config.did],
                    handshakeProtocols: (_b = config.handshakeProtocols) !== null && _b !== void 0 ? _b : [connections_1.HandshakeProtocol.DidExchange],
                });
                return this._receiveInvitation(invitation, Object.assign(Object.assign({}, config), { isImplicit: true }));
            });
        }
        /**
         * Internal receive invitation method, for both explicit and implicit OOB invitations
         */
        _receiveInvitation(invitation_1) {
            return __awaiter(this, arguments, void 0, function* (invitation, config = {}) {
                var _a, _b, _c, _d, _e;
                // Convert to out of band invitation if needed
                const outOfBandInvitation = invitation instanceof messages_1.OutOfBandInvitation ? invitation : (0, helpers_1.convertToNewInvitation)(invitation);
                const { handshakeProtocols } = outOfBandInvitation;
                const { routing } = config;
                const autoAcceptInvitation = (_a = config.autoAcceptInvitation) !== null && _a !== void 0 ? _a : true;
                const autoAcceptConnection = (_b = config.autoAcceptConnection) !== null && _b !== void 0 ? _b : true;
                const reuseConnection = (_c = config.reuseConnection) !== null && _c !== void 0 ? _c : false;
                const label = (_d = config.label) !== null && _d !== void 0 ? _d : this.agentContext.config.label;
                const alias = config.alias;
                const imageUrl = (_e = config.imageUrl) !== null && _e !== void 0 ? _e : this.agentContext.config.connectionImageUrl;
                const messages = outOfBandInvitation.getRequests();
                const isConnectionless = handshakeProtocols === undefined || handshakeProtocols.length === 0;
                if ((!handshakeProtocols || handshakeProtocols.length === 0) && (!messages || (messages === null || messages === void 0 ? void 0 : messages.length) === 0)) {
                    throw new error_1.AriesFrameworkError('One or both of handshake_protocols and requests~attach MUST be included in the message.');
                }
                // Make sure we haven't received this invitation before
                // It's fine if we created it (means that we are connecting to ourselves) or if it's an implicit
                // invitation (it allows to connect multiple times to the same public did)
                if (!config.isImplicit) {
                    const existingOobRecordsFromThisId = yield this.outOfBandService.findAllByQuery(this.agentContext, {
                        invitationId: outOfBandInvitation.id,
                        role: OutOfBandRole_1.OutOfBandRole.Receiver,
                    });
                    if (existingOobRecordsFromThisId.length > 0) {
                        throw new error_1.AriesFrameworkError(`An out of band record with invitation ${outOfBandInvitation.id} has already been received. Invitations should have a unique id.`);
                    }
                }
                const recipientKeyFingerprints = [];
                for (const service of outOfBandInvitation.getServices()) {
                    // Resolve dids to DIDDocs to retrieve services
                    if (typeof service === 'string') {
                        this.logger.debug(`Resolving services for did ${service}.`);
                        const resolvedDidCommServices = yield this.didCommDocumentService.resolveServicesFromDid(this.agentContext, service);
                        recipientKeyFingerprints.push(...resolvedDidCommServices
                            .reduce((aggr, { recipientKeys }) => [...aggr, ...recipientKeys], [])
                            .map((key) => key.fingerprint));
                    }
                    else {
                        recipientKeyFingerprints.push(...service.recipientKeys.map((didKey) => dids_1.DidKey.fromDid(didKey).key.fingerprint));
                    }
                }
                const outOfBandRecord = new OutOfBandRecord_1.OutOfBandRecord({
                    role: OutOfBandRole_1.OutOfBandRole.Receiver,
                    state: OutOfBandState_1.OutOfBandState.Initial,
                    outOfBandInvitation: outOfBandInvitation,
                    autoAcceptConnection,
                    tags: { recipientKeyFingerprints },
                    mediatorId: routing === null || routing === void 0 ? void 0 : routing.mediatorId,
                });
                // If we have routing, and this is a connectionless exchange, or we are not auto accepting the connection
                // we need to store the routing, so it can be used when we send the first message in response to this invitation
                if (routing && (isConnectionless || !autoAcceptInvitation)) {
                    this.logger.debug('Storing routing for out of band invitation.');
                    outOfBandRecord.metadata.set(outOfBandRecordMetadataTypes_1.OutOfBandRecordMetadataKeys.RecipientRouting, {
                        recipientKeyFingerprint: routing.recipientKey.fingerprint,
                        routingKeyFingerprints: routing.routingKeys.map((key) => key.fingerprint),
                        endpoints: routing.endpoints,
                        mediatorId: routing.mediatorId,
                    });
                }
                // If the invitation was converted from another legacy format, we store this, as its needed for some flows
                if (outOfBandInvitation.invitationType && outOfBandInvitation.invitationType !== messages_1.InvitationType.OutOfBand) {
                    outOfBandRecord.metadata.set(outOfBandRecordMetadataTypes_1.OutOfBandRecordMetadataKeys.LegacyInvitation, {
                        legacyInvitationType: outOfBandInvitation.invitationType,
                    });
                }
                yield this.outOfBandService.save(this.agentContext, outOfBandRecord);
                this.outOfBandService.emitStateChangedEvent(this.agentContext, outOfBandRecord, null);
                if (autoAcceptInvitation) {
                    return yield this.acceptInvitation(outOfBandRecord.id, {
                        label,
                        alias,
                        imageUrl,
                        autoAcceptConnection,
                        reuseConnection,
                        routing,
                        timeoutMs: config.acceptInvitationTimeoutMs,
                    });
                }
                return { outOfBandRecord };
            });
        }
        /**
         * Creates a connection if the out-of-band invitation message contains `handshake_protocols`
         * attribute, except for the case when connection already exists and `reuseConnection` is enabled.
         *
         * It passes first supported message from `requests~attach` attribute to the agent, except for the
         * case reuse of connection is applied when it just sends `handshake-reuse` message to existing
         * connection.
         *
         * Agent role: receiver (invitee)
         *
         * @param outOfBandId
         * @param config
         * @returns out-of-band record and connection record if one has been created.
         */
        acceptInvitation(outOfBandId, config) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const outOfBandRecord = yield this.outOfBandService.getById(this.agentContext, outOfBandId);
                const { outOfBandInvitation } = outOfBandRecord;
                const { label, alias, imageUrl, autoAcceptConnection, reuseConnection } = config;
                const services = outOfBandInvitation.getServices();
                const messages = outOfBandInvitation.getRequests();
                const timeoutMs = (_a = config.timeoutMs) !== null && _a !== void 0 ? _a : 20000;
                let routing = config.routing;
                // recipient routing from the receiveInvitation method.
                const recipientRouting = outOfBandRecord.metadata.get(outOfBandRecordMetadataTypes_1.OutOfBandRecordMetadataKeys.RecipientRouting);
                if (!routing && recipientRouting) {
                    routing = {
                        recipientKey: crypto_1.Key.fromFingerprint(recipientRouting.recipientKeyFingerprint),
                        routingKeys: recipientRouting.routingKeyFingerprints.map((fingerprint) => crypto_1.Key.fromFingerprint(fingerprint)),
                        endpoints: recipientRouting.endpoints,
                        mediatorId: recipientRouting.mediatorId,
                    };
                }
                const { handshakeProtocols } = outOfBandInvitation;
                const existingConnection = yield this.findExistingConnection(outOfBandInvitation);
                yield this.outOfBandService.updateState(this.agentContext, outOfBandRecord, OutOfBandState_1.OutOfBandState.PrepareResponse);
                if (handshakeProtocols) {
                    this.logger.debug('Out of band message contains handshake protocols.');
                    let connectionRecord;
                    if (existingConnection && reuseConnection) {
                        this.logger.debug(`Connection already exists and reuse is enabled. Reusing an existing connection with ID ${existingConnection.id}.`);
                        if (!messages) {
                            this.logger.debug('Out of band message does not contain any request messages.');
                            const isHandshakeReuseSuccessful = yield this.handleHandshakeReuse(outOfBandRecord, existingConnection);
                            // Handshake reuse was successful
                            if (isHandshakeReuseSuccessful) {
                                this.logger.debug(`Handshake reuse successful. Reusing existing connection ${existingConnection.id}.`);
                                connectionRecord = existingConnection;
                            }
                            else {
                                // Handshake reuse failed. Not setting connection record
                                this.logger.debug(`Handshake reuse failed. Not using existing connection ${existingConnection.id}.`);
                            }
                        }
                        else {
                            // Handshake reuse because we found a connection and we can respond directly to the message
                            this.logger.debug(`Reusing existing connection ${existingConnection.id}.`);
                            connectionRecord = existingConnection;
                        }
                    }
                    // If no existing connection was found, reuseConnection is false, or we didn't receive a
                    // handshake-reuse-accepted message we create a new connection
                    if (!connectionRecord) {
                        this.logger.debug('Connection does not exist or reuse is disabled. Creating a new connection.');
                        // Find first supported handshake protocol preserving the order of handshake protocols
                        // defined by `handshake_protocols` attribute in the invitation message
                        const handshakeProtocol = this.getFirstSupportedProtocol(handshakeProtocols);
                        connectionRecord = yield this.connectionsApi.acceptOutOfBandInvitation(outOfBandRecord, {
                            label,
                            alias,
                            imageUrl,
                            autoAcceptConnection,
                            protocol: handshakeProtocol,
                            routing,
                        });
                    }
                    if (messages) {
                        this.logger.debug('Out of band message contains request messages.');
                        if (connectionRecord.isReady) {
                            yield this.emitWithConnection(outOfBandRecord, connectionRecord, messages);
                        }
                        else {
                            // Wait until the connection is ready and then pass the messages to the agent for further processing
                            this.connectionsApi
                                .returnWhenIsConnected(connectionRecord.id, { timeoutMs })
                                .then((connectionRecord) => this.emitWithConnection(outOfBandRecord, connectionRecord, messages))
                                .catch((error) => {
                                if (error instanceof rxjs_1.EmptyError) {
                                    this.logger.warn(`Agent unsubscribed before connection got into ${connections_1.DidExchangeState.Completed} state`, error);
                                }
                                else {
                                    this.logger.error('Promise waiting for the connection to be complete failed.', error);
                                }
                            });
                        }
                    }
                    return { outOfBandRecord, connectionRecord };
                }
                else if (messages) {
                    this.logger.debug('Out of band message contains only request messages.');
                    if (existingConnection) {
                        this.logger.debug('Connection already exists.', { connectionId: existingConnection.id });
                        yield this.emitWithConnection(outOfBandRecord, existingConnection, messages);
                    }
                    else {
                        yield this.emitWithServices(outOfBandRecord, services, messages);
                    }
                }
                return { outOfBandRecord };
            });
        }
        findByReceivedInvitationId(receivedInvitationId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.outOfBandService.findByReceivedInvitationId(this.agentContext, receivedInvitationId);
            });
        }
        findByCreatedInvitationId(createdInvitationId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.outOfBandService.findByCreatedInvitationId(this.agentContext, createdInvitationId);
            });
        }
        /**
         * Retrieve all out of bands records
         *
         * @returns List containing all  out of band records
         */
        getAll() {
            return this.outOfBandService.getAll(this.agentContext);
        }
        /**
         * Retrieve all out of bands records by specified query param
         *
         * @returns List containing all out of band records matching specified query params
         */
        findAllByQuery(query) {
            return this.outOfBandService.findAllByQuery(this.agentContext, query);
        }
        /**
         * Retrieve a out of band record by id
         *
         * @param outOfBandId The  out of band record id
         * @throws {RecordNotFoundError} If no record is found
         * @return The out of band record
         *
         */
        getById(outOfBandId) {
            return this.outOfBandService.getById(this.agentContext, outOfBandId);
        }
        /**
         * Find an out of band record by id
         *
         * @param outOfBandId the  out of band record id
         * @returns The out of band record or null if not found
         */
        findById(outOfBandId) {
            return this.outOfBandService.findById(this.agentContext, outOfBandId);
        }
        /**
         * Delete an out of band record by id
         *
         * @param outOfBandId the out of band record id
         */
        deleteById(outOfBandId) {
            return __awaiter(this, void 0, void 0, function* () {
                const outOfBandRecord = yield this.getById(outOfBandId);
                const relatedConnections = yield this.connectionsApi.findAllByOutOfBandId(outOfBandId);
                // If it uses mediation and there are no related connections, proceed to delete keys from mediator
                // Note: if OOB Record is reusable, it is safe to delete it because every connection created from
                // it will use its own recipient key
                if (outOfBandRecord.mediatorId && (relatedConnections.length === 0 || outOfBandRecord.reusable)) {
                    const recipientKeys = outOfBandRecord.getTags().recipientKeyFingerprints.map((item) => crypto_1.Key.fromFingerprint(item));
                    yield this.routingService.removeRouting(this.agentContext, {
                        recipientKeys,
                        mediatorId: outOfBandRecord.mediatorId,
                    });
                }
                return this.outOfBandService.deleteById(this.agentContext, outOfBandId);
            });
        }
        assertHandshakeProtocols(handshakeProtocols) {
            if (!this.areHandshakeProtocolsSupported(handshakeProtocols)) {
                const supportedProtocols = this.getSupportedHandshakeProtocols();
                throw new error_1.AriesFrameworkError(`Handshake protocols [${handshakeProtocols}] are not supported. Supported protocols are [${supportedProtocols}]`);
            }
        }
        areHandshakeProtocolsSupported(handshakeProtocols) {
            const supportedProtocols = this.getSupportedHandshakeProtocols();
            return handshakeProtocols.every((p) => supportedProtocols.includes(p));
        }
        getSupportedHandshakeProtocols() {
            // TODO: update to featureRegistry
            const handshakeMessageFamilies = ['https://didcomm.org/didexchange', 'https://didcomm.org/connections'];
            const handshakeProtocols = this.messageHandlerRegistry.filterSupportedProtocolsByMessageFamilies(handshakeMessageFamilies);
            if (handshakeProtocols.length === 0) {
                throw new error_1.AriesFrameworkError('There is no handshake protocol supported. Agent can not create a connection.');
            }
            // Order protocols according to `handshakeMessageFamilies` array
            const orderedProtocols = handshakeMessageFamilies
                .map((messageFamily) => handshakeProtocols.find((p) => p.startsWith(messageFamily)))
                .filter((item) => !!item);
            return orderedProtocols;
        }
        getFirstSupportedProtocol(handshakeProtocols) {
            const supportedProtocols = this.getSupportedHandshakeProtocols();
            const handshakeProtocol = handshakeProtocols.find((p) => supportedProtocols.includes(p));
            if (!handshakeProtocol) {
                throw new error_1.AriesFrameworkError(`Handshake protocols [${handshakeProtocols}] are not supported. Supported protocols are [${supportedProtocols}]`);
            }
            return handshakeProtocol;
        }
        findExistingConnection(outOfBandInvitation) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug('Searching for an existing connection for out-of-band invitation.', { outOfBandInvitation });
                for (const invitationDid of outOfBandInvitation.invitationDids) {
                    const connections = yield this.connectionsApi.findByInvitationDid(invitationDid);
                    this.logger.debug(`Retrieved ${connections.length} connections for invitation did ${invitationDid}`);
                    if (connections.length === 1) {
                        const [firstConnection] = connections;
                        return firstConnection;
                    }
                    else if (connections.length > 1) {
                        this.logger.warn(`There is more than one connection created from invitationDid ${invitationDid}. Taking the first one.`);
                        const [firstConnection] = connections;
                        return firstConnection;
                    }
                    return null;
                }
            });
        }
        emitWithConnection(outOfBandRecord, connectionRecord, messages) {
            return __awaiter(this, void 0, void 0, function* () {
                const supportedMessageTypes = this.messageHandlerRegistry.supportedMessageTypes;
                const plaintextMessage = messages.find((message) => {
                    const parsedMessageType = (0, messageType_1.parseMessageType)(message['@type']);
                    return supportedMessageTypes.find((type) => (0, messageType_1.supportsIncomingMessageType)(parsedMessageType, type));
                });
                if (!plaintextMessage) {
                    throw new error_1.AriesFrameworkError('There is no message in requests~attach supported by agent.');
                }
                // Make sure message has correct parent thread id
                this.ensureParentThreadId(outOfBandRecord, plaintextMessage);
                this.logger.debug(`Message with type ${plaintextMessage['@type']} can be processed.`);
                this.eventEmitter.emit(this.agentContext, {
                    type: Events_1.AgentEventTypes.AgentMessageReceived,
                    payload: {
                        message: plaintextMessage,
                        connection: connectionRecord,
                        contextCorrelationId: this.agentContext.contextCorrelationId,
                    },
                });
            });
        }
        emitWithServices(outOfBandRecord, services, messages) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!services || services.length === 0) {
                    throw new error_1.AriesFrameworkError(`There are no services. We can not emit messages`);
                }
                const supportedMessageTypes = this.messageHandlerRegistry.supportedMessageTypes;
                const plaintextMessage = messages.find((message) => {
                    const parsedMessageType = (0, messageType_1.parseMessageType)(message['@type']);
                    return supportedMessageTypes.find((type) => (0, messageType_1.supportsIncomingMessageType)(parsedMessageType, type));
                });
                if (!plaintextMessage) {
                    throw new error_1.AriesFrameworkError('There is no message in requests~attach supported by agent.');
                }
                // Make sure message has correct parent thread id
                this.ensureParentThreadId(outOfBandRecord, plaintextMessage);
                this.logger.debug(`Message with type ${plaintextMessage['@type']} can be processed.`);
                this.eventEmitter.emit(this.agentContext, {
                    type: Events_1.AgentEventTypes.AgentMessageReceived,
                    payload: {
                        message: plaintextMessage,
                        contextCorrelationId: this.agentContext.contextCorrelationId,
                    },
                });
            });
        }
        ensureParentThreadId(outOfBandRecord, plaintextMessage) {
            var _a;
            const legacyInvitationMetadata = outOfBandRecord.metadata.get(outOfBandRecordMetadataTypes_1.OutOfBandRecordMetadataKeys.LegacyInvitation);
            // We need to set the parent thread id to the invitation id, according to RFC 0434.
            // So if it already has a pthid and it is not the same as the invitation id, we throw an error
            if (((_a = plaintextMessage['~thread']) === null || _a === void 0 ? void 0 : _a.pthid) &&
                plaintextMessage['~thread'].pthid !== outOfBandRecord.outOfBandInvitation.id) {
                throw new error_1.AriesFrameworkError(`Out of band invitation requests~attach message contains parent thread id ${plaintextMessage['~thread'].pthid} that does not match the invitation id ${outOfBandRecord.outOfBandInvitation.id}`);
            }
            // If the invitation is created from a legacy connectionless invitation, we don't need to set the pthid
            // as that's not expected, and it's generated on our side only
            if ((legacyInvitationMetadata === null || legacyInvitationMetadata === void 0 ? void 0 : legacyInvitationMetadata.legacyInvitationType) === messages_1.InvitationType.Connectionless) {
                return;
            }
            if (!plaintextMessage['~thread']) {
                plaintextMessage['~thread'] = {};
            }
            // The response to an out-of-band message MUST set its ~thread.pthid equal to the @id property of the out-of-band message.
            // By adding the pthid to the message, we ensure that the response will take over this pthid
            plaintextMessage['~thread'].pthid = outOfBandRecord.outOfBandInvitation.id;
        }
        handleHandshakeReuse(outOfBandRecord, connectionRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                const reuseMessage = yield this.outOfBandService.createHandShakeReuse(this.agentContext, outOfBandRecord, connectionRecord);
                const reuseAcceptedEventPromise = (0, rxjs_1.firstValueFrom)(this.eventEmitter.observable(OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused).pipe((0, Events_1.filterContextCorrelationId)(this.agentContext.contextCorrelationId), 
                // Find the first reuse event where the handshake reuse accepted matches the reuse message thread
                // TODO: Should we store the reuse state? Maybe we can keep it in memory for now
                (0, rxjs_1.first)((event) => event.payload.reuseThreadId === reuseMessage.threadId &&
                    event.payload.outOfBandRecord.id === outOfBandRecord.id &&
                    event.payload.connectionRecord.id === connectionRecord.id), 
                // If the event is found, we return the value true
                (0, rxjs_1.map)(() => true), (0, rxjs_1.timeout)(15000), 
                // If timeout is reached, we return false
                (0, rxjs_1.catchError)(() => (0, rxjs_1.of)(false))));
                const outboundMessageContext = new models_1.OutboundMessageContext(reuseMessage, {
                    agentContext: this.agentContext,
                    connection: connectionRecord,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return reuseAcceptedEventPromise;
            });
        }
        // TODO: we should probably move these to the out of band module and register the handler there
        registerMessageHandlers(messageHandlerRegistry) {
            messageHandlerRegistry.registerMessageHandler(new handlers_1.HandshakeReuseHandler(this.outOfBandService));
            messageHandlerRegistry.registerMessageHandler(new HandshakeReuseAcceptedHandler_1.HandshakeReuseAcceptedHandler(this.outOfBandService));
        }
    };
    __setFunctionName(_classThis, "OutOfBandApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OutOfBandApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OutOfBandApi = _classThis;
})();
exports.OutOfBandApi = OutOfBandApi;
