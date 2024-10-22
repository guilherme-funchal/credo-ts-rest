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
const helpers_1 = require("../../../../../../tests/helpers");
const crypto_1 = require("../../../../../crypto");
const jwk_1 = require("../../../../../crypto/jose/jwk");
const utils_1 = require("../../../../../utils");
const JsonTransformer_1 = require("../../../../../utils/JsonTransformer");
const error_1 = require("../../../../../wallet/error");
const DidDocumentRole_1 = require("../../../domain/DidDocumentRole");
const DidRepository_1 = require("../../../repository/DidRepository");
const JwkDidRegistrar_1 = require("../JwkDidRegistrar");
jest.mock('../../../repository/DidRepository');
const DidRepositoryMock = DidRepository_1.DidRepository;
const jwk = (0, jwk_1.getJwkFromJson)({
    crv: 'P-256',
    kty: 'EC',
    x: 'acbIQiuMs3i8_uszEjJ2tpTtRM4EU3yz91PH6CdH2V0',
    y: '_KcyLj9vWMptnmKtm46GqDz8wf74I5LKgrl2GzH3nSE',
});
const walletMock = {
    createKey: jest.fn(() => jwk.key),
};
const didRepositoryMock = new DidRepositoryMock();
const jwkDidRegistrar = new JwkDidRegistrar_1.JwkDidRegistrar();
const agentContext = (0, helpers_1.getAgentContext)({
    wallet: walletMock,
    registerInstances: [[DidRepository_1.DidRepository, didRepositoryMock]],
});
describe('DidRegistrar', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('JwkDidRegistrar', () => {
        it('should correctly create a did:jwk document using P256 key type', () => __awaiter(void 0, void 0, void 0, function* () {
            const privateKey = utils_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c712fd969598e');
            const result = yield jwkDidRegistrar.create(agentContext, {
                method: 'jwk',
                options: {
                    keyType: crypto_1.KeyType.P256,
                },
                secret: {
                    privateKey,
                },
            });
            expect(JsonTransformer_1.JsonTransformer.toJSON(result)).toMatchObject({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'finished',
                    did: 'did:jwk:eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImFjYklRaXVNczNpOF91c3pFakoydHBUdFJNNEVVM3l6OTFQSDZDZEgyVjAiLCJ5IjoiX0tjeUxqOXZXTXB0bm1LdG00NkdxRHo4d2Y3NEk1TEtncmwyR3pIM25TRSJ9',
                    didDocument: {
                        '@context': ['https://w3id.org/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
                        id: 'did:jwk:eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImFjYklRaXVNczNpOF91c3pFakoydHBUdFJNNEVVM3l6OTFQSDZDZEgyVjAiLCJ5IjoiX0tjeUxqOXZXTXB0bm1LdG00NkdxRHo4d2Y3NEk1TEtncmwyR3pIM25TRSJ9',
                        verificationMethod: [
                            {
                                id: 'did:jwk:eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImFjYklRaXVNczNpOF91c3pFakoydHBUdFJNNEVVM3l6OTFQSDZDZEgyVjAiLCJ5IjoiX0tjeUxqOXZXTXB0bm1LdG00NkdxRHo4d2Y3NEk1TEtncmwyR3pIM25TRSJ9#0',
                                type: 'JsonWebKey2020',
                                controller: 'did:jwk:eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImFjYklRaXVNczNpOF91c3pFakoydHBUdFJNNEVVM3l6OTFQSDZDZEgyVjAiLCJ5IjoiX0tjeUxqOXZXTXB0bm1LdG00NkdxRHo4d2Y3NEk1TEtncmwyR3pIM25TRSJ9',
                                publicKeyJwk: {
                                    crv: 'P-256',
                                    kty: 'EC',
                                    x: 'acbIQiuMs3i8_uszEjJ2tpTtRM4EU3yz91PH6CdH2V0',
                                    y: '_KcyLj9vWMptnmKtm46GqDz8wf74I5LKgrl2GzH3nSE',
                                },
                            },
                        ],
                        assertionMethod: [
                            'did:jwk:eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImFjYklRaXVNczNpOF91c3pFakoydHBUdFJNNEVVM3l6OTFQSDZDZEgyVjAiLCJ5IjoiX0tjeUxqOXZXTXB0bm1LdG00NkdxRHo4d2Y3NEk1TEtncmwyR3pIM25TRSJ9#0',
                        ],
                        authentication: [
                            'did:jwk:eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImFjYklRaXVNczNpOF91c3pFakoydHBUdFJNNEVVM3l6OTFQSDZDZEgyVjAiLCJ5IjoiX0tjeUxqOXZXTXB0bm1LdG00NkdxRHo4d2Y3NEk1TEtncmwyR3pIM25TRSJ9#0',
                        ],
                        capabilityInvocation: [
                            'did:jwk:eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImFjYklRaXVNczNpOF91c3pFakoydHBUdFJNNEVVM3l6OTFQSDZDZEgyVjAiLCJ5IjoiX0tjeUxqOXZXTXB0bm1LdG00NkdxRHo4d2Y3NEk1TEtncmwyR3pIM25TRSJ9#0',
                        ],
                        capabilityDelegation: [
                            'did:jwk:eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImFjYklRaXVNczNpOF91c3pFakoydHBUdFJNNEVVM3l6OTFQSDZDZEgyVjAiLCJ5IjoiX0tjeUxqOXZXTXB0bm1LdG00NkdxRHo4d2Y3NEk1TEtncmwyR3pIM25TRSJ9#0',
                        ],
                        keyAgreement: [
                            'did:jwk:eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImFjYklRaXVNczNpOF91c3pFakoydHBUdFJNNEVVM3l6OTFQSDZDZEgyVjAiLCJ5IjoiX0tjeUxqOXZXTXB0bm1LdG00NkdxRHo4d2Y3NEk1TEtncmwyR3pIM25TRSJ9#0',
                        ],
                    },
                    secret: {
                        privateKey,
                    },
                },
            });
            expect(walletMock.createKey).toHaveBeenCalledWith({ keyType: crypto_1.KeyType.P256, privateKey });
        }));
        it('should return an error state if no key type is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield jwkDidRegistrar.create(agentContext, {
                method: 'jwk',
                // @ts-expect-error - key type is required in interface
                options: {},
            });
            expect(JsonTransformer_1.JsonTransformer.toJSON(result)).toMatchObject({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: 'Missing key type',
                },
            });
        }));
        it('should return an error state if a key creation error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(walletMock.createKey).mockRejectedValueOnce(new error_1.WalletError('Invalid private key provided'));
            const result = yield jwkDidRegistrar.create(agentContext, {
                method: 'jwk',
                options: {
                    keyType: crypto_1.KeyType.P256,
                },
                secret: {
                    privateKey: utils_1.TypedArrayEncoder.fromString('invalid'),
                },
            });
            expect(JsonTransformer_1.JsonTransformer.toJSON(result)).toMatchObject({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: expect.stringContaining('Invalid private key provided'),
                },
            });
        }));
        it('should store the did document', () => __awaiter(void 0, void 0, void 0, function* () {
            const privateKey = utils_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c712fd969598e');
            const did = 'did:jwk:eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImFjYklRaXVNczNpOF91c3pFakoydHBUdFJNNEVVM3l6OTFQSDZDZEgyVjAiLCJ5IjoiX0tjeUxqOXZXTXB0bm1LdG00NkdxRHo4d2Y3NEk1TEtncmwyR3pIM25TRSJ9';
            yield jwkDidRegistrar.create(agentContext, {
                method: 'jwk',
                options: {
                    keyType: crypto_1.KeyType.P256,
                },
                secret: {
                    privateKey,
                },
            });
            expect(didRepositoryMock.save).toHaveBeenCalledTimes(1);
            const [, didRecord] = (0, helpers_1.mockFunction)(didRepositoryMock.save).mock.calls[0];
            expect(didRecord).toMatchObject({
                did,
                role: DidDocumentRole_1.DidDocumentRole.Created,
                didDocument: undefined,
            });
        }));
        it('should return an error state when calling update', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield jwkDidRegistrar.update();
            expect(result).toEqual({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: `notSupported: cannot update did:jwk did`,
                },
            });
        }));
        it('should return an error state when calling deactivate', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield jwkDidRegistrar.deactivate();
            expect(result).toEqual({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: `notSupported: cannot deactivate did:jwk did`,
                },
            });
        }));
    });
});
