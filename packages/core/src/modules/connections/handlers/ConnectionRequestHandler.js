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
exports.ConnectionRequestHandler = void 0;
const TransportService_1 = require("../../../agent/TransportService");
const models_1 = require("../../../agent/models");
const AriesFrameworkError_1 = require("../../../error/AriesFrameworkError");
const parse_1 = require("../../dids/domain/parse");
const messages_1 = require("../messages");
const models_2 = require("../models");
class ConnectionRequestHandler {
    constructor(connectionService, outOfBandService, routingService, didRepository, connectionsModuleConfig) {
        this.supportedMessages = [messages_1.ConnectionRequestMessage];
        this.connectionService = connectionService;
        this.outOfBandService = outOfBandService;
        this.routingService = routingService;
        this.didRepository = didRepository;
        this.connectionsModuleConfig = connectionsModuleConfig;
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { agentContext, connection, recipientKey, senderKey, message, sessionId } = messageContext;
            if (!recipientKey || !senderKey) {
                throw new AriesFrameworkError_1.AriesFrameworkError('Unable to process connection request without senderVerkey or recipientKey');
            }
            const parentThreadId = (_a = message.thread) === null || _a === void 0 ? void 0 : _a.parentThreadId;
            const outOfBandRecord = parentThreadId && (0, parse_1.tryParseDid)(parentThreadId)
                ? yield this.outOfBandService.createFromImplicitInvitation(agentContext, {
                    did: parentThreadId,
                    threadId: message.threadId,
                    recipientKey,
                    handshakeProtocols: [models_2.HandshakeProtocol.Connections],
                })
                : yield this.outOfBandService.findCreatedByRecipientKey(agentContext, recipientKey);
            if (!outOfBandRecord) {
                throw new AriesFrameworkError_1.AriesFrameworkError(`Out-of-band record for recipient key ${recipientKey.fingerprint} was not found.`);
            }
            if (connection && !outOfBandRecord.reusable) {
                throw new AriesFrameworkError_1.AriesFrameworkError(`Connection record for non-reusable out-of-band ${outOfBandRecord.id} already exists.`);
            }
            const receivedDidRecord = yield this.didRepository.findReceivedDidByRecipientKey(agentContext, senderKey);
            if (receivedDidRecord) {
                throw new AriesFrameworkError_1.AriesFrameworkError(`A received did record for sender key ${senderKey.fingerprint} already exists.`);
            }
            const connectionRecord = yield this.connectionService.processRequest(messageContext, outOfBandRecord);
            // Associate the new connection with the session created for the inbound message
            if (sessionId) {
                const transportService = agentContext.dependencyManager.resolve(TransportService_1.TransportService);
                transportService.setConnectionIdForSession(sessionId, connectionRecord.id);
            }
            if ((_b = connectionRecord === null || connectionRecord === void 0 ? void 0 : connectionRecord.autoAcceptConnection) !== null && _b !== void 0 ? _b : this.connectionsModuleConfig.autoAcceptConnections) {
                // TODO: Allow rotation of keys used in the invitation for new ones not only when out-of-band is reusable
                const routing = outOfBandRecord.reusable ? yield this.routingService.getRouting(agentContext) : undefined;
                const { message } = yield this.connectionService.createResponse(agentContext, connectionRecord, outOfBandRecord, routing);
                return new models_1.OutboundMessageContext(message, {
                    agentContext,
                    connection: connectionRecord,
                    outOfBand: outOfBandRecord,
                });
            }
        });
    }
}
exports.ConnectionRequestHandler = ConnectionRequestHandler;
