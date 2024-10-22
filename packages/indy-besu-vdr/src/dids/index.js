"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationKeyType = exports.VerificationKeyPurpose = exports.getEcdsaSecp256k1RecoveryMethod2020 = exports.buildDid = exports.IndyBesuDidResolver = exports.IndyBesuDidRegistrar = void 0;
var IndyBesuDidRegistrar_1 = require("./IndyBesuDidRegistrar");
Object.defineProperty(exports, "IndyBesuDidRegistrar", { enumerable: true, get: function () { return IndyBesuDidRegistrar_1.IndyBesuDidRegistrar; } });
var IndyBesuDidResolver_1 = require("./IndyBesuDidResolver");
Object.defineProperty(exports, "IndyBesuDidResolver", { enumerable: true, get: function () { return IndyBesuDidResolver_1.IndyBesuDidResolver; } });
var DidUtils_1 = require("./DidUtils");
Object.defineProperty(exports, "buildDid", { enumerable: true, get: function () { return DidUtils_1.buildDid; } });
Object.defineProperty(exports, "getEcdsaSecp256k1RecoveryMethod2020", { enumerable: true, get: function () { return DidUtils_1.getEcdsaSecp256k1RecoveryMethod2020; } });
Object.defineProperty(exports, "VerificationKeyPurpose", { enumerable: true, get: function () { return DidUtils_1.VerificationKeyPurpose; } });
Object.defineProperty(exports, "VerificationKeyType", { enumerable: true, get: function () { return DidUtils_1.VerificationKeyType; } });
