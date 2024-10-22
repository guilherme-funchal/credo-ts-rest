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
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const runInVersion_1 = require("../../../../../tests/runInVersion");
const base58_1 = require("../../../../core/src/utils/base58");
const helpers_1 = require("../../../../core/tests/helpers");
const logger_1 = __importDefault(require("../../../../core/tests/logger"));
const AskarWallet_1 = require("../AskarWallet");
// use raw key derivation method to speed up wallet creating / opening / closing between tests
const walletConfig = {
    id: 'Wallet: AskarWalletTest',
    // generated using indy.generateWalletKey
    key: 'CwNJroKHTSSj3XvE7ZAnuKiTn2C4QkFvxEqfm5rzhNrb',
    keyDerivationMethod: core_1.KeyDerivationMethod.Raw,
};
(0, runInVersion_1.describeRunInNodeVersion)([18], 'AskarWallet basic operations', () => {
    let askarWallet;
    const seed = core_1.TypedArrayEncoder.fromString('sample-seed-min-of-32-bytes-long');
    const privateKey = core_1.TypedArrayEncoder.fromString('2103de41b4ae37e8e28586d84a342b67');
    const message = core_1.TypedArrayEncoder.fromString('sample-message');
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        askarWallet = new AskarWallet_1.AskarWallet(logger_1.default, new helpers_1.agentDependencies.FileSystem(), new core_1.SigningProviderRegistry([]));
        yield askarWallet.createAndOpen(walletConfig);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield askarWallet.delete();
    }));
    test('supportedKeyTypes', () => {
        expect(askarWallet.supportedKeyTypes).toEqual([
            core_1.KeyType.Ed25519,
            core_1.KeyType.X25519,
            core_1.KeyType.Bls12381g1,
            core_1.KeyType.Bls12381g2,
            core_1.KeyType.Bls12381g1g2,
            core_1.KeyType.P256,
            core_1.KeyType.K256,
        ]);
    });
    test('Get the wallet store', () => {
        expect(askarWallet.store).toEqual(expect.any(aries_askar_shared_1.Store));
    });
    test('Generate Nonce', () => __awaiter(void 0, void 0, void 0, function* () {
        const nonce = yield askarWallet.generateNonce();
        expect(nonce).toMatch(/[0-9]+/);
    }));
    test('Create ed25519 keypair from seed', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = yield askarWallet.createKey({
            seed,
            keyType: core_1.KeyType.Ed25519,
        });
        expect(key).toMatchObject({
            keyType: core_1.KeyType.Ed25519,
        });
    }));
    test('Create ed25519 keypair from private key', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = yield askarWallet.createKey({
            privateKey,
            keyType: core_1.KeyType.Ed25519,
        });
        expect(key).toMatchObject({
            keyType: core_1.KeyType.Ed25519,
        });
    }));
    test('Attempt to create ed25519 keypair from both seed and private key', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(askarWallet.createKey({
            privateKey,
            seed,
            keyType: core_1.KeyType.Ed25519,
        })).rejects.toThrowError();
    }));
    test('Create x25519 keypair', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(askarWallet.createKey({ seed, keyType: core_1.KeyType.X25519 })).resolves.toMatchObject({
            keyType: core_1.KeyType.X25519,
        });
    }));
    test('Create P-256 keypair', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(askarWallet.createKey({ seed: core_1.Buffer.concat([seed, seed]), keyType: core_1.KeyType.P256 })).resolves.toMatchObject({
            keyType: core_1.KeyType.P256,
        });
    }));
    test('throws WalletKeyExistsError when a key already exists', () => __awaiter(void 0, void 0, void 0, function* () {
        const privateKey = core_1.TypedArrayEncoder.fromString('2103de41b4ae37e8e28586d84a342b68');
        yield expect(askarWallet.createKey({ privateKey, keyType: core_1.KeyType.Ed25519 })).resolves.toEqual(expect.any(core_1.Key));
        yield expect(askarWallet.createKey({ privateKey, keyType: core_1.KeyType.Ed25519 })).rejects.toThrowError(core_1.WalletKeyExistsError);
    }));
    test('Fail to create a P384 keypair', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(askarWallet.createKey({ seed, keyType: core_1.KeyType.P384 })).rejects.toThrowError(core_1.WalletError);
    }));
    test('Create a signature with a ed25519 keypair', () => __awaiter(void 0, void 0, void 0, function* () {
        const ed25519Key = yield askarWallet.createKey({ keyType: core_1.KeyType.Ed25519 });
        const signature = yield askarWallet.sign({
            data: message,
            key: ed25519Key,
        });
        expect(signature.length).toStrictEqual(64);
    }));
    test('Verify a signed message with a ed25519 publicKey', () => __awaiter(void 0, void 0, void 0, function* () {
        const ed25519Key = yield askarWallet.createKey({ keyType: core_1.KeyType.Ed25519 });
        const signature = yield askarWallet.sign({
            data: message,
            key: ed25519Key,
        });
        yield expect(askarWallet.verify({ key: ed25519Key, data: message, signature })).resolves.toStrictEqual(true);
    }));
});
describe.skip('Currently, all KeyTypes are supported by Askar natively', () => {
    describe('AskarWallet with custom signing provider', () => {
        let askarWallet;
        const seed = core_1.TypedArrayEncoder.fromString('sample-seed');
        const message = core_1.TypedArrayEncoder.fromString('sample-message');
        class DummySigningProvider {
            constructor() {
                this.keyType = core_1.KeyType.Bls12381g1g2;
            }
            createKeyPair(options) {
                return __awaiter(this, void 0, void 0, function* () {
                    return {
                        publicKeyBase58: (0, base58_1.encodeToBase58)(core_1.Buffer.from(options.seed || core_1.TypedArrayEncoder.fromString('publicKeyBase58'))),
                        privateKeyBase58: 'privateKeyBase58',
                        keyType: core_1.KeyType.Bls12381g1g2,
                    };
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            sign(options) {
                return __awaiter(this, void 0, void 0, function* () {
                    return new core_1.Buffer('signed');
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            verify(options) {
                return __awaiter(this, void 0, void 0, function* () {
                    return true;
                });
            }
        }
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            askarWallet = new AskarWallet_1.AskarWallet(logger_1.default, new helpers_1.agentDependencies.FileSystem(), new core_1.SigningProviderRegistry([new DummySigningProvider()]));
            yield askarWallet.createAndOpen(walletConfig);
        }));
        afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield askarWallet.delete();
        }));
        test('Create custom keypair and use it for signing', () => __awaiter(void 0, void 0, void 0, function* () {
            const key = yield askarWallet.createKey({ seed, keyType: core_1.KeyType.Bls12381g1g2 });
            expect(key.keyType).toBe(core_1.KeyType.Bls12381g1g2);
            expect(key.publicKeyBase58).toBe((0, base58_1.encodeToBase58)(core_1.Buffer.from(seed)));
            const signature = yield askarWallet.sign({
                data: message,
                key,
            });
            expect(signature).toBeInstanceOf(core_1.Buffer);
        }));
        test('Create custom keypair and use it for verifying', () => __awaiter(void 0, void 0, void 0, function* () {
            const key = yield askarWallet.createKey({ seed, keyType: core_1.KeyType.Bls12381g1g2 });
            expect(key.keyType).toBe(core_1.KeyType.Bls12381g1g2);
            expect(key.publicKeyBase58).toBe((0, base58_1.encodeToBase58)(core_1.Buffer.from(seed)));
            const signature = yield askarWallet.verify({
                data: message,
                signature: new core_1.Buffer('signature'),
                key,
            });
            expect(signature).toBeTruthy();
        }));
        test('Attempt to create the same custom keypair twice', () => __awaiter(void 0, void 0, void 0, function* () {
            yield askarWallet.createKey({ seed: core_1.TypedArrayEncoder.fromString('keybase58'), keyType: core_1.KeyType.Bls12381g1g2 });
            yield expect(askarWallet.createKey({ seed: core_1.TypedArrayEncoder.fromString('keybase58'), keyType: core_1.KeyType.Bls12381g1g2 })).rejects.toThrow(core_1.WalletError);
        }));
    });
});
(0, runInVersion_1.describeRunInNodeVersion)([18], 'AskarWallet management', () => {
    let askarWallet;
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        if (askarWallet) {
            yield askarWallet.delete();
        }
    }));
    test('Create', () => __awaiter(void 0, void 0, void 0, function* () {
        askarWallet = new AskarWallet_1.AskarWallet(logger_1.default, new helpers_1.agentDependencies.FileSystem(), new core_1.SigningProviderRegistry([]));
        const initialKey = aries_askar_shared_1.Store.generateRawKey();
        const anotherKey = aries_askar_shared_1.Store.generateRawKey();
        // Create and open wallet
        yield askarWallet.createAndOpen(Object.assign(Object.assign({}, walletConfig), { id: 'AskarWallet Create', key: initialKey }));
        // Close and try to re-create it
        yield askarWallet.close();
        yield expect(askarWallet.createAndOpen(Object.assign(Object.assign({}, walletConfig), { id: 'AskarWallet Create', key: anotherKey }))).rejects.toThrowError(core_1.WalletDuplicateError);
    }));
    test('Open', () => __awaiter(void 0, void 0, void 0, function* () {
        askarWallet = new AskarWallet_1.AskarWallet(logger_1.default, new helpers_1.agentDependencies.FileSystem(), new core_1.SigningProviderRegistry([]));
        const initialKey = aries_askar_shared_1.Store.generateRawKey();
        const wrongKey = aries_askar_shared_1.Store.generateRawKey();
        // Create and open wallet
        yield askarWallet.createAndOpen(Object.assign(Object.assign({}, walletConfig), { id: 'AskarWallet Open', key: initialKey }));
        // Close and try to re-opening it with a wrong key
        yield askarWallet.close();
        yield expect(askarWallet.open(Object.assign(Object.assign({}, walletConfig), { id: 'AskarWallet Open', key: wrongKey }))).rejects.toThrowError(core_1.WalletInvalidKeyError);
        // Try to open a non existent wallet
        yield expect(askarWallet.open(Object.assign(Object.assign({}, walletConfig), { id: 'AskarWallet Open - Non existent', key: initialKey }))).rejects.toThrowError(core_1.WalletNotFoundError);
    }));
    test('Rotate key', () => __awaiter(void 0, void 0, void 0, function* () {
        askarWallet = new AskarWallet_1.AskarWallet(logger_1.default, new helpers_1.agentDependencies.FileSystem(), new core_1.SigningProviderRegistry([]));
        const initialKey = aries_askar_shared_1.Store.generateRawKey();
        yield askarWallet.createAndOpen(Object.assign(Object.assign({}, walletConfig), { id: 'AskarWallet Key Rotation', key: initialKey }));
        yield askarWallet.close();
        const newKey = aries_askar_shared_1.Store.generateRawKey();
        yield askarWallet.rotateKey(Object.assign(Object.assign({}, walletConfig), { id: 'AskarWallet Key Rotation', key: initialKey, rekey: newKey, rekeyDerivationMethod: core_1.KeyDerivationMethod.Raw }));
        yield askarWallet.close();
        yield expect(askarWallet.open(Object.assign(Object.assign({}, walletConfig), { id: 'AskarWallet Key Rotation', key: initialKey }))).rejects.toThrowError(core_1.WalletInvalidKeyError);
        yield askarWallet.open(Object.assign(Object.assign({}, walletConfig), { id: 'AskarWallet Key Rotation', key: newKey }));
        yield askarWallet.close();
    }));
});
