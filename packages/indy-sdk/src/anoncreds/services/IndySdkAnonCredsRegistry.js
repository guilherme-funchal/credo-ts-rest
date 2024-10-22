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
exports.IndySdkAnonCredsRegistry = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const didIndyUtil_1 = require("../../dids/didIndyUtil");
const error_1 = require("../../error");
const ledger_1 = require("../../ledger");
const types_1 = require("../../types");
const identifiers_1 = require("../utils/identifiers");
const transform_1 = require("../utils/transform");
class IndySdkAnonCredsRegistry {
    constructor() {
        this.methodName = 'indy';
        /**
         * This class supports resolving and registering objects with did:indy as well as legacy indy identifiers.
         * It needs to include support for the schema, credential definition, revocation registry as well
         * as the issuer id (which is needed when registering objects).
         */
        this.supportedIdentifier = identifiers_1.indySdkAnonCredsRegistryIdentifierRegex;
    }
    getSchema(agentContext, schemaId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const indySdkPoolService = agentContext.dependencyManager.resolve(ledger_1.IndySdkPoolService);
                const indySdk = agentContext.dependencyManager.resolve(types_1.IndySdkSymbol);
                // parse schema id (supports did:indy and legacy)
                const { did, namespaceIdentifier, schemaName, schemaVersion } = (0, anoncreds_1.parseIndySchemaId)(schemaId);
                const { pool } = yield indySdkPoolService.getPoolForDid(agentContext, did);
                agentContext.config.logger.debug(`Getting schema '${schemaId}' from ledger '${pool.didIndyNamespace}'`);
                // even though we support did:indy and legacy identifiers we always need to fetch using the legacy identifier
                const legacySchemaId = (0, anoncreds_1.getUnqualifiedSchemaId)(namespaceIdentifier, schemaName, schemaVersion);
                const request = yield indySdk.buildGetSchemaRequest(null, legacySchemaId);
                agentContext.config.logger.trace(`Submitting get schema request for schema '${schemaId}' to ledger '${pool.didIndyNamespace}'`);
                const response = yield indySdkPoolService.submitReadRequest(pool, request);
                agentContext.config.logger.trace(`Got un-parsed schema '${schemaId}' from ledger '${pool.didIndyNamespace}'`, {
                    response,
                });
                const [, schema] = yield indySdk.parseGetSchemaResponse(response);
                agentContext.config.logger.debug(`Got schema '${schemaId}' from ledger '${pool.didIndyNamespace}'`, {
                    schema,
                });
                return {
                    schema: {
                        attrNames: schema.attrNames,
                        name: schema.name,
                        version: schema.version,
                        issuerId: did,
                    },
                    schemaId,
                    resolutionMetadata: {},
                    schemaMetadata: {
                        didIndyNamespace: pool.didIndyNamespace,
                        // NOTE: the seqNo is required by the indy-sdk even though not present in AnonCreds v1.
                        // For this reason we return it in the metadata.
                        indyLedgerSeqNo: schema.seqNo,
                    },
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error retrieving schema '${schemaId}'`, {
                    error,
                    schemaId,
                });
                return {
                    schemaId,
                    resolutionMetadata: {
                        error: 'notFound',
                        message: `unable to resolve credential definition: ${error.message}`,
                    },
                    schemaMetadata: {},
                };
            }
        });
    }
    registerSchema(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // This will throw an error if trying to register a schema with a legacy indy identifier. We only support did:indy identifiers
                // for registering, that will allow us to extract the namespace and means all stored records will use did:indy identifiers.
                const { namespaceIdentifier, namespace } = (0, anoncreds_1.parseIndyDid)(options.schema.issuerId);
                const indySdkPoolService = agentContext.dependencyManager.resolve(ledger_1.IndySdkPoolService);
                const indySdk = agentContext.dependencyManager.resolve(types_1.IndySdkSymbol);
                const pool = indySdkPoolService.getPoolForNamespace(namespace);
                agentContext.config.logger.debug(`Register schema on ledger '${pool.didIndyNamespace}' with did '${options.schema.issuerId}'`, options.schema);
                const didIndySchemaId = (0, identifiers_1.getDidIndySchemaId)(namespace, namespaceIdentifier, options.schema.name, options.schema.version);
                const legacySchemaId = (0, anoncreds_1.getUnqualifiedSchemaId)(namespaceIdentifier, options.schema.name, options.schema.version);
                const schema = {
                    attrNames: options.schema.attrNames,
                    name: options.schema.name,
                    version: options.schema.version,
                    id: legacySchemaId,
                    ver: '1.0',
                    // Casted as because the type expect a seqNo, but that's not actually required for the input of
                    // buildSchemaRequest (seqNo is not yet known)
                };
                const request = yield indySdk.buildSchemaRequest(namespaceIdentifier, schema);
                const submitterKey = yield (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, options.schema.issuerId);
                const response = yield indySdkPoolService.submitWriteRequest(agentContext, pool, request, submitterKey);
                agentContext.config.logger.debug(`Registered schema '${schema.id}' on ledger '${pool.didIndyNamespace}'`, {
                    response,
                    schema,
                });
                return {
                    schemaState: {
                        state: 'finished',
                        schema: {
                            attrNames: schema.attrNames,
                            issuerId: options.schema.issuerId,
                            name: schema.name,
                            version: schema.version,
                        },
                        schemaId: didIndySchemaId,
                    },
                    registrationMetadata: {},
                    schemaMetadata: {
                        // NOTE: the seqNo is required by the indy-sdk even though not present in AnonCreds v1.
                        // For this reason we return it in the metadata.
                        indyLedgerSeqNo: response.result.txnMetadata.seqNo,
                    },
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error registering schema for did '${options.schema.issuerId}'`, {
                    error,
                    did: options.schema.issuerId,
                    schema: options.schema,
                });
                return {
                    schemaMetadata: {},
                    registrationMetadata: {},
                    schemaState: {
                        state: 'failed',
                        schema: options.schema,
                        reason: `unknownError: ${error.message}`,
                    },
                };
            }
        });
    }
    getCredentialDefinition(agentContext, credentialDefinitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const indySdkPoolService = agentContext.dependencyManager.resolve(ledger_1.IndySdkPoolService);
                const indySdk = agentContext.dependencyManager.resolve(types_1.IndySdkSymbol);
                // we support did:indy and legacy identifiers
                const { did, namespaceIdentifier, schemaSeqNo, tag } = (0, anoncreds_1.parseIndyCredentialDefinitionId)(credentialDefinitionId);
                const { pool } = yield indySdkPoolService.getPoolForDid(agentContext, did);
                agentContext.config.logger.debug(`Using ledger '${pool.didIndyNamespace}' to retrieve credential definition '${credentialDefinitionId}'`);
                const legacyCredentialDefinitionId = (0, anoncreds_1.getUnqualifiedCredentialDefinitionId)(namespaceIdentifier, schemaSeqNo, tag);
                const request = yield indySdk.buildGetCredDefRequest(null, legacyCredentialDefinitionId);
                agentContext.config.logger.trace(`Submitting get credential definition request for credential definition '${credentialDefinitionId}' to ledger '${pool.didIndyNamespace}'`);
                const response = yield indySdkPoolService.submitReadRequest(pool, request);
                agentContext.config.logger.trace(`Got un-parsed credential definition '${credentialDefinitionId}' from ledger '${pool.didIndyNamespace}'`, {
                    response,
                });
                const [, credentialDefinition] = yield indySdk.parseGetCredDefResponse(response);
                const { schema } = yield this.fetchIndySchemaWithSeqNo(agentContext, pool, Number(credentialDefinition.schemaId));
                if (credentialDefinition && schema) {
                    agentContext.config.logger.debug(`Got credential definition '${credentialDefinitionId}' from ledger '${pool.didIndyNamespace}'`, {
                        credentialDefinition,
                    });
                    // Format the schema id based on the type of the credential definition id
                    const schemaId = credentialDefinitionId.startsWith('did:indy')
                        ? (0, identifiers_1.getDidIndySchemaId)(pool.didIndyNamespace, namespaceIdentifier, schema.name, schema.version)
                        : schema.schemaId;
                    return {
                        credentialDefinitionId,
                        credentialDefinition: {
                            issuerId: did,
                            schemaId,
                            tag: credentialDefinition.tag,
                            type: 'CL',
                            value: credentialDefinition.value,
                        },
                        credentialDefinitionMetadata: {
                            didIndyNamespace: pool.didIndyNamespace,
                        },
                        resolutionMetadata: {},
                    };
                }
                agentContext.config.logger.error(`Error retrieving credential definition '${credentialDefinitionId}'`, {
                    credentialDefinitionId,
                });
                return {
                    credentialDefinitionId,
                    credentialDefinitionMetadata: {},
                    resolutionMetadata: {
                        error: 'notFound',
                        message: `unable to resolve credential definition`,
                    },
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error retrieving credential definition '${credentialDefinitionId}'`, {
                    error,
                    credentialDefinitionId,
                });
                return {
                    credentialDefinitionId,
                    credentialDefinitionMetadata: {},
                    resolutionMetadata: {
                        error: 'notFound',
                        message: `unable to resolve credential definition: ${error.message}`,
                    },
                };
            }
        });
    }
    registerCredentialDefinition(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // This will throw an error if trying to register a credential defintion with a legacy indy identifier. We only support did:indy
                // identifiers for registering, that will allow us to extract the namespace and means all stored records will use did:indy identifiers.
                const { namespaceIdentifier, namespace } = (0, anoncreds_1.parseIndyDid)(options.credentialDefinition.issuerId);
                const indySdkPoolService = agentContext.dependencyManager.resolve(ledger_1.IndySdkPoolService);
                const indySdk = agentContext.dependencyManager.resolve(types_1.IndySdkSymbol);
                const pool = indySdkPoolService.getPoolForNamespace(namespace);
                agentContext.config.logger.debug(`Registering credential definition on ledger '${pool.didIndyNamespace}' with did '${options.credentialDefinition.issuerId}'`, options.credentialDefinition);
                // TODO: check structure of the schemaId
                // TODO: this will bypass caching if done on a higher level.
                const { schema, schemaMetadata, resolutionMetadata } = yield this.getSchema(agentContext, options.credentialDefinition.schemaId);
                if (!schema || !schemaMetadata.indyLedgerSeqNo || typeof schemaMetadata.indyLedgerSeqNo !== 'number') {
                    return {
                        registrationMetadata: {},
                        credentialDefinitionMetadata: {
                            didIndyNamespace: pool.didIndyNamespace,
                        },
                        credentialDefinitionState: {
                            credentialDefinition: options.credentialDefinition,
                            state: 'failed',
                            reason: `error resolving schema with id ${options.credentialDefinition.schemaId}: ${resolutionMetadata.error} ${resolutionMetadata.message}`,
                        },
                    };
                }
                const legacyCredentialDefinitionId = (0, anoncreds_1.getUnqualifiedCredentialDefinitionId)(namespaceIdentifier, schemaMetadata.indyLedgerSeqNo, options.credentialDefinition.tag);
                const didIndyCredentialDefinitionId = (0, identifiers_1.getDidIndyCredentialDefinitionId)(namespace, namespaceIdentifier, schemaMetadata.indyLedgerSeqNo, options.credentialDefinition.tag);
                const request = yield indySdk.buildCredDefRequest(namespaceIdentifier, {
                    id: legacyCredentialDefinitionId,
                    // Indy ledger requires the credential schemaId to be a string of the schema seqNo.
                    schemaId: schemaMetadata.indyLedgerSeqNo.toString(),
                    tag: options.credentialDefinition.tag,
                    type: options.credentialDefinition.type,
                    value: options.credentialDefinition.value,
                    ver: '1.0',
                });
                const submitterKey = yield (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, options.credentialDefinition.issuerId);
                const response = yield indySdkPoolService.submitWriteRequest(agentContext, pool, request, submitterKey);
                agentContext.config.logger.debug(`Registered credential definition '${didIndyCredentialDefinitionId}' on ledger '${pool.didIndyNamespace}'`, {
                    response,
                    credentialDefinition: options.credentialDefinition,
                });
                return {
                    credentialDefinitionMetadata: {},
                    credentialDefinitionState: {
                        credentialDefinition: options.credentialDefinition,
                        credentialDefinitionId: didIndyCredentialDefinitionId,
                        state: 'finished',
                    },
                    registrationMetadata: {},
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error registering credential definition for schema '${options.credentialDefinition.schemaId}'`, {
                    error,
                    did: options.credentialDefinition.issuerId,
                    credentialDefinition: options.credentialDefinition,
                });
                throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
            }
        });
    }
    getRevocationRegistryDefinition(agentContext, revocationRegistryDefinitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const indySdkPoolService = agentContext.dependencyManager.resolve(ledger_1.IndySdkPoolService);
                const indySdk = agentContext.dependencyManager.resolve(types_1.IndySdkSymbol);
                const { did, namespaceIdentifier, credentialDefinitionTag, revocationRegistryTag, schemaSeqNo } = (0, anoncreds_1.parseIndyRevocationRegistryId)(revocationRegistryDefinitionId);
                const { pool } = yield indySdkPoolService.getPoolForDid(agentContext, did);
                agentContext.config.logger.debug(`Using ledger '${pool.didIndyNamespace}' to retrieve revocation registry definition '${revocationRegistryDefinitionId}'`);
                const legacyRevocationRegistryId = (0, anoncreds_1.getUnqualifiedRevocationRegistryId)(namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag);
                const request = yield indySdk.buildGetRevocRegDefRequest(null, legacyRevocationRegistryId);
                agentContext.config.logger.trace(`Submitting get revocation registry definition request for revocation registry definition '${revocationRegistryDefinitionId}' to ledger`);
                const response = yield indySdkPoolService.submitReadRequest(pool, request);
                agentContext.config.logger.trace(`Got un-parsed revocation registry definition '${revocationRegistryDefinitionId}' from ledger '${pool.didIndyNamespace}'`, {
                    response,
                });
                const [, revocationRegistryDefinition] = yield indySdk.parseGetRevocRegDefResponse(response);
                agentContext.config.logger.debug(`Got revocation registry definition '${revocationRegistryDefinitionId}' from ledger`, {
                    revocationRegistryDefinition,
                });
                const credentialDefinitionId = revocationRegistryDefinitionId.startsWith('did:indy:')
                    ? (0, identifiers_1.getDidIndyCredentialDefinitionId)(pool.didIndyNamespace, namespaceIdentifier, schemaSeqNo, credentialDefinitionTag)
                    : (0, anoncreds_1.getUnqualifiedCredentialDefinitionId)(namespaceIdentifier, schemaSeqNo, credentialDefinitionTag);
                return {
                    resolutionMetadata: {},
                    revocationRegistryDefinition: {
                        issuerId: did,
                        credDefId: credentialDefinitionId,
                        value: {
                            maxCredNum: revocationRegistryDefinition.value.maxCredNum,
                            publicKeys: revocationRegistryDefinition.value.publicKeys,
                            tailsHash: revocationRegistryDefinition.value.tailsHash,
                            tailsLocation: revocationRegistryDefinition.value.tailsLocation,
                        },
                        tag: revocationRegistryDefinition.tag,
                        revocDefType: 'CL_ACCUM',
                    },
                    revocationRegistryDefinitionId,
                    revocationRegistryDefinitionMetadata: {
                        issuanceType: revocationRegistryDefinition.value.issuanceType,
                        didIndyNamespace: pool.didIndyNamespace,
                    },
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error retrieving revocation registry definition '${revocationRegistryDefinitionId}' from ledger`, {
                    error,
                    revocationRegistryDefinitionId: revocationRegistryDefinitionId,
                });
                return {
                    resolutionMetadata: {
                        error: 'notFound',
                        message: `unable to resolve revocation registry definition: ${error.message}`,
                    },
                    revocationRegistryDefinitionId,
                    revocationRegistryDefinitionMetadata: {},
                };
            }
        });
    }
    getRevocationStatusList(agentContext, revocationRegistryId, timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const indySdkPoolService = agentContext.dependencyManager.resolve(ledger_1.IndySdkPoolService);
                const indySdk = agentContext.dependencyManager.resolve(types_1.IndySdkSymbol);
                const { did, namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag } = (0, anoncreds_1.parseIndyRevocationRegistryId)(revocationRegistryId);
                const { pool } = yield indySdkPoolService.getPoolForDid(agentContext, did);
                agentContext.config.logger.debug(`Using ledger '${pool.didIndyNamespace}' to retrieve revocation registry deltas with revocation registry definition id '${revocationRegistryId}' until ${timestamp}`);
                const legacyRevocationRegistryId = (0, anoncreds_1.getUnqualifiedRevocationRegistryId)(namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag);
                // TODO: implement caching for returned deltas
                const request = yield indySdk.buildGetRevocRegDeltaRequest(null, legacyRevocationRegistryId, 0, timestamp);
                agentContext.config.logger.trace(`Submitting get revocation registry delta request for revocation registry '${revocationRegistryId}' to ledger`);
                const response = yield indySdkPoolService.submitReadRequest(pool, request);
                agentContext.config.logger.trace(`Got revocation registry delta unparsed-response '${revocationRegistryId}' from ledger`, {
                    response,
                });
                const [, revocationRegistryDelta, deltaTimestamp] = yield indySdk.parseGetRevocRegDeltaResponse(response);
                agentContext.config.logger.debug(`Got revocation registry deltas '${revocationRegistryId}' until timestamp ${timestamp} from ledger`, {
                    revocationRegistryDelta,
                    deltaTimestamp,
                });
                const { resolutionMetadata, revocationRegistryDefinition, revocationRegistryDefinitionMetadata } = yield this.getRevocationRegistryDefinition(agentContext, revocationRegistryId);
                if (!revocationRegistryDefinition ||
                    !revocationRegistryDefinitionMetadata.issuanceType ||
                    typeof revocationRegistryDefinitionMetadata.issuanceType !== 'string') {
                    return {
                        resolutionMetadata: {
                            error: `error resolving revocation registry definition with id ${revocationRegistryId}: ${resolutionMetadata.error} ${resolutionMetadata.message}`,
                        },
                        revocationStatusListMetadata: {
                            didIndyNamespace: pool.didIndyNamespace,
                        },
                    };
                }
                const isIssuanceByDefault = revocationRegistryDefinitionMetadata.issuanceType === 'ISSUANCE_BY_DEFAULT';
                return {
                    resolutionMetadata: {},
                    revocationStatusList: (0, transform_1.anonCredsRevocationStatusListFromIndySdk)(revocationRegistryId, revocationRegistryDefinition, revocationRegistryDelta, deltaTimestamp, isIssuanceByDefault),
                    revocationStatusListMetadata: {
                        didIndyNamespace: pool.didIndyNamespace,
                    },
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error retrieving revocation registry delta '${revocationRegistryId}' from ledger, potentially revocation interval ends before revocation registry creation?"`, {
                    error,
                    revocationRegistryId: revocationRegistryId,
                });
                return {
                    resolutionMetadata: {
                        error: 'notFound',
                        message: `Error retrieving revocation registry delta '${revocationRegistryId}' from ledger, potentially revocation interval ends before revocation registry creation: ${error.message}`,
                    },
                    revocationStatusListMetadata: {},
                };
            }
        });
    }
    fetchIndySchemaWithSeqNo(agentContext, pool, seqNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const indySdkPoolService = agentContext.dependencyManager.resolve(ledger_1.IndySdkPoolService);
            const indySdk = agentContext.dependencyManager.resolve(types_1.IndySdkSymbol);
            agentContext.config.logger.debug(`Getting transaction with seqNo '${seqNo}' from ledger '${pool.didIndyNamespace}'`);
            const request = yield indySdk.buildGetTxnRequest(null, 'DOMAIN', seqNo);
            agentContext.config.logger.trace(`Submitting get transaction request to ledger '${pool.didIndyNamespace}'`);
            const response = yield indySdkPoolService.submitReadRequest(pool, request);
            const schema = response.result.data;
            if (schema.txn.type !== '101') {
                agentContext.config.logger.error(`Could not get schema from ledger for seq no ${seqNo}'`);
                return {};
            }
            return {
                schema: {
                    // txnId is the schema id
                    schemaId: schema.txnMetadata.txnId,
                    attr_name: schema.txn.data.data.attr_names,
                    name: schema.txn.data.data.name,
                    version: schema.txn.data.data.version,
                    issuerId: schema.txn.metadata.from,
                    seqNo,
                },
                indyNamespace: pool.didIndyNamespace,
            };
        });
    }
}
exports.IndySdkAnonCredsRegistry = IndySdkAnonCredsRegistry;
