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
exports.InMemoryAnonCredsRegistry = void 0;
const core_1 = require("@aries-framework/core");
const bn_js_1 = __importDefault(require("bn.js"));
const identifiers_1 = require("../../indy-sdk/src/anoncreds/utils/identifiers");
const src_1 = require("../src");
/**
 * In memory implementation of the {@link AnonCredsRegistry} interface. Useful for testing.
 */
class InMemoryAnonCredsRegistry {
    constructor({ existingSchemas = {}, existingCredentialDefinitions = {}, existingRevocationRegistryDefinitions = {}, existingRevocationStatusLists = {}, } = {}) {
        this.methodName = 'inMemory';
        // Roughly match that the identifier starts with an unqualified indy did. Once the
        // anoncreds tests are not based on the indy-sdk anymore, we can use any identifier
        // we want, but the indy-sdk is picky about the identifier format.
        this.supportedIdentifier = /.+/;
        this.schemas = existingSchemas;
        this.credentialDefinitions = existingCredentialDefinitions;
        this.revocationRegistryDefinitions = existingRevocationRegistryDefinitions;
        this.revocationStatusLists = existingRevocationStatusLists;
    }
    getSchema(agentContext, schemaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.schemas[schemaId];
            const parsed = (0, src_1.parseIndySchemaId)(schemaId);
            const legacySchemaId = (0, src_1.getUnqualifiedSchemaId)(parsed.namespaceIdentifier, parsed.schemaName, parsed.schemaVersion);
            const indyLedgerSeqNo = getSeqNoFromSchemaId(legacySchemaId);
            if (!schema) {
                return {
                    resolutionMetadata: {
                        error: 'notFound',
                        message: `Schema with id ${schemaId} not found in memory registry`,
                    },
                    schemaId,
                    schemaMetadata: {},
                };
            }
            return {
                resolutionMetadata: {},
                schema,
                schemaId,
                schemaMetadata: {
                    // NOTE: the seqNo is required by the indy-sdk even though not present in AnonCreds v1.
                    // For this reason we return it in the metadata.
                    indyLedgerSeqNo,
                },
            };
        });
    }
    registerSchema(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { namespace, namespaceIdentifier } = (0, src_1.parseIndyDid)(options.schema.issuerId);
            const legacyIssuerId = namespaceIdentifier;
            const didIndySchemaId = (0, identifiers_1.getDidIndySchemaId)(namespace, namespaceIdentifier, options.schema.name, options.schema.version);
            this.schemas[didIndySchemaId] = options.schema;
            const legacySchemaId = (0, src_1.getUnqualifiedSchemaId)(legacyIssuerId, options.schema.name, options.schema.version);
            const indyLedgerSeqNo = getSeqNoFromSchemaId(legacySchemaId);
            this.schemas[legacySchemaId] = Object.assign(Object.assign({}, options.schema), { issuerId: legacyIssuerId });
            return {
                registrationMetadata: {},
                schemaMetadata: {
                    // NOTE: the seqNo is required by the indy-sdk even though not present in AnonCreds v1.
                    // For this reason we return it in the metadata.
                    indyLedgerSeqNo,
                },
                schemaState: {
                    state: 'finished',
                    schema: options.schema,
                    schemaId: didIndySchemaId,
                },
            };
        });
    }
    getCredentialDefinition(agentContext, credentialDefinitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const credentialDefinition = this.credentialDefinitions[credentialDefinitionId];
            if (!credentialDefinition) {
                return {
                    resolutionMetadata: {
                        error: 'notFound',
                        message: `Credential definition with id ${credentialDefinitionId} not found in memory registry`,
                    },
                    credentialDefinitionId,
                    credentialDefinitionMetadata: {},
                };
            }
            return {
                resolutionMetadata: {},
                credentialDefinition,
                credentialDefinitionId,
                credentialDefinitionMetadata: {},
            };
        });
    }
    registerCredentialDefinition(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsedSchema = (0, src_1.parseIndySchemaId)(options.credentialDefinition.schemaId);
            const legacySchemaId = (0, src_1.getUnqualifiedSchemaId)(parsedSchema.namespaceIdentifier, parsedSchema.schemaName, parsedSchema.schemaVersion);
            const indyLedgerSeqNo = getSeqNoFromSchemaId(legacySchemaId);
            const { namespace, namespaceIdentifier } = (0, src_1.parseIndyDid)(options.credentialDefinition.issuerId);
            const legacyIssuerId = namespaceIdentifier;
            const didIndyCredentialDefinitionId = (0, identifiers_1.getDidIndyCredentialDefinitionId)(namespace, namespaceIdentifier, indyLedgerSeqNo, options.credentialDefinition.tag);
            this.credentialDefinitions[didIndyCredentialDefinitionId] = options.credentialDefinition;
            const legacyCredentialDefinitionId = (0, src_1.getUnqualifiedCredentialDefinitionId)(legacyIssuerId, indyLedgerSeqNo, options.credentialDefinition.tag);
            this.credentialDefinitions[legacyCredentialDefinitionId] = Object.assign(Object.assign({}, options.credentialDefinition), { issuerId: legacyIssuerId, schemaId: legacySchemaId });
            return {
                registrationMetadata: {},
                credentialDefinitionMetadata: {},
                credentialDefinitionState: {
                    state: 'finished',
                    credentialDefinition: options.credentialDefinition,
                    credentialDefinitionId: didIndyCredentialDefinitionId,
                },
            };
        });
    }
    getRevocationRegistryDefinition(agentContext, revocationRegistryDefinitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const revocationRegistryDefinition = this.revocationRegistryDefinitions[revocationRegistryDefinitionId];
            if (!revocationRegistryDefinition) {
                return {
                    resolutionMetadata: {
                        error: 'notFound',
                        message: `Revocation registry definition with id ${revocationRegistryDefinition} not found in memory registry`,
                    },
                    revocationRegistryDefinitionId,
                    revocationRegistryDefinitionMetadata: {},
                };
            }
            return {
                resolutionMetadata: {},
                revocationRegistryDefinition,
                revocationRegistryDefinitionId,
                revocationRegistryDefinitionMetadata: {},
            };
        });
    }
    getRevocationStatusList(agentContext, revocationRegistryId, timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            const revocationStatusLists = this.revocationStatusLists[revocationRegistryId];
            if (!revocationStatusLists || !revocationStatusLists[timestamp]) {
                return {
                    resolutionMetadata: {
                        error: 'notFound',
                        message: `Revocation status list for revocation registry with id ${revocationRegistryId} not found in memory registry`,
                    },
                    revocationStatusListMetadata: {},
                };
            }
            return {
                resolutionMetadata: {},
                revocationStatusList: revocationStatusLists[timestamp],
                revocationStatusListMetadata: {},
            };
        });
    }
}
exports.InMemoryAnonCredsRegistry = InMemoryAnonCredsRegistry;
/**
 * Calculates a consistent sequence number for a given schema id.
 *
 * Does this by hashing the schema id, transforming the hash to a number and taking the first 6 digits.
 */
function getSeqNoFromSchemaId(schemaId) {
    const seqNo = Number(new bn_js_1.default(core_1.Hasher.hash(core_1.TypedArrayEncoder.fromString(schemaId), 'sha2-256')).toString().slice(0, 5));
    return seqNo;
}
