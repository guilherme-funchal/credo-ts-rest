"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertUnqualifiedCredentialDefinitionId = assertUnqualifiedCredentialDefinitionId;
exports.assertUnqualifiedSchemaId = assertUnqualifiedSchemaId;
exports.assertUnqualifiedRevocationRegistryId = assertUnqualifiedRevocationRegistryId;
exports.assertUnqualifiedIssuerId = assertUnqualifiedIssuerId;
exports.assertUnqualifiedCredentialOffer = assertUnqualifiedCredentialOffer;
exports.assertUnqualifiedCredentialRequest = assertUnqualifiedCredentialRequest;
exports.assertUnqualifiedProofRequest = assertUnqualifiedProofRequest;
exports.assertAllUnqualified = assertAllUnqualified;
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
/**
 * Assert that a credential definition id is unqualified.
 */
function assertUnqualifiedCredentialDefinitionId(credentialDefinitionId) {
    if (!anoncreds_1.unqualifiedCredentialDefinitionIdRegex.test(credentialDefinitionId)) {
        throw new core_1.AriesFrameworkError(`Credential definition id '${credentialDefinitionId}' is not an unqualified credential definition id. Indy SDK only supports unqualified identifiers.`);
    }
}
/**
 * Assert that a schema id is unqualified.
 */
function assertUnqualifiedSchemaId(schemaId) {
    if (!anoncreds_1.unqualifiedSchemaIdRegex.test(schemaId)) {
        throw new core_1.AriesFrameworkError(`Schema id '${schemaId}' is not an unqualified schema id. Indy SDK only supports unqualified identifiers.`);
    }
}
/**
 * Assert that a revocation registry id is unqualified.
 */
function assertUnqualifiedRevocationRegistryId(revocationRegistryId) {
    if (!anoncreds_1.unqualifiedRevocationRegistryIdRegex.test(revocationRegistryId)) {
        throw new core_1.AriesFrameworkError(`Revocation registry id '${revocationRegistryId}' is not an unqualified revocation registry id. Indy SDK only supports unqualified identifiers.`);
    }
}
/**
 * Assert that an issuer id is unqualified.
 */
function assertUnqualifiedIssuerId(issuerId) {
    if (!anoncreds_1.unqualifiedIndyDidRegex.test(issuerId)) {
        throw new core_1.AriesFrameworkError(`Issuer id '${issuerId}' is not an unqualified issuer id. Indy SDK only supports unqualified identifiers.`);
    }
}
/**
 * Assert that a credential offer only contains unqualified identifiers.
 */
function assertUnqualifiedCredentialOffer(credentialOffer) {
    assertUnqualifiedCredentialDefinitionId(credentialOffer.cred_def_id);
    assertUnqualifiedSchemaId(credentialOffer.schema_id);
}
/**
 * Assert that a credential request only contains unqualified identifiers.
 */
function assertUnqualifiedCredentialRequest(credentialRequest) {
    assertUnqualifiedCredentialDefinitionId(credentialRequest.cred_def_id);
}
/**
 * Assert that a proof request only contains unqualified identifiers.
 */
function assertUnqualifiedProofRequest(proofRequest) {
    var _a;
    const allRequested = [
        ...Object.values(proofRequest.requested_attributes),
        ...Object.values(proofRequest.requested_predicates),
    ];
    for (const requested of allRequested) {
        for (const restriction of (_a = requested.restrictions) !== null && _a !== void 0 ? _a : []) {
            assertAllUnqualified({
                credentialDefinitionIds: [restriction.cred_def_id],
                schemaIds: [restriction.schema_id],
                revocationRegistryIds: [restriction.rev_reg_id],
                issuerIds: [restriction.issuer_did, restriction.schema_issuer_did],
            });
        }
    }
}
function assertAllUnqualified({ schemaIds = [], credentialDefinitionIds = [], revocationRegistryIds = [], issuerIds = [], }) {
    for (const schemaId of schemaIds) {
        // We don't validate undefined values
        if (!schemaId)
            continue;
        assertUnqualifiedSchemaId(schemaId);
    }
    for (const credentialDefinitionId of credentialDefinitionIds) {
        // We don't validate undefined values
        if (!credentialDefinitionId)
            continue;
        assertUnqualifiedCredentialDefinitionId(credentialDefinitionId);
    }
    for (const revocationRegistryId of revocationRegistryIds) {
        // We don't validate undefined values
        if (!revocationRegistryId)
            continue;
        assertUnqualifiedRevocationRegistryId(revocationRegistryId);
    }
    for (const issuerId of issuerIds) {
        // We don't validate undefined values
        if (!issuerId)
            continue;
        assertUnqualifiedIssuerId(issuerId);
    }
}
