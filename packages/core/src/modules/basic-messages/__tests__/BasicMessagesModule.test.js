"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FeatureRegistry_1 = require("../../../agent/FeatureRegistry");
const DependencyManager_1 = require("../../../plugins/DependencyManager");
const BasicMessagesApi_1 = require("../BasicMessagesApi");
const BasicMessagesModule_1 = require("../BasicMessagesModule");
const repository_1 = require("../repository");
const services_1 = require("../services");
jest.mock('../../../plugins/DependencyManager');
const DependencyManagerMock = DependencyManager_1.DependencyManager;
const dependencyManager = new DependencyManagerMock();
jest.mock('../../../agent/FeatureRegistry');
const FeatureRegistryMock = FeatureRegistry_1.FeatureRegistry;
const featureRegistry = new FeatureRegistryMock();
describe('BasicMessagesModule', () => {
    test('registers dependencies on the dependency manager', () => {
        new BasicMessagesModule_1.BasicMessagesModule().register(dependencyManager, featureRegistry);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledWith(BasicMessagesApi_1.BasicMessagesApi);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(2);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(services_1.BasicMessageService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.BasicMessageRepository);
    });
});
