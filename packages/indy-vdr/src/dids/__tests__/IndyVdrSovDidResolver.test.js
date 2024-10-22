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
const parse_1 = require("../../../../core/src/modules/dids/domain/parse");
const helpers_1 = require("../../../../core/tests/helpers");
const IndyVdrPool_1 = require("../../pool/IndyVdrPool");
const IndyVdrPoolService_1 = require("../../pool/IndyVdrPoolService");
const IndyVdrSovDidResolver_1 = require("../IndyVdrSovDidResolver");
const didSovR1xKJw17sUoXhejEpugMYJ_json_1 = __importDefault(require("./__fixtures__/didSovR1xKJw17sUoXhejEpugMYJ.json"));
const didSovWJz9mHyW9BZksioQnRsrAo_json_1 = __importDefault(require("./__fixtures__/didSovWJz9mHyW9BZksioQnRsrAo.json"));
jest.mock('../../pool/IndyVdrPool');
const IndyVdrPoolMock = IndyVdrPool_1.IndyVdrPool;
const poolMock = new IndyVdrPoolMock();
(0, helpers_1.mockProperty)(poolMock, 'indyNamespace', 'local');
const agentConfig = (0, helpers_1.getAgentConfig)('IndyVdrSovDidResolver');
const agentContext = (0, helpers_1.getAgentContext)({
    agentConfig,
    registerInstances: [[IndyVdrPoolService_1.IndyVdrPoolService, { getPoolForDid: jest.fn().mockReturnValue({ pool: poolMock }) }]],
});
const resolver = new IndyVdrSovDidResolver_1.IndyVdrSovDidResolver();
describe('DidResolver', () => {
    describe('IndyVdrSovDidResolver', () => {
        it('should correctly resolve a did:sov document', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'did:sov:R1xKJw17sUoXhejEpugMYJ';
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
                    data: JSON.stringify({
                        endpoint: {
                            endpoint: 'https://ssi.com',
                            profile: 'https://profile.com',
                            hub: 'https://hub.com',
                        },
                    }),
                },
            };
            jest.spyOn(poolMock, 'submitRequest').mockResolvedValueOnce(nymResponse);
            jest.spyOn(poolMock, 'submitRequest').mockResolvedValueOnce(attribResponse);
            const result = yield resolver.resolve(agentContext, did, (0, parse_1.parseDid)(did));
            expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
                didDocument: didSovR1xKJw17sUoXhejEpugMYJ_json_1.default,
                didDocumentMetadata: {},
                didResolutionMetadata: {
                    contentType: 'application/did+ld+json',
                },
            });
        }));
        it('should resolve a did:sov document with routingKeys and types entries in the attrib', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'did:sov:WJz9mHyW9BZksioQnRsrAo';
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
            const result = yield resolver.resolve(agentContext, did, (0, parse_1.parseDid)(did));
            expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
                didDocument: didSovWJz9mHyW9BZksioQnRsrAo_json_1.default,
                didDocumentMetadata: {},
                didResolutionMetadata: {
                    contentType: 'application/did+ld+json',
                },
            });
        }));
        it('should return did resolution metadata with error if the indy ledger service throws an error', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'did:sov:R1xKJw17sUoXhejEpugMYJ';
            jest.spyOn(poolMock, 'submitRequest').mockRejectedValue(new Error('Error submitting read request'));
            const result = yield resolver.resolve(agentContext, did, (0, parse_1.parseDid)(did));
            expect(result).toMatchObject({
                didDocument: null,
                didDocumentMetadata: {},
                didResolutionMetadata: {
                    error: 'notFound',
                    message: `resolver_error: Unable to resolve did 'did:sov:R1xKJw17sUoXhejEpugMYJ': Error: Error submitting read request`,
                },
            });
        }));
    });
});
