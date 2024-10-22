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
const Key_1 = require("../../../../../crypto/Key");
const utils_1 = require("../../../../../utils");
const didKeyP256_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyP256.json"));
const verificationMethod_1 = require("../../verificationMethod");
const JsonWebKey2020_1 = require("../../verificationMethod/JsonWebKey2020");
const keyDidJsonWebKey_1 = require("../keyDidJsonWebKey");
const TEST_P256_FINGERPRINT = 'zDnaerx9CtbPJ1q36T5Ln5wYt3MQYeGRG5ehnPAmxcf5mDZpv';
const TEST_P256_DID = `did:key:${TEST_P256_FINGERPRINT}`;
describe('keyDidJsonWebKey', () => {
    it('should return a valid verification method', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = Key_1.Key.fromFingerprint(TEST_P256_FINGERPRINT);
        const verificationMethods = keyDidJsonWebKey_1.keyDidJsonWebKey.getVerificationMethods(TEST_P256_DID, key);
        expect(utils_1.JsonTransformer.toJSON(verificationMethods)).toMatchObject([didKeyP256_json_1.default.verificationMethod[0]]);
    }));
    it('supports no verification method type', () => {
        expect(keyDidJsonWebKey_1.keyDidJsonWebKey.supportedVerificationMethodTypes).toMatchObject([
            JsonWebKey2020_1.VERIFICATION_METHOD_TYPE_JSON_WEB_KEY_2020,
        ]);
    });
    it('returns key for JsonWebKey2020 verification method', () => {
        const verificationMethod = utils_1.JsonTransformer.fromJSON(didKeyP256_json_1.default.verificationMethod[0], verificationMethod_1.VerificationMethod);
        const key = keyDidJsonWebKey_1.keyDidJsonWebKey.getKeyFromVerificationMethod(verificationMethod);
        expect(key.fingerprint).toBe(TEST_P256_FINGERPRINT);
    });
    it('throws an error if an invalid verification method is passed', () => {
        const verificationMethod = utils_1.JsonTransformer.fromJSON(didKeyP256_json_1.default.verificationMethod[0], verificationMethod_1.VerificationMethod);
        verificationMethod.type = 'SomeRandomType';
        expect(() => keyDidJsonWebKey_1.keyDidJsonWebKey.getKeyFromVerificationMethod(verificationMethod)).toThrowError('Invalid verification method passed');
    });
});
