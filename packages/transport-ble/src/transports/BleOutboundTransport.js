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
exports.BleOutboundTransport = void 0;
const core_1 = require("@credo-ts/core");
class BleOutboundTransport {
    constructor(messenger) {
        this.supportedSchemes = ['ble'];
        this.messenger = messenger;
    }
    start(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger = agent.config.logger;
            this.logger.debug('Starting BLE outbound transport');
        });
    }
    sendMessage(outboundPackage) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { payload, endpoint } = outboundPackage;
            if (!endpoint) {
                throw new core_1.CredoError(`Missing endpoint. I don't know how and where to send the message.`);
            }
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug(`Sending outbound message to endpoint '${endpoint}'`, {
                payload,
            });
            const serializedMessage = JSON.stringify(payload);
            (_b = this.logger) === null || _b === void 0 ? void 0 : _b.debug('Sending BLE outbound message');
            yield this.messenger.sendMessage(serializedMessage);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Stopping BLE outbound transport');
            yield this.messenger.shutdown();
        });
    }
}
exports.BleOutboundTransport = BleOutboundTransport;
