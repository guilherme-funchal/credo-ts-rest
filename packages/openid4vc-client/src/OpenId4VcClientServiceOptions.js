"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthFlowType = exports.supportedCredentialFormats = void 0;
const core_1 = require("@aries-framework/core");
exports.supportedCredentialFormats = [core_1.ClaimFormat.JwtVc, core_1.ClaimFormat.LdpVc];
/**
 * @internal
 */
var AuthFlowType;
(function (AuthFlowType) {
    AuthFlowType[AuthFlowType["AuthorizationCodeFlow"] = 0] = "AuthorizationCodeFlow";
    AuthFlowType[AuthFlowType["PreAuthorizedCodeFlow"] = 1] = "PreAuthorizedCodeFlow";
})(AuthFlowType || (exports.AuthFlowType = AuthFlowType = {}));
