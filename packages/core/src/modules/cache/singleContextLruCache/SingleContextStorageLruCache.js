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
exports.SingleContextStorageLruCache = void 0;
const lru_map_1 = require("lru_map");
const error_1 = require("../../../error");
const SingleContextLruCacheRecord_1 = require("./SingleContextLruCacheRecord");
const SingleContextLruCacheRepository_1 = require("./SingleContextLruCacheRepository");
const CONTEXT_STORAGE_LRU_CACHE_ID = 'CONTEXT_STORAGE_LRU_CACHE_ID';
/**
 * Cache that leverages the storage associated with the agent context to store cache records.
 * It will keep an in-memory cache of the records to avoid hitting the storage on every read request.
 * Therefor this cache is meant to be used with a single instance of the agent.
 *
 * Due to keeping an in-memory copy of the cache, it is also not meant to be used with multiple
 * agent context instances (meaning multi-tenancy), as they will overwrite the in-memory cache.
 *
 * However, this means the cache is not meant for usage with multiple instances.
 */
class SingleContextStorageLruCache {
    constructor({ limit }) {
        this.limit = limit;
    }
    get(agentContext, key) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertContextCorrelationId(agentContext);
            const cache = yield this.getCache(agentContext);
            this.removeExpiredItems(cache);
            const item = cache.get(key);
            // Does not exist
            if (!item)
                return null;
            // Expired
            if (item.expiresAt && Date.now() > item.expiresAt) {
                cache.delete(key);
                yield this.persistCache(agentContext);
                return null;
            }
            return item.value;
        });
    }
    set(agentContext, key, value, expiresInSeconds) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertContextCorrelationId(agentContext);
            let expiresDate = undefined;
            if (expiresInSeconds) {
                expiresDate = new Date();
                expiresDate.setSeconds(expiresDate.getSeconds() + expiresInSeconds);
            }
            const cache = yield this.getCache(agentContext);
            this.removeExpiredItems(cache);
            cache.set(key, {
                expiresAt: expiresDate === null || expiresDate === void 0 ? void 0 : expiresDate.getTime(),
                value,
            });
            yield this.persistCache(agentContext);
        });
    }
    remove(agentContext, key) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertContextCorrelationId(agentContext);
            const cache = yield this.getCache(agentContext);
            this.removeExpiredItems(cache);
            cache.delete(key);
            yield this.persistCache(agentContext);
        });
    }
    getCache(agentContext) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._cache) {
                const cacheRecord = yield this.fetchCacheRecord(agentContext);
                this._cache = this.lruFromRecord(cacheRecord);
            }
            return this._cache;
        });
    }
    lruFromRecord(cacheRecord) {
        return new lru_map_1.LRUMap(this.limit, cacheRecord.entries.entries());
    }
    fetchCacheRecord(agentContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheRepository = agentContext.dependencyManager.resolve(SingleContextLruCacheRepository_1.SingleContextLruCacheRepository);
            let cacheRecord = yield cacheRepository.findById(agentContext, CONTEXT_STORAGE_LRU_CACHE_ID);
            if (!cacheRecord) {
                cacheRecord = new SingleContextLruCacheRecord_1.SingleContextLruCacheRecord({
                    id: CONTEXT_STORAGE_LRU_CACHE_ID,
                    entries: new Map(),
                });
                try {
                    yield cacheRepository.save(agentContext, cacheRecord);
                }
                catch (error) {
                    // This addresses some race conditions issues where we first check if the record exists
                    // then we create one if it doesn't, but another process has created one in the meantime
                    // Although not the most elegant solution, it addresses the issues
                    if (error instanceof error_1.RecordDuplicateError) {
                        // the record already exists, which is our intended end state
                        // we can ignore this error and fetch the existing record
                        return cacheRepository.getById(agentContext, CONTEXT_STORAGE_LRU_CACHE_ID);
                    }
                    else {
                        throw error;
                    }
                }
            }
            return cacheRecord;
        });
    }
    removeExpiredItems(cache) {
        cache.forEach((value, key) => {
            if (value.expiresAt && Date.now() > value.expiresAt) {
                cache.delete(key);
            }
        });
    }
    persistCache(agentContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheRepository = agentContext.dependencyManager.resolve(SingleContextLruCacheRepository_1.SingleContextLruCacheRepository);
            const cache = yield this.getCache(agentContext);
            yield cacheRepository.update(agentContext, new SingleContextLruCacheRecord_1.SingleContextLruCacheRecord({
                entries: new Map(cache.toJSON().map(({ key, value }) => [key, value])),
                id: CONTEXT_STORAGE_LRU_CACHE_ID,
            }));
        });
    }
    /**
     * Asserts this class is not used with multiple agent context instances.
     */
    assertContextCorrelationId(agentContext) {
        if (!this._contextCorrelationId) {
            this._contextCorrelationId = agentContext.contextCorrelationId;
        }
        if (this._contextCorrelationId !== agentContext.contextCorrelationId) {
            throw new error_1.AriesFrameworkError('SingleContextStorageLruCache can not be used with multiple agent context instances. Register a custom cache implementation in the CacheModule.');
        }
    }
}
exports.SingleContextStorageLruCache = SingleContextStorageLruCache;
