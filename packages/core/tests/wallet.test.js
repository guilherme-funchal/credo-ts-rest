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
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const setupIndySdkModule_1 = require("../../indy-sdk/tests/setupIndySdkModule");
const Agent_1 = require("../src/agent/Agent");
const basic_messages_1 = require("../src/modules/basic-messages");
const types_1 = require("../src/types");
const uuid_1 = require("../src/utils/uuid");
const error_1 = require("../src/wallet/error");
const WalletDuplicateError_1 = require("../src/wallet/error/WalletDuplicateError");
const WalletNotFoundError_1 = require("../src/wallet/error/WalletNotFoundError");
const helpers_1 = require("./helpers");
const aliceAgentOptions = (0, helpers_1.getAgentOptions)('wallet-tests-Alice', {}, (0, setupIndySdkModule_1.getIndySdkModules)());
const bobAgentOptions = (0, helpers_1.getAgentOptions)('wallet-tests-Bob', {}, (0, setupIndySdkModule_1.getIndySdkModules)());
describe('wallet', () => {
    let aliceAgent;
    let bobAgent;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        aliceAgent = new Agent_1.Agent(aliceAgentOptions);
        bobAgent = new Agent_1.Agent(bobAgentOptions);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield aliceAgent.shutdown();
        yield bobAgent.shutdown();
        if (aliceAgent.wallet.isProvisioned) {
            yield aliceAgent.wallet.delete();
        }
        if (bobAgent.wallet.isProvisioned) {
            yield bobAgent.wallet.delete();
        }
    }));
    test('open, create and open wallet with different wallet key that it is in agent config', () => __awaiter(void 0, void 0, void 0, function* () {
        const walletConfig = {
            id: 'mywallet',
            key: 'mysecretwalletkey',
        };
        try {
            yield aliceAgent.wallet.open(walletConfig);
        }
        catch (error) {
            if (error instanceof WalletNotFoundError_1.WalletNotFoundError) {
                yield aliceAgent.wallet.create(walletConfig);
                yield aliceAgent.wallet.open(walletConfig);
            }
        }
        yield aliceAgent.initialize();
        expect(aliceAgent.isInitialized).toBe(true);
    }));
    test('when creating already existing wallet throw WalletDuplicateError', () => __awaiter(void 0, void 0, void 0, function* () {
        const walletConfig = {
            id: 'mywallet',
            key: 'mysecretwalletkey',
        };
        yield aliceAgent.wallet.create(walletConfig);
        yield expect(aliceAgent.wallet.create(walletConfig)).rejects.toThrowError(WalletDuplicateError_1.WalletDuplicateError);
    }));
    test('when opening non-existing wallet throw WalletNotFoundError', () => __awaiter(void 0, void 0, void 0, function* () {
        const walletConfig = {
            id: 'mywallet',
            key: 'mysecretwalletkey',
        };
        yield expect(aliceAgent.wallet.open(walletConfig)).rejects.toThrowError(WalletNotFoundError_1.WalletNotFoundError);
    }));
    test('when opening wallet with invalid key throw WalletInvalidKeyError', () => __awaiter(void 0, void 0, void 0, function* () {
        const walletConfig = {
            id: 'mywallet',
            key: 'mysecretwalletkey',
        };
        yield aliceAgent.wallet.create(walletConfig);
        yield expect(aliceAgent.wallet.open(Object.assign(Object.assign({}, walletConfig), { key: 'abcd' }))).rejects.toThrowError(error_1.WalletInvalidKeyError);
    }));
    test('when create wallet and shutdown, wallet is closed', () => __awaiter(void 0, void 0, void 0, function* () {
        const walletConfig = {
            id: 'mywallet',
            key: 'mysecretwalletkey',
        };
        yield aliceAgent.wallet.create(walletConfig);
        yield aliceAgent.shutdown();
        yield expect(aliceAgent.wallet.open(walletConfig)).resolves.toBeUndefined();
    }));
    test('create wallet with custom key derivation method', () => __awaiter(void 0, void 0, void 0, function* () {
        const walletConfig = {
            id: 'mywallet',
            key: 'mysecretwalletkey',
            keyDerivationMethod: types_1.KeyDerivationMethod.Argon2IInt,
        };
        yield aliceAgent.wallet.createAndOpen(walletConfig);
        expect(aliceAgent.wallet.isInitialized).toBe(true);
    }));
    test('when exporting and importing a wallet, content is copied', () => __awaiter(void 0, void 0, void 0, function* () {
        yield bobAgent.initialize();
        const bobBasicMessageRepository = bobAgent.dependencyManager.resolve(basic_messages_1.BasicMessageRepository);
        const basicMessageRecord = new basic_messages_1.BasicMessageRecord({
            id: 'some-id',
            connectionId: 'connId',
            content: 'hello',
            role: basic_messages_1.BasicMessageRole.Receiver,
            sentTime: 'sentIt',
        });
        // Save in wallet
        yield bobBasicMessageRepository.save(bobAgent.context, basicMessageRecord);
        if (!bobAgent.config.walletConfig) {
            throw new Error('No wallet config on bobAgent');
        }
        const backupKey = 'someBackupKey';
        const backupWalletName = `backup-${(0, uuid_1.uuid)()}`;
        const backupPath = path_1.default.join((0, os_1.tmpdir)(), backupWalletName);
        // Create backup and delete wallet
        yield bobAgent.wallet.export({ path: backupPath, key: backupKey });
        yield bobAgent.wallet.delete();
        // Initialize the wallet again and assert record does not exist
        // This should create a new wallet
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        yield bobAgent.wallet.initialize(bobAgentOptions.config.walletConfig);
        expect(yield bobBasicMessageRepository.findById(bobAgent.context, basicMessageRecord.id)).toBeNull();
        yield bobAgent.wallet.delete();
        // Import backup with different wallet id and initialize
        yield bobAgent.wallet.import({ id: backupWalletName, key: backupWalletName }, { path: backupPath, key: backupKey });
        yield bobAgent.wallet.initialize({ id: backupWalletName, key: backupWalletName });
        // Expect same basic message record to exist in new wallet
        expect(yield bobBasicMessageRepository.getById(bobAgent.context, basicMessageRecord.id)).toMatchObject({
            id: basicMessageRecord.id,
            connectionId: basicMessageRecord.connectionId,
            content: basicMessageRecord.content,
            createdAt: basicMessageRecord.createdAt,
            updatedAt: basicMessageRecord.updatedAt,
            type: basicMessageRecord.type,
        });
    }));
    test('changing wallet key', () => __awaiter(void 0, void 0, void 0, function* () {
        const walletConfig = {
            id: 'mywallet',
            key: 'mysecretwalletkey',
        };
        yield aliceAgent.wallet.createAndOpen(walletConfig);
        yield aliceAgent.initialize();
        //Close agent
        const walletConfigRekey = {
            id: 'mywallet',
            key: 'mysecretwalletkey',
            rekey: '123',
        };
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.rotateKey(walletConfigRekey);
        yield aliceAgent.initialize();
        expect(aliceAgent.isInitialized).toBe(true);
    }));
});
