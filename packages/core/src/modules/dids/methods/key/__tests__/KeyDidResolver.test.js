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
const helpers_1 = require("../../../../../../tests/helpers");
const JsonTransformer_1 = require("../../../../../utils/JsonTransformer");
const didKeyEd25519_json_1 = __importDefault(require("../../../__tests__/__fixtures__/didKeyEd25519.json"));
const DidKey_1 = require("../DidKey");
const KeyDidResolver_1 = require("../KeyDidResolver");
describe('DidResolver', () => {
    describe('KeyDidResolver', () => {
        let keyDidResolver;
        let agentContext;
        beforeEach(() => {
            keyDidResolver = new KeyDidResolver_1.KeyDidResolver();
            agentContext = (0, helpers_1.getAgentContext)();
        });
        it('should correctly resolve a did:key document', () => __awaiter(void 0, void 0, void 0, function* () {
            const fromDidSpy = jest.spyOn(DidKey_1.DidKey, 'fromDid');
            const result = yield keyDidResolver.resolve(agentContext, 'did:key:z6MkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th');
            expect(JsonTransformer_1.JsonTransformer.toJSON(result)).toMatchObject({
                didDocument: didKeyEd25519_json_1.default,
                didDocumentMetadata: {},
                didResolutionMetadata: { contentType: 'application/did+ld+json' },
            });
            expect(result.didDocument);
            expect(fromDidSpy).toHaveBeenCalledTimes(1);
            expect(fromDidSpy).toHaveBeenCalledWith('did:key:z6MkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th');
        }));
        it('should return did resolution metadata with error if the did contains an unsupported multibase', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield keyDidResolver.resolve(agentContext, 'did:key:asdfkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th');
            expect(result).toEqual({
                didDocument: null,
                didDocumentMetadata: {},
                didResolutionMetadata: {
                    error: 'notFound',
                    message: `resolver_error: Unable to resolve did 'did:key:asdfkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th': Error: No decoder found for multibase prefix 'a'`,
                },
            });
        }));
        it('should return did resolution metadata with error if the did contains an unsupported multibase', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield keyDidResolver.resolve(agentContext, 'did:key:z6MkmjYasdfasfd8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th');
            expect(result).toEqual({
                didDocument: null,
                didDocumentMetadata: {},
                didResolutionMetadata: {
                    error: 'notFound',
                    message: `resolver_error: Unable to resolve did 'did:key:z6MkmjYasdfasfd8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th': Error: Unsupported key type from multicodec code '107'`,
                },
            });
        }));
    });
});
