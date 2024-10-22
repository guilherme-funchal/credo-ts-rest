"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationsApnsModule = exports.PushNotificationsApnsApi = void 0;
var PushNotificationsApnsApi_1 = require("./PushNotificationsApnsApi");
Object.defineProperty(exports, "PushNotificationsApnsApi", { enumerable: true, get: function () { return PushNotificationsApnsApi_1.PushNotificationsApnsApi; } });
var PushNotificationsApnsModule_1 = require("./PushNotificationsApnsModule");
Object.defineProperty(exports, "PushNotificationsApnsModule", { enumerable: true, get: function () { return PushNotificationsApnsModule_1.PushNotificationsApnsModule; } });
__exportStar(require("./models"), exports);
__exportStar(require("./messages"), exports);
