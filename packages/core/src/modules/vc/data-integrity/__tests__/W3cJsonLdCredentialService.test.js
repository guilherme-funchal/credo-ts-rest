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
const src_1 = require("../../../../../../indy-sdk/src");
const setupIndySdkModule_1 = require("../../../../../../indy-sdk/tests/setupIndySdkModule");
const helpers_1 = require("../../../../../tests/helpers");
const crypto_1 = require("../../../../crypto");
const signing_provider_1 = require("../../../../crypto/signing-provider");
const utils_1 = require("../../../../utils");
const JsonTransformer_1 = require("../../../../utils/JsonTransformer");
const error_1 = require("../../../../wallet/error");
const dids_1 = require("../../../dids");
const W3cCredentialsModuleConfig_1 = require("../../W3cCredentialsModuleConfig");
const models_1 = require("../../models");
const W3cPresentation_1 = require("../../models/presentation/W3cPresentation");
const SignatureSuiteRegistry_1 = require("../SignatureSuiteRegistry");
const W3cJsonLdCredentialService_1 = require("../W3cJsonLdCredentialService");
const models_2 = require("../models");
const LinkedDataProof_1 = require("../models/LinkedDataProof");
const W3cJsonLdVerifiablePresentation_1 = require("../models/W3cJsonLdVerifiablePresentation");
const CredentialIssuancePurpose_1 = require("../proof-purposes/CredentialIssuancePurpose");
const signature_suites_1 = require("../signature-suites");
const documentLoader_1 = require("./documentLoader");
const fixtures_1 = require("./fixtures");
const signatureSuiteRegistry = new SignatureSuiteRegistry_1.SignatureSuiteRegistry([
    {
        suiteClass: signature_suites_1.Ed25519Signature2018,
        proofType: 'Ed25519Signature2018',
        verificationMethodTypes: [
            dids_1.VERIFICATION_METHOD_TYPE_ED25519_VERIFICATION_KEY_2018,
            dids_1.VERIFICATION_METHOD_TYPE_ED25519_VERIFICATION_KEY_2020,
        ],
        keyTypes: [crypto_1.KeyType.Ed25519],
    },
]);
const signingProviderRegistry = new signing_provider_1.SigningProviderRegistry([]);
const agentConfig = (0, helpers_1.getAgentConfig)('W3cJsonLdCredentialServiceTest');
describe('W3cJsonLdCredentialsService', () => {
    let wallet;
    let agentContext;
    let w3cJsonLdCredentialService;
    const privateKey = utils_1.TypedArrayEncoder.fromString('testseed000000000000000000000001');
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        wallet = new src_1.IndySdkWallet(setupIndySdkModule_1.indySdk, agentConfig.logger, signingProviderRegistry);
        yield wallet.createAndOpen(agentConfig.walletConfig);
        agentContext = (0, helpers_1.getAgentContext)({
            agentConfig,
            wallet,
        });
        w3cJsonLdCredentialService = new W3cJsonLdCredentialService_1.W3cJsonLdCredentialService(signatureSuiteRegistry, new W3cCredentialsModuleConfig_1.W3cCredentialsModuleConfig({
            documentLoader: documentLoader_1.customDocumentLoader,
        }));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield wallet.delete();
    }));
    describe('Utility methods', () => {
        describe('getKeyTypesByProofType', () => {
            it('should return the correct key types for Ed25519Signature2018 proof type', () => __awaiter(void 0, void 0, void 0, function* () {
                const keyTypes = w3cJsonLdCredentialService.getKeyTypesByProofType('Ed25519Signature2018');
                expect(keyTypes).toEqual([crypto_1.KeyType.Ed25519]);
            }));
        });
        describe('getVerificationMethodTypesByProofType', () => {
            it('should return the correct key types for Ed25519Signature2018 proof type', () => __awaiter(void 0, void 0, void 0, function* () {
                const verificationMethodTypes = w3cJsonLdCredentialService.getVerificationMethodTypesByProofType('Ed25519Signature2018');
                expect(verificationMethodTypes).toEqual([
                    dids_1.VERIFICATION_METHOD_TYPE_ED25519_VERIFICATION_KEY_2018,
                    dids_1.VERIFICATION_METHOD_TYPE_ED25519_VERIFICATION_KEY_2020,
                ]);
            }));
        });
    });
    describe('Ed25519Signature2018', () => {
        let issuerDidKey;
        let verificationMethod;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // TODO: update to use did registrar
            const issuerKey = yield wallet.createKey({
                keyType: crypto_1.KeyType.Ed25519,
                privateKey,
            });
            issuerDidKey = new dids_1.DidKey(issuerKey);
            verificationMethod = `${issuerDidKey.did}#${issuerDidKey.key.fingerprint}`;
        }));
        describe('signCredential', () => {
            it('should return a successfully signed credential', () => __awaiter(void 0, void 0, void 0, function* () {
                const credentialJson = fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT;
                const credential = JsonTransformer_1.JsonTransformer.fromJSON(credentialJson, models_1.W3cCredential);
                const vc = yield w3cJsonLdCredentialService.signCredential(agentContext, {
                    format: models_1.ClaimFormat.LdpVc,
                    credential,
                    proofType: 'Ed25519Signature2018',
                    verificationMethod: verificationMethod,
                });
                expect(vc).toBeInstanceOf(models_2.W3cJsonLdVerifiableCredential);
                expect(vc.issuer).toEqual(issuerDidKey.did);
                expect(Array.isArray(vc.proof)).toBe(false);
                expect(vc.proof).toBeInstanceOf(LinkedDataProof_1.LinkedDataProof);
                expect((0, utils_1.asArray)(vc.proof)[0].verificationMethod).toEqual(verificationMethod);
            }));
            it('should throw because of verificationMethod does not belong to this wallet', () => __awaiter(void 0, void 0, void 0, function* () {
                const credentialJson = fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT;
                credentialJson.issuer = issuerDidKey.did;
                const credential = JsonTransformer_1.JsonTransformer.fromJSON(credentialJson, models_1.W3cCredential);
                expect(() => __awaiter(void 0, void 0, void 0, function* () {
                    yield w3cJsonLdCredentialService.signCredential(agentContext, {
                        format: models_1.ClaimFormat.LdpVc,
                        credential,
                        proofType: 'Ed25519Signature2018',
                        verificationMethod: 'did:key:z6MkvePyWAApUVeDboZhNbckaWHnqtD6pCETd6xoqGbcpEBV#z6MkvePyWAApUVeDboZhNbckaWHnqtD6pCETd6xoqGbcpEBV',
                    });
                })).rejects.toThrowError(error_1.WalletError);
            }));
        });
        describe('verifyCredential', () => {
            it('should verify a credential successfully', () => __awaiter(void 0, void 0, void 0, function* () {
                const vc = JsonTransformer_1.JsonTransformer.fromJSON(fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED, models_2.W3cJsonLdVerifiableCredential);
                const result = yield w3cJsonLdCredentialService.verifyCredential(agentContext, { credential: vc });
                expect(result).toEqual({
                    isValid: true,
                    error: undefined,
                    validations: {
                        vcJs: {
                            isValid: true,
                            results: expect.any(Array),
                        },
                    },
                });
            }));
            it('should fail because of invalid signature', () => __awaiter(void 0, void 0, void 0, function* () {
                const vc = JsonTransformer_1.JsonTransformer.fromJSON(fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_BAD_SIGNED, models_2.W3cJsonLdVerifiableCredential);
                const result = yield w3cJsonLdCredentialService.verifyCredential(agentContext, { credential: vc });
                expect(result).toEqual({
                    isValid: false,
                    error: expect.any(Error),
                    validations: {
                        vcJs: {
                            error: expect.any(Error),
                            isValid: false,
                            results: expect.any(Array),
                        },
                    },
                });
            }));
            it('should fail because of an unsigned statement', () => __awaiter(void 0, void 0, void 0, function* () {
                const vcJson = Object.assign(Object.assign({}, fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED), { credentialSubject: Object.assign(Object.assign({}, fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED.credentialSubject), { alumniOf: 'oops' }) });
                const vc = JsonTransformer_1.JsonTransformer.fromJSON(vcJson, models_2.W3cJsonLdVerifiableCredential);
                const result = yield w3cJsonLdCredentialService.verifyCredential(agentContext, { credential: vc });
                expect(result).toEqual({
                    isValid: false,
                    error: expect.any(Error),
                    validations: {
                        vcJs: {
                            error: expect.any(Error),
                            isValid: false,
                            results: expect.any(Array),
                        },
                    },
                });
            }));
            it('should fail because of a changed statement', () => __awaiter(void 0, void 0, void 0, function* () {
                const vcJson = Object.assign(Object.assign({}, fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED), { credentialSubject: Object.assign(Object.assign({}, fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED.credentialSubject), { degree: Object.assign(Object.assign({}, fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED.credentialSubject.degree), { name: 'oops' }) }) });
                const vc = JsonTransformer_1.JsonTransformer.fromJSON(vcJson, models_2.W3cJsonLdVerifiableCredential);
                const result = yield w3cJsonLdCredentialService.verifyCredential(agentContext, { credential: vc });
                expect(result).toEqual({
                    isValid: false,
                    error: expect.any(Error),
                    validations: {
                        vcJs: {
                            error: expect.any(Error),
                            isValid: false,
                            results: expect.any(Array),
                        },
                    },
                });
            }));
        });
        describe('signPresentation', () => {
            it('should successfully create a presentation from single verifiable credential', () => __awaiter(void 0, void 0, void 0, function* () {
                const presentation = JsonTransformer_1.JsonTransformer.fromJSON(fixtures_1.Ed25519Signature2018Fixtures.TEST_VP_DOCUMENT, W3cPresentation_1.W3cPresentation);
                const purpose = new CredentialIssuancePurpose_1.CredentialIssuancePurpose({
                    controller: {
                        id: 'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL#z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL',
                    },
                    date: new Date().toISOString(),
                });
                const verifiablePresentation = yield w3cJsonLdCredentialService.signPresentation(agentContext, {
                    format: models_1.ClaimFormat.LdpVp,
                    presentation: presentation,
                    proofPurpose: purpose,
                    proofType: 'Ed25519Signature2018',
                    challenge: '7bf32d0b-39d4-41f3-96b6-45de52988e4c',
                    domain: 'issuer.example.com',
                    verificationMethod: verificationMethod,
                });
                expect(verifiablePresentation).toBeInstanceOf(W3cJsonLdVerifiablePresentation_1.W3cJsonLdVerifiablePresentation);
            }));
        });
        describe('verifyPresentation', () => {
            it('should successfully verify a presentation containing a single verifiable credential', () => __awaiter(void 0, void 0, void 0, function* () {
                const vp = JsonTransformer_1.JsonTransformer.fromJSON(fixtures_1.Ed25519Signature2018Fixtures.TEST_VP_DOCUMENT_SIGNED, W3cJsonLdVerifiablePresentation_1.W3cJsonLdVerifiablePresentation);
                const result = yield w3cJsonLdCredentialService.verifyPresentation(agentContext, {
                    presentation: vp,
                    challenge: '7bf32d0b-39d4-41f3-96b6-45de52988e4c',
                });
                expect(result).toEqual({
                    isValid: true,
                    error: undefined,
                    validations: {
                        vcJs: {
                            isValid: true,
                            presentationResult: expect.any(Object),
                            credentialResults: expect.any(Array),
                        },
                    },
                });
            }));
            it('should fail when presentation signature is not valid', () => __awaiter(void 0, void 0, void 0, function* () {
                const vp = JsonTransformer_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, fixtures_1.Ed25519Signature2018Fixtures.TEST_VP_DOCUMENT_SIGNED), { proof: Object.assign(Object.assign({}, fixtures_1.Ed25519Signature2018Fixtures.TEST_VP_DOCUMENT_SIGNED.proof), { jws: fixtures_1.Ed25519Signature2018Fixtures.TEST_VP_DOCUMENT_SIGNED.proof.jws + 'a' }) }), W3cJsonLdVerifiablePresentation_1.W3cJsonLdVerifiablePresentation);
                const result = yield w3cJsonLdCredentialService.verifyPresentation(agentContext, {
                    presentation: vp,
                    challenge: '7bf32d0b-39d4-41f3-96b6-45de52988e4c',
                });
                expect(result).toEqual({
                    isValid: false,
                    error: expect.any(Error),
                    validations: {
                        vcJs: {
                            isValid: false,
                            credentialResults: expect.any(Array),
                            presentationResult: expect.any(Object),
                            error: expect.any(Error),
                        },
                    },
                });
            }));
        });
    });
});
