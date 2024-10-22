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
exports.AnonCredsApi = void 0;
const core_1 = require("@aries-framework/core");
const error_1 = require("./error");
const repository_1 = require("./repository");
const AnonCredsCredentialDefinitionRecord_1 = require("./repository/AnonCredsCredentialDefinitionRecord");
const AnonCredsSchemaRecord_1 = require("./repository/AnonCredsSchemaRecord");
const anonCredsCredentialDefinitionRecordMetadataTypes_1 = require("./repository/anonCredsCredentialDefinitionRecordMetadataTypes");
const utils_1 = require("./utils");
let AnonCredsApi = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AnonCredsApi = _classThis = class {
        constructor(agentContext, anonCredsRegistryService, config, anonCredsIssuerService, anonCredsHolderService, anonCredsSchemaRepository, anonCredsCredentialDefinitionRepository, anonCredsCredentialDefinitionPrivateRepository, anonCredsKeyCorrectnessProofRepository, anonCredsLinkSecretRepository) {
            this.agentContext = agentContext;
            this.anonCredsRegistryService = anonCredsRegistryService;
            this.config = config;
            this.anonCredsIssuerService = anonCredsIssuerService;
            this.anonCredsHolderService = anonCredsHolderService;
            this.anonCredsSchemaRepository = anonCredsSchemaRepository;
            this.anonCredsCredentialDefinitionRepository = anonCredsCredentialDefinitionRepository;
            this.anonCredsCredentialDefinitionPrivateRepository = anonCredsCredentialDefinitionPrivateRepository;
            this.anonCredsKeyCorrectnessProofRepository = anonCredsKeyCorrectnessProofRepository;
            this.anonCredsLinkSecretRepository = anonCredsLinkSecretRepository;
        }
        /**
         * Create a Link Secret, optionally indicating its ID and if it will be the default one
         * If there is no default Link Secret, this will be set as default (even if setAsDefault is false).
         *
         */
        createLinkSecret(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { linkSecretId, linkSecretValue } = yield this.anonCredsHolderService.createLinkSecret(this.agentContext, {
                    linkSecretId: options === null || options === void 0 ? void 0 : options.linkSecretId,
                });
                yield (0, utils_1.storeLinkSecret)(this.agentContext, {
                    linkSecretId,
                    linkSecretValue,
                    setAsDefault: options === null || options === void 0 ? void 0 : options.setAsDefault,
                });
                return linkSecretId;
            });
        }
        /**
         * Get a list of ids for the created link secrets
         */
        getLinkSecretIds() {
            return __awaiter(this, void 0, void 0, function* () {
                const linkSecrets = yield this.anonCredsLinkSecretRepository.getAll(this.agentContext);
                return linkSecrets.map((linkSecret) => linkSecret.linkSecretId);
            });
        }
        /**
         * Retrieve a {@link AnonCredsSchema} from the registry associated
         * with the {@link schemaId}
         */
        getSchema(schemaId) {
            return __awaiter(this, void 0, void 0, function* () {
                const failedReturnBase = {
                    resolutionMetadata: {
                        error: 'error',
                        message: `Unable to resolve schema ${schemaId}`,
                    },
                    schemaId,
                    schemaMetadata: {},
                };
                const registry = this.findRegistryForIdentifier(schemaId);
                if (!registry) {
                    failedReturnBase.resolutionMetadata.error = 'unsupportedAnonCredsMethod';
                    failedReturnBase.resolutionMetadata.message = `Unable to resolve schema ${schemaId}: No registry found for identifier ${schemaId}`;
                    return failedReturnBase;
                }
                try {
                    const result = yield registry.getSchema(this.agentContext, schemaId);
                    return result;
                }
                catch (error) {
                    failedReturnBase.resolutionMetadata.message = `Unable to resolve schema ${schemaId}: ${error.message}`;
                    return failedReturnBase;
                }
            });
        }
        registerSchema(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const failedReturnBase = {
                    schemaState: {
                        state: 'failed',
                        schema: options.schema,
                        reason: `Error registering schema for issuerId ${options.schema.issuerId}`,
                    },
                    registrationMetadata: {},
                    schemaMetadata: {},
                };
                const registry = this.findRegistryForIdentifier(options.schema.issuerId);
                if (!registry) {
                    failedReturnBase.schemaState.reason = `Unable to register schema. No registry found for issuerId ${options.schema.issuerId}`;
                    return failedReturnBase;
                }
                try {
                    const result = yield registry.registerSchema(this.agentContext, options);
                    if (result.schemaState.state === 'finished') {
                        yield this.storeSchemaRecord(registry, result);
                    }
                    return result;
                }
                catch (error) {
                    // Storage failed
                    if (error instanceof error_1.AnonCredsStoreRecordError) {
                        failedReturnBase.schemaState.reason = `Error storing schema record: ${error.message}`;
                        return failedReturnBase;
                    }
                    // In theory registerSchema SHOULD NOT throw, but we can't know for sure
                    failedReturnBase.schemaState.reason = `Error registering schema: ${error.message}`;
                    return failedReturnBase;
                }
            });
        }
        getCreatedSchemas(query) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.anonCredsSchemaRepository.findByQuery(this.agentContext, query);
            });
        }
        /**
         * Retrieve a {@link GetCredentialDefinitionReturn} from the registry associated
         * with the {@link credentialDefinitionId}
         */
        getCredentialDefinition(credentialDefinitionId) {
            return __awaiter(this, void 0, void 0, function* () {
                const failedReturnBase = {
                    resolutionMetadata: {
                        error: 'error',
                        message: `Unable to resolve credential definition ${credentialDefinitionId}`,
                    },
                    credentialDefinitionId,
                    credentialDefinitionMetadata: {},
                };
                const registry = this.findRegistryForIdentifier(credentialDefinitionId);
                if (!registry) {
                    failedReturnBase.resolutionMetadata.error = 'unsupportedAnonCredsMethod';
                    failedReturnBase.resolutionMetadata.message = `Unable to resolve credential definition ${credentialDefinitionId}: No registry found for identifier ${credentialDefinitionId}`;
                    return failedReturnBase;
                }
                try {
                    const result = yield registry.getCredentialDefinition(this.agentContext, credentialDefinitionId);
                    return result;
                }
                catch (error) {
                    failedReturnBase.resolutionMetadata.message = `Unable to resolve credential definition ${credentialDefinitionId}: ${error.message}`;
                    return failedReturnBase;
                }
            });
        }
        registerCredentialDefinition(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const failedReturnBase = {
                    credentialDefinitionState: {
                        state: 'failed',
                        reason: `Error registering credential definition for issuerId ${options.credentialDefinition.issuerId}`,
                    },
                    registrationMetadata: {},
                    credentialDefinitionMetadata: {},
                };
                const registry = this.findRegistryForIdentifier(options.credentialDefinition.issuerId);
                if (!registry) {
                    failedReturnBase.credentialDefinitionState.reason = `Unable to register credential definition. No registry found for issuerId ${options.credentialDefinition.issuerId}`;
                    return failedReturnBase;
                }
                let credentialDefinition;
                let credentialDefinitionPrivate = undefined;
                let keyCorrectnessProof = undefined;
                try {
                    if (isFullCredentialDefinitionInput(options.credentialDefinition)) {
                        credentialDefinition = options.credentialDefinition;
                    }
                    else {
                        // If the input credential definition is not a full credential definition, we need to create one first
                        // There's a caveat to when the input contains a full credential, that the credential definition private
                        // and key correctness proof must already be stored in the wallet
                        const schemaRegistry = this.findRegistryForIdentifier(options.credentialDefinition.schemaId);
                        if (!schemaRegistry) {
                            failedReturnBase.credentialDefinitionState.reason = `Unable to register credential definition. No registry found for schemaId ${options.credentialDefinition.schemaId}`;
                            return failedReturnBase;
                        }
                        const schemaResult = yield schemaRegistry.getSchema(this.agentContext, options.credentialDefinition.schemaId);
                        if (!schemaResult.schema) {
                            failedReturnBase.credentialDefinitionState.reason = `error resolving schema with id ${options.credentialDefinition.schemaId}: ${schemaResult.resolutionMetadata.error} ${schemaResult.resolutionMetadata.message}`;
                            return failedReturnBase;
                        }
                        const createCredentialDefinitionResult = yield this.anonCredsIssuerService.createCredentialDefinition(this.agentContext, {
                            issuerId: options.credentialDefinition.issuerId,
                            schemaId: options.credentialDefinition.schemaId,
                            tag: options.credentialDefinition.tag,
                            supportRevocation: false,
                            schema: schemaResult.schema,
                        }, 
                        // FIXME: Indy SDK requires the schema seq no to be passed in here. This is not ideal.
                        {
                            indyLedgerSchemaSeqNo: schemaResult.schemaMetadata.indyLedgerSeqNo,
                        });
                        credentialDefinition = createCredentialDefinitionResult.credentialDefinition;
                        credentialDefinitionPrivate = createCredentialDefinitionResult.credentialDefinitionPrivate;
                        keyCorrectnessProof = createCredentialDefinitionResult.keyCorrectnessProof;
                    }
                    const result = yield registry.registerCredentialDefinition(this.agentContext, {
                        credentialDefinition,
                        options: options.options,
                    });
                    // Once a credential definition is created, the credential definition private and the key correctness proof must be stored because they change even if they the credential is recreated with the same arguments.
                    // To avoid having unregistered credential definitions in the wallet, the credential definitions itself are stored only when the credential definition status is finished, meaning that the credential definition has been successfully registered.
                    yield this.storeCredentialDefinitionPrivateAndKeyCorrectnessRecord(result, credentialDefinitionPrivate, keyCorrectnessProof);
                    if (result.credentialDefinitionState.state === 'finished') {
                        yield this.storeCredentialDefinitionRecord(registry, result);
                    }
                    return result;
                }
                catch (error) {
                    // Storage failed
                    if (error instanceof error_1.AnonCredsStoreRecordError) {
                        failedReturnBase.credentialDefinitionState.reason = `Error storing credential definition records: ${error.message}`;
                        return failedReturnBase;
                    }
                    // In theory registerCredentialDefinition SHOULD NOT throw, but we can't know for sure
                    failedReturnBase.credentialDefinitionState.reason = `Error registering credential definition: ${error.message}`;
                    return failedReturnBase;
                }
            });
        }
        getCreatedCredentialDefinitions(query) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.anonCredsCredentialDefinitionRepository.findByQuery(this.agentContext, query);
            });
        }
        /**
         * Retrieve a {@link AnonCredsRevocationRegistryDefinition} from the registry associated
         * with the {@link revocationRegistryDefinitionId}
         */
        getRevocationRegistryDefinition(revocationRegistryDefinitionId) {
            return __awaiter(this, void 0, void 0, function* () {
                const failedReturnBase = {
                    resolutionMetadata: {
                        error: 'error',
                        message: `Unable to resolve revocation registry ${revocationRegistryDefinitionId}`,
                    },
                    revocationRegistryDefinitionId,
                    revocationRegistryDefinitionMetadata: {},
                };
                const registry = this.findRegistryForIdentifier(revocationRegistryDefinitionId);
                if (!registry) {
                    failedReturnBase.resolutionMetadata.error = 'unsupportedAnonCredsMethod';
                    failedReturnBase.resolutionMetadata.message = `Unable to resolve revocation registry ${revocationRegistryDefinitionId}: No registry found for identifier ${revocationRegistryDefinitionId}`;
                    return failedReturnBase;
                }
                try {
                    const result = yield registry.getRevocationRegistryDefinition(this.agentContext, revocationRegistryDefinitionId);
                    return result;
                }
                catch (error) {
                    failedReturnBase.resolutionMetadata.message = `Unable to resolve revocation registry ${revocationRegistryDefinitionId}: ${error.message}`;
                    return failedReturnBase;
                }
            });
        }
        /**
         * Retrieve the {@link AnonCredsRevocationStatusList} for the given {@link timestamp} from the registry associated
         * with the {@link revocationRegistryDefinitionId}
         */
        getRevocationStatusList(revocationRegistryDefinitionId, timestamp) {
            return __awaiter(this, void 0, void 0, function* () {
                const failedReturnBase = {
                    resolutionMetadata: {
                        error: 'error',
                        message: `Unable to resolve revocation status list for revocation registry ${revocationRegistryDefinitionId}`,
                    },
                    revocationStatusListMetadata: {},
                };
                const registry = this.findRegistryForIdentifier(revocationRegistryDefinitionId);
                if (!registry) {
                    failedReturnBase.resolutionMetadata.error = 'unsupportedAnonCredsMethod';
                    failedReturnBase.resolutionMetadata.message = `Unable to resolve revocation status list for revocation registry ${revocationRegistryDefinitionId}: No registry found for identifier ${revocationRegistryDefinitionId}`;
                    return failedReturnBase;
                }
                try {
                    const result = yield registry.getRevocationStatusList(this.agentContext, revocationRegistryDefinitionId, timestamp);
                    return result;
                }
                catch (error) {
                    failedReturnBase.resolutionMetadata.message = `Unable to resolve revocation status list for revocation registry ${revocationRegistryDefinitionId}: ${error.message}`;
                    return failedReturnBase;
                }
            });
        }
        getCredential(credentialId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.anonCredsHolderService.getCredential(this.agentContext, { credentialId });
            });
        }
        getCredentials(options) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.anonCredsHolderService.getCredentials(this.agentContext, options);
            });
        }
        storeCredentialDefinitionPrivateAndKeyCorrectnessRecord(result, credentialDefinitionPrivate, keyCorrectnessProof) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!result.credentialDefinitionState.credentialDefinitionId)
                        return;
                    // Store Credential Definition private data (if provided by issuer service)
                    if (credentialDefinitionPrivate) {
                        const credentialDefinitionPrivateRecord = new repository_1.AnonCredsCredentialDefinitionPrivateRecord({
                            credentialDefinitionId: result.credentialDefinitionState.credentialDefinitionId,
                            value: credentialDefinitionPrivate,
                        });
                        yield this.anonCredsCredentialDefinitionPrivateRepository.save(this.agentContext, credentialDefinitionPrivateRecord);
                    }
                    if (keyCorrectnessProof) {
                        const keyCorrectnessProofRecord = new repository_1.AnonCredsKeyCorrectnessProofRecord({
                            credentialDefinitionId: result.credentialDefinitionState.credentialDefinitionId,
                            value: keyCorrectnessProof,
                        });
                        yield this.anonCredsKeyCorrectnessProofRepository.save(this.agentContext, keyCorrectnessProofRecord);
                    }
                }
                catch (error) {
                    throw new error_1.AnonCredsStoreRecordError(`Error storing credential definition key-correctness-proof and private`, {
                        cause: error,
                    });
                }
            });
        }
        storeCredentialDefinitionRecord(registry, result) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    // If we have both the credentialDefinition and the credentialDefinitionId we will store a copy of the credential definition. We may need to handle an
                    // edge case in the future where we e.g. don't have the id yet, and it is registered through a different channel
                    if (!result.credentialDefinitionState.credentialDefinition ||
                        !result.credentialDefinitionState.credentialDefinitionId) {
                        return;
                    }
                    const credentialDefinitionRecord = new AnonCredsCredentialDefinitionRecord_1.AnonCredsCredentialDefinitionRecord({
                        credentialDefinitionId: result.credentialDefinitionState.credentialDefinitionId,
                        credentialDefinition: result.credentialDefinitionState.credentialDefinition,
                        methodName: registry.methodName,
                    });
                    // TODO: do we need to store this metadata? For indy, the registration metadata contains e.g.
                    // the indyLedgerSeqNo and the didIndyNamespace, but it can get quite big if complete transactions
                    // are stored in the metadata
                    credentialDefinitionRecord.metadata.set(anonCredsCredentialDefinitionRecordMetadataTypes_1.AnonCredsCredentialDefinitionRecordMetadataKeys.CredentialDefinitionMetadata, result.credentialDefinitionMetadata);
                    credentialDefinitionRecord.metadata.set(anonCredsCredentialDefinitionRecordMetadataTypes_1.AnonCredsCredentialDefinitionRecordMetadataKeys.CredentialDefinitionRegistrationMetadata, result.registrationMetadata);
                    yield this.anonCredsCredentialDefinitionRepository.save(this.agentContext, credentialDefinitionRecord);
                }
                catch (error) {
                    throw new error_1.AnonCredsStoreRecordError(`Error storing credential definition records`, { cause: error });
                }
            });
        }
        storeSchemaRecord(registry, result) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    // If we have both the schema and the schemaId we will store a copy of the schema. We may need to handle an
                    // edge case in the future where we e.g. don't have the id yet, and it is registered through a different channel
                    if (result.schemaState.schema && result.schemaState.schemaId) {
                        const schemaRecord = new AnonCredsSchemaRecord_1.AnonCredsSchemaRecord({
                            schemaId: result.schemaState.schemaId,
                            schema: result.schemaState.schema,
                            methodName: registry.methodName,
                        });
                        yield this.anonCredsSchemaRepository.save(this.agentContext, schemaRecord);
                    }
                }
                catch (error) {
                    throw new error_1.AnonCredsStoreRecordError(`Error storing schema record`, { cause: error });
                }
            });
        }
        findRegistryForIdentifier(identifier) {
            try {
                return this.anonCredsRegistryService.getRegistryForIdentifier(this.agentContext, identifier);
            }
            catch (_a) {
                return null;
            }
        }
    };
    __setFunctionName(_classThis, "AnonCredsApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AnonCredsApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AnonCredsApi = _classThis;
})();
exports.AnonCredsApi = AnonCredsApi;
function isFullCredentialDefinitionInput(credentialDefinition) {
    return 'value' in credentialDefinition;
}
