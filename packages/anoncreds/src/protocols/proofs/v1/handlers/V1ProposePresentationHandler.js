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
exports.V1ProposePresentationHandler = void 0;
const core_1 = require("@aries-framework/core");
const messages_1 = require("../messages");
class V1ProposePresentationHandler {
    constructor(proofProtocol) {
        this.supportedMessages = [messages_1.V1ProposePresentationMessage];
        this.proofProtocol = proofProtocol;
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const proofRecord = yield this.proofProtocol.processProposal(messageContext);
            const shouldAutoRespond = yield this.proofProtocol.shouldAutoRespondToProposal(messageContext.agentContext, {
                proofRecord,
                proposalMessage: messageContext.message,
            });
            if (shouldAutoRespond) {
                return yield this.acceptProposal(proofRecord, messageContext);
            }
        });
    }
    acceptProposal(proofRecord, messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            messageContext.agentContext.config.logger.info(`Automatically sending request with autoAccept`);
            if (!messageContext.connection) {
                messageContext.agentContext.config.logger.error('No connection on the messageContext, aborting auto accept');
                return;
            }
            const { message } = yield this.proofProtocol.acceptProposal(messageContext.agentContext, {
                proofRecord,
            });
            return new core_1.OutboundMessageContext(message, {
                agentContext: messageContext.agentContext,
                connection: messageContext.connection,
                associatedRecord: proofRecord,
            });
        });
    }
}
exports.V1ProposePresentationHandler = V1ProposePresentationHandler;
