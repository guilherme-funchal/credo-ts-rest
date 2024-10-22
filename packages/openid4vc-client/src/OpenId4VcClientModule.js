"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcClientModule = void 0;
const core_1 = require("@aries-framework/core");
const OpenId4VcClientApi_1 = require("./OpenId4VcClientApi");
const OpenId4VcClientService_1 = require("./OpenId4VcClientService");
/**
 * @public
 */
class OpenId4VcClientModule {
    constructor() {
        this.api = OpenId4VcClientApi_1.OpenId4VcClientApi;
    }
    /**
     * Registers the dependencies of the question answer module on the dependency manager.
     */
    register(dependencyManager) {
        // Warn about experimental module
        dependencyManager
            .resolve(core_1.AgentConfig)
            .logger.warn("The '@aries-framework/openid4vc-client' module is experimental and could have unexpected breaking changes. When using this module, make sure to use strict versions for all @aries-framework packages.");
        // Api
        dependencyManager.registerContextScoped(OpenId4VcClientApi_1.OpenId4VcClientApi);
        // Services
        dependencyManager.registerSingleton(OpenId4VcClientService_1.OpenId4VcClientService);
    }
}
exports.OpenId4VcClientModule = OpenId4VcClientModule;
