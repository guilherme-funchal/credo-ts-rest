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
const core_1 = require("@aries-framework/core");
const W3cCredentialsModuleConfig_1 = require("../../core/src/modules/vc/W3cCredentialsModuleConfig");
const SignatureSuiteRegistry_1 = require("../../core/src/modules/vc/data-integrity/SignatureSuiteRegistry");
const W3cJsonLdCredentialService_1 = require("../../core/src/modules/vc/data-integrity/W3cJsonLdCredentialService");
const documentLoader_1 = require("../../core/src/modules/vc/data-integrity/__tests__/documentLoader");
const LinkedDataProof_1 = require("../../core/src/modules/vc/data-integrity/models/LinkedDataProof");
const helpers_1 = require("../../core/tests/helpers");
const src_1 = require("../../indy-sdk/src");
const setupIndySdkModule_1 = require("../../indy-sdk/tests/setupIndySdkModule");
const src_2 = require("../src");
const fixtures_1 = require("./fixtures");
const util_1 = require("./util");
const { jsonldSignatures } = core_1.vcLibraries;
const { purposes } = jsonldSignatures;
const signatureSuiteRegistry = new SignatureSuiteRegistry_1.SignatureSuiteRegistry([
    {
        suiteClass: src_2.BbsBlsSignature2020,
        proofType: 'BbsBlsSignature2020',
        verificationMethodTypes: [core_1.VERIFICATION_METHOD_TYPE_BLS12381G2_KEY_2020],
        keyTypes: [core_1.KeyType.Bls12381g2],
    },
    {
        suiteClass: src_2.BbsBlsSignatureProof2020,
        proofType: 'BbsBlsSignatureProof2020',
        verificationMethodTypes: [core_1.VERIFICATION_METHOD_TYPE_BLS12381G2_KEY_2020],
        keyTypes: [core_1.KeyType.Bls12381g2],
    },
    {
        suiteClass: core_1.Ed25519Signature2018,
        proofType: 'Ed25519Signature2018',
        verificationMethodTypes: [core_1.VERIFICATION_METHOD_TYPE_ED25519_VERIFICATION_KEY_2018],
        keyTypes: [core_1.KeyType.Ed25519],
    },
]);
const signingProviderRegistry = new core_1.SigningProviderRegistry([new src_2.Bls12381g2SigningProvider()]);
const agentConfig = (0, helpers_1.getAgentConfig)('BbsSignaturesE2eTest');
(0, util_1.describeSkipNode17And18)('BBS W3cCredentialService', () => {
    let wallet;
    let agentContext;
    let w3cJsonLdCredentialService;
    let w3cCredentialService;
    const seed = core_1.TypedArrayEncoder.fromString('testseed000000000000000000000001');
    const privateKey = core_1.TypedArrayEncoder.fromString('testseed000000000000000000000001');
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
        w3cCredentialService = new core_1.W3cCredentialService({}, w3cJsonLdCredentialService, {});
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield wallet.delete();
    }));
    describe('Utility methods', () => {
        describe('getKeyTypesByProofType', () => {
            it('should return the correct key types for BbsBlsSignature2020 proof type', () => __awaiter(void 0, void 0, void 0, function* () {
                const keyTypes = w3cJsonLdCredentialService.getKeyTypesByProofType('BbsBlsSignature2020');
                expect(keyTypes).toEqual([core_1.KeyType.Bls12381g2]);
            }));
            it('should return the correct key types for BbsBlsSignatureProof2020 proof type', () => __awaiter(void 0, void 0, void 0, function* () {
                const keyTypes = w3cJsonLdCredentialService.getKeyTypesByProofType('BbsBlsSignatureProof2020');
                expect(keyTypes).toEqual([core_1.KeyType.Bls12381g2]);
            }));
        });
        describe('getVerificationMethodTypesByProofType', () => {
            it('should return the correct key types for BbsBlsSignature2020 proof type', () => __awaiter(void 0, void 0, void 0, function* () {
                const verificationMethodTypes = w3cJsonLdCredentialService.getVerificationMethodTypesByProofType('BbsBlsSignature2020');
                expect(verificationMethodTypes).toEqual([core_1.VERIFICATION_METHOD_TYPE_BLS12381G2_KEY_2020]);
            }));
            it('should return the correct key types for BbsBlsSignatureProof2020 proof type', () => __awaiter(void 0, void 0, void 0, function* () {
                const verificationMethodTypes = w3cJsonLdCredentialService.getVerificationMethodTypesByProofType('BbsBlsSignatureProof2020');
                expect(verificationMethodTypes).toEqual([core_1.VERIFICATION_METHOD_TYPE_BLS12381G2_KEY_2020]);
            }));
        });
    });
    describe('BbsBlsSignature2020', () => {
        let issuerDidKey;
        let verificationMethod;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            const key = yield wallet.createKey({ keyType: core_1.KeyType.Bls12381g2, seed });
            issuerDidKey = new core_1.DidKey(key);
            verificationMethod = `${issuerDidKey.did}#${issuerDidKey.key.fingerprint}`;
        }));
        describe('signCredential', () => {
            it('should return a successfully signed credential bbs', () => __awaiter(void 0, void 0, void 0, function* () {
                const credentialJson = fixtures_1.BbsBlsSignature2020Fixtures.TEST_LD_DOCUMENT;
                credentialJson.issuer = issuerDidKey.did;
                const credential = core_1.JsonTransformer.fromJSON(credentialJson, core_1.W3cCredential);
                const vc = yield w3cJsonLdCredentialService.signCredential(agentContext, {
                    format: core_1.ClaimFormat.LdpVc,
                    credential,
                    proofType: 'BbsBlsSignature2020',
                    verificationMethod: verificationMethod,
                });
                expect(vc).toBeInstanceOf(core_1.W3cJsonLdVerifiableCredential);
                expect(vc.issuer).toEqual(issuerDidKey.did);
                expect(Array.isArray(vc.proof)).toBe(false);
                expect(vc.proof).toBeInstanceOf(LinkedDataProof_1.LinkedDataProof);
                vc.proof = vc.proof;
                expect(vc.proof.verificationMethod).toEqual(verificationMethod);
            }));
        });
        describe('verifyCredential', () => {
            it('should verify the credential successfully', () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield w3cJsonLdCredentialService.verifyCredential(agentContext, {
                    credential: core_1.JsonTransformer.fromJSON(fixtures_1.BbsBlsSignature2020Fixtures.TEST_LD_DOCUMENT_SIGNED, core_1.W3cJsonLdVerifiableCredential),
                    proofPurpose: new purposes.AssertionProofPurpose(),
                });
                expect(result.isValid).toEqual(true);
            }));
        });
        describe('deriveProof', () => {
            it('should derive proof successfully', () => __awaiter(void 0, void 0, void 0, function* () {
                const credentialJson = fixtures_1.BbsBlsSignature2020Fixtures.TEST_LD_DOCUMENT_SIGNED;
                const vc = core_1.JsonTransformer.fromJSON(credentialJson, core_1.W3cJsonLdVerifiableCredential);
                const revealDocument = {
                    '@context': [
                        'https://www.w3.org/2018/credentials/v1',
                        'https://w3id.org/citizenship/v1',
                        'https://w3id.org/security/bbs/v1',
                    ],
                    type: ['VerifiableCredential', 'PermanentResidentCard'],
                    credentialSubject: {
                        '@explicit': true,
                        type: ['PermanentResident', 'Person'],
                        givenName: {},
                        familyName: {},
                        gender: {},
                    },
                };
                const result = yield w3cJsonLdCredentialService.deriveProof(agentContext, {
                    credential: vc,
                    revealDocument: revealDocument,
                    verificationMethod: verificationMethod,
                });
                result.proof = result.proof;
                expect(result.proof.verificationMethod).toBe('did:key:zUC74VEqqhEHQcgv4zagSPkqFJxuNWuoBPKjJuHETEUeHLoSqWt92viSsmaWjy82y2cgguc8e9hsGBifnVK67pQ4gve3m6iSboDkmJjxVEb1d6mRAx5fpMAejooNzNqqbTMVeUN#zUC74VEqqhEHQcgv4zagSPkqFJxuNWuoBPKjJuHETEUeHLoSqWt92viSsmaWjy82y2cgguc8e9hsGBifnVK67pQ4gve3m6iSboDkmJjxVEb1d6mRAx5fpMAejooNzNqqbTMVeUN');
            }));
        });
        describe('verifyDerived', () => {
            it('should verify the derived proof successfully', () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield w3cJsonLdCredentialService.verifyCredential(agentContext, {
                    credential: core_1.JsonTransformer.fromJSON(fixtures_1.BbsBlsSignature2020Fixtures.TEST_VALID_DERIVED, core_1.W3cJsonLdVerifiableCredential),
                    proofPurpose: new purposes.AssertionProofPurpose(),
                });
                expect(result.isValid).toEqual(true);
            }));
        });
        describe('createPresentation', () => {
            it('should create a presentation successfully', () => __awaiter(void 0, void 0, void 0, function* () {
                const vc = core_1.JsonTransformer.fromJSON(fixtures_1.BbsBlsSignature2020Fixtures.TEST_VALID_DERIVED, core_1.W3cJsonLdVerifiableCredential);
                const result = yield w3cCredentialService.createPresentation({ credentials: [vc] });
                expect(result).toBeInstanceOf(core_1.W3cPresentation);
                expect(result.type).toEqual(expect.arrayContaining(['VerifiablePresentation']));
                expect(result.verifiableCredential).toHaveLength(1);
                expect(result.verifiableCredential).toEqual(expect.arrayContaining([vc]));
            }));
        });
        describe('signPresentation', () => {
            it('should sign the presentation successfully', () => __awaiter(void 0, void 0, void 0, function* () {
                const signingKey = yield wallet.createKey({
                    privateKey,
                    keyType: core_1.KeyType.Ed25519,
                });
                const signingDidKey = new core_1.DidKey(signingKey);
                const verificationMethod = `${signingDidKey.did}#${signingDidKey.key.fingerprint}`;
                const presentation = core_1.JsonTransformer.fromJSON(fixtures_1.BbsBlsSignature2020Fixtures.TEST_VP_DOCUMENT, core_1.W3cPresentation);
                const purpose = new core_1.CredentialIssuancePurpose({
                    controller: {
                        id: 'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL#z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL',
                    },
                    date: new Date().toISOString(),
                });
                const verifiablePresentation = yield w3cJsonLdCredentialService.signPresentation(agentContext, {
                    format: core_1.ClaimFormat.LdpVp,
                    presentation: presentation,
                    proofPurpose: purpose,
                    proofType: 'Ed25519Signature2018',
                    challenge: 'e950bfe5-d7ec-4303-ad61-6983fb976ac9',
                    verificationMethod: verificationMethod,
                });
                expect(verifiablePresentation).toBeInstanceOf(core_1.W3cJsonLdVerifiablePresentation);
            }));
        });
        describe('verifyPresentation', () => {
            it('should successfully verify a presentation containing a single verifiable credential bbs', () => __awaiter(void 0, void 0, void 0, function* () {
                const vp = core_1.JsonTransformer.fromJSON(fixtures_1.BbsBlsSignature2020Fixtures.TEST_VP_DOCUMENT_SIGNED, core_1.W3cJsonLdVerifiablePresentation);
                const result = yield w3cJsonLdCredentialService.verifyPresentation(agentContext, {
                    presentation: vp,
                    challenge: 'e950bfe5-d7ec-4303-ad61-6983fb976ac9',
                });
                expect(result.isValid).toBe(true);
            }));
        });
    });
});
