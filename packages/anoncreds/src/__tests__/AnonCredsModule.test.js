"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AnonCredsModule_1 = require("../AnonCredsModule");
const AnonCredsModuleConfig_1 = require("../AnonCredsModuleConfig");
const repository_1 = require("../repository");
const AnonCredsRegistryService_1 = require("../services/registry/AnonCredsRegistryService");
const dependencyManager = {
    registerInstance: jest.fn(),
    registerSingleton: jest.fn(),
};
const registry = {};
describe('AnonCredsModule', () => {
    test('registers dependencies on the dependency manager', () => {
        const anonCredsModule = new AnonCredsModule_1.AnonCredsModule({
            registries: [registry],
        });
        anonCredsModule.register(dependencyManager);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(6);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(AnonCredsRegistryService_1.AnonCredsRegistryService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.AnonCredsSchemaRepository);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.AnonCredsCredentialDefinitionRepository);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.AnonCredsCredentialDefinitionPrivateRepository);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.AnonCredsKeyCorrectnessProofRepository);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.AnonCredsLinkSecretRepository);
        expect(dependencyManager.registerInstance).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerInstance).toHaveBeenCalledWith(AnonCredsModuleConfig_1.AnonCredsModuleConfig, anonCredsModule.config);
    });
});
