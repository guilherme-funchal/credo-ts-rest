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
exports.IndySdkPoolService = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const error_1 = require("../error");
const assertIndySdkWallet_1 = require("../utils/assertIndySdkWallet");
const did_1 = require("../utils/did");
const promises_1 = require("../utils/promises");
const IndySdkPool_1 = require("./IndySdkPool");
const error_2 = require("./error");
const serializeRequestForSignature_1 = require("./serializeRequestForSignature");
let IndySdkPoolService = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IndySdkPoolService = _classThis = class {
        constructor(logger, stop$, fileSystem, indySdkModuleConfig) {
            this.pools = [];
            this.logger = logger;
            this.indySdk = indySdkModuleConfig.indySdk;
            this.fileSystem = fileSystem;
            this.stop$ = stop$;
            this.indySdkModuleConfig = indySdkModuleConfig;
            this.pools = this.indySdkModuleConfig.networks.map((network) => new IndySdkPool_1.IndySdkPool(network, this.indySdk, this.logger, this.stop$, this.fileSystem));
        }
        /**
         * Get the most appropriate pool for the given did.
         * If the did is a qualified indy did, the pool will be determined based on the namespace.
         * If it is a legacy unqualified indy did, the pool will be determined based on the algorithm as described in this document:
         * https://docs.google.com/document/d/109C_eMsuZnTnYe2OAd02jAts1vC4axwEKIq7_4dnNVA/edit
         *
         * This method will optionally return a nym response when the did has been resolved to determine the ledger
         * either now or in the past. The nymResponse can be used to prevent multiple ledger queries fetching the same
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
                    throw new error_2.IndySdkPoolError(`Pool for indy namespace '${namespace}' not found`);
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
                    throw new error_2.IndySdkPoolNotConfiguredError('No indy ledgers configured. Provide at least one pool configuration in IndySdkModuleConfigOptions.networks');
                }
                const cache = agentContext.dependencyManager.resolve(core_1.CacheModuleConfig).cache;
                const cacheKey = `IndySdkPoolService:${did}`;
                const cachedNymResponse = yield cache.get(agentContext, cacheKey);
                const pool = this.pools.find((pool) => pool.didIndyNamespace === (cachedNymResponse === null || cachedNymResponse === void 0 ? void 0 : cachedNymResponse.indyNamespace));
                // If we have the nym response with associated pool in the cache, we'll use that
                if (cachedNymResponse && pool) {
                    this.logger.trace(`Found ledger '${pool.didIndyNamespace}' for did '${did}' in cache`);
                    return { nymResponse: cachedNymResponse.nymResponse, pool };
                }
                const { successful, rejected } = yield this.getSettledDidResponsesFromPools(did, pools);
                if (successful.length === 0) {
                    const allNotFound = rejected.every((e) => e.reason instanceof error_2.IndySdkPoolNotFoundError);
                    const rejectedOtherThanNotFound = rejected.filter((e) => !(e.reason instanceof error_2.IndySdkPoolNotFoundError));
                    // All ledgers returned response that the did was not found
                    if (allNotFound) {
                        throw new error_2.IndySdkPoolNotFoundError(`Did '${did}' not found on any of the ledgers (total ${this.pools.length}).`);
                    }
                    // one or more of the ledgers returned an unknown error
                    throw new error_2.IndySdkPoolError(`Unknown error retrieving did '${did}' from '${rejectedOtherThanNotFound.length}' of '${pools.length}' ledgers. ${rejectedOtherThanNotFound[0].reason}`, { cause: rejectedOtherThanNotFound[0].reason });
                }
                // If there are self certified DIDs we always prefer it over non self certified DIDs
                // We take the first self certifying DID as we take the order in the
                // IndySdkModuleConfigOptions.networks config as the order of preference of ledgers
                let value = (_a = successful.find((response) => (0, did_1.isLegacySelfCertifiedDid)(response.value.did.did, response.value.did.verkey))) === null || _a === void 0 ? void 0 : _a.value;
                if (!value) {
                    // Split between production and nonProduction ledgers. If there is at least one
                    // successful response from a production ledger, only keep production ledgers
                    // otherwise we only keep the non production ledgers.
                    const production = successful.filter((s) => s.value.pool.config.isProduction);
                    const nonProduction = successful.filter((s) => !s.value.pool.config.isProduction);
                    const productionOrNonProduction = production.length >= 1 ? production : nonProduction;
                    // We take the first value as we take the order in the IndySdkModuleConfigOptions.networks
                    // config as the order of preference of ledgers
                    value = productionOrNonProduction[0].value;
                }
                yield cache.set(agentContext, cacheKey, {
                    nymResponse: value.did,
                    indyNamespace: value.pool.didIndyNamespace,
                });
                return { pool: value.pool, nymResponse: value.did };
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
                throw new error_2.IndySdkPoolNotConfiguredError('No indy ledgers configured. Provide at least one pool configuration in IndySdkModuleConfigOptions.networks');
            }
            if (!indyNamespace) {
                this.logger.warn('Not passing the indyNamespace is deprecated and will be removed in the future version.');
                return this.pools[0];
            }
            const pool = this.pools.find((pool) => pool.didIndyNamespace === indyNamespace);
            if (!pool) {
                throw new error_2.IndySdkPoolNotFoundError(`No ledgers found for indy namespace '${indyNamespace}'.`);
            }
            return pool;
        }
        submitWriteRequest(agentContext, pool, request, signingKey) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const requestWithTaa = yield this.appendTaa(pool, request);
                    const signedRequestWithTaa = yield this.signRequest(agentContext, signingKey, requestWithTaa);
                    const response = yield pool.submitWriteRequest(signedRequestWithTaa);
                    return response;
                }
                catch (error) {
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        submitReadRequest(pool, request) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield pool.submitReadRequest(request);
                    return response;
                }
                catch (error) {
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        signRequest(agentContext, key, request) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                try {
                    const signedPayload = yield this.indySdk.cryptoSign(agentContext.wallet.handle, key.publicKeyBase58, core_1.TypedArrayEncoder.fromString((0, serializeRequestForSignature_1.serializeRequestForSignature)(request)));
                    const signedRequest = Object.assign(Object.assign({}, request), { signature: core_1.TypedArrayEncoder.toBase58(signedPayload) });
                    return signedRequest;
                }
                catch (error) {
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        appendTaa(pool, request) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const authorAgreement = yield this.getTransactionAuthorAgreement(pool);
                    const taa = pool.config.transactionAuthorAgreement;
                    // If ledger does not have TAA, we can just send request
                    if (authorAgreement == null) {
                        return request;
                    }
                    // Ledger has taa but user has not specified which one to use
                    if (!taa) {
                        throw new error_2.IndySdkPoolError(`Please, specify a transaction author agreement with version and acceptance mechanism. ${JSON.stringify(authorAgreement)}`);
                    }
                    // Throw an error if the pool doesn't have the specified version and acceptance mechanism
                    if (authorAgreement.version !== taa.version ||
                        !(taa.acceptanceMechanism in authorAgreement.acceptanceMechanisms.aml)) {
                        // Throw an error with a helpful message
                        const errMessage = `Unable to satisfy matching TAA with mechanism ${JSON.stringify(taa.acceptanceMechanism)} and version ${JSON.stringify(taa.version)} in pool.\n Found ${JSON.stringify(Object.keys(authorAgreement.acceptanceMechanisms.aml))} and version ${authorAgreement.version} in pool.`;
                        throw new error_2.IndySdkPoolError(errMessage);
                    }
                    const requestWithTaa = yield this.indySdk.appendTxnAuthorAgreementAcceptanceToRequest(request, authorAgreement.text, taa.version, authorAgreement.digest, taa.acceptanceMechanism, 
                    // Current time since epoch
                    // We can't use ratification_ts, as it must be greater than 1499906902
                    Math.floor(new Date().getTime() / 1000));
                    return requestWithTaa;
                }
                catch (error) {
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        getTransactionAuthorAgreement(pool) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    // TODO Replace this condition with memoization
                    if (pool.authorAgreement !== undefined) {
                        return pool.authorAgreement;
                    }
                    const taaRequest = yield this.indySdk.buildGetTxnAuthorAgreementRequest(null);
                    const taaResponse = yield this.submitReadRequest(pool, taaRequest);
                    const acceptanceMechanismRequest = yield this.indySdk.buildGetAcceptanceMechanismsRequest(null);
                    const acceptanceMechanismResponse = yield this.submitReadRequest(pool, acceptanceMechanismRequest);
                    // TAA can be null
                    if (taaResponse.result.data == null) {
                        pool.authorAgreement = null;
                        return null;
                    }
                    // If TAA is not null, we can be sure AcceptanceMechanisms is also not null
                    const authorAgreement = taaResponse.result.data;
                    const acceptanceMechanisms = acceptanceMechanismResponse.result.data;
                    pool.authorAgreement = Object.assign(Object.assign({}, authorAgreement), { acceptanceMechanisms });
                    return pool.authorAgreement;
                }
                catch (error) {
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        getDidFromPool(did, pool) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    this.logger.trace(`Get public did '${did}' from ledger '${pool.didIndyNamespace}'`);
                    const request = yield this.indySdk.buildGetNymRequest(null, did);
                    this.logger.trace(`Submitting get did request for did '${did}' to ledger '${pool.didIndyNamespace}'`);
                    const response = yield pool.submitReadRequest(request);
                    const result = yield this.indySdk.parseGetNymResponse(response);
                    this.logger.trace(`Retrieved did '${did}' from ledger '${pool.didIndyNamespace}'`, result);
                    return {
                        did: result,
                        pool,
                        response,
                    };
                }
                catch (error) {
                    this.logger.trace(`Error retrieving did '${did}' from ledger '${pool.didIndyNamespace}'`, {
                        error,
                        did,
                    });
                    if ((0, error_1.isIndyError)(error, 'LedgerNotFound')) {
                        throw new error_2.IndySdkPoolNotFoundError(`Did '${did}' not found on ledger ${pool.didIndyNamespace}`);
                    }
                    else {
                        throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                    }
                }
            });
        }
    };
    __setFunctionName(_classThis, "IndySdkPoolService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        IndySdkPoolService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return IndySdkPoolService = _classThis;
})();
exports.IndySdkPoolService = IndySdkPoolService;
