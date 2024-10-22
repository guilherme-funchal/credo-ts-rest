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
const core_1 = require("@aries-framework/core");
const indy_sdk_1 = __importDefault(require("indy-sdk"));
const logger_1 = __importDefault(require("../../../../core/tests/logger"));
const IndySdkWallet_1 = require("../IndySdkWallet");
// use raw key derivation method to speed up wallet creating / opening / closing between tests
const walletConfig = {
    id: 'Wallet: IndySdkWalletTest',
    // generated using indy.generateWalletKey
    key: 'CwNJroKHTSSj3XvE7ZAnuKiTn2C4QkFvxEqfm5rzhNrb',
    keyDerivationMethod: core_1.KeyDerivationMethod.Raw,
};
const signingProvider = {
    keyType: core_1.KeyType.X25519,
    createKeyPair: () => Promise.resolve({ keyType: core_1.KeyType.X25519, privateKeyBase58: 'b', publicKeyBase58: 'a' }),
};
describe('IndySdkWallet', () => {
    let indySdkWallet;
    const privateKey = core_1.TypedArrayEncoder.fromString('sample-seed');
    const message = core_1.TypedArrayEncoder.fromString('sample-message');
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        indySdkWallet = new IndySdkWallet_1.IndySdkWallet(indy_sdk_1.default, logger_1.default, new core_1.SigningProviderRegistry([signingProvider]));
        yield indySdkWallet.createAndOpen(walletConfig);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield indySdkWallet.delete();
    }));
    test('Get the wallet handle', () => {
        expect(indySdkWallet.handle).toEqual(expect.any(Number));
    });
    test('supportedKeyTypes', () => {
        // indy supports ed25519, signing provider supports x25519
        expect(indySdkWallet.supportedKeyTypes).toEqual([core_1.KeyType.Ed25519, core_1.KeyType.X25519]);
    });
    test('Generate Nonce', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(indySdkWallet.generateNonce()).resolves.toEqual(expect.any(String));
    }));
    test('Create ed25519 keypair from private key', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(indySdkWallet.createKey({
            privateKey: core_1.TypedArrayEncoder.fromString('2103de41b4ae37e8e28586d84a342b67'),
            keyType: core_1.KeyType.Ed25519,
        })).resolves.toMatchObject({
            keyType: core_1.KeyType.Ed25519,
        });
    }));
    test('throws WalletKeyExistsError when a key already exists', () => __awaiter(void 0, void 0, void 0, function* () {
        const privateKey = core_1.TypedArrayEncoder.fromString('2103de41b4ae37e8e28586d84a342b68');
        yield expect(indySdkWallet.createKey({ privateKey, keyType: core_1.KeyType.Ed25519 })).resolves.toEqual(expect.any(core_1.Key));
        yield expect(indySdkWallet.createKey({ privateKey, keyType: core_1.KeyType.Ed25519 })).rejects.toThrowError(core_1.WalletKeyExistsError);
        // This should result in the signign provider being called twice, resulting in the record
        // being stored twice
        yield expect(indySdkWallet.createKey({ privateKey, keyType: core_1.KeyType.X25519 })).resolves.toEqual(expect.any(core_1.Key));
        yield expect(indySdkWallet.createKey({ privateKey, keyType: core_1.KeyType.X25519 })).rejects.toThrowError(core_1.WalletKeyExistsError);
    }));
    test('Fail to create ed25519 keypair from invalid private key', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(indySdkWallet.createKey({ privateKey, keyType: core_1.KeyType.Ed25519 })).rejects.toThrowError(/Invalid private key provided/);
    }));
    test('Fail to create x25519 keypair', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(indySdkWallet.createKey({ keyType: core_1.KeyType.Bls12381g1 })).rejects.toThrowError(/Unsupported key type/);
    }));
    test('Create a signature with a ed25519 keypair', () => __awaiter(void 0, void 0, void 0, function* () {
        const ed25519Key = yield indySdkWallet.createKey({ keyType: core_1.KeyType.Ed25519 });
        const signature = yield indySdkWallet.sign({
            data: message,
            key: ed25519Key,
        });
        expect(signature.length).toStrictEqual(64);
    }));
    test('Verify a signed message with a ed25519 publicKey', () => __awaiter(void 0, void 0, void 0, function* () {
        const ed25519Key = yield indySdkWallet.createKey({ keyType: core_1.KeyType.Ed25519 });
        const signature = yield indySdkWallet.sign({
            data: message,
            key: ed25519Key,
        });
        yield expect(indySdkWallet.verify({ key: ed25519Key, data: message, signature })).resolves.toStrictEqual(true);
    }));
});
