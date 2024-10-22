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
exports.IndySdkIndyDidRegistrar = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const error_1 = require("../error");
const indyError_1 = require("../error/indyError");
const ledger_1 = require("../ledger");
const types_1 = require("../types");
const assertIndySdkWallet_1 = require("../utils/assertIndySdkWallet");
const did_1 = require("../utils/did");
const didIndyUtil_1 = require("./didIndyUtil");
const didSovUtil_1 = require("./didSovUtil");
class IndySdkIndyDidRegistrar {
    constructor() {
        this.supportedMethods = ['indy'];
    }
    create(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const indySdkPoolService = agentContext.dependencyManager.resolve(ledger_1.IndySdkPoolService);
            const didRepository = agentContext.dependencyManager.resolve(core_1.DidRepository);
            const { alias, role, submitterDid, endpoints } = options.options;
            let did = options.did;
            let namespaceIdentifier;
            let verificationKey;
            const privateKey = (_a = options.secret) === null || _a === void 0 ? void 0 : _a.privateKey;
            if (did && privateKey) {
                return {
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'failed',
                        reason: `Only one of 'privateKey' or 'did' must be provided`,
                    },
                };
            }
            try {
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                // Parse submitterDid and extract namespace based on the submitter did
                const { namespace: submitterNamespace, namespaceIdentifier: submitterNamespaceIdentifier } = (0, anoncreds_1.parseIndyDid)(submitterDid);
                const submitterSigningKey = yield (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, submitterDid);
                // Only supports version 1 did identifier (which is same as did:sov)
                if (did) {
                    if (!options.options.verkey) {
                        return {
                            didDocumentMetadata: {},
                            didRegistrationMetadata: {},
                            didState: {
                                state: 'failed',
                                reason: 'If a did is defined, a matching verkey must be provided',
                            },
                        };
                    }
                    const { namespace, namespaceIdentifier: _namespaceIdentifier } = (0, anoncreds_1.parseIndyDid)(did);
                    namespaceIdentifier = _namespaceIdentifier;
                    verificationKey = core_1.Key.fromPublicKeyBase58(options.options.verkey, core_1.KeyType.Ed25519);
                    if (!(0, did_1.isLegacySelfCertifiedDid)(namespaceIdentifier, options.options.verkey)) {
                        return {
                            didDocumentMetadata: {},
                            didRegistrationMetadata: {},
                            didState: {
                                state: 'failed',
                                reason: `Did must be first 16 bytes of the the verkey base58 encoded.`,
                            },
                        };
                    }
                    if (submitterNamespace !== namespace) {
                        return {
                            didDocumentMetadata: {},
                            didRegistrationMetadata: {},
                            didState: {
                                state: 'failed',
                                reason: `The submitter did uses namespace ${submitterNamespace} and the did to register uses namespace ${namespace}. Namespaces must match.`,
                            },
                        };
                    }
                }
                else {
                    // Create a new key and calculate did according to the rules for indy did method
                    verificationKey = yield agentContext.wallet.createKey({ privateKey, keyType: core_1.KeyType.Ed25519 });
                    namespaceIdentifier = (0, did_1.legacyIndyDidFromPublicKeyBase58)(verificationKey.publicKeyBase58);
                    did = `did:indy:${submitterNamespace}:${namespaceIdentifier}`;
                }
                const pool = indySdkPoolService.getPoolForNamespace(submitterNamespace);
                yield this.registerPublicDid(agentContext, pool, submitterNamespaceIdentifier, submitterSigningKey, namespaceIdentifier, verificationKey, alias, role);
                // Create did document
                const didDocumentBuilder = (0, didIndyUtil_1.indyDidDocumentFromDid)(did, verificationKey.publicKeyBase58);
                // Add services if endpoints object was passed.
                if (endpoints) {
                    const keyAgreementId = `${did}#key-agreement-1`;
                    yield this.setEndpointsForDid(agentContext, pool, namespaceIdentifier, verificationKey, endpoints);
                    didDocumentBuilder
                        .addContext('https://w3id.org/security/suites/x25519-2019/v1')
                        .addVerificationMethod({
                        controller: did,
                        id: keyAgreementId,
                        publicKeyBase58: (0, didIndyUtil_1.createKeyAgreementKey)(verificationKey.publicKeyBase58),
                        type: 'X25519KeyAgreementKey2019',
                    })
                        .addKeyAgreement(keyAgreementId);
                    // Process endpoint attrib following the same rules as for did:sov
                    (0, didSovUtil_1.addServicesFromEndpointsAttrib)(didDocumentBuilder, did, endpoints, keyAgreementId);
                }
                // Build did document.
                const didDocument = didDocumentBuilder.build();
                // Save the did so we know we created it and can issue with it
                const didRecord = new core_1.DidRecord({
                    did,
                    role: core_1.DidDocumentRole.Created,
                    tags: {
                        recipientKeyFingerprints: didDocument.recipientKeys.map((key) => key.fingerprint),
                    },
                });
                yield didRepository.save(agentContext, didRecord);
                return {
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'finished',
                        did,
                        didDocument,
                        secret: {
                            // FIXME: the uni-registrar creates the seed in the registrar method
                            // if it doesn't exist so the seed can always be returned. Currently
                            // we can only return it if the seed was passed in by the user. Once
                            // we have a secure method for generating seeds we should use the same
                            // approach
                            privateKey: (_b = options.secret) === null || _b === void 0 ? void 0 : _b.privateKey,
                        },
                    },
                };
            }
            catch (error) {
                return {
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'failed',
                        reason: `unknownError: ${error.message}`,
                    },
                };
            }
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: `notImplemented: updating did:indy not implemented yet`,
                },
            };
        });
    }
    deactivate() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: `notImplemented: deactivating did:indy not implemented yet`,
                },
            };
        });
    }
    registerPublicDid(agentContext, pool, unqualifiedSubmitterDid, submitterSigningKey, unqualifiedDid, signingKey, alias, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const indySdk = agentContext.dependencyManager.resolve(types_1.IndySdkSymbol);
            const indySdkPoolService = agentContext.dependencyManager.resolve(ledger_1.IndySdkPoolService);
            try {
                agentContext.config.logger.debug(`Register public did '${unqualifiedDid}' on ledger '${pool.didIndyNamespace}'`);
                const request = yield indySdk.buildNymRequest(unqualifiedSubmitterDid, unqualifiedDid, signingKey.publicKeyBase58, alias, role || null);
                const response = yield indySdkPoolService.submitWriteRequest(agentContext, pool, request, submitterSigningKey);
                agentContext.config.logger.debug(`Registered public did '${unqualifiedDid}' on ledger '${pool.didIndyNamespace}'`, {
                    response,
                });
            }
            catch (error) {
                agentContext.config.logger.error(`Error registering public did '${unqualifiedDid}' on ledger '${pool.didIndyNamespace}'`, {
                    error,
                    unqualifiedSubmitterDid,
                    unqualifiedDid,
                    verkey: signingKey.publicKeyBase58,
                    alias,
                    role,
                    pool: pool.didIndyNamespace,
                });
                throw error;
            }
        });
    }
    setEndpointsForDid(agentContext, pool, unqualifiedDid, signingKey, endpoints) {
        return __awaiter(this, void 0, void 0, function* () {
            const indySdk = agentContext.dependencyManager.resolve(types_1.IndySdkSymbol);
            const indySdkPoolService = agentContext.dependencyManager.resolve(ledger_1.IndySdkPoolService);
            try {
                agentContext.config.logger.debug(`Set endpoints for did '${unqualifiedDid}' on ledger '${pool.didIndyNamespace}'`, endpoints);
                const request = yield indySdk.buildAttribRequest(unqualifiedDid, unqualifiedDid, null, { endpoint: endpoints }, null);
                const response = yield indySdkPoolService.submitWriteRequest(agentContext, pool, request, signingKey);
                agentContext.config.logger.debug(`Successfully set endpoints for did '${unqualifiedDid}' on ledger '${pool.didIndyNamespace}'`, {
                    response,
                    endpoints,
                });
            }
            catch (error) {
                agentContext.config.logger.error(`Error setting endpoints for did '${unqualifiedDid}' on ledger '${pool.didIndyNamespace}'`, {
                    error,
                    unqualifiedDid,
                    endpoints,
                });
                throw (0, indyError_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
            }
        });
    }
}
exports.IndySdkIndyDidRegistrar = IndySdkIndyDidRegistrar;
