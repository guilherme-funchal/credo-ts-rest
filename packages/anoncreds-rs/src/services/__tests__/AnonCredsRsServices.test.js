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
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const anoncreds_nodejs_1 = require("@hyperledger/anoncreds-nodejs");
const rxjs_1 = require("rxjs");
const InMemoryStorageService_1 = require("../../../../../tests/InMemoryStorageService");
const runInVersion_1 = require("../../../../../tests/runInVersion");
const credential_1 = require("../../../../anoncreds/src/utils/credential");
const InMemoryAnonCredsRegistry_1 = require("../../../../anoncreds/tests/InMemoryAnonCredsRegistry");
const helpers_1 = require("../../../../core/tests/helpers");
const AnonCredsRsHolderService_1 = require("../AnonCredsRsHolderService");
const AnonCredsRsIssuerService_1 = require("../AnonCredsRsIssuerService");
const AnonCredsRsVerifierService_1 = require("../AnonCredsRsVerifierService");
const agentConfig = (0, helpers_1.getAgentConfig)('AnonCredsCredentialFormatServiceTest');
const anonCredsVerifierService = new AnonCredsRsVerifierService_1.AnonCredsRsVerifierService();
const anonCredsHolderService = new AnonCredsRsHolderService_1.AnonCredsRsHolderService();
const anonCredsIssuerService = new AnonCredsRsIssuerService_1.AnonCredsRsIssuerService();
const storageService = new InMemoryStorageService_1.InMemoryStorageService();
const registry = new InMemoryAnonCredsRegistry_1.InMemoryAnonCredsRegistry();
const agentContext = (0, helpers_1.getAgentContext)({
    registerInstances: [
        [core_1.InjectionSymbols.Stop$, new rxjs_1.Subject()],
        [core_1.InjectionSymbols.AgentDependencies, helpers_1.agentDependencies],
        [core_1.InjectionSymbols.StorageService, storageService],
        [anoncreds_1.AnonCredsIssuerServiceSymbol, anonCredsIssuerService],
        [anoncreds_1.AnonCredsHolderServiceSymbol, anonCredsHolderService],
        [anoncreds_1.AnonCredsVerifierServiceSymbol, anonCredsVerifierService],
        [
            anoncreds_1.AnonCredsModuleConfig,
            new anoncreds_1.AnonCredsModuleConfig({
                registries: [registry],
            }),
        ],
    ],
    agentConfig,
});
// FIXME: Re-include in tests when NodeJS wrapper performance is improved
(0, runInVersion_1.describeRunInNodeVersion)([18], 'AnonCredsRsServices', () => {
    test('issuance flow without revocation', () => __awaiter(void 0, void 0, void 0, function* () {
        const issuerId = 'did:indy:pool:localtest:TL1EaPFCZ8Si5aUrqScBDt';
        const schema = yield anonCredsIssuerService.createSchema(agentContext, {
            attrNames: ['name', 'age'],
            issuerId,
            name: 'Employee Credential',
            version: '1.0.0',
        });
        const { schemaState } = yield registry.registerSchema(agentContext, {
            schema,
            options: {},
        });
        const { credentialDefinition, credentialDefinitionPrivate, keyCorrectnessProof } = yield anonCredsIssuerService.createCredentialDefinition(agentContext, {
            issuerId,
            schemaId: schemaState.schemaId,
            schema,
            tag: 'Employee Credential',
            supportRevocation: false,
        });
        const { credentialDefinitionState } = yield registry.registerCredentialDefinition(agentContext, {
            credentialDefinition,
            options: {},
        });
        if (!credentialDefinitionState.credentialDefinition ||
            !credentialDefinitionState.credentialDefinitionId ||
            !schemaState.schema ||
            !schemaState.schemaId) {
            throw new Error('Failed to create schema or credential definition');
        }
        if (!credentialDefinitionPrivate || !keyCorrectnessProof) {
            throw new Error('Failed to get private part of credential definition');
        }
        yield agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsSchemaRepository).save(agentContext, new anoncreds_1.AnonCredsSchemaRecord({
            schema: schemaState.schema,
            schemaId: schemaState.schemaId,
            methodName: 'inMemory',
        }));
        yield agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsCredentialDefinitionRepository).save(agentContext, new anoncreds_1.AnonCredsCredentialDefinitionRecord({
            credentialDefinition: credentialDefinitionState.credentialDefinition,
            credentialDefinitionId: credentialDefinitionState.credentialDefinitionId,
            methodName: 'inMemory',
        }));
        yield agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsCredentialDefinitionPrivateRepository).save(agentContext, new anoncreds_1.AnonCredsCredentialDefinitionPrivateRecord({
            value: credentialDefinitionPrivate,
            credentialDefinitionId: credentialDefinitionState.credentialDefinitionId,
        }));
        yield agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsKeyCorrectnessProofRepository).save(agentContext, new anoncreds_1.AnonCredsKeyCorrectnessProofRecord({
            value: keyCorrectnessProof,
            credentialDefinitionId: credentialDefinitionState.credentialDefinitionId,
        }));
        const credentialOffer = yield anonCredsIssuerService.createCredentialOffer(agentContext, {
            credentialDefinitionId: credentialDefinitionState.credentialDefinitionId,
        });
        const linkSecret = yield anonCredsHolderService.createLinkSecret(agentContext, { linkSecretId: 'linkSecretId' });
        expect(linkSecret.linkSecretId).toBe('linkSecretId');
        yield agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsLinkSecretRepository).save(agentContext, new anoncreds_1.AnonCredsLinkSecretRecord({
            value: linkSecret.linkSecretValue,
            linkSecretId: linkSecret.linkSecretId,
        }));
        const credentialRequestState = yield anonCredsHolderService.createCredentialRequest(agentContext, {
            credentialDefinition: credentialDefinitionState.credentialDefinition,
            credentialOffer,
            linkSecretId: linkSecret.linkSecretId,
        });
        const { credential } = yield anonCredsIssuerService.createCredential(agentContext, {
            credentialOffer,
            credentialRequest: credentialRequestState.credentialRequest,
            credentialValues: {
                name: { raw: 'John', encoded: (0, credential_1.encodeCredentialValue)('John') },
                age: { raw: '25', encoded: (0, credential_1.encodeCredentialValue)('25') },
            },
        });
        const credentialId = 'holderCredentialId';
        const storedId = yield anonCredsHolderService.storeCredential(agentContext, {
            credential,
            credentialDefinition,
            schema,
            credentialDefinitionId: credentialDefinitionState.credentialDefinitionId,
            credentialRequestMetadata: credentialRequestState.credentialRequestMetadata,
            credentialId,
        });
        expect(storedId).toEqual(credentialId);
        const credentialInfo = yield anonCredsHolderService.getCredential(agentContext, {
            credentialId,
        });
        expect(credentialInfo).toEqual({
            credentialId,
            attributes: {
                age: '25',
                name: 'John',
            },
            schemaId: schemaState.schemaId,
            credentialDefinitionId: credentialDefinitionState.credentialDefinitionId,
            revocationRegistryId: null,
            credentialRevocationId: undefined, // Should it be null in this case?
            methodName: 'inMemory',
        });
        const proofRequest = {
            nonce: anoncreds_nodejs_1.anoncreds.generateNonce(),
            name: 'pres_req_1',
            version: '0.1',
            requested_attributes: {
                attr1_referent: {
                    name: 'name',
                },
                attr2_referent: {
                    name: 'age',
                },
            },
            requested_predicates: {
                predicate1_referent: { name: 'age', p_type: '>=', p_value: 18 },
            },
        };
        const proof = yield anonCredsHolderService.createProof(agentContext, {
            credentialDefinitions: { [credentialDefinitionState.credentialDefinitionId]: credentialDefinition },
            proofRequest,
            selectedCredentials: {
                attributes: {
                    attr1_referent: { credentialId, credentialInfo, revealed: true },
                    attr2_referent: { credentialId, credentialInfo, revealed: true },
                },
                predicates: {
                    predicate1_referent: { credentialId, credentialInfo },
                },
                selfAttestedAttributes: {},
            },
            schemas: { [schemaState.schemaId]: schema },
            revocationRegistries: {},
        });
        const verifiedProof = yield anonCredsVerifierService.verifyProof(agentContext, {
            credentialDefinitions: { [credentialDefinitionState.credentialDefinitionId]: credentialDefinition },
            proof,
            proofRequest,
            schemas: { [schemaState.schemaId]: schema },
            revocationRegistries: {},
        });
        expect(verifiedProof).toBeTruthy();
    }));
    test('issuance flow with unqualified identifiers', () => __awaiter(void 0, void 0, void 0, function* () {
        // Use qualified identifiers to create schema and credential definition (we only support qualified identifiers for these)
        const issuerId = 'did:indy:pool:localtest:A4CYPASJYRZRt98YWrac3H';
        const schema = yield anonCredsIssuerService.createSchema(agentContext, {
            attrNames: ['name', 'age'],
            issuerId,
            name: 'Employee Credential',
            version: '1.0.0',
        });
        const { schemaState } = yield registry.registerSchema(agentContext, {
            schema,
            options: {},
        });
        const { credentialDefinition, credentialDefinitionPrivate, keyCorrectnessProof } = yield anonCredsIssuerService.createCredentialDefinition(agentContext, {
            issuerId,
            schemaId: schemaState.schemaId,
            schema,
            tag: 'Employee Credential',
            supportRevocation: false,
        });
        const { credentialDefinitionState } = yield registry.registerCredentialDefinition(agentContext, {
            credentialDefinition,
            options: {},
        });
        if (!credentialDefinitionState.credentialDefinition ||
            !credentialDefinitionState.credentialDefinitionId ||
            !schemaState.schema ||
            !schemaState.schemaId) {
            throw new Error('Failed to create schema or credential definition');
        }
        if (!credentialDefinitionPrivate || !keyCorrectnessProof) {
            throw new Error('Failed to get private part of credential definition');
        }
        yield agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsSchemaRepository).save(agentContext, new anoncreds_1.AnonCredsSchemaRecord({
            schema: schemaState.schema,
            schemaId: schemaState.schemaId,
            methodName: 'inMemory',
        }));
        yield agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsCredentialDefinitionRepository).save(agentContext, new anoncreds_1.AnonCredsCredentialDefinitionRecord({
            credentialDefinition: credentialDefinitionState.credentialDefinition,
            credentialDefinitionId: credentialDefinitionState.credentialDefinitionId,
            methodName: 'inMemory',
        }));
        yield agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsCredentialDefinitionPrivateRepository).save(agentContext, new anoncreds_1.AnonCredsCredentialDefinitionPrivateRecord({
            value: credentialDefinitionPrivate,
            credentialDefinitionId: credentialDefinitionState.credentialDefinitionId,
        }));
        yield agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsKeyCorrectnessProofRepository).save(agentContext, new anoncreds_1.AnonCredsKeyCorrectnessProofRecord({
            value: keyCorrectnessProof,
            credentialDefinitionId: credentialDefinitionState.credentialDefinitionId,
        }));
        const { namespaceIdentifier, schemaSeqNo, tag } = (0, anoncreds_1.parseIndyCredentialDefinitionId)(credentialDefinitionState.credentialDefinitionId);
        const unqualifiedCredentialDefinitionId = (0, anoncreds_1.getUnqualifiedCredentialDefinitionId)(namespaceIdentifier, schemaSeqNo, tag);
        const parsedSchema = (0, anoncreds_1.parseIndySchemaId)(schemaState.schemaId);
        const unqualifiedSchemaId = (0, anoncreds_1.getUnqualifiedSchemaId)(parsedSchema.namespaceIdentifier, parsedSchema.schemaName, parsedSchema.schemaVersion);
        // Create offer with unqualified credential definition id
        const credentialOffer = yield anonCredsIssuerService.createCredentialOffer(agentContext, {
            credentialDefinitionId: unqualifiedCredentialDefinitionId,
        });
        const linkSecret = yield anonCredsHolderService.createLinkSecret(agentContext, { linkSecretId: 'someLinkSecretId' });
        expect(linkSecret.linkSecretId).toBe('someLinkSecretId');
        yield agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsLinkSecretRepository).save(agentContext, new anoncreds_1.AnonCredsLinkSecretRecord({
            value: linkSecret.linkSecretValue,
            linkSecretId: linkSecret.linkSecretId,
        }));
        const unqualifiedCredentialDefinition = yield registry.getCredentialDefinition(agentContext, credentialOffer.cred_def_id);
        const unqualifiedSchema = yield registry.getSchema(agentContext, credentialOffer.schema_id);
        if (!unqualifiedCredentialDefinition.credentialDefinition || !unqualifiedSchema.schema) {
            throw new Error('unable to fetch credential definition or schema');
        }
        const credentialRequestState = yield anonCredsHolderService.createCredentialRequest(agentContext, {
            credentialDefinition: unqualifiedCredentialDefinition.credentialDefinition,
            credentialOffer,
            linkSecretId: linkSecret.linkSecretId,
        });
        const { credential } = yield anonCredsIssuerService.createCredential(agentContext, {
            credentialOffer,
            credentialRequest: credentialRequestState.credentialRequest,
            credentialValues: {
                name: { raw: 'John', encoded: (0, credential_1.encodeCredentialValue)('John') },
                age: { raw: '25', encoded: (0, credential_1.encodeCredentialValue)('25') },
            },
        });
        const credentialId = 'holderCredentialId2';
        const storedId = yield anonCredsHolderService.storeCredential(agentContext, {
            credential,
            credentialDefinition: unqualifiedCredentialDefinition.credentialDefinition,
            schema: unqualifiedSchema.schema,
            credentialDefinitionId: credentialOffer.cred_def_id,
            credentialRequestMetadata: credentialRequestState.credentialRequestMetadata,
            credentialId,
        });
        expect(storedId).toEqual(credentialId);
        const credentialInfo = yield anonCredsHolderService.getCredential(agentContext, {
            credentialId,
        });
        expect(credentialInfo).toEqual({
            credentialId,
            attributes: {
                age: '25',
                name: 'John',
            },
            schemaId: unqualifiedSchemaId,
            credentialDefinitionId: unqualifiedCredentialDefinitionId,
            revocationRegistryId: null,
            credentialRevocationId: undefined, // Should it be null in this case?
            methodName: 'inMemory',
        });
        const proofRequest = {
            nonce: anoncreds_nodejs_1.anoncreds.generateNonce(),
            name: 'pres_req_1',
            version: '0.1',
            requested_attributes: {
                attr1_referent: {
                    name: 'name',
                },
                attr2_referent: {
                    name: 'age',
                },
            },
            requested_predicates: {
                predicate1_referent: { name: 'age', p_type: '>=', p_value: 18 },
            },
        };
        const proof = yield anonCredsHolderService.createProof(agentContext, {
            credentialDefinitions: { [unqualifiedCredentialDefinitionId]: credentialDefinition },
            proofRequest,
            selectedCredentials: {
                attributes: {
                    attr1_referent: { credentialId, credentialInfo, revealed: true },
                    attr2_referent: { credentialId, credentialInfo, revealed: true },
                },
                predicates: {
                    predicate1_referent: { credentialId, credentialInfo },
                },
                selfAttestedAttributes: {},
            },
            schemas: { [unqualifiedSchemaId]: schema },
            revocationRegistries: {},
        });
        const verifiedProof = yield anonCredsVerifierService.verifyProof(agentContext, {
            credentialDefinitions: { [unqualifiedCredentialDefinitionId]: credentialDefinition },
            proof,
            proofRequest,
            schemas: { [unqualifiedSchemaId]: schema },
            revocationRegistries: {},
        });
        expect(verifiedProof).toBeTruthy();
    }));
});
