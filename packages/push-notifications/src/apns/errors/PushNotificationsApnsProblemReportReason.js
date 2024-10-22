"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationsApnsProblemReportReason = void 0;
/**
 * Push Notification APNS errors discussed in RFC 0699.
 *
 * @see https://github.com/hyperledger/aries-rfcs/tree/main/features/0699-push-notifications-apns#set-device-info
 * @see https://github.com/hyperledger/aries-rfcs/tree/main/features/0699-push-notifications-apns#device-info
 * @internal
 */
var PushNotificationsApnsProblemReportReason;
(function (PushNotificationsApnsProblemReportReason) {
    PushNotificationsApnsProblemReportReason["MissingValue"] = "missing-value";
    PushNotificationsApnsProblemReportReason["NotRegistered"] = "not-registered-for-push-notifications";
})(PushNotificationsApnsProblemReportReason || (exports.PushNotificationsApnsProblemReportReason = PushNotificationsApnsProblemReportReason = {}));
