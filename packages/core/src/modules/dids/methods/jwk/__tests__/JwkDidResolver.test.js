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
const JsonTransformer_1 = require("../../../../../utils/JsonTransformer");
const DidJwk_1 = require("../DidJwk");
const JwkDidResolver_1 = require("../JwkDidResolver");
const p256DidJwkEyJjcnYi0i_1 = require("./__fixtures__/p256DidJwkEyJjcnYi0i");
describe('DidResolver', () => {
    describe('JwkDidResolver', () => {
        let keyDidResolver;
        let agentContext;
        beforeEach(() => {
            keyDidResolver = new JwkDidResolver_1.JwkDidResolver();
            agentContext = (0, helpers_1.getAgentContext)();
        });
        it('should correctly resolve a did:jwk document', () => __awaiter(void 0, void 0, void 0, function* () {
            const fromDidSpy = jest.spyOn(DidJwk_1.DidJwk, 'fromDid');
            const result = yield keyDidResolver.resolve(agentContext, p256DidJwkEyJjcnYi0i_1.p256DidJwkEyJjcnYi0iFixture.id);
            expect(JsonTransformer_1.JsonTransformer.toJSON(result)).toMatchObject({
                didDocument: p256DidJwkEyJjcnYi0i_1.p256DidJwkEyJjcnYi0iFixture,
                didDocumentMetadata: {},
                didResolutionMetadata: { contentType: 'application/did+ld+json' },
            });
            expect(result.didDocument);
            expect(fromDidSpy).toHaveBeenCalledTimes(1);
            expect(fromDidSpy).toHaveBeenCalledWith(p256DidJwkEyJjcnYi0i_1.p256DidJwkEyJjcnYi0iFixture.id);
        }));
    });
});
