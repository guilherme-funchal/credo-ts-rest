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
describe('OpenId4VcVerificationSessionsController', () => {
    const app = (0, express_1.default)();
    let agent;
    let issuerDidKey;
    let holderDidKey;
    let holderSdJwtVcRecord;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = yield (0, helpers_1.getTestAgent)('OpenID4VC Verifications Sessions REST Agent Test', 4848);
        yield (0, setupApp_1.setupApp)({ agent, adminPort: 3000, baseApp: app });
        yield agent.modules.openId4VcVerifier.createVerifier({
            verifierId: 'publicVerifierId',
        });
        const issuerDidResult = yield agent.dids.create({
            method: 'key',
            options: {
                keyType: core_1.KeyType.Ed25519,
            },
        });
        const holderDidResult = yield agent.dids.create({
            method: 'key',
            options: {
                keyType: core_1.KeyType.Ed25519,
            },
        });
        issuerDidKey = core_1.DidKey.fromDid(issuerDidResult.didState.did);
        holderDidKey = core_1.DidKey.fromDid(holderDidResult.didState.did);
        const sdJwtVc = yield agent.sdJwtVc.sign({
            holder: {
                didUrl: `${holderDidKey.did}#${holderDidKey.key.fingerprint}`,
                method: 'did',
            },
            issuer: {
                didUrl: `${issuerDidKey.did}#${issuerDidKey.key.fingerprint}`,
                method: 'did',
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
                    over_18: true,
                    over_21: true,
                    over_65: true,
                },
            },
        });
        holderSdJwtVcRecord = yield agent.sdJwtVc.store(sdJwtVc.compact);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    test('create request', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`/openid4vc/verifiers/sessions/create-request`)
            .send({
            publicVerifierId: 'publicVerifierId',
            requestSigner: {
                method: 'did',
                didUrl: `${issuerDidKey.did}#${issuerDidKey.key.fingerprint}`,
            },
            presentationExchange: {
                definition: {
                    id: '73797b0c-dae6-46a7-9700-7850855fee22',
                    name: 'Example Presentation Definition',
                    input_descriptors: [
                        {
                            id: '64125742-8b6c-422e-82cd-1beb5123ee8f',
                            constraints: {
                                limit_disclosure: 'required',
                                fields: [
                                    {
                                        path: ['$.age.over_18'],
                                        filter: {
                                            type: 'boolean',
                                        },
                                    },
                                ],
                            },
                            name: 'Requested Sd Jwt Example Credential',
                            purpose: 'To provide an example of requesting a credential',
                        },
                    ],
                },
            },
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            verificationSession: {
                createdAt: expect.any(String),
                id: expect.any(String),
                publicVerifierId: expect.any(String),
                state: 'RequestCreated',
                type: 'OpenId4VcVerificationSessionRecord',
                updatedAt: expect.any(String),
                authorizationRequestJwt: expect.stringContaining('ey'),
                authorizationRequestUri: expect.stringContaining('http://localhost:4848/siop/publicVerifierId/authorization-requests/'),
            },
            authorizationRequest: expect.stringContaining(`openid://?request_uri=${encodeURIComponent(`http://localhost:4848/siop/publicVerifierId/authorization-requests/`)}`),
        });
        const presentationVerified = (0, rxjs_1.firstValueFrom)(agent.events
            .observable(openid4vc_1.OpenId4VcVerifierEvents.VerificationSessionStateChanged)
            .pipe((0, rxjs_1.filter)((event) => event.payload.verificationSession.state === openid4vc_1.OpenId4VcVerificationSessionState.ResponseVerified &&
            event.payload.verificationSession.id === response.body.verificationSession.id), (0, rxjs_1.first)(), (0, rxjs_1.timeout)(10000)));
        const resolvedAuthorizationRequest = yield agent.modules.openId4VcHolder.resolveSiopAuthorizationRequest(response.body.authorizationRequest);
        const { serverResponse } = yield agent.modules.openId4VcHolder.acceptSiopAuthorizationRequest({
            authorizationRequest: resolvedAuthorizationRequest.authorizationRequest,
            presentationExchange: {
                credentials: {
                    '64125742-8b6c-422e-82cd-1beb5123ee8f': [holderSdJwtVcRecord],
                },
            },
        });
        const presentationVerifiedEvent = yield presentationVerified;
        expect(serverResponse.status).toEqual(200);
        const verifiedResponse = yield (0, supertest_1.default)(app).get(`/openid4vc/verifiers/sessions/${presentationVerifiedEvent.payload.verificationSession.id}/verified-authorization-response`);
        expect(verifiedResponse.body).toEqual({
            idToken: {
                payload: {
                    aud: issuerDidKey.did,
                    exp: expect.any(Number),
                    iat: expect.any(Number),
                    iss: holderDidKey.did,
                    nonce: expect.any(String),
                    state: expect.any(String),
                    sub: holderDidKey.did,
                },
            },
            presentationExchange: {
                definition: {
                    id: '73797b0c-dae6-46a7-9700-7850855fee22',
                    input_descriptors: [
                        {
                            constraints: {
                                fields: [
                                    {
                                        filter: {
                                            type: 'boolean',
                                        },
                                        path: ['$.age.over_18'],
                                    },
                                ],
                                limit_disclosure: 'required',
                            },
                            id: '64125742-8b6c-422e-82cd-1beb5123ee8f',
                            name: 'Requested Sd Jwt Example Credential',
                            purpose: 'To provide an example of requesting a credential',
                        },
                    ],
                    name: 'Example Presentation Definition',
                },
                presentations: [
                    {
                        encoded: expect.any(String),
                        format: 'vc+sd-jwt',
                        header: {
                            alg: 'EdDSA',
                            kid: `#${issuerDidKey.key.fingerprint}`,
                            typ: 'vc+sd-jwt',
                        },
                        signedPayload: {
                            _sd_alg: 'sha-256',
                            age: {
                                _sd: [expect.any(String), expect.any(String), expect.any(String)],
                            },
                            cnf: {
                                kid: `${holderDidKey.did}#${holderDidKey.key.fingerprint}`,
                            },
                            first_name: 'John',
                            iat: expect.any(Number),
                            iss: issuerDidKey.did,
                            vct: 'https://example.com/vct',
                        },
                        vcPayload: {
                            age: {
                                over_18: true,
                            },
                            cnf: {
                                kid: `${holderDidKey.did}#${holderDidKey.key.fingerprint}`,
                            },
                            first_name: 'John',
                            iat: expect.any(Number),
                            iss: issuerDidKey.did,
                            vct: 'https://example.com/vct',
                        },
                    },
                ],
                submission: {
                    definition_id: '73797b0c-dae6-46a7-9700-7850855fee22',
                    descriptor_map: [
                        {
                            format: 'vc+sd-jwt',
                            id: '64125742-8b6c-422e-82cd-1beb5123ee8f',
                            path: '$',
                        },
                    ],
                    id: expect.any(String),
                },
            },
        });
    }));
});
