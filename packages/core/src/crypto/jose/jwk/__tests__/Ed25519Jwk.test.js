"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../../utils");
const KeyType_1 = require("../../../KeyType");
const Ed25519Jwk_1 = require("../Ed25519Jwk");
const jwkJson = {
    kty: 'OKP',
    crv: 'Ed25519',
    x: 'O2onvM62pC1io6jQKm8Nc2UyFXcd4kOmOsBIoYtZ2ik',
};
describe('Ed25519JWk', () => {
    test('has correct properties', () => {
        const jwk = new Ed25519Jwk_1.Ed25519Jwk({ x: jwkJson.x });
        expect(jwk.kty).toEqual('OKP');
        expect(jwk.crv).toEqual('Ed25519');
        expect(jwk.keyType).toEqual(KeyType_1.KeyType.Ed25519);
        expect(jwk.publicKey).toEqual(utils_1.TypedArrayEncoder.fromBase64(jwkJson.x));
        expect(jwk.supportedEncryptionAlgorithms).toEqual([]);
        expect(jwk.supportedSignatureAlgorithms).toEqual(['EdDSA']);
        expect(jwk.key.keyType).toEqual(KeyType_1.KeyType.Ed25519);
        expect(jwk.toJson()).toEqual(jwkJson);
    });
    test('fromJson', () => {
        const jwk = Ed25519Jwk_1.Ed25519Jwk.fromJson(jwkJson);
        expect(jwk.x).toEqual(jwkJson.x);
        expect(() => Ed25519Jwk_1.Ed25519Jwk.fromJson(Object.assign(Object.assign({}, jwkJson), { kty: 'test' }))).toThrowError("Invalid 'Ed25519' JWK.");
    });
    test('fromPublicKey', () => {
        const jwk = Ed25519Jwk_1.Ed25519Jwk.fromPublicKey(utils_1.TypedArrayEncoder.fromBase64(jwkJson.x));
        expect(jwk.x).toEqual(jwkJson.x);
    });
});
