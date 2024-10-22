"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aries-framework/core");
const tests_1 = require("../../../core/tests");
const helpers_1 = require("../../../core/tests/helpers");
const src_1 = require("../../../indy-sdk/src");
const TenantAgent_1 = require("../TenantAgent");
describe('TenantAgent', () => {
    test('possible to construct a TenantAgent instance', () => {
        const agent = new core_1.Agent({
            config: {
                label: 'test',
                walletConfig: {
                    id: 'Wallet: TenantAgentRoot',
                    key: 'Wallet: TenantAgentRoot',
                },
            },
            dependencies: helpers_1.agentDependencies,
            modules: {
                indySdk: new src_1.IndySdkModule({ indySdk: tests_1.indySdk }),
            },
        });
        const tenantDependencyManager = agent.dependencyManager.createChild();
        const agentContext = (0, helpers_1.getAgentContext)({
            agentConfig: (0, helpers_1.getAgentConfig)('TenantAgent'),
            dependencyManager: tenantDependencyManager,
        });
        tenantDependencyManager.registerInstance(core_1.AgentContext, agentContext);
        const tenantAgent = new TenantAgent_1.TenantAgent(agentContext);
        expect(tenantAgent).toBeInstanceOf(TenantAgent_1.TenantAgent);
    });
});
