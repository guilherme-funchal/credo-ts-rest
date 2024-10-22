"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationsFcmModule = void 0;
const core_1 = require("@credo-ts/core");
const PushNotificationsFcmApi_1 = require("./PushNotificationsFcmApi");
const PushNotificationsFcmService_1 = require("./PushNotificationsFcmService");
const handlers_1 = require("./handlers");
const models_1 = require("./models");
/**
 * Module that exposes push notification get and set functionality
 */
class PushNotificationsFcmModule {
    constructor() {
        this.api = PushNotificationsFcmApi_1.PushNotificationsFcmApi;
    }
    register(dependencyManager, featureRegistry) {
        dependencyManager.registerContextScoped(PushNotificationsFcmApi_1.PushNotificationsFcmApi);
        dependencyManager.registerSingleton(PushNotificationsFcmService_1.PushNotificationsFcmService);
        featureRegistry.register(new core_1.Protocol({
            id: 'https://didcomm.org/push-notifications-fcm/1.0',
            roles: [models_1.PushNotificationsFcmRole.Sender, models_1.PushNotificationsFcmRole.Receiver],
        }));
        dependencyManager.registerMessageHandlers([
            new handlers_1.PushNotificationsFcmDeviceInfoHandler(),
            new handlers_1.PushNotificationsFcmGetDeviceInfoHandler(),
            new handlers_1.PushNotificationsFcmSetDeviceInfoHandler(),
            new handlers_1.PushNotificationsFcmProblemReportHandler(),
        ]);
    }
}
exports.PushNotificationsFcmModule = PushNotificationsFcmModule;
