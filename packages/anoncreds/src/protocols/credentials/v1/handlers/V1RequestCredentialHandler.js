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
exports.V1RequestCredentialHandler = void 0;
const core_1 = require("@aries-framework/core");
const messages_1 = require("../messages");
class V1RequestCredentialHandler {
    constructor(credentialProtocol) {
        this.supportedMessages = [messages_1.V1RequestCredentialMessage];
        this.credentialProtocol = credentialProtocol;
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const credentialRecord = yield this.credentialProtocol.processRequest(messageContext);
            const shouldAutoRespond = yield this.credentialProtocol.shouldAutoRespondToRequest(messageContext.agentContext, {
                credentialRecord,
                requestMessage: messageContext.message,
            });
            if (shouldAutoRespond) {
                return yield this.acceptRequest(credentialRecord, messageContext);
            }
        });
    }
    acceptRequest(credentialRecord, messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            messageContext.agentContext.config.logger.info(`Automatically sending credential with autoAccept`);
            const offerMessage = yield this.credentialProtocol.findOfferMessage(messageContext.agentContext, credentialRecord.id);
            if (!offerMessage) {
                throw new core_1.AriesFrameworkError(`Could not find offer message for credential record with id ${credentialRecord.id}`);
            }
            const { message } = yield this.credentialProtocol.acceptRequest(messageContext.agentContext, {
                credentialRecord,
            });
            return (0, core_1.getOutboundMessageContext)(messageContext.agentContext, {
                connectionRecord: messageContext.connection,
                message,
                associatedRecord: credentialRecord,
                lastReceivedMessage: messageContext.message,
                lastSentMessage: offerMessage,
            });
        });
    }
}
exports.V1RequestCredentialHandler = V1RequestCredentialHandler;
