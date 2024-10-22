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
exports.IndySdkHolderService = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const IndySdkModuleConfig_1 = require("../../IndySdkModuleConfig");
const error_1 = require("../../error");
const assertIndySdkWallet_1 = require("../../utils/assertIndySdkWallet");
const assertUnqualified_1 = require("../utils/assertUnqualified");
const transform_1 = require("../utils/transform");
let IndySdkHolderService = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IndySdkHolderService = _classThis = class {
        constructor(indyRevocationService, indySdk) {
            this.indySdk = indySdk;
            this.indyRevocationService = indyRevocationService;
        }
        createLinkSecret(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                const linkSecretId = (_a = options.linkSecretId) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
                try {
                    yield this.indySdk.proverCreateMasterSecret(agentContext.wallet.handle, linkSecretId);
                    // We don't have the value for the link secret when using the indy-sdk so we can't return it.
                    return {
                        linkSecretId,
                    };
                }
                catch (error) {
                    agentContext.config.logger.error(`Error creating link secret`, {
                        error,
                        linkSecretId,
                    });
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        createProof(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { credentialDefinitions, proofRequest, selectedCredentials, schemas } = options;
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                // Make sure all identifiers are unqualified
                (0, assertUnqualified_1.assertAllUnqualified)({
                    schemaIds: Object.keys(options.schemas),
                    credentialDefinitionIds: Object.keys(options.credentialDefinitions),
                    revocationRegistryIds: Object.keys(options.revocationRegistries),
                });
                const linkSecretRepository = agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsLinkSecretRepository);
                try {
                    agentContext.config.logger.debug('Creating Indy Proof');
                    const indyRevocationStates = yield this.indyRevocationService.createRevocationState(agentContext, proofRequest, selectedCredentials, options.revocationRegistries);
                    // The AnonCredsSchema doesn't contain the seqNo anymore. However, the indy credential definition id
                    // does contain the seqNo, so we can extract it from the credential definition id.
                    const seqNoMap = {};
                    // Convert AnonCreds credential definitions to Indy credential definitions
                    const indyCredentialDefinitions = {};
                    for (const credentialDefinitionId in credentialDefinitions) {
                        const credentialDefinition = credentialDefinitions[credentialDefinitionId];
                        indyCredentialDefinitions[credentialDefinitionId] = (0, transform_1.indySdkCredentialDefinitionFromAnonCreds)(credentialDefinitionId, credentialDefinition);
                        // Get the seqNo for the schemas so we can use it when transforming the schemas
                        const { schemaSeqNo } = (0, anoncreds_1.parseIndyCredentialDefinitionId)(credentialDefinitionId);
                        seqNoMap[credentialDefinition.schemaId] = Number(schemaSeqNo);
                    }
                    // Convert AnonCreds schemas to Indy schemas
                    const indySchemas = {};
                    for (const schemaId in schemas) {
                        const schema = schemas[schemaId];
                        indySchemas[schemaId] = (0, transform_1.indySdkSchemaFromAnonCreds)(schemaId, schema, seqNoMap[schemaId]);
                    }
                    const linkSecretRecord = yield linkSecretRepository.findDefault(agentContext);
                    if (!linkSecretRecord) {
                        // No default link secret
                        throw new core_1.AriesFrameworkError('No default link secret found. Indy SDK requires a default link secret to be created before creating a proof.');
                    }
                    const indyProof = yield this.indySdk.proverCreateProof(agentContext.wallet.handle, proofRequest, this.parseSelectedCredentials(selectedCredentials), linkSecretRecord.linkSecretId, indySchemas, indyCredentialDefinitions, indyRevocationStates);
                    agentContext.config.logger.trace('Created Indy Proof', {
                        indyProof,
                    });
                    // FIXME IndyProof if badly typed in indy-sdk. It contains a `requested_predicates` property, which should be `predicates`.
                    return indyProof;
                }
                catch (error) {
                    agentContext.config.logger.error(`Error creating Indy Proof`, {
                        error,
                        proofRequest,
                        selectedCredentials,
                    });
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        storeCredential(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                (0, assertUnqualified_1.assertAllUnqualified)({
                    schemaIds: [options.credentialDefinition.schemaId, options.credential.schema_id],
                    credentialDefinitionIds: [options.credentialDefinitionId, options.credential.cred_def_id],
                    revocationRegistryIds: [(_a = options.revocationRegistry) === null || _a === void 0 ? void 0 : _a.id, options.credential.rev_reg_id],
                });
                const indyRevocationRegistryDefinition = options.revocationRegistry
                    ? (0, transform_1.indySdkRevocationRegistryDefinitionFromAnonCreds)(options.revocationRegistry.id, options.revocationRegistry.definition)
                    : null;
                try {
                    return yield this.indySdk.proverStoreCredential(agentContext.wallet.handle, (_b = options.credentialId) !== null && _b !== void 0 ? _b : null, (0, transform_1.indySdkCredentialRequestMetadataFromAnonCreds)(options.credentialRequestMetadata), options.credential, (0, transform_1.indySdkCredentialDefinitionFromAnonCreds)(options.credentialDefinitionId, options.credentialDefinition), indyRevocationRegistryDefinition);
                }
                catch (error) {
                    agentContext.config.logger.error(`Error storing Indy Credential '${options.credentialId}'`, {
                        error,
                    });
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        getCredential(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                try {
                    const result = yield this.indySdk.proverGetCredential(agentContext.wallet.handle, options.credentialId);
                    return {
                        credentialDefinitionId: result.cred_def_id,
                        attributes: result.attrs,
                        credentialId: result.referent,
                        schemaId: result.schema_id,
                        credentialRevocationId: result.cred_rev_id,
                        revocationRegistryId: result.rev_reg_id,
                        methodName: 'indy',
                    };
                }
                catch (error) {
                    agentContext.config.logger.error(`Error getting Indy Credential '${options.credentialId}'`, {
                        error,
                    });
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        getCredentials(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                // Indy SDK only supports indy credentials
                if (options.methodName && options.methodName !== 'indy') {
                    return [];
                }
                (0, assertUnqualified_1.assertAllUnqualified)({
                    credentialDefinitionIds: [options.credentialDefinitionId],
                    schemaIds: [options.schemaId],
                    issuerIds: [options.issuerId, options.schemaIssuerId],
                });
                const credentials = yield this.indySdk.proverGetCredentials(agentContext.wallet.handle, {
                    cred_def_id: options.credentialDefinitionId,
                    schema_id: options.schemaId,
                    schema_issuer_did: options.schemaIssuerId,
                    schema_name: options.schemaName,
                    schema_version: options.schemaVersion,
                    issuer_did: options.issuerId,
                });
                return credentials.map((credential) => ({
                    credentialDefinitionId: credential.cred_def_id,
                    attributes: credential.attrs,
                    credentialId: credential.referent,
                    schemaId: credential.schema_id,
                    credentialRevocationId: credential.cred_rev_id,
                    revocationRegistryId: credential.rev_reg_id,
                    methodName: 'indy',
                }));
            });
        }
        createCredentialRequest(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                (0, assertUnqualified_1.assertUnqualifiedCredentialOffer)(options.credentialOffer);
                (0, assertUnqualified_1.assertAllUnqualified)({
                    schemaIds: [options.credentialDefinition.schemaId],
                    issuerIds: [options.credentialDefinition.issuerId],
                });
                if (!options.useLegacyProverDid) {
                    throw new core_1.AriesFrameworkError('Indy SDK only supports legacy prover did for credential requests');
                }
                const linkSecretRepository = agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsLinkSecretRepository);
                // We just generate a prover did like string, as it's not used for anything and we don't need
                // to prove ownership of the did. It's deprecated in AnonCreds v1, but kept for backwards compatibility
                const proverDid = (0, anoncreds_1.generateLegacyProverDidLikeString)();
                // If a link secret is specified, use it. Otherwise, attempt to use default link secret
                let linkSecretRecord = options.linkSecretId
                    ? yield linkSecretRepository.getByLinkSecretId(agentContext, options.linkSecretId)
                    : yield linkSecretRepository.findDefault(agentContext);
                // No default link secret. Automatically create one if set on module config
                if (!linkSecretRecord) {
                    const moduleConfig = agentContext.dependencyManager.resolve(IndySdkModuleConfig_1.IndySdkModuleConfig);
                    if (!moduleConfig.autoCreateLinkSecret) {
                        throw new core_1.AriesFrameworkError('No link secret provided to createCredentialRequest and no default link secret has been found');
                    }
                    const { linkSecretId } = yield this.createLinkSecret(agentContext, {});
                    linkSecretRecord = yield (0, anoncreds_1.storeLinkSecret)(agentContext, { linkSecretId, setAsDefault: true });
                }
                try {
                    const result = yield this.indySdk.proverCreateCredentialReq(agentContext.wallet.handle, proverDid, options.credentialOffer, 
                    // NOTE: Is it safe to use the cred_def_id from the offer? I think so. You can't create a request
                    // for a cred def that is not in the offer
                    (0, transform_1.indySdkCredentialDefinitionFromAnonCreds)(options.credentialOffer.cred_def_id, options.credentialDefinition), linkSecretRecord.linkSecretId);
                    return {
                        credentialRequest: result[0],
                        // The type is typed as a Record<string, unknown> in the indy-sdk, but the anoncreds package contains the correct type
                        credentialRequestMetadata: (0, transform_1.anonCredsCredentialRequestMetadataFromIndySdk)(result[1]),
                    };
                }
                catch (error) {
                    agentContext.config.logger.error(`Error creating Indy Credential Request`, {
                        error,
                        credentialOffer: options.credentialOffer,
                    });
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        deleteCredential(agentContext, credentialId) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                try {
                    return yield this.indySdk.proverDeleteCredential(agentContext.wallet.handle, credentialId);
                }
                catch (error) {
                    agentContext.config.logger.error(`Error deleting Indy Credential from Wallet`, {
                        error,
                    });
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        getCredentialsForProofRequest(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                (0, assertUnqualified_1.assertUnqualifiedProofRequest)(options.proofRequest);
                try {
                    // Open indy credential search
                    const searchHandle = yield this.indySdk.proverSearchCredentialsForProofReq(agentContext.wallet.handle, options.proofRequest, (_a = options.extraQuery) !== null && _a !== void 0 ? _a : null);
                    const start = (_b = options.start) !== null && _b !== void 0 ? _b : 0;
                    try {
                        // Make sure database cursors start at 'start' (bit ugly, but no way around in indy)
                        if (start > 0) {
                            yield this.fetchCredentialsForReferent(agentContext, searchHandle, options.attributeReferent, start);
                        }
                        // Fetch the credentials
                        const credentials = yield this.fetchCredentialsForReferent(agentContext, searchHandle, options.attributeReferent, options.limit);
                        // TODO: sort the credentials (irrevocable first)
                        return credentials.map((credential) => ({
                            credentialInfo: {
                                credentialDefinitionId: credential.cred_info.cred_def_id,
                                credentialId: credential.cred_info.referent,
                                attributes: credential.cred_info.attrs,
                                schemaId: credential.cred_info.schema_id,
                                revocationRegistryId: credential.cred_info.rev_reg_id,
                                credentialRevocationId: credential.cred_info.cred_rev_id,
                                methodName: 'indy',
                            },
                            interval: credential.interval,
                        }));
                    }
                    finally {
                        // Always close search
                        yield this.indySdk.proverCloseCredentialsSearchForProofReq(searchHandle);
                    }
                }
                catch (error) {
                    if ((0, error_1.isIndyError)(error)) {
                        throw new error_1.IndySdkError(error);
                    }
                    throw error;
                }
            });
        }
        fetchCredentialsForReferent(agentContext, searchHandle, referent, limit) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    let credentials = [];
                    // Allow max of 256 per fetch operation
                    const chunk = limit ? Math.min(256, limit) : 256;
                    // Loop while limit not reached (or no limit specified)
                    while (!limit || credentials.length < limit) {
                        // Retrieve credentials
                        const credentialsJson = yield this.indySdk.proverFetchCredentialsForProofReq(searchHandle, referent, chunk);
                        credentials = [...credentials, ...credentialsJson];
                        // If the number of credentials returned is less than chunk
                        // It means we reached the end of the iterator (no more credentials)
                        if (credentialsJson.length < chunk) {
                            return credentials;
                        }
                    }
                    return credentials;
                }
                catch (error) {
                    agentContext.config.logger.error(`Error Fetching Indy Credentials For Referent`, {
                        error,
                    });
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        /**
         * Converts a public api form of {@link AnonCredsSelectedCredentials} interface into a format {@link Indy.IndyRequestedCredentials} that Indy SDK expects.
         **/
        parseSelectedCredentials(selectedCredentials) {
            const indyRequestedCredentials = {
                requested_attributes: {},
                requested_predicates: {},
                self_attested_attributes: {},
            };
            for (const groupName in selectedCredentials.attributes) {
                indyRequestedCredentials.requested_attributes[groupName] = {
                    cred_id: selectedCredentials.attributes[groupName].credentialId,
                    revealed: selectedCredentials.attributes[groupName].revealed,
                    timestamp: selectedCredentials.attributes[groupName].timestamp,
                };
            }
            for (const groupName in selectedCredentials.predicates) {
                indyRequestedCredentials.requested_predicates[groupName] = {
                    cred_id: selectedCredentials.predicates[groupName].credentialId,
                    timestamp: selectedCredentials.predicates[groupName].timestamp,
                };
            }
            return indyRequestedCredentials;
        }
    };
    __setFunctionName(_classThis, "IndySdkHolderService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        IndySdkHolderService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return IndySdkHolderService = _classThis;
})();
exports.IndySdkHolderService = IndySdkHolderService;
