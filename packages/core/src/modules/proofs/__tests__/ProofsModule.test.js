"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FeatureRegistry_1 = require("../../../agent/FeatureRegistry");
const DependencyManager_1 = require("../../../plugins/DependencyManager");
const ProofsApi_1 = require("../ProofsApi");
const ProofsModule_1 = require("../ProofsModule");
const ProofsModuleConfig_1 = require("../ProofsModuleConfig");
const V2ProofProtocol_1 = require("../protocol/v2/V2ProofProtocol");
const repository_1 = require("../repository");
jest.mock('../../../plugins/DependencyManager');
jest.mock('../../../agent/FeatureRegistry');
const DependencyManagerMock = DependencyManager_1.DependencyManager;
const dependencyManager = new DependencyManagerMock();
const FeatureRegistryMock = FeatureRegistry_1.FeatureRegistry;
const featureRegistry = new FeatureRegistryMock();
describe('ProofsModule', () => {
    test('registers dependencies on the dependency manager', () => {
        const proofsModule = new ProofsModule_1.ProofsModule({
            proofProtocols: [],
        });
        proofsModule.register(dependencyManager, featureRegistry);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledWith(ProofsApi_1.ProofsApi);
        expect(dependencyManager.registerInstance).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerInstance).toHaveBeenCalledWith(ProofsModuleConfig_1.ProofsModuleConfig, proofsModule.config);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.ProofRepository);
    });
    test('registers V2ProofProtocol if no proofProtocols are configured', () => {
        const proofsModule = new ProofsModule_1.ProofsModule();
        expect(proofsModule.config.proofProtocols).toEqual([expect.any(V2ProofProtocol_1.V2ProofProtocol)]);
    });
    test('calls register on the provided ProofProtocols', () => {
        const registerMock = jest.fn();
        const proofProtocol = {
            register: registerMock,
        };
        const proofsModule = new ProofsModule_1.ProofsModule({
            proofProtocols: [proofProtocol],
        });
        expect(proofsModule.config.proofProtocols).toEqual([proofProtocol]);
        proofsModule.register(dependencyManager, featureRegistry);
        expect(registerMock).toHaveBeenCalledTimes(1);
        expect(registerMock).toHaveBeenCalledWith(dependencyManager, featureRegistry);
    });
});
