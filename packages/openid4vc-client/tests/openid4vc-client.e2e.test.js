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
const nock_1 = __importStar(require("nock"));
const src_1 = require("../../askar/src");
const helpers_1 = require("../../askar/tests/helpers");
const documentLoader_1 = require("../../core/src/modules/vc/data-integrity/__tests__/documentLoader");
const tests_1 = require("../../core/tests");
const fixtures_1 = require("./fixtures");
const openid4vc_client_1 = require("@aries-framework/openid4vc-client");
const modules = {
    openId4VcClient: new openid4vc_client_1.OpenId4VcClientModule(),
    w3cCredentials: new core_1.W3cCredentialsModule({
        documentLoader: documentLoader_1.customDocumentLoader,
    }),
    askar: new src_1.AskarModule(helpers_1.askarModuleConfig),
};
describe('OpenId4VcClient', () => {
    let agent;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const agentOptions = (0, tests_1.getAgentOptions)('OpenId4VcClient Agent', {}, modules);
        agent = new core_1.Agent(agentOptions);
        yield agent.initialize();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    describe('Pre-authorized flow', () => {
        afterEach(() => {
            (0, nock_1.cleanAll)();
            (0, nock_1.enableNetConnect)();
        });
        it('Should successfully execute the pre-authorized flow using a did:key Ed25519 subject and JSON-LD credential', () => __awaiter(void 0, void 0, void 0, function* () {
            /**
             *  Below we're setting up some mock HTTP responses.
             *  These responses are based on the openid-initiate-issuance URI above
             * */
            var _a;
            // setup temporary redirect mock
            (0, nock_1.default)('https://launchpad.mattrlabs.com').get('/.well-known/openid-credential-issuer').reply(307, undefined, {
                Location: 'https://launchpad.vii.electron.mattrlabs.io/.well-known/openid-credential-issuer',
            });
            // setup server metadata response
            const httpMock = (0, nock_1.default)('https://launchpad.vii.electron.mattrlabs.io')
                .get('/.well-known/openid-credential-issuer')
                .reply(200, fixtures_1.mattrLaunchpadJsonLd.getMetadataResponse);
            // setup access token response
            httpMock.post('/oidc/v1/auth/token').reply(200, fixtures_1.mattrLaunchpadJsonLd.acquireAccessTokenResponse);
            // setup credential request response
            httpMock.post('/oidc/v1/auth/credential').reply(200, fixtures_1.mattrLaunchpadJsonLd.credentialResponse);
            const did = yield agent.dids.create({
                method: 'key',
                options: {
                    keyType: core_1.KeyType.Ed25519,
                },
                secret: {
                    privateKey: core_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c7a0fd969598e'),
                },
            });
            const didKey = core_1.DidKey.fromDid(did.didState.did);
            const kid = `${did.didState.did}#${didKey.key.fingerprint}`;
            const verificationMethod = (_a = did.didState.didDocument) === null || _a === void 0 ? void 0 : _a.dereferenceKey(kid, ['authentication']);
            if (!verificationMethod)
                throw new Error('No verification method found');
            const w3cCredentialRecords = yield agent.modules.openId4VcClient.requestCredentialUsingPreAuthorizedCode({
                issuerUri: fixtures_1.mattrLaunchpadJsonLd.credentialOffer,
                verifyCredentialStatus: false,
                // We only allow EdDSa, as we've created a did with keyType ed25519. If we create
                // or determine the did dynamically we could use any signature algorithm
                allowedProofOfPossessionSignatureAlgorithms: [core_1.JwaSignatureAlgorithm.EdDSA],
                proofOfPossessionVerificationMethodResolver: () => verificationMethod,
            });
            expect(w3cCredentialRecords).toHaveLength(1);
            const w3cCredentialRecord = w3cCredentialRecords[0];
            expect(w3cCredentialRecord).toBeInstanceOf(core_1.W3cCredentialRecord);
            expect(w3cCredentialRecord.credential.type).toEqual([
                'VerifiableCredential',
                'VerifiableCredentialExtension',
                'OpenBadgeCredential',
            ]);
            expect(w3cCredentialRecord.credential.credentialSubjectIds[0]).toEqual(did.didState.did);
        }));
        it('Should successfully execute the pre-authorized flow using a did:key P256 subject and JWT credential', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            /**
             *  Below we're setting up some mock HTTP responses.
             *  These responses are based on the openid-initiate-issuance URI above
             */
            // setup server metadata response
            const httpMock = (0, nock_1.default)('https://jff.walt.id/issuer-api/default/oidc')
                .get('/.well-known/openid-credential-issuer')
                .reply(200, fixtures_1.waltIdJffJwt.getMetadataResponse);
            // setup access token response
            httpMock.post('/token').reply(200, fixtures_1.waltIdJffJwt.credentialResponse);
            // setup credential request response
            httpMock.post('/credential').reply(200, fixtures_1.waltIdJffJwt.credentialResponse);
            const did = yield agent.dids.create({
                method: 'key',
                options: {
                    keyType: core_1.KeyType.P256,
                },
                secret: {
                    privateKey: core_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c7a0fd969598e'),
                },
            });
            const didKey = core_1.DidKey.fromDid(did.didState.did);
            const kid = `${didKey.did}#${didKey.key.fingerprint}`;
            const verificationMethod = (_a = did.didState.didDocument) === null || _a === void 0 ? void 0 : _a.dereferenceKey(kid, ['authentication']);
            if (!verificationMethod)
                throw new Error('No verification method found');
            const w3cCredentialRecords = yield agent.modules.openId4VcClient.requestCredentialUsingPreAuthorizedCode({
                issuerUri: fixtures_1.waltIdJffJwt.credentialOffer,
                allowedCredentialFormats: [core_1.ClaimFormat.JwtVc],
                allowedProofOfPossessionSignatureAlgorithms: [core_1.JwaSignatureAlgorithm.ES256],
                proofOfPossessionVerificationMethodResolver: () => verificationMethod,
                verifyCredentialStatus: false,
            });
            expect(w3cCredentialRecords[0]).toBeInstanceOf(core_1.W3cCredentialRecord);
            const w3cCredentialRecord = w3cCredentialRecords[0];
            expect(w3cCredentialRecord.credential.type).toEqual([
                'VerifiableCredential',
                'VerifiableAttestation',
                'VerifiableId',
            ]);
            expect(w3cCredentialRecord.credential.credentialSubjectIds[0]).toEqual(did.didState.did);
        }));
    });
    describe('Authorization flow', () => {
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            /**
             *  Below we're setting up some mock HTTP responses.
             *  These responses are based on the openid-initiate-issuance URI above
             * */
            // setup temporary redirect mock
            (0, nock_1.default)('https://launchpad.mattrlabs.com').get('/.well-known/openid-credential-issuer').reply(307, undefined, {
                Location: 'https://launchpad.vii.electron.mattrlabs.io/.well-known/openid-credential-issuer',
            });
            // setup server metadata response
            const httpMock = (0, nock_1.default)('https://launchpad.vii.electron.mattrlabs.io')
                .get('/.well-known/openid-credential-issuer')
                .reply(200, fixtures_1.mattrLaunchpadJsonLd.getMetadataResponse);
            // setup access token response
            httpMock.post('/oidc/v1/auth/token').reply(200, fixtures_1.mattrLaunchpadJsonLd.acquireAccessTokenResponse);
            // setup credential request response
            httpMock.post('/oidc/v1/auth/credential').reply(200, fixtures_1.mattrLaunchpadJsonLd.credentialResponse);
        }));
        afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
            (0, nock_1.cleanAll)();
            (0, nock_1.enableNetConnect)();
        }));
        it('should generate a valid authorization url', () => __awaiter(void 0, void 0, void 0, function* () {
            const clientId = 'test-client';
            const redirectUri = 'https://example.com/cb';
            const scope = ['TestCredential'];
            const initiationUri = 'openid-initiate-issuance://?issuer=https://launchpad.mattrlabs.com&credential_type=OpenBadgeCredential';
            const { authorizationUrl } = yield agent.modules.openId4VcClient.generateAuthorizationUrl({
                clientId,
                redirectUri,
                scope,
                initiationUri,
            });
            const parsedUrl = new URL(authorizationUrl);
            expect(authorizationUrl.startsWith('https://launchpad.vii.electron.mattrlabs.io/oidc/v1/auth/authorize')).toBe(true);
            expect(parsedUrl.searchParams.get('response_type')).toBe('code');
            expect(parsedUrl.searchParams.get('client_id')).toBe(clientId);
            expect(parsedUrl.searchParams.get('code_challenge_method')).toBe('S256');
            expect(parsedUrl.searchParams.get('redirect_uri')).toBe(redirectUri);
        }));
        it('should throw if no scope is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            // setup temporary redirect mock
            (0, nock_1.default)('https://launchpad.mattrlabs.com').get('/.well-known/openid-credential-issuer').reply(307, undefined, {
                Location: 'https://launchpad.vii.electron.mattrlabs.io/.well-known/openid-credential-issuer',
            });
            // setup server metadata response
            (0, nock_1.default)('https://launchpad.vii.electron.mattrlabs.io')
                .get('/.well-known/openid-credential-issuer')
                .reply(200, fixtures_1.mattrLaunchpadJsonLd.getMetadataResponse);
            const clientId = 'test-client';
            const redirectUri = 'https://example.com/cb';
            const initiationUri = 'openid-initiate-issuance://?issuer=https://launchpad.mattrlabs.com&credential_type=OpenBadgeCredential';
            expect(agent.modules.openId4VcClient.generateAuthorizationUrl({
                clientId,
                redirectUri,
                scope: [],
                initiationUri,
            })).rejects.toThrow();
        }));
        it('should successfully execute request a credential', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // setup temporary redirect mock
            (0, nock_1.default)('https://launchpad.mattrlabs.com').get('/.well-known/openid-credential-issuer').reply(307, undefined, {
                Location: 'https://launchpad.vii.electron.mattrlabs.io/.well-known/openid-credential-issuer',
            });
            // setup server metadata response
            (0, nock_1.default)('https://launchpad.vii.electron.mattrlabs.io')
                .get('/.well-known/openid-credential-issuer')
                .reply(200, fixtures_1.mattrLaunchpadJsonLd.getMetadataResponse);
            const did = yield agent.dids.create({
                method: 'key',
                options: {
                    keyType: core_1.KeyType.Ed25519,
                },
                secret: {
                    privateKey: core_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c7a0fd969598e'),
                },
            });
            const didKey = core_1.DidKey.fromDid(did.didState.did);
            const kid = `${did.didState.did}#${didKey.key.fingerprint}`;
            const verificationMethod = (_a = did.didState.didDocument) === null || _a === void 0 ? void 0 : _a.dereferenceKey(kid, ['authentication']);
            if (!verificationMethod)
                throw new Error('No verification method found');
            const clientId = 'test-client';
            const redirectUri = 'https://example.com/cb';
            const initiationUri = 'openid-initiate-issuance://?issuer=https://launchpad.mattrlabs.com&credential_type=OpenBadgeCredential';
            const scope = ['TestCredential'];
            const { codeVerifier } = yield agent.modules.openId4VcClient.generateAuthorizationUrl({
                clientId,
                redirectUri,
                scope,
                initiationUri,
            });
            const w3cCredentialRecords = yield agent.modules.openId4VcClient.requestCredentialUsingAuthorizationCode({
                clientId: clientId,
                authorizationCode: 'test-code',
                codeVerifier: codeVerifier,
                verifyCredentialStatus: false,
                proofOfPossessionVerificationMethodResolver: () => verificationMethod,
                allowedProofOfPossessionSignatureAlgorithms: [core_1.JwaSignatureAlgorithm.EdDSA],
                issuerUri: initiationUri,
                redirectUri: redirectUri,
            });
            expect(w3cCredentialRecords).toHaveLength(1);
            const w3cCredentialRecord = w3cCredentialRecords[0];
            expect(w3cCredentialRecord).toBeInstanceOf(core_1.W3cCredentialRecord);
            expect(w3cCredentialRecord.credential.type).toEqual([
                'VerifiableCredential',
                'VerifiableCredentialExtension',
                'OpenBadgeCredential',
            ]);
            expect(w3cCredentialRecord.credential.credentialSubjectIds[0]).toEqual(did.didState.did);
        }));
    });
});
