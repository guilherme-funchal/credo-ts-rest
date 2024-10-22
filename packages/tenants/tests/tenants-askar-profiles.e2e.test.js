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
const runInVersion_1 = require("../../../tests/runInVersion");
const src_1 = require("../../askar/src");
const helpers_1 = require("../../askar/tests/helpers");
const tests_1 = require("../../core/tests");
const tenants_1 = require("@aries-framework/tenants");
// FIXME: Re-include in tests when Askar NodeJS wrapper performance is improved
(0, runInVersion_1.describeRunInNodeVersion)([18], 'Tenants Askar database schemes E2E', () => {
    test('uses AskarWallet for all wallets and tenants when database schema is DatabasePerWallet', () => __awaiter(void 0, void 0, void 0, function* () {
        const agentConfig = {
            label: 'Tenant Agent 1',
            walletConfig: {
                id: 'Wallet: askar tenants without profiles e2e agent 1',
                key: 'Wallet: askar tenants without profiles e2e agent 1',
            },
            logger: tests_1.testLogger,
        };
        // Create multi-tenant agent
        const agent = new core_1.Agent({
            config: agentConfig,
            modules: {
                tenants: new tenants_1.TenantsModule(),
                askar: new src_1.AskarModule({
                    ariesAskar: helpers_1.askarModuleConfig.ariesAskar,
                    // Database per wallet
                    multiWalletDatabaseScheme: src_1.AskarMultiWalletDatabaseScheme.DatabasePerWallet,
                }),
            },
            dependencies: node_1.agentDependencies,
        });
        yield agent.initialize();
        // main wallet should use AskarWallet
        expect(agent.context.wallet).toBeInstanceOf(src_1.AskarWallet);
        const mainWallet = agent.context.wallet;
        // Create tenant
        const tenantRecord = yield agent.modules.tenants.createTenant({
            config: {
                label: 'Tenant 1',
            },
        });
        // Get tenant agent
        const tenantAgent = yield agent.modules.tenants.getTenantAgent({
            tenantId: tenantRecord.id,
        });
        expect(tenantAgent.context.wallet).toBeInstanceOf(src_1.AskarWallet);
        const tenantWallet = tenantAgent.context.wallet;
        // By default, profile is the same as the wallet id
        expect(tenantWallet.profile).toEqual(`tenant-${tenantRecord.id}`);
        // But the store should be different
        expect(tenantWallet.store).not.toBe(mainWallet.store);
        // Insert and end
        yield tenantAgent.genericRecords.save({ content: { name: 'hello' }, id: 'hello' });
        yield tenantAgent.endSession();
        const tenantAgent2 = yield agent.modules.tenants.getTenantAgent({ tenantId: tenantRecord.id });
        expect(yield tenantAgent2.genericRecords.findById('hello')).not.toBeNull();
        yield agent.wallet.delete();
        yield agent.shutdown();
    }));
    test('uses AskarWallet for main agent, and ProfileAskarWallet for tenants', () => __awaiter(void 0, void 0, void 0, function* () {
        const agentConfig = {
            label: 'Tenant Agent 1',
            walletConfig: {
                id: 'Wallet: askar tenants with profiles e2e agent 1',
                key: 'Wallet: askar tenants with profiles e2e agent 1',
            },
            logger: tests_1.testLogger,
        };
        // Create multi-tenant agent
        const agent = new core_1.Agent({
            config: agentConfig,
            modules: {
                tenants: new tenants_1.TenantsModule(),
                askar: new src_1.AskarModule({
                    ariesAskar: helpers_1.askarModuleConfig.ariesAskar,
                    // Profile per wallet
                    multiWalletDatabaseScheme: src_1.AskarMultiWalletDatabaseScheme.ProfilePerWallet,
                }),
            },
            dependencies: node_1.agentDependencies,
        });
        yield agent.initialize();
        // main wallet should use AskarWallet
        expect(agent.context.wallet).toBeInstanceOf(src_1.AskarWallet);
        const mainWallet = agent.context.wallet;
        // Create tenant
        const tenantRecord = yield agent.modules.tenants.createTenant({
            config: {
                label: 'Tenant 1',
            },
        });
        // Get tenant agent
        const tenantAgent = yield agent.modules.tenants.getTenantAgent({
            tenantId: tenantRecord.id,
        });
        expect(tenantAgent.context.wallet).toBeInstanceOf(src_1.AskarProfileWallet);
        const tenantWallet = tenantAgent.context.wallet;
        expect(tenantWallet.profile).toEqual(`tenant-${tenantRecord.id}`);
        // When using profile, the wallets should share the same store
        expect(tenantWallet.store).toBe(mainWallet.store);
        yield agent.wallet.delete();
        yield agent.shutdown();
    }));
});
