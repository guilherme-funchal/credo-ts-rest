"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DidCommDocumentService = void 0;
const crypto_1 = require("../../../crypto");
const plugins_1 = require("../../../plugins");
const domain_1 = require("../../dids/domain");
const helpers_1 = require("../../dids/helpers");
const matchingEd25519Key_1 = require("../util/matchingEd25519Key");
let DidCommDocumentService = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DidCommDocumentService = _classThis = class {
        constructor(didResolverService) {
            this.didResolverService = didResolverService;
        }
        resolveServicesFromDid(agentContext, did) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const didDocument = yield this.didResolverService.resolveDidDocument(agentContext, did);
                const resolvedServices = [];
                // If did specifies a particular service, filter by its id
                const didCommServices = (0, domain_1.parseDid)(did).fragment
                    ? didDocument.didCommServices.filter((service) => service.id === did)
                    : didDocument.didCommServices;
                // FIXME: we currently retrieve did documents for all didcomm services in the did document, and we don't have caching
                // yet so this will re-trigger ledger resolves for each one. Should we only resolve the first service, then the second service, etc...?
                for (const didCommService of didCommServices) {
                    if (didCommService instanceof domain_1.IndyAgentService) {
                        // IndyAgentService (DidComm v0) has keys encoded as raw publicKeyBase58 (verkeys)
                        resolvedServices.push({
                            id: didCommService.id,
                            recipientKeys: didCommService.recipientKeys.map(helpers_1.verkeyToInstanceOfKey),
                            routingKeys: ((_a = didCommService.routingKeys) === null || _a === void 0 ? void 0 : _a.map(helpers_1.verkeyToInstanceOfKey)) || [],
                            serviceEndpoint: didCommService.serviceEndpoint,
                        });
                    }
                    else if (didCommService instanceof domain_1.DidCommV1Service) {
                        // Resolve dids to DIDDocs to retrieve routingKeys
                        const routingKeys = [];
                        for (const routingKey of (_b = didCommService.routingKeys) !== null && _b !== void 0 ? _b : []) {
                            const routingDidDocument = yield this.didResolverService.resolveDidDocument(agentContext, routingKey);
                            routingKeys.push((0, domain_1.keyReferenceToKey)(routingDidDocument, routingKey));
                        }
                        // DidCommV1Service has keys encoded as key references
                        // Dereference recipientKeys
                        const recipientKeys = didCommService.recipientKeys.map((recipientKeyReference) => {
                            const key = (0, domain_1.keyReferenceToKey)(didDocument, recipientKeyReference);
                            // try to find a matching Ed25519 key (https://sovrin-foundation.github.io/sovrin/spec/did-method-spec-template.html#did-document-notes)
                            if (key.keyType === crypto_1.KeyType.X25519) {
                                const matchingEd25519Key = (0, matchingEd25519Key_1.findMatchingEd25519Key)(key, didDocument);
                                if (matchingEd25519Key)
                                    return matchingEd25519Key;
                            }
                            return key;
                        });
                        resolvedServices.push({
                            id: didCommService.id,
                            recipientKeys,
                            routingKeys,
                            serviceEndpoint: didCommService.serviceEndpoint,
                        });
                    }
                }
                return resolvedServices;
            });
        }
    };
    __setFunctionName(_classThis, "DidCommDocumentService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DidCommDocumentService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DidCommDocumentService = _classThis;
})();
exports.DidCommDocumentService = DidCommDocumentService;
