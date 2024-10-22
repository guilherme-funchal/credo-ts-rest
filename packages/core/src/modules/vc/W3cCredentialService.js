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
exports.W3cCredentialService = void 0;
const error_1 = require("../../error");
const plugins_1 = require("../../plugins");
const constants_1 = require("./constants");
const data_integrity_1 = require("./data-integrity");
const W3cJsonLdVerifiablePresentation_1 = require("./data-integrity/models/W3cJsonLdVerifiablePresentation");
const jwt_vc_1 = require("./jwt-vc");
const models_1 = require("./models");
const W3cPresentation_1 = require("./models/presentation/W3cPresentation");
const repository_1 = require("./repository");
let W3cCredentialService = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var W3cCredentialService = _classThis = class {
        constructor(w3cCredentialRepository, w3cJsonLdCredentialService, w3cJwtCredentialService) {
            this.w3cCredentialRepository = w3cCredentialRepository;
            this.w3cJsonLdCredentialService = w3cJsonLdCredentialService;
            this.w3cJwtCredentialService = w3cJwtCredentialService;
        }
        /**
         * Signs a credential
         *
         * @param credential the credential to be signed
         * @returns the signed credential
         */
        signCredential(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                if (options.format === models_1.ClaimFormat.JwtVc) {
                    return this.w3cJwtCredentialService.signCredential(agentContext, options);
                }
                else if (options.format === models_1.ClaimFormat.LdpVc) {
                    return this.w3cJsonLdCredentialService.signCredential(agentContext, options);
                }
                else {
                    throw new error_1.AriesFrameworkError(`Unsupported format in options. Format must be either 'jwt_vc' or 'ldp_vc'`);
                }
            });
        }
        /**
         * Verifies the signature(s) of a credential
         */
        verifyCredential(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                if (options.credential instanceof data_integrity_1.W3cJsonLdVerifiableCredential) {
                    return this.w3cJsonLdCredentialService.verifyCredential(agentContext, options);
                }
                else if (options.credential instanceof jwt_vc_1.W3cJwtVerifiableCredential || typeof options.credential === 'string') {
                    return this.w3cJwtCredentialService.verifyCredential(agentContext, options);
                }
                else {
                    throw new error_1.AriesFrameworkError(`Unsupported credential type in options. Credential must be either a W3cJsonLdVerifiableCredential or a W3cJwtVerifiableCredential`);
                }
            });
        }
        /**
         * Utility method that creates a {@link W3cPresentation} from one or more {@link W3cJsonLdVerifiableCredential}s.
         *
         * **NOTE: the presentation that is returned is unsigned.**
         *
         * @returns An instance of {@link W3cPresentation}
         */
        createPresentation(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const presentation = new W3cPresentation_1.W3cPresentation({
                    context: [constants_1.CREDENTIALS_CONTEXT_V1_URL],
                    type: ['VerifiablePresentation'],
                    verifiableCredential: options.credentials,
                    holder: options.holder,
                    id: options.id,
                });
                return presentation;
            });
        }
        /**
         * Signs a presentation including the credentials it includes
         *
         * @param presentation the presentation to be signed
         * @returns the signed presentation
         */
        signPresentation(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                if (options.format === models_1.ClaimFormat.JwtVp) {
                    return this.w3cJwtCredentialService.signPresentation(agentContext, options);
                }
                else if (options.format === models_1.ClaimFormat.LdpVp) {
                    return this.w3cJsonLdCredentialService.signPresentation(agentContext, options);
                }
                else {
                    throw new error_1.AriesFrameworkError(`Unsupported format in options. Format must be either 'jwt_vp' or 'ldp_vp'`);
                }
            });
        }
        /**
         * Verifies a presentation including the credentials it includes
         *
         * @param presentation the presentation to be verified
         * @returns the verification result
         */
        verifyPresentation(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                if (options.presentation instanceof W3cJsonLdVerifiablePresentation_1.W3cJsonLdVerifiablePresentation) {
                    return this.w3cJsonLdCredentialService.verifyPresentation(agentContext, options);
                }
                else if (options.presentation instanceof jwt_vc_1.W3cJwtVerifiablePresentation ||
                    typeof options.presentation === 'string') {
                    return this.w3cJwtCredentialService.verifyPresentation(agentContext, options);
                }
                else {
                    throw new error_1.AriesFrameworkError('Unsupported credential type in options. Presentation must be either a W3cJsonLdVerifiablePresentation or a W3cJwtVerifiablePresentation');
                }
            });
        }
        /**
         * Writes a credential to storage
         *
         * @param record the credential to be stored
         * @returns the credential record that was written to storage
         */
        storeCredential(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                let expandedTypes = [];
                // JsonLd credentials need expanded types to be stored.
                if (options.credential instanceof data_integrity_1.W3cJsonLdVerifiableCredential) {
                    expandedTypes = yield this.w3cJsonLdCredentialService.getExpandedTypesForCredential(agentContext, options.credential);
                }
                // Create an instance of the w3cCredentialRecord
                const w3cCredentialRecord = new repository_1.W3cCredentialRecord({
                    tags: { expandedTypes },
                    credential: options.credential,
                });
                // Store the w3c credential record
                yield this.w3cCredentialRepository.save(agentContext, w3cCredentialRecord);
                return w3cCredentialRecord;
            });
        }
        removeCredentialRecord(agentContext, id) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.w3cCredentialRepository.deleteById(agentContext, id);
            });
        }
        getAllCredentialRecords(agentContext) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.w3cCredentialRepository.getAll(agentContext);
            });
        }
        getCredentialRecordById(agentContext, id) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.w3cCredentialRepository.getById(agentContext, id);
            });
        }
        findCredentialsByQuery(agentContext, query) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield this.w3cCredentialRepository.findByQuery(agentContext, query);
                return result.map((record) => record.credential);
            });
        }
        findCredentialRecordByQuery(agentContext, query) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield this.w3cCredentialRepository.findSingleByQuery(agentContext, query);
                return result === null || result === void 0 ? void 0 : result.credential;
            });
        }
    };
    __setFunctionName(_classThis, "W3cCredentialService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        W3cCredentialService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return W3cCredentialService = _classThis;
})();
exports.W3cCredentialService = W3cCredentialService;
