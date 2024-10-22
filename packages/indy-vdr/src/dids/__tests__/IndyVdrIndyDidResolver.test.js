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
const core_1 = require("@aries-framework/core");
const helpers_1 = require("../../../../core/tests/helpers");
const pool_1 = require("../../pool");
const IndyVdrIndyDidResolver_1 = require("../IndyVdrIndyDidResolver");
const didIndyLjgpST2rjsoxYegQDRm7EL_json_1 = __importDefault(require("./__fixtures__/didIndyLjgpST2rjsoxYegQDRm7EL.json"));
const didIndyLjgpST2rjsoxYegQDRm7ELdiddocContent_json_1 = __importDefault(require("./__fixtures__/didIndyLjgpST2rjsoxYegQDRm7ELdiddocContent.json"));
const didIndyR1xKJw17sUoXhejEpugMYJ_json_1 = __importDefault(require("./__fixtures__/didIndyR1xKJw17sUoXhejEpugMYJ.json"));
const didIndyWJz9mHyW9BZksioQnRsrAo_json_1 = __importDefault(require("./__fixtures__/didIndyWJz9mHyW9BZksioQnRsrAo.json"));
jest.mock('../../pool/IndyVdrPool');
const IndyVdrPoolMock = pool_1.IndyVdrPool;
const poolMock = new IndyVdrPoolMock();
(0, helpers_1.mockProperty)(poolMock, 'indyNamespace', 'ns1');
const agentConfig = (0, helpers_1.getAgentConfig)('IndyVdrIndyDidResolver');
const agentContext = (0, helpers_1.getAgentContext)({
    agentConfig,
    registerInstances: [[pool_1.IndyVdrPoolService, { getPoolForNamespace: jest.fn().mockReturnValue(poolMock) }]],
});
const resolver = new IndyVdrIndyDidResolver_1.IndyVdrIndyDidResolver();
describe('IndyVdrIndyDidResolver', () => {
    describe('NYMs with diddocContent', () => {
        it('should correctly resolve a did:indy document with arbitrary diddocContent', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'did:indy:ns2:LjgpST2rjsoxYegQDRm7EL';
            const nymResponse = {
                result: {
                    data: JSON.stringify({
                        did: 'LjgpST2rjsoxYegQDRm7EL',
                        verkey: 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu',
                        role: 'ENDORSER',
                        diddocContent: didIndyLjgpST2rjsoxYegQDRm7ELdiddocContent_json_1.default,
                    }),
                },
            };
            const poolMockSubmitRequest = jest.spyOn(poolMock, 'submitRequest');
            poolMockSubmitRequest.mockResolvedValueOnce(nymResponse);
            const result = yield resolver.resolve(agentContext, did);
            expect(poolMockSubmitRequest).toHaveBeenCalledTimes(1);
            expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
                didDocument: didIndyLjgpST2rjsoxYegQDRm7EL_json_1.default,
                didDocumentMetadata: {},
                didResolutionMetadata: {
                    contentType: 'application/did+ld+json',
                },
            });
        }));
    });
    describe('NYMs without diddocContent', () => {
        it('should correctly resolve a did:indy document without endpoint attrib', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'did:indy:ns1:R1xKJw17sUoXhejEpugMYJ';
            const nymResponse = {
                result: {
                    data: JSON.stringify({
                        did: 'R1xKJw17sUoXhejEpugMYJ',
                        verkey: 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu',
                        role: 'ENDORSER',
                    }),
                },
            };
            const attribResponse = {
                result: {
                    data: null,
                },
            };
            jest.spyOn(poolMock, 'submitRequest').mockResolvedValueOnce(nymResponse);
            jest.spyOn(poolMock, 'submitRequest').mockResolvedValueOnce(attribResponse);
            const result = yield resolver.resolve(agentContext, did);
            expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
                didDocument: didIndyR1xKJw17sUoXhejEpugMYJ_json_1.default,
                didDocumentMetadata: {},
                didResolutionMetadata: {
                    contentType: 'application/did+ld+json',
                },
            });
        }));
        it('should correctly resolve a did:indy document with endpoint attrib', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'did:indy:ns1:WJz9mHyW9BZksioQnRsrAo';
            const nymResponse = {
                result: {
                    data: JSON.stringify({
                        did: 'WJz9mHyW9BZksioQnRsrAo',
                        verkey: 'GyYtYWU1vjwd5PFJM4VSX5aUiSV3TyZMuLBJBTQvfdF8',
                        role: 'ENDORSER',
                    }),
                },
            };
            const attribResponse = {
                result: {
                    data: JSON.stringify({
                        endpoint: {
                            endpoint: 'https://agent.com',
                            types: ['endpoint', 'did-communication', 'DIDComm'],
                            routingKeys: ['routingKey1', 'routingKey2'],
                        },
                    }),
                },
            };
            jest.spyOn(poolMock, 'submitRequest').mockResolvedValueOnce(nymResponse);
            jest.spyOn(poolMock, 'submitRequest').mockResolvedValueOnce(attribResponse);
            const result = yield resolver.resolve(agentContext, did);
            expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
                didDocument: didIndyWJz9mHyW9BZksioQnRsrAo_json_1.default,
                didDocumentMetadata: {},
                didResolutionMetadata: {
                    contentType: 'application/did+ld+json',
                },
            });
        }));
        it('should return did resolution metadata with error if the indy ledger service throws an error', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'did:indy:ns1:R1xKJw17sUoXhejEpugMYJ';
            jest.spyOn(poolMock, 'submitRequest').mockRejectedValue(new Error('Error submitting read request'));
            const result = yield resolver.resolve(agentContext, did);
            expect(result).toMatchObject({
                didDocument: null,
                didDocumentMetadata: {},
                didResolutionMetadata: {
                    error: 'notFound',
                    message: `resolver_error: Unable to resolve did 'did:indy:ns1:R1xKJw17sUoXhejEpugMYJ': Error: Error submitting read request`,
                },
            });
        }));
    });
});
