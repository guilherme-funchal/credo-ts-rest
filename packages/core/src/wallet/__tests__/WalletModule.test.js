"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DependencyManager_1 = require("../../plugins/DependencyManager");
const WalletApi_1 = require("../WalletApi");
const WalletModule_1 = require("../WalletModule");
jest.mock('../../plugins/DependencyManager');
const DependencyManagerMock = DependencyManager_1.DependencyManager;
const dependencyManager = new DependencyManagerMock();
describe('WalletModule', () => {
    test('registers dependencies on the dependency manager', () => {
        new WalletModule_1.WalletModule().register(dependencyManager);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledWith(WalletApi_1.WalletApi);
    });
});
