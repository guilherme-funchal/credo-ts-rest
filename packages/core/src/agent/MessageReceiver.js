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
exports.MessageReceiver = void 0;
const error_1 = require("../error");
const problem_reports_1 = require("../modules/problem-reports");
const plugins_1 = require("../plugins");
const JWE_1 = require("../utils/JWE");
const JsonTransformer_1 = require("../utils/JsonTransformer");
const messageType_1 = require("../utils/messageType");
const models_1 = require("./models");
let MessageReceiver = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MessageReceiver = _classThis = class {
        constructor(envelopeService, transportService, messageSender, connectionService, dispatcher, messageHandlerRegistry, agentContextProvider, logger) {
            this._inboundTransports = [];
            this.envelopeService = envelopeService;
            this.transportService = transportService;
            this.messageSender = messageSender;
            this.connectionService = connectionService;
            this.dispatcher = dispatcher;
            this.messageHandlerRegistry = messageHandlerRegistry;
            this.agentContextProvider = agentContextProvider;
            this.logger = logger;
            this._inboundTransports = [];
        }
        get inboundTransports() {
            return this._inboundTransports;
        }
        registerInboundTransport(inboundTransport) {
            this._inboundTransports.push(inboundTransport);
        }
        unregisterInboundTransport(inboundTransport) {
            return __awaiter(this, void 0, void 0, function* () {
                this._inboundTransports = this._inboundTransports.filter((transport) => transport !== inboundTransport);
                yield inboundTransport.stop();
            });
        }
        /**
         * Receive and handle an inbound DIDComm message. It will determine the agent context, decrypt the message, transform it
         * to it's corresponding message class and finally dispatch it to the dispatcher.
         *
         * @param inboundMessage the message to receive and handle
         */
        receiveMessage(inboundMessage_1) {
            return __awaiter(this, arguments, void 0, function* (inboundMessage, { session, connection, contextCorrelationId, } = {}) {
                this.logger.debug(`Agent received message`);
                // Find agent context for the inbound message
                const agentContext = yield this.agentContextProvider.getContextForInboundMessage(inboundMessage, {
                    contextCorrelationId,
                });
                try {
                    if (this.isEncryptedMessage(inboundMessage)) {
                        yield this.receiveEncryptedMessage(agentContext, inboundMessage, session);
                    }
                    else if (this.isPlaintextMessage(inboundMessage)) {
                        yield this.receivePlaintextMessage(agentContext, inboundMessage, connection);
                    }
                    else {
                        throw new error_1.AriesFrameworkError('Unable to parse incoming message: unrecognized format');
                    }
                }
                finally {
                    // Always end the session for the agent context after handling the message.
                    yield agentContext.endSession();
                }
            });
        }
        receivePlaintextMessage(agentContext, plaintextMessage, connection) {
            return __awaiter(this, void 0, void 0, function* () {
                const message = yield this.transformAndValidate(agentContext, plaintextMessage);
                const messageContext = new models_1.InboundMessageContext(message, { connection, agentContext });
                yield this.dispatcher.dispatch(messageContext);
            });
        }
        receiveEncryptedMessage(agentContext, encryptedMessage, session) {
            return __awaiter(this, void 0, void 0, function* () {
                const decryptedMessage = yield this.decryptMessage(agentContext, encryptedMessage);
                const { plaintextMessage, senderKey, recipientKey } = decryptedMessage;
                this.logger.info(`Received message with type '${plaintextMessage['@type']}', recipient key ${recipientKey === null || recipientKey === void 0 ? void 0 : recipientKey.fingerprint} and sender key ${senderKey === null || senderKey === void 0 ? void 0 : senderKey.fingerprint}`, plaintextMessage);
                const connection = yield this.findConnectionByMessageKeys(agentContext, decryptedMessage);
                const message = yield this.transformAndValidate(agentContext, plaintextMessage, connection);
                const messageContext = new models_1.InboundMessageContext(message, {
                    // Only make the connection available in message context if the connection is ready
                    // To prevent unwanted usage of unready connections. Connections can still be retrieved from
                    // Storage if the specific protocol allows an unready connection to be used.
                    connection: (connection === null || connection === void 0 ? void 0 : connection.isReady) ? connection : undefined,
                    senderKey,
                    recipientKey,
                    agentContext,
                });
                // We want to save a session if there is a chance of returning outbound message via inbound transport.
                // That can happen when inbound message has `return_route` set to `all` or `thread`.
                // If `return_route` defines just `thread`, we decide later whether to use session according to outbound message `threadId`.
                if (senderKey && recipientKey && message.hasAnyReturnRoute() && session) {
                    this.logger.debug(`Storing session for inbound message '${message.id}'`);
                    const keys = {
                        recipientKeys: [senderKey],
                        routingKeys: [],
                        senderKey: recipientKey,
                    };
                    session.keys = keys;
                    session.inboundMessage = message;
                    // We allow unready connections to be attached to the session as we want to be able to
                    // use return routing to make connections. This is especially useful for creating connections
                    // with mediators when you don't have a public endpoint yet.
                    session.connectionId = connection === null || connection === void 0 ? void 0 : connection.id;
                    messageContext.sessionId = session.id;
                    this.transportService.saveSession(session);
                }
                else if (session) {
                    // No need to wait for session to stay open if we're not actually going to respond to the message.
                    yield session.close();
                }
                yield this.dispatcher.dispatch(messageContext);
            });
        }
        /**
         * Decrypt a message using the envelope service.
         *
         * @param message the received inbound message to decrypt
         */
        decryptMessage(agentContext, message) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield this.envelopeService.unpackMessage(agentContext, message);
                }
                catch (error) {
                    this.logger.error('Error while decrypting message', {
                        error,
                        encryptedMessage: message,
                        errorMessage: error instanceof Error ? error.message : error,
                    });
                    throw error;
                }
            });
        }
        isPlaintextMessage(message) {
            if (typeof message !== 'object' || message == null) {
                return false;
            }
            // If the message has a @type field we assume the message is in plaintext and it is not encrypted.
            return '@type' in message;
        }
        isEncryptedMessage(message) {
            // If the message does has valid JWE structure, we can assume the message is encrypted.
            return (0, JWE_1.isValidJweStructure)(message);
        }
        transformAndValidate(agentContext, plaintextMessage, connection) {
            return __awaiter(this, void 0, void 0, function* () {
                let message;
                try {
                    message = yield this.transformMessage(plaintextMessage);
                }
                catch (error) {
                    if (connection)
                        yield this.sendProblemReportMessage(agentContext, error.message, connection, plaintextMessage);
                    throw error;
                }
                return message;
            });
        }
        findConnectionByMessageKeys(agentContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (agentContext, { recipientKey, senderKey }) {
                // We only fetch connections that are sent in AuthCrypt mode
                if (!recipientKey || !senderKey)
                    return null;
                // Try to find the did records that holds the sender and recipient keys
                return this.connectionService.findByKeys(agentContext, {
                    senderKey,
                    recipientKey,
                });
            });
        }
        /**
         * Transform an plaintext DIDComm message into it's corresponding message class. Will look at all message types in the registered handlers.
         *
         * @param message the plaintext message for which to transform the message in to a class instance
         */
        transformMessage(message) {
            return __awaiter(this, void 0, void 0, function* () {
                // replace did:sov:BzCbsNYhMrjHiqZDTUASHg;spec prefix for message type with https://didcomm.org
                (0, messageType_1.replaceLegacyDidSovPrefixOnMessage)(message);
                const messageType = message['@type'];
                const MessageClass = this.messageHandlerRegistry.getMessageClassForMessageType(messageType);
                if (!MessageClass) {
                    throw new problem_reports_1.ProblemReportError(`No message class found for message type "${messageType}"`, {
                        problemCode: problem_reports_1.ProblemReportReason.MessageParseFailure,
                    });
                }
                // Cast the plain JSON object to specific instance of Message extended from AgentMessage
                let messageTransformed;
                try {
                    messageTransformed = JsonTransformer_1.JsonTransformer.fromJSON(message, MessageClass);
                }
                catch (error) {
                    this.logger.error(`Error validating message ${message.type}`, {
                        errors: error,
                        message: JSON.stringify(message),
                    });
                    throw new problem_reports_1.ProblemReportError(`Error validating message ${message.type}`, {
                        problemCode: problem_reports_1.ProblemReportReason.MessageParseFailure,
                    });
                }
                return messageTransformed;
            });
        }
        /**
         * Send the problem report message (https://didcomm.org/notification/1.0/problem-report) to the recipient.
         * @param message error message to send
         * @param connection connection to send the message to
         * @param plaintextMessage received inbound message
         */
        sendProblemReportMessage(agentContext, message, connection, plaintextMessage) {
            return __awaiter(this, void 0, void 0, function* () {
                const messageType = (0, messageType_1.parseMessageType)(plaintextMessage['@type']);
                if ((0, messageType_1.canHandleMessageType)(problem_reports_1.ProblemReportMessage, messageType)) {
                    throw new error_1.AriesFrameworkError(`Not sending problem report in response to problem report: ${message}`);
                }
                const problemReportMessage = new problem_reports_1.ProblemReportMessage({
                    description: {
                        en: message,
                        code: problem_reports_1.ProblemReportReason.MessageParseFailure,
                    },
                });
                problemReportMessage.setThread({
                    parentThreadId: plaintextMessage['@id'],
                });
                const outboundMessageContext = new models_1.OutboundMessageContext(problemReportMessage, { agentContext, connection });
                if (outboundMessageContext) {
                    yield this.messageSender.sendMessage(outboundMessageContext);
                }
            });
        }
    };
    __setFunctionName(_classThis, "MessageReceiver");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MessageReceiver = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MessageReceiver = _classThis;
})();
exports.MessageReceiver = MessageReceiver;
