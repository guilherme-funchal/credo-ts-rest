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
exports.BleInboundTransport = void 0;
const core_1 = require("@credo-ts/core");
const BleTransportSession_1 = require("./BleTransportSession");
class BleInboundTransport {
    constructor(messenger) {
        this.supportedSchemes = ['ble'];
        this.messenger = messenger;
    }
    start(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger = agent.config.logger;
            this.logger.debug('Starting BLE inbound transport');
            const sessionId = core_1.utils.uuid();
            this.session = new BleTransportSession_1.BleTransportSession(sessionId, this.messenger, agent.context);
            const messageListener = (data) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const message = data.message;
                const messageReceiver = agent.dependencyManager.resolve(core_1.MessageReceiver);
                try {
                    const encryptedMessage = yield JSON.parse(message);
                    yield messageReceiver.receiveMessage(encryptedMessage, {
                        session: this.session,
                    });
                }
                catch (error) {
                    (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error(`Error processing message: ${error}`);
                }
            });
            this.messageListener = this.messenger.registerMessageListener(messageListener);
            const disconnectionListener = (data) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('BLE disconnection detected', { data });
                const transportService = agent.dependencyManager.resolve(core_1.TransportService);
                transportService.removeSession(this.session);
            });
            this.disconnectionListener = this.messenger.registerOnDisconnectedListener(disconnectionListener);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Stopping BLE inbound transport');
            (_b = this.messageListener) === null || _b === void 0 ? void 0 : _b.remove();
            (_c = this.disconnectionListener) === null || _c === void 0 ? void 0 : _c.remove();
            yield this.messenger.shutdown();
        });
    }
}
exports.BleInboundTransport = BleInboundTransport;
