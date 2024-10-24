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
exports.IndyVdrPool = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const indy_vdr_shared_1 = require("@hyperledger/indy-vdr-shared");
const error_1 = require("../error");
class IndyVdrPool {
    constructor(poolConfig) {
        this.poolConfig = poolConfig;
    }
    get indyNamespace() {
        return this.poolConfig.indyNamespace;
    }
    get config() {
        return this.poolConfig;
    }
    connect() {
        if (this._pool) {
            throw new error_1.IndyVdrError('Cannot connect to pool, already connected.');
        }
        this._pool = new indy_vdr_shared_1.PoolCreate({
            parameters: {
                transactions: this.config.genesisTransactions,
            },
        });
    }
    get pool() {
        if (!this._pool)
            this.connect();
        if (!this._pool)
            throw new error_1.IndyVdrError('Pool is not connected.');
        return this._pool;
    }
    close() {
        if (!this._pool) {
            throw new error_1.IndyVdrError("Can't close pool. Pool is not connected");
        }
        // FIXME: this method doesn't work??
        // this.pool.close()
    }
    prepareWriteRequest(agentContext, request, signingKey, endorserDid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.appendTaa(request);
            if (endorserDid) {
                request.setEndorser({ endorser: (0, anoncreds_1.parseIndyDid)(endorserDid).namespaceIdentifier });
            }
            const signature = yield agentContext.wallet.sign({
                data: core_1.TypedArrayEncoder.fromString(request.signatureInput),
                key: signingKey,
            });
            request.setSignature({
                signature,
            });
            return request;
        });
    }
    /**
     * This method submits a request to the ledger.
     * It does only submit the request. It does not modify it in any way.
     * To create the request, use the `prepareWriteRequest` method.
     * @param writeRequest
     */
    submitRequest(writeRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.submitRequest(writeRequest);
        });
    }
    appendTaa(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const authorAgreement = yield this.getTransactionAuthorAgreement();
            const poolTaa = this.config.transactionAuthorAgreement;
            // If ledger does not have TAA, we can just send request
            if (authorAgreement == null) {
                return request;
            }
            // Ledger has taa but user has not specified which one to use
            if (!poolTaa) {
                throw new error_1.IndyVdrError(`Please, specify a transaction author agreement with version and acceptance mechanism. ${JSON.stringify(authorAgreement)}`);
            }
            // Throw an error if the pool doesn't have the specified version and acceptance mechanism
            if (authorAgreement.version !== poolTaa.version ||
                !authorAgreement.acceptanceMechanisms.aml[poolTaa.acceptanceMechanism]) {
                // Throw an error with a helpful message
                const errMessage = `Unable to satisfy matching TAA with mechanism ${JSON.stringify(poolTaa.acceptanceMechanism)} and version ${poolTaa.version} in pool.\n Found ${JSON.stringify(authorAgreement.acceptanceMechanisms.aml)} and version ${authorAgreement.version} in pool.`;
                throw new error_1.IndyVdrError(errMessage);
            }
            const acceptance = indy_vdr_shared_1.indyVdr.prepareTxnAuthorAgreementAcceptance({
                text: authorAgreement.text,
                version: authorAgreement.version,
                taaDigest: authorAgreement.digest,
                time: Math.floor(new Date().getTime() / 1000),
                acceptanceMechanismType: poolTaa.acceptanceMechanism,
            });
            request.setTransactionAuthorAgreementAcceptance({
                acceptance: JSON.parse(acceptance),
            });
        });
    }
    getTransactionAuthorAgreement() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO Replace this condition with memoization
            if (this.authorAgreement !== undefined) {
                return this.authorAgreement;
            }
            const taaRequest = new indy_vdr_shared_1.GetTransactionAuthorAgreementRequest({});
            const taaResponse = yield this.submitRequest(taaRequest);
            const acceptanceMechanismRequest = new indy_vdr_shared_1.GetAcceptanceMechanismsRequest({});
            const acceptanceMechanismResponse = yield this.submitRequest(acceptanceMechanismRequest);
            const taaData = taaResponse.result.data;
            // TAA can be null
            if (taaData == null) {
                this.authorAgreement = null;
                return null;
            }
            // If TAA is not null, we can be sure AcceptanceMechanisms is also not null
            const authorAgreement = taaData;
            const acceptanceMechanisms = acceptanceMechanismResponse.result.data;
            this.authorAgreement = Object.assign(Object.assign({}, authorAgreement), { acceptanceMechanisms });
            return this.authorAgreement;
        });
    }
}
exports.IndyVdrPool = IndyVdrPool;
