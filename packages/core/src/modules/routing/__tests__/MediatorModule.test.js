"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FeatureRegistry_1 = require("../../../agent/FeatureRegistry");
const DependencyManager_1 = require("../../../plugins/DependencyManager");
const MediatorApi_1 = require("../MediatorApi");
const MediatorModule_1 = require("../MediatorModule");
const repository_1 = require("../repository");
const services_1 = require("../services");
jest.mock('../../../plugins/DependencyManager');
const DependencyManagerMock = DependencyManager_1.DependencyManager;
const dependencyManager = new DependencyManagerMock();
jest.mock('../../../agent/FeatureRegistry');
const FeatureRegistryMock = FeatureRegistry_1.FeatureRegistry;
const featureRegistry = new FeatureRegistryMock();
describe('MediatorModule', () => {
    test('registers dependencies on the dependency manager', () => {
        new MediatorModule_1.MediatorModule().register(dependencyManager, featureRegistry);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledWith(MediatorApi_1.MediatorApi);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(3);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(services_1.MediatorService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.MediationRepository);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.MediatorRoutingRepository);
    });
});
