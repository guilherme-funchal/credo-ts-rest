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
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const core_1 = require("@aries-framework/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const runInVersion_1 = require("../../../tests/runInVersion");
const helpers_1 = require("./helpers");
const aliceAgentOptions = (0, helpers_1.getSqliteAgentOptions)('AgentsAlice');
const bobAgentOptions = (0, helpers_1.getSqliteAgentOptions)('AgentsBob');
// FIXME: Re-include in tests when Askar NodeJS wrapper performance is improved
(0, runInVersion_1.describeRunInNodeVersion)([18], 'Askar SQLite agents', () => {
    let aliceAgent;
    let bobAgent;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        aliceAgent = new core_1.Agent(aliceAgentOptions);
        bobAgent = new core_1.Agent(bobAgentOptions);
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
            key: 'mysecretwalletkey-0',
        };
        try {
            yield aliceAgent.wallet.open(walletConfig);
        }
        catch (error) {
            if (error instanceof core_1.WalletNotFoundError) {
                yield aliceAgent.wallet.create(walletConfig);
                yield aliceAgent.wallet.open(walletConfig);
            }
        }
        yield aliceAgent.initialize();
        expect(aliceAgent.isInitialized).toBe(true);
    }));
    test('when opening non-existing wallet throw WalletNotFoundError', () => __awaiter(void 0, void 0, void 0, function* () {
        const walletConfig = {
            id: 'mywallet',
            key: 'mysecretwalletkey-1',
        };
        yield expect(aliceAgent.wallet.open(walletConfig)).rejects.toThrowError(core_1.WalletNotFoundError);
    }));
    test('when create wallet and shutdown, wallet is closed', () => __awaiter(void 0, void 0, void 0, function* () {
        const walletConfig = {
            id: 'mywallet',
            key: 'mysecretwalletkey-2',
        };
        yield aliceAgent.wallet.create(walletConfig);
        yield aliceAgent.shutdown();
        yield expect(aliceAgent.wallet.open(walletConfig)).resolves.toBeUndefined();
    }));
    test('create wallet with custom key derivation method', () => __awaiter(void 0, void 0, void 0, function* () {
        const walletConfig = {
            id: 'mywallet',
            key: aries_askar_shared_1.Store.generateRawKey(core_1.TypedArrayEncoder.fromString('mysecretwalletkey')),
            keyDerivationMethod: core_1.KeyDerivationMethod.Raw,
        };
        yield aliceAgent.wallet.createAndOpen(walletConfig);
        expect(aliceAgent.wallet.isInitialized).toBe(true);
    }));
    test('when exporting and importing a wallet, content is copied', () => __awaiter(void 0, void 0, void 0, function* () {
        yield bobAgent.initialize();
        const bobBasicMessageRepository = bobAgent.dependencyManager.resolve(core_1.BasicMessageRepository);
        const basicMessageRecord = new core_1.BasicMessageRecord({
            id: 'some-id',
            connectionId: 'connId',
            content: 'hello',
            role: core_1.BasicMessageRole.Receiver,
            sentTime: 'sentIt',
        });
        // Save in wallet
        yield bobBasicMessageRepository.save(bobAgent.context, basicMessageRecord);
        if (!bobAgent.config.walletConfig) {
            throw new Error('No wallet config on bobAgent');
        }
        const backupKey = 'someBackupKey';
        const backupWalletName = `backup-${core_1.utils.uuid()}`;
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
    test('throws error when attempting to export and import to existing paths', () => __awaiter(void 0, void 0, void 0, function* () {
        yield bobAgent.initialize();
        if (!bobAgent.config.walletConfig) {
            throw new Error('No wallet config on bobAgent');
        }
        const backupKey = 'someBackupKey';
        const backupWalletName = `backup-${core_1.utils.uuid()}`;
        const backupPath = path_1.default.join((0, os_1.tmpdir)(), backupWalletName);
        // Create backup and try to export it again to the same path
        yield bobAgent.wallet.export({ path: backupPath, key: backupKey });
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () { return yield bobAgent.wallet.export({ path: backupPath, key: backupKey }); })).rejects.toThrowError(/Unable to create export/);
        yield bobAgent.wallet.delete();
        // Import backup with different wallet id and initialize
        yield bobAgent.wallet.import({ id: backupWalletName, key: backupWalletName }, { path: backupPath, key: backupKey });
        yield bobAgent.wallet.initialize({ id: backupWalletName, key: backupWalletName });
        yield bobAgent.wallet.close();
        // Try to import again an existing wallet
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            return yield bobAgent.wallet.import({ id: backupWalletName, key: backupWalletName }, { path: backupPath, key: backupKey });
        })).rejects.toThrowError(/Unable to import wallet/);
    }));
    test('throws error when attempting to import using wrong key', () => __awaiter(void 0, void 0, void 0, function* () {
        yield bobAgent.initialize();
        if (!bobAgent.config.walletConfig) {
            throw new Error('No wallet config on bobAgent');
        }
        const backupKey = 'someBackupKey';
        const wrongBackupKey = 'wrongBackupKey';
        const backupWalletName = `backup-${core_1.utils.uuid()}`;
        const backupPath = path_1.default.join((0, os_1.tmpdir)(), backupWalletName);
        // Create backup and try to export it again to the same path
        yield bobAgent.wallet.export({ path: backupPath, key: backupKey });
        yield bobAgent.wallet.delete();
        // Try to import backup with wrong key
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            return yield bobAgent.wallet.import({ id: backupWalletName, key: backupWalletName }, { path: backupPath, key: wrongBackupKey });
        })).rejects.toThrow();
        // Try to import again using the correct key
        yield bobAgent.wallet.import({ id: backupWalletName, key: backupWalletName }, { path: backupPath, key: backupKey });
        yield bobAgent.wallet.initialize({ id: backupWalletName, key: backupWalletName });
        yield bobAgent.wallet.close();
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
    test('when creating already existing wallet throw WalletDuplicateError', () => __awaiter(void 0, void 0, void 0, function* () {
        const walletConfig = {
            id: 'mywallet',
            key: 'mysecretwalletkey-2',
        };
        yield aliceAgent.wallet.create(walletConfig);
        yield expect(aliceAgent.wallet.create(walletConfig)).rejects.toThrowError(core_1.WalletDuplicateError);
    }));
    test('when opening wallet with invalid key throw WalletInvalidKeyError', () => __awaiter(void 0, void 0, void 0, function* () {
        const walletConfig = {
            id: 'mywallet',
            key: 'mysecretwalletkey-3',
        };
        yield aliceAgent.wallet.create(walletConfig);
        yield expect(aliceAgent.wallet.open(Object.assign(Object.assign({}, walletConfig), { key: 'abcd' }))).rejects.toThrowError(core_1.WalletInvalidKeyError);
    }));
});
