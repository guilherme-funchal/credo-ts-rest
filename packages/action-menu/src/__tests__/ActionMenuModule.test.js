"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aries-framework/core");
const ActionMenuApi_1 = require("../ActionMenuApi");
const ActionMenuModule_1 = require("../ActionMenuModule");
const ActionMenuRole_1 = require("../ActionMenuRole");
const repository_1 = require("../repository");
const services_1 = require("../services");
const dependencyManager = {
    registerInstance: jest.fn(),
    registerSingleton: jest.fn(),
    registerContextScoped: jest.fn(),
};
const featureRegistry = {
    register: jest.fn(),
};
describe('ActionMenuModule', () => {
    test('registers dependencies on the dependency manager', () => {
        const actionMenuModule = new ActionMenuModule_1.ActionMenuModule();
        actionMenuModule.register(dependencyManager, featureRegistry);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledWith(ActionMenuApi_1.ActionMenuApi);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(2);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(services_1.ActionMenuService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.ActionMenuRepository);
        expect(featureRegistry.register).toHaveBeenCalledTimes(1);
        expect(featureRegistry.register).toHaveBeenCalledWith(new core_1.Protocol({
            id: 'https://didcomm.org/action-menu/1.0',
            roles: [ActionMenuRole_1.ActionMenuRole.Requester, ActionMenuRole_1.ActionMenuRole.Responder],
        }));
    });
});
