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
exports.BleTransportSession = void 0;
const core_1 = require("@credo-ts/core");
class BleTransportSession {
    constructor(id, messenger, agentContext) {
        this.type = 'ble';
        this.id = id !== null && id !== void 0 ? id : core_1.utils.uuid();
        this.messenger = messenger;
        this.agentContext = agentContext;
    }
    send(agentContext, encryptedMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            const serializedMessage = JSON.stringify(encryptedMessage);
            agentContext.config.logger.debug('Sending BLE inbound message via session');
            yield this.messenger.sendMessage(serializedMessage);
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.agentContext.config.logger.debug('Stopping BLE inbound session');
        });
    }
}
exports.BleTransportSession = BleTransportSession;
