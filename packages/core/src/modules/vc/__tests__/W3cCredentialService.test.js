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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../../../../indy-sdk/src");
const tests_1 = require("../../../../tests");
const crypto_1 = require("../../../crypto");
const utils_1 = require("../../../utils");
const W3cCredentialService_1 = require("../W3cCredentialService");
const W3cCredentialsModuleConfig_1 = require("../W3cCredentialsModuleConfig");
const data_integrity_1 = require("../data-integrity");
const SignatureSuiteRegistry_1 = require("../data-integrity/SignatureSuiteRegistry");
const W3cJsonLdCredentialService_1 = require("../data-integrity/W3cJsonLdCredentialService");
const documentLoader_1 = require("../data-integrity/__tests__/documentLoader");
const fixtures_1 = require("../data-integrity/__tests__/fixtures");
const jsonld_1 = __importDefault(require("../data-integrity/libraries/jsonld"));
const jwt_vc_1 = require("../jwt-vc");
const models_1 = require("../models");
const repository_1 = require("../repository");
const signingProviderRegistry = new crypto_1.SigningProviderRegistry([]);
jest.mock('../repository/W3cCredentialRepository');
const W3cCredentialsRepositoryMock = repository_1.W3cCredentialRepository;
const agentConfig = (0, tests_1.getAgentConfig)('W3cCredentialServiceTest');
// Helper func
const credentialRecordFactory = (credential) => __awaiter(void 0, void 0, void 0, function* () {
    const expandedTypes = (yield jsonld_1.default.expand(utils_1.JsonTransformer.toJSON(credential), { documentLoader: (0, documentLoader_1.customDocumentLoader)() }))[0]['@type'];
    // Create an instance of the w3cCredentialRecord
    return new repository_1.W3cCredentialRecord({
        tags: { expandedTypes: (0, utils_1.asArray)(expandedTypes) },
        credential: credential,
    });
});
const credentialsModuleConfig = new W3cCredentialsModuleConfig_1.W3cCredentialsModuleConfig({
    documentLoader: documentLoader_1.customDocumentLoader,
});
describe('W3cCredentialsService', () => {
    let wallet;
    let agentContext;
    let w3cCredentialService;
    let w3cCredentialsRepository;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        wallet = new src_1.IndySdkWallet(tests_1.indySdk, agentConfig.logger, signingProviderRegistry);
        yield wallet.createAndOpen(agentConfig.walletConfig);
        agentContext = (0, tests_1.getAgentContext)({
            agentConfig,
            wallet,
        });
        w3cCredentialsRepository = new W3cCredentialsRepositoryMock();
        w3cCredentialService = new W3cCredentialService_1.W3cCredentialService(w3cCredentialsRepository, new W3cJsonLdCredentialService_1.W3cJsonLdCredentialService(new SignatureSuiteRegistry_1.SignatureSuiteRegistry([]), credentialsModuleConfig), new jwt_vc_1.W3cJwtCredentialService(new crypto_1.JwsService()));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield wallet.delete();
    }));
    describe('createPresentation', () => {
        it('should successfully create a presentation from single verifiable credential', () => __awaiter(void 0, void 0, void 0, function* () {
            const vc = utils_1.JsonTransformer.fromJSON(fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED, data_integrity_1.W3cJsonLdVerifiableCredential);
            const result = yield w3cCredentialService.createPresentation({ credentials: [vc] });
            expect(result).toBeInstanceOf(models_1.W3cPresentation);
            expect(result.type).toEqual(expect.arrayContaining(['VerifiablePresentation']));
            expect(result.verifiableCredential).toHaveLength(1);
            expect(result.verifiableCredential).toEqual([vc]);
        }));
        it('should successfully create a presentation from two verifiable credential', () => __awaiter(void 0, void 0, void 0, function* () {
            const vc1 = utils_1.JsonTransformer.fromJSON(fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED, data_integrity_1.W3cJsonLdVerifiableCredential);
            const vc2 = utils_1.JsonTransformer.fromJSON(fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED, data_integrity_1.W3cJsonLdVerifiableCredential);
            const vcs = [vc1, vc2];
            const result = yield w3cCredentialService.createPresentation({ credentials: vcs });
            expect(result).toBeInstanceOf(models_1.W3cPresentation);
            expect(result.type).toEqual(expect.arrayContaining(['VerifiablePresentation']));
            expect(result.verifiableCredential).toHaveLength(2);
            expect(result.verifiableCredential).toEqual(expect.arrayContaining([vc1, vc2]));
        }));
    });
    describe('Credential Storage', () => {
        let w3cCredentialRecord;
        let w3cCredentialRepositoryDeleteMock;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const credential = utils_1.JsonTransformer.fromJSON(fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED, data_integrity_1.W3cJsonLdVerifiableCredential);
            w3cCredentialRecord = yield credentialRecordFactory(credential);
            (0, tests_1.mockFunction)(w3cCredentialsRepository.getById).mockResolvedValue(w3cCredentialRecord);
            (0, tests_1.mockFunction)(w3cCredentialsRepository.getAll).mockResolvedValue([w3cCredentialRecord]);
            w3cCredentialRepositoryDeleteMock = (0, tests_1.mockFunction)(w3cCredentialsRepository.deleteById).mockResolvedValue();
        }));
        describe('storeCredential', () => {
            it('should store a credential and expand the tags correctly', () => __awaiter(void 0, void 0, void 0, function* () {
                const credential = utils_1.JsonTransformer.fromJSON(fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED, data_integrity_1.W3cJsonLdVerifiableCredential);
                w3cCredentialRecord = yield w3cCredentialService.storeCredential(agentContext, { credential: credential });
                expect(w3cCredentialRecord).toMatchObject({
                    type: 'W3cCredentialRecord',
                    id: expect.any(String),
                    createdAt: expect.any(Date),
                    credential: expect.any(data_integrity_1.W3cJsonLdVerifiableCredential),
                });
                expect(w3cCredentialRecord.getTags()).toMatchObject({
                    expandedTypes: [
                        'https://www.w3.org/2018/credentials#VerifiableCredential',
                        'https://example.org/examples#UniversityDegreeCredential',
                    ],
                });
            }));
        });
        describe('removeCredentialRecord', () => {
            it('should remove a credential', () => __awaiter(void 0, void 0, void 0, function* () {
                yield w3cCredentialService.removeCredentialRecord(agentContext, 'some-id');
                expect(w3cCredentialRepositoryDeleteMock).toBeCalledWith(agentContext, 'some-id');
            }));
        });
        describe('getAllCredentialRecords', () => {
            it('should retrieve all W3cCredentialRecords', () => __awaiter(void 0, void 0, void 0, function* () {
                const credential = utils_1.JsonTransformer.fromJSON(fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED, data_integrity_1.W3cJsonLdVerifiableCredential);
                yield w3cCredentialService.storeCredential(agentContext, { credential: credential });
                const records = yield w3cCredentialService.getAllCredentialRecords(agentContext);
                expect(records.length).toEqual(1);
            }));
        });
        describe('getCredentialRecordById', () => {
            it('should retrieve a W3cCredentialRecord by id', () => __awaiter(void 0, void 0, void 0, function* () {
                const credential = yield w3cCredentialService.getCredentialRecordById(agentContext, w3cCredentialRecord.id);
                expect(credential.id).toEqual(w3cCredentialRecord.id);
            }));
        });
    });
});
