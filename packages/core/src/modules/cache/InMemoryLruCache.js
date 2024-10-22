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
exports.InMemoryLruCache = void 0;
const lru_map_1 = require("lru_map");
/**
 * In memory LRU cache.
 *
 * This cache can be used with multiple agent context instances, however all instances will share the same cache.
 * If you need the cache to be isolated per agent context instance, make sure to use a different cache implementation.
 */
class InMemoryLruCache {
    constructor({ limit }) {
        this.cache = new lru_map_1.LRUMap(limit);
    }
    get(agentContext, key) {
        return __awaiter(this, void 0, void 0, function* () {
            this.removeExpiredItems();
            const item = this.cache.get(key);
            // Does not exist
            if (!item)
                return null;
            return item.value;
        });
    }
    set(agentContext, key, value, expiresInSeconds) {
        return __awaiter(this, void 0, void 0, function* () {
            this.removeExpiredItems();
            let expiresDate = undefined;
            if (expiresInSeconds) {
                expiresDate = new Date();
                expiresDate.setSeconds(expiresDate.getSeconds() + expiresInSeconds);
            }
            this.cache.set(key, {
                expiresAt: expiresDate === null || expiresDate === void 0 ? void 0 : expiresDate.getTime(),
                value,
            });
        });
    }
    clear() {
        this.cache.clear();
    }
    remove(agentContext, key) {
        return __awaiter(this, void 0, void 0, function* () {
            this.removeExpiredItems();
            this.cache.delete(key);
        });
    }
    removeExpiredItems() {
        this.cache.forEach((value, key) => {
            if (value.expiresAt && Date.now() > value.expiresAt) {
                this.cache.delete(key);
            }
        });
    }
}
exports.InMemoryLruCache = InMemoryLruCache;
