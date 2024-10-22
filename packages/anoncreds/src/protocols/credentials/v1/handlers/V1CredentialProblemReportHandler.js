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
exports.V1CredentialProblemReportHandler = void 0;
const messages_1 = require("../messages");
class V1CredentialProblemReportHandler {
    constructor(credentialProtocol) {
        this.supportedMessages = [messages_1.V1CredentialProblemReportMessage];
        this.credentialProtocol = credentialProtocol;
    }
    handle(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.credentialProtocol.processProblemReport(messageContext);
        });
    }
}
exports.V1CredentialProblemReportHandler = V1CredentialProblemReportHandler;
