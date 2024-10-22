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
const runInVersion_1 = require("../../../../../../../tests/runInVersion");
const helpers_1 = require("../../../../../../askar/tests/helpers");
const tests_1 = require("../../../../../tests");
const constants_1 = require("../../../../constants");
const crypto_1 = require("../../../../crypto");
const jwa_1 = require("../../../../crypto/jose/jwa");
const jwk_1 = require("../../../../crypto/jose/jwk");
const error_1 = require("../../../../error");
const utils_1 = require("../../../../utils");
const dids_1 = require("../../../dids");
const constants_2 = require("../../constants");
const models_1 = require("../../models");
const W3cJwtCredentialService_1 = require("../W3cJwtCredentialService");
const W3cJwtVerifiableCredential_1 = require("../W3cJwtVerifiableCredential");
const afj_jwt_vc_1 = require("./fixtures/afj-jwt-vc");
const jwt_vc_presentation_profile_1 = require("./fixtures/jwt-vc-presentation-profile");
const transmute_verifiable_data_1 = require("./fixtures/transmute-verifiable-data");
const config = (0, tests_1.getAgentConfig)('W3cJwtCredentialService');
const wallet = new helpers_1.RegisteredAskarTestWallet(config.logger, new tests_1.agentDependencies.FileSystem(), new crypto_1.SigningProviderRegistry([]));
const agentContext = (0, tests_1.getAgentContext)({
    wallet,
    registerInstances: [
        [constants_1.InjectionSymbols.Logger, tests_1.testLogger],
        [dids_1.DidsModuleConfig, new dids_1.DidsModuleConfig()],
    ],
    agentConfig: config,
});
const jwsService = new crypto_1.JwsService();
const w3cJwtCredentialService = new W3cJwtCredentialService_1.W3cJwtCredentialService(jwsService);
// Runs in Node 18 because of usage of Askar
(0, runInVersion_1.describeRunInNodeVersion)([18], 'W3cJwtCredentialService', () => {
    let issuerDidJwk;
    let holderDidKey;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield wallet.createAndOpen(config.walletConfig);
        const issuerKey = yield agentContext.wallet.createKey({
            keyType: crypto_1.KeyType.P256,
            seed: afj_jwt_vc_1.AfjEs256DidJwkJwtVcIssuerSeed,
        });
        issuerDidJwk = dids_1.DidJwk.fromJwk((0, jwk_1.getJwkFromKey)(issuerKey));
        const holderKey = yield agentContext.wallet.createKey({
            keyType: crypto_1.KeyType.Ed25519,
            seed: afj_jwt_vc_1.AfjEs256DidJwkJwtVcSubjectSeed,
        });
        holderDidKey = new dids_1.DidKey(holderKey);
    }));
    describe('signCredential', () => {
        test('signs an ES256 JWT vc', () => __awaiter(void 0, void 0, void 0, function* () {
            const credential = utils_1.JsonTransformer.fromJSON(afj_jwt_vc_1.Ed256DidJwkJwtVcUnsigned, models_1.W3cCredential);
            const vcJwt = yield w3cJwtCredentialService.signCredential(agentContext, {
                alg: jwa_1.JwaSignatureAlgorithm.ES256,
                format: models_1.ClaimFormat.JwtVc,
                verificationMethod: issuerDidJwk.verificationMethodId,
                credential,
            });
            expect(vcJwt.serializedJwt).toEqual(afj_jwt_vc_1.AfjEs256DidJwkJwtVc);
        }));
        test('throws when invalid credential is passed', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialJson = {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                type: ['VerifiableCredential'],
                issuer: 'did:jwk:eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6InpRT293SUMxZ1dKdGRkZEI1R0F0NGxhdTZMdDhJaHk3NzFpQWZhbS0xcGMiLCJ5IjoiY2pEXzdvM2dkUTF2Z2lReTNfc01HczdXcndDTVU5RlFZaW1BM0h4bk1sdyJ9',
                issuanceDate: '2023-01-25T16:58:06.292Z',
                credentialSubject: {
                    id: 'did:key:z6MkqgkLrRyLg6bqk27djwbbaQWgaSYgFVCKq9YKxZbNkpVv',
                },
            };
            // Throw when verificationMethod is not a did
            yield expect(w3cJwtCredentialService.signCredential(agentContext, {
                verificationMethod: 'hello',
                alg: jwa_1.JwaSignatureAlgorithm.ES256,
                credential: utils_1.JsonTransformer.fromJSON(credentialJson, models_1.W3cCredential),
                format: models_1.ClaimFormat.JwtVc,
            })).rejects.toThrowError('Only did identifiers are supported as verification method');
            // Throw when not according to data model
            yield expect(w3cJwtCredentialService.signCredential(agentContext, {
                verificationMethod: issuerDidJwk.verificationMethodId,
                alg: jwa_1.JwaSignatureAlgorithm.ES256,
                credential: utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, credentialJson), { issuanceDate: undefined }), models_1.W3cCredential, {
                    validate: false,
                }),
                format: models_1.ClaimFormat.JwtVc,
            })).rejects.toThrowError('property issuanceDate has failed the following constraints: issuanceDate must be RFC 3339 date');
            // Throw when verificationMethod id does not exist in did document
            yield expect(w3cJwtCredentialService.signCredential(agentContext, {
                verificationMethod: issuerDidJwk.verificationMethodId + 'extra',
                alg: jwa_1.JwaSignatureAlgorithm.ES256,
                credential: utils_1.JsonTransformer.fromJSON(credentialJson, models_1.W3cCredential),
                format: models_1.ClaimFormat.JwtVc,
            })).rejects.toThrowError(`Unable to locate verification method with id 'did:jwk:eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6InpRT293SUMxZ1dKdGRkZEI1R0F0NGxhdTZMdDhJaHk3NzFpQWZhbS0xcGMiLCJ5IjoiY2pEXzdvM2dkUTF2Z2lReTNfc01HczdXcndDTVU5RlFZaW1BM0h4bk1sdyJ9#0extra' in purposes assertionMethod`);
        }));
    });
    describe('verifyCredential', () => {
        // Fails because the `jti` is not an uri (and the `vc.id` MUST be an uri according to vc data model)
        test.skip('verifies a vc from the vc-jwt-presentation-profile', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield w3cJwtCredentialService.verifyCredential(agentContext, {
                credential: jwt_vc_presentation_profile_1.didIonJwtVcPresentationProfileJwtVc,
                verifyCredentialStatus: false,
            });
            expect(result).toMatchObject({
                verified: true,
            });
        }));
        test('verifies an ES256 JWT vc signed by AFJ', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield w3cJwtCredentialService.verifyCredential(agentContext, {
                credential: afj_jwt_vc_1.AfjEs256DidJwkJwtVc,
            });
            expect(result).toEqual({
                isValid: true,
                validations: {
                    // credential has no credentialStatus, so always valid
                    credentialStatus: {
                        isValid: true,
                    },
                    // This both validates whether the credential matches the
                    // data model, as well as whether the credential is expired etc..
                    dataModel: {
                        isValid: true,
                    },
                    // This validates whether the signature is valid
                    signature: {
                        isValid: true,
                    },
                    // This validates whether the issuer is also the signer of the credential
                    issuerIsSigner: {
                        isValid: true,
                    },
                },
            });
        }));
        test('verifies an EdDSA JWT vc from the transmute vc.js library', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield w3cJwtCredentialService.verifyCredential(agentContext, {
                credential: transmute_verifiable_data_1.didKeyTransmuteJwtVc,
            });
            expect(result).toEqual({
                isValid: true,
                validations: {
                    // credential has no credentialStatus, so always valid
                    credentialStatus: {
                        isValid: true,
                    },
                    // This both validates whether the credential matches the
                    // data model, as well as whether the credential is expired etc..
                    dataModel: {
                        isValid: true,
                    },
                    // This validates whether the signature is valid
                    signature: {
                        isValid: true,
                    },
                    // This validates whether the issuer is also the signer of the credential
                    issuerIsSigner: {
                        isValid: true,
                    },
                },
            });
        }));
        test('returns invalid result when credential is not according to data model', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const jwtVc = W3cJwtVerifiableCredential_1.W3cJwtVerifiableCredential.fromSerializedJwt(afj_jwt_vc_1.AfjEs256DidJwkJwtVc);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            delete jwtVc.credential.issuer;
            const result = yield w3cJwtCredentialService.verifyCredential(agentContext, {
                credential: jwtVc,
                verifyCredentialStatus: false,
            });
            expect(result).toEqual({
                isValid: false,
                validations: {
                    dataModel: {
                        isValid: false,
                        error: expect.any(error_1.ClassValidationError),
                    },
                },
            });
            expect((_b = (_a = result.validations.dataModel) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.message).toContain('Failed to validate class');
        }));
        test('returns invalid result when credential is expired', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const jwtVc = W3cJwtVerifiableCredential_1.W3cJwtVerifiableCredential.fromSerializedJwt(afj_jwt_vc_1.AfjEs256DidJwkJwtVc);
            jwtVc.jwt.payload.exp = new Date('2020-01-01').getTime() / 1000;
            const result = yield w3cJwtCredentialService.verifyCredential(agentContext, {
                credential: jwtVc,
                verifyCredentialStatus: false,
            });
            expect(result).toEqual({
                isValid: false,
                validations: {
                    dataModel: {
                        isValid: false,
                        error: expect.any(error_1.AriesFrameworkError),
                    },
                },
            });
            expect((_b = (_a = result.validations.dataModel) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.message).toContain('JWT expired at 1577836800');
        }));
        test('returns invalid result when signature is not valid', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const jwtVc = W3cJwtVerifiableCredential_1.W3cJwtVerifiableCredential.fromSerializedJwt(afj_jwt_vc_1.AfjEs256DidJwkJwtVc + 'a');
            const result = yield w3cJwtCredentialService.verifyCredential(agentContext, {
                credential: jwtVc,
            });
            expect(result).toEqual({
                isValid: false,
                validations: {
                    dataModel: {
                        isValid: true,
                    },
                    signature: {
                        isValid: false,
                        error: expect.any(error_1.AriesFrameworkError),
                    },
                    issuerIsSigner: {
                        isValid: false,
                        error: expect.any(error_1.AriesFrameworkError),
                    },
                    credentialStatus: {
                        isValid: true,
                    },
                },
            });
            expect((_b = (_a = result.validations.signature) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.message).toContain('Invalid JWS signature');
        }));
    });
    describe('signPresentation', () => {
        test('signs an ES256 JWT vp', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a new instance of the credential from the serialized JWT
            const parsedJwtVc = W3cJwtVerifiableCredential_1.W3cJwtVerifiableCredential.fromSerializedJwt(afj_jwt_vc_1.AfjEs256DidJwkJwtVc);
            const presentation = new models_1.W3cPresentation({
                context: [constants_2.CREDENTIALS_CONTEXT_V1_URL],
                type: ['VerifiablePresentation'],
                verifiableCredential: [parsedJwtVc],
                id: 'urn:21ff21f1-3cf9-4fa3-88b4-a045efbb1b5f',
                holder: holderDidKey.did,
            });
            const signedJwtVp = yield w3cJwtCredentialService.signPresentation(agentContext, {
                presentation,
                alg: jwa_1.JwaSignatureAlgorithm.EdDSA,
                challenge: 'daf942ad-816f-45ee-a9fc-facd08e5abca',
                domain: 'example.com',
                format: models_1.ClaimFormat.JwtVp,
                verificationMethod: `${holderDidKey.did}#${holderDidKey.key.fingerprint}`,
            });
            expect(signedJwtVp.serializedJwt).toEqual(afj_jwt_vc_1.AfjEs256DidKeyJwtVp);
        }));
    });
    describe('verifyPresentation', () => {
        test('verifies an ES256 JWT vp signed by AFJ', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield w3cJwtCredentialService.verifyPresentation(agentContext, {
                presentation: afj_jwt_vc_1.AfjEs256DidKeyJwtVp,
                challenge: 'daf942ad-816f-45ee-a9fc-facd08e5abca',
                domain: 'example.com',
            });
            expect(result).toEqual({
                isValid: true,
                validations: {
                    dataModel: {
                        isValid: true,
                    },
                    presentationSignature: {
                        isValid: true,
                    },
                    holderIsSigner: {
                        isValid: true,
                    },
                    credentials: [
                        {
                            isValid: true,
                            validations: {
                                dataModel: {
                                    isValid: true,
                                },
                                signature: {
                                    isValid: true,
                                },
                                issuerIsSigner: {
                                    isValid: true,
                                },
                                credentialStatus: {
                                    isValid: true,
                                },
                                credentialSubjectAuthentication: {
                                    isValid: true,
                                },
                            },
                        },
                    ],
                },
            });
        }));
        // NOTE: this test doesn't fully succeed because the VP from the transmute
        // library doesn't authenticate the credentialSubject.id in the credential
        // in the VP. For now, all VPs must authenticate the credentialSubject, if
        // the credential has a credential subject id (so it's not a bearer credential)
        test('verifies an EdDSA JWT vp from the transmute vc.js library', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield w3cJwtCredentialService.verifyPresentation(agentContext, {
                presentation: transmute_verifiable_data_1.didKeyTransmuteJwtVp,
                challenge: '123',
                domain: 'example.com',
            });
            expect(result).toEqual({
                isValid: false,
                validations: {
                    dataModel: {
                        isValid: true,
                    },
                    presentationSignature: {
                        isValid: true,
                    },
                    holderIsSigner: {
                        isValid: true,
                    },
                    credentials: [
                        {
                            isValid: false,
                            validations: {
                                dataModel: {
                                    isValid: true,
                                },
                                signature: {
                                    isValid: true,
                                },
                                issuerIsSigner: {
                                    isValid: true,
                                },
                                credentialStatus: {
                                    isValid: true,
                                },
                                credentialSubjectAuthentication: {
                                    isValid: false,
                                    error: new error_1.AriesFrameworkError('Credential has one or more credentialSubject ids, but presentation does not authenticate credential subject'),
                                },
                            },
                        },
                    ],
                },
            });
        }));
    });
});
