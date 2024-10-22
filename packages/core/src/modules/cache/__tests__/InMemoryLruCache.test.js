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
const helpers_1 = require("../../../../tests/helpers");
const InMemoryLruCache_1 = require("../InMemoryLruCache");
const agentContext = (0, helpers_1.getAgentContext)();
describe('InMemoryLruCache', () => {
    let cache;
    beforeEach(() => {
        cache = new InMemoryLruCache_1.InMemoryLruCache({ limit: 2 });
    });
    it('should set, get and remove a value', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield cache.get(agentContext, 'item')).toBeNull();
        yield cache.set(agentContext, 'item', 'somevalue');
        expect(yield cache.get(agentContext, 'item')).toBe('somevalue');
        yield cache.remove(agentContext, 'item');
        expect(yield cache.get(agentContext, 'item')).toBeNull();
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
});
