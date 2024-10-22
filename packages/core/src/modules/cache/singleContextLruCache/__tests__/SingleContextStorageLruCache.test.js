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
const helpers_1 = require("../../../../../tests/helpers");
const SingleContextLruCacheRecord_1 = require("../SingleContextLruCacheRecord");
const SingleContextLruCacheRepository_1 = require("../SingleContextLruCacheRepository");
const SingleContextStorageLruCache_1 = require("../SingleContextStorageLruCache");
jest.mock('../SingleContextLruCacheRepository');
const SingleContextLruCacheRepositoryMock = SingleContextLruCacheRepository_1.SingleContextLruCacheRepository;
const cacheRepository = new SingleContextLruCacheRepositoryMock();
const agentContext = (0, helpers_1.getAgentContext)({
    registerInstances: [[SingleContextLruCacheRepository_1.SingleContextLruCacheRepository, cacheRepository]],
});
describe('SingleContextLruCache', () => {
    let cache;
    beforeEach(() => {
        (0, helpers_1.mockFunction)(cacheRepository.findById).mockResolvedValue(null);
        cache = new SingleContextStorageLruCache_1.SingleContextStorageLruCache({ limit: 2 });
    });
    it('should return the value from the persisted record', () => __awaiter(void 0, void 0, void 0, function* () {
        const findMock = (0, helpers_1.mockFunction)(cacheRepository.findById).mockResolvedValue(new SingleContextLruCacheRecord_1.SingleContextLruCacheRecord({
            id: 'CONTEXT_STORAGE_LRU_CACHE_ID',
            entries: new Map([
                [
                    'test',
                    {
                        value: 'somevalue',
                    },
                ],
            ]),
        }));
        expect(yield cache.get(agentContext, 'doesnotexist')).toBeNull();
        expect(yield cache.get(agentContext, 'test')).toBe('somevalue');
        expect(findMock).toHaveBeenCalledWith(agentContext, 'CONTEXT_STORAGE_LRU_CACHE_ID');
    }));
    it('should set the value in the persisted record', () => __awaiter(void 0, void 0, void 0, function* () {
        const updateMock = (0, helpers_1.mockFunction)(cacheRepository.update).mockResolvedValue();
        yield cache.set(agentContext, 'test', 'somevalue');
        const [[, cacheRecord]] = updateMock.mock.calls;
        expect(cacheRecord.entries.size).toBe(1);
        const [[key, item]] = cacheRecord.entries.entries();
        expect(key).toBe('test');
        expect(item.value).toBe('somevalue');
        expect(yield cache.get(agentContext, 'test')).toBe('somevalue');
    }));
    it('should remove least recently used entries if entries are added that exceed the limit', () => __awaiter(void 0, void 0, void 0, function* () {
        // Set first value in cache, resolves fine
        yield cache.set(agentContext, 'one', 'valueone');
        expect(yield cache.get(agentContext, 'one')).toBe('valueone');
        // Set two more entries in the cache. Third item
        // exceeds limit, so first item gets removed
        yield cache.set(agentContext, 'two', 'valuetwo');
        yield cache.set(agentContext, 'three', 'valuethree');
        expect(yield cache.get(agentContext, 'one')).toBeNull();
        expect(yield cache.get(agentContext, 'two')).toBe('valuetwo');
        expect(yield cache.get(agentContext, 'three')).toBe('valuethree');
        // Get two from the cache, meaning three will be removed first now
        // because it is not recently used
        yield cache.get(agentContext, 'two');
        yield cache.set(agentContext, 'four', 'valuefour');
        expect(yield cache.get(agentContext, 'three')).toBeNull();
        expect(yield cache.get(agentContext, 'two')).toBe('valuetwo');
    }));
    it('should throw an error if used with multiple context correlation ids', () => __awaiter(void 0, void 0, void 0, function* () {
        // No issue, first call with an agentContext
        yield cache.get(agentContext, 'test');
        const secondAgentContext = (0, helpers_1.getAgentContext)({
            contextCorrelationId: 'another',
        });
        expect(cache.get(secondAgentContext, 'test')).rejects.toThrowError('SingleContextStorageLruCache can not be used with multiple agent context instances. Register a custom cache implementation in the CacheModule.');
    }));
});
