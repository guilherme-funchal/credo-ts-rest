"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../../utils");
const KeyType_1 = require("../../../KeyType");
const P256Jwk_1 = require("../P256Jwk");
const ecCompression_1 = require("../ecCompression");
const jwkJson = {
    kty: 'EC',
    crv: 'P-256',
    x: 'igrFmi0whuihKnj9R3Om1SoMph72wUGeFaBbzG2vzns',
    y: 'efsX5b10x8yjyrj4ny3pGfLcY7Xby1KzgqOdqnsrJIM',
};
describe('P_256JWk', () => {
    test('has correct properties', () => {
        const jwk = new P256Jwk_1.P256Jwk({ x: jwkJson.x, y: jwkJson.y });
        expect(jwk.kty).toEqual('EC');
        expect(jwk.crv).toEqual('P-256');
        expect(jwk.keyType).toEqual(KeyType_1.KeyType.P256);
        const publicKeyBuffer = utils_1.Buffer.concat([
            utils_1.TypedArrayEncoder.fromBase64(jwkJson.x),
            utils_1.TypedArrayEncoder.fromBase64(jwkJson.y),
        ]);
        const compressedPublicKey = utils_1.Buffer.from((0, ecCompression_1.compress)(publicKeyBuffer));
        expect(jwk.publicKey).toEqual(compressedPublicKey);
        expect(jwk.supportedEncryptionAlgorithms).toEqual([]);
        expect(jwk.supportedSignatureAlgorithms).toEqual(['ES256']);
        expect(jwk.key.keyType).toEqual(KeyType_1.KeyType.P256);
        expect(jwk.toJson()).toEqual(jwkJson);
    });
    test('fromJson', () => {
        const jwk = P256Jwk_1.P256Jwk.fromJson(jwkJson);
        expect(jwk.x).toEqual(jwkJson.x);
        expect(jwk.y).toEqual(jwkJson.y);
        expect(() => P256Jwk_1.P256Jwk.fromJson(Object.assign(Object.assign({}, jwkJson), { kty: 'test' }))).toThrowError("Invalid 'P-256' JWK.");
    });
    test('fromPublicKey', () => {
        const publicKeyBuffer = utils_1.Buffer.concat([
            utils_1.TypedArrayEncoder.fromBase64(jwkJson.x),
            utils_1.TypedArrayEncoder.fromBase64(jwkJson.y),
        ]);
        const compressedPublicKey = utils_1.Buffer.from((0, ecCompression_1.compress)(publicKeyBuffer));
        const jwk = P256Jwk_1.P256Jwk.fromPublicKey(compressedPublicKey);
        expect(jwk.x).toEqual(jwkJson.x);
        expect(jwk.y).toEqual(jwkJson.y);
    });
});
