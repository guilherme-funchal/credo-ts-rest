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
const core_1 = require("@aries-framework/core");
const tests_1 = require("../../../core/tests");
const src_1 = require("../../../indy-sdk/src");
const TenantAgent_1 = require("../TenantAgent");
const TenantsApi_1 = require("../TenantsApi");
const TenantAgentContextProvider_1 = require("../context/TenantAgentContextProvider");
const repository_1 = require("../repository");
const TenantRecordService_1 = require("../services/TenantRecordService");
jest.mock('../services/TenantRecordService');
const TenantRecordServiceMock = TenantRecordService_1.TenantRecordService;
jest.mock('../context/TenantAgentContextProvider');
const AgentContextProviderMock = TenantAgentContextProvider_1.TenantAgentContextProvider;
const tenantRecordService = new TenantRecordServiceMock();
const agentContextProvider = new AgentContextProviderMock();
const agentOptions = (0, tests_1.getAgentOptions)('TenantsApi', {}, { indySdk: new src_1.IndySdkModule({ indySdk: tests_1.indySdk }) });
const rootAgent = new core_1.Agent(agentOptions);
rootAgent.dependencyManager.registerInstance(core_1.InjectionSymbols.AgentContextProvider, agentContextProvider);
const tenantsApi = new TenantsApi_1.TenantsApi(tenantRecordService, rootAgent.context, agentContextProvider, rootAgent.config.logger);
describe('TenantsApi', () => {
    describe('getTenantAgent', () => {
        test('gets context from agent context provider and initializes tenant agent instance', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantDependencyManager = rootAgent.dependencyManager.createChild();
            const tenantAgentContext = (0, tests_1.getAgentContext)({
                contextCorrelationId: 'tenant-id',
                dependencyManager: tenantDependencyManager,
                agentConfig: rootAgent.config.extend({
                    label: 'tenant-agent',
                    walletConfig: {
                        id: 'Wallet: TenantsApi: tenant-id',
                        key: 'Wallet: TenantsApi: tenant-id',
                    },
                }),
            });
            tenantDependencyManager.registerInstance(core_1.AgentContext, tenantAgentContext);
            (0, tests_1.mockFunction)(agentContextProvider.getAgentContextForContextCorrelationId).mockResolvedValue(tenantAgentContext);
            const tenantAgent = yield tenantsApi.getTenantAgent({ tenantId: 'tenant-id' });
            expect(tenantAgent.isInitialized).toBe(true);
            expect(tenantAgent.wallet.walletConfig).toEqual({
                id: 'Wallet: TenantsApi: tenant-id',
                key: 'Wallet: TenantsApi: tenant-id',
            });
            expect(agentContextProvider.getAgentContextForContextCorrelationId).toBeCalledWith('tenant-id');
            expect(tenantAgent).toBeInstanceOf(TenantAgent_1.TenantAgent);
            expect(tenantAgent.context).toBe(tenantAgentContext);
            yield tenantAgent.wallet.delete();
            yield tenantAgent.endSession();
        }));
    });
    describe('withTenantAgent', () => {
        test('gets context from agent context provider and initializes tenant agent instance', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(6);
            const tenantDependencyManager = rootAgent.dependencyManager.createChild();
            const tenantAgentContext = (0, tests_1.getAgentContext)({
                contextCorrelationId: 'tenant-id',
                dependencyManager: tenantDependencyManager,
                agentConfig: rootAgent.config.extend({
                    label: 'tenant-agent',
                    walletConfig: {
                        id: 'Wallet: TenantsApi: tenant-id',
                        key: 'Wallet: TenantsApi: tenant-id',
                    },
                }),
            });
            tenantDependencyManager.registerInstance(core_1.AgentContext, tenantAgentContext);
            (0, tests_1.mockFunction)(agentContextProvider.getAgentContextForContextCorrelationId).mockResolvedValue(tenantAgentContext);
            let endSessionSpy = undefined;
            yield tenantsApi.withTenantAgent({ tenantId: 'tenant-id' }, (tenantAgent) => __awaiter(void 0, void 0, void 0, function* () {
                endSessionSpy = jest.spyOn(tenantAgent, 'endSession');
                expect(tenantAgent.isInitialized).toBe(true);
                expect(tenantAgent.wallet.walletConfig).toEqual({
                    id: 'Wallet: TenantsApi: tenant-id',
                    key: 'Wallet: TenantsApi: tenant-id',
                });
                expect(agentContextProvider.getAgentContextForContextCorrelationId).toBeCalledWith('tenant-id');
                expect(tenantAgent).toBeInstanceOf(TenantAgent_1.TenantAgent);
                expect(tenantAgent.context).toBe(tenantAgentContext);
                yield tenantAgent.wallet.delete();
            }));
            expect(endSessionSpy).toHaveBeenCalled();
        }));
        test('endSession is called even if the tenant agent callback throws an error', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(7);
            const tenantDependencyManager = rootAgent.dependencyManager.createChild();
            const tenantAgentContext = (0, tests_1.getAgentContext)({
                contextCorrelationId: 'tenant-id',
                dependencyManager: tenantDependencyManager,
                agentConfig: rootAgent.config.extend({
                    label: 'tenant-agent',
                    walletConfig: {
                        id: 'Wallet: TenantsApi: tenant-id',
                        key: 'Wallet: TenantsApi: tenant-id',
                    },
                }),
            });
            tenantDependencyManager.registerInstance(core_1.AgentContext, tenantAgentContext);
            (0, tests_1.mockFunction)(agentContextProvider.getAgentContextForContextCorrelationId).mockResolvedValue(tenantAgentContext);
            let endSessionSpy = undefined;
            yield expect(tenantsApi.withTenantAgent({ tenantId: 'tenant-id' }, (tenantAgent) => __awaiter(void 0, void 0, void 0, function* () {
                endSessionSpy = jest.spyOn(tenantAgent, 'endSession');
                expect(tenantAgent.isInitialized).toBe(true);
                expect(tenantAgent.wallet.walletConfig).toEqual({
                    id: 'Wallet: TenantsApi: tenant-id',
                    key: 'Wallet: TenantsApi: tenant-id',
                });
                expect(agentContextProvider.getAgentContextForContextCorrelationId).toBeCalledWith('tenant-id');
                expect(tenantAgent).toBeInstanceOf(TenantAgent_1.TenantAgent);
                expect(tenantAgent.context).toBe(tenantAgentContext);
                yield tenantAgent.wallet.delete();
                throw new Error('Uh oh something went wrong');
            }))).rejects.toThrow('Uh oh something went wrong');
            // endSession should have been called
            expect(endSessionSpy).toHaveBeenCalled();
        }));
    });
    describe('createTenant', () => {
        test('create tenant in the service and get the tenant agent to initialize', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantRecord = new repository_1.TenantRecord({
                id: 'tenant-id',
                config: {
                    label: 'test',
                    walletConfig: {
                        id: 'Wallet: TenantsApi: tenant-id',
                        key: 'Wallet: TenantsApi: tenant-id',
                    },
                },
            });
            const tenantAgentMock = {
                wallet: {
                    delete: jest.fn(),
                },
                endSession: jest.fn(),
            };
            (0, tests_1.mockFunction)(tenantRecordService.createTenant).mockResolvedValue(tenantRecord);
            const getTenantAgentSpy = jest.spyOn(tenantsApi, 'getTenantAgent').mockResolvedValue(tenantAgentMock);
            const createdTenantRecord = yield tenantsApi.createTenant({
                config: {
                    label: 'test',
                },
            });
            expect(getTenantAgentSpy).toHaveBeenCalledWith({ tenantId: 'tenant-id' });
            expect(createdTenantRecord).toBe(tenantRecord);
            expect(tenantAgentMock.endSession).toHaveBeenCalled();
            expect(tenantRecordService.createTenant).toHaveBeenCalledWith(rootAgent.context, {
                label: 'test',
            });
        }));
    });
    describe('getTenantById', () => {
        test('calls get tenant by id on tenant service', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantRecord = jest.fn();
            (0, tests_1.mockFunction)(tenantRecordService.getTenantById).mockResolvedValue(tenantRecord);
            const actualTenantRecord = yield tenantsApi.getTenantById('tenant-id');
            expect(tenantRecordService.getTenantById).toHaveBeenCalledWith(rootAgent.context, 'tenant-id');
            expect(actualTenantRecord).toBe(tenantRecord);
        }));
    });
    describe('deleteTenantById', () => {
        test('deletes the tenant and removes the wallet', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantAgentMock = {
                wallet: {
                    delete: jest.fn(),
                },
                endSession: jest.fn(),
            };
            const getTenantAgentSpy = jest.spyOn(tenantsApi, 'getTenantAgent').mockResolvedValue(tenantAgentMock);
            yield tenantsApi.deleteTenantById('tenant-id');
            expect(getTenantAgentSpy).toHaveBeenCalledWith({ tenantId: 'tenant-id' });
            expect(tenantAgentMock.wallet.delete).toHaveBeenCalled();
            expect(tenantAgentMock.endSession).toHaveBeenCalled();
            expect(tenantRecordService.deleteTenantById).toHaveBeenCalledWith(rootAgent.context, 'tenant-id');
        }));
    });
});
