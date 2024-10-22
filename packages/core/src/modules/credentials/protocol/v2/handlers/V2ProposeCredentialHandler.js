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
exports.V2ProposeCredentialHandler = void 0;
const models_1 = require("../../../../../agent/models");
const V2ProposeCredentialMessage_1 = require("../messages/V2ProposeCredentialMessage");
class V2ProposeCredentialHandler {
    constructor(credentialProtocol) {
        this.supportedMessages = [V2ProposeCredentialMessage_1.V2ProposeCredentialMessage];
        this.credentialProtocol = credentialProtocol;
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const credentialRecord = yield this.credentialProtocol.processProposal(messageContext);
            const shouldAutoRespond = yield this.credentialProtocol.shouldAutoRespondToProposal(messageContext.agentContext, {
                credentialRecord,
                proposalMessage: messageContext.message,
            });
            if (shouldAutoRespond) {
                return yield this.acceptProposal(credentialRecord, messageContext);
            }
        });
    }
    acceptProposal(credentialRecord, messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            messageContext.agentContext.config.logger.info(`Automatically sending offer with autoAccept`);
            if (!messageContext.connection) {
                messageContext.agentContext.config.logger.error('No connection on the messageContext, aborting auto accept');
                return;
            }
            const { message } = yield this.credentialProtocol.acceptProposal(messageContext.agentContext, { credentialRecord });
            return new models_1.OutboundMessageContext(message, {
                agentContext: messageContext.agentContext,
                connection: messageContext.connection,
                associatedRecord: credentialRecord,
            });
        });
    }
}
exports.V2ProposeCredentialHandler = V2ProposeCredentialHandler;
