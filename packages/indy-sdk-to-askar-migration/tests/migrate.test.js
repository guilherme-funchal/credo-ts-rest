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
const askar_1 = require("@aries-framework/askar");
const core_1 = require("@aries-framework/core");
const indy_sdk_1 = require("@aries-framework/indy-sdk");
const node_1 = require("@aries-framework/node");
const aries_askar_nodejs_1 = require("@hyperledger/aries-askar-nodejs");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const indy_sdk_2 = __importDefault(require("indy-sdk"));
const os_1 = require("os");
const runInVersion_1 = require("../../../tests/runInVersion");
const src_1 = require("../src");
const IndySdkToAskarMigrationError_1 = require("../src/errors/IndySdkToAskarMigrationError");
// FIXME: Re-include in tests when NodeJS wrapper performance is improved
(0, runInVersion_1.describeRunInNodeVersion)([18], 'Indy SDK To Askar Migration', () => {
    beforeAll(() => {
        (0, aries_askar_shared_1.registerAriesAskar)({ askar: aries_askar_nodejs_1.ariesAskar });
    });
    test('indy-sdk sqlite to aries-askar sqlite successful migration', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const indySdkAndAskarConfig = {
            label: `indy | indy-sdk sqlite to aries-askar sqlite successful migration | ${core_1.utils.uuid()}`,
            walletConfig: {
                id: `indy-sdk sqlite to aries-askar sqlite successful migration | ${core_1.utils.uuid()}`,
                key: 'GfwU1DC7gEZNs3w41tjBiZYj7BNToDoFEqKY6wZXqs1A',
                keyDerivationMethod: core_1.KeyDerivationMethod.Raw,
            },
        };
        const indySdkAgent = new core_1.Agent({
            config: indySdkAndAskarConfig,
            modules: { indySdk: new indy_sdk_1.IndySdkModule({ indySdk: indy_sdk_2.default }) },
            dependencies: node_1.agentDependencies,
        });
        const indySdkAgentDbPath = `${(0, os_1.homedir)()}/.indy_client/wallet/${(_a = indySdkAndAskarConfig.walletConfig) === null || _a === void 0 ? void 0 : _a.id}/sqlite.db`;
        const genericRecordContent = { foo: 'bar' };
        yield indySdkAgent.initialize();
        const record = yield indySdkAgent.genericRecords.save({ content: genericRecordContent });
        yield indySdkAgent.shutdown();
        const askarAgent = new core_1.Agent({
            config: indySdkAndAskarConfig,
            modules: { askar: new askar_1.AskarModule({ ariesAskar: aries_askar_nodejs_1.ariesAskar }) },
            dependencies: node_1.agentDependencies,
        });
        const updater = yield src_1.IndySdkToAskarMigrationUpdater.initialize({ dbPath: indySdkAgentDbPath, agent: askarAgent });
        yield updater.update();
        yield askarAgent.initialize();
        yield expect(askarAgent.genericRecords.findById(record.id)).resolves.toMatchObject({
            content: genericRecordContent,
        });
        yield askarAgent.shutdown();
    }));
    /*
     * - Initialize an agent
     * - Save a generic record
     * - try to migrate with invalid state (wrong key)
     *     - Migration will be attempted, fails, and restores
     *  - Check if the record can still be accessed
     */
    test('indy-sdk sqlite to aries-askar sqlite fails and restores', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const indySdkAndAskarConfig = {
            label: `indy | indy-sdk sqlite to aries-askar sqlite fails and restores | ${core_1.utils.uuid()}`,
            walletConfig: {
                id: `indy-sdk sqlite to aries-askar sqlite fails and restores | ${core_1.utils.uuid()}`,
                key: 'GfwU1DC7gEZNs3w41tjBiZYj7BNToDoFEqKY6wZXqs1A',
                keyDerivationMethod: core_1.KeyDerivationMethod.Raw,
            },
        };
        const indySdkAgent = new core_1.Agent({
            config: indySdkAndAskarConfig,
            modules: { indySdk: new indy_sdk_1.IndySdkModule({ indySdk: indy_sdk_2.default }) },
            dependencies: node_1.agentDependencies,
        });
        const indySdkAgentDbPath = `${(0, os_1.homedir)()}/.indy_client/wallet/${(_a = indySdkAndAskarConfig.walletConfig) === null || _a === void 0 ? void 0 : _a.id}/sqlite.db`;
        const genericRecordContent = { foo: 'bar' };
        yield indySdkAgent.initialize();
        const record = yield indySdkAgent.genericRecords.save({ content: genericRecordContent });
        yield indySdkAgent.shutdown();
        const askarAgent = new core_1.Agent({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            config: Object.assign(Object.assign({}, indySdkAndAskarConfig), { walletConfig: Object.assign(Object.assign({}, indySdkAndAskarConfig.walletConfig), { key: 'wrong-key' }) }),
            modules: {
                askar: new askar_1.AskarModule({
                    ariesAskar: aries_askar_nodejs_1.ariesAskar,
                }),
            },
            dependencies: node_1.agentDependencies,
        });
        const updater = yield src_1.IndySdkToAskarMigrationUpdater.initialize({
            dbPath: indySdkAgentDbPath,
            agent: askarAgent,
        });
        yield expect(updater.update()).rejects.toThrowError(IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError);
        yield indySdkAgent.initialize();
        yield expect(indySdkAgent.genericRecords.findById(record.id)).resolves.toMatchObject({
            content: genericRecordContent,
        });
    }));
});
