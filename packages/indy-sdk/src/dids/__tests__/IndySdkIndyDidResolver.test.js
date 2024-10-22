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
const indy_sdk_1 = __importDefault(require("indy-sdk"));
const helpers_1 = require("../../../../core/tests/helpers");
const IndySdkPoolService_1 = require("../../ledger/IndySdkPoolService");
const types_1 = require("../../types");
const wallet_1 = require("../../wallet");
const IndySdkIndyDidResolver_1 = require("../IndySdkIndyDidResolver");
const didIndyPool1R1xKJw17sUoXhejEpugMYJ_json_1 = __importDefault(require("./__fixtures__/didIndyPool1R1xKJw17sUoXhejEpugMYJ.json"));
const didIndyPool1WJz9mHyW9BZksioQnRsrAo_json_1 = __importDefault(require("./__fixtures__/didIndyPool1WJz9mHyW9BZksioQnRsrAo.json"));
jest.mock('../../ledger/IndySdkPoolService');
const IndySdkPoolServiceMock = IndySdkPoolService_1.IndySdkPoolService;
const indySdkPoolServiceMock = new IndySdkPoolServiceMock();
(0, helpers_1.mockFunction)(indySdkPoolServiceMock.getPoolForNamespace).mockReturnValue({
    config: { indyNamespace: 'pool1' },
});
const agentConfig = (0, helpers_1.getAgentConfig)('IndySdkIndyDidResolver');
const wallet = new wallet_1.IndySdkWallet(indy_sdk_1.default, agentConfig.logger, new core_1.SigningProviderRegistry([]));
const agentContext = (0, helpers_1.getAgentContext)({
    wallet,
    agentConfig,
    registerInstances: [
        [IndySdkPoolService_1.IndySdkPoolService, indySdkPoolServiceMock],
        [types_1.IndySdkSymbol, indy_sdk_1.default],
    ],
});
const indySdkSovDidResolver = new IndySdkIndyDidResolver_1.IndySdkIndyDidResolver();
describe('IndySdkIndyDidResolver', () => {
    it('should correctly resolve a did:indy document', () => __awaiter(void 0, void 0, void 0, function* () {
        const did = 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ';
        const nymResponse = {
            did: 'R1xKJw17sUoXhejEpugMYJ',
            verkey: 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu',
            role: 'ENDORSER',
        };
        const endpoints = {
            endpoint: 'https://ssi.com',
            profile: 'https://profile.com',
            hub: 'https://hub.com',
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(indySdkSovDidResolver, 'getPublicDid').mockResolvedValue(nymResponse);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(indySdkSovDidResolver, 'getEndpointsForDid').mockResolvedValue(endpoints);
        const result = yield indySdkSovDidResolver.resolve(agentContext, did);
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocument: didIndyPool1R1xKJw17sUoXhejEpugMYJ_json_1.default,
            didDocumentMetadata: {},
            didResolutionMetadata: {
                contentType: 'application/did+ld+json',
            },
        });
    }));
    it('should resolve a did:indy document with routingKeys and types entries in the attrib', () => __awaiter(void 0, void 0, void 0, function* () {
        const did = 'did:indy:pool1:WJz9mHyW9BZksioQnRsrAo';
        const nymResponse = {
            did: 'WJz9mHyW9BZksioQnRsrAo',
            verkey: 'GyYtYWU1vjwd5PFJM4VSX5aUiSV3TyZMuLBJBTQvfdF8',
            role: 'ENDORSER',
        };
        const endpoints = {
            endpoint: 'https://agent.com',
            types: ['endpoint', 'did-communication', 'DIDComm'],
            routingKeys: ['routingKey1', 'routingKey2'],
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(indySdkSovDidResolver, 'getPublicDid').mockResolvedValue(nymResponse);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(indySdkSovDidResolver, 'getEndpointsForDid').mockResolvedValue(endpoints);
        const result = yield indySdkSovDidResolver.resolve(agentContext, did);
        expect(core_1.JsonTransformer.toJSON(result)).toMatchObject({
            didDocument: didIndyPool1WJz9mHyW9BZksioQnRsrAo_json_1.default,
            didDocumentMetadata: {},
            didResolutionMetadata: {
                contentType: 'application/did+ld+json',
            },
        });
    }));
    it('should return did resolution metadata with error if the indy ledger service throws an error', () => __awaiter(void 0, void 0, void 0, function* () {
        const did = 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ';
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(indySdkSovDidResolver, 'getPublicDid').mockRejectedValue(new Error('Error retrieving did'));
        const result = yield indySdkSovDidResolver.resolve(agentContext, did);
        expect(result).toMatchObject({
            didDocument: null,
            didDocumentMetadata: {},
            didResolutionMetadata: {
                error: 'notFound',
                message: `resolver_error: Unable to resolve did 'did:indy:pool1:R1xKJw17sUoXhejEpugMYJ': Error: Error retrieving did`,
            },
        });
    }));
});
