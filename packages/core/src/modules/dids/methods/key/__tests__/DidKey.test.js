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
const didKeyBls12381g1_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyBls12381g1.json"));
const didKeyBls12381g1g2_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyBls12381g1g2.json"));
const didKeyBls12381g2_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyBls12381g2.json"));
const didKeyEd25519_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyEd25519.json"));
const didKeyP256_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyP256.json"));
const didKeyP384_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyP384.json"));
const didKeyP521_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyP521.json"));
const didKeyX25519_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyX25519.json"));
const DidKey_1 = require("../DidKey");
describe('DidKey', () => {
    it('creates a DidKey instance from a did', () => __awaiter(void 0, void 0, void 0, function* () {
        const documentTypes = [
            didKeyX25519_json_1.default,
            didKeyEd25519_json_1.default,
            didKeyBls12381g1_json_1.default,
            didKeyBls12381g2_json_1.default,
            didKeyBls12381g1g2_json_1.default,
            didKeyP256_json_1.default,
            didKeyP384_json_1.default,
            didKeyP521_json_1.default,
        ];
        for (const documentType of documentTypes) {
            const didKey = DidKey_1.DidKey.fromDid(documentType.id);
            expect(didKey.didDocument.toJSON()).toMatchObject(documentType);
        }
    }));
    it('creates a DidKey instance from a key instance', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = Key_1.Key.fromPublicKeyBase58(didKeyX25519_json_1.default.keyAgreement[0].publicKeyBase58, crypto_1.KeyType.X25519);
        const didKey = new DidKey_1.DidKey(key);
        expect(didKey.did).toBe(didKeyX25519_json_1.default.id);
        expect(didKey.didDocument.toJSON()).toMatchObject(didKeyX25519_json_1.default);
    }));
});
