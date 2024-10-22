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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openId4VcVerificationSessionEvents = void 0;
const openid4vc_1 = require("@credo-ts/openid4vc");
const OpenId4VcVerificationSessionsControllerTypes_1 = require("../controllers/openid4vc/verification-sessions/OpenId4VcVerificationSessionsControllerTypes");
const emitEvent_1 = require("./emitEvent");
const openId4VcVerificationSessionEvents = (agent, emitEventConfig) => __awaiter(void 0, void 0, void 0, function* () {
    agent.events.on(openid4vc_1.OpenId4VcVerifierEvents.VerificationSessionStateChanged, (event) => __awaiter(void 0, void 0, void 0, function* () {
        const _a = event.payload, { verificationSession } = _a, payload = __rest(_a, ["verificationSession"]);
        const webhookPayload = Object.assign(Object.assign({}, event), { payload: Object.assign(Object.assign({}, payload), { verificationSession: (0, OpenId4VcVerificationSessionsControllerTypes_1.openId4VcVerificationSessionRecordToApiModel)(verificationSession) }) });
        yield (0, emitEvent_1.emitEvent)(webhookPayload, emitEventConfig);
    }));
});
exports.openId4VcVerificationSessionEvents = openId4VcVerificationSessionEvents;
