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
const jwk_1 = require("../../../../../crypto/jose/jwk");
const DidJwk_1 = require("../DidJwk");
const p256DidJwkEyJjcnYi0i_1 = require("./__fixtures__/p256DidJwkEyJjcnYi0i");
const x25519DidJwkEyJrdHkiOiJ_1 = require("./__fixtures__/x25519DidJwkEyJrdHkiOiJ");
describe('DidJwk', () => {
    it('creates a DidJwk instance from a did', () => __awaiter(void 0, void 0, void 0, function* () {
        const documentTypes = [p256DidJwkEyJjcnYi0i_1.p256DidJwkEyJjcnYi0iFixture, x25519DidJwkEyJrdHkiOiJ_1.x25519DidJwkEyJrdHkiOiJFixture];
        for (const documentType of documentTypes) {
            const didJwk = DidJwk_1.DidJwk.fromDid(documentType.id);
            expect(didJwk.didDocument.toJSON()).toMatchObject(documentType);
        }
    }));
    it('creates a DidJwk instance from a jwk instance', () => __awaiter(void 0, void 0, void 0, function* () {
        const didJwk = DidJwk_1.DidJwk.fromJwk((0, jwk_1.getJwkFromJson)(p256DidJwkEyJjcnYi0i_1.p256DidJwkEyJjcnYi0iFixture.verificationMethod[0].publicKeyJwk));
        expect(didJwk.did).toBe(p256DidJwkEyJjcnYi0i_1.p256DidJwkEyJjcnYi0iFixture.id);
        expect(didJwk.didDocument.toJSON()).toMatchObject(p256DidJwkEyJjcnYi0i_1.p256DidJwkEyJjcnYi0iFixture);
    }));
});
