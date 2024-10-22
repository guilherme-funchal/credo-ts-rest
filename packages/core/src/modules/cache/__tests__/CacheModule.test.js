"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DependencyManager_1 = require("../../../plugins/DependencyManager");
const CacheModule_1 = require("../CacheModule");
const CacheModuleConfig_1 = require("../CacheModuleConfig");
const InMemoryLruCache_1 = require("../InMemoryLruCache");
const singleContextLruCache_1 = require("../singleContextLruCache");
const SingleContextLruCacheRepository_1 = require("../singleContextLruCache/SingleContextLruCacheRepository");
jest.mock('../../../plugins/DependencyManager');
const DependencyManagerMock = DependencyManager_1.DependencyManager;
const dependencyManager = new DependencyManagerMock();
describe('CacheModule', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test('registers dependencies on the dependency manager', () => {
        const cacheModule = new CacheModule_1.CacheModule({
            cache: new InMemoryLruCache_1.InMemoryLruCache({ limit: 1 }),
        });
        cacheModule.register(dependencyManager);
        expect(dependencyManager.registerInstance).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerInstance).toHaveBeenCalledWith(CacheModuleConfig_1.CacheModuleConfig, cacheModule.config);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(0);
    });
    test('registers cache repository on the dependency manager if the SingleContextStorageLruCache is used', () => {
        const cacheModule = new CacheModule_1.CacheModule({
            cache: new singleContextLruCache_1.SingleContextStorageLruCache({ limit: 1 }),
        });
        cacheModule.register(dependencyManager);
        expect(dependencyManager.registerInstance).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerInstance).toHaveBeenCalledWith(CacheModuleConfig_1.CacheModuleConfig, cacheModule.config);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(SingleContextLruCacheRepository_1.SingleContextLruCacheRepository);
    });
});
