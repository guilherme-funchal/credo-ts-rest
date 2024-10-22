"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FeatureRegistry_1 = require("../../../agent/FeatureRegistry");
const models_1 = require("../../../agent/models");
const DependencyManager_1 = require("../../../plugins/DependencyManager");
const DiscoverFeaturesApi_1 = require("../DiscoverFeaturesApi");
const DiscoverFeaturesModule_1 = require("../DiscoverFeaturesModule");
const v1_1 = require("../protocol/v1");
const v2_1 = require("../protocol/v2");
jest.mock('../../../plugins/DependencyManager');
const DependencyManagerMock = DependencyManager_1.DependencyManager;
jest.mock('../../../agent/FeatureRegistry');
const FeatureRegistryMock = FeatureRegistry_1.FeatureRegistry;
const dependencyManager = new DependencyManagerMock();
const featureRegistry = new FeatureRegistryMock();
describe('DiscoverFeaturesModule', () => {
    test('registers dependencies on the dependency manager', () => {
        new DiscoverFeaturesModule_1.DiscoverFeaturesModule().register(dependencyManager, featureRegistry);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledWith(DiscoverFeaturesApi_1.DiscoverFeaturesApi);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(2);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(v1_1.V1DiscoverFeaturesService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(v2_1.V2DiscoverFeaturesService);
        expect(featureRegistry.register).toHaveBeenCalledWith(new models_1.Protocol({
            id: 'https://didcomm.org/discover-features/1.0',
            roles: ['requester', 'responder'],
        }), new models_1.Protocol({
            id: 'https://didcomm.org/discover-features/2.0',
            roles: ['requester', 'responder'],
        }));
    });
});
