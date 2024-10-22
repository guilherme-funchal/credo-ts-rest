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
exports.V1IssueCredentialHandler = void 0;
const core_1 = require("@aries-framework/core");
const messages_1 = require("../messages");
class V1IssueCredentialHandler {
    constructor(credentialProtocol) {
        this.supportedMessages = [messages_1.V1IssueCredentialMessage];
        this.credentialProtocol = credentialProtocol;
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const credentialRecord = yield this.credentialProtocol.processCredential(messageContext);
            const shouldAutoRespond = yield this.credentialProtocol.shouldAutoRespondToCredential(messageContext.agentContext, {
                credentialRecord,
                credentialMessage: messageContext.message,
            });
            if (shouldAutoRespond) {
                return yield this.acceptCredential(credentialRecord, messageContext);
            }
        });
    }
    acceptCredential(credentialRecord, messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            messageContext.agentContext.config.logger.info(`Automatically sending acknowledgement with autoAccept`);
            const { message } = yield this.credentialProtocol.acceptCredential(messageContext.agentContext, {
                credentialRecord,
            });
            const requestMessage = yield this.credentialProtocol.findRequestMessage(messageContext.agentContext, credentialRecord.id);
            if (!requestMessage) {
                throw new core_1.AriesFrameworkError(`No request message found for credential record with id '${credentialRecord.id}'`);
            }
            return (0, core_1.getOutboundMessageContext)(messageContext.agentContext, {
                connectionRecord: messageContext.connection,
                message,
                associatedRecord: credentialRecord,
                lastReceivedMessage: messageContext.message,
                lastSentMessage: requestMessage,
            });
        });
    }
}
exports.V1IssueCredentialHandler = V1IssueCredentialHandler;
