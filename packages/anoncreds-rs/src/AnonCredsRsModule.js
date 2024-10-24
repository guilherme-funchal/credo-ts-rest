"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsRsModule = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const AnonCredsRsModuleConfig_1 = require("./AnonCredsRsModuleConfig");
const services_1 = require("./services");
class AnonCredsRsModule {
    constructor(config) {
        this.config = new AnonCredsRsModuleConfig_1.AnonCredsRsModuleConfig(config);
    }
    register(dependencyManager) {
        // Warn about experimental module
        dependencyManager
            .resolve(core_1.AgentConfig)
            .logger.warn("The '@aries-framework/anoncreds-rs' module is experimental and could have unexpected breaking changes. When using this module, make sure to use strict versions for all @aries-framework packages.");
        dependencyManager.registerInstance(AnonCredsRsModuleConfig_1.AnonCredsRsModuleConfig, this.config);
        // Register services
        dependencyManager.registerSingleton(anoncreds_1.AnonCredsHolderServiceSymbol, services_1.AnonCredsRsHolderService);
        dependencyManager.registerSingleton(anoncreds_1.AnonCredsIssuerServiceSymbol, services_1.AnonCredsRsIssuerService);
        dependencyManager.registerSingleton(anoncreds_1.AnonCredsVerifierServiceSymbol, services_1.AnonCredsRsVerifierService);
    }
}
exports.AnonCredsRsModule = AnonCredsRsModule;
