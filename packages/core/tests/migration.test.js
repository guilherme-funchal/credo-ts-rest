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
const setupIndySdkModule_1 = require("../../indy-sdk/tests/setupIndySdkModule");
const Agent_1 = require("../src/agent/Agent");
const UpdateAssistant_1 = require("../src/storage/migration/UpdateAssistant");
const helpers_1 = require("./helpers");
const agentOptions = (0, helpers_1.getAgentOptions)('Migration', {}, (0, setupIndySdkModule_1.getIndySdkModules)());
describe('migration', () => {
    test('manually initiating the update assistant to perform an update', () => __awaiter(void 0, void 0, void 0, function* () {
        const agent = new Agent_1.Agent(agentOptions);
        const updateAssistant = new UpdateAssistant_1.UpdateAssistant(agent, {
            v0_1ToV0_2: { mediationRoleUpdateStrategy: 'allMediator' },
        });
        yield updateAssistant.initialize();
        if (!(yield updateAssistant.isUpToDate())) {
            yield updateAssistant.update();
        }
        yield agent.initialize();
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    test('manually initiating the update, but storing the current framework version outside of the agent storage', () => __awaiter(void 0, void 0, void 0, function* () {
        // The storage version will normally be stored in e.g. persistent storage on a mobile device
        let currentStorageVersion = '0.1';
        const agent = new Agent_1.Agent(agentOptions);
        if (currentStorageVersion !== UpdateAssistant_1.UpdateAssistant.frameworkStorageVersion) {
            const updateAssistant = new UpdateAssistant_1.UpdateAssistant(agent, {
                v0_1ToV0_2: { mediationRoleUpdateStrategy: 'recipientIfEndpoint' },
            });
            yield updateAssistant.initialize();
            yield updateAssistant.update();
            // Store the version so we can leverage it during the next agent startup and don't have
            // to initialize the update assistant again until a new version is released
            currentStorageVersion = UpdateAssistant_1.UpdateAssistant.frameworkStorageVersion;
        }
        yield agent.initialize();
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    test('Automatic update on agent startup', () => __awaiter(void 0, void 0, void 0, function* () {
        const agent = new Agent_1.Agent(Object.assign(Object.assign({}, agentOptions), { config: Object.assign(Object.assign({}, agentOptions.config), { autoUpdateStorageOnStartup: true }) }));
        yield agent.initialize();
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
});
