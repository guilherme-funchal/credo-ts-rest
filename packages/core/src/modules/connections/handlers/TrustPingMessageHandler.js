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
exports.TrustPingMessageHandler = void 0;
const error_1 = require("../../../error");
const messages_1 = require("../messages");
const models_1 = require("../models");
class TrustPingMessageHandler {
    constructor(trustPingService, connectionService) {
        this.supportedMessages = [messages_1.TrustPingMessage];
        this.trustPingService = trustPingService;
        this.connectionService = connectionService;
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const { connection, recipientKey } = messageContext;
            if (!connection) {
                throw new error_1.AriesFrameworkError(`Connection for verkey ${recipientKey === null || recipientKey === void 0 ? void 0 : recipientKey.fingerprint} not found!`);
            }
            // TODO: This is better addressed in a middleware of some kind because
            // any message can transition the state to complete, not just an ack or trust ping
            if (connection.state === models_1.DidExchangeState.ResponseSent) {
                yield this.connectionService.updateState(messageContext.agentContext, connection, models_1.DidExchangeState.Completed);
            }
            return this.trustPingService.processPing(messageContext, connection);
        });
    }
}
exports.TrustPingMessageHandler = TrustPingMessageHandler;
