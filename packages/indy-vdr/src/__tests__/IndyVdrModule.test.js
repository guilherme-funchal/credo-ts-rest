"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const indy_vdr_nodejs_1 = require("@hyperledger/indy-vdr-nodejs");
const IndyVdrModule_1 = require("../IndyVdrModule");
const IndyVdrModuleConfig_1 = require("../IndyVdrModuleConfig");
const pool_1 = require("../pool");
const dependencyManager = {
    registerInstance: jest.fn(),
    registerSingleton: jest.fn(),
    registerContextScoped: jest.fn(),
    resolve: jest.fn().mockReturnValue({ logger: { warn: jest.fn() } }),
};
describe('IndyVdrModule', () => {
    test('registers dependencies on the dependency manager', () => {
        const indyVdrModule = new IndyVdrModule_1.IndyVdrModule({
            indyVdr: indy_vdr_nodejs_1.indyVdr,
            networks: [
                {
                    isProduction: false,
                    genesisTransactions: 'xxx',
                    indyNamespace: 'localhost:test',
                    transactionAuthorAgreement: {
                        version: '1',
                        acceptanceMechanism: 'accept',
                    },
                },
            ],
        });
        indyVdrModule.register(dependencyManager);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(pool_1.IndyVdrPoolService);
        expect(dependencyManager.registerInstance).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerInstance).toHaveBeenCalledWith(IndyVdrModuleConfig_1.IndyVdrModuleConfig, indyVdrModule.config);
    });
});
