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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("../../../../../crypto");
const Key_1 = require("../../../../../crypto/Key");
const utils_1 = require("../../../../../utils");
const didKeyBls12381g2_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyBls12381g2.json"));
const verificationMethod_1 = require("../../verificationMethod");
const bls12381g2_1 = require("../bls12381g2");
const TEST_BLS12381G2_BASE58_KEY = 'mxE4sHTpbPcmxNviRVR9r7D2taXcNyVJmf9TBUFS1gRt3j3Ej9Seo59GQeCzYwbQgDrfWCwEJvmBwjLvheAky5N2NqFVzk4kuq3S8g4Fmekai4P622vHqWjFrsioYYDqhf9';
const TEST_BLS12381G2_FINGERPRINT = 'zUC71nmwvy83x1UzNKbZbS7N9QZx8rqpQx3Ee3jGfKiEkZngTKzsRoqobX6wZdZF5F93pSGYYco3gpK9tc53ruWUo2tkBB9bxPCFBUjq2th8FbtT4xih6y6Q1K9EL4Th86NiCGT';
const TEST_BLS12381G2_DID = `did:key:${TEST_BLS12381G2_FINGERPRINT}`;
const TEST_BLS12381G2_PREFIX_BYTES = utils_1.Buffer.concat([
    new Uint8Array([235, 1]),
    utils_1.TypedArrayEncoder.fromBase58(TEST_BLS12381G2_BASE58_KEY),
]);
describe('bls12381g2', () => {
    it('creates a Key instance from public key bytes and bls12381g2 key type', () => __awaiter(void 0, void 0, void 0, function* () {
        const publicKeyBytes = utils_1.TypedArrayEncoder.fromBase58(TEST_BLS12381G2_BASE58_KEY);
        const key = Key_1.Key.fromPublicKey(publicKeyBytes, crypto_1.KeyType.Bls12381g2);
        expect(key.fingerprint).toBe(TEST_BLS12381G2_FINGERPRINT);
    }));
    it('creates a Key instance from a base58 encoded public key and bls12381g2 key type', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = Key_1.Key.fromPublicKeyBase58(TEST_BLS12381G2_BASE58_KEY, crypto_1.KeyType.Bls12381g2);
        expect(key.fingerprint).toBe(TEST_BLS12381G2_FINGERPRINT);
    }));
    it('creates a Key instance from a fingerprint', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = Key_1.Key.fromFingerprint(TEST_BLS12381G2_FINGERPRINT);
        expect(key.publicKeyBase58).toBe(TEST_BLS12381G2_BASE58_KEY);
    }));
    it('should correctly calculate the getter properties', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = Key_1.Key.fromFingerprint(TEST_BLS12381G2_FINGERPRINT);
        expect(key.fingerprint).toBe(TEST_BLS12381G2_FINGERPRINT);
        expect(key.publicKeyBase58).toBe(TEST_BLS12381G2_BASE58_KEY);
        expect(key.publicKey).toEqual(utils_1.TypedArrayEncoder.fromBase58(TEST_BLS12381G2_BASE58_KEY));
        expect(key.keyType).toBe(crypto_1.KeyType.Bls12381g2);
        expect(key.prefixedPublicKey.equals(TEST_BLS12381G2_PREFIX_BYTES)).toBe(true);
    }));
    it('should return a valid verification method', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = Key_1.Key.fromFingerprint(TEST_BLS12381G2_FINGERPRINT);
        const verificationMethods = bls12381g2_1.keyDidBls12381g2.getVerificationMethods(TEST_BLS12381G2_DID, key);
        expect(utils_1.JsonTransformer.toJSON(verificationMethods)).toMatchObject([didKeyBls12381g2_json_1.default.verificationMethod[0]]);
    }));
    it('supports Bls12381G2Key2020 verification method type', () => {
        expect(bls12381g2_1.keyDidBls12381g2.supportedVerificationMethodTypes).toMatchObject(['Bls12381G2Key2020']);
    });
    it('returns key for Bls12381G2Key2020 verification method', () => {
        const verificationMethod = utils_1.JsonTransformer.fromJSON(didKeyBls12381g2_json_1.default.verificationMethod[0], verificationMethod_1.VerificationMethod);
        const key = bls12381g2_1.keyDidBls12381g2.getKeyFromVerificationMethod(verificationMethod);
        expect(key.fingerprint).toBe(TEST_BLS12381G2_FINGERPRINT);
    });
    it('throws an error if an invalid verification method is passed', () => {
        const verificationMethod = utils_1.JsonTransformer.fromJSON(didKeyBls12381g2_json_1.default.verificationMethod[0], verificationMethod_1.VerificationMethod);
        verificationMethod.type = 'SomeRandomType';
        expect(() => bls12381g2_1.keyDidBls12381g2.getKeyFromVerificationMethod(verificationMethod)).toThrowError("Verification method with type 'SomeRandomType' not supported for key type 'bls12381g2'");
    });
});
