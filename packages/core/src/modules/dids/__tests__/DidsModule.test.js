"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DependencyManager_1 = require("../../../plugins/DependencyManager");
const DidsApi_1 = require("../DidsApi");
const DidsModule_1 = require("../DidsModule");
const DidsModuleConfig_1 = require("../DidsModuleConfig");
const repository_1 = require("../repository");
const services_1 = require("../services");
jest.mock('../../../plugins/DependencyManager');
const DependencyManagerMock = DependencyManager_1.DependencyManager;
const dependencyManager = new DependencyManagerMock();
describe('DidsModule', () => {
    test('registers dependencies on the dependency manager', () => {
        const didsModule = new DidsModule_1.DidsModule();
        didsModule.register(dependencyManager);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledWith(DidsApi_1.DidsApi);
        expect(dependencyManager.registerInstance).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerInstance).toHaveBeenCalledWith(DidsModuleConfig_1.DidsModuleConfig, didsModule.config);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(3);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(services_1.DidResolverService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(services_1.DidRegistrarService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.DidRepository);
    });
});
