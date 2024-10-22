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
exports.ForwardHandler = void 0;
const messages_1 = require("../messages");
class ForwardHandler {
    constructor(mediatorService, connectionService, messageSender) {
        this.supportedMessages = [messages_1.ForwardMessage];
        this.mediatorService = mediatorService;
        this.connectionService = connectionService;
        this.messageSender = messageSender;
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const { encryptedMessage, mediationRecord } = yield this.mediatorService.processForwardMessage(messageContext);
            const connectionRecord = yield this.connectionService.getById(messageContext.agentContext, mediationRecord.connectionId);
            // The message inside the forward message is packed so we just send the packed
            // message to the connection associated with it
            yield this.messageSender.sendPackage(messageContext.agentContext, {
                connection: connectionRecord,
                encryptedMessage,
            });
        });
    }
}
exports.ForwardHandler = ForwardHandler;
