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
const didKeyBls12381g1_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyBls12381g1.json"));
const didKeyBls12381g1g2_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyBls12381g1g2.json"));
const didKeyBls12381g2_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyBls12381g2.json"));
const didKeyEd25519_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyEd25519.json"));
const didKeyX25519_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyX25519.json"));
const peerDidNumAlgo0_1 = require("../peerDidNumAlgo0");
describe('peerDidNumAlgo0', () => {
    describe('keyToNumAlgo0DidDocument', () => {
        test('transforms a key correctly into a peer did method 0 did document', () => __awaiter(void 0, void 0, void 0, function* () {
            const didDocuments = [didKeyEd25519_json_1.default, didKeyBls12381g1_json_1.default, didKeyX25519_json_1.default, didKeyBls12381g1g2_json_1.default, didKeyBls12381g2_json_1.default];
            for (const didDocument of didDocuments) {
                const key = crypto_1.Key.fromFingerprint(didDocument.id.split(':')[2]);
                const didPeerDocument = (0, peerDidNumAlgo0_1.keyToNumAlgo0DidDocument)(key);
                const expectedDidPeerDocument = JSON.parse(JSON.stringify(didDocument).replace(new RegExp('did:key:', 'g'), 'did:peer:0'));
                expect(didPeerDocument.toJSON()).toMatchObject(expectedDidPeerDocument);
            }
        }));
    });
    describe('didToNumAlgo0DidDocument', () => {
        test('transforms a method 0 did correctly into a did document', () => {
            const didDocuments = [didKeyEd25519_json_1.default, didKeyBls12381g1_json_1.default, didKeyX25519_json_1.default, didKeyBls12381g1g2_json_1.default, didKeyBls12381g2_json_1.default];
            for (const didDocument of didDocuments) {
                const didPeer = (0, peerDidNumAlgo0_1.didToNumAlgo0DidDocument)(didDocument.id.replace('did:key:', 'did:peer:0'));
                const expectedDidPeerDocument = JSON.parse(JSON.stringify(didDocument).replace(new RegExp('did:key:', 'g'), 'did:peer:0'));
                expect(didPeer.toJSON()).toMatchObject(expectedDidPeerDocument);
            }
        });
    });
});
