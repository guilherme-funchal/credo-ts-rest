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
exports.V1ProposeCredentialHandler = void 0;
const core_1 = require("@aries-framework/core");
const messages_1 = require("../messages");
class V1ProposeCredentialHandler {
    constructor(credentialProtocol) {
        this.supportedMessages = [messages_1.V1ProposeCredentialMessage];
        this.credentialProtocol = credentialProtocol;
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const credentialRecord = yield this.credentialProtocol.processProposal(messageContext);
            const shouldAutoAcceptProposal = yield this.credentialProtocol.shouldAutoRespondToProposal(messageContext.agentContext, {
                credentialRecord,
                proposalMessage: messageContext.message,
            });
            if (shouldAutoAcceptProposal) {
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
            const { message } = yield this.credentialProtocol.acceptProposal(messageContext.agentContext, {
                credentialRecord,
            });
            return (0, core_1.getOutboundMessageContext)(messageContext.agentContext, {
                message,
                connectionRecord: messageContext.connection,
                associatedRecord: credentialRecord,
            });
        });
    }
}
exports.V1ProposeCredentialHandler = V1ProposeCredentialHandler;
