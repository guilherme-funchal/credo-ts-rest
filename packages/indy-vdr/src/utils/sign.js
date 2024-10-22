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
exports.multiSignRequest = multiSignRequest;
exports.signRequest = signRequest;
const core_1 = require("@aries-framework/core");
const didIndyUtil_1 = require("../dids/didIndyUtil");
function multiSignRequest(agentContext, request, signingKey, identifier) {
    return __awaiter(this, void 0, void 0, function* () {
        const signature = yield agentContext.wallet.sign({
            data: core_1.TypedArrayEncoder.fromString(request.signatureInput),
            key: signingKey,
        });
        request.setMultiSignature({
            signature,
            identifier,
        });
        return request;
    });
}
function signRequest(agentContext, pool, request, submitterDid) {
    return __awaiter(this, void 0, void 0, function* () {
        const signingKey = yield (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, submitterDid);
        const signedRequest = yield pool.prepareWriteRequest(agentContext, request, signingKey);
        return signedRequest;
    });
}
