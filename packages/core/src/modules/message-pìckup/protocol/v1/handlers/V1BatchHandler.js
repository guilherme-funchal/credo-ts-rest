"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1BatchHandler = void 0;
const EventEmitter_1 = require("../../../../../agent/EventEmitter");
const Events_1 = require("../../../../../agent/Events");
const messages_1 = require("../messages");
class V1BatchHandler {
    constructor() {
        this.supportedMessages = [messages_1.V1BatchMessage];
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const { message } = messageContext;
            const eventEmitter = messageContext.agentContext.dependencyManager.resolve(EventEmitter_1.EventEmitter);
            messageContext.assertReadyConnection();
            const forwardedMessages = message.messages;
            forwardedMessages.forEach((message) => {
                eventEmitter.emit(messageContext.agentContext, {
                    type: Events_1.AgentEventTypes.AgentMessageReceived,
                    payload: {
                        message: message.message,
                        contextCorrelationId: messageContext.agentContext.contextCorrelationId,
                    },
                });
            });
        });
    }
}
exports.V1BatchHandler = V1BatchHandler;
