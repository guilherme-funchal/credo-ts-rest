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
exports.V1RequestPresentationHandler = void 0;
const core_1 = require("@aries-framework/core");
const messages_1 = require("../messages");
class V1RequestPresentationHandler {
    constructor(proofProtocol) {
        this.supportedMessages = [messages_1.V1RequestPresentationMessage];
        this.proofProtocol = proofProtocol;
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const proofRecord = yield this.proofProtocol.processRequest(messageContext);
            const shouldAutoRespond = yield this.proofProtocol.shouldAutoRespondToRequest(messageContext.agentContext, {
                proofRecord,
                requestMessage: messageContext.message,
            });
            if (shouldAutoRespond) {
                return yield this.acceptRequest(proofRecord, messageContext);
            }
        });
    }
    acceptRequest(proofRecord, messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            messageContext.agentContext.config.logger.info(`Automatically sending presentation with autoAccept on`);
            const { message } = yield this.proofProtocol.acceptRequest(messageContext.agentContext, {
                proofRecord,
            });
            return (0, core_1.getOutboundMessageContext)(messageContext.agentContext, {
                message,
                lastReceivedMessage: messageContext.message,
                associatedRecord: proofRecord,
                connectionRecord: messageContext.connection,
            });
        });
    }
}
exports.V1RequestPresentationHandler = V1RequestPresentationHandler;
