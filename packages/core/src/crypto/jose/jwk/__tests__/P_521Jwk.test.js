"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../../utils");
const KeyType_1 = require("../../../KeyType");
const P521Jwk_1 = require("../P521Jwk");
const ecCompression_1 = require("../ecCompression");
const jwkJson = {
    kty: 'EC',
    crv: 'P-521',
    x: 'ASUHPMyichQ0QbHZ9ofNx_l4y7luncn5feKLo3OpJ2nSbZoC7mffolj5uy7s6KSKXFmnNWxGJ42IOrjZ47qqwqyS',
    y: 'AW9ziIC4ZQQVSNmLlp59yYKrjRY0_VqO-GOIYQ9tYpPraBKUloEId6cI_vynCzlZWZtWpgOM3HPhYEgawQ703RjC',
};
describe('P_521JWk', () => {
    test('has correct properties', () => {
        const jwk = new P521Jwk_1.P521Jwk({ x: jwkJson.x, y: jwkJson.y });
        expect(jwk.kty).toEqual('EC');
        expect(jwk.crv).toEqual('P-521');
        expect(jwk.keyType).toEqual(KeyType_1.KeyType.P521);
        const publicKeyBuffer = utils_1.Buffer.concat([
            utils_1.TypedArrayEncoder.fromBase64(jwkJson.x),
            utils_1.TypedArrayEncoder.fromBase64(jwkJson.y),
        ]);
        const compressedPublicKey = utils_1.Buffer.from((0, ecCompression_1.compress)(publicKeyBuffer));
        expect(jwk.publicKey).toEqual(compressedPublicKey);
        expect(jwk.supportedEncryptionAlgorithms).toEqual([]);
        expect(jwk.supportedSignatureAlgorithms).toEqual(['ES512']);
        expect(jwk.key.keyType).toEqual(KeyType_1.KeyType.P521);
        expect(jwk.toJson()).toEqual(jwkJson);
    });
    test('fromJson', () => {
        const jwk = P521Jwk_1.P521Jwk.fromJson(jwkJson);
        expect(jwk.x).toEqual(jwkJson.x);
        expect(jwk.y).toEqual(jwkJson.y);
        expect(() => P521Jwk_1.P521Jwk.fromJson(Object.assign(Object.assign({}, jwkJson), { kty: 'test' }))).toThrowError("Invalid 'P-521' JWK.");
    });
    test('fromPublicKey', () => {
        const publicKeyBuffer = utils_1.Buffer.concat([
            utils_1.TypedArrayEncoder.fromBase64(jwkJson.x),
            utils_1.TypedArrayEncoder.fromBase64(jwkJson.y),
        ]);
        const compressedPublicKey = utils_1.Buffer.from((0, ecCompression_1.compress)(publicKeyBuffer));
        const jwk = P521Jwk_1.P521Jwk.fromPublicKey(compressedPublicKey);
        expect(jwk.x).toEqual(jwkJson.x);
        expect(jwk.y).toEqual(jwkJson.y);
    });
});
