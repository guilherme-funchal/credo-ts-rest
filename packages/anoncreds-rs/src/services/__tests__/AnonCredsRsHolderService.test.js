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
const anoncreds_nodejs_1 = require("@hyperledger/anoncreds-nodejs");
const runInVersion_1 = require("../../../../../tests/runInVersion");
const AnonCredsCredentialDefinitionRepository_1 = require("../../../../anoncreds/src/repository/AnonCredsCredentialDefinitionRepository");
const AnonCredsCredentialRepository_1 = require("../../../../anoncreds/src/repository/AnonCredsCredentialRepository");
const AnonCredsLinkSecretRepository_1 = require("../../../../anoncreds/src/repository/AnonCredsLinkSecretRepository");
const InMemoryAnonCredsRegistry_1 = require("../../../../anoncreds/tests/InMemoryAnonCredsRegistry");
const helpers_1 = require("../../../../core/tests/helpers");
const AnonCredsRsHolderService_1 = require("../AnonCredsRsHolderService");
const helpers_2 = require("./helpers");
const agentConfig = (0, helpers_1.getAgentConfig)('AnonCredsRsHolderServiceTest');
const anonCredsHolderService = new AnonCredsRsHolderService_1.AnonCredsRsHolderService();
jest.mock('../../../../anoncreds/src/repository/AnonCredsCredentialDefinitionRepository');
const CredentialDefinitionRepositoryMock = AnonCredsCredentialDefinitionRepository_1.AnonCredsCredentialDefinitionRepository;
const credentialDefinitionRepositoryMock = new CredentialDefinitionRepositoryMock();
jest.mock('../../../../anoncreds/src/repository/AnonCredsLinkSecretRepository');
const AnonCredsLinkSecretRepositoryMock = AnonCredsLinkSecretRepository_1.AnonCredsLinkSecretRepository;
const anoncredsLinkSecretRepositoryMock = new AnonCredsLinkSecretRepositoryMock();
jest.mock('../../../../anoncreds/src/repository/AnonCredsCredentialRepository');
const AnonCredsCredentialRepositoryMock = AnonCredsCredentialRepository_1.AnonCredsCredentialRepository;
const anoncredsCredentialRepositoryMock = new AnonCredsCredentialRepositoryMock();
const agentContext = (0, helpers_1.getAgentContext)({
    registerInstances: [
        [AnonCredsCredentialDefinitionRepository_1.AnonCredsCredentialDefinitionRepository, credentialDefinitionRepositoryMock],
        [AnonCredsLinkSecretRepository_1.AnonCredsLinkSecretRepository, anoncredsLinkSecretRepositoryMock],
        [AnonCredsCredentialRepository_1.AnonCredsCredentialRepository, anoncredsCredentialRepositoryMock],
        [anoncreds_1.AnonCredsHolderServiceSymbol, anonCredsHolderService],
        [
            anoncreds_1.AnonCredsModuleConfig,
            new anoncreds_1.AnonCredsModuleConfig({
                registries: [new InMemoryAnonCredsRegistry_1.InMemoryAnonCredsRegistry({})],
            }),
        ],
    ],
    agentConfig,
});
// FIXME: Re-include in tests when NodeJS wrapper performance is improved
(0, runInVersion_1.describeRunInNodeVersion)([18], 'AnonCredsRsHolderService', () => {
    const getByCredentialIdMock = jest.spyOn(anoncredsCredentialRepositoryMock, 'getByCredentialId');
    const findByQueryMock = jest.spyOn(anoncredsCredentialRepositoryMock, 'findByQuery');
    beforeEach(() => {
        getByCredentialIdMock.mockClear();
    });
    test('createCredentialRequest', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, helpers_1.mockFunction)(anoncredsLinkSecretRepositoryMock.getByLinkSecretId).mockResolvedValue(new anoncreds_1.AnonCredsLinkSecretRecord({ linkSecretId: 'linkSecretId', value: (0, helpers_2.createLinkSecret)() }));
        const { credentialDefinition, keyCorrectnessProof } = (0, helpers_2.createCredentialDefinition)({
            attributeNames: ['phoneNumber'],
            issuerId: 'issuer:uri',
        });
        const credentialOffer = (0, helpers_2.createCredentialOffer)(keyCorrectnessProof);
        const { credentialRequest } = yield anonCredsHolderService.createCredentialRequest(agentContext, {
            credentialDefinition,
            credentialOffer,
            linkSecretId: 'linkSecretId',
        });
        expect(credentialRequest.cred_def_id).toBe('creddef:uri');
        expect(credentialRequest.prover_did).toBeUndefined();
    }));
    test('createLinkSecret', () => __awaiter(void 0, void 0, void 0, function* () {
        let linkSecret = yield anonCredsHolderService.createLinkSecret(agentContext, {
            linkSecretId: 'linkSecretId',
        });
        expect(linkSecret.linkSecretId).toBe('linkSecretId');
        expect(linkSecret.linkSecretValue).toBeDefined();
        linkSecret = yield anonCredsHolderService.createLinkSecret(agentContext);
        expect(linkSecret.linkSecretId).toBeDefined();
        expect(linkSecret.linkSecretValue).toBeDefined();
    }));
    test('createProof', () => __awaiter(void 0, void 0, void 0, function* () {
        const proofRequest = {
            nonce: anoncreds_nodejs_1.anoncreds.generateNonce(),
            name: 'pres_req_1',
            version: '0.1',
            requested_attributes: {
                attr1_referent: {
                    name: 'name',
                    restrictions: [{ issuer_did: 'issuer:uri' }],
                },
                attr2_referent: {
                    name: 'phoneNumber',
                },
                attr3_referent: {
                    name: 'age',
                },
                attr4_referent: {
                    names: ['name', 'height'],
                },
                attr5_referent: {
                    name: 'favouriteSport',
                },
            },
            requested_predicates: {
                predicate1_referent: { name: 'age', p_type: '>=', p_value: 18 },
            },
            //non_revoked: { from: 10, to: 200 },
        };
        const { credentialDefinition: personCredentialDefinition, credentialDefinitionPrivate: personCredentialDefinitionPrivate, keyCorrectnessProof: personKeyCorrectnessProof, } = (0, helpers_2.createCredentialDefinition)({
            attributeNames: ['name', 'age', 'sex', 'height'],
            issuerId: 'issuer:uri',
        });
        const { credentialDefinition: phoneCredentialDefinition, credentialDefinitionPrivate: phoneCredentialDefinitionPrivate, keyCorrectnessProof: phoneKeyCorrectnessProof, } = (0, helpers_2.createCredentialDefinition)({
            attributeNames: ['phoneNumber'],
            issuerId: 'issuer:uri',
        });
        const linkSecret = (0, helpers_2.createLinkSecret)();
        (0, helpers_1.mockFunction)(anoncredsLinkSecretRepositoryMock.getByLinkSecretId).mockResolvedValue(new anoncreds_1.AnonCredsLinkSecretRecord({ linkSecretId: 'linkSecretId', value: linkSecret }));
        const { credential: personCredential, credentialInfo: personCredentialInfo, revocationRegistryDefinition: personRevRegDef, tailsPath: personTailsPath, } = (0, helpers_2.createCredentialForHolder)({
            attributes: {
                name: 'John',
                sex: 'M',
                height: '179',
                age: '19',
            },
            credentialDefinition: personCredentialDefinition,
            schemaId: 'personschema:uri',
            credentialDefinitionId: 'personcreddef:uri',
            credentialDefinitionPrivate: personCredentialDefinitionPrivate,
            keyCorrectnessProof: personKeyCorrectnessProof,
            linkSecret,
            linkSecretId: 'linkSecretId',
            credentialId: 'personCredId',
            revocationRegistryDefinitionId: 'personrevregid:uri',
        });
        const { credential: phoneCredential, credentialInfo: phoneCredentialInfo, revocationRegistryDefinition: phoneRevRegDef, tailsPath: phoneTailsPath, } = (0, helpers_2.createCredentialForHolder)({
            attributes: {
                phoneNumber: 'linkSecretId56',
            },
            credentialDefinition: phoneCredentialDefinition,
            schemaId: 'phoneschema:uri',
            credentialDefinitionId: 'phonecreddef:uri',
            credentialDefinitionPrivate: phoneCredentialDefinitionPrivate,
            keyCorrectnessProof: phoneKeyCorrectnessProof,
            linkSecret,
            linkSecretId: 'linkSecretId',
            credentialId: 'phoneCredId',
            revocationRegistryDefinitionId: 'phonerevregid:uri',
        });
        const selectedCredentials = {
            selfAttestedAttributes: { attr5_referent: 'football' },
            attributes: {
                attr1_referent: { credentialId: 'personCredId', credentialInfo: personCredentialInfo, revealed: true },
                attr2_referent: { credentialId: 'phoneCredId', credentialInfo: phoneCredentialInfo, revealed: true },
                attr3_referent: { credentialId: 'personCredId', credentialInfo: personCredentialInfo, revealed: true },
                attr4_referent: { credentialId: 'personCredId', credentialInfo: personCredentialInfo, revealed: true },
            },
            predicates: {
                predicate1_referent: { credentialId: 'personCredId', credentialInfo: personCredentialInfo },
            },
        };
        getByCredentialIdMock.mockResolvedValueOnce(new anoncreds_1.AnonCredsCredentialRecord({
            credential: personCredential,
            credentialId: 'personCredId',
            linkSecretId: 'linkSecretId',
            issuerId: 'issuerDid',
            schemaIssuerId: 'schemaIssuerDid',
            schemaName: 'schemaName',
            schemaVersion: 'schemaVersion',
            methodName: 'inMemory',
        }));
        getByCredentialIdMock.mockResolvedValueOnce(new anoncreds_1.AnonCredsCredentialRecord({
            credential: phoneCredential,
            credentialId: 'phoneCredId',
            linkSecretId: 'linkSecretId',
            issuerId: 'issuerDid',
            schemaIssuerId: 'schemaIssuerDid',
            schemaName: 'schemaName',
            schemaVersion: 'schemaVersion',
            methodName: 'inMemory',
        }));
        const revocationRegistries = {
            'personrevregid:uri': {
                tailsFilePath: personTailsPath,
                definition: JSON.parse(anoncreds_nodejs_1.anoncreds.getJson({ objectHandle: personRevRegDef })),
                revocationStatusLists: { '1': {} },
            },
            'phonerevregid:uri': {
                tailsFilePath: phoneTailsPath,
                definition: JSON.parse(anoncreds_nodejs_1.anoncreds.getJson({ objectHandle: phoneRevRegDef })),
                revocationStatusLists: { '1': {} },
            },
        };
        yield anonCredsHolderService.createProof(agentContext, {
            credentialDefinitions: {
                'personcreddef:uri': personCredentialDefinition,
                'phonecreddef:uri': phoneCredentialDefinition,
            },
            proofRequest,
            selectedCredentials,
            schemas: {
                'phoneschema:uri': { attrNames: ['phoneNumber'], issuerId: 'issuer:uri', name: 'phoneschema', version: '1' },
                'personschema:uri': {
                    attrNames: ['name', 'sex', 'height', 'age'],
                    issuerId: 'issuer:uri',
                    name: 'personschema',
                    version: '1',
                },
            },
            revocationRegistries,
        });
        expect(getByCredentialIdMock).toHaveBeenCalledTimes(2);
        // TODO: check proof object
    }));
    describe('getCredentialsForProofRequest', () => {
        const findByQueryMock = jest.spyOn(anoncredsCredentialRepositoryMock, 'findByQuery');
        const proofRequest = {
            nonce: anoncreds_nodejs_1.anoncreds.generateNonce(),
            name: 'pres_req_1',
            version: '0.1',
            requested_attributes: {
                attr1_referent: {
                    name: 'name',
                    restrictions: [{ issuer_did: 'issuer:uri' }],
                },
                attr2_referent: {
                    name: 'phoneNumber',
                },
                attr3_referent: {
                    name: 'age',
                    restrictions: [{ schema_id: 'schemaid:uri', schema_name: 'schemaName' }, { schema_version: '1.0' }],
                },
                attr4_referent: {
                    names: ['name', 'height'],
                    restrictions: [{ cred_def_id: 'crededefid:uri', issuer_id: 'issuerid:uri' }],
                },
                attr5_referent: {
                    name: 'name',
                    restrictions: [{ 'attr::name::value': 'Alice', 'attr::name::marker': '1' }],
                },
            },
            requested_predicates: {
                predicate1_referent: { name: 'age', p_type: '>=', p_value: 18 },
            },
        };
        beforeEach(() => {
            findByQueryMock.mockResolvedValue([]);
        });
        afterEach(() => {
            findByQueryMock.mockClear();
        });
        test('invalid referent', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(anonCredsHolderService.getCredentialsForProofRequest(agentContext, {
                proofRequest,
                attributeReferent: 'name',
            })).rejects.toThrowError();
        }));
        test('referent with single restriction', () => __awaiter(void 0, void 0, void 0, function* () {
            yield anonCredsHolderService.getCredentialsForProofRequest(agentContext, {
                proofRequest,
                attributeReferent: 'attr1_referent',
            });
            expect(findByQueryMock).toHaveBeenCalledWith(agentContext, {
                $and: [
                    {
                        'attr::name::marker': true,
                    },
                    {
                        issuerId: 'issuer:uri',
                    },
                ],
            });
        }));
        test('referent without restrictions', () => __awaiter(void 0, void 0, void 0, function* () {
            yield anonCredsHolderService.getCredentialsForProofRequest(agentContext, {
                proofRequest,
                attributeReferent: 'attr2_referent',
            });
            expect(findByQueryMock).toHaveBeenCalledWith(agentContext, {
                $and: [
                    {
                        'attr::phoneNumber::marker': true,
                    },
                ],
            });
        }));
        test('referent with multiple, complex restrictions', () => __awaiter(void 0, void 0, void 0, function* () {
            yield anonCredsHolderService.getCredentialsForProofRequest(agentContext, {
                proofRequest,
                attributeReferent: 'attr3_referent',
            });
            expect(findByQueryMock).toHaveBeenCalledWith(agentContext, {
                $and: [
                    {
                        'attr::age::marker': true,
                    },
                    {
                        $or: [{ schemaId: 'schemaid:uri', schemaName: 'schemaName' }, { schemaVersion: '1.0' }],
                    },
                ],
            });
        }));
        test('referent with multiple names and restrictions', () => __awaiter(void 0, void 0, void 0, function* () {
            yield anonCredsHolderService.getCredentialsForProofRequest(agentContext, {
                proofRequest,
                attributeReferent: 'attr4_referent',
            });
            expect(findByQueryMock).toHaveBeenCalledWith(agentContext, {
                $and: [
                    {
                        'attr::name::marker': true,
                        'attr::height::marker': true,
                    },
                    {
                        credentialDefinitionId: 'crededefid:uri',
                        issuerId: 'issuerid:uri',
                    },
                ],
            });
        }));
        test('referent with attribute values and marker restriction', () => __awaiter(void 0, void 0, void 0, function* () {
            yield anonCredsHolderService.getCredentialsForProofRequest(agentContext, {
                proofRequest,
                attributeReferent: 'attr5_referent',
            });
            expect(findByQueryMock).toHaveBeenCalledWith(agentContext, {
                $and: [
                    {
                        'attr::name::marker': true,
                    },
                    {
                        'attr::name::value': 'Alice',
                        'attr::name::marker': true,
                    },
                ],
            });
        }));
        test('predicate referent', () => __awaiter(void 0, void 0, void 0, function* () {
            yield anonCredsHolderService.getCredentialsForProofRequest(agentContext, {
                proofRequest,
                attributeReferent: 'predicate1_referent',
            });
            expect(findByQueryMock).toHaveBeenCalledWith(agentContext, {
                $and: [
                    {
                        'attr::age::marker': true,
                    },
                ],
            });
        }));
    });
    test('deleteCredential', () => __awaiter(void 0, void 0, void 0, function* () {
        getByCredentialIdMock.mockRejectedValueOnce(new Error());
        getByCredentialIdMock.mockResolvedValueOnce(new anoncreds_1.AnonCredsCredentialRecord({
            credential: {},
            credentialId: 'personCredId',
            linkSecretId: 'linkSecretId',
            issuerId: 'issuerDid',
            schemaIssuerId: 'schemaIssuerDid',
            schemaName: 'schemaName',
            schemaVersion: 'schemaVersion',
            methodName: 'inMemory',
        }));
        expect(anonCredsHolderService.deleteCredential(agentContext, 'credentialId')).rejects.toThrowError();
        yield anonCredsHolderService.deleteCredential(agentContext, 'credentialId');
        expect(getByCredentialIdMock).toHaveBeenCalledWith(agentContext, 'credentialId');
    }));
    test('getCredential', () => __awaiter(void 0, void 0, void 0, function* () {
        getByCredentialIdMock.mockRejectedValueOnce(new Error());
        getByCredentialIdMock.mockResolvedValueOnce(new anoncreds_1.AnonCredsCredentialRecord({
            credential: {
                cred_def_id: 'credDefId',
                schema_id: 'schemaId',
                signature: 'signature',
                signature_correctness_proof: 'signatureCorrectnessProof',
                values: { attr1: { raw: 'value1', encoded: 'encvalue1' }, attr2: { raw: 'value2', encoded: 'encvalue2' } },
                rev_reg_id: 'revRegId',
            },
            credentialId: 'myCredentialId',
            credentialRevocationId: 'credentialRevocationId',
            linkSecretId: 'linkSecretId',
            issuerId: 'issuerDid',
            schemaIssuerId: 'schemaIssuerDid',
            schemaName: 'schemaName',
            schemaVersion: 'schemaVersion',
            methodName: 'inMemory',
        }));
        expect(anonCredsHolderService.getCredential(agentContext, { credentialId: 'myCredentialId' })).rejects.toThrowError();
        const credentialInfo = yield anonCredsHolderService.getCredential(agentContext, { credentialId: 'myCredentialId' });
        expect(credentialInfo).toMatchObject({
            attributes: { attr1: 'value1', attr2: 'value2' },
            credentialDefinitionId: 'credDefId',
            credentialId: 'myCredentialId',
            revocationRegistryId: 'revRegId',
            schemaId: 'schemaId',
            credentialRevocationId: 'credentialRevocationId',
        });
    }));
    test('getCredentials', () => __awaiter(void 0, void 0, void 0, function* () {
        findByQueryMock.mockResolvedValueOnce([
            new anoncreds_1.AnonCredsCredentialRecord({
                credential: {
                    cred_def_id: 'credDefId',
                    schema_id: 'schemaId',
                    signature: 'signature',
                    signature_correctness_proof: 'signatureCorrectnessProof',
                    values: { attr1: { raw: 'value1', encoded: 'encvalue1' }, attr2: { raw: 'value2', encoded: 'encvalue2' } },
                    rev_reg_id: 'revRegId',
                },
                credentialId: 'myCredentialId',
                credentialRevocationId: 'credentialRevocationId',
                linkSecretId: 'linkSecretId',
                issuerId: 'issuerDid',
                schemaIssuerId: 'schemaIssuerDid',
                schemaName: 'schemaName',
                schemaVersion: 'schemaVersion',
                methodName: 'inMemory',
            }),
        ]);
        const credentialInfo = yield anonCredsHolderService.getCredentials(agentContext, {
            credentialDefinitionId: 'credDefId',
            schemaId: 'schemaId',
            schemaIssuerId: 'schemaIssuerDid',
            schemaName: 'schemaName',
            schemaVersion: 'schemaVersion',
            issuerId: 'issuerDid',
            methodName: 'inMemory',
        });
        expect(findByQueryMock).toHaveBeenCalledWith(agentContext, {
            credentialDefinitionId: 'credDefId',
            schemaId: 'schemaId',
            schemaIssuerId: 'schemaIssuerDid',
            schemaName: 'schemaName',
            schemaVersion: 'schemaVersion',
            issuerId: 'issuerDid',
            methodName: 'inMemory',
        });
        expect(credentialInfo).toMatchObject([
            {
                attributes: { attr1: 'value1', attr2: 'value2' },
                credentialDefinitionId: 'credDefId',
                credentialId: 'myCredentialId',
                revocationRegistryId: 'revRegId',
                schemaId: 'schemaId',
                credentialRevocationId: 'credentialRevocationId',
            },
        ]);
    }));
    test('storeCredential', () => __awaiter(void 0, void 0, void 0, function* () {
        const { credentialDefinition, credentialDefinitionPrivate, keyCorrectnessProof } = (0, helpers_2.createCredentialDefinition)({
            attributeNames: ['name', 'age', 'sex', 'height'],
            issuerId: 'issuer:uri',
        });
        const linkSecret = (0, helpers_2.createLinkSecret)();
        (0, helpers_1.mockFunction)(anoncredsLinkSecretRepositoryMock.getByLinkSecretId).mockResolvedValue(new anoncreds_1.AnonCredsLinkSecretRecord({ linkSecretId: 'linkSecretId', value: linkSecret }));
        const schema = {
            attrNames: ['name', 'sex', 'height', 'age'],
            issuerId: 'issuerId',
            name: 'schemaName',
            version: '1',
        };
        const { credential, revocationRegistryDefinition, credentialRequestMetadata } = (0, helpers_2.createCredentialForHolder)({
            attributes: {
                name: 'John',
                sex: 'M',
                height: '179',
                age: '19',
            },
            credentialDefinition: credentialDefinition,
            schemaId: 'personschema:uri',
            credentialDefinitionId: 'personcreddef:uri',
            credentialDefinitionPrivate,
            keyCorrectnessProof,
            linkSecret,
            linkSecretId: 'linkSecretId',
            credentialId: 'personCredId',
            revocationRegistryDefinitionId: 'personrevregid:uri',
        });
        const saveCredentialMock = jest.spyOn(anoncredsCredentialRepositoryMock, 'save');
        saveCredentialMock.mockResolvedValue();
        const credentialId = yield anonCredsHolderService.storeCredential(agentContext, {
            credential,
            credentialDefinition,
            schema,
            credentialDefinitionId: 'personcreddefid:uri',
            credentialRequestMetadata: credentialRequestMetadata.toJson(),
            credentialId: 'personCredId',
            revocationRegistry: {
                id: 'personrevregid:uri',
                definition: new anoncreds_nodejs_1.RevocationRegistryDefinition(revocationRegistryDefinition.handle).toJson(),
            },
        });
        expect(credentialId).toBe('personCredId');
        expect(saveCredentialMock).toHaveBeenCalledWith(agentContext, expect.objectContaining({
            // The stored credential is different from the one received originally
            credentialId: 'personCredId',
            linkSecretId: 'linkSecretId',
            _tags: expect.objectContaining({
                issuerId: credentialDefinition.issuerId,
                schemaName: 'schemaName',
                schemaIssuerId: 'issuerId',
                schemaVersion: '1',
            }),
        }));
    }));
});
