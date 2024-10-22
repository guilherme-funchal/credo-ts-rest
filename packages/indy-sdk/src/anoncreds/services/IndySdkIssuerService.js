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
exports.IndySdkIssuerService = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const error_1 = require("../../error");
const assertIndySdkWallet_1 = require("../../utils/assertIndySdkWallet");
const assertUnqualified_1 = require("../utils/assertUnqualified");
const tails_1 = require("../utils/tails");
const transform_1 = require("../utils/transform");
let IndySdkIssuerService = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IndySdkIssuerService = _classThis = class {
        constructor(indySdk) {
            this.indySdk = indySdk;
        }
        createSchema(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                // We only support passing qualified did:indy issuer ids in the indy issuer service when creating objects
                const { namespaceIdentifier } = (0, anoncreds_1.parseIndyDid)(options.issuerId);
                const { name, version, attrNames, issuerId } = options;
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                try {
                    const [, schema] = yield this.indySdk.issuerCreateSchema(namespaceIdentifier, name, version, attrNames);
                    return {
                        issuerId,
                        attrNames: schema.attrNames,
                        name: schema.name,
                        version: schema.version,
                    };
                }
                catch (error) {
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        createCredentialDefinition(agentContext, options, metadata) {
            return __awaiter(this, void 0, void 0, function* () {
                const { tag, supportRevocation, schema, issuerId, schemaId } = options;
                // We only support passing qualified did:indy issuer ids in the indy issuer service when creating objects
                const { namespaceIdentifier } = (0, anoncreds_1.parseIndyDid)(options.issuerId);
                // parse schema in a way that supports both unqualified and qualified identifiers
                const legacySchemaId = (0, anoncreds_1.getUnqualifiedSchemaId)(namespaceIdentifier, schema.name, schema.version);
                if (!metadata)
                    throw new core_1.AriesFrameworkError('The metadata parameter is required when using Indy, but received undefined.');
                try {
                    (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                    const [, credentialDefinition] = yield this.indySdk.issuerCreateAndStoreCredentialDef(agentContext.wallet.handle, namespaceIdentifier, (0, transform_1.indySdkSchemaFromAnonCreds)(legacySchemaId, schema, metadata.indyLedgerSchemaSeqNo), tag, 'CL', {
                        support_revocation: supportRevocation,
                    });
                    return {
                        credentialDefinition: {
                            issuerId,
                            tag: credentialDefinition.tag,
                            schemaId,
                            type: 'CL',
                            value: credentialDefinition.value,
                        },
                    };
                }
                catch (error) {
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        createCredentialOffer(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                (0, assertUnqualified_1.assertUnqualifiedCredentialDefinitionId)(options.credentialDefinitionId);
                try {
                    return yield this.indySdk.issuerCreateCredentialOffer(agentContext.wallet.handle, options.credentialDefinitionId);
                }
                catch (error) {
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        createCredential(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { tailsFilePath, credentialOffer, credentialRequest, credentialValues, revocationRegistryId } = options;
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                (0, assertUnqualified_1.assertUnqualifiedCredentialOffer)(options.credentialOffer);
                (0, assertUnqualified_1.assertUnqualifiedCredentialRequest)(options.credentialRequest);
                if (options.revocationRegistryId) {
                    (0, assertUnqualified_1.assertUnqualifiedRevocationRegistryId)(options.revocationRegistryId);
                }
                try {
                    // Indy SDK requires tailsReaderHandle. Use null if no tailsFilePath is present
                    const tailsReaderHandle = tailsFilePath ? yield (0, tails_1.createTailsReader)(agentContext, tailsFilePath) : 0;
                    if (revocationRegistryId || tailsFilePath) {
                        throw new core_1.AriesFrameworkError('Revocation not supported yet');
                    }
                    // prover_did is deprecated and thus if not provided we generate something on our side, as it's still required by the indy sdk
                    const proverDid = (_a = credentialRequest.prover_did) !== null && _a !== void 0 ? _a : (0, anoncreds_1.generateLegacyProverDidLikeString)();
                    const [credential, credentialRevocationId] = yield this.indySdk.issuerCreateCredential(agentContext.wallet.handle, credentialOffer, Object.assign(Object.assign({}, credentialRequest), { prover_did: proverDid }), credentialValues, revocationRegistryId !== null && revocationRegistryId !== void 0 ? revocationRegistryId : null, tailsReaderHandle);
                    return {
                        credential,
                        credentialRevocationId,
                    };
                }
                catch (error) {
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
    };
    __setFunctionName(_classThis, "IndySdkIssuerService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        IndySdkIssuerService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return IndySdkIssuerService = _classThis;
})();
exports.IndySdkIssuerService = IndySdkIssuerService;
