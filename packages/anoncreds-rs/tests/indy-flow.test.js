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
const rxjs_1 = require("rxjs");
const InMemoryStorageService_1 = require("../../../tests/InMemoryStorageService");
const runInVersion_1 = require("../../../tests/runInVersion");
const AnonCredsRegistryService_1 = require("../../anoncreds/src/services/registry/AnonCredsRegistryService");
const InMemoryAnonCredsRegistry_1 = require("../../anoncreds/tests/InMemoryAnonCredsRegistry");
const helpers_1 = require("../../core/tests/helpers");
const AnonCredsRsHolderService_1 = require("../src/services/AnonCredsRsHolderService");
const AnonCredsRsIssuerService_1 = require("../src/services/AnonCredsRsIssuerService");
const AnonCredsRsVerifierService_1 = require("../src/services/AnonCredsRsVerifierService");
const registry = new InMemoryAnonCredsRegistry_1.InMemoryAnonCredsRegistry();
const anonCredsModuleConfig = new anoncreds_1.AnonCredsModuleConfig({
    registries: [registry],
});
const agentConfig = (0, helpers_1.getAgentConfig)('LegacyIndyCredentialFormatService using anoncreds-rs');
const anonCredsVerifierService = new AnonCredsRsVerifierService_1.AnonCredsRsVerifierService();
const anonCredsHolderService = new AnonCredsRsHolderService_1.AnonCredsRsHolderService();
const anonCredsIssuerService = new AnonCredsRsIssuerService_1.AnonCredsRsIssuerService();
const wallet = { generateNonce: () => Promise.resolve('947121108704767252195123') };
const inMemoryStorageService = new InMemoryStorageService_1.InMemoryStorageService();
const agentContext = (0, helpers_1.getAgentContext)({
    registerInstances: [
        [core_1.InjectionSymbols.Stop$, new rxjs_1.Subject()],
        [core_1.InjectionSymbols.AgentDependencies, helpers_1.agentDependencies],
        [core_1.InjectionSymbols.StorageService, inMemoryStorageService],
        [anoncreds_1.AnonCredsIssuerServiceSymbol, anonCredsIssuerService],
        [anoncreds_1.AnonCredsHolderServiceSymbol, anonCredsHolderService],
        [anoncreds_1.AnonCredsVerifierServiceSymbol, anonCredsVerifierService],
        [AnonCredsRegistryService_1.AnonCredsRegistryService, new AnonCredsRegistryService_1.AnonCredsRegistryService()],
        [anoncreds_1.AnonCredsModuleConfig, anonCredsModuleConfig],
    ],
    agentConfig,
    wallet,
});
const legacyIndyCredentialFormatService = new anoncreds_1.LegacyIndyCredentialFormatService();
const legacyIndyProofFormatService = new anoncreds_1.LegacyIndyProofFormatService();
// This is just so we don't have to register an actually indy did (as we don't have the indy did registrar configured)
const indyDid = 'did:indy:bcovrin:test:LjgpST2rjsoxYegQDRm7EL';
// FIXME: Re-include in tests when NodeJS wrapper performance is improved
(0, runInVersion_1.describeRunInNodeVersion)([18], 'Legacy indy format services using anoncreds-rs', () => {
    test('issuance and verification flow starting from proposal without negotiation and without revocation', () => __awaiter(void 0, void 0, void 0, function* () {
        const schema = yield anonCredsIssuerService.createSchema(agentContext, {
            attrNames: ['name', 'age'],
            issuerId: indyDid,
            name: 'Employee Credential',
            version: '1.0.0',
        });
        const { schemaState } = yield registry.registerSchema(agentContext, {
            schema,
            options: {},
        });
        const { credentialDefinition, credentialDefinitionPrivate, keyCorrectnessProof } = yield anonCredsIssuerService.createCredentialDefinition(agentContext, {
            issuerId: indyDid,
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
        const linkSecret = yield anonCredsHolderService.createLinkSecret(agentContext, { linkSecretId: 'linkSecretId' });
        expect(linkSecret.linkSecretId).toBe('linkSecretId');
        yield agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsLinkSecretRepository).save(agentContext, new anoncreds_1.AnonCredsLinkSecretRecord({
            value: linkSecret.linkSecretValue,
            linkSecretId: linkSecret.linkSecretId,
        }));
        const holderCredentialRecord = new core_1.CredentialExchangeRecord({
            protocolVersion: 'v1',
            state: core_1.CredentialState.ProposalSent,
            threadId: 'f365c1a5-2baf-4873-9432-fa87c888a0aa',
        });
        const issuerCredentialRecord = new core_1.CredentialExchangeRecord({
            protocolVersion: 'v1',
            state: core_1.CredentialState.ProposalReceived,
            threadId: 'f365c1a5-2baf-4873-9432-fa87c888a0aa',
        });
        const credentialAttributes = [
            new core_1.CredentialPreviewAttribute({
                name: 'name',
                value: 'John',
            }),
            new core_1.CredentialPreviewAttribute({
                name: 'age',
                value: '25',
            }),
        ];
        const parsedCredentialDefinition = (0, anoncreds_1.parseIndyCredentialDefinitionId)(credentialDefinitionState.credentialDefinitionId);
        const unqualifiedCredentialDefinitionId = (0, anoncreds_1.getUnqualifiedCredentialDefinitionId)(parsedCredentialDefinition.namespaceIdentifier, parsedCredentialDefinition.schemaSeqNo, parsedCredentialDefinition.tag);
        const parsedSchemaId = (0, anoncreds_1.parseIndySchemaId)(schemaState.schemaId);
        const unqualifiedSchemaId = (0, anoncreds_1.getUnqualifiedSchemaId)(parsedSchemaId.namespaceIdentifier, parsedSchemaId.schemaName, parsedSchemaId.schemaVersion);
        // Holder creates proposal
        holderCredentialRecord.credentialAttributes = credentialAttributes;
        const { attachment: proposalAttachment } = yield legacyIndyCredentialFormatService.createProposal(agentContext, {
            credentialRecord: holderCredentialRecord,
            credentialFormats: {
                indy: {
                    attributes: credentialAttributes,
                    credentialDefinitionId: unqualifiedCredentialDefinitionId,
                },
            },
        });
        // Issuer processes and accepts proposal
        yield legacyIndyCredentialFormatService.processProposal(agentContext, {
            credentialRecord: issuerCredentialRecord,
            attachment: proposalAttachment,
        });
        // Set attributes on the credential record, this is normally done by the protocol service
        issuerCredentialRecord.credentialAttributes = credentialAttributes;
        const { attachment: offerAttachment } = yield legacyIndyCredentialFormatService.acceptProposal(agentContext, {
            credentialRecord: issuerCredentialRecord,
            proposalAttachment: proposalAttachment,
        });
        // Holder processes and accepts offer
        yield legacyIndyCredentialFormatService.processOffer(agentContext, {
            credentialRecord: holderCredentialRecord,
            attachment: offerAttachment,
        });
        const { attachment: requestAttachment } = yield legacyIndyCredentialFormatService.acceptOffer(agentContext, {
            credentialRecord: holderCredentialRecord,
            offerAttachment,
            credentialFormats: {
                indy: {
                    linkSecretId: linkSecret.linkSecretId,
                },
            },
        });
        // Make sure the request contains a prover_did field
        expect(requestAttachment.getDataAsJson().prover_did).toBeDefined();
        // Issuer processes and accepts request
        yield legacyIndyCredentialFormatService.processRequest(agentContext, {
            credentialRecord: issuerCredentialRecord,
            attachment: requestAttachment,
        });
        const { attachment: credentialAttachment } = yield legacyIndyCredentialFormatService.acceptRequest(agentContext, {
            credentialRecord: issuerCredentialRecord,
            requestAttachment,
            offerAttachment,
        });
        // Holder processes and accepts credential
        yield legacyIndyCredentialFormatService.processCredential(agentContext, {
            credentialRecord: holderCredentialRecord,
            attachment: credentialAttachment,
            requestAttachment,
        });
        expect(holderCredentialRecord.credentials).toEqual([
            { credentialRecordType: 'anoncreds', credentialRecordId: expect.any(String) },
        ]);
        const credentialId = holderCredentialRecord.credentials[0].credentialRecordId;
        const anonCredsCredential = yield anonCredsHolderService.getCredential(agentContext, {
            credentialId,
        });
        expect(anonCredsCredential).toEqual({
            credentialId,
            attributes: {
                age: '25',
                name: 'John',
            },
            schemaId: unqualifiedSchemaId,
            credentialDefinitionId: unqualifiedCredentialDefinitionId,
            revocationRegistryId: null,
            credentialRevocationId: undefined, // FIXME: should be null?
            methodName: 'inMemory',
        });
        expect(holderCredentialRecord.metadata.data).toEqual({
            '_anoncreds/credential': {
                schemaId: unqualifiedSchemaId,
                credentialDefinitionId: unqualifiedCredentialDefinitionId,
            },
            '_anoncreds/credentialRequest': {
                link_secret_blinding_data: expect.any(Object),
                link_secret_name: expect.any(String),
                nonce: expect.any(String),
            },
        });
        expect(issuerCredentialRecord.metadata.data).toEqual({
            '_anoncreds/credential': {
                schemaId: unqualifiedSchemaId,
                credentialDefinitionId: unqualifiedCredentialDefinitionId,
            },
        });
        const holderProofRecord = new core_1.ProofExchangeRecord({
            protocolVersion: 'v1',
            state: core_1.ProofState.ProposalSent,
            threadId: '4f5659a4-1aea-4f42-8c22-9a9985b35e38',
        });
        const verifierProofRecord = new core_1.ProofExchangeRecord({
            protocolVersion: 'v1',
            state: core_1.ProofState.ProposalReceived,
            threadId: '4f5659a4-1aea-4f42-8c22-9a9985b35e38',
        });
        const { attachment: proofProposalAttachment } = yield legacyIndyProofFormatService.createProposal(agentContext, {
            proofFormats: {
                indy: {
                    attributes: [
                        {
                            name: 'name',
                            credentialDefinitionId: unqualifiedCredentialDefinitionId,
                            value: 'John',
                            referent: '1',
                        },
                    ],
                    predicates: [
                        {
                            credentialDefinitionId: unqualifiedCredentialDefinitionId,
                            name: 'age',
                            predicate: '>=',
                            threshold: 18,
                        },
                    ],
                    name: 'Proof Request',
                    version: '1.0',
                },
            },
            proofRecord: holderProofRecord,
        });
        yield legacyIndyProofFormatService.processProposal(agentContext, {
            attachment: proofProposalAttachment,
            proofRecord: verifierProofRecord,
        });
        const { attachment: proofRequestAttachment } = yield legacyIndyProofFormatService.acceptProposal(agentContext, {
            proofRecord: verifierProofRecord,
            proposalAttachment: proofProposalAttachment,
        });
        yield legacyIndyProofFormatService.processRequest(agentContext, {
            attachment: proofRequestAttachment,
            proofRecord: holderProofRecord,
        });
        const { attachment: proofAttachment } = yield legacyIndyProofFormatService.acceptRequest(agentContext, {
            proofRecord: holderProofRecord,
            requestAttachment: proofRequestAttachment,
            proposalAttachment: proofProposalAttachment,
        });
        const isValid = yield legacyIndyProofFormatService.processPresentation(agentContext, {
            attachment: proofAttachment,
            proofRecord: verifierProofRecord,
            requestAttachment: proofRequestAttachment,
        });
        expect(isValid).toBe(true);
    }));
});
