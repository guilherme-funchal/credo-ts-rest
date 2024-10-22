"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERIFICATION_METHOD_TYPE_ECDSA_SECP256K1_VERIFICATION_KEY_2019 = void 0;
exports.getEcdsaSecp256k1VerificationKey2019 = getEcdsaSecp256k1VerificationKey2019;
exports.isEcdsaSecp256k1VerificationKey2019 = isEcdsaSecp256k1VerificationKey2019;
exports.getKeyFromEcdsaSecp256k1VerificationKey2019 = getKeyFromEcdsaSecp256k1VerificationKey2019;
const core_1 = require("@aries-framework/core");
exports.VERIFICATION_METHOD_TYPE_ECDSA_SECP256K1_VERIFICATION_KEY_2019 = 'EcdsaSecp256k1VerificationKey2019';
/**
 * Get a EcdsaSecp256k1VerificationKey2019 verification method.
 */
function getEcdsaSecp256k1VerificationKey2019({ key, id, controller, }) {
    return new core_1.VerificationMethod({
        id,
        type: exports.VERIFICATION_METHOD_TYPE_ECDSA_SECP256K1_VERIFICATION_KEY_2019,
        controller,
        publicKeyMultibase: key.fingerprint,
    });
}
/**
 * Check whether a verification method is a EcdsaSecp256k1VerificationKey2019 verification method.
 */
function isEcdsaSecp256k1VerificationKey2019(verificationMethod) {
    return verificationMethod.type === exports.VERIFICATION_METHOD_TYPE_ECDSA_SECP256K1_VERIFICATION_KEY_2019;
}
/**
 * Get a key from a EcdsaSecp256k1VerificationKey2019 verification method.
 */
function getKeyFromEcdsaSecp256k1VerificationKey2019(verificationMethod) {
    if (!verificationMethod.publicKeyMultibase) {
        throw new core_1.AriesFrameworkError('verification method is missing publicKeyMultibase');
    }
    const key = core_1.Key.fromFingerprint(verificationMethod.publicKeyMultibase);
    if (key.keyType !== core_1.KeyType.K256) {
        throw new core_1.AriesFrameworkError(`Verification method publicKeyMultibase is for unexpected key type ${key.keyType}`);
    }
    return key;
}
