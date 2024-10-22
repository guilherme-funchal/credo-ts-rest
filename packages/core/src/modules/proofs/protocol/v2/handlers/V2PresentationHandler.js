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
exports.V2PresentationHandler = void 0;
const getOutboundMessageContext_1 = require("../../../../../agent/getOutboundMessageContext");
const storage_1 = require("../../../../../storage");
const messages_1 = require("../messages");
class V2PresentationHandler {
    constructor(proofProtocol) {
        this.supportedMessages = [messages_1.V2PresentationMessage];
        this.proofProtocol = proofProtocol;
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const proofRecord = yield this.proofProtocol.processPresentation(messageContext);
            const shouldAutoRespond = yield this.proofProtocol.shouldAutoRespondToPresentation(messageContext.agentContext, {
                proofRecord,
                presentationMessage: messageContext.message,
            });
            if (shouldAutoRespond) {
                return yield this.acceptPresentation(proofRecord, messageContext);
            }
        });
    }
    acceptPresentation(proofRecord, messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            messageContext.agentContext.config.logger.info(`Automatically sending acknowledgement with autoAccept`);
            const { message } = yield this.proofProtocol.acceptPresentation(messageContext.agentContext, {
                proofRecord,
            });
            const didCommMessageRepository = messageContext.agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            const requestMessage = yield didCommMessageRepository.getAgentMessage(messageContext.agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: messages_1.V2RequestPresentationMessage,
            });
            return (0, getOutboundMessageContext_1.getOutboundMessageContext)(messageContext.agentContext, {
                connectionRecord: messageContext.connection,
                message,
                associatedRecord: proofRecord,
                lastReceivedMessage: messageContext.message,
                lastSentMessage: requestMessage,
            });
        });
    }
}
exports.V2PresentationHandler = V2PresentationHandler;
