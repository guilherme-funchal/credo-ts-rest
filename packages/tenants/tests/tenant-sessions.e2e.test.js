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
const node_1 = require("@aries-framework/node");
const tests_1 = require("../../core/tests");
const src_1 = require("../../indy-sdk/src");
const tenants_1 = require("@aries-framework/tenants");
const agentConfig = {
    label: 'Tenant Agent 1',
    walletConfig: {
        id: 'Wallet: tenant sessions e2e agent 1',
        key: 'Wallet: tenant sessions e2e agent 1',
    },
    logger: tests_1.testLogger,
    endpoints: ['rxjs:tenant-agent1'],
};
// Create multi-tenant agent
const agent = new core_1.Agent({
    config: agentConfig,
    dependencies: node_1.agentDependencies,
    modules: {
        tenants: new tenants_1.TenantsModule({ sessionAcquireTimeout: 10000 }),
        indySdk: new src_1.IndySdkModule({ indySdk: tests_1.indySdk }),
        connections: new core_1.ConnectionsModule({
            autoAcceptConnections: true,
        }),
    },
});
describe('Tenants Sessions E2E', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.initialize();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.wallet.delete();
        yield agent.shutdown();
    }));
    test('create 100 sessions in parallel for the same tenant and close them', () => __awaiter(void 0, void 0, void 0, function* () {
        const numberOfSessions = 100;
        const tenantRecord = yield agent.modules.tenants.createTenant({
            config: {
                label: 'Agent 1 Tenant 1',
            },
        });
        const tenantAgentPromises = [];
        for (let session = 0; session < numberOfSessions; session++) {
            tenantAgentPromises.push(agent.modules.tenants.getTenantAgent({ tenantId: tenantRecord.id }));
        }
        const tenantAgents = yield Promise.all(tenantAgentPromises);
        yield Promise.all(tenantAgents.map((tenantAgent) => tenantAgent.endSession()));
    }));
    test('create 5 sessions each for 20 tenants in parallel and close them', () => __awaiter(void 0, void 0, void 0, function* () {
        const numberOfTenants = 20;
        const numberOfSessions = 5;
        const tenantRecordPromises = [];
        for (let tenantNo = 0; tenantNo < numberOfTenants; tenantNo++) {
            const tenantRecord = agent.modules.tenants.createTenant({
                config: {
                    label: 'Agent 1 Tenant 1',
                },
            });
            tenantRecordPromises.push(tenantRecord);
        }
        const tenantRecords = yield Promise.all(tenantRecordPromises);
        const tenantAgentPromises = [];
        for (const tenantRecord of tenantRecords) {
            for (let session = 0; session < numberOfSessions; session++) {
                tenantAgentPromises.push(agent.modules.tenants.getTenantAgent({ tenantId: tenantRecord.id }));
            }
        }
        const tenantAgents = yield Promise.all(tenantAgentPromises);
        yield Promise.all(tenantAgents.map((tenantAgent) => tenantAgent.endSession()));
    }));
});
