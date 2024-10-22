"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsModule = void 0;
const core_1 = require("@aries-framework/core");
const TenantsApi_1 = require("./TenantsApi");
const TenantsModuleConfig_1 = require("./TenantsModuleConfig");
const TenantAgentContextProvider_1 = require("./context/TenantAgentContextProvider");
const TenantSessionCoordinator_1 = require("./context/TenantSessionCoordinator");
const repository_1 = require("./repository");
const services_1 = require("./services");
class TenantsModule {
    constructor(config) {
        this.api = TenantsApi_1.TenantsApi;
        this.config = new TenantsModuleConfig_1.TenantsModuleConfig(config);
    }
    /**
     * Registers the dependencies of the tenants module on the dependency manager.
     */
    register(dependencyManager) {
        // Warn about experimental module
        dependencyManager
            .resolve(core_1.AgentConfig)
            .logger.warn("The '@aries-framework/tenants' module is experimental and could have unexpected breaking changes. When using this module, make sure to use strict versions for all @aries-framework packages.");
        // Api
        // NOTE: this is a singleton because tenants can't have their own tenants. This makes sure the tenants api is always used in the root agent context.
        dependencyManager.registerSingleton(TenantsApi_1.TenantsApi);
        // Config
        dependencyManager.registerInstance(TenantsModuleConfig_1.TenantsModuleConfig, this.config);
        // Services
        dependencyManager.registerSingleton(services_1.TenantRecordService);
        // Repositories
        dependencyManager.registerSingleton(repository_1.TenantRepository);
        dependencyManager.registerSingleton(repository_1.TenantRoutingRepository);
        dependencyManager.registerSingleton(core_1.InjectionSymbols.AgentContextProvider, TenantAgentContextProvider_1.TenantAgentContextProvider);
        dependencyManager.registerSingleton(TenantSessionCoordinator_1.TenantSessionCoordinator);
    }
}
exports.TenantsModule = TenantsModule;
