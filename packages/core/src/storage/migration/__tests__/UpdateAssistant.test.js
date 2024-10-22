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
const InMemoryStorageService_1 = require("../../../../../../tests/InMemoryStorageService");
const src_1 = require("../../../../../indy-sdk/src");
const types_1 = require("../../../../../indy-sdk/src/types");
const setupIndySdkModule_1 = require("../../../../../indy-sdk/tests/setupIndySdkModule");
const helpers_1 = require("../../../../tests/helpers");
const Agent_1 = require("../../../agent/Agent");
const constants_1 = require("../../../constants");
const plugins_1 = require("../../../plugins");
const UpdateAssistant_1 = require("../UpdateAssistant");
const updates_1 = require("../updates");
const agentOptions = (0, helpers_1.getAgentOptions)('UpdateAssistant', {});
describe('UpdateAssistant', () => {
    let updateAssistant;
    let agent;
    let storageService;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const dependencyManager = new plugins_1.DependencyManager();
        storageService = new InMemoryStorageService_1.InMemoryStorageService();
        // If we register the IndySdkModule it will register the storage service, but we use in memory storage here
        dependencyManager.registerContextScoped(constants_1.InjectionSymbols.Wallet, src_1.IndySdkWallet);
        dependencyManager.registerInstance(types_1.IndySdkSymbol, setupIndySdkModule_1.indySdk);
        dependencyManager.registerInstance(constants_1.InjectionSymbols.StorageService, storageService);
        agent = new Agent_1.Agent(agentOptions, dependencyManager);
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
    describe('upgrade()', () => {
        it('should not upgrade records when upgrading after a new wallet is created', () => __awaiter(void 0, void 0, void 0, function* () {
            const beforeStorage = JSON.stringify(storageService.records);
            yield updateAssistant.update();
            expect(JSON.parse(beforeStorage)).toEqual(storageService.records);
        }));
    });
    describe('isUpToDate()', () => {
        it('should return true when a new wallet is created', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(yield updateAssistant.isUpToDate()).toBe(true);
        }));
    });
    describe('isUpToDate()', () => {
        it('should return true when a new wallet is created', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(yield updateAssistant.isUpToDate()).toBe(true);
        }));
        it('should return true for a lower version than current storage', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(yield updateAssistant.isUpToDate('0.2')).toBe(true);
        }));
        it('should return true for current agent storage version', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(yield updateAssistant.isUpToDate('0.3')).toBe(true);
        }));
        it('should return false for a higher version than current storage', () => __awaiter(void 0, void 0, void 0, function* () {
            // @ts-expect-error isUpToDate only allows existing versions to be passed, 100.100 is not a valid version (yet)
            expect(yield updateAssistant.isUpToDate('100.100')).toBe(false);
        }));
    });
    describe('UpdateAssistant.frameworkStorageVersion', () => {
        it(`should return ${updates_1.CURRENT_FRAMEWORK_STORAGE_VERSION}`, () => __awaiter(void 0, void 0, void 0, function* () {
            expect(UpdateAssistant_1.UpdateAssistant.frameworkStorageVersion).toBe(updates_1.CURRENT_FRAMEWORK_STORAGE_VERSION);
        }));
    });
    describe('getCurrentAgentStorageVersion()', () => {
        it(`should return ${updates_1.CURRENT_FRAMEWORK_STORAGE_VERSION} when a new wallet is created`, () => __awaiter(void 0, void 0, void 0, function* () {
            expect(yield updateAssistant.getCurrentAgentStorageVersion()).toBe(updates_1.CURRENT_FRAMEWORK_STORAGE_VERSION);
        }));
    });
});
