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
const core_1 = require("@credo-ts/core");
const PushNotificationsApnsService_1 = require("../src/apns/PushNotificationsApnsService");
const agent_1 = require("./utils/agent");
describe('Push Notifications apns', () => {
    let agent;
    let pushNotificationsApnsService;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = yield (0, agent_1.setupAgentApns)({
            name: 'push notifications apns service notification receiver test',
        });
        pushNotificationsApnsService = agent.dependencyManager.resolve(PushNotificationsApnsService_1.PushNotificationsApnsService);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    describe('Create apns set push notification message', () => {
        test('Should create a valid https://didcomm.org/push-notifications-apns/1.0/device-info message ', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = pushNotificationsApnsService.createDeviceInfo({
                threadId: '5678-5678-5678-5678',
                deviceInfo: {
                    deviceToken: '1234-1234-1234-1234',
                },
            });
            const jsonMessage = core_1.JsonTransformer.toJSON(message);
            expect(jsonMessage).toEqual(expect.objectContaining({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/push-notifications-apns/1.0/device-info',
                device_token: '1234-1234-1234-1234',
                '~thread': expect.objectContaining({ thid: '5678-5678-5678-5678' }),
            }));
        }));
    });
    describe('Create apns set push notification message', () => {
        test('Should create a valid https://didcomm.org/push-notifications-apns/1.0/set-device-info message ', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = pushNotificationsApnsService.createSetDeviceInfo({
                deviceToken: '1234-1234-1234-1234',
            });
            const jsonMessage = core_1.JsonTransformer.toJSON(message);
            expect(jsonMessage).toEqual({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/push-notifications-apns/1.0/set-device-info',
                device_token: '1234-1234-1234-1234',
            });
        }));
    });
    describe('Create apns get device info message', () => {
        test('Should create a valid https://didcomm.org/push-notifications-apns/1.0/get-device-info message ', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = pushNotificationsApnsService.createGetDeviceInfo();
            const jsonMessage = core_1.JsonTransformer.toJSON(message);
            expect(jsonMessage).toEqual({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/push-notifications-apns/1.0/get-device-info',
            });
        }));
    });
});
