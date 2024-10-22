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
exports.InternalOutboundTransport = void 0;
const core_1 = require("@credo-ts/core");
class InternalOutboundTransport {
    constructor() {
        this.supportedSchemes = ['internal'];
    }
    start(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            this.agent = agent;
            this.logger = agent.dependencyManager.resolve(core_1.InjectionSymbols.Logger);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            // No logic needed
        });
    }
    sendMessage(outboundPackage) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageReceiver = this.agent.dependencyManager.resolve(core_1.MessageReceiver);
            this.logger.debug(`Sending outbound message to self`);
            // We can just receive the message as it's internal.
            messageReceiver.receiveMessage(outboundPackage.payload);
        });
    }
}
exports.InternalOutboundTransport = InternalOutboundTransport;
