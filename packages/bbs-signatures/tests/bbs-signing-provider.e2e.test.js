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
const bbs_signatures_1 = require("@mattrglobal/bbs-signatures");
const logger_1 = __importDefault(require("../../core/tests/logger"));
const src_1 = require("../../indy-sdk/src");
const setupIndySdkModule_1 = require("../../indy-sdk/tests/setupIndySdkModule");
const src_2 = require("../src");
const util_1 = require("./util");
// use raw key derivation method to speed up wallet creating / opening / closing between tests
const walletConfig = {
    id: 'Wallet: BBS Signing Provider',
    // generated using indy.generateWalletKey
    key: 'CwNJroKHTSSj3XvE7ZAnuKiTn2C4QkFvxEqfm5rzhNrb',
    keyDerivationMethod: core_1.KeyDerivationMethod.Raw,
};
(0, util_1.describeSkipNode17And18)('BBS Signing Provider', () => {
    let wallet;
    const seed = core_1.TypedArrayEncoder.fromString('sample-seed-min-of-32-bytes-long');
    const message = core_1.TypedArrayEncoder.fromString('sample-message');
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        wallet = new src_1.IndySdkWallet(setupIndySdkModule_1.indySdk, logger_1.default, new core_1.SigningProviderRegistry([new src_2.Bls12381g2SigningProvider()]));
        yield wallet.createAndOpen(walletConfig);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield wallet.delete();
    }));
    test('Create bls12381g2 keypair', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(wallet.createKey({ seed, keyType: core_1.KeyType.Bls12381g2 })).resolves.toMatchObject({
            publicKeyBase58: '25TvGExLTWRTgn9h2wZuohrQmmLafXiacY4dhv66wcbY8pLbuNTBRMTgWVcPKh2wsEyrRPmnhLdc4C7LEcJ2seoxzBkoydJEdQD8aqg5dw8wesBTS9Twg8EjuFG1WPRAiERd',
            keyType: core_1.KeyType.Bls12381g2,
        });
    }));
    test('Fail to create bls12381g1g2 keypair', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(wallet.createKey({ seed, keyType: core_1.KeyType.Bls12381g1g2 })).rejects.toThrowError(core_1.WalletError);
    }));
    test('Create a signature with a bls12381g2 keypair', () => __awaiter(void 0, void 0, void 0, function* () {
        const bls12381g2Key = yield wallet.createKey({ seed, keyType: core_1.KeyType.Bls12381g2 });
        const signature = yield wallet.sign({
            data: message,
            key: bls12381g2Key,
        });
        expect(signature.length).toStrictEqual(bbs_signatures_1.BBS_SIGNATURE_LENGTH);
    }));
    test('Verify a signed message with a bls12381g2 publicKey', () => __awaiter(void 0, void 0, void 0, function* () {
        const bls12381g2Key = yield wallet.createKey({ seed, keyType: core_1.KeyType.Bls12381g2 });
        const signature = yield wallet.sign({
            data: message,
            key: bls12381g2Key,
        });
        yield expect(wallet.verify({ key: bls12381g2Key, data: message, signature })).resolves.toStrictEqual(true);
    }));
});
