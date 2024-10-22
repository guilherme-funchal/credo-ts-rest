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
exports.Dispatcher = void 0;
const AriesFrameworkError_1 = require("../error/AriesFrameworkError");
const plugins_1 = require("../plugins");
const messageType_1 = require("../utils/messageType");
const ProblemReportMessage_1 = require("./../modules/problem-reports/messages/ProblemReportMessage");
const Events_1 = require("./Events");
const models_1 = require("./models");
let Dispatcher = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var Dispatcher = _classThis = class {
        constructor(messageSender, eventEmitter, messageHandlerRegistry, logger) {
            this.messageSender = messageSender;
            this.eventEmitter = eventEmitter;
            this.messageHandlerRegistry = messageHandlerRegistry;
            this.logger = logger;
        }
        dispatch(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const { agentContext, connection, senderKey, recipientKey, message } = messageContext;
                const messageHandler = this.messageHandlerRegistry.getHandlerForMessageType(message.type);
                if (!messageHandler) {
                    throw new AriesFrameworkError_1.AriesFrameworkError(`No handler for message type "${message.type}" found`);
                }
                let outboundMessage;
                try {
                    outboundMessage = yield messageHandler.handle(messageContext);
                }
                catch (error) {
                    const problemReportMessage = error.problemReport;
                    if (problemReportMessage instanceof ProblemReportMessage_1.ProblemReportMessage && messageContext.connection) {
                        const { protocolUri: problemReportProtocolUri } = (0, messageType_1.parseMessageType)(problemReportMessage.type);
                        const { protocolUri: inboundProtocolUri } = (0, messageType_1.parseMessageType)(messageContext.message.type);
                        // If the inbound protocol uri is the same as the problem report protocol uri, we can see the interaction as the same thread
                        // However if it is no the same we should see it as a new thread, where the inbound message `@id` is the parentThreadId
                        if (inboundProtocolUri === problemReportProtocolUri) {
                            problemReportMessage.setThread({
                                threadId: message.threadId,
                            });
                        }
                        else {
                            problemReportMessage.setThread({
                                parentThreadId: message.id,
                            });
                        }
                        outboundMessage = new models_1.OutboundMessageContext(problemReportMessage, {
                            agentContext,
                            connection: messageContext.connection,
                            inboundMessageContext: messageContext,
                        });
                    }
                    else {
                        this.logger.error(`Error handling message with type ${message.type}`, {
                            message: message.toJSON(),
                            error,
                            senderKey: senderKey === null || senderKey === void 0 ? void 0 : senderKey.fingerprint,
                            recipientKey: recipientKey === null || recipientKey === void 0 ? void 0 : recipientKey.fingerprint,
                            connectionId: connection === null || connection === void 0 ? void 0 : connection.id,
                        });
                        throw error;
                    }
                }
                if (outboundMessage) {
                    // set the inbound message context, if not already defined
                    if (!outboundMessage.inboundMessageContext) {
                        outboundMessage.inboundMessageContext = messageContext;
                    }
                    if (outboundMessage.isOutboundServiceMessage()) {
                        yield this.messageSender.sendMessageToService(outboundMessage);
                    }
                    else {
                        yield this.messageSender.sendMessage(outboundMessage);
                    }
                }
                // Emit event that allows to hook into received messages
                this.eventEmitter.emit(agentContext, {
                    type: Events_1.AgentEventTypes.AgentMessageProcessed,
                    payload: {
                        message,
                        connection,
                    },
                });
            });
        }
    };
    __setFunctionName(_classThis, "Dispatcher");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Dispatcher = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Dispatcher = _classThis;
})();
exports.Dispatcher = Dispatcher;
