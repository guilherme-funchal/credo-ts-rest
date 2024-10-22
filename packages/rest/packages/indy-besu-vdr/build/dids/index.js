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
exports.__esModule = true;
exports.VerificationKeyType = exports.VerificationKeyPurpose = exports.getEcdsaSecp256k1RecoveryMethod2020 = exports.buildDid = exports.IndyBesuDidResolver = exports.IndyBesuDidRegistrar = void 0;
var IndyBesuDidRegistrar_1 = require("./IndyBesuDidRegistrar");
__createBinding(exports, IndyBesuDidRegistrar_1, "IndyBesuDidRegistrar");
var IndyBesuDidResolver_1 = require("./IndyBesuDidResolver");
__createBinding(exports, IndyBesuDidResolver_1, "IndyBesuDidResolver");
var DidUtils_1 = require("./DidUtils");
__createBinding(exports, DidUtils_1, "buildDid");
__createBinding(exports, DidUtils_1, "getEcdsaSecp256k1RecoveryMethod2020");
__createBinding(exports, DidUtils_1, "VerificationKeyPurpose");
__createBinding(exports, DidUtils_1, "VerificationKeyType");
