"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DependencyManager_1 = require("../../../plugins/DependencyManager");
const GenericRecordsApi_1 = require("../GenericRecordsApi");
const GenericRecordsModule_1 = require("../GenericRecordsModule");
const GenericRecordsRepository_1 = require("../repository/GenericRecordsRepository");
const GenericRecordService_1 = require("../services/GenericRecordService");
jest.mock('../../../plugins/DependencyManager');
const DependencyManagerMock = DependencyManager_1.DependencyManager;
const dependencyManager = new DependencyManagerMock();
describe('GenericRecordsModule', () => {
    test('registers dependencies on the dependency manager', () => {
        new GenericRecordsModule_1.GenericRecordsModule().register(dependencyManager);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledWith(GenericRecordsApi_1.GenericRecordsApi);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(2);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(GenericRecordService_1.GenericRecordService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(GenericRecordsRepository_1.GenericRecordsRepository);
    });
});
