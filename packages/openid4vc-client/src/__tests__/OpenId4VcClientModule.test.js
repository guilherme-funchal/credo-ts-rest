"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OpenId4VcClientApi_1 = require("../OpenId4VcClientApi");
const OpenId4VcClientModule_1 = require("../OpenId4VcClientModule");
const OpenId4VcClientService_1 = require("../OpenId4VcClientService");
const dependencyManager = {
    registerInstance: jest.fn(),
    registerSingleton: jest.fn(),
    registerContextScoped: jest.fn(),
    resolve: jest.fn().mockReturnValue({ logger: { warn: jest.fn() } }),
};
describe('OpenId4VcClientModule', () => {
    test('registers dependencies on the dependency manager', () => {
        const openId4VcClientModule = new OpenId4VcClientModule_1.OpenId4VcClientModule();
        openId4VcClientModule.register(dependencyManager);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledWith(OpenId4VcClientApi_1.OpenId4VcClientApi);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(OpenId4VcClientService_1.OpenId4VcClientService);
    });
});
