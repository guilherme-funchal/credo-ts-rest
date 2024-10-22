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
const tests_1 = require("../../../../tests");
const helpers_1 = require("../../../../tests/helpers");
const Agent_1 = require("../../../agent/Agent");
const constants_1 = require("../../../constants");
const plugins_1 = require("../../../plugins");
const uuid = __importStar(require("../../../utils/uuid"));
const UpdateAssistant_1 = require("../UpdateAssistant");
const backupDate = new Date('2023-03-18T22:50:20.522Z');
jest.useFakeTimers().setSystemTime(backupDate);
const walletConfig = {
    id: `Wallet: 0.4 Update`,
    key: `Key: 0.4 Update`,
};
describe('UpdateAssistant | v0.3.1 - v0.4', () => {
    it(`should correctly update the did records and remove cache records`, () => __awaiter(void 0, void 0, void 0, function* () {
        // We need to mock the uuid generation to make sure we generate consistent uuids for the new records created.
        let uuidCounter = 1;
        const uuidSpy = jest.spyOn(uuid, 'uuid').mockImplementation(() => `${uuidCounter++}-4e4f-41d9-94c4-f49351b811f1`);
        const aliceDidRecordsString = (0, fs_1.readFileSync)(path_1.default.join(__dirname, '__fixtures__/alice-2-sov-dids-one-cache-record-0.3.json'), 'utf8');
        const dependencyManager = new plugins_1.DependencyManager();
        const storageService = new InMemoryStorageService_1.InMemoryStorageService();
        dependencyManager.registerInstance(constants_1.InjectionSymbols.StorageService, storageService);
        // If we register the IndySdkModule it will register the storage service, but we use in memory storage here
        dependencyManager.registerContextScoped(constants_1.InjectionSymbols.Wallet, src_1.IndySdkWallet);
        dependencyManager.registerInstance(types_1.IndySdkSymbol, tests_1.indySdk);
        const agent = new Agent_1.Agent({
            config: {
                label: 'Test Agent',
                walletConfig,
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
        storageService.records = JSON.parse(aliceDidRecordsString);
        expect(yield updateAssistant.isUpToDate()).toBe(false);
        expect(yield updateAssistant.getNeededUpdates('0.4')).toEqual([
            {
                fromVersion: '0.3.1',
                toVersion: '0.4',
                doUpdate: expect.any(Function),
            },
        ]);
        yield updateAssistant.update();
        expect(yield updateAssistant.isUpToDate()).toBe(true);
        expect(yield updateAssistant.getNeededUpdates()).toEqual([]);
        // MEDIATOR_ROUTING_RECORD recipientKeys will be different every time, and is not what we're testing here
        delete storageService.records.MEDIATOR_ROUTING_RECORD;
        expect(storageService.records).toMatchSnapshot();
        yield agent.shutdown();
        yield agent.wallet.delete();
        uuidSpy.mockReset();
    }));
});
