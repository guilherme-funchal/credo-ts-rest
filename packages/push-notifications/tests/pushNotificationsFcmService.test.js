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
const PushNotificationsFcmService_1 = require("../src/fcm/PushNotificationsFcmService");
const errors_1 = require("../src/fcm/errors");
const agent_1 = require("./utils/agent");
describe('Push Notifications Fcm ', () => {
    let agent;
    let pushNotificationsService;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = yield (0, agent_1.setupAgentFcm)({
            name: 'push notifications fcm service notification receiver test',
        });
        pushNotificationsService = agent.dependencyManager.resolve(PushNotificationsFcmService_1.PushNotificationsFcmService);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    describe('Create fcm set-device-info message', () => {
        test('Should create a valid message with both token and platform', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = pushNotificationsService.createSetDeviceInfo({
                deviceToken: '1234-1234-1234-1234',
                devicePlatform: 'android',
            });
            const jsonMessage = core_1.JsonTransformer.toJSON(message);
            expect(jsonMessage).toEqual({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/push-notifications-fcm/1.0/set-device-info',
                device_token: '1234-1234-1234-1234',
                device_platform: 'android',
            });
        }));
        test('Should create a valid message without token and platform ', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = pushNotificationsService.createSetDeviceInfo({
                deviceToken: null,
                devicePlatform: null,
            });
            const jsonMessage = core_1.JsonTransformer.toJSON(message);
            expect(jsonMessage).toEqual({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/push-notifications-fcm/1.0/set-device-info',
                device_token: null,
                device_platform: null,
            });
        }));
        test('Should throw error if either token or platform are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(() => pushNotificationsService.createSetDeviceInfo({
                deviceToken: 'something',
                devicePlatform: null,
            })).toThrow('Both or none of deviceToken and devicePlatform must be null');
            expect(() => pushNotificationsService.createSetDeviceInfo({
                deviceToken: null,
                devicePlatform: 'something',
            })).toThrow('Both or none of deviceToken and devicePlatform must be null');
        }));
    });
    describe('Create fcm get-device-info message', () => {
        test('Should create a valid message ', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = pushNotificationsService.createGetDeviceInfo();
            const jsonMessage = core_1.JsonTransformer.toJSON(message);
            expect(jsonMessage).toEqual({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/push-notifications-fcm/1.0/get-device-info',
            });
        }));
    });
    describe('Create fcm device-info message', () => {
        test('Should create a valid message with both token and platform', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = pushNotificationsService.createDeviceInfo({
                threadId: '5678-5678-5678-5678',
                deviceInfo: {
                    deviceToken: '1234-1234-1234-1234',
                    devicePlatform: 'android',
                },
            });
            const jsonMessage = core_1.JsonTransformer.toJSON(message);
            expect(jsonMessage).toEqual(expect.objectContaining({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/push-notifications-fcm/1.0/device-info',
                device_token: '1234-1234-1234-1234',
                device_platform: 'android',
                '~thread': expect.objectContaining({ thid: '5678-5678-5678-5678' }),
            }));
        }));
        test('Should create a valid message without token and platform ', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = pushNotificationsService.createDeviceInfo({
                threadId: '5678-5678-5678-5678',
                deviceInfo: {
                    deviceToken: null,
                    devicePlatform: null,
                },
            });
            const jsonMessage = core_1.JsonTransformer.toJSON(message);
            expect(jsonMessage).toEqual(expect.objectContaining({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/push-notifications-fcm/1.0/device-info',
                device_token: null,
                device_platform: null,
                '~thread': expect.objectContaining({ thid: '5678-5678-5678-5678' }),
            }));
        }));
        test('Should throw error if either token or platform are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(() => pushNotificationsService.createDeviceInfo({
                threadId: '5678-5678-5678-5678',
                deviceInfo: {
                    deviceToken: 'something',
                    devicePlatform: null,
                },
            })).toThrow('Both or none of deviceToken and devicePlatform must be null');
            expect(() => pushNotificationsService.createDeviceInfo({
                threadId: '5678-5678-5678-5678',
                deviceInfo: {
                    deviceToken: null,
                    devicePlatform: 'something',
                },
            })).toThrow('Both or none of deviceToken and devicePlatform must be null');
        }));
    });
    describe('Process fcm set-device-info message', () => {
        test('Should throw if one of token and platform are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = pushNotificationsService.createSetDeviceInfo({
                deviceToken: '1234-1234-1234-1234',
                devicePlatform: 'android',
            });
            message.devicePlatform = null;
            expect(() => pushNotificationsService.processSetDeviceInfo(createInboundMessageContext(message))).toThrow(errors_1.PushNotificationsFcmProblemReportError);
            message.deviceToken = null;
            expect(() => pushNotificationsService.processSetDeviceInfo(createInboundMessageContext(message))).not.toThrow(errors_1.PushNotificationsFcmProblemReportError);
            message.devicePlatform = 'something';
            expect(() => pushNotificationsService.processSetDeviceInfo(createInboundMessageContext(message))).toThrow(errors_1.PushNotificationsFcmProblemReportError);
        }));
    });
});
function createInboundMessageContext(message) {
    return {
        agentContext: new core_1.AgentContext({ dependencyManager: new core_1.DependencyManager(), contextCorrelationId: '' }),
        message,
        assertReadyConnection: function () {
            throw new Error('Function not implemented.');
        },
        toJSON: function () {
            throw new Error('Function not implemented.');
        },
    };
}
