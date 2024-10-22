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
exports.V1QueryMessageHandler = void 0;
const models_1 = require("../../../../../agent/models");
const messages_1 = require("../messages");
class V1QueryMessageHandler {
    constructor(discoverFeaturesService) {
        this.supportedMessages = [messages_1.V1QueryMessage];
        this.discoverFeaturesService = discoverFeaturesService;
    }
    handle(inboundMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = inboundMessage.assertReadyConnection();
            const discloseMessage = yield this.discoverFeaturesService.processQuery(inboundMessage);
            if (discloseMessage) {
                return new models_1.OutboundMessageContext(discloseMessage.message, {
                    agentContext: inboundMessage.agentContext,
                    connection,
                });
            }
        });
    }
}
exports.V1QueryMessageHandler = V1QueryMessageHandler;
