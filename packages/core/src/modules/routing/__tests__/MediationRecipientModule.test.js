"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FeatureRegistry_1 = require("../../../agent/FeatureRegistry");
const DependencyManager_1 = require("../../../plugins/DependencyManager");
const MediationRecipientApi_1 = require("../MediationRecipientApi");
const MediationRecipientModule_1 = require("../MediationRecipientModule");
const repository_1 = require("../repository");
const services_1 = require("../services");
jest.mock('../../../plugins/DependencyManager');
const DependencyManagerMock = DependencyManager_1.DependencyManager;
const dependencyManager = new DependencyManagerMock();
jest.mock('../../../agent/FeatureRegistry');
const FeatureRegistryMock = FeatureRegistry_1.FeatureRegistry;
const featureRegistry = new FeatureRegistryMock();
describe('MediationRecipientModule', () => {
    test('registers dependencies on the dependency manager', () => {
        new MediationRecipientModule_1.MediationRecipientModule().register(dependencyManager, featureRegistry);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledWith(MediationRecipientApi_1.MediationRecipientApi);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(3);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(services_1.MediationRecipientService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(services_1.RoutingService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.MediationRepository);
    });
});
