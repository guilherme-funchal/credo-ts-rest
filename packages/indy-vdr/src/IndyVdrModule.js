"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyVdrModule = void 0;
const core_1 = require("@aries-framework/core");
const IndyVdrApi_1 = require("./IndyVdrApi");
const IndyVdrModuleConfig_1 = require("./IndyVdrModuleConfig");
const IndyVdrPoolService_1 = require("./pool/IndyVdrPoolService");
/**
 * @public
 * */
class IndyVdrModule {
    constructor(config) {
        this.api = IndyVdrApi_1.IndyVdrApi;
        this.config = new IndyVdrModuleConfig_1.IndyVdrModuleConfig(config);
    }
    register(dependencyManager) {
        // Warn about experimental module
        dependencyManager
            .resolve(core_1.AgentConfig)
            .logger.warn("The '@aries-framework/indy-vdr' module is experimental and could have unexpected breaking changes. When using this module, make sure to use strict versions for all @aries-framework packages.");
        // Config
        dependencyManager.registerInstance(IndyVdrModuleConfig_1.IndyVdrModuleConfig, this.config);
        // Services
        dependencyManager.registerSingleton(IndyVdrPoolService_1.IndyVdrPoolService);
        // Api
        dependencyManager.registerContextScoped(IndyVdrApi_1.IndyVdrApi);
    }
    initialize(agentContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const indyVdrPoolService = agentContext.dependencyManager.resolve(IndyVdrPoolService_1.IndyVdrPoolService);
            for (const pool of indyVdrPoolService.pools) {
                if (pool.config.connectOnStartup) {
                    yield pool.connect();
                }
            }
        });
    }
}
exports.IndyVdrModule = IndyVdrModule;
