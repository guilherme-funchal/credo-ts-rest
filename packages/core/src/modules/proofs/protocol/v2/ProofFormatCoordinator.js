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
exports.ProofFormatCoordinator = void 0;
const error_1 = require("../../../../error");
const storage_1 = require("../../../../storage");
const messages_1 = require("./messages");
class ProofFormatCoordinator {
    /**
     * Create a {@link V2ProposePresentationMessage}.
     *
     * @param options
     * @returns The created {@link V2ProposePresentationMessage}
     *
     */
    createProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofFormats, formatServices, proofRecord, comment, goalCode, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            // create message. there are two arrays in each message, one for formats the other for attachments
            const formats = [];
            const proposalAttachments = [];
            for (const formatService of formatServices) {
                const { format, attachment } = yield formatService.createProposal(agentContext, {
                    proofFormats,
                    proofRecord,
                });
                proposalAttachments.push(attachment);
                formats.push(format);
            }
            const message = new messages_1.V2ProposePresentationMessage({
                id: proofRecord.threadId,
                formats,
                proposalAttachments,
                comment: comment,
                goalCode,
            });
            message.setThread({ threadId: proofRecord.threadId, parentThreadId: proofRecord.parentThreadId });
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                role: storage_1.DidCommMessageRole.Sender,
                associatedRecordId: proofRecord.id,
            });
            return message;
        });
    }
    processProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofRecord, message, formatServices, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            for (const formatService of formatServices) {
                const attachment = this.getAttachmentForService(formatService, message.formats, message.proposalAttachments);
                yield formatService.processProposal(agentContext, {
                    attachment,
                    proofRecord,
                });
            }
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                role: storage_1.DidCommMessageRole.Receiver,
                associatedRecordId: proofRecord.id,
            });
        });
    }
    acceptProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofRecord, proofFormats, formatServices, comment, goalCode, presentMultiple, willConfirm, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            // create message. there are two arrays in each message, one for formats the other for attachments
            const formats = [];
            const requestAttachments = [];
            const proposalMessage = yield didCommMessageRepository.getAgentMessage(agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: messages_1.V2ProposePresentationMessage,
            });
            for (const formatService of formatServices) {
                const proposalAttachment = this.getAttachmentForService(formatService, proposalMessage.formats, proposalMessage.proposalAttachments);
                const { attachment, format } = yield formatService.acceptProposal(agentContext, {
                    proofRecord,
                    proofFormats,
                    proposalAttachment,
                });
                requestAttachments.push(attachment);
                formats.push(format);
            }
            const message = new messages_1.V2RequestPresentationMessage({
                formats,
                requestAttachments,
                comment,
                goalCode,
                presentMultiple,
                willConfirm,
            });
            message.setThread({ threadId: proofRecord.threadId, parentThreadId: proofRecord.parentThreadId });
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                associatedRecordId: proofRecord.id,
                role: storage_1.DidCommMessageRole.Sender,
            });
            return message;
        });
    }
    /**
     * Create a {@link V2RequestPresentationMessage}.
     *
     * @param options
     * @returns The created {@link V2RequestPresentationMessage}
     *
     */
    createRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofFormats, formatServices, proofRecord, comment, goalCode, presentMultiple, willConfirm, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            // create message. there are two arrays in each message, one for formats the other for attachments
            const formats = [];
            const requestAttachments = [];
            for (const formatService of formatServices) {
                const { format, attachment } = yield formatService.createRequest(agentContext, {
                    proofFormats,
                    proofRecord,
                });
                requestAttachments.push(attachment);
                formats.push(format);
            }
            const message = new messages_1.V2RequestPresentationMessage({
                formats,
                comment,
                requestAttachments,
                goalCode,
                presentMultiple,
                willConfirm,
            });
            message.setThread({ threadId: proofRecord.threadId, parentThreadId: proofRecord.parentThreadId });
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                role: storage_1.DidCommMessageRole.Sender,
                associatedRecordId: proofRecord.id,
            });
            return message;
        });
    }
    processRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofRecord, message, formatServices, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            for (const formatService of formatServices) {
                const attachment = this.getAttachmentForService(formatService, message.formats, message.requestAttachments);
                yield formatService.processRequest(agentContext, {
                    attachment,
                    proofRecord,
                });
            }
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                role: storage_1.DidCommMessageRole.Receiver,
                associatedRecordId: proofRecord.id,
            });
        });
    }
    acceptRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofRecord, proofFormats, formatServices, comment, lastPresentation, goalCode, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            const requestMessage = yield didCommMessageRepository.getAgentMessage(agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: messages_1.V2RequestPresentationMessage,
            });
            const proposalMessage = yield didCommMessageRepository.findAgentMessage(agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: messages_1.V2ProposePresentationMessage,
            });
            // create message. there are two arrays in each message, one for formats the other for attachments
            const formats = [];
            const presentationAttachments = [];
            for (const formatService of formatServices) {
                const requestAttachment = this.getAttachmentForService(formatService, requestMessage.formats, requestMessage.requestAttachments);
                const proposalAttachment = proposalMessage
                    ? this.getAttachmentForService(formatService, proposalMessage.formats, proposalMessage.proposalAttachments)
                    : undefined;
                const { attachment, format } = yield formatService.acceptRequest(agentContext, {
                    requestAttachment,
                    proposalAttachment,
                    proofRecord,
                    proofFormats,
                });
                presentationAttachments.push(attachment);
                formats.push(format);
            }
            const message = new messages_1.V2PresentationMessage({
                formats,
                presentationAttachments,
                comment,
                lastPresentation,
                goalCode,
            });
            message.setThread({ threadId: proofRecord.threadId, parentThreadId: proofRecord.parentThreadId });
            message.setPleaseAck();
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                associatedRecordId: proofRecord.id,
                role: storage_1.DidCommMessageRole.Sender,
            });
            return message;
        });
    }
    getCredentialsForRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofRecord, proofFormats, formatServices, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            const requestMessage = yield didCommMessageRepository.getAgentMessage(agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: messages_1.V2RequestPresentationMessage,
            });
            const proposalMessage = yield didCommMessageRepository.findAgentMessage(agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: messages_1.V2ProposePresentationMessage,
            });
            const credentialsForRequest = {};
            for (const formatService of formatServices) {
                const requestAttachment = this.getAttachmentForService(formatService, requestMessage.formats, requestMessage.requestAttachments);
                const proposalAttachment = proposalMessage
                    ? this.getAttachmentForService(formatService, proposalMessage.formats, proposalMessage.proposalAttachments)
                    : undefined;
                const credentialsForFormat = yield formatService.getCredentialsForRequest(agentContext, {
                    requestAttachment,
                    proposalAttachment,
                    proofRecord,
                    proofFormats,
                });
                credentialsForRequest[formatService.formatKey] = credentialsForFormat;
            }
            return credentialsForRequest;
        });
    }
    selectCredentialsForRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofRecord, proofFormats, formatServices, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            const requestMessage = yield didCommMessageRepository.getAgentMessage(agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: messages_1.V2RequestPresentationMessage,
            });
            const proposalMessage = yield didCommMessageRepository.findAgentMessage(agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: messages_1.V2ProposePresentationMessage,
            });
            const credentialsForRequest = {};
            for (const formatService of formatServices) {
                const requestAttachment = this.getAttachmentForService(formatService, requestMessage.formats, requestMessage.requestAttachments);
                const proposalAttachment = proposalMessage
                    ? this.getAttachmentForService(formatService, proposalMessage.formats, proposalMessage.proposalAttachments)
                    : undefined;
                const credentialsForFormat = yield formatService.selectCredentialsForRequest(agentContext, {
                    requestAttachment,
                    proposalAttachment,
                    proofRecord,
                    proofFormats,
                });
                credentialsForRequest[formatService.formatKey] = credentialsForFormat;
            }
            return credentialsForRequest;
        });
    }
    processPresentation(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofRecord, message, requestMessage, formatServices, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            const formatVerificationResults = [];
            for (const formatService of formatServices) {
                const attachment = this.getAttachmentForService(formatService, message.formats, message.presentationAttachments);
                const requestAttachment = this.getAttachmentForService(formatService, requestMessage.formats, requestMessage.requestAttachments);
                const isValid = yield formatService.processPresentation(agentContext, {
                    attachment,
                    requestAttachment,
                    proofRecord,
                });
                formatVerificationResults.push(isValid);
            }
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                role: storage_1.DidCommMessageRole.Receiver,
                associatedRecordId: proofRecord.id,
            });
            return formatVerificationResults.every((isValid) => isValid === true);
        });
    }
    getAttachmentForService(credentialFormatService, formats, attachments) {
        const attachmentId = this.getAttachmentIdForService(credentialFormatService, formats);
        const attachment = attachments.find((attachment) => attachment.id === attachmentId);
        if (!attachment) {
            throw new error_1.AriesFrameworkError(`Attachment with id ${attachmentId} not found in attachments.`);
        }
        return attachment;
    }
    getAttachmentIdForService(credentialFormatService, formats) {
        const format = formats.find((format) => credentialFormatService.supportsFormat(format.format));
        if (!format)
            throw new error_1.AriesFrameworkError(`No attachment found for service ${credentialFormatService.formatKey}`);
        return format.attachmentId;
    }
}
exports.ProofFormatCoordinator = ProofFormatCoordinator;
