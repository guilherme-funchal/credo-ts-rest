"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.didIndyRegex = exports.didIndyRevocationRegistryIdRegex = exports.unqualifiedRevocationRegistryIdRegex = exports.didIndyCredentialDefinitionIdRegex = exports.unqualifiedCredentialDefinitionIdRegex = exports.unqualifiedIndyDidRegex = exports.unqualifiedSchemaVersionRegex = exports.didIndySchemaIdRegex = exports.unqualifiedSchemaIdRegex = void 0;
exports.getUnqualifiedSchemaId = getUnqualifiedSchemaId;
exports.getUnqualifiedCredentialDefinitionId = getUnqualifiedCredentialDefinitionId;
exports.getUnqualifiedRevocationRegistryId = getUnqualifiedRevocationRegistryId;
exports.isUnqualifiedCredentialDefinitionId = isUnqualifiedCredentialDefinitionId;
exports.isUnqualifiedRevocationRegistryId = isUnqualifiedRevocationRegistryId;
exports.isUnqualifiedSchemaId = isUnqualifiedSchemaId;
exports.isDidIndySchemaId = isDidIndySchemaId;
exports.isDidIndyCredentialDefinitionId = isDidIndyCredentialDefinitionId;
exports.isDidIndyRevocationRegistryId = isDidIndyRevocationRegistryId;
exports.parseIndyDid = parseIndyDid;
exports.parseIndySchemaId = parseIndySchemaId;
exports.parseIndyCredentialDefinitionId = parseIndyCredentialDefinitionId;
exports.parseIndyRevocationRegistryId = parseIndyRevocationRegistryId;
const core_1 = require("@aries-framework/core");
const didIndyAnonCredsBase = /(did:indy:((?:[a-z][_a-z0-9-]*)(?::[a-z][_a-z0-9-]*)?):([1-9A-HJ-NP-Za-km-z]{21,22}))\/anoncreds\/v0/;
// <namespaceIdentifier>:2:<schemaName>:<schemaVersion>
exports.unqualifiedSchemaIdRegex = /^([a-zA-Z0-9]{21,22}):2:(.+):([0-9.]+)$/;
// did:indy:<namespace>:<namespaceIdentifier>/anoncreds/v0/SCHEMA/<schemaName>/<schemaVersion>
exports.didIndySchemaIdRegex = new RegExp(`^${didIndyAnonCredsBase.source}/SCHEMA/(.+)/([0-9.]+)$`);
exports.unqualifiedSchemaVersionRegex = /^(\d+\.)?(\d+\.)?(\*|\d+)$/;
exports.unqualifiedIndyDidRegex = /^(did:sov:)?[a-zA-Z0-9]{21,22}$/;
// <namespaceIdentifier>:3:CL:<schemaSeqNo>:<tag>
exports.unqualifiedCredentialDefinitionIdRegex = /^([a-zA-Z0-9]{21,22}):3:CL:([1-9][0-9]*):(.+)$/;
// did:indy:<namespace>:<namespaceIdentifier>/anoncreds/v0/CLAIM_DEF/<schemaSeqNo>/<tag>
exports.didIndyCredentialDefinitionIdRegex = new RegExp(`^${didIndyAnonCredsBase.source}/CLAIM_DEF/([1-9][0-9]*)/(.+)$`);
// <namespaceIdentifier>:4:<schemaSeqNo>:3:CL:<credentialDefinitionTag>:CL_ACCUM:<revocationRegistryTag>
exports.unqualifiedRevocationRegistryIdRegex = /^([a-zA-Z0-9]{21,22}):4:[a-zA-Z0-9]{21,22}:3:CL:([1-9][0-9]*):(.+):CL_ACCUM:(.+)$/;
// did:indy:<namespace>:<namespaceIdentifier>/anoncreds/v0/REV_REG_DEF/<schemaSeqNo>/<credentialDefinitionTag>/<revocationRegistryTag>
exports.didIndyRevocationRegistryIdRegex = new RegExp(`^${didIndyAnonCredsBase.source}/REV_REG_DEF/([1-9][0-9]*)/(.+)/(.+)$`);
exports.didIndyRegex = /^did:indy:((?:[a-z][_a-z0-9-]*)(?::[a-z][_a-z0-9-]*)?):([1-9A-HJ-NP-Za-km-z]{21,22})$/;
function getUnqualifiedSchemaId(unqualifiedDid, name, version) {
    return `${unqualifiedDid}:2:${name}:${version}`;
}
function getUnqualifiedCredentialDefinitionId(unqualifiedDid, seqNo, tag) {
    return `${unqualifiedDid}:3:CL:${seqNo}:${tag}`;
}
// TZQuLp43UcYTdtc3HewcDz:4:TZQuLp43UcYTdtc3HewcDz:3:CL:98158:BaustellenzertifikateNU1:CL_ACCUM:1-100
function getUnqualifiedRevocationRegistryId(unqualifiedDid, seqNo, credentialDefinitionTag, revocationRegistryTag) {
    return `${unqualifiedDid}:4:${unqualifiedDid}:3:CL:${seqNo}:${credentialDefinitionTag}:CL_ACCUM:${revocationRegistryTag}`;
}
function isUnqualifiedCredentialDefinitionId(credentialDefinitionId) {
    return exports.unqualifiedCredentialDefinitionIdRegex.test(credentialDefinitionId);
}
function isUnqualifiedRevocationRegistryId(revocationRegistryId) {
    return exports.unqualifiedRevocationRegistryIdRegex.test(revocationRegistryId);
}
function isUnqualifiedSchemaId(schemaId) {
    return exports.unqualifiedSchemaIdRegex.test(schemaId);
}
function isDidIndySchemaId(schemaId) {
    return exports.didIndySchemaIdRegex.test(schemaId);
}
function isDidIndyCredentialDefinitionId(credentialDefinitionId) {
    return exports.didIndyCredentialDefinitionIdRegex.test(credentialDefinitionId);
}
function isDidIndyRevocationRegistryId(revocationRegistryId) {
    return exports.didIndyRevocationRegistryIdRegex.test(revocationRegistryId);
}
function parseIndyDid(did) {
    const match = did.match(exports.didIndyRegex);
    if (match) {
        const [, namespace, namespaceIdentifier] = match;
        return { namespace, namespaceIdentifier };
    }
    else {
        throw new core_1.AriesFrameworkError(`${did} is not a valid did:indy did`);
    }
}
function parseIndySchemaId(schemaId) {
    const didIndyMatch = schemaId.match(exports.didIndySchemaIdRegex);
    if (didIndyMatch) {
        const [, did, namespace, namespaceIdentifier, schemaName, schemaVersion] = didIndyMatch;
        return {
            did,
            namespaceIdentifier,
            schemaName,
            schemaVersion,
            namespace,
        };
    }
    const legacyMatch = schemaId.match(exports.unqualifiedSchemaIdRegex);
    if (legacyMatch) {
        const [, did, schemaName, schemaVersion] = legacyMatch;
        return {
            did,
            namespaceIdentifier: did,
            schemaName,
            schemaVersion,
        };
    }
    throw new Error(`Invalid schema id: ${schemaId}`);
}
function parseIndyCredentialDefinitionId(credentialDefinitionId) {
    const didIndyMatch = credentialDefinitionId.match(exports.didIndyCredentialDefinitionIdRegex);
    if (didIndyMatch) {
        const [, did, namespace, namespaceIdentifier, schemaSeqNo, tag] = didIndyMatch;
        return {
            did,
            namespaceIdentifier,
            schemaSeqNo,
            tag,
            namespace,
        };
    }
    const legacyMatch = credentialDefinitionId.match(exports.unqualifiedCredentialDefinitionIdRegex);
    if (legacyMatch) {
        const [, did, schemaSeqNo, tag] = legacyMatch;
        return {
            did,
            namespaceIdentifier: did,
            schemaSeqNo,
            tag,
        };
    }
    throw new Error(`Invalid credential definition id: ${credentialDefinitionId}`);
}
function parseIndyRevocationRegistryId(revocationRegistryId) {
    const didIndyMatch = revocationRegistryId.match(exports.didIndyRevocationRegistryIdRegex);
    if (didIndyMatch) {
        const [, did, namespace, namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag] = didIndyMatch;
        return {
            did,
            namespaceIdentifier,
            schemaSeqNo,
            credentialDefinitionTag,
            revocationRegistryTag,
            namespace,
        };
    }
    const legacyMatch = revocationRegistryId.match(exports.unqualifiedRevocationRegistryIdRegex);
    if (legacyMatch) {
        const [, did, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag] = legacyMatch;
        return {
            did,
            namespaceIdentifier: did,
            schemaSeqNo,
            credentialDefinitionTag,
            revocationRegistryTag,
        };
    }
    throw new Error(`Invalid revocation registry id: ${revocationRegistryId}`);
}
