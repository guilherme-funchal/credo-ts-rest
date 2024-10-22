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
exports.IndyVdrIndyDidResolver = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const pool_1 = require("../pool");
const didIndyUtil_1 = require("./didIndyUtil");
class IndyVdrIndyDidResolver {
    constructor() {
        this.supportedMethods = ['indy'];
    }
    resolve(agentContext, did) {
        return __awaiter(this, void 0, void 0, function* () {
            const didDocumentMetadata = {};
            try {
                const poolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
                const pool = poolService.getPoolForNamespace((0, anoncreds_1.parseIndyDid)(did).namespace);
                // Get DID Document from Get NYM response
                const didDocument = yield (0, didIndyUtil_1.buildDidDocument)(agentContext, pool, did);
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
exports.IndyVdrIndyDidResolver = IndyVdrIndyDidResolver;
