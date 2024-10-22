"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core_1 = require("@aries-framework/core");
const indySdk = __importStar(require("indy-sdk"));
const rxjs_1 = require("rxjs");
const helpers_1 = require("../../../../core/tests/helpers");
const src_1 = require("../../../../indy-sdk/src");
const IndySdkRevocationService_1 = require("../../../../indy-sdk/src/anoncreds/services/IndySdkRevocationService");
const did_1 = require("../../../../indy-sdk/src/utils/did");
const InMemoryAnonCredsRegistry_1 = require("../../../tests/InMemoryAnonCredsRegistry");
const AnonCredsModuleConfig_1 = require("../../AnonCredsModuleConfig");
const repository_1 = require("../../repository");
const services_1 = require("../../services");
const AnonCredsRegistryService_1 = require("../../services/registry/AnonCredsRegistryService");
const indyIdentifiers_1 = require("../../utils/indyIdentifiers");
const LegacyIndyCredentialFormatService_1 = require("../LegacyIndyCredentialFormatService");
const LegacyIndyProofFormatService_1 = require("../LegacyIndyProofFormatService");
const registry = new InMemoryAnonCredsRegistry_1.InMemoryAnonCredsRegistry();
const anonCredsModuleConfig = new AnonCredsModuleConfig_1.AnonCredsModuleConfig({
    registries: [registry],
});
const agentConfig = (0, helpers_1.getAgentConfig)('LegacyIndyFormatServicesTest');
const anonCredsRevocationService = new IndySdkRevocationService_1.IndySdkRevocationService(indySdk);
const anonCredsVerifierService = new src_1.IndySdkVerifierService(indySdk);
const anonCredsHolderService = new src_1.IndySdkHolderService(anonCredsRevocationService, indySdk);
const anonCredsIssuerService = new src_1.IndySdkIssuerService(indySdk);
const wallet = new src_1.IndySdkWallet(indySdk, agentConfig.logger, new core_1.SigningProviderRegistry([]));
const storageService = new src_1.IndySdkStorageService(indySdk);
const eventEmitter = new core_1.EventEmitter(helpers_1.agentDependencies, new rxjs_1.Subject());
const anonCredsLinkSecretRepository = new repository_1.AnonCredsLinkSecretRepository(storageService, eventEmitter);
const agentContext = (0, helpers_1.getAgentContext)({
    registerInstances: [
        [services_1.AnonCredsIssuerServiceSymbol, anonCredsIssuerService],
        [services_1.AnonCredsHolderServiceSymbol, anonCredsHolderService],
        [services_1.AnonCredsVerifierServiceSymbol, anonCredsVerifierService],
        [AnonCredsRegistryService_1.AnonCredsRegistryService, new AnonCredsRegistryService_1.AnonCredsRegistryService()],
        [AnonCredsModuleConfig_1.AnonCredsModuleConfig, anonCredsModuleConfig],
        [repository_1.AnonCredsLinkSecretRepository, anonCredsLinkSecretRepository],
        [src_1.IndySdkModuleConfig, new src_1.IndySdkModuleConfig({ indySdk, autoCreateLinkSecret: false })],
    ],
    agentConfig,
    wallet,
});
const indyCredentialFormatService = new LegacyIndyCredentialFormatService_1.LegacyIndyCredentialFormatService();
const indyProofFormatService = new LegacyIndyProofFormatService_1.LegacyIndyProofFormatService();
// We can split up these tests when we can use AnonCredsRS as a backend, but currently
// we need to have the link secrets etc in the wallet which is not so easy to do with Indy
describe('Legacy indy format services', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield wallet.createAndOpen(agentConfig.walletConfig);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield wallet.delete();
    }));
    test('issuance and verification flow starting from proposal without negotiation and without revocation', () => __awaiter(void 0, void 0, void 0, function* () {
        // This is just so we don't have to register an actual indy did (as we don't have the indy did registrar configured)
        const key = yield wallet.createKey({ keyType: core_1.KeyType.Ed25519 });
        const unqualifiedIndyDid = (0, did_1.legacyIndyDidFromPublicKeyBase58)(key.publicKeyBase58);
        const indyDid = `did:indy:pool1:${unqualifiedIndyDid}`;
        // Create link secret
        yield anonCredsHolderService.createLinkSecret(agentContext, {
            linkSecretId: 'link-secret-id',
        });
        const anonCredsLinkSecret = new repository_1.AnonCredsLinkSecretRecord({
            linkSecretId: 'link-secret-id',
        });
        anonCredsLinkSecret.setTag('isDefault', true);
        yield anonCredsLinkSecretRepository.save(agentContext, anonCredsLinkSecret);
        const schema = yield anonCredsIssuerService.createSchema(agentContext, {
            attrNames: ['name', 'age'],
            issuerId: indyDid,
            name: 'Employee Credential',
            version: '1.0.0',
        });
        const { schemaState, schemaMetadata } = yield registry.registerSchema(agentContext, {
            schema,
            options: {},
        });
        const { credentialDefinition } = yield anonCredsIssuerService.createCredentialDefinition(agentContext, {
            issuerId: indyDid,
            schemaId: schemaState.schemaId,
            schema,
            tag: 'Employee Credential',
            supportRevocation: false,
        }, {
            // Need to pass this as the indy-sdk MUST have the seqNo
            indyLedgerSchemaSeqNo: schemaMetadata.indyLedgerSeqNo,
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
        const cd = (0, indyIdentifiers_1.parseIndyCredentialDefinitionId)(credentialDefinitionState.credentialDefinitionId);
        const legacyCredentialDefinitionId = (0, indyIdentifiers_1.getUnqualifiedCredentialDefinitionId)(cd.namespaceIdentifier, cd.schemaSeqNo, cd.tag);
        const s = (0, indyIdentifiers_1.parseIndySchemaId)(schemaState.schemaId);
        const legacySchemaId = (0, indyIdentifiers_1.getUnqualifiedSchemaId)(s.namespaceIdentifier, s.schemaName, s.schemaVersion);
        // Holder creates proposal
        holderCredentialRecord.credentialAttributes = credentialAttributes;
        const { attachment: proposalAttachment } = yield indyCredentialFormatService.createProposal(agentContext, {
            credentialRecord: holderCredentialRecord,
            credentialFormats: {
                indy: {
                    attributes: credentialAttributes,
                    credentialDefinitionId: legacyCredentialDefinitionId,
                },
            },
        });
        // Issuer processes and accepts proposal
        yield indyCredentialFormatService.processProposal(agentContext, {
            credentialRecord: issuerCredentialRecord,
            attachment: proposalAttachment,
        });
        // Set attributes on the credential record, this is normally done by the protocol service
        issuerCredentialRecord.credentialAttributes = credentialAttributes;
        const { attachment: offerAttachment } = yield indyCredentialFormatService.acceptProposal(agentContext, {
            credentialRecord: issuerCredentialRecord,
            proposalAttachment: proposalAttachment,
        });
        // Holder processes and accepts offer
        yield indyCredentialFormatService.processOffer(agentContext, {
            credentialRecord: holderCredentialRecord,
            attachment: offerAttachment,
        });
        const { attachment: requestAttachment } = yield indyCredentialFormatService.acceptOffer(agentContext, {
            credentialRecord: holderCredentialRecord,
            offerAttachment,
        });
        // Make sure the request contains a prover_did field
        expect(requestAttachment.getDataAsJson().prover_did).toBeDefined();
        // Issuer processes and accepts request
        yield indyCredentialFormatService.processRequest(agentContext, {
            credentialRecord: issuerCredentialRecord,
            attachment: requestAttachment,
        });
        const { attachment: credentialAttachment } = yield indyCredentialFormatService.acceptRequest(agentContext, {
            credentialRecord: issuerCredentialRecord,
            requestAttachment,
            offerAttachment,
        });
        // Holder processes and accepts credential
        yield indyCredentialFormatService.processCredential(agentContext, {
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
            schemaId: legacySchemaId,
            credentialDefinitionId: legacyCredentialDefinitionId,
            revocationRegistryId: null,
            credentialRevocationId: null,
            methodName: 'indy',
        });
        expect(holderCredentialRecord.metadata.data).toEqual({
            '_anoncreds/credential': {
                schemaId: legacySchemaId,
                credentialDefinitionId: legacyCredentialDefinitionId,
            },
            '_anoncreds/credentialRequest': {
                link_secret_blinding_data: expect.any(Object),
                link_secret_name: expect.any(String),
                nonce: expect.any(String),
            },
        });
        expect(issuerCredentialRecord.metadata.data).toEqual({
            '_anoncreds/credential': {
                schemaId: legacySchemaId,
                credentialDefinitionId: legacyCredentialDefinitionId,
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
        const { attachment: proofProposalAttachment } = yield indyProofFormatService.createProposal(agentContext, {
            proofFormats: {
                indy: {
                    attributes: [
                        {
                            name: 'name',
                            credentialDefinitionId: legacyCredentialDefinitionId,
                            value: 'John',
                            referent: '1',
                        },
                    ],
                    predicates: [
                        {
                            credentialDefinitionId: legacyCredentialDefinitionId,
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
        yield indyProofFormatService.processProposal(agentContext, {
            attachment: proofProposalAttachment,
            proofRecord: verifierProofRecord,
        });
        const { attachment: proofRequestAttachment } = yield indyProofFormatService.acceptProposal(agentContext, {
            proofRecord: verifierProofRecord,
            proposalAttachment: proofProposalAttachment,
        });
        yield indyProofFormatService.processRequest(agentContext, {
            attachment: proofRequestAttachment,
            proofRecord: holderProofRecord,
        });
        const { attachment: proofAttachment } = yield indyProofFormatService.acceptRequest(agentContext, {
            proofRecord: holderProofRecord,
            requestAttachment: proofRequestAttachment,
            proposalAttachment: proofProposalAttachment,
        });
        const isValid = yield indyProofFormatService.processPresentation(agentContext, {
            attachment: proofAttachment,
            proofRecord: verifierProofRecord,
            requestAttachment: proofRequestAttachment,
        });
        expect(isValid).toBe(true);
    }));
});
