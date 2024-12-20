"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsModule = void 0;
const AnonCredsApi_1 = require("./AnonCredsApi");
const AnonCredsModuleConfig_1 = require("./AnonCredsModuleConfig");
const repository_1 = require("./repository");
const AnonCredsCredentialDefinitionRepository_1 = require("./repository/AnonCredsCredentialDefinitionRepository");
const AnonCredsSchemaRepository_1 = require("./repository/AnonCredsSchemaRepository");
const AnonCredsRegistryService_1 = require("./services/registry/AnonCredsRegistryService");
const _0_3_1_0_4_1 = require("./updates/0.3.1-0.4");
/**
 * @public
 */
class AnonCredsModule {
    constructor(config) {
        this.api = AnonCredsApi_1.AnonCredsApi;
        this.updates = [
            {
                fromVersion: '0.3.1',
                toVersion: '0.4',
                doUpdate: _0_3_1_0_4_1.updateAnonCredsModuleV0_3_1ToV0_4,
            },
        ];
        this.config = new AnonCredsModuleConfig_1.AnonCredsModuleConfig(config);
    }
    register(dependencyManager) {
        // Config
        dependencyManager.registerInstance(AnonCredsModuleConfig_1.AnonCredsModuleConfig, this.config);
        dependencyManager.registerSingleton(AnonCredsRegistryService_1.AnonCredsRegistryService);
        // Repositories
        dependencyManager.registerSingleton(AnonCredsSchemaRepository_1.AnonCredsSchemaRepository);
        dependencyManager.registerSingleton(AnonCredsCredentialDefinitionRepository_1.AnonCredsCredentialDefinitionRepository);
        dependencyManager.registerSingleton(repository_1.AnonCredsCredentialDefinitionPrivateRepository);
        dependencyManager.registerSingleton(repository_1.AnonCredsKeyCorrectnessProofRepository);
        dependencyManager.registerSingleton(repository_1.AnonCredsLinkSecretRepository);
    }
}
exports.AnonCredsModule = AnonCredsModule;
