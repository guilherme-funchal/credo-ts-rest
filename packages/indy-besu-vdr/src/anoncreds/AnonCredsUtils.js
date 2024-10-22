"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSchemaId = buildSchemaId;
exports.buildCredentialDefinitionId = buildCredentialDefinitionId;
function buildSchemaId(schema) {
    return `${schema.issuerId}/anoncreds/v0/SCHEMA/${schema.name}/${schema.version}`;
}
function buildCredentialDefinitionId(credentialDefinition) {
    return `${credentialDefinition.issuerId}/anoncreds/v0/CLAIM_DEF/${credentialDefinition.schemaId}/${credentialDefinition.tag}`;
}
