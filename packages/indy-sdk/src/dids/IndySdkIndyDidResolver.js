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
exports.IndySdkIndyDidResolver = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const error_1 = require("../error");
const IndySdkPoolService_1 = require("../ledger/IndySdkPoolService");
const types_1 = require("../types");
const did_1 = require("../utils/did");
const didIndyUtil_1 = require("./didIndyUtil");
const didSovUtil_1 = require("./didSovUtil");
class IndySdkIndyDidResolver {
    constructor() {
        this.supportedMethods = ['indy'];
    }
    resolve(agentContext, did) {
        return __awaiter(this, void 0, void 0, function* () {
            const didDocumentMetadata = {};
            try {
                const { namespaceIdentifier, namespace } = (0, anoncreds_1.parseIndyDid)(did);
                const poolService = agentContext.dependencyManager.resolve(IndySdkPoolService_1.IndySdkPoolService);
                const pool = poolService.getPoolForNamespace(namespace);
                const nym = yield this.getPublicDid(agentContext, pool, namespaceIdentifier);
                const endpoints = yield this.getEndpointsForDid(agentContext, pool, namespaceIdentifier);
                // For modern did:indy DIDs, we assume that GET_NYM is always a full verkey in base58.
                // For backwards compatibility, we accept a shortened verkey and convert it using previous convention
                const verkey = (0, did_1.getFullVerkey)(did, nym.verkey);
                const builder = (0, didIndyUtil_1.indyDidDocumentFromDid)(did, verkey);
                // NOTE: we don't support the `diddocContent` field in the GET_NYM response using the indy-sdk. So if the did would have the `diddocContent` field
                // we will ignore it without knowing if it is present. We may be able to extract the diddocContent from the GET_NYM response in the future, but need
                // some dids registered with diddocContent to test with.
                if (endpoints) {
                    const keyAgreementId = `${did}#key-agreement-1`;
                    builder
                        .addContext('https://w3id.org/security/suites/x25519-2019/v1')
                        .addVerificationMethod({
                        controller: did,
                        id: keyAgreementId,
                        publicKeyBase58: (0, didIndyUtil_1.createKeyAgreementKey)(verkey),
                        type: 'X25519KeyAgreementKey2019',
                    })
                        .addKeyAgreement(keyAgreementId);
                    (0, didSovUtil_1.addServicesFromEndpointsAttrib)(builder, did, endpoints, keyAgreementId);
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
    getPublicDid(agentContext, pool, unqualifiedDid) {
        return __awaiter(this, void 0, void 0, function* () {
            const indySdkPoolService = agentContext.dependencyManager.resolve(IndySdkPoolService_1.IndySdkPoolService);
            const indySdk = agentContext.dependencyManager.resolve(types_1.IndySdkSymbol);
            const request = yield indySdk.buildGetNymRequest(null, unqualifiedDid);
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
                if (!response.result.data) {
                    return null;
                }
                const endpoints = (_a = JSON.parse(response.result.data)) === null || _a === void 0 ? void 0 : _a.endpoint;
                agentContext.config.logger.debug(`Got endpoints '${JSON.stringify(endpoints)}' for did '${unqualifiedDid}' from ledger '${pool.didIndyNamespace}'`, {
                    response,
                    endpoints,
                });
                return endpoints;
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
exports.IndySdkIndyDidResolver = IndySdkIndyDidResolver;
