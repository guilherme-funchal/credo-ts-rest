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
const indy_sdk_1 = __importDefault(require("indy-sdk"));
const rxjs_1 = require("rxjs");
const helpers_1 = require("../../../../core/tests/helpers");
const NodeFileSystem_1 = require("../../../../node/src/NodeFileSystem");
const IndySdkModuleConfig_1 = require("../../IndySdkModuleConfig");
const IndySdkWallet_1 = require("../../wallet/IndySdkWallet");
const IndySdkPoolService_1 = require("../IndySdkPoolService");
const error_1 = require("../error");
const didResponses_1 = require("./didResponses");
const pools = [
    {
        indyNamespace: 'sovrin',
        isProduction: true,
        genesisTransactions: 'xxx',
        transactionAuthorAgreement: { version: '1', acceptanceMechanism: 'accept' },
    },
    {
        indyNamespace: 'sovrin:builder',
        isProduction: false,
        genesisTransactions: 'xxx',
        transactionAuthorAgreement: { version: '1', acceptanceMechanism: 'accept' },
    },
    {
        indyNamespace: 'sovrin:staging',
        isProduction: false,
        genesisTransactions: 'xxx',
        transactionAuthorAgreement: { version: '1', acceptanceMechanism: 'accept' },
    },
    {
        indyNamespace: 'indicio',
        isProduction: true,
        genesisTransactions: 'xxx',
        transactionAuthorAgreement: { version: '1', acceptanceMechanism: 'accept' },
    },
    {
        indyNamespace: 'bcovrin:test',
        isProduction: false,
        genesisTransactions: 'xxx',
        transactionAuthorAgreement: { version: '1', acceptanceMechanism: 'accept' },
    },
];
const config = (0, helpers_1.getAgentConfig)('IndySdkPoolServiceTest');
const cache = new core_1.InMemoryLruCache({ limit: 1 });
const indySdkModule = new IndySdkModuleConfig_1.IndySdkModuleConfig({ indySdk: indy_sdk_1.default, networks: pools });
const wallet = new IndySdkWallet_1.IndySdkWallet(indy_sdk_1.default, config.logger, new core_1.SigningProviderRegistry([]));
const agentContext = (0, helpers_1.getAgentContext)({
    wallet,
    registerInstances: [[core_1.CacheModuleConfig, new core_1.CacheModuleConfig({ cache })]],
});
const poolService = new IndySdkPoolService_1.IndySdkPoolService(config.logger, new rxjs_1.Subject(), new NodeFileSystem_1.NodeFileSystem(), indySdkModule);
describe('IndySdkPoolService', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        yield wallet.createAndOpen(config.walletConfig);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield wallet.delete();
    }));
    afterEach(() => {
        cache.clear();
    });
    describe('getPoolForDid', () => {
        it('should throw a IndySdkPoolNotConfiguredError error if no pools are configured on the pool service', () => __awaiter(void 0, void 0, void 0, function* () {
            const oldPools = poolService.pools;
            poolService.pools = [];
            expect(poolService.getPoolForDid(agentContext, 'some-did')).rejects.toThrow(error_1.IndySdkPoolNotConfiguredError);
            poolService.pools = oldPools;
        }));
        it('should throw a IndySdkPoolError if all ledger requests throw an error other than NotFoundError', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'Y5bj4SjCiTM9PgeheKAiXx';
            poolService.pools.forEach((pool) => {
                const spy = jest.spyOn(pool, 'submitReadRequest');
                spy.mockImplementationOnce(() => Promise.reject(new core_1.AriesFrameworkError('Something went wrong')));
            });
            expect(poolService.getPoolForDid(agentContext, did)).rejects.toThrowError(error_1.IndySdkPoolError);
        }));
        it('should throw a IndySdkPoolNotFoundError if all pools did not find the did on the ledger', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'Y5bj4SjCiTM9PgeheKAiXx';
            // Not found on any of the ledgers
            const responses = (0, didResponses_1.getDidResponsesForDid)(did, pools, {});
            poolService.pools.forEach((pool, index) => {
                const spy = jest.spyOn(pool, 'submitReadRequest');
                spy.mockImplementationOnce(responses[index]);
            });
            expect(poolService.getPoolForDid(agentContext, did)).rejects.toThrowError(error_1.IndySdkPoolNotFoundError);
        }));
        it('should return the pool based on namespace if did is a valid did:indy did', () => __awaiter(void 0, void 0, void 0, function* () {
            const { pool } = yield poolService.getPoolForDid(agentContext, 'did:indy:sovrin:Y5bj4SjCiTM9PgeheKAiXx');
            expect(pool.didIndyNamespace).toBe('sovrin');
        }));
        it('should return the pool if the did was only found on one ledger', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'TL1EaPFCZ8Si5aUrqScBDt';
            // Only found on one ledger
            const responses = (0, didResponses_1.getDidResponsesForDid)(did, pools, {
                sovrin: '~43X4NhAFqREffK7eWdKgFH',
            });
            poolService.pools.forEach((pool, index) => {
                const spy = jest.spyOn(pool, 'submitReadRequest');
                spy.mockImplementationOnce(responses[index]);
            });
            const { pool } = yield poolService.getPoolForDid(agentContext, did);
            expect(pool.config.indyNamespace).toBe('sovrin');
        }));
        it('should return the first pool with a self certifying DID if at least one did is self certifying ', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'did:sov:q7ATwTYbQDgiigVijUAej';
            // Found on one production and one non production ledger
            const responses = (0, didResponses_1.getDidResponsesForDid)(did, pools, {
                indicio: '~43X4NhAFqREffK7eWdKgFH',
                'bcovrin:test': '43X4NhAFqREffK7eWdKgFH43X4NhAFqREffK7eWdKgFH',
                'sovrin:builder': '~43X4NhAFqREffK7eWdKgFH',
            });
            poolService.pools.forEach((pool, index) => {
                const spy = jest.spyOn(pool, 'submitReadRequest');
                spy.mockImplementationOnce(responses[index]);
            });
            const { pool } = yield poolService.getPoolForDid(agentContext, did);
            expect(pool.config.indyNamespace).toBe('sovrin:builder');
        }));
        it('should return the production pool if the did was found on one production and one non production ledger and both DIDs are not self certifying', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'V6ty6ttM3EjuCtosH6sGtW';
            // Found on one production and one non production ledger
            const responses = (0, didResponses_1.getDidResponsesForDid)(did, pools, {
                indicio: '43X4NhAFqREffK7eWdKgFH43X4NhAFqREffK7eWdKgFH',
                'sovrin:builder': '43X4NhAFqREffK7eWdKgFH43X4NhAFqREffK7eWdKgFH',
            });
            poolService.pools.forEach((pool, index) => {
                const spy = jest.spyOn(pool, 'submitReadRequest');
                spy.mockImplementationOnce(responses[index]);
            });
            const { pool } = yield poolService.getPoolForDid(agentContext, did);
            expect(pool.config.indyNamespace).toBe('indicio');
        }));
        it('should return the pool with the self certified did if the did was found on two production ledgers where one did is self certified', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'VsKV7grR1BUE29mG2Fm2kX';
            // Found on two production ledgers. Sovrin is self certified
            const responses = (0, didResponses_1.getDidResponsesForDid)(did, pools, {
                sovrin: '~43X4NhAFqREffK7eWdKgFH',
                indicio: 'kqa2HyagzfMAq42H5f9u3UMwnSBPQx2QfrSyXbUPxMn',
            });
            poolService.pools.forEach((pool, index) => {
                const spy = jest.spyOn(pool, 'submitReadRequest');
                spy.mockImplementationOnce(responses[index]);
            });
            const { pool } = yield poolService.getPoolForDid(agentContext, did);
            expect(pool.config.indyNamespace).toBe('sovrin');
        }));
        it('should return the first pool with a self certified did if the did was found on three non production ledgers where two DIDs are self certified', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'HEi9QViXNThGQaDsQ3ptcw';
            // Found on two non production ledgers. Sovrin is self certified
            const responses = (0, didResponses_1.getDidResponsesForDid)(did, pools, {
                'sovrin:builder': '~M9kv2Ez61cur7X39DXWh8W',
                'sovrin:staging': '~M9kv2Ez61cur7X39DXWh8W',
                'bcovrin:test': '3SeuRm3uYuQDYmHeuMLu1xNHozNTtzS3kbZRFMMCWrX4',
            });
            poolService.pools.forEach((pool, index) => {
                const spy = jest.spyOn(pool, 'submitReadRequest');
                spy.mockImplementationOnce(responses[index]);
            });
            const { pool } = yield poolService.getPoolForDid(agentContext, did);
            expect(pool.config.indyNamespace).toBe('sovrin:builder');
        }));
        it('should return the pool from the cache if the did was found in the cache', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'HEi9QViXNThGQaDsQ3ptcw';
            const expectedPool = pools[3];
            const didResponse = {
                nymResponse: {
                    did,
                    role: 'ENDORSER',
                    verkey: '~M9kv2Ez61cur7X39DXWh8W',
                },
                indyNamespace: expectedPool.indyNamespace,
            };
            yield cache.set(agentContext, `IndySdkPoolService:${did}`, didResponse);
            const { pool } = yield poolService.getPoolForDid(agentContext, did);
            expect(pool.config.indyNamespace).toBe(pool.didIndyNamespace);
        }));
        it('should set the indyNamespace in the cache if the did was not found in the cache, but resolved later on', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'HEi9QViXNThGQaDsQ3ptcw';
            // Found on one ledger
            const responses = (0, didResponses_1.getDidResponsesForDid)(did, pools, {
                'sovrin:builder': '~M9kv2Ez61cur7X39DXWh8W',
            });
            poolService.pools.forEach((pool, index) => {
                const spy = jest.spyOn(pool, 'submitReadRequest');
                spy.mockImplementationOnce(responses[index]);
            });
            const { pool } = yield poolService.getPoolForDid(agentContext, did);
            expect(pool.config.indyNamespace).toBe('sovrin:builder');
            expect(pool.config.indyNamespace).toBe('sovrin:builder');
            expect(yield cache.get(agentContext, `IndySdkPoolService:${did}`)).toEqual({
                nymResponse: {
                    did,
                    verkey: '~M9kv2Ez61cur7X39DXWh8W',
                    role: '0',
                },
                indyNamespace: 'sovrin:builder',
            });
        }));
    });
    describe('getPoolForNamespace', () => {
        it('should throw a IndySdkPoolNotConfiguredError error if no pools are configured on the pool service', () => __awaiter(void 0, void 0, void 0, function* () {
            const oldPools = poolService.pools;
            poolService.pools = [];
            expect(() => poolService.getPoolForNamespace()).toThrow(error_1.IndySdkPoolNotConfiguredError);
            poolService.pools = oldPools;
        }));
        it('should return the first pool if indyNamespace is not provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const expectedPool = pools[0];
            expect(poolService.getPoolForNamespace().didIndyNamespace).toEqual(expectedPool.indyNamespace);
        }));
        it('should throw a IndySdkPoolNotFoundError error if any of the pools did not have the provided indyNamespace', () => __awaiter(void 0, void 0, void 0, function* () {
            const indyNameSpace = 'test';
            const responses = pools.map((pool) => pool.indyNamespace);
            poolService.pools.forEach((pool, index) => {
                const spy = jest.spyOn(pool, 'didIndyNamespace', 'get');
                spy.mockReturnValueOnce(responses[index]);
            });
            expect(() => poolService.getPoolForNamespace(indyNameSpace)).toThrow(error_1.IndySdkPoolNotFoundError);
        }));
        it('should return the first pool that indyNamespace matches', () => __awaiter(void 0, void 0, void 0, function* () {
            const expectedPool = pools[3];
            const indyNameSpace = 'indicio';
            const responses = pools.map((pool) => pool.indyNamespace);
            poolService.pools.forEach((pool, index) => {
                const spy = jest.spyOn(pool, 'didIndyNamespace', 'get');
                spy.mockReturnValueOnce(responses[index]);
            });
            const pool = poolService.getPoolForNamespace(indyNameSpace);
            expect(pool.didIndyNamespace).toEqual(expectedPool.indyNamespace);
        }));
    });
    describe('submitWriteRequest', () => {
        it('should throw an error if the config version does not match', () => __awaiter(void 0, void 0, void 0, function* () {
            const pool = poolService.getPoolForNamespace();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(poolService, 'getTransactionAuthorAgreement').mockResolvedValue({
                digest: 'abcde',
                version: '2.0',
                text: 'jhsdhbv',
                ratification_ts: 12345678,
                acceptanceMechanisms: {
                    aml: { accept: 'accept' },
                    amlContext: 'accept',
                    version: '3',
                },
            });
            yield expect(poolService.submitWriteRequest(agentContext, pool, {
                reqId: 1668174449192969000,
                identifier: 'BBPoJqRKatdcfLEAFL7exC',
                operation: {
                    type: '1',
                    dest: 'N8NQHLtCKfPmWMgCSdfa7h',
                    verkey: 'GAb4NUvpBcHVCvtP45vTVa5Bp74vFg3iXzdp1Gbd68Wf',
                    alias: 'Heinz57',
                },
                protocolVersion: 2,
            }, core_1.Key.fromPublicKeyBase58('GAb4NUvpBcHVCvtP45vTVa5Bp74vFg3iXzdp1Gbd68Wf', core_1.KeyType.Ed25519))).rejects.toThrowError('Unable to satisfy matching TAA with mechanism "accept" and version "1" in pool.\n Found ["accept"] and version 2.0 in pool.');
        }));
        it('should throw an error if the config acceptance mechanism does not match', () => __awaiter(void 0, void 0, void 0, function* () {
            const pool = poolService.getPoolForNamespace();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(poolService, 'getTransactionAuthorAgreement').mockResolvedValue({
                digest: 'abcde',
                version: '1.0',
                text: 'jhsdhbv',
                ratification_ts: 12345678,
                acceptanceMechanisms: {
                    aml: { decline: 'accept' },
                    amlContext: 'accept',
                    version: '1',
                },
            });
            yield expect(poolService.submitWriteRequest(agentContext, pool, {
                reqId: 1668174449192969000,
                identifier: 'BBPoJqRKatdcfLEAFL7exC',
                operation: {
                    type: '1',
                    dest: 'N8NQHLtCKfPmWMgCSdfa7h',
                    verkey: 'GAb4NUvpBcHVCvtP45vTVa5Bp74vFg3iXzdp1Gbd68Wf',
                    alias: 'Heinz57',
                },
                protocolVersion: 2,
            }, core_1.Key.fromPublicKeyBase58('GAb4NUvpBcHVCvtP45vTVa5Bp74vFg3iXzdp1Gbd68Wf', core_1.KeyType.Ed25519))).rejects.toThrowError('Unable to satisfy matching TAA with mechanism "accept" and version "1" in pool.\n Found ["decline"] and version 1.0 in pool.');
        }));
        it('should throw an error if no config is present', () => __awaiter(void 0, void 0, void 0, function* () {
            const pool = poolService.getPoolForNamespace();
            pool.authorAgreement = undefined;
            pool.config.transactionAuthorAgreement = undefined;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(poolService, 'getTransactionAuthorAgreement').mockResolvedValue({
                digest: 'abcde',
                version: '1.0',
                text: 'jhsdhbv',
                ratification_ts: 12345678,
                acceptanceMechanisms: {
                    aml: { accept: 'accept' },
                    amlContext: 'accept',
                    version: '3',
                },
            });
            yield expect(poolService.submitWriteRequest(agentContext, pool, {
                reqId: 1668174449192969000,
                identifier: 'BBPoJqRKatdcfLEAFL7exC',
                operation: {
                    type: '1',
                    dest: 'N8NQHLtCKfPmWMgCSdfa7h',
                    verkey: 'GAb4NUvpBcHVCvtP45vTVa5Bp74vFg3iXzdp1Gbd68Wf',
                    alias: 'Heinz57',
                },
                protocolVersion: 2,
            }, core_1.Key.fromPublicKeyBase58('GAb4NUvpBcHVCvtP45vTVa5Bp74vFg3iXzdp1Gbd68Wf', core_1.KeyType.Ed25519))).rejects.toThrowError(/Please, specify a transaction author agreement with version and acceptance mechanism/);
        }));
    });
});
