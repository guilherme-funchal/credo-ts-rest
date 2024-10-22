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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSender = void 0;
exports.isDidCommTransportQueue = isDidCommTransportQueue;
const constants_1 = require("../constants");
const TransportDecorator_1 = require("../decorators/transport/TransportDecorator");
const error_1 = require("../error");
const key_type_1 = require("../modules/dids/domain/key-type");
const helpers_1 = require("../modules/dids/helpers");
const plugins_1 = require("../plugins");
const MessageValidator_1 = require("../utils/MessageValidator");
const uri_1 = require("../utils/uri");
const Events_1 = require("./Events");
const models_1 = require("./models");
let MessageSender = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MessageSender = _classThis = class {
        constructor(envelopeService, transportService, messageRepository, logger, didResolverService, didCommDocumentService, eventEmitter) {
            this._outboundTransports = [];
            this.envelopeService = envelopeService;
            this.transportService = transportService;
            this.messageRepository = messageRepository;
            this.logger = logger;
            this.didResolverService = didResolverService;
            this.didCommDocumentService = didCommDocumentService;
            this.eventEmitter = eventEmitter;
            this._outboundTransports = [];
        }
        get outboundTransports() {
            return this._outboundTransports;
        }
        registerOutboundTransport(outboundTransport) {
            this._outboundTransports.push(outboundTransport);
        }
        unregisterOutboundTransport(outboundTransport) {
            return __awaiter(this, void 0, void 0, function* () {
                this._outboundTransports = this.outboundTransports.filter((transport) => transport !== outboundTransport);
                yield outboundTransport.stop();
            });
        }
        packMessage(agentContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (agentContext, { keys, message, endpoint, }) {
                const encryptedMessage = yield this.envelopeService.packMessage(agentContext, message, keys);
                return {
                    payload: encryptedMessage,
                    responseRequested: message.hasAnyReturnRoute(),
                    endpoint,
                };
            });
        }
        sendMessageToSession(agentContext, session, message) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Packing message and sending it via existing session ${session.type}...`);
                if (!session.keys) {
                    throw new error_1.AriesFrameworkError(`There are no keys for the given ${session.type} transport session.`);
                }
                const encryptedMessage = yield this.envelopeService.packMessage(agentContext, message, session.keys);
                this.logger.debug('Sending message');
                yield session.send(agentContext, encryptedMessage);
            });
        }
        sendPackage(agentContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (agentContext, { connection, encryptedMessage, options, }) {
                var _b, e_1, _c, _d;
                var _e;
                const errors = [];
                // Try to send to already open session
                const session = this.transportService.findSessionByConnectionId(connection.id);
                if ((_e = session === null || session === void 0 ? void 0 : session.inboundMessage) === null || _e === void 0 ? void 0 : _e.hasReturnRouting()) {
                    try {
                        yield session.send(agentContext, encryptedMessage);
                        return;
                    }
                    catch (error) {
                        errors.push(error);
                        this.logger.debug(`Sending packed message via session failed with error: ${error.message}.`, error);
                    }
                }
                // Retrieve DIDComm services
                const { services, queueService } = yield this.retrieveServicesByConnection(agentContext, connection, options === null || options === void 0 ? void 0 : options.transportPriority);
                if (this.outboundTransports.length === 0 && !queueService) {
                    throw new error_1.AriesFrameworkError('Agent has no outbound transport!');
                }
                try {
                    // Loop trough all available services and try to send the message
                    for (var _f = true, services_1 = __asyncValues(services), services_1_1; services_1_1 = yield services_1.next(), _b = services_1_1.done, !_b; _f = true) {
                        _d = services_1_1.value;
                        _f = false;
                        const service = _d;
                        this.logger.debug(`Sending outbound message to service:`, { service });
                        try {
                            const protocolScheme = (0, uri_1.getProtocolScheme)(service.serviceEndpoint);
                            for (const transport of this.outboundTransports) {
                                if (transport.supportedSchemes.includes(protocolScheme)) {
                                    yield transport.sendMessage({
                                        payload: encryptedMessage,
                                        endpoint: service.serviceEndpoint,
                                        connectionId: connection.id,
                                    });
                                    break;
                                }
                            }
                            return;
                        }
                        catch (error) {
                            this.logger.debug(`Sending outbound message to service with id ${service.id} failed with the following error:`, {
                                message: error.message,
                                error: error,
                            });
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_f && !_b && (_c = services_1.return)) yield _c.call(services_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                // We didn't succeed to send the message over open session, or directly to serviceEndpoint
                // If the other party shared a queue service endpoint in their did doc we queue the message
                if (queueService) {
                    this.logger.debug(`Queue packed message for connection ${connection.id} (${connection.theirLabel})`);
                    yield this.messageRepository.add(connection.id, encryptedMessage);
                    return;
                }
                // Message is undeliverable
                this.logger.error(`Message is undeliverable to connection ${connection.id} (${connection.theirLabel})`, {
                    message: encryptedMessage,
                    errors,
                    connection,
                });
                throw new error_1.AriesFrameworkError(`Message is undeliverable to connection ${connection.id} (${connection.theirLabel})`);
            });
        }
        sendMessage(outboundMessageContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, e_2, _b, _c;
                var _d;
                const { agentContext, connection, outOfBand, message } = outboundMessageContext;
                const errors = [];
                if (outboundMessageContext.isOutboundServiceMessage()) {
                    return this.sendMessageToService(outboundMessageContext);
                }
                if (!connection) {
                    this.logger.error('Outbound message has no associated connection');
                    this.emitMessageSentEvent(outboundMessageContext, models_1.OutboundMessageSendStatus.Undeliverable);
                    throw new error_1.MessageSendingError('Outbound message has no associated connection', {
                        outboundMessageContext,
                    });
                }
                this.logger.debug('Send outbound message', {
                    message,
                    connectionId: connection.id,
                });
                const session = this.findSessionForOutboundContext(outboundMessageContext);
                if (session) {
                    this.logger.debug(`Found session with return routing for message '${message.id}' (connection '${connection.id}'`);
                    try {
                        yield this.sendMessageToSession(agentContext, session, message);
                        this.emitMessageSentEvent(outboundMessageContext, models_1.OutboundMessageSendStatus.SentToSession);
                        return;
                    }
                    catch (error) {
                        errors.push(error);
                        this.logger.debug(`Sending an outbound message via session failed with error: ${error.message}.`, error);
                    }
                }
                // Retrieve DIDComm services
                let services = [];
                let queueService;
                try {
                    ;
                    ({ services, queueService } = yield this.retrieveServicesByConnection(agentContext, connection, options === null || options === void 0 ? void 0 : options.transportPriority, outOfBand));
                }
                catch (error) {
                    this.logger.error(`Unable to retrieve services for connection '${connection.id}. ${error.message}`);
                    this.emitMessageSentEvent(outboundMessageContext, models_1.OutboundMessageSendStatus.Undeliverable);
                    throw new error_1.MessageSendingError(`Unable to retrieve services for connection '${connection.id}`, {
                        outboundMessageContext,
                        cause: error,
                    });
                }
                if (!connection.did) {
                    this.logger.error(`Unable to send message using connection '${connection.id}' that doesn't have a did`);
                    this.emitMessageSentEvent(outboundMessageContext, models_1.OutboundMessageSendStatus.Undeliverable);
                    throw new error_1.MessageSendingError(`Unable to send message using connection '${connection.id}' that doesn't have a did`, { outboundMessageContext });
                }
                let ourDidDocument;
                try {
                    ourDidDocument = yield this.didResolverService.resolveDidDocument(agentContext, connection.did);
                }
                catch (error) {
                    this.logger.error(`Unable to resolve DID Document for '${connection.did}`);
                    this.emitMessageSentEvent(outboundMessageContext, models_1.OutboundMessageSendStatus.Undeliverable);
                    throw new error_1.MessageSendingError(`Unable to resolve DID Document for '${connection.did}`, {
                        outboundMessageContext,
                        cause: error,
                    });
                }
                const ourAuthenticationKeys = getAuthenticationKeys(ourDidDocument);
                // TODO We're selecting just the first authentication key. Is it ok?
                // We can probably learn something from the didcomm-rust implementation, which looks at crypto compatibility to make sure the
                // other party can decrypt the message. https://github.com/sicpa-dlab/didcomm-rust/blob/9a24b3b60f07a11822666dda46e5616a138af056/src/message/pack_encrypted/mod.rs#L33-L44
                // This will become more relevant when we support different encrypt envelopes. One thing to take into account though is that currently we only store the recipientKeys
                // as defined in the didcomm services, while it could be for example that the first authentication key is not defined in the recipientKeys, in which case we wouldn't
                // even be interoperable between two AFJ agents. So we should either pick the first key that is defined in the recipientKeys, or we should make sure to store all
                // keys defined in the did document as tags so we can retrieve it, even if it's not defined in the recipientKeys. This, again, will become simpler once we use didcomm v2
                // as the `from` field in a received message will identity the did used so we don't have to store all keys in tags to be able to find the connections associated with
                // an incoming message.
                const [firstOurAuthenticationKey] = ourAuthenticationKeys;
                // If the returnRoute is already set we won't override it. This allows to set the returnRoute manually if this is desired.
                const shouldAddReturnRoute = ((_d = message.transport) === null || _d === void 0 ? void 0 : _d.returnRoute) === undefined && !this.transportService.hasInboundEndpoint(ourDidDocument);
                try {
                    // Loop trough all available services and try to send the message
                    for (var _e = true, services_2 = __asyncValues(services), services_2_1; services_2_1 = yield services_2.next(), _a = services_2_1.done, !_a; _e = true) {
                        _c = services_2_1.value;
                        _e = false;
                        const service = _c;
                        try {
                            // Enable return routing if the our did document does not have any inbound endpoint for given sender key
                            yield this.sendToService(new models_1.OutboundMessageContext(message, {
                                agentContext,
                                serviceParams: {
                                    service,
                                    senderKey: firstOurAuthenticationKey,
                                    returnRoute: shouldAddReturnRoute,
                                },
                                connection,
                            }));
                            this.emitMessageSentEvent(outboundMessageContext, models_1.OutboundMessageSendStatus.SentToTransport);
                            return;
                        }
                        catch (error) {
                            errors.push(error);
                            this.logger.debug(`Sending outbound message to service with id ${service.id} failed with the following error:`, {
                                message: error.message,
                                error: error,
                            });
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (!_e && !_a && (_b = services_2.return)) yield _b.call(services_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                // We didn't succeed to send the message over open session, or directly to serviceEndpoint
                // If the other party shared a queue service endpoint in their did doc we queue the message
                if (queueService) {
                    this.logger.debug(`Queue message for connection ${connection.id} (${connection.theirLabel})`);
                    const keys = {
                        recipientKeys: queueService.recipientKeys,
                        routingKeys: queueService.routingKeys,
                        senderKey: firstOurAuthenticationKey,
                    };
                    const encryptedMessage = yield this.envelopeService.packMessage(agentContext, message, keys);
                    yield this.messageRepository.add(connection.id, encryptedMessage);
                    this.emitMessageSentEvent(outboundMessageContext, models_1.OutboundMessageSendStatus.QueuedForPickup);
                    return;
                }
                // Message is undeliverable
                this.logger.error(`Message is undeliverable to connection ${connection.id} (${connection.theirLabel})`, {
                    message,
                    errors,
                    connection,
                });
                this.emitMessageSentEvent(outboundMessageContext, models_1.OutboundMessageSendStatus.Undeliverable);
                throw new error_1.MessageSendingError(`Message is undeliverable to connection ${connection.id} (${connection.theirLabel})`, { outboundMessageContext });
            });
        }
        /**
         * @deprecated Use `sendMessage` directly instead. Will be made private in 0.5.0
         */
        sendMessageToService(outboundMessageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const session = this.findSessionForOutboundContext(outboundMessageContext);
                if (session) {
                    this.logger.debug(`Found session with return routing for message '${outboundMessageContext.message.id}'`);
                    try {
                        yield this.sendMessageToSession(outboundMessageContext.agentContext, session, outboundMessageContext.message);
                        this.emitMessageSentEvent(outboundMessageContext, models_1.OutboundMessageSendStatus.SentToSession);
                        return;
                    }
                    catch (error) {
                        this.logger.debug(`Sending an outbound message via session failed with error: ${error.message}.`, error);
                    }
                }
                // If there is no session try sending to service instead
                try {
                    yield this.sendToService(outboundMessageContext);
                    this.emitMessageSentEvent(outboundMessageContext, models_1.OutboundMessageSendStatus.SentToTransport);
                }
                catch (error) {
                    this.logger.error(`Message is undeliverable to service with id ${(_a = outboundMessageContext.serviceParams) === null || _a === void 0 ? void 0 : _a.service.id}: ${error.message}`, {
                        message: outboundMessageContext.message,
                        error,
                    });
                    this.emitMessageSentEvent(outboundMessageContext, models_1.OutboundMessageSendStatus.Undeliverable);
                    throw new error_1.MessageSendingError(`Message is undeliverable to service with id ${(_b = outboundMessageContext.serviceParams) === null || _b === void 0 ? void 0 : _b.service.id}: ${error.message}`, { outboundMessageContext });
                }
            });
        }
        sendToService(outboundMessageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const { agentContext, message, serviceParams, connection } = outboundMessageContext;
                if (!serviceParams) {
                    throw new error_1.AriesFrameworkError('No service parameters found in outbound message context');
                }
                const { service, senderKey, returnRoute } = serviceParams;
                if (this.outboundTransports.length === 0) {
                    throw new error_1.AriesFrameworkError('Agent has no outbound transport!');
                }
                this.logger.debug(`Sending outbound message to service:`, {
                    messageId: message.id,
                    service: Object.assign(Object.assign({}, service), { recipientKeys: 'omitted...', routingKeys: 'omitted...' }),
                });
                const keys = {
                    recipientKeys: service.recipientKeys,
                    routingKeys: service.routingKeys,
                    senderKey,
                };
                // Set return routing for message if requested
                if (returnRoute) {
                    message.setReturnRouting(TransportDecorator_1.ReturnRouteTypes.all);
                }
                try {
                    MessageValidator_1.MessageValidator.validateSync(message);
                }
                catch (error) {
                    this.logger.error(`Aborting sending outbound message ${message.type} to ${service.serviceEndpoint}. Message validation failed`, {
                        errors: error,
                        message: message.toJSON(),
                    });
                    throw error;
                }
                const outboundPackage = yield this.packMessage(agentContext, { message, keys, endpoint: service.serviceEndpoint });
                outboundPackage.endpoint = service.serviceEndpoint;
                outboundPackage.connectionId = connection === null || connection === void 0 ? void 0 : connection.id;
                for (const transport of this.outboundTransports) {
                    const protocolScheme = (0, uri_1.getProtocolScheme)(service.serviceEndpoint);
                    if (!protocolScheme) {
                        this.logger.warn('Service does not have a protocol scheme.');
                    }
                    else if (transport.supportedSchemes.includes(protocolScheme)) {
                        yield transport.sendMessage(outboundPackage);
                        return;
                    }
                }
                throw new error_1.MessageSendingError(`Unable to send message to service: ${service.serviceEndpoint}`, {
                    outboundMessageContext,
                });
            });
        }
        findSessionForOutboundContext(outboundContext) {
            var _a, _b, _c, _d;
            let session = undefined;
            // Use session id from outbound context if present, or use the session from the inbound message context
            const sessionId = (_a = outboundContext.sessionId) !== null && _a !== void 0 ? _a : (_b = outboundContext.inboundMessageContext) === null || _b === void 0 ? void 0 : _b.sessionId;
            // Try to find session by id
            if (sessionId) {
                session = this.transportService.findSessionById(sessionId);
            }
            // Try to find session by connection id
            if (!session && ((_c = outboundContext.connection) === null || _c === void 0 ? void 0 : _c.id)) {
                session = this.transportService.findSessionByConnectionId(outboundContext.connection.id);
            }
            return session && ((_d = session.inboundMessage) === null || _d === void 0 ? void 0 : _d.hasAnyReturnRoute()) ? session : null;
        }
        retrieveServicesByConnection(agentContext, connection, transportPriority, outOfBand) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                this.logger.debug(`Retrieving services for connection '${connection.id}' (${connection.theirLabel})`, {
                    transportPriority,
                    connection,
                });
                let didCommServices = [];
                if (connection.theirDid) {
                    this.logger.debug(`Resolving services for connection theirDid ${connection.theirDid}.`);
                    didCommServices = yield this.didCommDocumentService.resolveServicesFromDid(agentContext, connection.theirDid);
                }
                else if (outOfBand) {
                    this.logger.debug(`Resolving services from out-of-band record ${outOfBand.id}.`);
                    if (connection.isRequester) {
                        for (const service of outOfBand.outOfBandInvitation.getServices()) {
                            // Resolve dids to DIDDocs to retrieve services
                            if (typeof service === 'string') {
                                this.logger.debug(`Resolving services for did ${service}.`);
                                didCommServices.push(...(yield this.didCommDocumentService.resolveServicesFromDid(agentContext, service)));
                            }
                            else {
                                // Out of band inline service contains keys encoded as did:key references
                                didCommServices.push({
                                    id: service.id,
                                    recipientKeys: service.recipientKeys.map(helpers_1.didKeyToInstanceOfKey),
                                    routingKeys: ((_a = service.routingKeys) === null || _a === void 0 ? void 0 : _a.map(helpers_1.didKeyToInstanceOfKey)) || [],
                                    serviceEndpoint: service.serviceEndpoint,
                                });
                            }
                        }
                    }
                }
                // Separate queue service out
                let services = didCommServices.filter((s) => !isDidCommTransportQueue(s.serviceEndpoint));
                const queueService = didCommServices.find((s) => isDidCommTransportQueue(s.serviceEndpoint));
                // If restrictive will remove services not listed in schemes list
                if (transportPriority === null || transportPriority === void 0 ? void 0 : transportPriority.restrictive) {
                    services = services.filter((service) => {
                        const serviceSchema = (0, uri_1.getProtocolScheme)(service.serviceEndpoint);
                        return transportPriority.schemes.includes(serviceSchema);
                    });
                }
                // If transport priority is set we will sort services by our priority
                if (transportPriority === null || transportPriority === void 0 ? void 0 : transportPriority.schemes) {
                    services = services.sort(function (a, b) {
                        const aScheme = (0, uri_1.getProtocolScheme)(a.serviceEndpoint);
                        const bScheme = (0, uri_1.getProtocolScheme)(b.serviceEndpoint);
                        return (transportPriority === null || transportPriority === void 0 ? void 0 : transportPriority.schemes.indexOf(aScheme)) - (transportPriority === null || transportPriority === void 0 ? void 0 : transportPriority.schemes.indexOf(bScheme));
                    });
                }
                this.logger.debug(`Retrieved ${services.length} services for message to connection '${connection.id}'(${connection.theirLabel})'`, { hasQueueService: queueService !== undefined });
                return { services, queueService };
            });
        }
        emitMessageSentEvent(outboundMessageContext, status) {
            const { agentContext } = outboundMessageContext;
            this.eventEmitter.emit(agentContext, {
                type: Events_1.AgentEventTypes.AgentMessageSent,
                payload: {
                    message: outboundMessageContext,
                    status,
                },
            });
        }
    };
    __setFunctionName(_classThis, "MessageSender");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MessageSender = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MessageSender = _classThis;
})();
exports.MessageSender = MessageSender;
function isDidCommTransportQueue(serviceEndpoint) {
    return serviceEndpoint === constants_1.DID_COMM_TRANSPORT_QUEUE;
}
function getAuthenticationKeys(didDocument) {
    var _a, _b;
    return ((_b = (_a = didDocument.authentication) === null || _a === void 0 ? void 0 : _a.map((authentication) => {
        const verificationMethod = typeof authentication === 'string' ? didDocument.dereferenceVerificationMethod(authentication) : authentication;
        const key = (0, key_type_1.getKeyFromVerificationMethod)(verificationMethod);
        return key;
    })) !== null && _b !== void 0 ? _b : []);
}
