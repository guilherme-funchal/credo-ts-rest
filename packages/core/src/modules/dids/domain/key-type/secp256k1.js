"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyDidSecp256k1 = void 0;
const error_1 = require("../../../../error");
const KeyType_1 = require("../../../../crypto/KeyType");
const verificationMethod_1 = require("../verificationMethod");
exports.keyDidSecp256k1 = {
    supportedVerificationMethodTypes: [verificationMethod_1.VERIFICATION_METHOD_TYPE_ECDSA_SECP256K1_VERIFICATION_KEY_2019],
    getVerificationMethods: (did, key) => [
        (0, verificationMethod_1.getEcdsaSecp256k1VerificationKey2019)({ id: `${did}#${key.fingerprint}`, key, controller: did }),
    ],
    getKeyFromVerificationMethod: (verificationMethod) => {
        if ((0, verificationMethod_1.isEcdsaSecp256k1VerificationKey2019)(verificationMethod)) {
            return (0, verificationMethod_1.getKeyFromEcdsaSecp256k1VerificationKey2019)(verificationMethod);
        }
        if ((0, verificationMethod_1.isJsonWebKey2020)(verificationMethod)) {
            return (0, verificationMethod_1.getKeyFromJsonWebKey2020)(verificationMethod);
        }
        throw new error_1.AriesFrameworkError(`Verification method with type '${verificationMethod.type}' not supported for key type '${KeyType_1.KeyType.K256}'`);
    },
};
