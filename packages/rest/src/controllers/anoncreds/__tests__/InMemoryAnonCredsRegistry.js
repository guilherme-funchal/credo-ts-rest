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
exports.InMemoryAnonCredsRegistry = void 0;
const core_1 = require("@credo-ts/core");
class InMemoryAnonCredsRegistry {
    constructor({ schemas, credentialDefinitions, } = {}) {
        this.methodName = 'inMemory';
        this.supportedIdentifier = /.+:.+/;
        this.schemas = {};
        this.credentialDefinitions = {};
        if (schemas)
            this.schemas = schemas;
        if (credentialDefinitions)
            this.credentialDefinitions = credentialDefinitions;
    }
    getSchema(agentContext, schemaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.schemas[schemaId];
            if (!schema) {
                return {
                    schemaId,
                    resolutionMetadata: {
                        error: 'notFound',
                        message: 'Schema not found',
                    },
                    schemaMetadata: {},
                };
            }
            return {
                schemaId,
                schema,
                resolutionMetadata: {},
                schemaMetadata: {},
            };
        });
    }
    registerSchema(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const schemaHash = core_1.TypedArrayEncoder.toBase64URL(core_1.Hasher.hash(`${options.schema.issuerId}-${options.schema.name}-${options.schema.version}`, 'sha-256'));
            const schemaId = `schema:${schemaHash}`;
            this.schemas[schemaId] = options.schema;
            return {
                registrationMetadata: {},
                schemaMetadata: {},
                schemaState: {
                    state: 'finished',
                    schemaId,
                    schema: options.schema,
                },
            };
        });
    }
    getCredentialDefinition(agentContext, credentialDefinitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const credentialDefinition = this.credentialDefinitions[credentialDefinitionId];
            if (!credentialDefinition) {
                return {
                    credentialDefinitionId,
                    resolutionMetadata: {
                        error: 'notFound',
                        message: 'Credential definition not found',
                    },
                    credentialDefinitionMetadata: {},
                };
            }
            return {
                credentialDefinitionId,
                credentialDefinition,
                resolutionMetadata: {},
                credentialDefinitionMetadata: {},
            };
        });
    }
    registerCredentialDefinition(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const credentialDefinitionHash = core_1.TypedArrayEncoder.toBase64URL(core_1.Hasher.hash(`${options.credentialDefinition.issuerId}-${options.credentialDefinition.schemaId}-${options.credentialDefinition.tag}`, 'sha-256'));
            const credentialDefinitionId = `credential-definition:${credentialDefinitionHash}`;
            this.credentialDefinitions[credentialDefinitionId] = options.credentialDefinition;
            return {
                registrationMetadata: {},
                credentialDefinitionMetadata: {},
                credentialDefinitionState: {
                    state: 'finished',
                    credentialDefinitionId,
                    credentialDefinition: options.credentialDefinition,
                },
            };
        });
    }
    getRevocationRegistryDefinition() {
        throw new Error('Method not implemented.');
    }
    registerRevocationRegistryDefinition() {
        throw new Error('Method not implemented.');
    }
    getRevocationStatusList() {
        throw new Error('Method not implemented.');
    }
    registerRevocationStatusList() {
        throw new Error('Method not implemented.');
    }
}
exports.InMemoryAnonCredsRegistry = InMemoryAnonCredsRegistry;
