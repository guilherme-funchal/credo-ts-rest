"use strict";
/**
 * NOTE: this file is availalbe in both the indy-sdk and indy-vdr packages. If making changes to
 * this file, make sure to update both files if applicable.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.indyVdrAnonCredsRegistryIdentifierRegex = void 0;
exports.getDidIndySchemaId = getDidIndySchemaId;
exports.getDidIndyCredentialDefinitionId = getDidIndyCredentialDefinitionId;
exports.getDidIndyRevocationRegistryId = getDidIndyRevocationRegistryId;
const anoncreds_1 = require("@aries-framework/anoncreds");
// combines both legacy and did:indy anoncreds identifiers and also the issuer id
const indyVdrAnonCredsRegexes = [
    // NOTE: we only include the qualified issuer id here, as we don't support registering objects based on legacy issuer ids.
    // you can still resolve using legacy issuer ids, but you need to use the full did:indy identifier when registering.
    // As we find a matching anoncreds registry based on the issuerId only when creating an object, this will make sure
    // it will throw an no registry found for identifier error.
    // issuer id
    anoncreds_1.didIndyRegex,
    // schema
    anoncreds_1.didIndySchemaIdRegex,
    anoncreds_1.unqualifiedSchemaIdRegex,
    // credential definition
    anoncreds_1.didIndyCredentialDefinitionIdRegex,
    anoncreds_1.unqualifiedCredentialDefinitionIdRegex,
    // revocation registry
    anoncreds_1.unqualifiedRevocationRegistryIdRegex,
    anoncreds_1.didIndyRevocationRegistryIdRegex,
];
exports.indyVdrAnonCredsRegistryIdentifierRegex = new RegExp(indyVdrAnonCredsRegexes.map((r) => r.source).join('|'));
function getDidIndySchemaId(namespace, unqualifiedDid, name, version) {
    return `did:indy:${namespace}:${unqualifiedDid}/anoncreds/v0/SCHEMA/${name}/${version}`;
}
function getDidIndyCredentialDefinitionId(namespace, unqualifiedDid, seqNo, tag) {
    return `did:indy:${namespace}:${unqualifiedDid}/anoncreds/v0/CLAIM_DEF/${seqNo}/${tag}`;
}
function getDidIndyRevocationRegistryId(namespace, unqualifiedDid, seqNo, credentialDefinitionTag, revocationRegistryTag) {
    return `did:indy:${namespace}:${unqualifiedDid}/anoncreds/v0/REV_REG_DEF/${seqNo}/${credentialDefinitionTag}/${revocationRegistryTag}`;
}
