"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationsApnsModule = void 0;
const core_1 = require("@credo-ts/core");
const PushNotificationsApnsApi_1 = require("./PushNotificationsApnsApi");
const PushNotificationsApnsService_1 = require("./PushNotificationsApnsService");
const handlers_1 = require("./handlers");
const models_1 = require("./models");
/**
 * Module that exposes push notification get and set functionality
 */
class PushNotificationsApnsModule {
    constructor() {
        this.api = PushNotificationsApnsApi_1.PushNotificationsApnsApi;
    }
    register(dependencyManager, featureRegistry) {
        dependencyManager.registerContextScoped(PushNotificationsApnsApi_1.PushNotificationsApnsApi);
        featureRegistry.register(new core_1.Protocol({
            id: 'https://didcomm.org/push-notifications-apns/1.0',
            roles: [models_1.PushNotificationsApnsRole.Sender, models_1.PushNotificationsApnsRole.Receiver],
        }));
        dependencyManager.registerMessageHandlers([
            new handlers_1.PushNotificationsApnsDeviceInfoHandler(),
            new handlers_1.PushNotificationsApnsGetDeviceInfoHandler(),
            new handlers_1.PushNotificationsApnsSetDeviceInfoHandler(),
            new handlers_1.PushNotificationsApnsProblemReportHandler(),
        ]);
        dependencyManager.registerSingleton(PushNotificationsApnsService_1.PushNotificationsApnsService);
    }
}
exports.PushNotificationsApnsModule = PushNotificationsApnsModule;
