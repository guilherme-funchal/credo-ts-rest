"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anonCredsSchemaFromIndySdk = anonCredsSchemaFromIndySdk;
exports.indySdkSchemaFromAnonCreds = indySdkSchemaFromAnonCreds;
exports.anonCredsCredentialDefinitionFromIndySdk = anonCredsCredentialDefinitionFromIndySdk;
exports.indySdkCredentialDefinitionFromAnonCreds = indySdkCredentialDefinitionFromAnonCreds;
exports.indySdkRevocationRegistryDefinitionFromAnonCreds = indySdkRevocationRegistryDefinitionFromAnonCreds;
exports.anonCredsRevocationStatusListFromIndySdk = anonCredsRevocationStatusListFromIndySdk;
exports.indySdkRevocationRegistryFromAnonCreds = indySdkRevocationRegistryFromAnonCreds;
exports.indySdkRevocationDeltaFromAnonCreds = indySdkRevocationDeltaFromAnonCreds;
exports.anonCredsCredentialRequestMetadataFromIndySdk = anonCredsCredentialRequestMetadataFromIndySdk;
exports.indySdkCredentialRequestMetadataFromAnonCreds = indySdkCredentialRequestMetadataFromAnonCreds;
const anoncreds_1 = require("@aries-framework/anoncreds");
function anonCredsSchemaFromIndySdk(schema) {
    const { did } = (0, anoncreds_1.parseIndySchemaId)(schema.id);
    return {
        issuerId: did,
        name: schema.name,
        version: schema.version,
        attrNames: schema.attrNames,
    };
}
function indySdkSchemaFromAnonCreds(schemaId, schema, indyLedgerSeqNo) {
    return {
        id: schemaId,
        attrNames: schema.attrNames,
        name: schema.name,
        version: schema.version,
        ver: '1.0',
        seqNo: indyLedgerSeqNo,
    };
}
function anonCredsCredentialDefinitionFromIndySdk(credentialDefinition) {
    const { did } = (0, anoncreds_1.parseIndyCredentialDefinitionId)(credentialDefinition.id);
    return {
        issuerId: did,
        schemaId: credentialDefinition.schemaId,
        tag: credentialDefinition.tag,
        type: 'CL',
        value: credentialDefinition.value,
    };
}
function indySdkCredentialDefinitionFromAnonCreds(credentialDefinitionId, credentialDefinition) {
    return {
        id: credentialDefinitionId,
        schemaId: credentialDefinition.schemaId,
        tag: credentialDefinition.tag,
        type: credentialDefinition.type,
        value: credentialDefinition.value,
        ver: '1.0',
    };
}
function indySdkRevocationRegistryDefinitionFromAnonCreds(revocationRegistryDefinitionId, revocationRegistryDefinition) {
    return {
        id: revocationRegistryDefinitionId,
        credDefId: revocationRegistryDefinition.credDefId,
        revocDefType: revocationRegistryDefinition.revocDefType,
        tag: revocationRegistryDefinition.tag,
        value: {
            issuanceType: 'ISSUANCE_BY_DEFAULT', // NOTE: we always use ISSUANCE_BY_DEFAULT when passing to the indy-sdk. It doesn't matter, as we have the revocation List with the full state
            maxCredNum: revocationRegistryDefinition.value.maxCredNum,
            publicKeys: revocationRegistryDefinition.value.publicKeys,
            tailsHash: revocationRegistryDefinition.value.tailsHash,
            tailsLocation: revocationRegistryDefinition.value.tailsLocation,
        },
        ver: '1.0',
    };
}
function anonCredsRevocationStatusListFromIndySdk(revocationRegistryDefinitionId, revocationRegistryDefinition, delta, timestamp, isIssuanceByDefault) {
    var _a, _b;
    // 0 means unrevoked, 1 means revoked
    const defaultState = isIssuanceByDefault ? 0 : 1;
    // Fill with default value
    const revocationList = new Array(revocationRegistryDefinition.value.maxCredNum).fill(defaultState);
    // Set all `issuer` indexes to 0 (not revoked)
    for (const issued of (_a = delta.value.issued) !== null && _a !== void 0 ? _a : []) {
        revocationList[issued] = 0;
    }
    // Set all `revoked` indexes to 1 (revoked)
    for (const revoked of (_b = delta.value.revoked) !== null && _b !== void 0 ? _b : []) {
        revocationList[revoked] = 1;
    }
    return {
        issuerId: revocationRegistryDefinition.issuerId,
        currentAccumulator: delta.value.accum,
        revRegDefId: revocationRegistryDefinitionId,
        revocationList,
        timestamp,
    };
}
function indySdkRevocationRegistryFromAnonCreds(revocationStatusList) {
    return {
        ver: '1.0',
        value: {
            accum: revocationStatusList.currentAccumulator,
        },
    };
}
function indySdkRevocationDeltaFromAnonCreds(revocationStatusList) {
    // Get all indices from the revocationStatusList that are revoked (so have value '1')
    const revokedIndices = revocationStatusList.revocationList.reduce((revoked, current, index) => (current === 1 ? [...revoked, index] : revoked), []);
    return {
        value: {
            accum: revocationStatusList.currentAccumulator,
            issued: [],
            revoked: revokedIndices,
            // NOTE: this must be a valid accumulator but it's not actually used. So we set it to the
            // currentAccumulator as that should always be a valid accumulator.
            prevAccum: revocationStatusList.currentAccumulator,
        },
        ver: '1.0',
    };
}
function anonCredsCredentialRequestMetadataFromIndySdk(credentialRequestMetadata) {
    return {
        link_secret_blinding_data: credentialRequestMetadata.master_secret_blinding_data,
        link_secret_name: credentialRequestMetadata.master_secret_name,
        nonce: credentialRequestMetadata.nonce,
    };
}
function indySdkCredentialRequestMetadataFromAnonCreds(credentialRequestMetadata) {
    return {
        master_secret_blinding_data: credentialRequestMetadata.link_secret_blinding_data,
        master_secret_name: credentialRequestMetadata.link_secret_name,
        nonce: credentialRequestMetadata.nonce,
    };
}
