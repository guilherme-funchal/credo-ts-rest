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
const core_1 = require("@credo-ts/core");
const openid4vc_1 = require("@credo-ts/openid4vc");
const express_1 = __importDefault(require("express"));
const rxjs_1 = require("rxjs");
const supertest_1 = __importDefault(require("supertest"));
const helpers_1 = require("../../../../../tests/utils/helpers");
const setupApp_1 = require("../../../../setup/setupApp");
describe('OpenId4VcIssuanceSessionsController', () => {
    const app = (0, express_1.default)();
    let agent;
    let issuerDidKey;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = yield (0, helpers_1.getTestAgent)('OpenID4VC Issuance Sessions REST Agent Test', 4838);
        yield (0, setupApp_1.setupApp)({ agent, adminPort: 3000, baseApp: app });
        const didResult = yield agent.dids.create({
            method: 'key',
            options: {
                keyType: core_1.KeyType.Ed25519,
            },
        });
        issuerDidKey = core_1.DidKey.fromDid(didResult.didState.did);
        yield agent.modules.openId4VcIssuer.createIssuer({
            credentialsSupported: [
                {
                    id: 'SdJwtVcExample',
                    format: 'vc+sd-jwt',
                    vct: 'https://example.com/vct',
                },
            ],
            issuerId: 'publicIssuerId',
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    test('create offer', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`/openid4vc/issuers/sessions/create-offer`)
            .send({
            publicIssuerId: 'publicIssuerId',
            preAuthorizedCodeFlowConfig: {
                userPinRequired: false,
            },
            credentials: [
                {
                    credentialSupportedId: 'SdJwtVcExample',
                    format: 'vc+sd-jwt',
                    issuer: {
                        method: 'did',
                        didUrl: `${issuerDidKey.did}#${issuerDidKey.key.fingerprint}`,
                    },
                    payload: {
                        first_name: 'John',
                        age: {
                            over_21: true,
                            over_18: true,
                            over_65: false,
                        },
                    },
                    disclosureFrame: {
                        first_name: false,
                        age: {
                            over_21: true,
                            over_18: true,
                            over_65: true,
                        },
                    },
                },
            ],
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            issuanceSession: {
                createdAt: expect.any(String),
                credentialOfferPayload: {
                    credential_issuer: 'http://localhost:4838/oid4vci/publicIssuerId',
                    credentials: ['SdJwtVcExample'],
                    grants: {
                        'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
                            'pre-authorized_code': expect.any(String),
                            user_pin_required: false,
                        },
                    },
                },
                id: expect.any(String),
                publicIssuerId: expect.any(String),
                preAuthorizedCode: expect.any(String),
                state: 'OfferCreated',
                type: 'OpenId4VcIssuanceSessionRecord',
                updatedAt: expect.any(String),
                credentialOfferUri: expect.stringContaining('http://localhost:4838/oid4vci/publicIssuerId/offers/'),
                issuanceMetadata: {
                    credentials: [
                        {
                            credentialSupportedId: 'SdJwtVcExample',
                            format: 'vc+sd-jwt',
                            issuer: {
                                method: 'did',
                                didUrl: `${issuerDidKey.did}#${issuerDidKey.key.fingerprint}`,
                            },
                            payload: {
                                vct: 'https://example.com/vct',
                                first_name: 'John',
                                age: {
                                    over_21: true,
                                    over_18: true,
                                    over_65: false,
                                },
                            },
                            disclosureFrame: {
                                first_name: false,
                                age: {
                                    over_21: true,
                                    over_18: true,
                                    over_65: true,
                                },
                            },
                        },
                    ],
                },
            },
            credentialOffer: expect.stringContaining(`openid-credential-offer://?credential_offer_uri=${encodeURIComponent(`http://localhost:4838/oid4vci/publicIssuerId/offers/`)}`),
        });
        const credentialIssued = (0, rxjs_1.firstValueFrom)(agent.events
            .observable(openid4vc_1.OpenId4VcIssuerEvents.IssuanceSessionStateChanged)
            .pipe((0, rxjs_1.filter)((event) => event.payload.issuanceSession.state === openid4vc_1.OpenId4VcIssuanceSessionState.CredentialIssued &&
            event.payload.issuanceSession.id === response.body.issuanceSession.id), (0, rxjs_1.first)(), (0, rxjs_1.timeout)(10000)));
        const holderKey = yield agent.wallet.createKey({
            keyType: core_1.KeyType.Ed25519,
        });
        const holderDid = `did:key:${holderKey.fingerprint}`;
        const credentials = yield agent.modules.openId4VcHolder.acceptCredentialOfferUsingPreAuthorizedCode(yield agent.modules.openId4VcHolder.resolveCredentialOffer(response.body.credentialOffer), {
            credentialBindingResolver: () => __awaiter(void 0, void 0, void 0, function* () {
                return ({
                    method: 'did',
                    didUrl: `${holderDid}#${holderKey.fingerprint}`,
                });
            }),
        });
        yield credentialIssued;
        expect(credentials).toHaveLength(1);
        expect(credentials).toEqual([
            {
                compact: expect.any(String),
                header: { alg: 'EdDSA', kid: `#${issuerDidKey.key.fingerprint}`, typ: 'vc+sd-jwt' },
                payload: {
                    _sd_alg: 'sha-256',
                    age: {
                        _sd: [expect.any(String), expect.any(String), expect.any(String)],
                    },
                    cnf: {
                        kid: `${holderDid}#${holderKey.fingerprint}`,
                    },
                    first_name: 'John',
                    iat: expect.any(Number),
                    iss: issuerDidKey.did,
                    vct: 'https://example.com/vct',
                },
                prettyClaims: {
                    age: { over_18: true, over_21: true },
                    cnf: {
                        kid: `${holderDid}#${holderKey.fingerprint}`,
                    },
                    first_name: 'John',
                    iat: expect.any(Number),
                    iss: issuerDidKey.did,
                    vct: 'https://example.com/vct',
                },
            },
        ]);
    }));
});
