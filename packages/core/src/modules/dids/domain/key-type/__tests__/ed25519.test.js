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
const didKeyEd25519_json_1 = __importDefault(require("../../../__tests__/__fixtures__//didKeyEd25519.json"));
const verificationMethod_1 = require("../../../domain/verificationMethod");
const ed25519_1 = require("../ed25519");
const TEST_ED25519_BASE58_KEY = '8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K';
const TEST_ED25519_FINGERPRINT = 'z6MkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th';
const TEST_ED25519_DID = `did:key:${TEST_ED25519_FINGERPRINT}`;
const TEST_ED25519_PREFIX_BYTES = utils_1.Buffer.concat([
    new Uint8Array([237, 1]),
    utils_1.TypedArrayEncoder.fromBase58(TEST_ED25519_BASE58_KEY),
]);
describe('ed25519', () => {
    it('creates a Key instance from public key bytes and ed25519 key type', () => __awaiter(void 0, void 0, void 0, function* () {
        const publicKeyBytes = utils_1.TypedArrayEncoder.fromBase58(TEST_ED25519_BASE58_KEY);
        const didKey = Key_1.Key.fromPublicKey(publicKeyBytes, crypto_1.KeyType.Ed25519);
        expect(didKey.fingerprint).toBe(TEST_ED25519_FINGERPRINT);
    }));
    it('creates a Key instance from a base58 encoded public key and ed25519 key type', () => __awaiter(void 0, void 0, void 0, function* () {
        const didKey = Key_1.Key.fromPublicKeyBase58(TEST_ED25519_BASE58_KEY, crypto_1.KeyType.Ed25519);
        expect(didKey.fingerprint).toBe(TEST_ED25519_FINGERPRINT);
    }));
    it('creates a Key instance from a fingerprint', () => __awaiter(void 0, void 0, void 0, function* () {
        const didKey = Key_1.Key.fromFingerprint(TEST_ED25519_FINGERPRINT);
        expect(didKey.fingerprint).toBe(TEST_ED25519_FINGERPRINT);
    }));
    it('should correctly calculate the getter properties', () => __awaiter(void 0, void 0, void 0, function* () {
        const didKey = Key_1.Key.fromFingerprint(TEST_ED25519_FINGERPRINT);
        expect(didKey.fingerprint).toBe(TEST_ED25519_FINGERPRINT);
        expect(didKey.publicKeyBase58).toBe(TEST_ED25519_BASE58_KEY);
        expect(didKey.publicKey).toEqual(utils_1.TypedArrayEncoder.fromBase58(TEST_ED25519_BASE58_KEY));
        expect(didKey.keyType).toBe(crypto_1.KeyType.Ed25519);
        expect(didKey.prefixedPublicKey.equals(TEST_ED25519_PREFIX_BYTES)).toBe(true);
    }));
    it('should return a valid verification method', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = Key_1.Key.fromFingerprint(TEST_ED25519_FINGERPRINT);
        const verificationMethods = ed25519_1.keyDidEd25519.getVerificationMethods(TEST_ED25519_DID, key);
        expect(utils_1.JsonTransformer.toJSON(verificationMethods)).toMatchObject([didKeyEd25519_json_1.default.verificationMethod[0]]);
    }));
    it('supports Ed25519VerificationKey2018 verification method type', () => {
        expect(ed25519_1.keyDidEd25519.supportedVerificationMethodTypes).toMatchObject([
            'Ed25519VerificationKey2018',
            'Ed25519VerificationKey2020',
            'JsonWebKey2020',
        ]);
    });
    it('returns key for Ed25519VerificationKey2018 verification method', () => {
        const verificationMethod = utils_1.JsonTransformer.fromJSON(didKeyEd25519_json_1.default.verificationMethod[0], verificationMethod_1.VerificationMethod);
        const key = ed25519_1.keyDidEd25519.getKeyFromVerificationMethod(verificationMethod);
        expect(key.fingerprint).toBe(TEST_ED25519_FINGERPRINT);
    });
    it('returns key for Ed25519VerificationKey2020 verification method', () => {
        const verificationMethod = utils_1.JsonTransformer.fromJSON({
            id: 'did:example:123',
            type: 'Ed25519VerificationKey2020',
            controller: 'did:example:123',
            publicKeyMultibase: 'z6MkkBWg1AnNxxWiq77gJDeHsLhGN6JV9Y3d6WiTifUs1sZi',
        }, verificationMethod_1.VerificationMethod);
        const key = ed25519_1.keyDidEd25519.getKeyFromVerificationMethod(verificationMethod);
        expect(key.publicKeyBase58).toBe('6jFdQvXwdR2FicGycegT2F9GYX2djeoGQVoXtPWr6enL');
    });
    it('throws an error if an invalid verification method is passed', () => {
        const verificationMethod = utils_1.JsonTransformer.fromJSON(didKeyEd25519_json_1.default.verificationMethod[0], verificationMethod_1.VerificationMethod);
        verificationMethod.type = 'SomeRandomType';
        expect(() => ed25519_1.keyDidEd25519.getKeyFromVerificationMethod(verificationMethod)).toThrowError("Verification method with type 'SomeRandomType' not supported for key type 'ed25519'");
    });
});
