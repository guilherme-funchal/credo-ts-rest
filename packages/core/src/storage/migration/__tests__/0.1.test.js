"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const InMemoryStorageService_1 = require("../../../../../../tests/InMemoryStorageService");
const src_1 = require("../../../../../indy-sdk/src");
const types_1 = require("../../../../../indy-sdk/src/types");
const setupIndySdkModule_1 = require("../../../../../indy-sdk/tests/setupIndySdkModule");
const src_2 = require("../../../../src");
const helpers_1 = require("../../../../tests/helpers");
const constants_1 = require("../../../constants");
const plugins_1 = require("../../../plugins");
const uuid = __importStar(require("../../../utils/uuid"));
const UpdateAssistant_1 = require("../UpdateAssistant");
const backupDate = new Date('2022-01-21T22:50:20.522Z');
jest.useFakeTimers().setSystemTime(backupDate);
const walletConfig = {
    id: `Wallet: 0.1 Update`,
    key: `Key: 0.1 Update`,
};
const mediationRoleUpdateStrategies = [
    'allMediator',
    'allRecipient',
    'doNotChange',
    'recipientIfEndpoint',
];
describe('UpdateAssistant | v0.1 - v0.2', () => {
    it(`should correctly update the role in the mediation record`, () => __awaiter(void 0, void 0, void 0, function* () {
        const aliceMediationRecordsString = (0, fs_1.readFileSync)(path_1.default.join(__dirname, '__fixtures__/alice-4-mediators-0.1.json'), 'utf8');
        for (const mediationRoleUpdateStrategy of mediationRoleUpdateStrategies) {
            const dependencyManager = new plugins_1.DependencyManager();
            const storageService = new InMemoryStorageService_1.InMemoryStorageService();
            dependencyManager.registerInstance(constants_1.InjectionSymbols.StorageService, storageService);
            // If we register the IndySdkModule it will register the storage service, but we use in memory storage here
            dependencyManager.registerContextScoped(constants_1.InjectionSymbols.Wallet, src_1.IndySdkWallet);
            dependencyManager.registerInstance(types_1.IndySdkSymbol, setupIndySdkModule_1.indySdk);
            const agent = new src_2.Agent({
                config: { label: 'Test Agent', walletConfig },
                dependencies: helpers_1.agentDependencies,
            }, dependencyManager);
            const updateAssistant = new UpdateAssistant_1.UpdateAssistant(agent, {
                v0_1ToV0_2: {
                    mediationRoleUpdateStrategy,
                },
            });
            yield updateAssistant.initialize();
            // Set storage after initialization. This mimics as if this wallet
            // is opened as an existing wallet instead of a new wallet
            storageService.records = JSON.parse(aliceMediationRecordsString);
            expect(yield updateAssistant.getNeededUpdates('0.2')).toEqual([
                {
                    fromVersion: '0.1',
                    toVersion: '0.2',
                    doUpdate: expect.any(Function),
                },
            ]);
            yield updateAssistant.update('0.2');
            expect(yield updateAssistant.isUpToDate('0.2')).toBe(true);
            expect(yield updateAssistant.getNeededUpdates('0.2')).toEqual([]);
            // MEDIATOR_ROUTING_RECORD recipientKeys will be different every time, and is not what we're testing here
            delete storageService.records.MEDIATOR_ROUTING_RECORD;
            expect(storageService.records).toMatchSnapshot(mediationRoleUpdateStrategy);
            yield agent.shutdown();
            yield agent.wallet.delete();
        }
    }));
    it(`should correctly update credential records and create didcomm records`, () => __awaiter(void 0, void 0, void 0, function* () {
        // We need to mock the uuid generation to make sure we generate consistent uuids for the new records created.
        let uuidCounter = 1;
        const uuidSpy = jest.spyOn(uuid, 'uuid').mockImplementation(() => `${uuidCounter++}-4e4f-41d9-94c4-f49351b811f1`);
        const aliceCredentialRecordsString = (0, fs_1.readFileSync)(path_1.default.join(__dirname, '__fixtures__/alice-4-credentials-0.1.json'), 'utf8');
        const dependencyManager = new plugins_1.DependencyManager();
        const storageService = new InMemoryStorageService_1.InMemoryStorageService();
        dependencyManager.registerInstance(constants_1.InjectionSymbols.StorageService, storageService);
        // If we register the IndySdkModule it will register the storage service, but we use in memory storage here
        dependencyManager.registerContextScoped(constants_1.InjectionSymbols.Wallet, src_1.IndySdkWallet);
        dependencyManager.registerInstance(types_1.IndySdkSymbol, setupIndySdkModule_1.indySdk);
        const agent = new src_2.Agent({
            config: { label: 'Test Agent', walletConfig },
            dependencies: helpers_1.agentDependencies,
        }, dependencyManager);
        const updateAssistant = new UpdateAssistant_1.UpdateAssistant(agent, {
            v0_1ToV0_2: {
                mediationRoleUpdateStrategy: 'doNotChange',
            },
        });
        yield updateAssistant.initialize();
        // Set storage after initialization. This mimics as if this wallet
        // is opened as an existing wallet instead of a new wallet
        storageService.records = JSON.parse(aliceCredentialRecordsString);
        expect(yield updateAssistant.isUpToDate('0.2')).toBe(false);
        expect(yield updateAssistant.getNeededUpdates('0.2')).toEqual([
            {
                fromVersion: '0.1',
                toVersion: '0.2',
                doUpdate: expect.any(Function),
            },
        ]);
        yield updateAssistant.update('0.2');
        expect(yield updateAssistant.isUpToDate('0.2')).toBe(true);
        expect(yield updateAssistant.getNeededUpdates('0.2')).toEqual([]);
        // MEDIATOR_ROUTING_RECORD recipientKeys will be different every time, and is not what we're testing here
        delete storageService.records.MEDIATOR_ROUTING_RECORD;
        expect(storageService.records).toMatchSnapshot();
        yield agent.shutdown();
        yield agent.wallet.delete();
        uuidSpy.mockReset();
    }));
    it(`should correctly update the credential records and create didcomm records with auto update`, () => __awaiter(void 0, void 0, void 0, function* () {
        // We need to mock the uuid generation to make sure we generate consistent uuids for the new records created.
        let uuidCounter = 1;
        const uuidSpy = jest.spyOn(uuid, 'uuid').mockImplementation(() => `${uuidCounter++}-4e4f-41d9-94c4-f49351b811f1`);
        const aliceCredentialRecordsString = (0, fs_1.readFileSync)(path_1.default.join(__dirname, '__fixtures__/alice-4-credentials-0.1.json'), 'utf8');
        const dependencyManager = new plugins_1.DependencyManager();
        const storageService = new InMemoryStorageService_1.InMemoryStorageService();
        dependencyManager.registerInstance(constants_1.InjectionSymbols.StorageService, storageService);
        // If we register the IndySdkModule it will register the storage service, but we use in memory storage here
        dependencyManager.registerContextScoped(constants_1.InjectionSymbols.Wallet, src_1.IndySdkWallet);
        dependencyManager.registerInstance(types_1.IndySdkSymbol, setupIndySdkModule_1.indySdk);
        const agent = new src_2.Agent({
            config: { label: 'Test Agent', walletConfig, autoUpdateStorageOnStartup: true },
            dependencies: helpers_1.agentDependencies,
        }, dependencyManager);
        const updateAssistant = new UpdateAssistant_1.UpdateAssistant(agent, {
            v0_1ToV0_2: {
                mediationRoleUpdateStrategy: 'doNotChange',
            },
        });
        yield updateAssistant.initialize();
        // Set storage after initialization. This mimics as if this wallet
        // is opened as an existing wallet instead of a new wallet
        storageService.records = JSON.parse(aliceCredentialRecordsString);
        expect(yield updateAssistant.isUpToDate('0.2')).toBe(false);
        expect(yield updateAssistant.getNeededUpdates('0.2')).toEqual([
            {
                fromVersion: '0.1',
                toVersion: '0.2',
                doUpdate: expect.any(Function),
            },
        ]);
        yield updateAssistant.update('0.2');
        expect(yield updateAssistant.isUpToDate('0.2')).toBe(true);
        expect(yield updateAssistant.getNeededUpdates('0.2')).toEqual([]);
        // MEDIATOR_ROUTING_RECORD recipientKeys will be different every time, and is not what we're testing here
        delete storageService.records.MEDIATOR_ROUTING_RECORD;
        expect(storageService.records).toMatchSnapshot();
        yield agent.shutdown();
        yield agent.wallet.delete();
        uuidSpy.mockReset();
    }));
    it(`should correctly update the connection record and create the did and oob records`, () => __awaiter(void 0, void 0, void 0, function* () {
        // We need to mock the uuid generation to make sure we generate consistent uuids for the new records created.
        let uuidCounter = 1;
        const uuidSpy = jest.spyOn(uuid, 'uuid').mockImplementation(() => `${uuidCounter++}-4e4f-41d9-94c4-f49351b811f1`);
        const aliceConnectionRecordsString = (0, fs_1.readFileSync)(path_1.default.join(__dirname, '__fixtures__/alice-8-connections-0.1.json'), 'utf8');
        const dependencyManager = new plugins_1.DependencyManager();
        const storageService = new InMemoryStorageService_1.InMemoryStorageService();
        dependencyManager.registerInstance(constants_1.InjectionSymbols.StorageService, storageService);
        // If we register the IndySdkModule it will register the storage service, but we use in memory storage here
        dependencyManager.registerContextScoped(constants_1.InjectionSymbols.Wallet, src_1.IndySdkWallet);
        dependencyManager.registerInstance(types_1.IndySdkSymbol, setupIndySdkModule_1.indySdk);
        const agent = new src_2.Agent({
            config: {
                label: 'Test Agent',
                walletConfig,
                autoUpdateStorageOnStartup: true,
            },
            dependencies: helpers_1.agentDependencies,
        }, dependencyManager);
        const updateAssistant = new UpdateAssistant_1.UpdateAssistant(agent, {
            v0_1ToV0_2: {
                mediationRoleUpdateStrategy: 'doNotChange',
            },
        });
        yield updateAssistant.initialize();
        // Set storage after initialization. This mimics as if this wallet
        // is opened as an existing wallet instead of a new wallet
        storageService.records = JSON.parse(aliceConnectionRecordsString);
        expect(yield updateAssistant.isUpToDate('0.2')).toBe(false);
        expect(yield updateAssistant.getNeededUpdates('0.2')).toEqual([
            {
                fromVersion: '0.1',
                toVersion: '0.2',
                doUpdate: expect.any(Function),
            },
        ]);
        yield updateAssistant.update('0.2');
        expect(yield updateAssistant.isUpToDate('0.2')).toBe(true);
        expect(yield updateAssistant.getNeededUpdates('0.2')).toEqual([]);
        // MEDIATOR_ROUTING_RECORD recipientKeys will be different every time, and is not what we're testing here
        delete storageService.records.MEDIATOR_ROUTING_RECORD;
        expect(storageService.records).toMatchSnapshot();
        yield agent.shutdown();
        yield agent.wallet.delete();
        uuidSpy.mockReset();
    }));
});
