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
exports.V2MessageDeliveryHandler = void 0;
const models_1 = require("../../../../../agent/models");
const V2MessageDeliveryMessage_1 = require("../messages/V2MessageDeliveryMessage");
class V2MessageDeliveryHandler {
    constructor(messagePickupService) {
        this.supportedMessages = [V2MessageDeliveryMessage_1.V2MessageDeliveryMessage];
        this.messagePickupService = messagePickupService;
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = messageContext.assertReadyConnection();
            const deliveryReceivedMessage = yield this.messagePickupService.processDelivery(messageContext);
            if (deliveryReceivedMessage) {
                return new models_1.OutboundMessageContext(deliveryReceivedMessage, {
                    agentContext: messageContext.agentContext,
                    connection,
                });
            }
        });
    }
}
exports.V2MessageDeliveryHandler = V2MessageDeliveryHandler;
