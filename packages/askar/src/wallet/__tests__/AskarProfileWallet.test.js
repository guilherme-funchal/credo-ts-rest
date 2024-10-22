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
const core_1 = require("@aries-framework/core");
const runInVersion_1 = require("../../../../../tests/runInVersion");
const tests_1 = require("../../../../core/tests");
const AskarProfileWallet_1 = require("../AskarProfileWallet");
const AskarWallet_1 = require("../AskarWallet");
// use raw key derivation method to speed up wallet creating / opening / closing between tests
const rootWalletConfig = {
    id: 'Wallet: AskarProfileWalletTest',
    // generated using indy.generateWalletKey
    key: 'CwNJroKHTSSj3XvE7ZAnuKiTn2C4QkFvxEqfm5rzhNrb',
    keyDerivationMethod: core_1.KeyDerivationMethod.Raw,
};
(0, runInVersion_1.describeRunInNodeVersion)([18], 'AskarWallet management', () => {
    let rootAskarWallet;
    let profileAskarWallet;
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        if (profileAskarWallet) {
            yield profileAskarWallet.delete();
        }
        if (rootAskarWallet) {
            yield rootAskarWallet.delete();
        }
    }));
    test('Create, open, close, delete', () => __awaiter(void 0, void 0, void 0, function* () {
        const signingProviderRegistry = new core_1.SigningProviderRegistry([]);
        rootAskarWallet = new AskarWallet_1.AskarWallet(tests_1.testLogger, new tests_1.agentDependencies.FileSystem(), signingProviderRegistry);
        // Create and open wallet
        yield rootAskarWallet.createAndOpen(rootWalletConfig);
        profileAskarWallet = new AskarProfileWallet_1.AskarProfileWallet(rootAskarWallet.store, tests_1.testLogger, signingProviderRegistry);
        // Create, open and close profile
        yield profileAskarWallet.create(Object.assign(Object.assign({}, rootWalletConfig), { id: 'profile-id' }));
        yield profileAskarWallet.open(Object.assign(Object.assign({}, rootWalletConfig), { id: 'profile-id' }));
        yield profileAskarWallet.close();
        // try to re-create it
        yield expect(profileAskarWallet.createAndOpen(Object.assign(Object.assign({}, rootWalletConfig), { id: 'profile-id' }))).rejects.toThrowError(core_1.WalletDuplicateError);
        // Re-open profile
        yield profileAskarWallet.open(Object.assign(Object.assign({}, rootWalletConfig), { id: 'profile-id' }));
        // try to open non-existent wallet
        yield expect(profileAskarWallet.open(Object.assign(Object.assign({}, rootWalletConfig), { id: 'non-existent-profile-id' }))).rejects.toThrowError(core_1.WalletNotFoundError);
    }));
});
