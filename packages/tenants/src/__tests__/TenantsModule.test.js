"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aries-framework/core");
const DependencyManager_1 = require("../../../core/src/plugins/DependencyManager");
const tests_1 = require("../../../core/tests");
const TenantsApi_1 = require("../TenantsApi");
const TenantsModule_1 = require("../TenantsModule");
const TenantsModuleConfig_1 = require("../TenantsModuleConfig");
const TenantAgentContextProvider_1 = require("../context/TenantAgentContextProvider");
const TenantSessionCoordinator_1 = require("../context/TenantSessionCoordinator");
const repository_1 = require("../repository");
const services_1 = require("../services");
jest.mock('../../../core/src/plugins/DependencyManager');
const DependencyManagerMock = DependencyManager_1.DependencyManager;
const dependencyManager = new DependencyManagerMock();
(0, tests_1.mockFunction)(dependencyManager.resolve).mockReturnValue({ logger: { warn: jest.fn() } });
describe('TenantsModule', () => {
    test('registers dependencies on the dependency manager', () => {
        const tenantsModule = new TenantsModule_1.TenantsModule();
        tenantsModule.register(dependencyManager);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(6);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(TenantsApi_1.TenantsApi);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(services_1.TenantRecordService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.TenantRepository);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.TenantRoutingRepository);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(core_1.InjectionSymbols.AgentContextProvider, TenantAgentContextProvider_1.TenantAgentContextProvider);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(TenantSessionCoordinator_1.TenantSessionCoordinator);
        expect(dependencyManager.registerInstance).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerInstance).toHaveBeenCalledWith(TenantsModuleConfig_1.TenantsModuleConfig, tenantsModule.config);
    });
});
