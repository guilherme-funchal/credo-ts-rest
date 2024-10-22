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
exports.IndySdkSovDidResolver = void 0;
const error_1 = require("../error");
const IndySdkPoolService_1 = require("../ledger/IndySdkPoolService");
const types_1 = require("../types");
const didSovUtil_1 = require("./didSovUtil");
class IndySdkSovDidResolver {
    constructor() {
        this.supportedMethods = ['sov'];
    }
    resolve(agentContext, did, parsed) {
        return __awaiter(this, void 0, void 0, function* () {
            const didDocumentMetadata = {};
            try {
                const poolService = agentContext.dependencyManager.resolve(IndySdkPoolService_1.IndySdkPoolService);
                const { pool, nymResponse } = yield poolService.getPoolForDid(agentContext, parsed.id);
                const nym = nymResponse !== null && nymResponse !== void 0 ? nymResponse : (yield this.getPublicDid(agentContext, pool, parsed.id));
                const endpoints = yield this.getEndpointsForDid(agentContext, pool, parsed.id);
                const keyAgreementId = `${parsed.did}#key-agreement-1`;
                const builder = (0, didSovUtil_1.sovDidDocumentFromDid)(parsed.did, nym.verkey);
                if (endpoints) {
                    (0, didSovUtil_1.addServicesFromEndpointsAttrib)(builder, parsed.did, endpoints, keyAgreementId);
                }
                return {
                    didDocument: builder.build(),
                    didDocumentMetadata,
                    didResolutionMetadata: { contentType: 'application/did+ld+json' },
                };
            }
            catch (error) {
                return {
                    didDocument: null,
                    didDocumentMetadata,
                    didResolutionMetadata: {
                        error: 'notFound',
                        message: `resolver_error: Unable to resolve did '${did}': ${error}`,
                    },
                };
            }
        });
    }
    getPublicDid(agentContext, pool, did) {
        return __awaiter(this, void 0, void 0, function* () {
            const indySdkPoolService = agentContext.dependencyManager.resolve(IndySdkPoolService_1.IndySdkPoolService);
            const indySdk = agentContext.dependencyManager.resolve(types_1.IndySdkSymbol);
            const request = yield indySdk.buildGetNymRequest(null, did);
            const response = yield indySdkPoolService.submitReadRequest(pool, request);
            return yield indySdk.parseGetNymResponse(response);
        });
    }
    getEndpointsForDid(agentContext, pool, unqualifiedDid) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const indySdk = agentContext.dependencyManager.resolve(types_1.IndySdkSymbol);
            const indySdkPoolService = agentContext.dependencyManager.resolve(IndySdkPoolService_1.IndySdkPoolService);
            try {
                agentContext.config.logger.debug(`Get endpoints for did '${unqualifiedDid}' from ledger '${pool.didIndyNamespace}'`);
                const request = yield indySdk.buildGetAttribRequest(null, unqualifiedDid, 'endpoint', null, null);
                agentContext.config.logger.debug(`Submitting get endpoint ATTRIB request for did '${unqualifiedDid}' to ledger '${pool.didIndyNamespace}'`);
                const response = yield indySdkPoolService.submitReadRequest(pool, request);
                if (!response.result.data)
                    return null;
                const endpoints = (_a = JSON.parse(response.result.data)) === null || _a === void 0 ? void 0 : _a.endpoint;
                agentContext.config.logger.debug(`Got endpoints '${JSON.stringify(endpoints)}' for did '${unqualifiedDid}' from ledger '${pool.didIndyNamespace}'`, {
                    response,
                    endpoints,
                });
                return endpoints !== null && endpoints !== void 0 ? endpoints : null;
            }
            catch (error) {
                agentContext.config.logger.error(`Error retrieving endpoints for did '${unqualifiedDid}' from ledger '${pool.didIndyNamespace}'`, {
                    error,
                });
                throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
            }
        });
    }
}
exports.IndySdkSovDidResolver = IndySdkSovDidResolver;
