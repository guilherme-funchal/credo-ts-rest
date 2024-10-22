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
exports.MediationRequestHandler = void 0;
const models_1 = require("../../../agent/models");
const MediationRequestMessage_1 = require("../messages/MediationRequestMessage");
class MediationRequestHandler {
    constructor(mediatorService, mediatorModuleConfig) {
        this.supportedMessages = [MediationRequestMessage_1.MediationRequestMessage];
        this.mediatorService = mediatorService;
        this.mediatorModuleConfig = mediatorModuleConfig;
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = messageContext.assertReadyConnection();
            const mediationRecord = yield this.mediatorService.processMediationRequest(messageContext);
            if (this.mediatorModuleConfig.autoAcceptMediationRequests) {
                const { message } = yield this.mediatorService.createGrantMediationMessage(messageContext.agentContext, mediationRecord);
                return new models_1.OutboundMessageContext(message, {
                    agentContext: messageContext.agentContext,
                    connection,
                    associatedRecord: mediationRecord,
                });
            }
        });
    }
}
exports.MediationRequestHandler = MediationRequestHandler;
