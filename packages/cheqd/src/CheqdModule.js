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
exports.CheqdModule = void 0;
const core_1 = require("@aries-framework/core");
const CheqdModuleConfig_1 = require("./CheqdModuleConfig");
const ledger_1 = require("./ledger");
class CheqdModule {
    constructor(config) {
        this.config = new CheqdModuleConfig_1.CheqdModuleConfig(config);
    }
    register(dependencyManager) {
        // Warn about experimental module
        dependencyManager
            .resolve(core_1.AgentConfig)
            .logger.warn("The '@aries-framework/cheqd' module is experimental and could have unexpected breaking changes. When using this module, make sure to use strict versions for all @aries-framework packages.");
        // Register config
        dependencyManager.registerInstance(CheqdModuleConfig_1.CheqdModuleConfig, this.config);
        dependencyManager.registerSingleton(ledger_1.CheqdLedgerService);
        // Cheqd module needs Buffer to be available globally
        // If it is not available yet, we overwrite it with the
        // Buffer implementation from AFJ
        global.Buffer = global.Buffer || core_1.Buffer;
    }
    initialize(agentContext) {
        return __awaiter(this, void 0, void 0, function* () {
            // not required
            const cheqdLedgerService = agentContext.dependencyManager.resolve(ledger_1.CheqdLedgerService);
            yield cheqdLedgerService.connect();
        });
    }
}
exports.CheqdModule = CheqdModule;
