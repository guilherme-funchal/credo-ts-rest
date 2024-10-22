"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationsApnsRole = void 0;
/**
 * Push Notification FCM roles based on the flow defined in RFC 0699.
 *
 * @see https://github.com/hyperledger/aries-rfcs/tree/main/features/0699-push-notifications-apns#roles
 * @public
 */
var PushNotificationsApnsRole;
(function (PushNotificationsApnsRole) {
    PushNotificationsApnsRole["Sender"] = "notification-sender";
    PushNotificationsApnsRole["Receiver"] = "notification-receiver";
})(PushNotificationsApnsRole || (exports.PushNotificationsApnsRole = PushNotificationsApnsRole = {}));
