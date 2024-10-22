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
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const setupIndySdkModule_1 = require("../../../../../indy-sdk/tests/setupIndySdkModule");
const helpers_1 = require("../../../../tests/helpers");
const Agent_1 = require("../../../agent/Agent");
const constants_1 = require("../../../constants");
const error_1 = require("../../../error");
const credentials_1 = require("../../../modules/credentials");
const utils_1 = require("../../../utils");
const StorageUpdateService_1 = require("../StorageUpdateService");
const UpdateAssistant_1 = require("../UpdateAssistant");
const agentOptions = (0, helpers_1.getAgentOptions)('UpdateAssistant | Backup', {}, (0, setupIndySdkModule_1.getIndySdkModules)());
const aliceCredentialRecordsString = (0, fs_1.readFileSync)(path_1.default.join(__dirname, '__fixtures__/alice-4-credentials-0.1.json'), 'utf8');
const backupDate = new Date('2022-03-21T22:50:20.522Z');
jest.useFakeTimers().setSystemTime(backupDate);
const backupIdentifier = backupDate.getTime();
describe('UpdateAssistant | Backup', () => {
    let updateAssistant;
    let agent;
    let backupPath;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = new Agent_1.Agent(agentOptions);
        const fileSystem = agent.dependencyManager.resolve(constants_1.InjectionSymbols.FileSystem);
        backupPath = `${fileSystem.dataPath}/migration/backup/${backupIdentifier}`;
        // If tests fail it's possible the cleanup has been skipped. So remove before running tests
        const doesFileSystemExist = yield fileSystem.exists(backupPath);
        if (doesFileSystemExist) {
            (0, fs_1.unlinkSync)(backupPath);
        }
        const doesbackupFileSystemExist = yield fileSystem.exists(`${backupPath}-error`);
        if (doesbackupFileSystemExist) {
            (0, fs_1.unlinkSync)(`${backupPath}-error`);
        }
        updateAssistant = new UpdateAssistant_1.UpdateAssistant(agent, {
            v0_1ToV0_2: {
                mediationRoleUpdateStrategy: 'allMediator',
            },
        });
        yield updateAssistant.initialize();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    it('should create a backup', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const aliceCredentialRecordsJson = JSON.parse(aliceCredentialRecordsString);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aliceCredentialRecords = Object.values(aliceCredentialRecordsJson).map((data) => {
            const record = utils_1.JsonTransformer.fromJSON(data.value, credentials_1.CredentialExchangeRecord);
            record.setTags(data.tags);
            return record;
        });
        const credentialRepository = agent.dependencyManager.resolve(credentials_1.CredentialRepository);
        const storageUpdateService = agent.dependencyManager.resolve(StorageUpdateService_1.StorageUpdateService);
        // Add 0.1 data and set version to 0.1
        for (const credentialRecord of aliceCredentialRecords) {
            yield credentialRepository.save(agent.context, credentialRecord);
        }
        yield storageUpdateService.setCurrentStorageVersion(agent.context, '0.1');
        // Expect an update is needed
        expect(yield updateAssistant.isUpToDate()).toBe(false);
        const fileSystem = agent.dependencyManager.resolve(constants_1.InjectionSymbols.FileSystem);
        // Backup should not exist before update
        expect(yield fileSystem.exists(backupPath)).toBe(false);
        const walletSpy = jest.spyOn(agent.wallet, 'export');
        // Create update
        yield updateAssistant.update();
        // A wallet export should have been initiated
        expect(walletSpy).toHaveBeenCalledWith({ key: (_a = agent.wallet.walletConfig) === null || _a === void 0 ? void 0 : _a.key, path: backupPath });
        // Backup should be cleaned after update
        expect(yield fileSystem.exists(backupPath)).toBe(false);
        expect((yield credentialRepository.getAll(agent.context)).sort((a, b) => a.id.localeCompare(b.id))).toMatchSnapshot();
    }));
    it('should restore the backup if an error occurs during the update', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const aliceCredentialRecordsJson = JSON.parse(aliceCredentialRecordsString);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aliceCredentialRecords = Object.values(aliceCredentialRecordsJson).map((data) => {
            const record = utils_1.JsonTransformer.fromJSON(data.value, credentials_1.CredentialExchangeRecord);
            record.setTags(data.tags);
            return record;
        });
        const credentialRepository = agent.dependencyManager.resolve(credentials_1.CredentialRepository);
        const storageUpdateService = agent.dependencyManager.resolve(StorageUpdateService_1.StorageUpdateService);
        // Add 0.1 data and set version to 0.1
        for (const credentialRecord of aliceCredentialRecords) {
            yield credentialRepository.save(agent.context, credentialRecord);
        }
        yield storageUpdateService.setCurrentStorageVersion(agent.context, '0.1');
        // Expect an update is needed
        expect(yield updateAssistant.isUpToDate()).toBe(false);
        jest.spyOn(updateAssistant, 'getNeededUpdates').mockResolvedValue([
            {
                fromVersion: '0.1',
                toVersion: '0.2',
                doUpdate: () => __awaiter(void 0, void 0, void 0, function* () {
                    throw new error_1.AriesFrameworkError("Uh oh I'm broken");
                }),
            },
        ]);
        const fileSystem = agent.dependencyManager.resolve(constants_1.InjectionSymbols.FileSystem);
        // Backup should not exist before update
        expect(yield fileSystem.exists(backupPath)).toBe(false);
        let updateError = undefined;
        try {
            yield updateAssistant.update();
        }
        catch (error) {
            updateError = error;
        }
        expect((_a = updateError === null || updateError === void 0 ? void 0 : updateError.cause) === null || _a === void 0 ? void 0 : _a.message).toEqual("Uh oh I'm broken");
        // Only backup error should exist after update
        expect(yield fileSystem.exists(backupPath)).toBe(false);
        expect(yield fileSystem.exists(`${backupPath}-error`)).toBe(true);
        // Wallet should be same as when we started because of backup
        expect((yield credentialRepository.getAll(agent.context)).sort((a, b) => a.id.localeCompare(b.id))).toEqual(aliceCredentialRecords.sort((a, b) => a.id.localeCompare(b.id)));
    }));
});
