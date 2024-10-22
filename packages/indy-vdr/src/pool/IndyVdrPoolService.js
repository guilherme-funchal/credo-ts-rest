"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyVdrPoolService = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const indy_vdr_shared_1 = require("@hyperledger/indy-vdr-shared");
const error_1 = require("../error");
const did_1 = require("../utils/did");
const promises_1 = require("../utils/promises");
const IndyVdrPool_1 = require("./IndyVdrPool");
let IndyVdrPoolService = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IndyVdrPoolService = _classThis = class {
        constructor(logger, indyVdrModuleConfig) {
            this.pools = [];
            this.logger = logger;
            this.indyVdrModuleConfig = indyVdrModuleConfig;
            this.pools = this.indyVdrModuleConfig.networks.map((poolConfig) => new IndyVdrPool_1.IndyVdrPool(poolConfig));
        }
        /**
         * Get the most appropriate pool for the given did.
         * If the did is a qualified indy did, the pool will be determined based on the namespace.
         * If it is a legacy unqualified indy did, the pool will be determined based on the algorithm as described in this document:
         * https://docs.google.com/document/d/109C_eMsuZnTnYe2OAd02jAts1vC4axwEKIq7_4dnNVA/edit
         *
         * This method will optionally return a nym response when the did has been resolved to determine the ledger
         * either now or in the past. The nymResponse can be used to prevent multiple ledger quries fetching the same
         * did
         */
        getPoolForDid(agentContext, did) {
            return __awaiter(this, void 0, void 0, function* () {
                // Check if the did starts with did:indy
                const match = did.match(anoncreds_1.didIndyRegex);
                if (match) {
                    const [, namespace] = match;
                    const pool = this.getPoolForNamespace(namespace);
                    if (pool)
                        return { pool };
                    throw new error_1.IndyVdrError(`Pool for indy namespace '${namespace}' not found`);
                }
                else {
                    return yield this.getPoolForLegacyDid(agentContext, did);
                }
            });
        }
        getPoolForLegacyDid(agentContext, did) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const pools = this.pools;
                if (pools.length === 0) {
                    throw new error_1.IndyVdrNotConfiguredError('No indy ledgers configured. Provide at least one pool configuration in IndyVdrModuleConfigOptions.networks');
                }
                const cache = agentContext.dependencyManager.resolve(core_1.CacheModuleConfig).cache;
                const cacheKey = `IndyVdrPoolService:${did}`;
                const cachedNymResponse = yield cache.get(agentContext, cacheKey);
                const pool = this.pools.find((pool) => pool.indyNamespace === (cachedNymResponse === null || cachedNymResponse === void 0 ? void 0 : cachedNymResponse.indyNamespace));
                // If we have the nym response with associated pool in the cache, we'll use that
                if (cachedNymResponse && pool) {
                    this.logger.trace(`Found ledger id '${pool.indyNamespace}' for did '${did}' in cache`);
                    return { pool, nymResponse: cachedNymResponse.nymResponse };
                }
                const { successful, rejected } = yield this.getSettledDidResponsesFromPools(did, pools);
                if (successful.length === 0) {
                    const allNotFound = rejected.every((e) => e.reason instanceof error_1.IndyVdrNotFoundError);
                    const rejectedOtherThanNotFound = rejected.filter((e) => !(e.reason instanceof error_1.IndyVdrNotFoundError));
                    // All ledgers returned response that the did was not found
                    if (allNotFound) {
                        throw new error_1.IndyVdrNotFoundError(`Did '${did}' not found on any of the ledgers (total ${this.pools.length}).`);
                    }
                    // one or more of the ledgers returned an unknown error
                    throw new error_1.IndyVdrError(`Unknown error retrieving did '${did}' from '${rejectedOtherThanNotFound.length}' of '${pools.length}' ledgers. ${rejectedOtherThanNotFound[0].reason}`, { cause: rejectedOtherThanNotFound[0].reason });
                }
                // If there are self certified DIDs we always prefer it over non self certified DIDs
                // We take the first self certifying DID as we take the order in the
                // IndyVdrModuleConfigOptions.networks config as the order of preference of ledgers
                let value = (_a = successful.find((response) => (0, did_1.isSelfCertifiedDid)(response.value.did.nymResponse.did, response.value.did.nymResponse.verkey))) === null || _a === void 0 ? void 0 : _a.value;
                if (!value) {
                    // Split between production and nonProduction ledgers. If there is at least one
                    // successful response from a production ledger, only keep production ledgers
                    // otherwise we only keep the non production ledgers.
                    const production = successful.filter((s) => s.value.pool.config.isProduction);
                    const nonProduction = successful.filter((s) => !s.value.pool.config.isProduction);
                    const productionOrNonProduction = production.length >= 1 ? production : nonProduction;
                    // We take the first value as we take the order in the IndyVdrModuleConfigOptions.networks
                    // config as the order of preference of ledgers
                    value = productionOrNonProduction[0].value;
                }
                yield cache.set(agentContext, cacheKey, {
                    nymResponse: {
                        did: value.did.nymResponse.did,
                        verkey: value.did.nymResponse.verkey,
                    },
                    indyNamespace: value.did.indyNamespace,
                });
                return { pool: value.pool, nymResponse: value.did.nymResponse };
            });
        }
        getSettledDidResponsesFromPools(did, pools) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.trace(`Retrieving did '${did}' from ${pools.length} ledgers`);
                const didResponses = yield (0, promises_1.allSettled)(pools.map((pool) => this.getDidFromPool(did, pool)));
                const successful = (0, promises_1.onlyFulfilled)(didResponses);
                this.logger.trace(`Retrieved ${successful.length} responses from ledgers for did '${did}'`);
                const rejected = (0, promises_1.onlyRejected)(didResponses);
                return {
                    rejected,
                    successful,
                };
            });
        }
        /**
         * Get the most appropriate pool for the given indyNamespace
         */
        getPoolForNamespace(indyNamespace) {
            if (this.pools.length === 0) {
                throw new error_1.IndyVdrNotConfiguredError('No indy ledgers configured. Provide at least one pool configuration in IndyVdrModuleConfigOptions.networks');
            }
            const pool = this.pools.find((pool) => pool.indyNamespace === indyNamespace);
            if (!pool) {
                throw new error_1.IndyVdrError(`No ledgers found for indy namespace '${indyNamespace}'.`);
            }
            return pool;
        }
        getDidFromPool(did, pool) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    this.logger.trace(`Get public did '${did}' from ledger '${pool.indyNamespace}'`);
                    const request = new indy_vdr_shared_1.GetNymRequest({ dest: did });
                    this.logger.trace(`Submitting get did request for did '${did}' to ledger '${pool.indyNamespace}'`);
                    const response = yield pool.submitRequest(request);
                    if (!response.result.data) {
                        throw new error_1.IndyVdrNotFoundError(`Did ${did} not found on indy pool with namespace ${pool.indyNamespace}`);
                    }
                    const result = JSON.parse(response.result.data);
                    this.logger.trace(`Retrieved did '${did}' from ledger '${pool.indyNamespace}'`, result);
                    return {
                        did: { nymResponse: { did: result.dest, verkey: result.verkey }, indyNamespace: pool.indyNamespace },
                        pool,
                        response,
                    };
                }
                catch (error) {
                    this.logger.trace(`Error retrieving did '${did}' from ledger '${pool.indyNamespace}'`, {
                        error,
                        did,
                    });
                    throw error;
                }
            });
        }
    };
    __setFunctionName(_classThis, "IndyVdrPoolService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        IndyVdrPoolService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return IndyVdrPoolService = _classThis;
})();
exports.IndyVdrPoolService = IndyVdrPoolService;
