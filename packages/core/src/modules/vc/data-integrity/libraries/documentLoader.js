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
exports.defaultDocumentLoader = defaultDocumentLoader;
const AriesFrameworkError_1 = require("../../../../error/AriesFrameworkError");
const utils_1 = require("../../../../utils");
const dids_1 = require("../../../dids");
const jsonld_1 = __importDefault(require("./jsonld"));
const nativeDocumentLoader_1 = require("./nativeDocumentLoader");
function defaultDocumentLoader(agentContext) {
    const didResolver = agentContext.dependencyManager.resolve(dids_1.DidResolverService);
    function loader(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, utils_1.isDid)(url)) {
                const result = yield didResolver.resolve(agentContext, url);
                if (result.didResolutionMetadata.error || !result.didDocument) {
                    throw new AriesFrameworkError_1.AriesFrameworkError(`Unable to resolve DID: ${url}`);
                }
                const framed = yield jsonld_1.default.frame(result.didDocument.toJSON(), {
                    '@context': result.didDocument.context,
                    '@embed': '@never',
                    id: url,
                }, 
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                { documentLoader: this });
                return {
                    contextUrl: null,
                    documentUrl: url,
                    document: framed,
                };
            }
            // fetches the documentLoader from documentLoader.ts or documentLoader.native.ts depending on the platform at bundle time
            const platformLoader = (0, nativeDocumentLoader_1.getNativeDocumentLoader)();
            const nativeLoader = platformLoader.apply(jsonld_1.default, []);
            return yield nativeLoader(url);
        });
    }
    return loader.bind(loader);
}
