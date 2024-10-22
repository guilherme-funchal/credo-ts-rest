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
exports.JwkDidResolver = void 0;
const DidJwk_1 = require("./DidJwk");
class JwkDidResolver {
    constructor() {
        this.supportedMethods = ['jwk'];
    }
    resolve(agentContext, did) {
        return __awaiter(this, void 0, void 0, function* () {
            const didDocumentMetadata = {};
            try {
                const didDocument = DidJwk_1.DidJwk.fromDid(did).didDocument;
                return {
                    didDocument,
                    didDocumentMetadata,
                    didResolutionMetadata: { contentType: 'application/did+ld+json' },
                };
            }
            catch (error) {
                return {
                    didDocument: null,
                    didDocumentMetadata,
                    didResolutionMetadata: {
                        error: 'notFound',
                        message: `resolver_error: Unable to resolve did '${did}': ${error}`,
                    },
                };
            }
        });
    }
}
exports.JwkDidResolver = JwkDidResolver;
