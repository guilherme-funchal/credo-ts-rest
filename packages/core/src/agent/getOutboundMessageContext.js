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
exports.getOutboundMessageContext = getOutboundMessageContext;
exports.getConnectionlessOutboundMessageContext = getConnectionlessOutboundMessageContext;
const crypto_1 = require("../crypto");
const ServiceDecorator_1 = require("../decorators/service/ServiceDecorator");
const error_1 = require("../error");
const oob_1 = require("../modules/oob");
const outOfBandRecordMetadataTypes_1 = require("../modules/oob/repository/outOfBandRecordMetadataTypes");
const routing_1 = require("../modules/routing");
const storage_1 = require("../storage");
const uuid_1 = require("../utils/uuid");
const models_1 = require("./models");
/**
 * Maybe these methods should be moved to a service, but that would require
 * extra injection in the sender functions, and I'm not 100% sure what would
 * be the best place to host these.
 */
/**
 * Get the outbound message context for a message. Will use the connection record if available,
 * and otherwise try to create a connectionless message context.
 */
function getOutboundMessageContext(agentContext_1, _a) {
    return __awaiter(this, arguments, void 0, function* (agentContext, { message, connectionRecord, associatedRecord, lastReceivedMessage, lastSentMessage, }) {
        // TODO: even if using a connection record, we should check if there's an oob record associated and this
        // is the first response to the oob invitation. If so, we should add the parentThreadId to the message
        if (connectionRecord) {
            agentContext.config.logger.debug(`Creating outbound message context for message ${message.id} with connection ${connectionRecord.id}`);
            return new models_1.OutboundMessageContext(message, {
                agentContext,
                associatedRecord,
                connection: connectionRecord,
            });
        }
        if (!lastReceivedMessage) {
            throw new error_1.AriesFrameworkError('No connection record and no lastReceivedMessage was supplied. For connection-less exchanges the lastReceivedMessage is required.');
        }
        if (!associatedRecord) {
            throw new error_1.AriesFrameworkError('No associated record was supplied. This is required for connection-less exchanges to store the associated ~service decorator on the message.');
        }
        // Connectionless
        return getConnectionlessOutboundMessageContext(agentContext, {
            message,
            associatedRecord,
            lastReceivedMessage,
            lastSentMessage,
        });
    });
}
function getConnectionlessOutboundMessageContext(agentContext_1, _a) {
    return __awaiter(this, arguments, void 0, function* (agentContext, { message, lastReceivedMessage, lastSentMessage, associatedRecord, }) {
        agentContext.config.logger.debug(`Creating outbound message context for message ${message.id} using connection-less exchange`);
        const outOfBandRecord = yield getOutOfBandRecordForMessage(agentContext, message);
        // eslint-disable-next-line prefer-const
        let { recipientService, ourService } = yield getServicesForMessage(agentContext, {
            lastReceivedMessage,
            lastSentMessage,
            message,
            outOfBandRecord,
        });
        // We need to set up routing for this exchange if we haven't sent any messages yet.
        if (!lastSentMessage) {
            ourService = yield createOurService(agentContext, { outOfBandRecord, message });
        }
        // These errors should not happen as they will be caught by the checks above. But if there's a path missed,
        // and to make typescript happy we add these checks.
        if (!ourService) {
            throw new error_1.AriesFrameworkError(`Could not determine our service for connection-less exchange for message ${message.id}.`);
        }
        if (!recipientService) {
            throw new error_1.AriesFrameworkError(`Could not determine recipient service for connection-less exchange for message ${message.id}.`);
        }
        // Adds the ~service and ~thread.pthid (if oob is used) to the message and updates it in storage.
        yield addExchangeDataToMessage(agentContext, { message, ourService, outOfBandRecord, associatedRecord });
        return new models_1.OutboundMessageContext(message, {
            agentContext: agentContext,
            associatedRecord,
            serviceParams: {
                service: recipientService,
                senderKey: ourService.recipientKeys[0],
                returnRoute: true,
            },
        });
    });
}
/**
 * Retrieves the out of band record associated with the message based on the thread id of the message.
 */
function getOutOfBandRecordForMessage(agentContext, message) {
    return __awaiter(this, void 0, void 0, function* () {
        agentContext.config.logger.debug(`Looking for out-of-band record for message ${message.id} with thread id ${message.threadId}`);
        const outOfBandRepository = agentContext.dependencyManager.resolve(oob_1.OutOfBandRepository);
        const outOfBandRecord = yield outOfBandRepository.findSingleByQuery(agentContext, {
            invitationRequestsThreadIds: [message.threadId],
        });
        return outOfBandRecord !== null && outOfBandRecord !== void 0 ? outOfBandRecord : undefined;
    });
}
/**
 * Returns the services to use for the message. When available it will extract the services from the
 * lastSentMessage and lastReceivedMessage. If not available it will try to extract the services from
 * the out of band record.
 *
 * If the required services and fields are not available, an error will be thrown.
 */
function getServicesForMessage(agentContext_1, _a) {
    return __awaiter(this, arguments, void 0, function* (agentContext, { lastSentMessage, lastReceivedMessage, message, outOfBandRecord, }) {
        var _b, _c;
        let ourService = (_b = lastSentMessage === null || lastSentMessage === void 0 ? void 0 : lastSentMessage.service) === null || _b === void 0 ? void 0 : _b.resolvedDidCommService;
        let recipientService = (_c = lastReceivedMessage.service) === null || _c === void 0 ? void 0 : _c.resolvedDidCommService;
        const outOfBandService = agentContext.dependencyManager.resolve(oob_1.OutOfBandService);
        // Check if valid
        if ((outOfBandRecord === null || outOfBandRecord === void 0 ? void 0 : outOfBandRecord.role) === oob_1.OutOfBandRole.Sender) {
            // Extract ourService from the oob record if not on a previous message
            if (!ourService) {
                ourService = yield outOfBandService.getResolvedServiceForOutOfBandServices(agentContext, outOfBandRecord.outOfBandInvitation.getServices());
            }
            if (!recipientService) {
                throw new error_1.AriesFrameworkError(`Could not find a service to send the message to. Please make sure the connection has a service or provide a service to send the message to.`);
            }
            // We have created the oob record with a message, that message should be provided here as well
            if (!lastSentMessage) {
                throw new error_1.AriesFrameworkError('Must have lastSentMessage when out of band record has role Sender');
            }
        }
        else if ((outOfBandRecord === null || outOfBandRecord === void 0 ? void 0 : outOfBandRecord.role) === oob_1.OutOfBandRole.Receiver) {
            // Extract recipientService from the oob record if not on a previous message
            if (!recipientService) {
                recipientService = yield outOfBandService.getResolvedServiceForOutOfBandServices(agentContext, outOfBandRecord.outOfBandInvitation.getServices());
            }
            if (lastSentMessage && !ourService) {
                throw new error_1.AriesFrameworkError(`Could not find a service to send the message to. Please make sure the connection has a service or provide a service to send the message to.`);
            }
        }
        // we either miss ourService (even though a message was sent) or we miss recipientService
        // we check in separate if statements to provide a more specific error message
        else {
            if (lastSentMessage && !ourService) {
                agentContext.config.logger.error(`No out of band record associated and missing our service for connection-less exchange for message ${message.id}, while previous message has already been sent.`);
                throw new error_1.AriesFrameworkError(`No out of band record associated and missing our service for connection-less exchange for message ${message.id}, while previous message has already been sent.`);
            }
            if (!recipientService) {
                agentContext.config.logger.error(`No out of band record associated and missing recipient service for connection-less exchange for message ${message.id}.`);
                throw new error_1.AriesFrameworkError(`No out of band record associated and missing recipient service for connection-less exchange for message ${message.id}.`);
            }
        }
        return { ourService, recipientService };
    });
}
/**
 * Creates a new service for us as the sender to be used in a connection-less exchange.
 *
 * Will creating routing, which takes into account mediators, and will optionally extract
 * routing configuration from the out of band record if available.
 */
function createOurService(agentContext_1, _a) {
    return __awaiter(this, arguments, void 0, function* (agentContext, { outOfBandRecord, message }) {
        agentContext.config.logger.debug(`No previous sent message in thread for outbound message ${message.id}, setting up routing`);
        let routing = undefined;
        // Extract routing from out of band record if possible
        const oobRecordRecipientRouting = outOfBandRecord === null || outOfBandRecord === void 0 ? void 0 : outOfBandRecord.metadata.get(outOfBandRecordMetadataTypes_1.OutOfBandRecordMetadataKeys.RecipientRouting);
        if (oobRecordRecipientRouting) {
            routing = {
                recipientKey: crypto_1.Key.fromFingerprint(oobRecordRecipientRouting.recipientKeyFingerprint),
                routingKeys: oobRecordRecipientRouting.routingKeyFingerprints.map((fingerprint) => crypto_1.Key.fromFingerprint(fingerprint)),
                endpoints: oobRecordRecipientRouting.endpoints,
                mediatorId: oobRecordRecipientRouting.mediatorId,
            };
        }
        if (!routing) {
            const routingService = agentContext.dependencyManager.resolve(routing_1.RoutingService);
            routing = yield routingService.getRouting(agentContext, {
                mediatorId: outOfBandRecord === null || outOfBandRecord === void 0 ? void 0 : outOfBandRecord.mediatorId,
            });
        }
        return {
            id: (0, uuid_1.uuid)(),
            serviceEndpoint: routing.endpoints[0],
            recipientKeys: [routing.recipientKey],
            routingKeys: routing.routingKeys,
        };
    });
}
function addExchangeDataToMessage(agentContext_1, _a) {
    return __awaiter(this, arguments, void 0, function* (agentContext, { message, ourService, outOfBandRecord, associatedRecord, }) {
        const legacyInvitationMetadata = outOfBandRecord === null || outOfBandRecord === void 0 ? void 0 : outOfBandRecord.metadata.get(outOfBandRecordMetadataTypes_1.OutOfBandRecordMetadataKeys.LegacyInvitation);
        // Set the parentThreadId on the message from the oob invitation
        // If connectionless is used, we should not add the parentThreadId
        if (outOfBandRecord && (legacyInvitationMetadata === null || legacyInvitationMetadata === void 0 ? void 0 : legacyInvitationMetadata.legacyInvitationType) !== oob_1.InvitationType.Connectionless) {
            if (!message.thread) {
                message.setThread({
                    parentThreadId: outOfBandRecord.outOfBandInvitation.id,
                });
            }
            else {
                message.thread.parentThreadId = outOfBandRecord.outOfBandInvitation.id;
            }
        }
        // Set the service on the message and save service decorator to record (to remember our verkey)
        // TODO: we should store this in the OOB record, but that would be a breaking change for now.
        // We can change this in 0.5.0
        message.service = ServiceDecorator_1.ServiceDecorator.fromResolvedDidCommService(ourService);
        yield agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository).saveOrUpdateAgentMessage(agentContext, {
            agentMessage: message,
            role: storage_1.DidCommMessageRole.Sender,
            associatedRecordId: associatedRecord.id,
        });
    });
}
