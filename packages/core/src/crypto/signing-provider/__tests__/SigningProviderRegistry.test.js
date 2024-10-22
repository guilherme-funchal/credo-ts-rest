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
Object.defineProperty(exports, "__esModule", { value: true });
const KeyType_1 = require("../../KeyType");
const SigningProviderRegistry_1 = require("../SigningProviderRegistry");
class SigningProviderMock {
    constructor() {
        this.keyType = KeyType_1.KeyType.Bls12381g2;
    }
    createKeyPair() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    sign() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    verify() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
}
const signingProvider = new SigningProviderMock();
const signingProviderRegistry = new SigningProviderRegistry_1.SigningProviderRegistry([signingProvider]);
describe('SigningProviderRegistry', () => {
    describe('hasProviderForKeyType', () => {
        test('returns true if the key type is registered', () => {
            expect(signingProviderRegistry.hasProviderForKeyType(KeyType_1.KeyType.Bls12381g2)).toBe(true);
        });
        test('returns false if the key type is not registered', () => {
            expect(signingProviderRegistry.hasProviderForKeyType(KeyType_1.KeyType.Ed25519)).toBe(false);
        });
    });
    describe('getProviderForKeyType', () => {
        test('returns the correct provider  true if the key type is registered', () => {
            expect(signingProviderRegistry.getProviderForKeyType(KeyType_1.KeyType.Bls12381g2)).toBe(signingProvider);
        });
        test('throws error if the key type is not registered', () => {
            expect(() => signingProviderRegistry.getProviderForKeyType(KeyType_1.KeyType.Ed25519)).toThrowError('No signing key provider for key type: ed25519');
        });
    });
});
