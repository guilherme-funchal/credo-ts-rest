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
exports.IndyBesuAnonCredsRegistry = void 0;
const core_1 = require("@credo-ts/core");
const ledger_1 = require("../ledger");
const AnonCredsUtils_1 = require("./AnonCredsUtils");
const Trasformers_1 = require("./Trasformers");
class IndyBesuAnonCredsRegistry {
    constructor() {
        this.methodName = 'indy2';
        this.supportedIdentifier = new RegExp('');
    }
    getSchema(agentContext, schemaId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schemaRegistry = agentContext.dependencyManager.resolve(ledger_1.SchemaRegistry);
                const schema = (yield schemaRegistry.resolveSchema(schemaId));
                return {
                    schema,
                    schemaId,
                    resolutionMetadata: {},
                    schemaMetadata: {},
                };
            }
            catch (error) {
                return {
                    schemaId,
                    resolutionMetadata: {
                        error: 'unknownError',
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
                const schemaRegistry = agentContext.dependencyManager.resolve(ledger_1.SchemaRegistry);
                const signer = new ledger_1.IndyBesuSigner(options.options.accountKey, agentContext.wallet);
                const schemaId = (0, AnonCredsUtils_1.buildSchemaId)(options.schema);
                yield schemaRegistry.createSchema(schemaId, options.schema, signer);
                return {
                    schemaState: {
                        state: 'finished',
                        schema: options.schema,
                        schemaId: schemaId,
                    },
                    registrationMetadata: {},
                    schemaMetadata: {},
                };
            }
            catch (error) {
                return {
                    schemaMetadata: {},
                    registrationMetadata: {},
                    schemaState: {
                        state: 'failed',
                        schema: options.schema,
                        reason: `Faield registering schema: ${error.message}`,
                    },
                };
            }
        });
    }
    getCredentialDefinition(agentContext, credentialDefinitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const credentialDefinitionRegistry = agentContext.dependencyManager.resolve(ledger_1.CredentialDefinitionRegistry);
                const credentialDefinition = yield credentialDefinitionRegistry.resolveCredentialDefinition(credentialDefinitionId);
                return {
                    credentialDefinition: {
                        issuerId: credentialDefinition.issuerId,
                        schemaId: credentialDefinition.schemaId,
                        type: 'CL',
                        tag: credentialDefinition.tag,
                        value: core_1.JsonTransformer.deserialize(credentialDefinition.value, Trasformers_1.CredentialDefinitionValue),
                    },
                    credentialDefinitionId,
                    resolutionMetadata: {},
                    credentialDefinitionMetadata: {},
                };
            }
            catch (error) {
                return {
                    credentialDefinitionId,
                    resolutionMetadata: {
                        error: 'unknownError',
                        message: `unable to resolve credential definition: ${error.message}`,
                    },
                    credentialDefinitionMetadata: {},
                };
            }
        });
    }
    registerCredentialDefinition(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const credentialDefinitionRegistry = agentContext.dependencyManager.resolve(ledger_1.CredentialDefinitionRegistry);
                const createCredentialDefinition = options.credentialDefinition;
                const schema = yield this.getSchema(agentContext, createCredentialDefinition.schemaId);
                if (!schema.schema) {
                    throw new core_1.CredoError(`Schema not found for schemaId: ${createCredentialDefinition.schemaId}`);
                }
                const signer = new ledger_1.IndyBesuSigner(options.options.accountKey, agentContext.wallet);
                const createCredentialDefinitionId = (0, AnonCredsUtils_1.buildCredentialDefinitionId)(createCredentialDefinition);
                yield credentialDefinitionRegistry.createCredentialDefinition(createCredentialDefinitionId, {
                    issuerId: createCredentialDefinition.issuerId,
                    schemaId: createCredentialDefinition.schemaId,
                    credDefType: 'CL',
                    tag: createCredentialDefinition.tag,
                    value: core_1.JsonTransformer.serialize(createCredentialDefinition.value),
                }, signer);
                return {
                    credentialDefinitionState: {
                        state: 'finished',
                        credentialDefinition: options.credentialDefinition,
                        credentialDefinitionId: createCredentialDefinitionId,
                    },
                    registrationMetadata: {},
                    credentialDefinitionMetadata: {},
                };
            }
            catch (error) {
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
    getRevocationRegistryDefinition(agentContext, revocationRegistryDefinitionId) {
        throw new Error('Method not implemented.');
    }
    getRevocationStatusList(agentContext, revocationRegistryId, timestamp) {
        throw new Error('Method not implemented.');
    }
}
exports.IndyBesuAnonCredsRegistry = IndyBesuAnonCredsRegistry;
