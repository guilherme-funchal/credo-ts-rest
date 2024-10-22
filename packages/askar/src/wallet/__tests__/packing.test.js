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
const runInVersion_1 = require("../../../../../tests/runInVersion");
const helpers_1 = require("../../../../core/tests/helpers");
const logger_1 = __importDefault(require("../../../../core/tests/logger"));
const AskarWallet_1 = require("../AskarWallet");
// use raw key derivation method to speed up wallet creating / opening / closing between tests
const walletConfig = {
    id: 'Askar Wallet Packing',
    // generated using indy.generateWalletKey
    key: 'CwNJroKHTSSj3XvE7ZAnuKiTn2C4QkFvxEqfm5rzhNrb',
    keyDerivationMethod: core_1.KeyDerivationMethod.Raw,
};
(0, runInVersion_1.describeRunInNodeVersion)([18], 'askarWallet packing', () => {
    let askarWallet;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        askarWallet = new AskarWallet_1.AskarWallet(logger_1.default, new helpers_1.agentDependencies.FileSystem(), new core_1.SigningProviderRegistry([]));
        yield askarWallet.createAndOpen(walletConfig);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield askarWallet.delete();
    }));
    test('DIDComm V1 packing and unpacking', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create both sender and recipient keys
        const senderKey = yield askarWallet.createKey({ keyType: core_1.KeyType.Ed25519 });
        const recipientKey = yield askarWallet.createKey({ keyType: core_1.KeyType.Ed25519 });
        const message = new core_1.BasicMessage({ content: 'hello' });
        const encryptedMessage = yield askarWallet.pack(message.toJSON(), [recipientKey.publicKeyBase58], senderKey.publicKeyBase58);
        const plainTextMessage = yield askarWallet.unpack(encryptedMessage);
        expect(core_1.JsonTransformer.fromJSON(plainTextMessage.plaintextMessage, core_1.BasicMessage)).toEqual(message);
    }));
});
