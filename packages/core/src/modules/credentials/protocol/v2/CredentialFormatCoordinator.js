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
exports.CredentialFormatCoordinator = void 0;
const AriesFrameworkError_1 = require("../../../../error/AriesFrameworkError");
const storage_1 = require("../../../../storage");
const messages_1 = require("./messages");
class CredentialFormatCoordinator {
    /**
     * Create a {@link V2ProposeCredentialMessage}.
     *
     * @param options
     * @returns The created {@link V2ProposeCredentialMessage}
     *
     */
    createProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialFormats, formatServices, credentialRecord, comment, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            // create message. there are two arrays in each message, one for formats the other for attachments
            const formats = [];
            const proposalAttachments = [];
            let credentialPreview;
            for (const formatService of formatServices) {
                const { format, attachment, previewAttributes } = yield formatService.createProposal(agentContext, {
                    credentialFormats,
                    credentialRecord,
                });
                if (previewAttributes) {
                    credentialPreview = new messages_1.V2CredentialPreview({
                        attributes: previewAttributes,
                    });
                }
                proposalAttachments.push(attachment);
                formats.push(format);
            }
            credentialRecord.credentialAttributes = credentialPreview === null || credentialPreview === void 0 ? void 0 : credentialPreview.attributes;
            const message = new messages_1.V2ProposeCredentialMessage({
                id: credentialRecord.threadId,
                formats,
                proposalAttachments,
                comment: comment,
                credentialPreview,
            });
            message.setThread({ threadId: credentialRecord.threadId, parentThreadId: credentialRecord.parentThreadId });
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                role: storage_1.DidCommMessageRole.Sender,
                associatedRecordId: credentialRecord.id,
            });
            return message;
        });
    }
    processProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialRecord, message, formatServices, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            for (const formatService of formatServices) {
                const attachment = this.getAttachmentForService(formatService, message.formats, message.proposalAttachments);
                yield formatService.processProposal(agentContext, {
                    attachment,
                    credentialRecord,
                });
            }
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                role: storage_1.DidCommMessageRole.Receiver,
                associatedRecordId: credentialRecord.id,
            });
        });
    }
    acceptProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialRecord, credentialFormats, formatServices, comment, }) {
            var _b;
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            // create message. there are two arrays in each message, one for formats the other for attachments
            const formats = [];
            const offerAttachments = [];
            let credentialPreview;
            const proposalMessage = yield didCommMessageRepository.getAgentMessage(agentContext, {
                associatedRecordId: credentialRecord.id,
                messageClass: messages_1.V2ProposeCredentialMessage,
            });
            // NOTE: We set the credential attributes from the proposal on the record as we've 'accepted' them
            // and can now use them to create the offer in the format services. It may be overwritten later on
            // if the user provided other attributes in the credentialFormats array.
            credentialRecord.credentialAttributes = (_b = proposalMessage.credentialPreview) === null || _b === void 0 ? void 0 : _b.attributes;
            for (const formatService of formatServices) {
                const proposalAttachment = this.getAttachmentForService(formatService, proposalMessage.formats, proposalMessage.proposalAttachments);
                const { attachment, format, previewAttributes } = yield formatService.acceptProposal(agentContext, {
                    credentialRecord,
                    credentialFormats,
                    proposalAttachment,
                });
                if (previewAttributes) {
                    credentialPreview = new messages_1.V2CredentialPreview({
                        attributes: previewAttributes,
                    });
                }
                offerAttachments.push(attachment);
                formats.push(format);
            }
            credentialRecord.credentialAttributes = credentialPreview === null || credentialPreview === void 0 ? void 0 : credentialPreview.attributes;
            if (!credentialPreview) {
                // If no preview attributes were provided, use a blank preview. Not all formats use this object
                // but it is required by the protocol
                credentialPreview = new messages_1.V2CredentialPreview({
                    attributes: [],
                });
            }
            const message = new messages_1.V2OfferCredentialMessage({
                formats,
                credentialPreview,
                offerAttachments,
                comment,
            });
            message.setThread({ threadId: credentialRecord.threadId, parentThreadId: credentialRecord.parentThreadId });
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                associatedRecordId: credentialRecord.id,
                role: storage_1.DidCommMessageRole.Sender,
            });
            return message;
        });
    }
    /**
     * Create a {@link V2OfferCredentialMessage}.
     *
     * @param options
     * @returns The created {@link V2OfferCredentialMessage}
     *
     */
    createOffer(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialFormats, formatServices, credentialRecord, comment, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            // create message. there are two arrays in each message, one for formats the other for attachments
            const formats = [];
            const offerAttachments = [];
            let credentialPreview;
            for (const formatService of formatServices) {
                const { format, attachment, previewAttributes } = yield formatService.createOffer(agentContext, {
                    credentialFormats,
                    credentialRecord,
                });
                if (previewAttributes) {
                    credentialPreview = new messages_1.V2CredentialPreview({
                        attributes: previewAttributes,
                    });
                }
                offerAttachments.push(attachment);
                formats.push(format);
            }
            credentialRecord.credentialAttributes = credentialPreview === null || credentialPreview === void 0 ? void 0 : credentialPreview.attributes;
            if (!credentialPreview) {
                // If no preview attributes were provided, use a blank preview. Not all formats use this object
                // but it is required by the protocol
                credentialPreview = new messages_1.V2CredentialPreview({
                    attributes: [],
                });
            }
            const message = new messages_1.V2OfferCredentialMessage({
                formats,
                comment,
                offerAttachments,
                credentialPreview,
            });
            message.setThread({ threadId: credentialRecord.threadId, parentThreadId: credentialRecord.parentThreadId });
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                role: storage_1.DidCommMessageRole.Sender,
                associatedRecordId: credentialRecord.id,
            });
            return message;
        });
    }
    processOffer(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialRecord, message, formatServices, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            for (const formatService of formatServices) {
                const attachment = this.getAttachmentForService(formatService, message.formats, message.offerAttachments);
                yield formatService.processOffer(agentContext, {
                    attachment,
                    credentialRecord,
                });
            }
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                role: storage_1.DidCommMessageRole.Receiver,
                associatedRecordId: credentialRecord.id,
            });
        });
    }
    acceptOffer(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialRecord, credentialFormats, formatServices, comment, }) {
            var _b;
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            const offerMessage = yield didCommMessageRepository.getAgentMessage(agentContext, {
                associatedRecordId: credentialRecord.id,
                messageClass: messages_1.V2OfferCredentialMessage,
            });
            // create message. there are two arrays in each message, one for formats the other for attachments
            const formats = [];
            const requestAttachments = [];
            for (const formatService of formatServices) {
                const offerAttachment = this.getAttachmentForService(formatService, offerMessage.formats, offerMessage.offerAttachments);
                const { attachment, format } = yield formatService.acceptOffer(agentContext, {
                    offerAttachment,
                    credentialRecord,
                    credentialFormats,
                });
                requestAttachments.push(attachment);
                formats.push(format);
            }
            credentialRecord.credentialAttributes = (_b = offerMessage.credentialPreview) === null || _b === void 0 ? void 0 : _b.attributes;
            const message = new messages_1.V2RequestCredentialMessage({
                formats,
                requestAttachments: requestAttachments,
                comment,
            });
            message.setThread({ threadId: credentialRecord.threadId, parentThreadId: credentialRecord.parentThreadId });
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                associatedRecordId: credentialRecord.id,
                role: storage_1.DidCommMessageRole.Sender,
            });
            return message;
        });
    }
    /**
     * Create a {@link V2RequestCredentialMessage}.
     *
     * @param options
     * @returns The created {@link V2RequestCredentialMessage}
     *
     */
    createRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialFormats, formatServices, credentialRecord, comment, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            // create message. there are two arrays in each message, one for formats the other for attachments
            const formats = [];
            const requestAttachments = [];
            for (const formatService of formatServices) {
                const { format, attachment } = yield formatService.createRequest(agentContext, {
                    credentialFormats,
                    credentialRecord,
                });
                requestAttachments.push(attachment);
                formats.push(format);
            }
            const message = new messages_1.V2RequestCredentialMessage({
                formats,
                comment,
                requestAttachments: requestAttachments,
            });
            message.setThread({ threadId: credentialRecord.threadId, parentThreadId: credentialRecord.parentThreadId });
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                role: storage_1.DidCommMessageRole.Sender,
                associatedRecordId: credentialRecord.id,
            });
            return message;
        });
    }
    processRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialRecord, message, formatServices, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            for (const formatService of formatServices) {
                const attachment = this.getAttachmentForService(formatService, message.formats, message.requestAttachments);
                yield formatService.processRequest(agentContext, {
                    attachment,
                    credentialRecord,
                });
            }
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                role: storage_1.DidCommMessageRole.Receiver,
                associatedRecordId: credentialRecord.id,
            });
        });
    }
    acceptRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialRecord, credentialFormats, formatServices, comment, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            const requestMessage = yield didCommMessageRepository.getAgentMessage(agentContext, {
                associatedRecordId: credentialRecord.id,
                messageClass: messages_1.V2RequestCredentialMessage,
            });
            const offerMessage = yield didCommMessageRepository.findAgentMessage(agentContext, {
                associatedRecordId: credentialRecord.id,
                messageClass: messages_1.V2OfferCredentialMessage,
            });
            // create message. there are two arrays in each message, one for formats the other for attachments
            const formats = [];
            const credentialAttachments = [];
            for (const formatService of formatServices) {
                const requestAttachment = this.getAttachmentForService(formatService, requestMessage.formats, requestMessage.requestAttachments);
                const offerAttachment = offerMessage
                    ? this.getAttachmentForService(formatService, offerMessage.formats, offerMessage.offerAttachments)
                    : undefined;
                const { attachment, format } = yield formatService.acceptRequest(agentContext, {
                    requestAttachment,
                    offerAttachment,
                    credentialRecord,
                    credentialFormats,
                });
                credentialAttachments.push(attachment);
                formats.push(format);
            }
            const message = new messages_1.V2IssueCredentialMessage({
                formats,
                credentialAttachments: credentialAttachments,
                comment,
            });
            message.setThread({ threadId: credentialRecord.threadId, parentThreadId: credentialRecord.parentThreadId });
            message.setPleaseAck();
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                associatedRecordId: credentialRecord.id,
                role: storage_1.DidCommMessageRole.Sender,
            });
            return message;
        });
    }
    processCredential(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialRecord, message, requestMessage, formatServices, }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            for (const formatService of formatServices) {
                const attachment = this.getAttachmentForService(formatService, message.formats, message.credentialAttachments);
                const requestAttachment = this.getAttachmentForService(formatService, requestMessage.formats, requestMessage.requestAttachments);
                yield formatService.processCredential(agentContext, {
                    attachment,
                    requestAttachment,
                    credentialRecord,
                });
            }
            yield didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: message,
                role: storage_1.DidCommMessageRole.Receiver,
                associatedRecordId: credentialRecord.id,
            });
        });
    }
    getAttachmentForService(credentialFormatService, formats, attachments) {
        const attachmentId = this.getAttachmentIdForService(credentialFormatService, formats);
        const attachment = attachments.find((attachment) => attachment.id === attachmentId);
        if (!attachment) {
            throw new AriesFrameworkError_1.AriesFrameworkError(`Attachment with id ${attachmentId} not found in attachments.`);
        }
        return attachment;
    }
    getAttachmentIdForService(credentialFormatService, formats) {
        const format = formats.find((format) => credentialFormatService.supportsFormat(format.format));
        if (!format)
            throw new AriesFrameworkError_1.AriesFrameworkError(`No attachment found for service ${credentialFormatService.formatKey}`);
        return format.attachmentId;
    }
}
exports.CredentialFormatCoordinator = CredentialFormatCoordinator;
