"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyTypesSupportedByAskar = exports.isKeyTypeSupportedByAskar = void 0;
const core_1 = require("@aries-framework/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const keyTypeToAskarAlg = {
    [core_1.KeyType.Ed25519]: aries_askar_shared_1.KeyAlgs.Ed25519,
    [core_1.KeyType.X25519]: aries_askar_shared_1.KeyAlgs.X25519,
    [core_1.KeyType.Bls12381g1]: aries_askar_shared_1.KeyAlgs.Bls12381G1,
    [core_1.KeyType.Bls12381g2]: aries_askar_shared_1.KeyAlgs.Bls12381G2,
    [core_1.KeyType.Bls12381g1g2]: aries_askar_shared_1.KeyAlgs.Bls12381G1G2,
    [core_1.KeyType.P256]: aries_askar_shared_1.KeyAlgs.EcSecp256r1,
    [core_1.KeyType.K256]: aries_askar_shared_1.KeyAlgs.EcSecp256k1,
};
const isKeyTypeSupportedByAskar = (keyType) => keyType in keyTypeToAskarAlg;
exports.isKeyTypeSupportedByAskar = isKeyTypeSupportedByAskar;
exports.keyTypesSupportedByAskar = Object.keys(keyTypeToAskarAlg);
