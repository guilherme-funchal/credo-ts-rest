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
exports.PushNotificationsFcmDeviceInfoHandler = void 0;
const messages_1 = require("../messages");
/**
 * Handler for incoming fcm push notification device info messages
 */
class PushNotificationsFcmDeviceInfoHandler {
    constructor() {
        this.supportedMessages = [messages_1.PushNotificationsFcmDeviceInfoMessage];
    }
    /**
    /* We don't really need to do anything with this at the moment
    /* The result can be hooked into through the generic message processed event
     */
    handle(inboundMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            inboundMessage.assertReadyConnection();
        });
    }
}
exports.PushNotificationsFcmDeviceInfoHandler = PushNotificationsFcmDeviceInfoHandler;
