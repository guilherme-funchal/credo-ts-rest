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
exports.ConnectionsApi = void 0;
const models_1 = require("../../agent/models");
const TransportDecorator_1 = require("../../decorators/transport/TransportDecorator");
const error_1 = require("../../error");
const plugins_1 = require("../../plugins");
const handlers_1 = require("./handlers");
const models_2 = require("./models");
let ConnectionsApi = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ConnectionsApi = _classThis = class {
        constructor(messageHandlerRegistry, didExchangeProtocol, connectionService, outOfBandService, trustPingService, routingService, didRepository, didResolverService, messageSender, agentContext, connectionsModuleConfig) {
            this.didExchangeProtocol = didExchangeProtocol;
            this.connectionService = connectionService;
            this.outOfBandService = outOfBandService;
            this.trustPingService = trustPingService;
            this.routingService = routingService;
            this.didRepository = didRepository;
            this.messageSender = messageSender;
            this.didResolverService = didResolverService;
            this.agentContext = agentContext;
            this.config = connectionsModuleConfig;
            this.registerMessageHandlers(messageHandlerRegistry);
        }
        acceptOutOfBandInvitation(outOfBandRecord, config) {
            return __awaiter(this, void 0, void 0, function* () {
                const { protocol, label, alias, imageUrl, autoAcceptConnection } = config;
                const routing = config.routing ||
                    (yield this.routingService.getRouting(this.agentContext, { mediatorId: outOfBandRecord.mediatorId }));
                let result;
                if (protocol === models_2.HandshakeProtocol.DidExchange) {
                    result = yield this.didExchangeProtocol.createRequest(this.agentContext, outOfBandRecord, {
                        label,
                        alias,
                        routing,
                        autoAcceptConnection,
                    });
                }
                else if (protocol === models_2.HandshakeProtocol.Connections) {
                    result = yield this.connectionService.createRequest(this.agentContext, outOfBandRecord, {
                        label,
                        alias,
                        imageUrl,
                        routing,
                        autoAcceptConnection,
                    });
                }
                else {
                    throw new error_1.AriesFrameworkError(`Unsupported handshake protocol ${protocol}.`);
                }
                const { message, connectionRecord } = result;
                const outboundMessageContext = new models_1.OutboundMessageContext(message, {
                    agentContext: this.agentContext,
                    connection: connectionRecord,
                    outOfBand: outOfBandRecord,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return connectionRecord;
            });
        }
        /**
         * Accept a connection request as inviter (by sending a connection response message) for the connection with the specified connection id.
         * This is not needed when auto accepting of connection is enabled.
         *
         * @param connectionId the id of the connection for which to accept the request
         * @returns connection record
         */
        acceptRequest(connectionId) {
            return __awaiter(this, void 0, void 0, function* () {
                const connectionRecord = yield this.connectionService.findById(this.agentContext, connectionId);
                if (!connectionRecord) {
                    throw new error_1.AriesFrameworkError(`Connection record ${connectionId} not found.`);
                }
                if (!connectionRecord.outOfBandId) {
                    throw new error_1.AriesFrameworkError(`Connection record ${connectionId} does not have out-of-band record.`);
                }
                const outOfBandRecord = yield this.outOfBandService.findById(this.agentContext, connectionRecord.outOfBandId);
                if (!outOfBandRecord) {
                    throw new error_1.AriesFrameworkError(`Out-of-band record ${connectionRecord.outOfBandId} not found.`);
                }
                // If the outOfBandRecord is reusable we need to use new routing keys for the connection, otherwise
                // all connections will use the same routing keys
                const routing = outOfBandRecord.reusable ? yield this.routingService.getRouting(this.agentContext) : undefined;
                let outboundMessageContext;
                if (connectionRecord.protocol === models_2.HandshakeProtocol.DidExchange) {
                    const message = yield this.didExchangeProtocol.createResponse(this.agentContext, connectionRecord, outOfBandRecord, routing);
                    outboundMessageContext = new models_1.OutboundMessageContext(message, {
                        agentContext: this.agentContext,
                        connection: connectionRecord,
                    });
                }
                else {
                    const { message } = yield this.connectionService.createResponse(this.agentContext, connectionRecord, outOfBandRecord, routing);
                    outboundMessageContext = new models_1.OutboundMessageContext(message, {
                        agentContext: this.agentContext,
                        connection: connectionRecord,
                    });
                }
                yield this.messageSender.sendMessage(outboundMessageContext);
                return connectionRecord;
            });
        }
        /**
         * Accept a connection response as invitee (by sending a trust ping message) for the connection with the specified connection id.
         * This is not needed when auto accepting of connection is enabled.
         *
         * @param connectionId the id of the connection for which to accept the response
         * @returns connection record
         */
        acceptResponse(connectionId) {
            return __awaiter(this, void 0, void 0, function* () {
                const connectionRecord = yield this.connectionService.getById(this.agentContext, connectionId);
                let outboundMessageContext;
                if (connectionRecord.protocol === models_2.HandshakeProtocol.DidExchange) {
                    if (!connectionRecord.outOfBandId) {
                        throw new error_1.AriesFrameworkError(`Connection ${connectionRecord.id} does not have outOfBandId!`);
                    }
                    const outOfBandRecord = yield this.outOfBandService.findById(this.agentContext, connectionRecord.outOfBandId);
                    if (!outOfBandRecord) {
                        throw new error_1.AriesFrameworkError(`OutOfBand record for connection ${connectionRecord.id} with outOfBandId ${connectionRecord.outOfBandId} not found!`);
                    }
                    const message = yield this.didExchangeProtocol.createComplete(this.agentContext, connectionRecord, outOfBandRecord);
                    // Disable return routing as we don't want to receive a response for this message over the same channel
                    // This has led to long timeouts as not all clients actually close an http socket if there is no response message
                    message.setReturnRouting(TransportDecorator_1.ReturnRouteTypes.none);
                    outboundMessageContext = new models_1.OutboundMessageContext(message, {
                        agentContext: this.agentContext,
                        connection: connectionRecord,
                    });
                }
                else {
                    const { message } = yield this.connectionService.createTrustPing(this.agentContext, connectionRecord, {
                        responseRequested: false,
                    });
                    // Disable return routing as we don't want to receive a response for this message over the same channel
                    // This has led to long timeouts as not all clients actually close an http socket if there is no response message
                    message.setReturnRouting(TransportDecorator_1.ReturnRouteTypes.none);
                    outboundMessageContext = new models_1.OutboundMessageContext(message, {
                        agentContext: this.agentContext,
                        connection: connectionRecord,
                    });
                }
                yield this.messageSender.sendMessage(outboundMessageContext);
                return connectionRecord;
            });
        }
        /**
         * Send a trust ping to an established connection
         *
         * @param connectionId the id of the connection for which to accept the response
         * @param responseRequested do we want a response to our ping
         * @param withReturnRouting do we want a response at the time of posting
         * @returns TurstPingMessage
         */
        sendPing(connectionId_1, _a) {
            return __awaiter(this, arguments, void 0, function* (connectionId, { responseRequested = true, withReturnRouting = undefined }) {
                const connection = yield this.getById(connectionId);
                const { message } = yield this.connectionService.createTrustPing(this.agentContext, connection, {
                    responseRequested: responseRequested,
                });
                if (withReturnRouting === true) {
                    message.setReturnRouting(TransportDecorator_1.ReturnRouteTypes.all);
                }
                // Disable return routing as we don't want to receive a response for this message over the same channel
                // This has led to long timeouts as not all clients actually close an http socket if there is no response message
                if (withReturnRouting === false) {
                    message.setReturnRouting(TransportDecorator_1.ReturnRouteTypes.none);
                }
                yield this.messageSender.sendMessage(new models_1.OutboundMessageContext(message, { agentContext: this.agentContext, connection }));
                return message;
            });
        }
        returnWhenIsConnected(connectionId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.connectionService.returnWhenIsConnected(this.agentContext, connectionId, options === null || options === void 0 ? void 0 : options.timeoutMs);
            });
        }
        /**
         * Retrieve all connections records
         *
         * @returns List containing all connection records
         */
        getAll() {
            return this.connectionService.getAll(this.agentContext);
        }
        /**
         * Retrieve all connections records by specified query params
         *
         * @returns List containing all connection records matching specified query paramaters
         */
        findAllByQuery(query) {
            return this.connectionService.findAllByQuery(this.agentContext, query);
        }
        /**
         * Allows for the addition of connectionType to the record.
         *  Either updates or creates an array of string connection types
         * @param connectionId
         * @param type
         * @throws {RecordNotFoundError} If no record is found
         */
        addConnectionType(connectionId, type) {
            return __awaiter(this, void 0, void 0, function* () {
                const record = yield this.getById(connectionId);
                yield this.connectionService.addConnectionType(this.agentContext, record, type);
                return record;
            });
        }
        /**
         * Removes the given tag from the given record found by connectionId, if the tag exists otherwise does nothing
         * @param connectionId
         * @param type
         * @throws {RecordNotFoundError} If no record is found
         */
        removeConnectionType(connectionId, type) {
            return __awaiter(this, void 0, void 0, function* () {
                const record = yield this.getById(connectionId);
                yield this.connectionService.removeConnectionType(this.agentContext, record, type);
                return record;
            });
        }
        /**
         * Gets the known connection types for the record matching the given connectionId
         * @param connectionId
         * @returns An array of known connection types or null if none exist
         * @throws {RecordNotFoundError} If no record is found
         */
        getConnectionTypes(connectionId) {
            return __awaiter(this, void 0, void 0, function* () {
                const record = yield this.getById(connectionId);
                return this.connectionService.getConnectionTypes(record);
            });
        }
        /**
         *
         * @param connectionTypes An array of connection types to query for a match for
         * @returns a promise of ab array of connection records
         */
        findAllByConnectionTypes(connectionTypes) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.connectionService.findAllByConnectionTypes(this.agentContext, connectionTypes);
            });
        }
        /**
         * Retrieve a connection record by id
         *
         * @param connectionId The connection record id
         * @throws {RecordNotFoundError} If no record is found
         * @return The connection record
         *
         */
        getById(connectionId) {
            return this.connectionService.getById(this.agentContext, connectionId);
        }
        /**
         * Find a connection record by id
         *
         * @param connectionId the connection record id
         * @returns The connection record or null if not found
         */
        findById(connectionId) {
            return this.connectionService.findById(this.agentContext, connectionId);
        }
        /**
         * Delete a connection record by id
         *
         * @param connectionId the connection record id
         */
        deleteById(connectionId) {
            return __awaiter(this, void 0, void 0, function* () {
                const connection = yield this.connectionService.getById(this.agentContext, connectionId);
                if (connection.mediatorId && connection.did) {
                    const did = yield this.didResolverService.resolve(this.agentContext, connection.did);
                    if (did.didDocument) {
                        yield this.routingService.removeRouting(this.agentContext, {
                            recipientKeys: did.didDocument.recipientKeys,
                            mediatorId: connection.mediatorId,
                        });
                    }
                }
                return this.connectionService.deleteById(this.agentContext, connectionId);
            });
        }
        findAllByOutOfBandId(outOfBandId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.connectionService.findAllByOutOfBandId(this.agentContext, outOfBandId);
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
        getByThreadId(threadId) {
            return this.connectionService.getByThreadId(this.agentContext, threadId);
        }
        findByDid(did) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.connectionService.findByTheirDid(this.agentContext, did);
            });
        }
        findByInvitationDid(invitationDid) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.connectionService.findByInvitationDid(this.agentContext, invitationDid);
            });
        }
        registerMessageHandlers(messageHandlerRegistry) {
            messageHandlerRegistry.registerMessageHandler(new handlers_1.ConnectionRequestHandler(this.connectionService, this.outOfBandService, this.routingService, this.didRepository, this.config));
            messageHandlerRegistry.registerMessageHandler(new handlers_1.ConnectionResponseHandler(this.connectionService, this.outOfBandService, this.didResolverService, this.config));
            messageHandlerRegistry.registerMessageHandler(new handlers_1.AckMessageHandler(this.connectionService));
            messageHandlerRegistry.registerMessageHandler(new handlers_1.ConnectionProblemReportHandler(this.connectionService));
            messageHandlerRegistry.registerMessageHandler(new handlers_1.TrustPingMessageHandler(this.trustPingService, this.connectionService));
            messageHandlerRegistry.registerMessageHandler(new handlers_1.TrustPingResponseMessageHandler(this.trustPingService));
            messageHandlerRegistry.registerMessageHandler(new handlers_1.DidExchangeRequestHandler(this.didExchangeProtocol, this.outOfBandService, this.routingService, this.didRepository, this.config));
            messageHandlerRegistry.registerMessageHandler(new handlers_1.DidExchangeResponseHandler(this.didExchangeProtocol, this.outOfBandService, this.connectionService, this.didResolverService, this.config));
            messageHandlerRegistry.registerMessageHandler(new handlers_1.DidExchangeCompleteHandler(this.didExchangeProtocol, this.outOfBandService));
        }
    };
    __setFunctionName(_classThis, "ConnectionsApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ConnectionsApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ConnectionsApi = _classThis;
})();
exports.ConnectionsApi = ConnectionsApi;
