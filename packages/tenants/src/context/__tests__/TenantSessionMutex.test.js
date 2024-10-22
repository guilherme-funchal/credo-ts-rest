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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../../../core/tests/logger"));
const TenantSessionMutex_1 = require("../TenantSessionMutex");
describe('TenantSessionMutex', () => {
    test('correctly sets values', () => {
        const tenantSessionMutex = new TenantSessionMutex_1.TenantSessionMutex(logger_1.default, 12, 50);
        expect(tenantSessionMutex.maxSessions).toBe(12);
        expect(tenantSessionMutex.currentSessions).toBe(0);
    });
    describe('acquireSession', () => {
        test('should immediately acquire the session if maxSessions has not been reached', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantSessionMutex = new TenantSessionMutex_1.TenantSessionMutex(logger_1.default, 1, 0);
            expect(tenantSessionMutex.currentSessions).toBe(0);
            yield expect(tenantSessionMutex.acquireSession()).resolves.toBeUndefined();
            expect(tenantSessionMutex.currentSessions).toBe(1);
        }));
        test('should throw an error if a session could not be acquired within sessionAcquireTimeout', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantSessionMutex = new TenantSessionMutex_1.TenantSessionMutex(logger_1.default, 1, 0);
            expect(tenantSessionMutex.currentSessions).toBe(0);
            yield tenantSessionMutex.acquireSession();
            expect(tenantSessionMutex.currentSessions).toBe(1);
            yield expect(tenantSessionMutex.acquireSession()).rejects.toThrowError('Failed to acquire an agent context session within 0ms');
            expect(tenantSessionMutex.currentSessions).toBe(1);
        }));
    });
    describe('releaseSession', () => {
        test('should release the session', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantSessionMutex = new TenantSessionMutex_1.TenantSessionMutex(logger_1.default, 1, 0);
            expect(tenantSessionMutex.currentSessions).toBe(0);
            yield tenantSessionMutex.acquireSession();
            expect(tenantSessionMutex.currentSessions).toBe(1);
            expect(tenantSessionMutex.releaseSession()).toBeUndefined();
            expect(tenantSessionMutex.currentSessions).toBe(0);
        }));
        test('resolves an acquire sessions if another sessions is being released', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantSessionMutex = new TenantSessionMutex_1.TenantSessionMutex(logger_1.default, 1, 100);
            expect(tenantSessionMutex.currentSessions).toBe(0);
            yield tenantSessionMutex.acquireSession();
            expect(tenantSessionMutex.currentSessions).toBe(1);
            const acquirePromise = tenantSessionMutex.acquireSession();
            tenantSessionMutex.releaseSession();
            expect(tenantSessionMutex.currentSessions).toBe(0);
            yield acquirePromise;
            expect(tenantSessionMutex.currentSessions).toBe(1);
        }));
    });
});
