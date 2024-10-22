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
exports.HandshakeReuseHandler = void 0;
const models_1 = require("../../../agent/models");
const HandshakeReuseMessage_1 = require("../messages/HandshakeReuseMessage");
class HandshakeReuseHandler {
    constructor(outOfBandService) {
        this.supportedMessages = [HandshakeReuseMessage_1.HandshakeReuseMessage];
        this.outOfBandService = outOfBandService;
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const connectionRecord = messageContext.assertReadyConnection();
            const handshakeReuseAcceptedMessage = yield this.outOfBandService.processHandshakeReuse(messageContext);
            return new models_1.OutboundMessageContext(handshakeReuseAcceptedMessage, {
                agentContext: messageContext.agentContext,
                connection: connectionRecord,
            });
        });
    }
}
exports.HandshakeReuseHandler = HandshakeReuseHandler;
