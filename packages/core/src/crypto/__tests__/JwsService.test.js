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
const runInVersion_1 = require("../../../../../tests/runInVersion");
const helpers_1 = require("../../../../askar/tests/helpers");
const helpers_2 = require("../../../tests/helpers");
const dids_1 = require("../../modules/dids");
const utils_1 = require("../../utils");
const JwsService_1 = require("../JwsService");
const KeyType_1 = require("../KeyType");
const jwa_1 = require("../jose/jwa");
const jwk_1 = require("../jose/jwk");
const signing_provider_1 = require("../signing-provider");
const didJwsz6Mkf = __importStar(require("./__fixtures__/didJwsz6Mkf"));
const didJwsz6Mkv = __importStar(require("./__fixtures__/didJwsz6Mkv"));
const didJwszDnaey = __importStar(require("./__fixtures__/didJwszDnaey"));
// Only runs in Node18 because test uses Askar, which doesn't work well in Node16
(0, runInVersion_1.describeRunInNodeVersion)([18], 'JwsService', () => {
    let wallet;
    let agentContext;
    let jwsService;
    let didJwsz6MkfKey;
    let didJwsz6MkvKey;
    let didJwszDnaeyKey;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const config = (0, helpers_2.getAgentConfig)('JwsService');
        wallet = new helpers_1.RegisteredAskarTestWallet(config.logger, new helpers_2.agentDependencies.FileSystem(), new signing_provider_1.SigningProviderRegistry([]));
        agentContext = (0, helpers_2.getAgentContext)({
            wallet,
        });
        yield wallet.createAndOpen(config.walletConfig);
        jwsService = new JwsService_1.JwsService();
        didJwsz6MkfKey = yield wallet.createKey({
            privateKey: utils_1.TypedArrayEncoder.fromString(didJwsz6Mkf.SEED),
            keyType: KeyType_1.KeyType.Ed25519,
        });
        didJwsz6MkvKey = yield wallet.createKey({
            privateKey: utils_1.TypedArrayEncoder.fromString(didJwsz6Mkv.SEED),
            keyType: KeyType_1.KeyType.Ed25519,
        });
        didJwszDnaeyKey = yield wallet.createKey({
            privateKey: utils_1.TypedArrayEncoder.fromString(didJwszDnaey.SEED),
            keyType: KeyType_1.KeyType.P256,
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield wallet.delete();
    }));
    it('creates a jws for the payload using Ed25519 key', () => __awaiter(void 0, void 0, void 0, function* () {
        const payload = utils_1.JsonEncoder.toBuffer(didJwsz6Mkf.DATA_JSON);
        const kid = new dids_1.DidKey(didJwsz6MkfKey).did;
        const jws = yield jwsService.createJws(agentContext, {
            payload,
            key: didJwsz6MkfKey,
            header: { kid },
            protectedHeaderOptions: {
                alg: jwa_1.JwaSignatureAlgorithm.EdDSA,
                jwk: (0, jwk_1.getJwkFromKey)(didJwsz6MkfKey),
            },
        });
        expect(jws).toEqual(didJwsz6Mkf.JWS_JSON);
    }));
    it('creates and verify a jws using ES256 alg and P-256 kty', () => __awaiter(void 0, void 0, void 0, function* () {
        const payload = utils_1.JsonEncoder.toBuffer(didJwszDnaey.DATA_JSON);
        const kid = new dids_1.DidKey(didJwszDnaeyKey).did;
        const jws = yield jwsService.createJws(agentContext, {
            payload,
            key: didJwszDnaeyKey,
            header: { kid },
            protectedHeaderOptions: {
                alg: jwa_1.JwaSignatureAlgorithm.ES256,
                jwk: (0, jwk_1.getJwkFromKey)(didJwszDnaeyKey),
            },
        });
        expect(jws).toEqual(didJwszDnaey.JWS_JSON);
    }));
    it('creates a compact jws', () => __awaiter(void 0, void 0, void 0, function* () {
        const payload = utils_1.JsonEncoder.toBuffer(didJwsz6Mkf.DATA_JSON);
        const jws = yield jwsService.createJwsCompact(agentContext, {
            payload,
            key: didJwsz6MkfKey,
            protectedHeaderOptions: {
                alg: jwa_1.JwaSignatureAlgorithm.EdDSA,
                jwk: (0, jwk_1.getJwkFromKey)(didJwsz6MkfKey),
            },
        });
        expect(jws).toEqual(`${didJwsz6Mkf.JWS_JSON.protected}.${utils_1.TypedArrayEncoder.toBase64URL(payload)}.${didJwsz6Mkf.JWS_JSON.signature}`);
    }));
    describe('verifyJws', () => {
        it('returns true if the jws signature matches the payload', () => __awaiter(void 0, void 0, void 0, function* () {
            const { isValid, signerKeys } = yield jwsService.verifyJws(agentContext, {
                jws: didJwsz6Mkf.JWS_JSON,
            });
            expect(isValid).toBe(true);
            expect(signerKeys).toEqual([didJwsz6MkfKey]);
        }));
        it('verifies a compact JWS', () => __awaiter(void 0, void 0, void 0, function* () {
            const { isValid, signerKeys } = yield jwsService.verifyJws(agentContext, {
                jws: `${didJwsz6Mkf.JWS_JSON.protected}.${didJwsz6Mkf.JWS_JSON.payload}.${didJwsz6Mkf.JWS_JSON.signature}`,
            });
            expect(isValid).toBe(true);
            expect(signerKeys).toEqual([didJwsz6MkfKey]);
        }));
        it('returns all keys that signed the jws', () => __awaiter(void 0, void 0, void 0, function* () {
            const { isValid, signerKeys } = yield jwsService.verifyJws(agentContext, {
                jws: { signatures: [didJwsz6Mkf.JWS_JSON, didJwsz6Mkv.JWS_JSON], payload: didJwsz6Mkf.JWS_JSON.payload },
            });
            expect(isValid).toBe(true);
            expect(signerKeys).toEqual([didJwsz6MkfKey, didJwsz6MkvKey]);
        }));
        it('returns false if the jws signature does not match the payload', () => __awaiter(void 0, void 0, void 0, function* () {
            const { isValid, signerKeys } = yield jwsService.verifyJws(agentContext, {
                jws: Object.assign(Object.assign({}, didJwsz6Mkf.JWS_JSON), { payload: utils_1.JsonEncoder.toBase64URL(Object.assign(Object.assign({}, didJwsz6Mkf), { did: 'another_did' })) }),
            });
            expect(isValid).toBe(false);
            expect(signerKeys).toMatchObject([]);
        }));
        it('throws an error if the jws signatures array does not contain a JWS', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(jwsService.verifyJws(agentContext, {
                jws: { signatures: [], payload: '' },
            })).rejects.toThrowError('Unable to verify JWS, no signatures present in JWS.');
        }));
    });
});
