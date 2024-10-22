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
const didKeyBls12381g1_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyBls12381g1.json"));
const verificationMethod_1 = require("../../verificationMethod");
const bls12381g1_1 = require("../bls12381g1");
const TEST_BLS12381G1_BASE58_KEY = '6FywSzB5BPd7xehCo1G4nYHAoZPMMP3gd4PLnvgA6SsTsogtz8K7RDznqLpFPLZXAE';
const TEST_BLS12381G1_FINGERPRINT = 'z3tEFALUKUzzCAvytMHX8X4SnsNsq6T5tC5Zb18oQEt1FqNcJXqJ3AA9umgzA9yoqPBeWA';
const TEST_BLS12381G1_DID = `did:key:${TEST_BLS12381G1_FINGERPRINT}`;
const TEST_BLS12381G1_PREFIX_BYTES = utils_1.Buffer.concat([
    new Uint8Array([234, 1]),
    utils_1.TypedArrayEncoder.fromBase58(TEST_BLS12381G1_BASE58_KEY),
]);
describe('bls12381g1', () => {
    it('creates a Key instance from public key bytes and bls12381g1 key type', () => __awaiter(void 0, void 0, void 0, function* () {
        const publicKeyBytes = utils_1.TypedArrayEncoder.fromBase58(TEST_BLS12381G1_BASE58_KEY);
        const key = Key_1.Key.fromPublicKey(publicKeyBytes, crypto_1.KeyType.Bls12381g1);
        expect(key.fingerprint).toBe(TEST_BLS12381G1_FINGERPRINT);
    }));
    it('creates a Key instance from a base58 encoded public key and bls12381g1 key type', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = Key_1.Key.fromPublicKeyBase58(TEST_BLS12381G1_BASE58_KEY, crypto_1.KeyType.Bls12381g1);
        expect(key.fingerprint).toBe(TEST_BLS12381G1_FINGERPRINT);
    }));
    it('creates a Key instance from a fingerprint', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = Key_1.Key.fromFingerprint(TEST_BLS12381G1_FINGERPRINT);
        expect(key.publicKeyBase58).toBe(TEST_BLS12381G1_BASE58_KEY);
    }));
    it('should correctly calculate the getter properties', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = Key_1.Key.fromFingerprint(TEST_BLS12381G1_FINGERPRINT);
        expect(key.fingerprint).toBe(TEST_BLS12381G1_FINGERPRINT);
        expect(key.publicKeyBase58).toBe(TEST_BLS12381G1_BASE58_KEY);
        expect(key.publicKey).toEqual(utils_1.TypedArrayEncoder.fromBase58(TEST_BLS12381G1_BASE58_KEY));
        expect(key.keyType).toBe(crypto_1.KeyType.Bls12381g1);
        expect(key.prefixedPublicKey.equals(TEST_BLS12381G1_PREFIX_BYTES)).toBe(true);
    }));
    it('should return a valid verification method', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = Key_1.Key.fromFingerprint(TEST_BLS12381G1_FINGERPRINT);
        const verificationMethods = bls12381g1_1.keyDidBls12381g1.getVerificationMethods(TEST_BLS12381G1_DID, key);
        expect(utils_1.JsonTransformer.toJSON(verificationMethods)).toMatchObject([didKeyBls12381g1_json_1.default.verificationMethod[0]]);
    }));
    it('supports Bls12381G1Key2020 verification method type', () => {
        expect(bls12381g1_1.keyDidBls12381g1.supportedVerificationMethodTypes).toMatchObject(['Bls12381G1Key2020']);
    });
    it('returns key for Bls12381G1Key2020 verification method', () => {
        const verificationMethod = utils_1.JsonTransformer.fromJSON(didKeyBls12381g1_json_1.default.verificationMethod[0], verificationMethod_1.VerificationMethod);
        const key = bls12381g1_1.keyDidBls12381g1.getKeyFromVerificationMethod(verificationMethod);
        expect(key.fingerprint).toBe(TEST_BLS12381G1_FINGERPRINT);
    });
    it('throws an error if an invalid verification method is passed', () => {
        const verificationMethod = utils_1.JsonTransformer.fromJSON(didKeyBls12381g1_json_1.default.verificationMethod[0], verificationMethod_1.VerificationMethod);
        verificationMethod.type = 'SomeRandomType';
        expect(() => bls12381g1_1.keyDidBls12381g1.getKeyFromVerificationMethod(verificationMethod)).toThrowError("Verification method with type 'SomeRandomType' not supported for key type 'bls12381g1'");
    });
});
