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
exports.IndyVdrAnonCredsRegistry = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const indy_vdr_shared_1 = require("@hyperledger/indy-vdr-shared");
const didIndyUtil_1 = require("../dids/didIndyUtil");
const pool_1 = require("../pool");
const sign_1 = require("../utils/sign");
const identifiers_1 = require("./utils/identifiers");
const transform_1 = require("./utils/transform");
class IndyVdrAnonCredsRegistry {
    constructor() {
        this.methodName = 'indy';
        this.supportedIdentifier = identifiers_1.indyVdrAnonCredsRegistryIdentifierRegex;
    }
    getSchema(agentContext, schemaId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const indyVdrPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
                // parse schema id (supports did:indy and legacy)
                const { did, namespaceIdentifier, schemaName, schemaVersion } = (0, anoncreds_1.parseIndySchemaId)(schemaId);
                const { pool } = yield indyVdrPoolService.getPoolForDid(agentContext, did);
                agentContext.config.logger.debug(`Getting schema '${schemaId}' from ledger '${pool.indyNamespace}'`);
                // even though we support did:indy and legacy identifiers we always need to fetch using the legacy identifier
                const legacySchemaId = (0, anoncreds_1.getUnqualifiedSchemaId)(namespaceIdentifier, schemaName, schemaVersion);
                const request = new indy_vdr_shared_1.GetSchemaRequest({ schemaId: legacySchemaId });
                agentContext.config.logger.trace(`Submitting get schema request for schema '${schemaId}' to ledger '${pool.indyNamespace}'`);
                const response = yield pool.submitRequest(request);
                agentContext.config.logger.trace(`Got un-parsed schema '${schemaId}' from ledger '${pool.indyNamespace}'`, {
                    response,
                });
                if (!('attr_names' in response.result.data)) {
                    agentContext.config.logger.error(`Error retrieving schema '${schemaId}'`);
                    return {
                        schemaId,
                        resolutionMetadata: {
                            error: 'notFound',
                            message: `unable to find schema with id ${schemaId}`,
                        },
                        schemaMetadata: {},
                    };
                }
                return {
                    schema: {
                        attrNames: response.result.data.attr_names,
                        name: response.result.data.name,
                        version: response.result.data.version,
                        issuerId: did,
                    },
                    schemaId,
                    resolutionMetadata: {},
                    schemaMetadata: {
                        didIndyNamespace: pool.indyNamespace,
                        // NOTE: the seqNo is required by the indy-sdk even though not present in AnonCreds v1.
                        // For this reason we return it in the metadata.
                        indyLedgerSeqNo: response.result.seqNo,
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
                    },
                    schemaMetadata: {},
                };
            }
        });
    }
    registerSchema(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const schema = options.schema;
            const { issuerId, name, version, attrNames } = schema;
            try {
                // This will throw an error if trying to register a schema with a legacy indy identifier. We only support did:indy identifiers
                // for registering, that will allow us to extract the namespace and means all stored records will use did:indy identifiers.
                const { namespaceIdentifier, namespace } = (0, anoncreds_1.parseIndyDid)(issuerId);
                const { endorserDid, endorserMode } = options.options;
                const indyVdrPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
                const pool = indyVdrPoolService.getPoolForNamespace(namespace);
                let writeRequest;
                const didIndySchemaId = (0, identifiers_1.getDidIndySchemaId)(namespace, namespaceIdentifier, schema.name, schema.version);
                const endorsedTransaction = options.options.endorsedTransaction;
                if (endorsedTransaction) {
                    agentContext.config.logger.debug(`Preparing endorsed tx '${endorsedTransaction}' for submission on ledger '${namespace}' with did '${issuerId}'`, schema);
                    writeRequest = new indy_vdr_shared_1.CustomRequest({ customRequest: endorsedTransaction });
                }
                else {
                    agentContext.config.logger.debug(`Create schema tx on ledger '${namespace}' with did '${issuerId}'`, schema);
                    const legacySchemaId = (0, anoncreds_1.getUnqualifiedSchemaId)(namespaceIdentifier, name, version);
                    const schemaRequest = new indy_vdr_shared_1.SchemaRequest({
                        submitterDid: namespaceIdentifier,
                        schema: { id: legacySchemaId, name, ver: '1.0', version, attrNames },
                    });
                    const submitterKey = yield (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, issuerId);
                    writeRequest = yield pool.prepareWriteRequest(agentContext, schemaRequest, submitterKey, endorserDid !== issuerId ? endorserDid : undefined);
                    if (endorserMode === 'external') {
                        return {
                            jobId: didIndySchemaId,
                            schemaState: {
                                state: 'action',
                                action: 'endorseIndyTransaction',
                                schemaId: didIndySchemaId,
                                schema: schema,
                                schemaRequest: writeRequest.body,
                            },
                            registrationMetadata: {},
                            schemaMetadata: {},
                        };
                    }
                    if (endorserMode === 'internal' && endorserDid !== issuerId) {
                        const endorserKey = yield (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, endorserDid);
                        yield (0, sign_1.multiSignRequest)(agentContext, writeRequest, endorserKey, (0, anoncreds_1.parseIndyDid)(endorserDid).namespaceIdentifier);
                    }
                }
                const response = yield pool.submitRequest(writeRequest);
                agentContext.config.logger.debug(`Registered schema '${didIndySchemaId}' on ledger '${pool.indyNamespace}'`, {
                    response,
                    writeRequest,
                });
                return {
                    schemaState: {
                        state: 'finished',
                        schema: schema,
                        schemaId: didIndySchemaId,
                    },
                    registrationMetadata: {},
                    schemaMetadata: {
                        // NOTE: the seqNo is required by the indy-sdk even though not present in AnonCreds v1.
                        // For this reason we return it in the metadata.
                        // Cast to SchemaResponse to pass type check
                        indyLedgerSeqNo: (_b = (_a = response === null || response === void 0 ? void 0 : response.result) === null || _a === void 0 ? void 0 : _a.txnMetadata) === null || _b === void 0 ? void 0 : _b.seqNo,
                    },
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error registering schema for did '${issuerId}'`, {
                    error,
                    did: issuerId,
                    schema: schema,
                });
                return {
                    schemaMetadata: {},
                    registrationMetadata: {},
                    schemaState: {
                        state: 'failed',
                        schema: schema,
                        reason: `unknownError: ${error.message}`,
                    },
                };
            }
        });
    }
    getCredentialDefinition(agentContext, credentialDefinitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const indyVdrPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
                // we support did:indy and legacy identifiers
                const { did, namespaceIdentifier, schemaSeqNo, tag } = (0, anoncreds_1.parseIndyCredentialDefinitionId)(credentialDefinitionId);
                const { pool } = yield indyVdrPoolService.getPoolForDid(agentContext, did);
                agentContext.config.logger.debug(`Getting credential definition '${credentialDefinitionId}' from ledger '${pool.indyNamespace}'`);
                const legacyCredentialDefinitionId = (0, anoncreds_1.getUnqualifiedCredentialDefinitionId)(namespaceIdentifier, schemaSeqNo, tag);
                const request = new indy_vdr_shared_1.GetCredentialDefinitionRequest({
                    credentialDefinitionId: legacyCredentialDefinitionId,
                });
                agentContext.config.logger.trace(`Submitting get credential definition request for credential definition '${credentialDefinitionId}' to ledger '${pool.indyNamespace}'`);
                const response = yield pool.submitRequest(request);
                // We need to fetch the schema to determine the schemaId (we only have the seqNo)
                const schema = yield this.fetchIndySchemaWithSeqNo(agentContext, response.result.ref, namespaceIdentifier);
                if (!schema || !response.result.data) {
                    agentContext.config.logger.error(`Error retrieving credential definition '${credentialDefinitionId}'`);
                    return {
                        credentialDefinitionId,
                        credentialDefinitionMetadata: {},
                        resolutionMetadata: {
                            error: 'notFound',
                            message: `unable to resolve credential definition with id ${credentialDefinitionId}`,
                        },
                    };
                }
                // Format the schema id based on the type of the credential definition id
                const schemaId = credentialDefinitionId.startsWith('did:indy')
                    ? (0, identifiers_1.getDidIndySchemaId)(pool.indyNamespace, namespaceIdentifier, schema.schema.name, schema.schema.version)
                    : schema.schema.schemaId;
                return {
                    credentialDefinitionId: credentialDefinitionId,
                    credentialDefinition: {
                        issuerId: did,
                        schemaId,
                        tag: response.result.tag,
                        type: 'CL',
                        value: response.result.data,
                    },
                    credentialDefinitionMetadata: {
                        didIndyNamespace: pool.indyNamespace,
                    },
                    resolutionMetadata: {},
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
            var _a;
            const credentialDefinition = options.credentialDefinition;
            const { schemaId, issuerId, tag, value } = credentialDefinition;
            try {
                // This will throw an error if trying to register a credential defintion with a legacy indy identifier. We only support did:indy
                // identifiers for registering, that will allow us to extract the namespace and means all stored records will use did:indy identifiers.
                const { namespaceIdentifier, namespace } = (0, anoncreds_1.parseIndyDid)(issuerId);
                const { endorserDid, endorserMode } = options.options;
                const indyVdrPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
                const pool = indyVdrPoolService.getPoolForNamespace(namespace);
                agentContext.config.logger.debug(`Registering credential definition on ledger '${namespace}' with did '${issuerId}'`, options.credentialDefinition);
                let writeRequest;
                let didIndyCredentialDefinitionId;
                let seqNo;
                const endorsedTransaction = options.options.endorsedTransaction;
                if (endorsedTransaction) {
                    agentContext.config.logger.debug(`Preparing endorsed tx '${endorsedTransaction}' for submission on ledger '${namespace}' with did '${issuerId}'`, credentialDefinition);
                    writeRequest = new indy_vdr_shared_1.CustomRequest({ customRequest: endorsedTransaction });
                    const operation = (_a = JSON.parse(endorsedTransaction)) === null || _a === void 0 ? void 0 : _a.operation;
                    // extract the seqNo from the endorsed transaction, which is contained in the ref field of the operation
                    seqNo = Number(operation === null || operation === void 0 ? void 0 : operation.ref);
                    didIndyCredentialDefinitionId = (0, identifiers_1.getDidIndyCredentialDefinitionId)(namespace, namespaceIdentifier, seqNo, tag);
                }
                else {
                    // TODO: this will bypass caching if done on a higher level.
                    const { schemaMetadata, resolutionMetadata } = yield this.getSchema(agentContext, schemaId);
                    if (!(schemaMetadata === null || schemaMetadata === void 0 ? void 0 : schemaMetadata.indyLedgerSeqNo) || typeof schemaMetadata.indyLedgerSeqNo !== 'number') {
                        return {
                            registrationMetadata: {},
                            credentialDefinitionMetadata: {
                                didIndyNamespace: pool.indyNamespace,
                            },
                            credentialDefinitionState: {
                                credentialDefinition: options.credentialDefinition,
                                state: 'failed',
                                reason: `error resolving schema with id ${schemaId}: ${resolutionMetadata.error} ${resolutionMetadata.message}`,
                            },
                        };
                    }
                    seqNo = schemaMetadata.indyLedgerSeqNo;
                    const legacyCredentialDefinitionId = (0, anoncreds_1.getUnqualifiedCredentialDefinitionId)(issuerId, seqNo, tag);
                    didIndyCredentialDefinitionId = (0, identifiers_1.getDidIndyCredentialDefinitionId)(namespace, namespaceIdentifier, seqNo, tag);
                    const credentialDefinitionRequest = new indy_vdr_shared_1.CredentialDefinitionRequest({
                        submitterDid: namespaceIdentifier,
                        credentialDefinition: {
                            ver: '1.0',
                            id: legacyCredentialDefinitionId,
                            schemaId: `${seqNo}`,
                            type: 'CL',
                            tag: tag,
                            value: value,
                        },
                    });
                    const submitterKey = yield (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, issuerId);
                    writeRequest = yield pool.prepareWriteRequest(agentContext, credentialDefinitionRequest, submitterKey, endorserDid !== issuerId ? endorserDid : undefined);
                    if (endorserMode === 'external') {
                        return {
                            jobId: didIndyCredentialDefinitionId,
                            credentialDefinitionState: {
                                state: 'action',
                                action: 'endorseIndyTransaction',
                                credentialDefinition: credentialDefinition,
                                credentialDefinitionId: didIndyCredentialDefinitionId,
                                credentialDefinitionRequest: writeRequest.body,
                            },
                            registrationMetadata: {},
                            credentialDefinitionMetadata: {},
                        };
                    }
                    if (endorserMode === 'internal' && endorserDid !== issuerId) {
                        const endorserKey = yield (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, endorserDid);
                        yield (0, sign_1.multiSignRequest)(agentContext, writeRequest, endorserKey, (0, anoncreds_1.parseIndyDid)(endorserDid).namespaceIdentifier);
                    }
                }
                const response = yield pool.submitRequest(writeRequest);
                agentContext.config.logger.debug(`Registered credential definition '${didIndyCredentialDefinitionId}' on ledger '${pool.indyNamespace}'`, {
                    response,
                    credentialDefinition: options.credentialDefinition,
                });
                return {
                    credentialDefinitionMetadata: {},
                    credentialDefinitionState: {
                        credentialDefinition: credentialDefinition,
                        credentialDefinitionId: didIndyCredentialDefinitionId,
                        state: 'finished',
                    },
                    registrationMetadata: {},
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error registering credential definition for schema '${schemaId}'`, {
                    error,
                    did: issuerId,
                    credentialDefinition: options.credentialDefinition,
                });
                return {
                    credentialDefinitionMetadata: {},
                    registrationMetadata: {},
                    credentialDefinitionState: {
                        credentialDefinition: options.credentialDefinition,
                        state: 'failed',
                        reason: `unknownError: ${error.message}`,
                    },
                };
            }
        });
    }
    getRevocationRegistryDefinition(agentContext, revocationRegistryDefinitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const indySdkPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
                const { did, namespaceIdentifier, credentialDefinitionTag, revocationRegistryTag, schemaSeqNo } = (0, anoncreds_1.parseIndyRevocationRegistryId)(revocationRegistryDefinitionId);
                const { pool } = yield indySdkPoolService.getPoolForDid(agentContext, did);
                agentContext.config.logger.debug(`Using ledger '${pool.indyNamespace}' to retrieve revocation registry definition '${revocationRegistryDefinitionId}'`);
                const legacyRevocationRegistryId = (0, anoncreds_1.getUnqualifiedRevocationRegistryId)(namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag);
                const request = new indy_vdr_shared_1.GetRevocationRegistryDefinitionRequest({
                    revocationRegistryId: legacyRevocationRegistryId,
                });
                agentContext.config.logger.trace(`Submitting get revocation registry definition request for revocation registry definition '${revocationRegistryDefinitionId}' to ledger`);
                const response = yield pool.submitRequest(request);
                if (!response.result.data) {
                    agentContext.config.logger.error(`Error retrieving revocation registry definition '${revocationRegistryDefinitionId}' from ledger`, {
                        revocationRegistryDefinitionId,
                    });
                    return {
                        resolutionMetadata: {
                            error: 'notFound',
                            message: `unable to resolve revocation registry definition`,
                        },
                        revocationRegistryDefinitionId,
                        revocationRegistryDefinitionMetadata: {},
                    };
                }
                agentContext.config.logger.trace(`Got revocation registry definition '${revocationRegistryDefinitionId}' from ledger '${pool.indyNamespace}'`, {
                    response,
                });
                const credentialDefinitionId = revocationRegistryDefinitionId.startsWith('did:indy:')
                    ? (0, identifiers_1.getDidIndyCredentialDefinitionId)(pool.indyNamespace, namespaceIdentifier, schemaSeqNo, credentialDefinitionTag)
                    : (0, anoncreds_1.getUnqualifiedCredentialDefinitionId)(namespaceIdentifier, schemaSeqNo, credentialDefinitionTag);
                const revocationRegistryDefinition = {
                    issuerId: did,
                    revocDefType: response.result.data.revocDefType,
                    value: {
                        maxCredNum: response.result.data.value.maxCredNum,
                        tailsHash: response.result.data.value.tailsHash,
                        tailsLocation: response.result.data.value.tailsLocation,
                        publicKeys: {
                            accumKey: {
                                z: response.result.data.value.publicKeys.accumKey.z,
                            },
                        },
                    },
                    tag: response.result.data.tag,
                    credDefId: credentialDefinitionId,
                };
                return {
                    revocationRegistryDefinitionId,
                    revocationRegistryDefinition,
                    revocationRegistryDefinitionMetadata: {
                        issuanceType: response.result.data.value.issuanceType,
                        didIndyNamespace: pool.indyNamespace,
                    },
                    resolutionMetadata: {},
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error retrieving revocation registry definition '${revocationRegistryDefinitionId}' from ledger`, {
                    error,
                    revocationRegistryDefinitionId,
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
                const indySdkPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
                const { did, namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag } = (0, anoncreds_1.parseIndyRevocationRegistryId)(revocationRegistryId);
                const { pool } = yield indySdkPoolService.getPoolForDid(agentContext, did);
                agentContext.config.logger.debug(`Using ledger '${pool.indyNamespace}' to retrieve revocation registry deltas with revocation registry definition id '${revocationRegistryId}' until ${timestamp}`);
                const legacyRevocationRegistryId = (0, anoncreds_1.getUnqualifiedRevocationRegistryId)(namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag);
                const request = new indy_vdr_shared_1.GetRevocationRegistryDeltaRequest({
                    revocationRegistryId: legacyRevocationRegistryId,
                    toTs: timestamp,
                });
                agentContext.config.logger.trace(`Submitting get revocation registry delta request for revocation registry '${revocationRegistryId}' to ledger`);
                const response = yield pool.submitRequest(request);
                agentContext.config.logger.debug(`Got revocation registry deltas '${revocationRegistryId}' until timestamp ${timestamp} from ledger`);
                const { revocationRegistryDefinition, resolutionMetadata, revocationRegistryDefinitionMetadata } = yield this.getRevocationRegistryDefinition(agentContext, revocationRegistryId);
                if (!revocationRegistryDefinition ||
                    !revocationRegistryDefinitionMetadata.issuanceType ||
                    typeof revocationRegistryDefinitionMetadata.issuanceType !== 'string') {
                    return {
                        resolutionMetadata: {
                            error: `error resolving revocation registry definition with id ${revocationRegistryId}: ${resolutionMetadata.error} ${resolutionMetadata.message}`,
                        },
                        revocationStatusListMetadata: {
                            didIndyNamespace: pool.indyNamespace,
                        },
                    };
                }
                const isIssuanceByDefault = revocationRegistryDefinitionMetadata.issuanceType === 'ISSUANCE_BY_DEFAULT';
                if (!response.result.data) {
                    return {
                        resolutionMetadata: {
                            error: 'notFound',
                            message: `Error retrieving revocation registry delta '${revocationRegistryId}' from ledger, potentially revocation interval ends before revocation registry creation`,
                        },
                        revocationStatusListMetadata: {},
                    };
                }
                const revocationRegistryDelta = {
                    accum: response.result.data.value.accum_to.value.accum,
                    issued: response.result.data.value.issued,
                    revoked: response.result.data.value.revoked,
                };
                return {
                    resolutionMetadata: {},
                    revocationStatusList: (0, transform_1.anonCredsRevocationStatusListFromIndyVdr)(revocationRegistryId, revocationRegistryDefinition, revocationRegistryDelta, response.result.data.value.accum_to.txnTime, isIssuanceByDefault),
                    revocationStatusListMetadata: {
                        didIndyNamespace: pool.indyNamespace,
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
    fetchIndySchemaWithSeqNo(agentContext, seqNo, did) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const indyVdrPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
            const { pool } = yield indyVdrPoolService.getPoolForDid(agentContext, did);
            agentContext.config.logger.debug(`Getting transaction with seqNo '${seqNo}' from ledger '${pool.indyNamespace}'`);
            // ledgerType 1 is domain ledger
            const request = new indy_vdr_shared_1.GetTransactionRequest({ ledgerType: 1, seqNo });
            agentContext.config.logger.trace(`Submitting get transaction request to ledger '${pool.indyNamespace}'`);
            const response = yield pool.submitRequest(request);
            if (((_a = response.result.data) === null || _a === void 0 ? void 0 : _a.txn.type) !== '101') {
                agentContext.config.logger.error(`Could not get schema from ledger for seq no ${seqNo}'`);
                return null;
            }
            const schema = (_b = response.result.data) === null || _b === void 0 ? void 0 : _b.txn.data;
            const schemaId = (0, anoncreds_1.getUnqualifiedSchemaId)(did, schema.data.name, schema.data.version);
            return {
                schema: {
                    schemaId,
                    attr_name: schema.data.attr_names,
                    name: schema.data.name,
                    version: schema.data.version,
                    issuerId: did,
                    seqNo,
                },
                indyNamespace: pool.indyNamespace,
            };
        });
    }
}
exports.IndyVdrAnonCredsRegistry = IndyVdrAnonCredsRegistry;
