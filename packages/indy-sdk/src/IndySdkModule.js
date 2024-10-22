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
exports.IndySdkModule = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const IndySdkModuleConfig_1 = require("./IndySdkModuleConfig");
const anoncreds_2 = require("./anoncreds");
const ledger_1 = require("./ledger");
const storage_1 = require("./storage");
const types_1 = require("./types");
const wallet_1 = require("./wallet");
class IndySdkModule {
    constructor(config) {
        this.config = new IndySdkModuleConfig_1.IndySdkModuleConfig(config);
    }
    register(dependencyManager) {
        dependencyManager.registerInstance(types_1.IndySdkSymbol, this.config.indySdk);
        // Register config
        dependencyManager.registerInstance(IndySdkModuleConfig_1.IndySdkModuleConfig, this.config);
        if (dependencyManager.isRegistered(core_1.InjectionSymbols.Wallet)) {
            throw new core_1.AriesFrameworkError('There is an instance of Wallet already registered');
        }
        else {
            dependencyManager.registerContextScoped(core_1.InjectionSymbols.Wallet, wallet_1.IndySdkWallet);
        }
        if (dependencyManager.isRegistered(core_1.InjectionSymbols.StorageService)) {
            throw new core_1.AriesFrameworkError('There is an instance of StorageService already registered');
        }
        else {
            dependencyManager.registerSingleton(core_1.InjectionSymbols.StorageService, storage_1.IndySdkStorageService);
        }
        // NOTE: for now we are registering the needed indy services. We may want to make this
        // more explicit and require the user to register the services they need on the specific modules.
        dependencyManager.registerSingleton(ledger_1.IndySdkPoolService);
        dependencyManager.registerSingleton(anoncreds_1.AnonCredsIssuerServiceSymbol, anoncreds_2.IndySdkIssuerService);
        dependencyManager.registerSingleton(anoncreds_1.AnonCredsHolderServiceSymbol, anoncreds_2.IndySdkHolderService);
        dependencyManager.registerSingleton(anoncreds_1.AnonCredsVerifierServiceSymbol, anoncreds_2.IndySdkVerifierService);
    }
    initialize(agentContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const indySdkPoolService = agentContext.dependencyManager.resolve(ledger_1.IndySdkPoolService);
            for (const pool of indySdkPoolService.pools) {
                if (pool.config.connectOnStartup) {
                    yield pool.connect();
                }
            }
        });
    }
}
exports.IndySdkModule = IndySdkModule;
