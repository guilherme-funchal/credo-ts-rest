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
exports.DidsApi = void 0;
const error_1 = require("../../error");
const plugins_1 = require("../../plugins");
const error_2 = require("../../wallet/error");
let DidsApi = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DidsApi = _classThis = class {
        constructor(didResolverService, didRegistrarService, didRepository, agentContext, config) {
            this.didResolverService = didResolverService;
            this.didRegistrarService = didRegistrarService;
            this.didRepository = didRepository;
            this.agentContext = agentContext;
            this.config = config;
        }
        /**
         * Resolve a did to a did document.
         *
         * Follows the interface as defined in https://w3c-ccg.github.io/did-resolution/
         */
        resolve(didUrl, options) {
            return this.didResolverService.resolve(this.agentContext, didUrl, options);
        }
        /**
         * Create, register and store a did and did document.
         *
         * Follows the interface as defined in https://identity.foundation/did-registration
         */
        create(options) {
            return this.didRegistrarService.create(this.agentContext, options);
        }
        /**
         * Update an existing did document.
         *
         * Follows the interface as defined in https://identity.foundation/did-registration
         */
        update(options) {
            return this.didRegistrarService.update(this.agentContext, options);
        }
        /**
         * Deactivate an existing did.
         *
         * Follows the interface as defined in https://identity.foundation/did-registration
         */
        deactivate(options) {
            return this.didRegistrarService.deactivate(this.agentContext, options);
        }
        /**
         * Resolve a did to a did document. This won't return the associated metadata as defined
         * in the did resolution specification, and will throw an error if the did document could not
         * be resolved.
         */
        resolveDidDocument(didUrl) {
            return this.didResolverService.resolveDidDocument(this.agentContext, didUrl);
        }
        /**
         * Get a list of all dids created by the agent. This will return a list of {@link DidRecord} objects.
         * Each document will have an id property with the value of the did. Optionally, it will contain a did document,
         * but this is only for documents that can't be resolved from the did itself or remotely.
         *
         * You can call `${@link DidsModule.resolve} to resolve the did document based on the did itself.
         */
        getCreatedDids({ method, did } = {}) {
            return this.didRepository.getCreatedDids(this.agentContext, { method, did });
        }
        /**
         * Import an existing did that was created outside of the DidsApi. This will create a `DidRecord` for the did
         * and will allow the did to be used in other parts of the agent. If you need to create a new did document,
         * you can use the {@link DidsApi.create} method to create and register the did.
         *
         * If no `didDocument` is provided, the did document will be resolved using the did resolver. You can optionally provide a list
         * of private key buffer with the respective private key bytes. These keys will be stored in the wallet, and allows you to use the
         * did for other operations. Providing keys that already exist in the wallet is allowed, and those keys will be skipped from being
         * added to the wallet.
         *
         * By default, this method will throw an error if the did already exists in the wallet. You can override this behavior by setting
         * the `overwrite` option to `true`. This will update the did document in the record, and allows you to update the did over time.
         */
        import(_a) {
            return __awaiter(this, arguments, void 0, function* ({ did, didDocument, privateKeys = [], overwrite }) {
                if (didDocument && didDocument.id !== did) {
                    throw new error_1.AriesFrameworkError(`Did document id ${didDocument.id} does not match did ${did}`);
                }
                const existingDidRecord = yield this.didRepository.findCreatedDid(this.agentContext, did);
                if (existingDidRecord && !overwrite) {
                    throw new error_1.AriesFrameworkError(`A created did ${did} already exists. If you want to override the existing did, set the 'overwrite' option to update the did.`);
                }
                if (!didDocument) {
                    didDocument = yield this.resolveDidDocument(did);
                }
                // Loop over all private keys and store them in the wallet. We don't check whether the keys are actually associated
                // with the did document, this is up to the user.
                for (const key of privateKeys) {
                    try {
                        // We can't check whether the key already exists in the wallet, but we can try to create it and catch the error
                        // if the key already exists.
                        yield this.agentContext.wallet.createKey({
                            keyType: key.keyType,
                            privateKey: key.privateKey,
                        });
                    }
                    catch (error) {
                        if (error instanceof error_2.WalletKeyExistsError) {
                            // If the error is a WalletKeyExistsError, we can ignore it. This means the key
                            // already exists in the wallet. We don't want to throw an error in this case.
                        }
                        else {
                            throw error;
                        }
                    }
                }
                // Update existing did record
                if (existingDidRecord) {
                    existingDidRecord.didDocument = didDocument;
                    existingDidRecord.setTags({
                        recipientKeyFingerprints: didDocument.recipientKeys.map((key) => key.fingerprint),
                    });
                    yield this.didRepository.update(this.agentContext, existingDidRecord);
                    return;
                }
                // Create new did record
                yield this.didRepository.storeCreatedDid(this.agentContext, {
                    did,
                    didDocument,
                    tags: {
                        recipientKeyFingerprints: didDocument.recipientKeys.map((key) => key.fingerprint),
                    },
                });
            });
        }
    };
    __setFunctionName(_classThis, "DidsApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DidsApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DidsApi = _classThis;
})();
exports.DidsApi = DidsApi;
