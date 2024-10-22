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
const helpers_1 = require("../../../../../tests/helpers");
const JsonTransformer_1 = require("../../../../utils/JsonTransformer");
const DidsModuleConfig_1 = require("../../DidsModuleConfig");
const didKeyEd25519_json_1 = __importDefault(require("../../__tests__/__fixtures__/didKeyEd25519.json"));
const domain_1 = require("../../domain");
const parse_1 = require("../../domain/parse");
const DidResolverService_1 = require("../DidResolverService");
const didResolverMock = {
    supportedMethods: ['key'],
    resolve: jest.fn(),
};
const agentConfig = (0, helpers_1.getAgentConfig)('DidResolverService');
const agentContext = (0, helpers_1.getAgentContext)();
describe('DidResolverService', () => {
    const didResolverService = new DidResolverService_1.DidResolverService(agentConfig.logger, new DidsModuleConfig_1.DidsModuleConfig({ resolvers: [didResolverMock] }));
    it('should correctly find and call the correct resolver for a specified did', () => __awaiter(void 0, void 0, void 0, function* () {
        const returnValue = {
            didDocument: JsonTransformer_1.JsonTransformer.fromJSON(didKeyEd25519_json_1.default, domain_1.DidDocument),
            didDocumentMetadata: {},
            didResolutionMetadata: {
                contentType: 'application/did+ld+json',
            },
        };
        (0, helpers_1.mockFunction)(didResolverMock.resolve).mockResolvedValue(returnValue);
        const result = yield didResolverService.resolve(agentContext, 'did:key:xxxx', { someKey: 'string' });
        expect(result).toEqual(returnValue);
        expect(didResolverMock.resolve).toHaveBeenCalledTimes(1);
        expect(didResolverMock.resolve).toHaveBeenCalledWith(agentContext, 'did:key:xxxx', (0, parse_1.parseDid)('did:key:xxxx'), {
            someKey: 'string',
        });
    }));
    it("should return an error with 'invalidDid' if the did string couldn't be parsed", () => __awaiter(void 0, void 0, void 0, function* () {
        const did = 'did:__Asd:asdfa';
        const result = yield didResolverService.resolve(agentContext, did);
        expect(result).toEqual({
            didDocument: null,
            didDocumentMetadata: {},
            didResolutionMetadata: {
                error: 'invalidDid',
            },
        });
    }));
    it("should return an error with 'unsupportedDidMethod' if the did has no resolver", () => __awaiter(void 0, void 0, void 0, function* () {
        const did = 'did:example:asdfa';
        const result = yield didResolverService.resolve(agentContext, did);
        expect(result).toEqual({
            didDocument: null,
            didDocumentMetadata: {},
            didResolutionMetadata: {
                error: 'unsupportedDidMethod',
                message: 'No did resolver registered for did method example',
            },
        });
    }));
});
