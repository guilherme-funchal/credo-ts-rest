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
exports.V2OfferCredentialHandler = void 0;
const getOutboundMessageContext_1 = require("../../../../../agent/getOutboundMessageContext");
const V2OfferCredentialMessage_1 = require("../messages/V2OfferCredentialMessage");
class V2OfferCredentialHandler {
    constructor(credentialProtocol) {
        this.supportedMessages = [V2OfferCredentialMessage_1.V2OfferCredentialMessage];
        this.credentialProtocol = credentialProtocol;
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const credentialRecord = yield this.credentialProtocol.processOffer(messageContext);
            const shouldAutoRespond = yield this.credentialProtocol.shouldAutoRespondToOffer(messageContext.agentContext, {
                credentialRecord,
                offerMessage: messageContext.message,
            });
            if (shouldAutoRespond) {
                return yield this.acceptOffer(credentialRecord, messageContext);
            }
        });
    }
    acceptOffer(credentialRecord, messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            messageContext.agentContext.config.logger.info(`Automatically sending request with autoAccept`);
            const { message } = yield this.credentialProtocol.acceptOffer(messageContext.agentContext, { credentialRecord });
            return (0, getOutboundMessageContext_1.getOutboundMessageContext)(messageContext.agentContext, {
                connectionRecord: messageContext.connection,
                message,
                associatedRecord: credentialRecord,
                lastReceivedMessage: messageContext.message,
            });
        });
    }
}
exports.V2OfferCredentialHandler = V2OfferCredentialHandler;
