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
exports.CheqdAnonCredsRegistry = void 0;
const core_1 = require("@aries-framework/core");
const dids_1 = require("../../dids");
const identifiers_1 = require("../utils/identifiers");
const transform_1 = require("../utils/transform");
class CheqdAnonCredsRegistry {
    constructor() {
        this.methodName = 'cheqd';
        /**
         * This class supports resolving and registering objects with cheqd identifiers.
         * It needs to include support for the schema, credential definition, revocation registry as well
         * as the issuer id (which is needed when registering objects).
         */
        this.supportedIdentifier = identifiers_1.cheqdSdkAnonCredsRegistryIdentifierRegex;
    }
    getSchema(agentContext, schemaId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cheqdDidResolver = agentContext.dependencyManager.resolve(dids_1.CheqdDidResolver);
                const parsedDid = (0, identifiers_1.parseCheqdDid)(schemaId);
                if (!parsedDid) {
                    throw new Error(`Invalid schemaId: ${schemaId}`);
                }
                agentContext.config.logger.trace(`Submitting get schema request for schema '${schemaId}' to ledger`);
                const response = yield cheqdDidResolver.resolveResource(agentContext, schemaId);
                const schema = core_1.JsonTransformer.fromJSON(response.resource, transform_1.CheqdSchema);
                return {
                    schema: {
                        attrNames: schema.attrNames,
                        name: schema.name,
                        version: schema.version,
                        issuerId: parsedDid.did,
                    },
                    schemaId,
                    resolutionMetadata: {},
                    schemaMetadata: {},
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
                        message: `unable to resolve schema: ${error.message}`,
                    },
                    schemaMetadata: {},
                };
            }
        });
    }
    registerSchema(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cheqdDidRegistrar = agentContext.dependencyManager.resolve(dids_1.CheqdDidRegistrar);
                const schema = options.schema;
                const schemaResource = {
                    id: core_1.utils.uuid(),
                    name: `${schema.name}-Schema`,
                    resourceType: 'anonCredsSchema',
                    data: {
                        name: schema.name,
                        version: schema.version,
                        attrNames: schema.attrNames,
                    },
                    version: schema.version,
                };
                const response = yield cheqdDidRegistrar.createResource(agentContext, schema.issuerId, schemaResource);
                if (response.resourceState.state !== 'finished') {
                    throw new Error(response.resourceState.reason);
                }
                return {
                    schemaState: {
                        state: 'finished',
                        schema,
                        schemaId: `${schema.issuerId}/resources/${schemaResource.id}`,
                    },
                    registrationMetadata: {},
                    schemaMetadata: {},
                };
            }
            catch (error) {
                agentContext.config.logger.debug(`Error registering schema for did '${options.schema.issuerId}'`, {
                    error,
                    did: options.schema.issuerId,
                    schema: options,
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
    registerCredentialDefinition(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cheqdDidRegistrar = agentContext.dependencyManager.resolve(dids_1.CheqdDidRegistrar);
                const { credentialDefinition } = options;
                const schema = yield this.getSchema(agentContext, credentialDefinition.schemaId);
                if (!schema.schema) {
                    throw new Error(`Schema not found for schemaId: ${credentialDefinition.schemaId}`);
                }
                const credDefName = `${schema.schema.name}-${credentialDefinition.tag}`;
                const credDefNameHashBuffer = core_1.Hasher.hash(core_1.Buffer.from(credDefName), 'sha2-256');
                const credDefResource = {
                    id: core_1.utils.uuid(),
                    name: core_1.TypedArrayEncoder.toHex(credDefNameHashBuffer),
                    resourceType: 'anonCredsCredDef',
                    data: {
                        type: credentialDefinition.type,
                        tag: credentialDefinition.tag,
                        value: credentialDefinition.value,
                        schemaId: credentialDefinition.schemaId,
                    },
                    version: core_1.utils.uuid(),
                };
                const response = yield cheqdDidRegistrar.createResource(agentContext, credentialDefinition.issuerId, credDefResource);
                if (response.resourceState.state !== 'finished') {
                    throw new Error(response.resourceState.reason);
                }
                return {
                    credentialDefinitionState: {
                        state: 'finished',
                        credentialDefinition,
                        credentialDefinitionId: `${credentialDefinition.issuerId}/resources/${credDefResource.id}`,
                    },
                    registrationMetadata: {},
                    credentialDefinitionMetadata: {},
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error registering credential definition for did '${options.credentialDefinition.issuerId}'`, {
                    error,
                    did: options.credentialDefinition.issuerId,
                    schema: options,
                });
                return {
                    credentialDefinitionMetadata: {},
                    registrationMetadata: {},
                    credentialDefinitionState: {
                        state: 'failed',
                        credentialDefinition: options.credentialDefinition,
                        reason: `unknownError: ${error.message}`,
                    },
                };
            }
        });
    }
    getCredentialDefinition(agentContext, credentialDefinitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const cheqdDidResolver = agentContext.dependencyManager.resolve(dids_1.CheqdDidResolver);
                const parsedDid = (0, identifiers_1.parseCheqdDid)(credentialDefinitionId);
                if (!parsedDid) {
                    throw new Error(`Invalid credentialDefinitionId: ${credentialDefinitionId}`);
                }
                agentContext.config.logger.trace(`Submitting get credential definition request for '${credentialDefinitionId}' to ledger`);
                const response = yield cheqdDidResolver.resolveResource(agentContext, credentialDefinitionId);
                const credentialDefinition = core_1.JsonTransformer.fromJSON(response.resource, transform_1.CheqdCredentialDefinition);
                return {
                    credentialDefinition: Object.assign(Object.assign({}, credentialDefinition), { issuerId: parsedDid.did }),
                    credentialDefinitionId,
                    resolutionMetadata: {},
                    credentialDefinitionMetadata: ((_a = response.resourceMetadata) !== null && _a !== void 0 ? _a : {}),
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error retrieving credential definition '${credentialDefinitionId}'`, {
                    error,
                    credentialDefinitionId,
                });
                return {
                    credentialDefinitionId,
                    resolutionMetadata: {
                        error: 'notFound',
                        message: `unable to resolve credential definition: ${error.message}`,
                    },
                    credentialDefinitionMetadata: {},
                };
            }
        });
    }
    getRevocationRegistryDefinition(agentContext, revocationRegistryDefinitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const cheqdDidResolver = agentContext.dependencyManager.resolve(dids_1.CheqdDidResolver);
                const parsedDid = (0, identifiers_1.parseCheqdDid)(revocationRegistryDefinitionId);
                if (!parsedDid) {
                    throw new Error(`Invalid revocationRegistryDefinitionId: ${revocationRegistryDefinitionId}`);
                }
                agentContext.config.logger.trace(`Submitting get revocation registry definition request for '${revocationRegistryDefinitionId}' to ledger`);
                const response = yield cheqdDidResolver.resolveResource(agentContext, `${revocationRegistryDefinitionId}&resourceType=anonCredsRevocRegDef`);
                const revocationRegistryDefinition = core_1.JsonTransformer.fromJSON(response.resource, transform_1.CheqdRevocationRegistryDefinition);
                return {
                    revocationRegistryDefinition: Object.assign(Object.assign({}, revocationRegistryDefinition), { issuerId: parsedDid.did }),
                    revocationRegistryDefinitionId,
                    resolutionMetadata: {},
                    revocationRegistryDefinitionMetadata: ((_a = response.resourceMetadata) !== null && _a !== void 0 ? _a : {}),
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error retrieving revocation registry definition '${revocationRegistryDefinitionId}'`, {
                    error,
                    revocationRegistryDefinitionId,
                });
                return {
                    revocationRegistryDefinitionId,
                    resolutionMetadata: {
                        error: 'notFound',
                        message: `unable to resolve revocation registry definition: ${error.message}`,
                    },
                    revocationRegistryDefinitionMetadata: {},
                };
            }
        });
    }
    // FIXME: this method doesn't retrieve the revocation status list at a specified time, it just resolves the revocation registry definition
    getRevocationStatusList(agentContext, revocationRegistryId, timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const cheqdDidResolver = agentContext.dependencyManager.resolve(dids_1.CheqdDidResolver);
                const parsedDid = (0, identifiers_1.parseCheqdDid)(revocationRegistryId);
                if (!parsedDid) {
                    throw new Error(`Invalid revocationRegistryId: ${revocationRegistryId}`);
                }
                agentContext.config.logger.trace(`Submitting get revocation status request for '${revocationRegistryId}' to ledger`);
                const response = yield cheqdDidResolver.resolveResource(agentContext, `${revocationRegistryId}&resourceType=anonCredsStatusList&resourceVersionTime=${timestamp}`);
                const revocationStatusList = core_1.JsonTransformer.fromJSON(response.resource, transform_1.CheqdRevocationStatusList);
                const statusListTimestamp = (_b = (_a = response.resourceMetadata) === null || _a === void 0 ? void 0 : _a.created) === null || _b === void 0 ? void 0 : _b.getUTCSeconds();
                if (!statusListTimestamp) {
                    throw new core_1.AriesFrameworkError(`Unable to extract revocation status list timestamp from resource ${revocationRegistryId}`);
                }
                return {
                    revocationStatusList: Object.assign(Object.assign({}, revocationStatusList), { issuerId: parsedDid.did, timestamp: statusListTimestamp }),
                    resolutionMetadata: {},
                    revocationStatusListMetadata: ((_c = response.resourceMetadata) !== null && _c !== void 0 ? _c : {}),
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error retrieving revocation registry status list '${revocationRegistryId}'`, {
                    error,
                    revocationRegistryId,
                });
                return {
                    resolutionMetadata: {
                        error: 'notFound',
                        message: `unable to resolve revocation registry status list: ${error.message}`,
                    },
                    revocationStatusListMetadata: {},
                };
            }
        });
    }
}
exports.CheqdAnonCredsRegistry = CheqdAnonCredsRegistry;
