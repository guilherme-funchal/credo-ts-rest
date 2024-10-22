"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.WebDidResolver = void 0;
const did_resolver_1 = require("did-resolver");
const didWeb = __importStar(require("web-did-resolver"));
const JsonTransformer_1 = require("../../../../utils/JsonTransformer");
const domain_1 = require("../../domain");
class WebDidResolver {
    constructor() {
        // FIXME: Would be nice if we don't have to provide a did resolver instance
        this._resolverInstance = new did_resolver_1.Resolver();
        this.resolver = didWeb.getResolver();
        this.supportedMethods = Object.keys(this.resolver);
    }
    resolve(agentContext, did, parsed, didResolutionOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.resolver[parsed.method](did, parsed, this._resolverInstance, didResolutionOptions);
            let didDocument = null;
            if (result.didDocument) {
                didDocument = JsonTransformer_1.JsonTransformer.fromJSON(result.didDocument, domain_1.DidDocument);
            }
            return Object.assign(Object.assign({}, result), { didDocument });
        });
    }
}
exports.WebDidResolver = WebDidResolver;
