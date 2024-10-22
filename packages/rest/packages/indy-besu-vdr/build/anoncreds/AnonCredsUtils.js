"use strict";
exports.__esModule = true;
exports.buildCredentialDefinitionId = exports.buildSchemaId = void 0;
function buildSchemaId(schema) {
    return "".concat(schema.issuerId, "/anoncreds/v0/SCHEMA/").concat(schema.name, "/").concat(schema.version);
}
exports.buildSchemaId = buildSchemaId;
function buildCredentialDefinitionId(credentialDefinition) {
    return "".concat(credentialDefinition.issuerId, "/anoncreds/v0/CLAIM_DEF/").concat(credentialDefinition.schemaId, "/").concat(credentialDefinition.tag);
}
exports.buildCredentialDefinitionId = buildCredentialDefinitionId;
