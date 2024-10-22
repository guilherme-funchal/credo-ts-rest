"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const JsonTransformer_1 = require("../../../utils/JsonTransformer");
const keyDidDocument_1 = require("../domain/keyDidDocument");
const key_1 = require("../methods/key");
const didKeyBls12381g1_json_1 = __importDefault(require("./__fixtures__/didKeyBls12381g1.json"));
const didKeyBls12381g1g2_json_1 = __importDefault(require("./__fixtures__/didKeyBls12381g1g2.json"));
const didKeyBls12381g2_json_1 = __importDefault(require("./__fixtures__/didKeyBls12381g2.json"));
const didKeyEd25519_json_1 = __importDefault(require("./__fixtures__/didKeyEd25519.json"));
const didKeyX25519_json_1 = __importDefault(require("./__fixtures__/didKeyX25519.json"));
const TEST_X25519_DID = 'did:key:z6LShLeXRTzevtwcfehaGEzCMyL3bNsAeKCwcqwJxyCo63yE';
const TEST_ED25519_DID = `did:key:z6MkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th`;
const TEST_BLS12381G1_DID = `did:key:z3tEFALUKUzzCAvytMHX8X4SnsNsq6T5tC5Zb18oQEt1FqNcJXqJ3AA9umgzA9yoqPBeWA`;
const TEST_BLS12381G2_DID = `did:key:zUC71nmwvy83x1UzNKbZbS7N9QZx8rqpQx3Ee3jGfKiEkZngTKzsRoqobX6wZdZF5F93pSGYYco3gpK9tc53ruWUo2tkBB9bxPCFBUjq2th8FbtT4xih6y6Q1K9EL4Th86NiCGT`;
const TEST_BLS12381G1G2_DID = `did:key:z5TcESXuYUE9aZWYwSdrUEGK1HNQFHyTt4aVpaCTVZcDXQmUheFwfNZmRksaAbBneNm5KyE52SdJeRCN1g6PJmF31GsHWwFiqUDujvasK3wTiDr3vvkYwEJHt7H5RGEKYEp1ErtQtcEBgsgY2DA9JZkHj1J9HZ8MRDTguAhoFtR4aTBQhgnkP4SwVbxDYMEZoF2TMYn3s`;
describe('getDidDocumentForKey', () => {
    it('should return a valid did:key did document for and x25519 key', () => {
        const didKey = key_1.DidKey.fromDid(TEST_X25519_DID);
        const didDocument = (0, keyDidDocument_1.getDidDocumentForKey)(TEST_X25519_DID, didKey.key);
        expect(JsonTransformer_1.JsonTransformer.toJSON(didDocument)).toMatchObject(didKeyX25519_json_1.default);
    });
    it('should return a valid did:key did document for and ed25519 key', () => {
        const didKey = key_1.DidKey.fromDid(TEST_ED25519_DID);
        const didDocument = (0, keyDidDocument_1.getDidDocumentForKey)(TEST_ED25519_DID, didKey.key);
        expect(JsonTransformer_1.JsonTransformer.toJSON(didDocument)).toMatchObject(didKeyEd25519_json_1.default);
    });
    it('should return a valid did:key did document for and bls12381g1 key', () => {
        const didKey = key_1.DidKey.fromDid(TEST_BLS12381G1_DID);
        const didDocument = (0, keyDidDocument_1.getDidDocumentForKey)(TEST_BLS12381G1_DID, didKey.key);
        expect(JsonTransformer_1.JsonTransformer.toJSON(didDocument)).toMatchObject(didKeyBls12381g1_json_1.default);
    });
    it('should return a valid did:key did document for and bls12381g2 key', () => {
        const didKey = key_1.DidKey.fromDid(TEST_BLS12381G2_DID);
        const didDocument = (0, keyDidDocument_1.getDidDocumentForKey)(TEST_BLS12381G2_DID, didKey.key);
        expect(JsonTransformer_1.JsonTransformer.toJSON(didDocument)).toMatchObject(didKeyBls12381g2_json_1.default);
    });
    it('should return a valid did:key did document for and bls12381g1g2 key', () => {
        const didKey = key_1.DidKey.fromDid(TEST_BLS12381G1G2_DID);
        const didDocument = (0, keyDidDocument_1.getDidDocumentForKey)(TEST_BLS12381G1G2_DID, didKey.key);
        expect(JsonTransformer_1.JsonTransformer.toJSON(didDocument)).toMatchObject(didKeyBls12381g1g2_json_1.default);
    });
});
