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
exports.V2MessagePickupProtocol = void 0;
const EventEmitter_1 = require("../../../../agent/EventEmitter");
const Events_1 = require("../../../../agent/Events");
const MessageSender_1 = require("../../../../agent/MessageSender");
const models_1 = require("../../../../agent/models");
const constants_1 = require("../../../../constants");
const Attachment_1 = require("../../../../decorators/attachment/Attachment");
const error_1 = require("../../../../error");
const plugins_1 = require("../../../../plugins");
const connections_1 = require("../../../connections");
const problem_reports_1 = require("../../../problem-reports");
const error_2 = require("../../../routing/error");
const MessagePickupModuleConfig_1 = require("../../MessagePickupModuleConfig");
const BaseMessagePickupProtocol_1 = require("../BaseMessagePickupProtocol");
const handlers_1 = require("./handlers");
const messages_1 = require("./messages");
let V2MessagePickupProtocol = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseMessagePickupProtocol_1.BaseMessagePickupProtocol;
    var V2MessagePickupProtocol = _classThis = class extends _classSuper {
        constructor() {
            super();
            /**
             * The version of the message pickup protocol this class supports
             */
            this.version = 'v2';
        }
        /**
         * Registers the protocol implementation (handlers, feature registry) on the agent.
         */
        register(dependencyManager, featureRegistry) {
            dependencyManager.registerMessageHandlers([
                new handlers_1.V2StatusRequestHandler(this),
                new handlers_1.V2DeliveryRequestHandler(this),
                new handlers_1.V2MessagesReceivedHandler(this),
                new handlers_1.V2StatusHandler(this),
                new handlers_1.V2MessageDeliveryHandler(this),
            ]);
            featureRegistry.register(new models_1.Protocol({
                id: 'https://didcomm.org/messagepickup/2.0',
                roles: ['mediator', 'recipient'],
            }));
        }
        pickupMessages(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { connectionRecord, recipientKey } = options;
                connectionRecord.assertReady();
                const message = new messages_1.V2StatusRequestMessage({
                    recipientKey,
                });
                return { message };
            });
        }
        processStatusRequest(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                // Assert ready connection
                const connection = messageContext.assertReadyConnection();
                const messageRepository = messageContext.agentContext.dependencyManager.resolve(constants_1.InjectionSymbols.MessageRepository);
                if (messageContext.message.recipientKey) {
                    throw new error_1.AriesFrameworkError('recipient_key parameter not supported');
                }
                const statusMessage = new messages_1.V2StatusMessage({
                    threadId: messageContext.message.threadId,
                    messageCount: yield messageRepository.getAvailableMessageCount(connection.id),
                });
                return new models_1.OutboundMessageContext(statusMessage, { agentContext: messageContext.agentContext, connection });
            });
        }
        processDeliveryRequest(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                // Assert ready connection
                const connection = messageContext.assertReadyConnection();
                if (messageContext.message.recipientKey) {
                    throw new error_1.AriesFrameworkError('recipient_key parameter not supported');
                }
                const { message } = messageContext;
                const messageRepository = messageContext.agentContext.dependencyManager.resolve(constants_1.InjectionSymbols.MessageRepository);
                // Get available messages from queue, but don't delete them
                const messages = yield messageRepository.takeFromQueue(connection.id, message.limit, true);
                // TODO: each message should be stored with an id. to be able to conform to the id property
                // of delivery message
                const attachments = messages.map((msg) => new Attachment_1.Attachment({
                    data: {
                        json: msg,
                    },
                }));
                const outboundMessageContext = messages.length > 0
                    ? new messages_1.V2MessageDeliveryMessage({
                        threadId: messageContext.message.threadId,
                        attachments,
                    })
                    : new messages_1.V2StatusMessage({
                        threadId: messageContext.message.threadId,
                        messageCount: 0,
                    });
                return new models_1.OutboundMessageContext(outboundMessageContext, { agentContext: messageContext.agentContext, connection });
            });
        }
        processMessagesReceived(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                // Assert ready connection
                const connection = messageContext.assertReadyConnection();
                const { message } = messageContext;
                const messageRepository = messageContext.agentContext.dependencyManager.resolve(constants_1.InjectionSymbols.MessageRepository);
                // TODO: Add Queued Message ID
                yield messageRepository.takeFromQueue(connection.id, message.messageIdList ? message.messageIdList.length : undefined);
                const statusMessage = new messages_1.V2StatusMessage({
                    threadId: messageContext.message.threadId,
                    messageCount: yield messageRepository.getAvailableMessageCount(connection.id),
                });
                return new models_1.OutboundMessageContext(statusMessage, { agentContext: messageContext.agentContext, connection });
            });
        }
        processStatus(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const connection = messageContext.assertReadyConnection();
                const { message: statusMessage } = messageContext;
                const { messageCount, recipientKey } = statusMessage;
                const connectionService = messageContext.agentContext.dependencyManager.resolve(connections_1.ConnectionService);
                const messageSender = messageContext.agentContext.dependencyManager.resolve(MessageSender_1.MessageSender);
                const messagePickupModuleConfig = messageContext.agentContext.dependencyManager.resolve(MessagePickupModuleConfig_1.MessagePickupModuleConfig);
                //No messages to be sent
                if (messageCount === 0) {
                    const { message, connectionRecord } = yield connectionService.createTrustPing(messageContext.agentContext, connection, {
                        responseRequested: false,
                    });
                    // FIXME: check where this flow fits, as it seems very particular for the AFJ-ACA-Py combination
                    const websocketSchemes = ['ws', 'wss'];
                    yield messageSender.sendMessage(new models_1.OutboundMessageContext(message, {
                        agentContext: messageContext.agentContext,
                        connection: connectionRecord,
                    }), {
                        transportPriority: {
                            schemes: websocketSchemes,
                            restrictive: true,
                            // TODO: add keepAlive: true to enforce through the public api
                            // we need to keep the socket alive. It already works this way, but would
                            // be good to make more explicit from the public facing API.
                            // This would also make it easier to change the internal API later on.
                            // keepAlive: true,
                        },
                    });
                    return null;
                }
                const { maximumBatchSize: maximumMessagePickup } = messagePickupModuleConfig;
                const limit = messageCount < maximumMessagePickup ? messageCount : maximumMessagePickup;
                const deliveryRequestMessage = new messages_1.V2DeliveryRequestMessage({
                    limit,
                    recipientKey,
                });
                return deliveryRequestMessage;
            });
        }
        processDelivery(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                messageContext.assertReadyConnection();
                const { appendedAttachments } = messageContext.message;
                const eventEmitter = messageContext.agentContext.dependencyManager.resolve(EventEmitter_1.EventEmitter);
                if (!appendedAttachments)
                    throw new problem_reports_1.ProblemReportError('Error processing attachments', {
                        problemCode: error_2.RoutingProblemReportReason.ErrorProcessingAttachments,
                    });
                const ids = [];
                for (const attachment of appendedAttachments) {
                    ids.push(attachment.id);
                    eventEmitter.emit(messageContext.agentContext, {
                        type: Events_1.AgentEventTypes.AgentMessageReceived,
                        payload: {
                            message: attachment.getDataAsJson(),
                            contextCorrelationId: messageContext.agentContext.contextCorrelationId,
                        },
                    });
                }
                return new messages_1.V2MessagesReceivedMessage({
                    messageIdList: ids,
                });
            });
        }
    };
    __setFunctionName(_classThis, "V2MessagePickupProtocol");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        V2MessagePickupProtocol = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return V2MessagePickupProtocol = _classThis;
})();
exports.V2MessagePickupProtocol = V2MessagePickupProtocol;
