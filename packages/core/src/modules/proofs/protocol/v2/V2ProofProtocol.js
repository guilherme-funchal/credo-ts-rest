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
exports.V2ProofProtocol = void 0;
const models_1 = require("../../../../agent/models");
const error_1 = require("../../../../error");
const storage_1 = require("../../../../storage");
const uuid_1 = require("../../../../utils/uuid");
const common_1 = require("../../../common");
const connections_1 = require("../../../connections");
const credentials_1 = require("../../../credentials");
const ProofsModuleConfig_1 = require("../../ProofsModuleConfig");
const PresentationProblemReportReason_1 = require("../../errors/PresentationProblemReportReason");
const models_2 = require("../../models");
const repository_1 = require("../../repository");
const composeAutoAccept_1 = require("../../utils/composeAutoAccept");
const BaseProofProtocol_1 = require("../BaseProofProtocol");
const ProofFormatCoordinator_1 = require("./ProofFormatCoordinator");
const V2PresentationAckHandler_1 = require("./handlers/V2PresentationAckHandler");
const V2PresentationHandler_1 = require("./handlers/V2PresentationHandler");
const V2PresentationProblemReportHandler_1 = require("./handlers/V2PresentationProblemReportHandler");
const V2ProposePresentationHandler_1 = require("./handlers/V2ProposePresentationHandler");
const V2RequestPresentationHandler_1 = require("./handlers/V2RequestPresentationHandler");
const messages_1 = require("./messages");
const V2PresentationMessage_1 = require("./messages/V2PresentationMessage");
const V2PresentationProblemReportMessage_1 = require("./messages/V2PresentationProblemReportMessage");
const V2ProposePresentationMessage_1 = require("./messages/V2ProposePresentationMessage");
class V2ProofProtocol extends BaseProofProtocol_1.BaseProofProtocol {
    constructor({ proofFormats }) {
        super();
        this.proofFormatCoordinator = new ProofFormatCoordinator_1.ProofFormatCoordinator();
        /**
         * The version of the present proof protocol this service supports
         */
        this.version = 'v2';
        this.proofFormats = proofFormats;
    }
    register(dependencyManager, featureRegistry) {
        // Register message handlers for the Present Proof V2 Protocol
        dependencyManager.registerMessageHandlers([
            new V2ProposePresentationHandler_1.V2ProposePresentationHandler(this),
            new V2RequestPresentationHandler_1.V2RequestPresentationHandler(this),
            new V2PresentationHandler_1.V2PresentationHandler(this),
            new V2PresentationAckHandler_1.V2PresentationAckHandler(this),
            new V2PresentationProblemReportHandler_1.V2PresentationProblemReportHandler(this),
        ]);
        // Register Present Proof V2 in feature registry, with supported roles
        featureRegistry.register(new models_1.Protocol({
            id: 'https://didcomm.org/present-proof/2.0',
            roles: ['prover', 'verifier'],
        }));
    }
    createProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { connectionRecord, proofFormats, comment, autoAcceptProof, goalCode, parentThreadId, }) {
            const proofRepository = agentContext.dependencyManager.resolve(repository_1.ProofRepository);
            const formatServices = this.getFormatServices(proofFormats);
            if (formatServices.length === 0) {
                throw new error_1.AriesFrameworkError(`Unable to create proposal. No supported formats`);
            }
            const proofRecord = new repository_1.ProofExchangeRecord({
                connectionId: connectionRecord.id,
                threadId: (0, uuid_1.uuid)(),
                parentThreadId,
                state: models_2.ProofState.ProposalSent,
                protocolVersion: 'v2',
                autoAcceptProof,
            });
            const proposalMessage = yield this.proofFormatCoordinator.createProposal(agentContext, {
                proofFormats,
                proofRecord,
                formatServices,
                comment,
                goalCode,
            });
            agentContext.config.logger.debug('Save record and emit state change event');
            yield proofRepository.save(agentContext, proofRecord);
            this.emitStateChangedEvent(agentContext, proofRecord, null);
            return {
                proofRecord,
                message: proposalMessage,
            };
        });
    }
    /**
     * Method called by {@link V2ProposeCredentialHandler} on reception of a propose presentation message
     * We do the necessary processing here to accept the proposal and do the state change, emit event etc.
     * @param messageContext the inbound propose presentation message
     * @returns proof record appropriate for this incoming message (once accepted)
     */
    processProposal(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { message: proposalMessage, connection, agentContext } = messageContext;
            agentContext.config.logger.debug(`Processing presentation proposal with id ${proposalMessage.id}`);
            const proofRepository = agentContext.dependencyManager.resolve(repository_1.ProofRepository);
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            const connectionService = agentContext.dependencyManager.resolve(connections_1.ConnectionService);
            let proofRecord = yield this.findByThreadAndConnectionId(messageContext.agentContext, proposalMessage.threadId, connection === null || connection === void 0 ? void 0 : connection.id);
            const formatServices = this.getFormatServicesFromMessage(proposalMessage.formats);
            if (formatServices.length === 0) {
                throw new error_1.AriesFrameworkError(`Unable to process proposal. No supported formats`);
            }
            // credential record already exists
            if (proofRecord) {
                const lastReceivedMessage = yield didCommMessageRepository.findAgentMessage(messageContext.agentContext, {
                    associatedRecordId: proofRecord.id,
                    messageClass: V2ProposePresentationMessage_1.V2ProposePresentationMessage,
                });
                const lastSentMessage = yield didCommMessageRepository.findAgentMessage(messageContext.agentContext, {
                    associatedRecordId: proofRecord.id,
                    messageClass: messages_1.V2RequestPresentationMessage,
                });
                // Assert
                proofRecord.assertProtocolVersion('v2');
                proofRecord.assertState(models_2.ProofState.RequestSent);
                yield connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
                    lastReceivedMessage,
                    lastSentMessage,
                });
                yield this.proofFormatCoordinator.processProposal(messageContext.agentContext, {
                    proofRecord,
                    formatServices,
                    message: proposalMessage,
                });
                yield this.updateState(messageContext.agentContext, proofRecord, models_2.ProofState.ProposalReceived);
                return proofRecord;
            }
            else {
                // Assert
                yield connectionService.assertConnectionOrOutOfBandExchange(messageContext);
                // No proof record exists with thread id
                proofRecord = new repository_1.ProofExchangeRecord({
                    connectionId: connection === null || connection === void 0 ? void 0 : connection.id,
                    threadId: proposalMessage.threadId,
                    state: models_2.ProofState.ProposalReceived,
                    protocolVersion: 'v2',
                    parentThreadId: (_a = proposalMessage.thread) === null || _a === void 0 ? void 0 : _a.parentThreadId,
                });
                yield this.proofFormatCoordinator.processProposal(messageContext.agentContext, {
                    proofRecord,
                    formatServices,
                    message: proposalMessage,
                });
                // Save record and emit event
                yield proofRepository.save(messageContext.agentContext, proofRecord);
                this.emitStateChangedEvent(messageContext.agentContext, proofRecord, null);
                return proofRecord;
            }
        });
    }
    acceptProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofRecord, proofFormats, autoAcceptProof, comment, goalCode, willConfirm }) {
            // Assert
            proofRecord.assertProtocolVersion('v2');
            proofRecord.assertState(models_2.ProofState.ProposalReceived);
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            // Use empty proofFormats if not provided to denote all formats should be accepted
            let formatServices = this.getFormatServices(proofFormats !== null && proofFormats !== void 0 ? proofFormats : {});
            // if no format services could be extracted from the proofFormats
            // take all available format services from the proposal message
            if (formatServices.length === 0) {
                const proposalMessage = yield didCommMessageRepository.getAgentMessage(agentContext, {
                    associatedRecordId: proofRecord.id,
                    messageClass: V2ProposePresentationMessage_1.V2ProposePresentationMessage,
                });
                formatServices = this.getFormatServicesFromMessage(proposalMessage.formats);
            }
            // If the format services list is still empty, throw an error as we don't support any
            // of the formats
            if (formatServices.length === 0) {
                throw new error_1.AriesFrameworkError(`Unable to accept proposal. No supported formats provided as input or in proposal message`);
            }
            const requestMessage = yield this.proofFormatCoordinator.acceptProposal(agentContext, {
                proofRecord,
                formatServices,
                comment,
                proofFormats,
                goalCode,
                willConfirm,
                // Not supported at the moment
                presentMultiple: false,
            });
            proofRecord.autoAcceptProof = autoAcceptProof !== null && autoAcceptProof !== void 0 ? autoAcceptProof : proofRecord.autoAcceptProof;
            yield this.updateState(agentContext, proofRecord, models_2.ProofState.RequestSent);
            return { proofRecord, message: requestMessage };
        });
    }
    /**
     * Negotiate a proof proposal as verifier (by sending a proof request message) to the connection
     * associated with the proof record.
     *
     * @param options configuration for the request see {@link NegotiateProofProposalOptions}
     * @returns Proof exchange record associated with the proof request
     *
     */
    negotiateProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofRecord, proofFormats, autoAcceptProof, comment, goalCode, willConfirm }) {
            // Assert
            proofRecord.assertProtocolVersion('v2');
            proofRecord.assertState(models_2.ProofState.ProposalReceived);
            if (!proofRecord.connectionId) {
                throw new error_1.AriesFrameworkError(`No connectionId found for proof record '${proofRecord.id}'. Connection-less verification does not support negotiation.`);
            }
            const formatServices = this.getFormatServices(proofFormats);
            if (formatServices.length === 0) {
                throw new error_1.AriesFrameworkError(`Unable to create request. No supported formats`);
            }
            const requestMessage = yield this.proofFormatCoordinator.createRequest(agentContext, {
                formatServices,
                proofFormats,
                proofRecord,
                comment,
                goalCode,
                willConfirm,
                // Not supported at the moment
                presentMultiple: false,
            });
            proofRecord.autoAcceptProof = autoAcceptProof !== null && autoAcceptProof !== void 0 ? autoAcceptProof : proofRecord.autoAcceptProof;
            yield this.updateState(agentContext, proofRecord, models_2.ProofState.RequestSent);
            return { proofRecord, message: requestMessage };
        });
    }
    /**
     * Create a {@link V2RequestPresentationMessage} as beginning of protocol process.
     * @returns Object containing request message and associated credential record
     *
     */
    createRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofFormats, autoAcceptProof, comment, connectionRecord, parentThreadId, goalCode, willConfirm, }) {
            const proofRepository = agentContext.dependencyManager.resolve(repository_1.ProofRepository);
            const formatServices = this.getFormatServices(proofFormats);
            if (formatServices.length === 0) {
                throw new error_1.AriesFrameworkError(`Unable to create request. No supported formats`);
            }
            const proofRecord = new repository_1.ProofExchangeRecord({
                connectionId: connectionRecord === null || connectionRecord === void 0 ? void 0 : connectionRecord.id,
                threadId: (0, uuid_1.uuid)(),
                state: models_2.ProofState.RequestSent,
                autoAcceptProof,
                protocolVersion: 'v2',
                parentThreadId,
            });
            const requestMessage = yield this.proofFormatCoordinator.createRequest(agentContext, {
                formatServices,
                proofFormats,
                proofRecord,
                comment,
                goalCode,
                willConfirm,
            });
            agentContext.config.logger.debug(`Saving record and emitting state changed for proof exchange record ${proofRecord.id}`);
            yield proofRepository.save(agentContext, proofRecord);
            this.emitStateChangedEvent(agentContext, proofRecord, null);
            return { proofRecord, message: requestMessage };
        });
    }
    /**
     * Process a received {@link V2RequestPresentationMessage}. This will not accept the proof request
     * or send a proof. It will only update the existing proof record with
     * the information from the proof request message. Use {@link createCredential}
     * after calling this method to create a proof.
     *z
     * @param messageContext The message context containing a v2 proof request message
     * @returns proof record associated with the proof request message
     *
     */
    processRequest(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { message: requestMessage, connection, agentContext } = messageContext;
            const proofRepository = agentContext.dependencyManager.resolve(repository_1.ProofRepository);
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            const connectionService = agentContext.dependencyManager.resolve(connections_1.ConnectionService);
            agentContext.config.logger.debug(`Processing proof request with id ${requestMessage.id}`);
            let proofRecord = yield this.findByThreadAndConnectionId(messageContext.agentContext, requestMessage.threadId, connection === null || connection === void 0 ? void 0 : connection.id);
            const formatServices = this.getFormatServicesFromMessage(requestMessage.formats);
            if (formatServices.length === 0) {
                throw new error_1.AriesFrameworkError(`Unable to process request. No supported formats`);
            }
            // proof record already exists
            if (proofRecord) {
                const lastSentMessage = yield didCommMessageRepository.findAgentMessage(messageContext.agentContext, {
                    associatedRecordId: proofRecord.id,
                    messageClass: credentials_1.V2ProposeCredentialMessage,
                });
                const lastReceivedMessage = yield didCommMessageRepository.findAgentMessage(messageContext.agentContext, {
                    associatedRecordId: proofRecord.id,
                    messageClass: messages_1.V2RequestPresentationMessage,
                });
                // Assert
                proofRecord.assertProtocolVersion('v2');
                proofRecord.assertState(models_2.ProofState.ProposalSent);
                yield connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
                    lastReceivedMessage,
                    lastSentMessage,
                });
                yield this.proofFormatCoordinator.processRequest(messageContext.agentContext, {
                    proofRecord,
                    formatServices,
                    message: requestMessage,
                });
                yield this.updateState(messageContext.agentContext, proofRecord, models_2.ProofState.RequestReceived);
                return proofRecord;
            }
            else {
                // Assert
                yield connectionService.assertConnectionOrOutOfBandExchange(messageContext);
                // No proof record exists with thread id
                agentContext.config.logger.debug('No proof record found for request, creating a new one');
                proofRecord = new repository_1.ProofExchangeRecord({
                    connectionId: connection === null || connection === void 0 ? void 0 : connection.id,
                    threadId: requestMessage.threadId,
                    state: models_2.ProofState.RequestReceived,
                    protocolVersion: 'v2',
                    parentThreadId: (_a = requestMessage.thread) === null || _a === void 0 ? void 0 : _a.parentThreadId,
                });
                yield this.proofFormatCoordinator.processRequest(messageContext.agentContext, {
                    proofRecord,
                    formatServices,
                    message: requestMessage,
                });
                // Save in repository
                agentContext.config.logger.debug('Saving proof record and emit request-received event');
                yield proofRepository.save(messageContext.agentContext, proofRecord);
                this.emitStateChangedEvent(messageContext.agentContext, proofRecord, null);
                return proofRecord;
            }
        });
    }
    acceptRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofRecord, autoAcceptProof, comment, proofFormats, goalCode }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            // Assert
            proofRecord.assertProtocolVersion('v2');
            proofRecord.assertState(models_2.ProofState.RequestReceived);
            // Use empty proofFormats if not provided to denote all formats should be accepted
            let formatServices = this.getFormatServices(proofFormats !== null && proofFormats !== void 0 ? proofFormats : {});
            // if no format services could be extracted from the proofFormats
            // take all available format services from the request message
            if (formatServices.length === 0) {
                const requestMessage = yield didCommMessageRepository.getAgentMessage(agentContext, {
                    associatedRecordId: proofRecord.id,
                    messageClass: messages_1.V2RequestPresentationMessage,
                });
                formatServices = this.getFormatServicesFromMessage(requestMessage.formats);
            }
            // If the format services list is still empty, throw an error as we don't support any
            // of the formats
            if (formatServices.length === 0) {
                throw new error_1.AriesFrameworkError(`Unable to accept request. No supported formats provided as input or in request message`);
            }
            const message = yield this.proofFormatCoordinator.acceptRequest(agentContext, {
                proofRecord,
                formatServices,
                comment,
                proofFormats,
                goalCode,
                // Sending multiple presentation messages not supported at the moment
                lastPresentation: true,
            });
            proofRecord.autoAcceptProof = autoAcceptProof !== null && autoAcceptProof !== void 0 ? autoAcceptProof : proofRecord.autoAcceptProof;
            yield this.updateState(agentContext, proofRecord, models_2.ProofState.PresentationSent);
            return { proofRecord, message };
        });
    }
    /**
     * Create a {@link V2ProposePresentationMessage} as response to a received credential request.
     * To create a proposal not bound to an existing proof exchange, use {@link createProposal}.
     *
     * @param options configuration to use for the proposal
     * @returns Object containing proposal message and associated proof record
     *
     */
    negotiateRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofRecord, proofFormats, autoAcceptProof, comment, goalCode }) {
            // Assert
            proofRecord.assertProtocolVersion('v2');
            proofRecord.assertState(models_2.ProofState.RequestReceived);
            if (!proofRecord.connectionId) {
                throw new error_1.AriesFrameworkError(`No connectionId found for proof record '${proofRecord.id}'. Connection-less verification does not support negotiation.`);
            }
            const formatServices = this.getFormatServices(proofFormats);
            if (formatServices.length === 0) {
                throw new error_1.AriesFrameworkError(`Unable to create proposal. No supported formats`);
            }
            const proposalMessage = yield this.proofFormatCoordinator.createProposal(agentContext, {
                formatServices,
                proofFormats,
                proofRecord,
                comment,
                goalCode,
            });
            proofRecord.autoAcceptProof = autoAcceptProof !== null && autoAcceptProof !== void 0 ? autoAcceptProof : proofRecord.autoAcceptProof;
            yield this.updateState(agentContext, proofRecord, models_2.ProofState.ProposalSent);
            return { proofRecord, message: proposalMessage };
        });
    }
    getCredentialsForRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofRecord, proofFormats }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            // Assert
            proofRecord.assertProtocolVersion('v2');
            proofRecord.assertState(models_2.ProofState.RequestReceived);
            // Use empty proofFormats if not provided to denote all formats should be accepted
            let formatServices = this.getFormatServices(proofFormats !== null && proofFormats !== void 0 ? proofFormats : {});
            // if no format services could be extracted from the proofFormats
            // take all available format services from the request message
            if (formatServices.length === 0) {
                const requestMessage = yield didCommMessageRepository.getAgentMessage(agentContext, {
                    associatedRecordId: proofRecord.id,
                    messageClass: messages_1.V2RequestPresentationMessage,
                });
                formatServices = this.getFormatServicesFromMessage(requestMessage.formats);
            }
            // If the format services list is still empty, throw an error as we don't support any
            // of the formats
            if (formatServices.length === 0) {
                throw new error_1.AriesFrameworkError(`Unable to get credentials for request. No supported formats provided as input or in request message`);
            }
            const result = yield this.proofFormatCoordinator.getCredentialsForRequest(agentContext, {
                formatServices,
                proofFormats,
                proofRecord,
            });
            return {
                proofFormats: result,
            };
        });
    }
    selectCredentialsForRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofRecord, proofFormats }) {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            // Assert
            proofRecord.assertProtocolVersion('v2');
            proofRecord.assertState(models_2.ProofState.RequestReceived);
            // Use empty proofFormats if not provided to denote all formats should be accepted
            let formatServices = this.getFormatServices(proofFormats !== null && proofFormats !== void 0 ? proofFormats : {});
            // if no format services could be extracted from the proofFormats
            // take all available format services from the request message
            if (formatServices.length === 0) {
                const requestMessage = yield didCommMessageRepository.getAgentMessage(agentContext, {
                    associatedRecordId: proofRecord.id,
                    messageClass: messages_1.V2RequestPresentationMessage,
                });
                formatServices = this.getFormatServicesFromMessage(requestMessage.formats);
            }
            // If the format services list is still empty, throw an error as we don't support any
            // of the formats
            if (formatServices.length === 0) {
                throw new error_1.AriesFrameworkError(`Unable to get credentials for request. No supported formats provided as input or in request message`);
            }
            const result = yield this.proofFormatCoordinator.selectCredentialsForRequest(agentContext, {
                formatServices,
                proofFormats,
                proofRecord,
            });
            return {
                proofFormats: result,
            };
        });
    }
    processPresentation(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const { message: presentationMessage, connection, agentContext } = messageContext;
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            const connectionService = agentContext.dependencyManager.resolve(connections_1.ConnectionService);
            agentContext.config.logger.debug(`Processing presentation with id ${presentationMessage.id}`);
            const proofRecord = yield this.getByThreadAndConnectionId(messageContext.agentContext, presentationMessage.threadId);
            const lastSentMessage = yield didCommMessageRepository.getAgentMessage(messageContext.agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: messages_1.V2RequestPresentationMessage,
            });
            const lastReceivedMessage = yield didCommMessageRepository.findAgentMessage(messageContext.agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: V2ProposePresentationMessage_1.V2ProposePresentationMessage,
            });
            // Assert
            proofRecord.assertProtocolVersion('v2');
            proofRecord.assertState(models_2.ProofState.RequestSent);
            yield connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
                lastReceivedMessage,
                lastSentMessage,
            });
            // This makes sure that the sender of the incoming message is authorized to do so.
            if (!proofRecord.connectionId) {
                yield connectionService.matchIncomingMessageToRequestMessageInOutOfBandExchange(messageContext, {
                    expectedConnectionId: proofRecord.connectionId,
                });
                proofRecord.connectionId = connection === null || connection === void 0 ? void 0 : connection.id;
            }
            const formatServices = this.getFormatServicesFromMessage(presentationMessage.formats);
            if (formatServices.length === 0) {
                throw new error_1.AriesFrameworkError(`Unable to process presentation. No supported formats`);
            }
            const isValid = yield this.proofFormatCoordinator.processPresentation(messageContext.agentContext, {
                proofRecord,
                formatServices,
                requestMessage: lastSentMessage,
                message: presentationMessage,
            });
            proofRecord.isVerified = isValid;
            yield this.updateState(messageContext.agentContext, proofRecord, models_2.ProofState.PresentationReceived);
            return proofRecord;
        });
    }
    acceptPresentation(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofRecord }) {
            proofRecord.assertProtocolVersion('v2');
            proofRecord.assertState(models_2.ProofState.PresentationReceived);
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            // assert we've received the final presentation
            const presentation = yield didCommMessageRepository.getAgentMessage(agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: V2PresentationMessage_1.V2PresentationMessage,
            });
            if (!presentation.lastPresentation) {
                throw new error_1.AriesFrameworkError(`Trying to send an ack message while presentation with id ${presentation.id} indicates this is not the last presentation (presentation.last_presentation is set to false)`);
            }
            const message = new messages_1.V2PresentationAckMessage({
                threadId: proofRecord.threadId,
                status: common_1.AckStatus.OK,
            });
            message.setThread({
                threadId: proofRecord.threadId,
                parentThreadId: proofRecord.parentThreadId,
            });
            yield this.updateState(agentContext, proofRecord, models_2.ProofState.Done);
            return {
                message,
                proofRecord,
            };
        });
    }
    processAck(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const { message: ackMessage, connection, agentContext } = messageContext;
            agentContext.config.logger.debug(`Processing proof ack with id ${ackMessage.id}`);
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            const connectionService = agentContext.dependencyManager.resolve(connections_1.ConnectionService);
            const proofRecord = yield this.getByThreadAndConnectionId(messageContext.agentContext, ackMessage.threadId, connection === null || connection === void 0 ? void 0 : connection.id);
            proofRecord.connectionId = connection === null || connection === void 0 ? void 0 : connection.id;
            const lastReceivedMessage = yield didCommMessageRepository.getAgentMessage(messageContext.agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: messages_1.V2RequestPresentationMessage,
            });
            const lastSentMessage = yield didCommMessageRepository.getAgentMessage(messageContext.agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: V2PresentationMessage_1.V2PresentationMessage,
            });
            // Assert
            proofRecord.assertProtocolVersion('v2');
            proofRecord.assertState(models_2.ProofState.PresentationSent);
            yield connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
                lastReceivedMessage,
                lastSentMessage,
            });
            // Update record
            yield this.updateState(messageContext.agentContext, proofRecord, models_2.ProofState.Done);
            return proofRecord;
        });
    }
    createProblemReport(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { description, proofRecord }) {
            const message = new V2PresentationProblemReportMessage_1.V2PresentationProblemReportMessage({
                description: {
                    en: description,
                    code: PresentationProblemReportReason_1.PresentationProblemReportReason.Abandoned,
                },
            });
            message.setThread({
                threadId: proofRecord.threadId,
                parentThreadId: proofRecord.parentThreadId,
            });
            return {
                proofRecord,
                message,
            };
        });
    }
    shouldAutoRespondToProposal(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { proofRecord, proposalMessage } = options;
            const proofsModuleConfig = agentContext.dependencyManager.resolve(ProofsModuleConfig_1.ProofsModuleConfig);
            const autoAccept = (0, composeAutoAccept_1.composeAutoAccept)(proofRecord.autoAcceptProof, proofsModuleConfig.autoAcceptProofs);
            // Handle always / never cases
            if (autoAccept === models_2.AutoAcceptProof.Always)
                return true;
            if (autoAccept === models_2.AutoAcceptProof.Never)
                return false;
            const requestMessage = yield this.findRequestMessage(agentContext, proofRecord.id);
            if (!requestMessage)
                return false;
            // NOTE: we take the formats from the requestMessage so we always check all services that we last sent
            // Otherwise we'll only check the formats from the proposal, which could be different from the formats
            // we use.
            const formatServices = this.getFormatServicesFromMessage(requestMessage.formats);
            for (const formatService of formatServices) {
                const requestAttachment = this.proofFormatCoordinator.getAttachmentForService(formatService, requestMessage.formats, requestMessage.requestAttachments);
                const proposalAttachment = this.proofFormatCoordinator.getAttachmentForService(formatService, proposalMessage.formats, proposalMessage.proposalAttachments);
                const shouldAutoRespondToFormat = yield formatService.shouldAutoRespondToProposal(agentContext, {
                    proofRecord,
                    requestAttachment,
                    proposalAttachment,
                });
                // If any of the formats return false, we should not auto accept
                if (!shouldAutoRespondToFormat)
                    return false;
            }
            return true;
        });
    }
    shouldAutoRespondToRequest(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { proofRecord, requestMessage } = options;
            const proofsModuleConfig = agentContext.dependencyManager.resolve(ProofsModuleConfig_1.ProofsModuleConfig);
            const autoAccept = (0, composeAutoAccept_1.composeAutoAccept)(proofRecord.autoAcceptProof, proofsModuleConfig.autoAcceptProofs);
            // Handle always / never cases
            if (autoAccept === models_2.AutoAcceptProof.Always)
                return true;
            if (autoAccept === models_2.AutoAcceptProof.Never)
                return false;
            const proposalMessage = yield this.findProposalMessage(agentContext, proofRecord.id);
            if (!proposalMessage)
                return false;
            // NOTE: we take the formats from the proposalMessage so we always check all services that we last sent
            // Otherwise we'll only check the formats from the request, which could be different from the formats
            // we use.
            const formatServices = this.getFormatServicesFromMessage(proposalMessage.formats);
            for (const formatService of formatServices) {
                const proposalAttachment = this.proofFormatCoordinator.getAttachmentForService(formatService, proposalMessage.formats, proposalMessage.proposalAttachments);
                const requestAttachment = this.proofFormatCoordinator.getAttachmentForService(formatService, requestMessage.formats, requestMessage.requestAttachments);
                const shouldAutoRespondToFormat = yield formatService.shouldAutoRespondToRequest(agentContext, {
                    proofRecord,
                    requestAttachment,
                    proposalAttachment,
                });
                // If any of the formats return false, we should not auto accept
                if (!shouldAutoRespondToFormat)
                    return false;
            }
            return true;
        });
    }
    shouldAutoRespondToPresentation(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { proofRecord, presentationMessage } = options;
            const proofsModuleConfig = agentContext.dependencyManager.resolve(ProofsModuleConfig_1.ProofsModuleConfig);
            // If this isn't the last presentation yet, we should not auto accept
            if (!presentationMessage.lastPresentation)
                return false;
            const autoAccept = (0, composeAutoAccept_1.composeAutoAccept)(proofRecord.autoAcceptProof, proofsModuleConfig.autoAcceptProofs);
            // Handle always / never cases
            if (autoAccept === models_2.AutoAcceptProof.Always)
                return true;
            if (autoAccept === models_2.AutoAcceptProof.Never)
                return false;
            const proposalMessage = yield this.findProposalMessage(agentContext, proofRecord.id);
            const requestMessage = yield this.findRequestMessage(agentContext, proofRecord.id);
            if (!requestMessage)
                return false;
            if (!requestMessage.willConfirm)
                return false;
            // NOTE: we take the formats from the requestMessage so we always check all services that we last sent
            // Otherwise we'll only check the formats from the credential, which could be different from the formats
            // we use.
            const formatServices = this.getFormatServicesFromMessage(requestMessage.formats);
            for (const formatService of formatServices) {
                const proposalAttachment = proposalMessage
                    ? this.proofFormatCoordinator.getAttachmentForService(formatService, proposalMessage.formats, proposalMessage.proposalAttachments)
                    : undefined;
                const requestAttachment = this.proofFormatCoordinator.getAttachmentForService(formatService, requestMessage.formats, requestMessage.requestAttachments);
                const presentationAttachment = this.proofFormatCoordinator.getAttachmentForService(formatService, presentationMessage.formats, presentationMessage.presentationAttachments);
                const shouldAutoRespondToFormat = yield formatService.shouldAutoRespondToPresentation(agentContext, {
                    proofRecord,
                    presentationAttachment,
                    requestAttachment,
                    proposalAttachment,
                });
                // If any of the formats return false, we should not auto accept
                if (!shouldAutoRespondToFormat)
                    return false;
            }
            return true;
        });
    }
    findRequestMessage(agentContext, proofRecordId) {
        return __awaiter(this, void 0, void 0, function* () {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            return yield didCommMessageRepository.findAgentMessage(agentContext, {
                associatedRecordId: proofRecordId,
                messageClass: messages_1.V2RequestPresentationMessage,
            });
        });
    }
    findPresentationMessage(agentContext, proofRecordId) {
        return __awaiter(this, void 0, void 0, function* () {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            return yield didCommMessageRepository.findAgentMessage(agentContext, {
                associatedRecordId: proofRecordId,
                messageClass: V2PresentationMessage_1.V2PresentationMessage,
            });
        });
    }
    findProposalMessage(agentContext, proofRecordId) {
        return __awaiter(this, void 0, void 0, function* () {
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            return yield didCommMessageRepository.findAgentMessage(agentContext, {
                associatedRecordId: proofRecordId,
                messageClass: V2ProposePresentationMessage_1.V2ProposePresentationMessage,
            });
        });
    }
    getFormatData(agentContext, proofRecordId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: we could looking at fetching all record using a single query and then filtering based on the type of the message.
            const [proposalMessage, requestMessage, presentationMessage] = yield Promise.all([
                this.findProposalMessage(agentContext, proofRecordId),
                this.findRequestMessage(agentContext, proofRecordId),
                this.findPresentationMessage(agentContext, proofRecordId),
            ]);
            // Create object with the keys and the message formats/attachments. We can then loop over this in a generic
            // way so we don't have to add the same operation code four times
            const messages = {
                proposal: [proposalMessage === null || proposalMessage === void 0 ? void 0 : proposalMessage.formats, proposalMessage === null || proposalMessage === void 0 ? void 0 : proposalMessage.proposalAttachments],
                request: [requestMessage === null || requestMessage === void 0 ? void 0 : requestMessage.formats, requestMessage === null || requestMessage === void 0 ? void 0 : requestMessage.requestAttachments],
                presentation: [presentationMessage === null || presentationMessage === void 0 ? void 0 : presentationMessage.formats, presentationMessage === null || presentationMessage === void 0 ? void 0 : presentationMessage.presentationAttachments],
            };
            const formatData = {};
            // We loop through all of the message keys as defined above
            for (const [messageKey, [formats, attachments]] of Object.entries(messages)) {
                // Message can be undefined, so we continue if it is not defined
                if (!formats || !attachments)
                    continue;
                // Find all format services associated with the message
                const formatServices = this.getFormatServicesFromMessage(formats);
                const messageFormatData = {};
                // Loop through all of the format services, for each we will extract the attachment data and assign this to the object
                // using the unique format key (e.g. indy)
                for (const formatService of formatServices) {
                    const attachment = this.proofFormatCoordinator.getAttachmentForService(formatService, formats, attachments);
                    messageFormatData[formatService.formatKey] = attachment.getDataAsJson();
                }
                formatData[messageKey] = messageFormatData;
            }
            return formatData;
        });
    }
    /**
     * Get all the format service objects for a given proof format from an incoming message
     * @param messageFormats the format objects containing the format name (eg indy)
     * @return the proof format service objects in an array - derived from format object keys
     */
    getFormatServicesFromMessage(messageFormats) {
        const formatServices = new Set();
        for (const msg of messageFormats) {
            const service = this.getFormatServiceForFormat(msg.format);
            if (service)
                formatServices.add(service);
        }
        return Array.from(formatServices);
    }
    /**
     * Get all the format service objects for a given proof format
     * @param proofFormats the format object containing various optional parameters
     * @return the proof format service objects in an array - derived from format object keys
     */
    getFormatServices(proofFormats) {
        const formats = new Set();
        for (const formatKey of Object.keys(proofFormats)) {
            const formatService = this.getFormatServiceForFormatKey(formatKey);
            if (formatService)
                formats.add(formatService);
        }
        return Array.from(formats);
    }
    getFormatServiceForFormatKey(formatKey) {
        const formatService = this.proofFormats.find((proofFormats) => proofFormats.formatKey === formatKey);
        return formatService !== null && formatService !== void 0 ? formatService : null;
    }
    getFormatServiceForFormat(format) {
        const formatService = this.proofFormats.find((proofFormats) => proofFormats.supportsFormat(format));
        return formatService !== null && formatService !== void 0 ? formatService : null;
    }
}
exports.V2ProofProtocol = V2ProofProtocol;
