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
exports.CheqdLedgerService = exports.DefaultRPCUrl = void 0;
const core_1 = require("@aries-framework/core");
const sdk_1 = require("@cheqd/sdk");
const identifiers_1 = require("../anoncreds/utils/identifiers");
const didCheqdUtil_1 = require("../dids/didCheqdUtil");
var DefaultRPCUrl;
(function (DefaultRPCUrl) {
    DefaultRPCUrl["Mainnet"] = "https://rpc.cheqd.net";
    DefaultRPCUrl["Testnet"] = "https://rpc.cheqd.network";
})(DefaultRPCUrl || (exports.DefaultRPCUrl = DefaultRPCUrl = {}));
let CheqdLedgerService = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CheqdLedgerService = _classThis = class {
        constructor(cheqdSdkModuleConfig) {
            this.networks = cheqdSdkModuleConfig.networks.map((config) => {
                const { network, rpcUrl, cosmosPayerSeed } = config;
                return {
                    network,
                    rpcUrl: rpcUrl ? rpcUrl : network === sdk_1.CheqdNetwork.Mainnet ? DefaultRPCUrl.Mainnet : DefaultRPCUrl.Testnet,
                    cosmosPayerWallet: (0, didCheqdUtil_1.getCosmosPayerWallet)(cosmosPayerSeed),
                };
            });
        }
        connect() {
            return __awaiter(this, void 0, void 0, function* () {
                for (const network of this.networks) {
                    network.sdk = yield (0, sdk_1.createCheqdSDK)({
                        modules: [sdk_1.DIDModule, sdk_1.ResourceModule],
                        rpcUrl: network.rpcUrl,
                        wallet: yield network.cosmosPayerWallet.catch((error) => {
                            throw new core_1.AriesFrameworkError(`Error initializing cosmos payer wallet: ${error.message}`, { cause: error });
                        }),
                    });
                }
            });
        }
        getSdk(did) {
            const parsedDid = (0, identifiers_1.parseCheqdDid)(did);
            if (!parsedDid) {
                throw new Error('Invalid DID');
            }
            if (this.networks.length === 0) {
                throw new Error('No cheqd networks configured');
            }
            const network = this.networks.find((network) => network.network === parsedDid.network);
            if (!network || !network.sdk) {
                throw new Error('Network not configured');
            }
            return network.sdk;
        }
        create(didPayload, signInputs, versionId, fee) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.getSdk(didPayload.id).createDidDocTx(signInputs, didPayload, '', fee, undefined, versionId);
            });
        }
        update(didPayload, signInputs, versionId, fee) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.getSdk(didPayload.id).updateDidDocTx(signInputs, didPayload, '', fee, undefined, versionId);
            });
        }
        deactivate(didPayload, signInputs, versionId, fee) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.getSdk(didPayload.id).deactivateDidDocTx(signInputs, didPayload, '', fee, undefined, versionId);
            });
        }
        resolve(did, version) {
            return __awaiter(this, void 0, void 0, function* () {
                return version ? yield this.getSdk(did).queryDidDocVersion(did, version) : yield this.getSdk(did).queryDidDoc(did);
            });
        }
        resolveMetadata(did) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.getSdk(did).queryAllDidDocVersionsMetadata(did);
            });
        }
        createResource(did, resourcePayload, signInputs, fee) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.getSdk(did).createLinkedResourceTx(signInputs, resourcePayload, '', fee, undefined);
            });
        }
        resolveResource(did, collectionId, resourceId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.getSdk(did).queryLinkedResource(collectionId, resourceId);
            });
        }
        resolveCollectionResources(did, collectionId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.getSdk(did).queryLinkedResources(collectionId);
            });
        }
        resolveResourceMetadata(did, collectionId, resourceId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.getSdk(did).queryLinkedResourceMetadata(collectionId, resourceId);
            });
        }
    };
    __setFunctionName(_classThis, "CheqdLedgerService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CheqdLedgerService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CheqdLedgerService = _classThis;
})();
exports.CheqdLedgerService = CheqdLedgerService;
