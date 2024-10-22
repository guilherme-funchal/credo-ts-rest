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
const core_1 = require("@aries-framework/core");
const async_mutex_1 = require("async-mutex");
const helpers_1 = require("../../../../core/tests/helpers");
const logger_1 = __importDefault(require("../../../../core/tests/logger"));
const TenantsModuleConfig_1 = require("../../TenantsModuleConfig");
const repository_1 = require("../../repository");
const TenantSessionCoordinator_1 = require("../TenantSessionCoordinator");
const TenantSessionMutex_1 = require("../TenantSessionMutex");
jest.mock('../TenantSessionMutex');
const TenantSessionMutexMock = TenantSessionMutex_1.TenantSessionMutex;
const wallet = {
    initialize: jest.fn(),
};
const agentContext = (0, helpers_1.getAgentContext)({
    agentConfig: (0, helpers_1.getAgentConfig)('TenantSessionCoordinator'),
});
agentContext.dependencyManager.registerInstance(core_1.WalletApi, wallet);
const tenantSessionCoordinator = new TenantSessionCoordinator_1.TenantSessionCoordinator(agentContext, logger_1.default, new TenantsModuleConfig_1.TenantsModuleConfig());
const tenantSessionMutexMock = TenantSessionMutexMock.mock.instances[0];
describe('TenantSessionCoordinator', () => {
    afterEach(() => {
        tenantSessionCoordinator.tenantAgentContextMapping = {};
        jest.clearAllMocks();
    });
    describe('getContextForSession', () => {
        test('returns the context from the tenantAgentContextMapping and increases the session count if already available', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenant1AgentContext = jest.fn();
            const tenant1 = {
                agentContext: tenant1AgentContext,
                mutex: new async_mutex_1.Mutex(),
                sessionCount: 1,
            };
            tenantSessionCoordinator.tenantAgentContextMapping = {
                tenant1,
            };
            const tenantRecord = new repository_1.TenantRecord({
                id: 'tenant1',
                config: {
                    label: 'Test Tenant',
                    walletConfig: {
                        id: 'test-wallet',
                        key: 'test-wallet-key',
                    },
                },
            });
            const tenantAgentContext = yield tenantSessionCoordinator.getContextForSession(tenantRecord);
            expect(tenantSessionMutexMock.acquireSession).toHaveBeenCalledTimes(1);
            expect(tenantAgentContext).toBe(tenant1AgentContext);
            expect(tenant1.sessionCount).toBe(2);
        }));
        test('creates a new agent context, initializes the wallet and stores it in the tenant agent context mapping', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantRecord = new repository_1.TenantRecord({
                id: 'tenant1',
                config: {
                    label: 'Test Tenant',
                    walletConfig: {
                        id: 'test-wallet',
                        key: 'test-wallet-key',
                    },
                },
            });
            const createChildSpy = jest.spyOn(agentContext.dependencyManager, 'createChild');
            const extendSpy = jest.spyOn(agentContext.config, 'extend');
            const tenantDependencyManager = {
                registerInstance: jest.fn(),
                resolve: jest.fn(() => wallet),
            };
            createChildSpy.mockReturnValue(tenantDependencyManager);
            const tenantAgentContext = yield tenantSessionCoordinator.getContextForSession(tenantRecord);
            expect(wallet.initialize).toHaveBeenCalledWith(tenantRecord.config.walletConfig);
            expect(tenantSessionMutexMock.acquireSession).toHaveBeenCalledTimes(1);
            expect(extendSpy).toHaveBeenCalledWith(tenantRecord.config);
            expect(createChildSpy).toHaveBeenCalledWith();
            expect(tenantDependencyManager.registerInstance).toHaveBeenCalledWith(core_1.AgentContext, expect.any(core_1.AgentContext));
            expect(tenantDependencyManager.registerInstance).toHaveBeenCalledWith(core_1.AgentConfig, expect.any(core_1.AgentConfig));
            expect(tenantSessionCoordinator.tenantAgentContextMapping.tenant1).toEqual({
                agentContext: tenantAgentContext,
                mutex: expect.objectContaining({
                    acquire: expect.any(Function),
                    cancel: expect.any(Function),
                    isLocked: expect.any(Function),
                    release: expect.any(Function),
                    runExclusive: expect.any(Function),
                    waitForUnlock: expect.any(Function),
                }),
                sessionCount: 1,
            });
            expect(tenantAgentContext.contextCorrelationId).toBe('tenant1');
        }));
        test('rethrows error and releases session if error is throw while getting agent context', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantRecord = new repository_1.TenantRecord({
                id: 'tenant1',
                config: {
                    label: 'Test Tenant',
                    walletConfig: {
                        id: 'test-wallet',
                        key: 'test-wallet-key',
                    },
                },
            });
            // Throw error during wallet initialization
            (0, helpers_1.mockFunction)(wallet.initialize).mockRejectedValue(new Error('Test error'));
            yield expect(tenantSessionCoordinator.getContextForSession(tenantRecord)).rejects.toThrowError('Test error');
            expect(wallet.initialize).toHaveBeenCalledWith(tenantRecord.config.walletConfig);
            expect(tenantSessionMutexMock.acquireSession).toHaveBeenCalledTimes(1);
            expect(tenantSessionMutexMock.releaseSession).toHaveBeenCalledTimes(1);
        }));
        test('locks and waits for lock to release when initialization is already in progress', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantRecord = new repository_1.TenantRecord({
                id: 'tenant1',
                config: {
                    label: 'Test Tenant',
                    walletConfig: {
                        id: 'test-wallet',
                        key: 'test-wallet-key',
                    },
                },
            });
            // Add timeout to mock the initialization and we can test that the mutex is used.
            (0, helpers_1.mockFunction)(wallet.initialize).mockReturnValueOnce(new Promise((resolve) => setTimeout(resolve, 100)));
            // Start two context session creations (but don't await). It should set the mutex property on the tenant agent context mapping.
            const tenantAgentContext1Promise = tenantSessionCoordinator.getContextForSession(tenantRecord);
            const tenantAgentContext2Promise = tenantSessionCoordinator.getContextForSession(tenantRecord);
            expect(tenantSessionCoordinator.tenantAgentContextMapping.tenant1).toBeUndefined();
            // Await first session promise, should have 1 session
            const tenantAgentContext1 = yield tenantAgentContext1Promise;
            expect(tenantSessionCoordinator.tenantAgentContextMapping.tenant1).toEqual({
                agentContext: tenantAgentContext1,
                sessionCount: 1,
                mutex: expect.objectContaining({
                    acquire: expect.any(Function),
                    cancel: expect.any(Function),
                    isLocked: expect.any(Function),
                    release: expect.any(Function),
                    runExclusive: expect.any(Function),
                    waitForUnlock: expect.any(Function),
                }),
            });
            // There should be two sessions active now
            const tenantAgentContext2 = yield tenantAgentContext2Promise;
            expect(tenantSessionCoordinator.tenantAgentContextMapping.tenant1).toEqual({
                agentContext: tenantAgentContext1,
                sessionCount: 2,
                mutex: expect.objectContaining({
                    acquire: expect.any(Function),
                    cancel: expect.any(Function),
                    isLocked: expect.any(Function),
                    release: expect.any(Function),
                    runExclusive: expect.any(Function),
                    waitForUnlock: expect.any(Function),
                }),
            });
            // Initialize should only be called once
            expect(wallet.initialize).toHaveBeenCalledWith(tenantRecord.config.walletConfig);
            expect(wallet.initialize).toHaveBeenCalledTimes(1);
            expect(tenantAgentContext1).toBe(tenantAgentContext2);
        }));
    });
    describe('endAgentContextSessions', () => {
        test('Returns early and does not release a session if the agent context correlation id matches the root agent context', () => __awaiter(void 0, void 0, void 0, function* () {
            const rootAgentContextMock = {
                contextCorrelationId: 'mock',
                dependencyManager: { dispose: jest.fn() },
            };
            yield tenantSessionCoordinator.endAgentContextSession(rootAgentContextMock);
            expect(tenantSessionMutexMock.releaseSession).not.toHaveBeenCalled();
        }));
        test('throws an error if not agent context session exists for the tenant', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantAgentContextMock = { contextCorrelationId: 'does-not-exist' };
            expect(tenantSessionCoordinator.endAgentContextSession(tenantAgentContextMock)).rejects.toThrowError(`Unknown agent context with contextCorrelationId 'does-not-exist'. Cannot end session`);
        }));
        test('decreases the tenant session count and calls release session', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenant1AgentContext = { contextCorrelationId: 'tenant1' };
            const tenant1 = {
                agentContext: tenant1AgentContext,
                mutex: (0, async_mutex_1.withTimeout)(new async_mutex_1.Mutex(), 0),
                sessionCount: 2,
            };
            tenantSessionCoordinator.tenantAgentContextMapping = {
                tenant1,
            };
            yield tenantSessionCoordinator.endAgentContextSession(tenant1AgentContext);
            // Should have reduced session count by one
            expect(tenantSessionCoordinator.tenantAgentContextMapping.tenant1).toEqual({
                agentContext: tenant1AgentContext,
                mutex: tenant1.mutex,
                sessionCount: 1,
            });
            expect(tenantSessionMutexMock.releaseSession).toHaveBeenCalledTimes(1);
        }));
        test('closes the agent context and removes the agent context mapping if the number of sessions reaches 0', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenant1AgentContext = {
                dependencyManager: { dispose: jest.fn() },
                contextCorrelationId: 'tenant1',
            };
            const tenant1 = {
                agentContext: tenant1AgentContext,
                mutex: (0, async_mutex_1.withTimeout)(new async_mutex_1.Mutex(), 0),
                sessionCount: 1,
            };
            tenantSessionCoordinator.tenantAgentContextMapping = {
                tenant1,
            };
            yield tenantSessionCoordinator.endAgentContextSession(tenant1AgentContext);
            // Should have removed tenant1
            expect(tenantSessionCoordinator.tenantAgentContextMapping.tenant1).toBeUndefined();
            expect(tenant1AgentContext.dependencyManager.dispose).toHaveBeenCalledTimes(1);
            expect(tenantSessionMutexMock.releaseSession).toHaveBeenCalledTimes(1);
        }));
    });
});
