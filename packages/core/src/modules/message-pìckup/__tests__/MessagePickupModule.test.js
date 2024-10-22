"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FeatureRegistry_1 = require("../../../agent/FeatureRegistry");
const models_1 = require("../../../agent/models");
const DependencyManager_1 = require("../../../plugins/DependencyManager");
const MessagePickupApi_1 = require("../MessagePickupApi");
const MessagePickupModule_1 = require("../MessagePickupModule");
const MessagePickupModuleConfig_1 = require("../MessagePickupModuleConfig");
jest.mock('../../../plugins/DependencyManager');
const DependencyManagerMock = DependencyManager_1.DependencyManager;
jest.mock('../../../agent/FeatureRegistry');
const FeatureRegistryMock = FeatureRegistry_1.FeatureRegistry;
const dependencyManager = new DependencyManagerMock();
const featureRegistry = new FeatureRegistryMock();
describe('MessagePickupModule', () => {
    test('registers dependencies on the dependency manager', () => {
        const module = new MessagePickupModule_1.MessagePickupModule();
        module.register(dependencyManager, featureRegistry);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledWith(MessagePickupApi_1.MessagePickupApi);
        expect(dependencyManager.registerInstance).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerInstance).toHaveBeenCalledWith(MessagePickupModuleConfig_1.MessagePickupModuleConfig, module.config);
        expect(featureRegistry.register).toHaveBeenCalledTimes(2);
        expect(featureRegistry.register).toHaveBeenCalledWith(new models_1.Protocol({
            id: 'https://didcomm.org/messagepickup/1.0',
            roles: ['message_holder', 'recipient', 'batch_sender', 'batch_recipient'],
        }));
        expect(featureRegistry.register).toHaveBeenCalledWith(new models_1.Protocol({
            id: 'https://didcomm.org/messagepickup/2.0',
            roles: ['mediator', 'recipient'],
        }));
    });
});
