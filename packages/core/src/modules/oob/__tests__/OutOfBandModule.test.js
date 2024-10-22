"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FeatureRegistry_1 = require("../../../agent/FeatureRegistry");
const DependencyManager_1 = require("../../../plugins/DependencyManager");
const OutOfBandApi_1 = require("../OutOfBandApi");
const OutOfBandModule_1 = require("../OutOfBandModule");
const OutOfBandService_1 = require("../OutOfBandService");
const OutOfBandRepository_1 = require("../repository/OutOfBandRepository");
jest.mock('../../../plugins/DependencyManager');
const DependencyManagerMock = DependencyManager_1.DependencyManager;
const dependencyManager = new DependencyManagerMock();
jest.mock('../../../agent/FeatureRegistry');
const FeatureRegistryMock = FeatureRegistry_1.FeatureRegistry;
const featureRegistry = new FeatureRegistryMock();
describe('OutOfBandModule', () => {
    test('registers dependencies on the dependency manager', () => {
        new OutOfBandModule_1.OutOfBandModule().register(dependencyManager, featureRegistry);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledWith(OutOfBandApi_1.OutOfBandApi);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(2);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(OutOfBandService_1.OutOfBandService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(OutOfBandRepository_1.OutOfBandRepository);
    });
});
