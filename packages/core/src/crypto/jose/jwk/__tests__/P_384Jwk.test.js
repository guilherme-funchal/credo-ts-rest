"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../../utils");
const KeyType_1 = require("../../../KeyType");
const P384Jwk_1 = require("../P384Jwk");
const ecCompression_1 = require("../ecCompression");
const jwkJson = {
    kty: 'EC',
    crv: 'P-384',
    x: 'lInTxl8fjLKp_UCrxI0WDklahi-7-_6JbtiHjiRvMvhedhKVdHBfi2HCY8t_QJyc',
    y: 'y6N1IC-2mXxHreETBW7K3mBcw0qGr3CWHCs-yl09yCQRLcyfGv7XhqAngHOu51Zv',
};
describe('P_384JWk', () => {
    test('has correct properties', () => {
        const jwk = new P384Jwk_1.P384Jwk({ x: jwkJson.x, y: jwkJson.y });
        expect(jwk.kty).toEqual('EC');
        expect(jwk.crv).toEqual('P-384');
        expect(jwk.keyType).toEqual(KeyType_1.KeyType.P384);
        const publicKeyBuffer = utils_1.Buffer.concat([
            utils_1.TypedArrayEncoder.fromBase64(jwkJson.x),
            utils_1.TypedArrayEncoder.fromBase64(jwkJson.y),
        ]);
        const compressedPublicKey = utils_1.Buffer.from((0, ecCompression_1.compress)(publicKeyBuffer));
        expect(jwk.publicKey).toEqual(compressedPublicKey);
        expect(jwk.supportedEncryptionAlgorithms).toEqual([]);
        expect(jwk.supportedSignatureAlgorithms).toEqual(['ES384']);
        expect(jwk.key.keyType).toEqual(KeyType_1.KeyType.P384);
        expect(jwk.toJson()).toEqual(jwkJson);
    });
    test('fromJson', () => {
        const jwk = P384Jwk_1.P384Jwk.fromJson(jwkJson);
        expect(jwk.x).toEqual(jwkJson.x);
        expect(jwk.y).toEqual(jwkJson.y);
        expect(() => P384Jwk_1.P384Jwk.fromJson(Object.assign(Object.assign({}, jwkJson), { kty: 'test' }))).toThrowError("Invalid 'P-384' JWK.");
    });
    test('fromPublicKey', () => {
        const publicKeyBuffer = utils_1.Buffer.concat([
            utils_1.TypedArrayEncoder.fromBase64(jwkJson.x),
            utils_1.TypedArrayEncoder.fromBase64(jwkJson.y),
        ]);
        const compressedPublicKey = utils_1.Buffer.from((0, ecCompression_1.compress)(publicKeyBuffer));
        const jwk = P384Jwk_1.P384Jwk.fromPublicKey(compressedPublicKey);
        expect(jwk.x).toEqual(jwkJson.x);
        expect(jwk.y).toEqual(jwkJson.y);
    });
});
