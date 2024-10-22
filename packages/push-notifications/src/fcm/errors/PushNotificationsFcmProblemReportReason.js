"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationsFcmProblemReportReason = void 0;
/**
 * Push Notification FCM errors discussed in RFC 0734.
 *
 * @see https://github.com/hyperledger/aries-rfcs/tree/main/features/0734-push-notifications-fcm#set-device-info
 * @see https://github.com/hyperledger/aries-rfcs/tree/main/features/0734-push-notifications-fcm#device-info
 * @internal
 */
var PushNotificationsFcmProblemReportReason;
(function (PushNotificationsFcmProblemReportReason) {
    PushNotificationsFcmProblemReportReason["MissingValue"] = "missing-value";
    PushNotificationsFcmProblemReportReason["NotRegistered"] = "not-registered-for-push-notifications";
})(PushNotificationsFcmProblemReportReason || (exports.PushNotificationsFcmProblemReportReason = PushNotificationsFcmProblemReportReason = {}));
