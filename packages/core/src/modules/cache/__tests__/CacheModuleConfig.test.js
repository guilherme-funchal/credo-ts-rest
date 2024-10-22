"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CacheModuleConfig_1 = require("../CacheModuleConfig");
const InMemoryLruCache_1 = require("../InMemoryLruCache");
describe('CacheModuleConfig', () => {
    test('sets values', () => {
        const cache = new InMemoryLruCache_1.InMemoryLruCache({ limit: 1 });
        const config = new CacheModuleConfig_1.CacheModuleConfig({
            cache,
        });
        expect(config.cache).toEqual(cache);
    });
});
