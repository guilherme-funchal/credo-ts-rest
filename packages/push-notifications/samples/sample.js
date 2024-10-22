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
const agent_1 = require("../tests/utils/agent");
/**
 * replace `a-valid-connection-id` with the connection id you want to interact with
 * See the tests for a more accurate implementation
 */
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    // Setup the agent
    const agent = yield (0, agent_1.setupAgentApns)({
        name: 'aries apns push notifications agent',
    });
    // Pushes a  device token and vendor to the specified connection record
    yield agent.modules.pushNotificationsApns.setDeviceInfo('a-valid-connection', {
        deviceToken: '123',
    });
    // Gets the push notification device information located at the other agent behind the connection
    yield agent.modules.pushNotificationsApns.getDeviceInfo('a-valid-connection');
    // Sends device info as response from a get-device-info message
    yield agent.modules.pushNotificationsApns.deviceInfo({
        connectionId: 'a-valid-connection',
        threadId: 'get-device-info-msg-id',
        deviceInfo: {
            deviceToken: '123',
        },
    });
});
void run();
