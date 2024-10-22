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
const SubjectInboundTransport_1 = require("../../../tests/transport/SubjectInboundTransport");
const SubjectOutboundTransport_1 = require("../../../tests/transport/SubjectOutboundTransport");
const tests_1 = require("../../core/tests");
const src_1 = require("../../indy-sdk/src");
const tenants_1 = require("@aries-framework/tenants");
const agent1Config = {
    label: 'Tenant Agent 1',
    walletConfig: {
        id: 'Wallet: tenants e2e agent 1',
        key: 'Wallet: tenants e2e agent 1',
    },
    logger: tests_1.testLogger,
    endpoints: ['rxjs:tenant-agent1'],
};
const agent2Config = {
    label: 'Tenant Agent 2',
    walletConfig: {
        id: 'Wallet: tenants e2e agent 2',
        key: 'Wallet: tenants e2e agent 2',
    },
    logger: tests_1.testLogger,
    endpoints: ['rxjs:tenant-agent2'],
};
// Create multi-tenant agents
const agent1 = new core_1.Agent({
    config: agent1Config,
    modules: {
        tenants: new tenants_1.TenantsModule(),
        indySdk: new src_1.IndySdkModule({ indySdk: tests_1.indySdk }),
        connections: new core_1.ConnectionsModule({
            autoAcceptConnections: true,
        }),
    },
    dependencies: node_1.agentDependencies,
});
const agent2 = new core_1.Agent({
    config: agent2Config,
    modules: {
        tenants: new tenants_1.TenantsModule(),
        indySdk: new src_1.IndySdkModule({ indySdk: tests_1.indySdk }),
        connections: new core_1.ConnectionsModule({
            autoAcceptConnections: true,
        }),
    },
    dependencies: node_1.agentDependencies,
});
// Register inbound and outbound transports (so we can communicate with ourselves)
const agent1InboundTransport = new SubjectInboundTransport_1.SubjectInboundTransport();
const agent2InboundTransport = new SubjectInboundTransport_1.SubjectInboundTransport();
agent1.registerInboundTransport(agent1InboundTransport);
agent2.registerInboundTransport(agent2InboundTransport);
agent1.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport({
    'rxjs:tenant-agent1': agent1InboundTransport.ourSubject,
    'rxjs:tenant-agent2': agent2InboundTransport.ourSubject,
}));
agent2.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport({
    'rxjs:tenant-agent1': agent1InboundTransport.ourSubject,
    'rxjs:tenant-agent2': agent2InboundTransport.ourSubject,
}));
describe('Tenants E2E', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent1.initialize();
        yield agent2.initialize();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent1.wallet.delete();
        yield agent1.shutdown();
        yield agent2.wallet.delete();
        yield agent2.shutdown();
    }));
    test('create get and delete a tenant', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create tenant
        let tenantRecord1 = yield agent1.modules.tenants.createTenant({
            config: {
                label: 'Tenant 1',
            },
        });
        // Retrieve tenant record from storage
        tenantRecord1 = yield agent1.modules.tenants.getTenantById(tenantRecord1.id);
        // Get tenant agent
        const tenantAgent = yield agent1.modules.tenants.getTenantAgent({
            tenantId: tenantRecord1.id,
        });
        yield tenantAgent.endSession();
        // Delete tenant agent
        yield agent1.modules.tenants.deleteTenantById(tenantRecord1.id);
        // Can not get tenant agent again
        yield expect(agent1.modules.tenants.getTenantAgent({ tenantId: tenantRecord1.id })).rejects.toThrow(`TenantRecord: record with id ${tenantRecord1.id} not found.`);
    }));
    test('create a connection between two tenants within the same agent', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create tenants
        const tenantRecord1 = yield agent1.modules.tenants.createTenant({
            config: {
                label: 'Tenant 1',
            },
        });
        const tenantRecord2 = yield agent1.modules.tenants.createTenant({
            config: {
                label: 'Tenant 2',
            },
        });
        const tenantAgent1 = yield agent1.modules.tenants.getTenantAgent({
            tenantId: tenantRecord1.id,
        });
        const tenantAgent2 = yield agent1.modules.tenants.getTenantAgent({
            tenantId: tenantRecord2.id,
        });
        // Create and receive oob invitation in scope of tenants
        const outOfBandRecord = yield tenantAgent1.oob.createInvitation();
        const { connectionRecord: tenant2ConnectionRecord } = yield tenantAgent2.oob.receiveInvitation(outOfBandRecord.outOfBandInvitation);
        // Retrieve all oob records for the base and tenant agent, only the
        // tenant agent should have a record.
        const baseAgentOutOfBandRecords = yield agent1.oob.getAll();
        const tenantAgent1OutOfBandRecords = yield tenantAgent1.oob.getAll();
        const tenantAgent2OutOfBandRecords = yield tenantAgent2.oob.getAll();
        expect(baseAgentOutOfBandRecords.length).toBe(0);
        expect(tenantAgent1OutOfBandRecords.length).toBe(1);
        expect(tenantAgent2OutOfBandRecords.length).toBe(1);
        if (!tenant2ConnectionRecord)
            throw new Error('Receive invitation did not return connection record');
        yield tenantAgent2.connections.returnWhenIsConnected(tenant2ConnectionRecord.id);
        // Find the connection record for the created oob invitation
        const [connectionRecord] = yield tenantAgent1.connections.findAllByOutOfBandId(outOfBandRecord.id);
        yield tenantAgent1.connections.returnWhenIsConnected(connectionRecord.id);
        yield tenantAgent1.endSession();
        yield tenantAgent2.endSession();
        // Delete tenants (will also delete wallets)
        yield agent1.modules.tenants.deleteTenantById(tenantAgent1.context.contextCorrelationId);
        yield agent1.modules.tenants.deleteTenantById(tenantAgent2.context.contextCorrelationId);
    }));
    test('create a connection between two tenants within different agents', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create tenants
        const tenantRecord1 = yield agent1.modules.tenants.createTenant({
            config: {
                label: 'Agent 1 Tenant 1',
            },
        });
        const tenantAgent1 = yield agent1.modules.tenants.getTenantAgent({
            tenantId: tenantRecord1.id,
        });
        const tenantRecord2 = yield agent2.modules.tenants.createTenant({
            config: {
                label: 'Agent 2 Tenant 1',
            },
        });
        const tenantAgent2 = yield agent2.modules.tenants.getTenantAgent({
            tenantId: tenantRecord2.id,
        });
        // Create and receive oob invitation in scope of tenants
        const outOfBandRecord = yield tenantAgent1.oob.createInvitation();
        const { connectionRecord: tenant2ConnectionRecord } = yield tenantAgent2.oob.receiveInvitation(outOfBandRecord.outOfBandInvitation);
        if (!tenant2ConnectionRecord)
            throw new Error('Receive invitation did not return connection record');
        yield tenantAgent2.connections.returnWhenIsConnected(tenant2ConnectionRecord.id);
        // Find the connection record for the created oob invitation
        const [connectionRecord] = yield tenantAgent1.connections.findAllByOutOfBandId(outOfBandRecord.id);
        yield tenantAgent1.connections.returnWhenIsConnected(connectionRecord.id);
        yield tenantAgent1.endSession();
        yield tenantAgent2.endSession();
        // Delete tenants (will also delete wallets)
        yield agent1.modules.tenants.deleteTenantById(tenantRecord1.id);
        yield agent2.modules.tenants.deleteTenantById(tenantRecord2.id);
    }));
    test('perform actions within the callback of withTenantAgent', () => __awaiter(void 0, void 0, void 0, function* () {
        const tenantRecord = yield agent1.modules.tenants.createTenant({
            config: {
                label: 'Agent 1 Tenant 1',
            },
        });
        yield agent1.modules.tenants.withTenantAgent({ tenantId: tenantRecord.id }, (tenantAgent) => __awaiter(void 0, void 0, void 0, function* () {
            const outOfBandRecord = yield tenantAgent.oob.createInvitation();
            expect(outOfBandRecord).toBeInstanceOf(core_1.OutOfBandRecord);
            expect(tenantAgent.context.contextCorrelationId).toBe(tenantRecord.id);
            expect(tenantAgent.config.label).toBe('Agent 1 Tenant 1');
        }));
        yield agent1.modules.tenants.deleteTenantById(tenantRecord.id);
    }));
});
