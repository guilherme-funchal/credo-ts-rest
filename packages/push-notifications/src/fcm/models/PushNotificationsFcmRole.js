"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationsFcmRole = void 0;
/**
 * Push Notification FCM roles based on the flow defined in RFC 0734.
 *
 * @see https://github.com/hyperledger/aries-rfcs/tree/main/features/0734-push-notifications-fcm#roles
 * @public
 */
var PushNotificationsFcmRole;
(function (PushNotificationsFcmRole) {
    PushNotificationsFcmRole["Sender"] = "notification-sender";
    PushNotificationsFcmRole["Receiver"] = "notification-receiver";
})(PushNotificationsFcmRole || (exports.PushNotificationsFcmRole = PushNotificationsFcmRole = {}));
