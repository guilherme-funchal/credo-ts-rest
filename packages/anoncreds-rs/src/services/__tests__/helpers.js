"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCredentialDefinition = createCredentialDefinition;
exports.createCredentialOffer = createCredentialOffer;
exports.createLinkSecret = createLinkSecret;
exports.createCredentialForHolder = createCredentialForHolder;
exports.createRevocationRegistryDefinition = createRevocationRegistryDefinition;
const anoncreds_shared_1 = require("@hyperledger/anoncreds-shared");
/**
 * Creates a valid credential definition and returns its public and
 * private part, including its key correctness proof
 */
function createCredentialDefinition(options) {
    const { attributeNames, issuerId } = options;
    const schema = anoncreds_shared_1.Schema.create({
        issuerId,
        attributeNames,
        name: 'schema1',
        version: '1',
    });
    const { credentialDefinition, credentialDefinitionPrivate, keyCorrectnessProof } = anoncreds_shared_1.CredentialDefinition.create({
        issuerId,
        schema,
        schemaId: 'schema:uri',
        signatureType: 'CL',
        supportRevocation: true, // FIXME: Revocation should not be mandatory but current anoncreds-rs is requiring it
        tag: 'TAG',
    });
    const returnObj = {
        credentialDefinition: credentialDefinition.toJson(),
        credentialDefinitionPrivate: credentialDefinitionPrivate.toJson(),
        keyCorrectnessProof: keyCorrectnessProof.toJson(),
        schema: schema.toJson(),
    };
    credentialDefinition.handle.clear();
    credentialDefinitionPrivate.handle.clear();
    keyCorrectnessProof.handle.clear();
    schema.handle.clear();
    return returnObj;
}
/**
 * Creates a valid credential offer and returns itsf
 */
function createCredentialOffer(keyCorrectnessProof) {
    const credentialOffer = anoncreds_shared_1.CredentialOffer.create({
        credentialDefinitionId: 'creddef:uri',
        keyCorrectnessProof,
        schemaId: 'schema:uri',
    });
    const credentialOfferJson = credentialOffer.toJson();
    credentialOffer.handle.clear();
    return credentialOfferJson;
}
/**
 *
 * @returns Creates a valid link secret value for anoncreds-rs
 */
function createLinkSecret() {
    return anoncreds_shared_1.LinkSecret.create();
}
function createCredentialForHolder(options) {
    const { credentialDefinition, credentialDefinitionPrivate, keyCorrectnessProof, schemaId, credentialDefinitionId, attributes, linkSecret, linkSecretId, credentialId, revocationRegistryDefinitionId, } = options;
    const credentialOffer = anoncreds_shared_1.CredentialOffer.create({
        credentialDefinitionId,
        keyCorrectnessProof,
        schemaId,
    });
    const { credentialRequest, credentialRequestMetadata } = anoncreds_shared_1.CredentialRequest.create({
        entropy: 'some-entropy',
        credentialDefinition,
        credentialOffer,
        linkSecret,
        linkSecretId: linkSecretId,
    });
    const { revocationRegistryDefinition, revocationRegistryDefinitionPrivate, tailsPath } = createRevocationRegistryDefinition({
        credentialDefinitionId,
        credentialDefinition,
    });
    const timeCreateRevStatusList = 12;
    const revocationStatusList = anoncreds_shared_1.RevocationStatusList.create({
        issuerId: credentialDefinition.issuerId,
        timestamp: timeCreateRevStatusList,
        issuanceByDefault: true,
        revocationRegistryDefinition: new anoncreds_shared_1.RevocationRegistryDefinition(revocationRegistryDefinition.handle),
        revocationRegistryDefinitionId: 'mock:uri',
    });
    const credentialObj = anoncreds_shared_1.Credential.create({
        credentialDefinition,
        credentialDefinitionPrivate,
        credentialOffer,
        credentialRequest,
        attributeRawValues: attributes,
        revocationRegistryId: revocationRegistryDefinitionId,
        revocationStatusList,
        revocationConfiguration: new anoncreds_shared_1.CredentialRevocationConfig({
            registryDefinition: new anoncreds_shared_1.RevocationRegistryDefinition(revocationRegistryDefinition.handle),
            registryDefinitionPrivate: new anoncreds_shared_1.RevocationRegistryDefinitionPrivate(revocationRegistryDefinitionPrivate.handle),
            registryIndex: 9,
            tailsPath,
        }),
    });
    const credentialInfo = {
        attributes,
        credentialDefinitionId,
        credentialId,
        schemaId,
        methodName: 'inMemory',
    };
    const returnObj = {
        credential: credentialObj.toJson(),
        credentialInfo,
        revocationRegistryDefinition,
        tailsPath,
        credentialRequestMetadata,
    };
    credentialObj.handle.clear();
    credentialOffer.handle.clear();
    credentialRequest.handle.clear();
    revocationRegistryDefinitionPrivate.clear();
    revocationStatusList.handle.clear();
    return returnObj;
}
function createRevocationRegistryDefinition(options) {
    const { credentialDefinitionId, credentialDefinition } = options;
    const { revocationRegistryDefinition, revocationRegistryDefinitionPrivate } = anoncreds_shared_1.anoncreds.createRevocationRegistryDefinition({
        credentialDefinitionId,
        credentialDefinition: anoncreds_shared_1.CredentialDefinition.fromJson(credentialDefinition).handle,
        issuerId: credentialDefinition.issuerId,
        tag: 'some_tag',
        revocationRegistryType: 'CL_ACCUM',
        maximumCredentialNumber: 10,
    });
    const tailsPath = anoncreds_shared_1.anoncreds.revocationRegistryDefinitionGetAttribute({
        objectHandle: revocationRegistryDefinition,
        name: 'tails_location',
    });
    return { revocationRegistryDefinition, revocationRegistryDefinitionPrivate, tailsPath };
}
