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
const didKeyX25519_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyX25519.json"));
const verificationMethod_1 = require("../../verificationMethod");
const x25519_1 = require("../x25519");
const TEST_X25519_BASE58_KEY = '6fUMuABnqSDsaGKojbUF3P7ZkEL3wi2njsDdUWZGNgCU';
const TEST_X25519_FINGERPRINT = 'z6LShLeXRTzevtwcfehaGEzCMyL3bNsAeKCwcqwJxyCo63yE';
const TEST_X25519_DID = `did:key:${TEST_X25519_FINGERPRINT}`;
const TEST_X25519_PREFIX_BYTES = utils_1.Buffer.concat([
    new Uint8Array([236, 1]),
    utils_1.TypedArrayEncoder.fromBase58(TEST_X25519_BASE58_KEY),
]);
describe('x25519', () => {
    it('creates a Key instance from public key bytes and x25519 key type', () => __awaiter(void 0, void 0, void 0, function* () {
        const publicKeyBytes = utils_1.TypedArrayEncoder.fromBase58(TEST_X25519_BASE58_KEY);
        const didKey = Key_1.Key.fromPublicKey(publicKeyBytes, crypto_1.KeyType.X25519);
        expect(didKey.fingerprint).toBe(TEST_X25519_FINGERPRINT);
    }));
    it('creates a Key instance from a base58 encoded public key and x25519 key type', () => __awaiter(void 0, void 0, void 0, function* () {
        const didKey = Key_1.Key.fromPublicKeyBase58(TEST_X25519_BASE58_KEY, crypto_1.KeyType.X25519);
        expect(didKey.fingerprint).toBe(TEST_X25519_FINGERPRINT);
    }));
    it('creates a Key instance from a fingerprint', () => __awaiter(void 0, void 0, void 0, function* () {
        const didKey = Key_1.Key.fromFingerprint(TEST_X25519_FINGERPRINT);
        expect(didKey.fingerprint).toBe(TEST_X25519_FINGERPRINT);
    }));
    it('should correctly calculate the getter properties', () => __awaiter(void 0, void 0, void 0, function* () {
        const didKey = Key_1.Key.fromFingerprint(TEST_X25519_FINGERPRINT);
        expect(didKey.fingerprint).toBe(TEST_X25519_FINGERPRINT);
        expect(didKey.publicKeyBase58).toBe(TEST_X25519_BASE58_KEY);
        expect(didKey.publicKey).toEqual(utils_1.TypedArrayEncoder.fromBase58(TEST_X25519_BASE58_KEY));
        expect(didKey.keyType).toBe(crypto_1.KeyType.X25519);
        expect(didKey.prefixedPublicKey.equals(TEST_X25519_PREFIX_BYTES)).toBe(true);
    }));
    it('should return a valid verification method', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = Key_1.Key.fromFingerprint(TEST_X25519_FINGERPRINT);
        const verificationMethods = x25519_1.keyDidX25519.getVerificationMethods(TEST_X25519_DID, key);
        expect(utils_1.JsonTransformer.toJSON(verificationMethods)).toMatchObject([didKeyX25519_json_1.default.keyAgreement[0]]);
    }));
    it('supports X25519KeyAgreementKey2019 verification method type', () => {
        expect(x25519_1.keyDidX25519.supportedVerificationMethodTypes).toMatchObject(['X25519KeyAgreementKey2019', 'JsonWebKey2020']);
    });
    it('returns key for X25519KeyAgreementKey2019 verification method', () => {
        const verificationMethod = utils_1.JsonTransformer.fromJSON(didKeyX25519_json_1.default.keyAgreement[0], verificationMethod_1.VerificationMethod);
        const key = x25519_1.keyDidX25519.getKeyFromVerificationMethod(verificationMethod);
        expect(key.fingerprint).toBe(TEST_X25519_FINGERPRINT);
    });
    it('throws an error if an invalid verification method is passed', () => {
        const verificationMethod = utils_1.JsonTransformer.fromJSON(didKeyX25519_json_1.default.keyAgreement[0], verificationMethod_1.VerificationMethod);
        verificationMethod.type = 'SomeRandomType';
        expect(() => x25519_1.keyDidX25519.getKeyFromVerificationMethod(verificationMethod)).toThrowError(`Verification method with type 'SomeRandomType' not supported for key type 'x25519'`);
    });
});
