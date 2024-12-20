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
exports.AnonCredsRsHolderService = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const anoncreds_shared_1 = require("@hyperledger/anoncreds-shared");
const AnonCredsRsModuleConfig_1 = require("../AnonCredsRsModuleConfig");
const AnonCredsRsError_1 = require("../errors/AnonCredsRsError");
let AnonCredsRsHolderService = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AnonCredsRsHolderService = _classThis = class {
        createLinkSecret(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                return {
                    linkSecretId: (_a = options === null || options === void 0 ? void 0 : options.linkSecretId) !== null && _a !== void 0 ? _a : core_1.utils.uuid(),
                    linkSecretValue: anoncreds_shared_1.LinkSecret.create(),
                };
            });
        }
        createProof(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { credentialDefinitions, proofRequest, selectedCredentials, schemas } = options;
                let presentation;
                try {
                    const rsCredentialDefinitions = {};
                    for (const credDefId in credentialDefinitions) {
                        rsCredentialDefinitions[credDefId] = credentialDefinitions[credDefId];
                    }
                    const rsSchemas = {};
                    for (const schemaId in schemas) {
                        rsSchemas[schemaId] = schemas[schemaId];
                    }
                    const credentialRepository = agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsCredentialRepository);
                    // Cache retrieved credentials in order to minimize storage calls
                    const retrievedCredentials = new Map();
                    const credentialEntryFromAttribute = (attribute) => __awaiter(this, void 0, void 0, function* () {
                        let credentialRecord = retrievedCredentials.get(attribute.credentialId);
                        if (!credentialRecord) {
                            credentialRecord = yield credentialRepository.getByCredentialId(agentContext, attribute.credentialId);
                            retrievedCredentials.set(attribute.credentialId, credentialRecord);
                        }
                        const revocationRegistryDefinitionId = credentialRecord.credential.rev_reg_id;
                        const revocationRegistryIndex = credentialRecord.credentialRevocationId;
                        // TODO: Check if credential has a revocation registry id (check response from anoncreds-rs API, as it is
                        // sending back a mandatory string in Credential.revocationRegistryId)
                        const timestamp = attribute.timestamp;
                        let revocationState;
                        let revocationRegistryDefinition;
                        try {
                            if (timestamp && revocationRegistryIndex && revocationRegistryDefinitionId) {
                                if (!options.revocationRegistries[revocationRegistryDefinitionId]) {
                                    throw new AnonCredsRsError_1.AnonCredsRsError(`Revocation Registry ${revocationRegistryDefinitionId} not found`);
                                }
                                const { definition, revocationStatusLists, tailsFilePath } = options.revocationRegistries[revocationRegistryDefinitionId];
                                // Extract revocation status list for the given timestamp
                                const revocationStatusList = revocationStatusLists[timestamp];
                                if (!revocationStatusList) {
                                    throw new core_1.AriesFrameworkError(`Revocation status list for revocation registry ${revocationRegistryDefinitionId} and timestamp ${timestamp} not found in revocation status lists. All revocation status lists must be present.`);
                                }
                                revocationRegistryDefinition = anoncreds_shared_1.RevocationRegistryDefinition.fromJson(definition);
                                revocationState = anoncreds_shared_1.CredentialRevocationState.create({
                                    revocationRegistryIndex: Number(revocationRegistryIndex),
                                    revocationRegistryDefinition,
                                    tailsPath: tailsFilePath,
                                    revocationStatusList: anoncreds_shared_1.RevocationStatusList.fromJson(revocationStatusList),
                                });
                            }
                            return {
                                linkSecretId: credentialRecord.linkSecretId,
                                credentialEntry: {
                                    credential: credentialRecord.credential,
                                    revocationState: revocationState === null || revocationState === void 0 ? void 0 : revocationState.toJson(),
                                    timestamp,
                                },
                            };
                        }
                        finally {
                            revocationState === null || revocationState === void 0 ? void 0 : revocationState.handle.clear();
                            revocationRegistryDefinition === null || revocationRegistryDefinition === void 0 ? void 0 : revocationRegistryDefinition.handle.clear();
                        }
                    });
                    const credentialsProve = [];
                    const credentials = [];
                    let entryIndex = 0;
                    for (const referent in selectedCredentials.attributes) {
                        const attribute = selectedCredentials.attributes[referent];
                        credentials.push(yield credentialEntryFromAttribute(attribute));
                        credentialsProve.push({ entryIndex, isPredicate: false, referent, reveal: attribute.revealed });
                        entryIndex = entryIndex + 1;
                    }
                    for (const referent in selectedCredentials.predicates) {
                        const predicate = selectedCredentials.predicates[referent];
                        credentials.push(yield credentialEntryFromAttribute(predicate));
                        credentialsProve.push({ entryIndex, isPredicate: true, referent, reveal: true });
                        entryIndex = entryIndex + 1;
                    }
                    // Get all requested credentials and take linkSecret. If it's not the same for every credential, throw error
                    const linkSecretsMatch = credentials.every((item) => item.linkSecretId === credentials[0].linkSecretId);
                    if (!linkSecretsMatch) {
                        throw new AnonCredsRsError_1.AnonCredsRsError('All credentials in a Proof should have been issued using the same Link Secret');
                    }
                    const linkSecretRecord = yield agentContext.dependencyManager
                        .resolve(anoncreds_1.AnonCredsLinkSecretRepository)
                        .getByLinkSecretId(agentContext, credentials[0].linkSecretId);
                    if (!linkSecretRecord.value) {
                        throw new AnonCredsRsError_1.AnonCredsRsError('Link Secret value not stored');
                    }
                    presentation = anoncreds_shared_1.Presentation.create({
                        credentialDefinitions: rsCredentialDefinitions,
                        schemas: rsSchemas,
                        presentationRequest: proofRequest,
                        credentials: credentials.map((entry) => entry.credentialEntry),
                        credentialsProve,
                        selfAttest: selectedCredentials.selfAttestedAttributes,
                        linkSecret: linkSecretRecord.value,
                    });
                    return presentation.toJson();
                }
                finally {
                    presentation === null || presentation === void 0 ? void 0 : presentation.handle.clear();
                }
            });
        }
        createCredentialRequest(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { useLegacyProverDid, credentialDefinition, credentialOffer } = options;
                let createReturnObj;
                try {
                    const linkSecretRepository = agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsLinkSecretRepository);
                    // If a link secret is specified, use it. Otherwise, attempt to use default link secret
                    let linkSecretRecord = options.linkSecretId
                        ? yield linkSecretRepository.getByLinkSecretId(agentContext, options.linkSecretId)
                        : yield linkSecretRepository.findDefault(agentContext);
                    // No default link secret. Automatically create one if set on module config
                    if (!linkSecretRecord) {
                        const moduleConfig = agentContext.dependencyManager.resolve(AnonCredsRsModuleConfig_1.AnonCredsRsModuleConfig);
                        if (!moduleConfig.autoCreateLinkSecret) {
                            throw new AnonCredsRsError_1.AnonCredsRsError('No link secret provided to createCredentialRequest and no default link secret has been found');
                        }
                        const { linkSecretId, linkSecretValue } = yield this.createLinkSecret(agentContext, {});
                        linkSecretRecord = yield (0, anoncreds_1.storeLinkSecret)(agentContext, { linkSecretId, linkSecretValue, setAsDefault: true });
                    }
                    if (!linkSecretRecord.value) {
                        throw new AnonCredsRsError_1.AnonCredsRsError('Link Secret value not stored');
                    }
                    const isLegacyIdentifier = credentialOffer.cred_def_id.match(anoncreds_1.unqualifiedCredentialDefinitionIdRegex);
                    if (!isLegacyIdentifier && useLegacyProverDid) {
                        throw new core_1.AriesFrameworkError('Cannot use legacy prover_did with non-legacy identifiers');
                    }
                    createReturnObj = anoncreds_shared_1.CredentialRequest.create({
                        entropy: !useLegacyProverDid || !isLegacyIdentifier ? anoncreds_shared_1.anoncreds.generateNonce() : undefined,
                        proverDid: useLegacyProverDid
                            ? core_1.TypedArrayEncoder.toBase58(core_1.TypedArrayEncoder.fromString(anoncreds_shared_1.anoncreds.generateNonce().slice(0, 16)))
                            : undefined,
                        credentialDefinition: credentialDefinition,
                        credentialOffer: credentialOffer,
                        linkSecret: linkSecretRecord.value,
                        linkSecretId: linkSecretRecord.linkSecretId,
                    });
                    return {
                        credentialRequest: createReturnObj.credentialRequest.toJson(),
                        credentialRequestMetadata: createReturnObj.credentialRequestMetadata.toJson(),
                    };
                }
                finally {
                    createReturnObj === null || createReturnObj === void 0 ? void 0 : createReturnObj.credentialRequest.handle.clear();
                    createReturnObj === null || createReturnObj === void 0 ? void 0 : createReturnObj.credentialRequestMetadata.handle.clear();
                }
            });
        }
        storeCredential(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const { credential, credentialDefinition, credentialRequestMetadata, revocationRegistry, schema } = options;
                const linkSecretRecord = yield agentContext.dependencyManager
                    .resolve(anoncreds_1.AnonCredsLinkSecretRepository)
                    .getByLinkSecretId(agentContext, credentialRequestMetadata.link_secret_name);
                if (!linkSecretRecord.value) {
                    throw new AnonCredsRsError_1.AnonCredsRsError('Link Secret value not stored');
                }
                const revocationRegistryDefinition = revocationRegistry === null || revocationRegistry === void 0 ? void 0 : revocationRegistry.definition;
                const credentialId = (_a = options.credentialId) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
                let credentialObj;
                let processedCredential;
                try {
                    credentialObj = anoncreds_shared_1.Credential.fromJson(credential);
                    processedCredential = credentialObj.process({
                        credentialDefinition: credentialDefinition,
                        credentialRequestMetadata: credentialRequestMetadata,
                        linkSecret: linkSecretRecord.value,
                        revocationRegistryDefinition,
                    });
                    const credentialRepository = agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsCredentialRepository);
                    const methodName = agentContext.dependencyManager
                        .resolve(anoncreds_1.AnonCredsRegistryService)
                        .getRegistryForIdentifier(agentContext, credential.cred_def_id).methodName;
                    yield credentialRepository.save(agentContext, new anoncreds_1.AnonCredsCredentialRecord({
                        credential: processedCredential.toJson(),
                        credentialId,
                        linkSecretId: linkSecretRecord.linkSecretId,
                        issuerId: options.credentialDefinition.issuerId,
                        schemaName: schema.name,
                        schemaIssuerId: schema.issuerId,
                        schemaVersion: schema.version,
                        credentialRevocationId: (_b = processedCredential.revocationRegistryIndex) === null || _b === void 0 ? void 0 : _b.toString(),
                        methodName,
                    }));
                    return credentialId;
                }
                finally {
                    credentialObj === null || credentialObj === void 0 ? void 0 : credentialObj.handle.clear();
                    processedCredential === null || processedCredential === void 0 ? void 0 : processedCredential.handle.clear();
                }
            });
        }
        getCredential(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const credentialRecord = yield agentContext.dependencyManager
                    .resolve(anoncreds_1.AnonCredsCredentialRepository)
                    .getByCredentialId(agentContext, options.credentialId);
                const attributes = {};
                for (const attribute in credentialRecord.credential.values) {
                    attributes[attribute] = credentialRecord.credential.values[attribute].raw;
                }
                return {
                    attributes,
                    credentialDefinitionId: credentialRecord.credential.cred_def_id,
                    credentialId: credentialRecord.credentialId,
                    schemaId: credentialRecord.credential.schema_id,
                    credentialRevocationId: credentialRecord.credentialRevocationId,
                    revocationRegistryId: credentialRecord.credential.rev_reg_id,
                    methodName: credentialRecord.methodName,
                };
            });
        }
        getCredentials(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const credentialRecords = yield agentContext.dependencyManager
                    .resolve(anoncreds_1.AnonCredsCredentialRepository)
                    .findByQuery(agentContext, {
                    credentialDefinitionId: options.credentialDefinitionId,
                    schemaId: options.schemaId,
                    issuerId: options.issuerId,
                    schemaName: options.schemaName,
                    schemaVersion: options.schemaVersion,
                    schemaIssuerId: options.schemaIssuerId,
                    methodName: options.methodName,
                });
                return credentialRecords.map((credentialRecord) => ({
                    attributes: Object.fromEntries(Object.entries(credentialRecord.credential.values).map(([key, value]) => [key, value.raw])),
                    credentialDefinitionId: credentialRecord.credential.cred_def_id,
                    credentialId: credentialRecord.credentialId,
                    schemaId: credentialRecord.credential.schema_id,
                    credentialRevocationId: credentialRecord.credentialRevocationId,
                    revocationRegistryId: credentialRecord.credential.rev_reg_id,
                    methodName: credentialRecord.methodName,
                }));
            });
        }
        deleteCredential(agentContext, credentialId) {
            return __awaiter(this, void 0, void 0, function* () {
                const credentialRepository = agentContext.dependencyManager.resolve(anoncreds_1.AnonCredsCredentialRepository);
                const credentialRecord = yield credentialRepository.getByCredentialId(agentContext, credentialId);
                yield credentialRepository.delete(agentContext, credentialRecord);
            });
        }
        getCredentialsForProofRequest(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const proofRequest = options.proofRequest;
                const referent = options.attributeReferent;
                const requestedAttribute = (_a = proofRequest.requested_attributes[referent]) !== null && _a !== void 0 ? _a : proofRequest.requested_predicates[referent];
                if (!requestedAttribute) {
                    throw new AnonCredsRsError_1.AnonCredsRsError(`Referent not found in proof request`);
                }
                const $and = [];
                // Make sure the attribute(s) that are requested are present using the marker tag
                const attributes = (_b = requestedAttribute.names) !== null && _b !== void 0 ? _b : [requestedAttribute.name];
                const attributeQuery = {};
                for (const attribute of attributes) {
                    attributeQuery[`attr::${attribute}::marker`] = true;
                }
                $and.push(attributeQuery);
                // Add query for proof request restrictions
                if (requestedAttribute.restrictions) {
                    const restrictionQuery = this.queryFromRestrictions(requestedAttribute.restrictions);
                    $and.push(restrictionQuery);
                }
                // Add extra query
                // TODO: we're not really typing the extraQuery, and it will work differently based on the anoncreds implmentation
                // We should make the allowed properties more strict
                if (options.extraQuery) {
                    $and.push(options.extraQuery);
                }
                const credentials = yield agentContext.dependencyManager
                    .resolve(anoncreds_1.AnonCredsCredentialRepository)
                    .findByQuery(agentContext, {
                    $and,
                });
                return credentials.map((credentialRecord) => {
                    const attributes = {};
                    for (const attribute in credentialRecord.credential.values) {
                        attributes[attribute] = credentialRecord.credential.values[attribute].raw;
                    }
                    return {
                        credentialInfo: {
                            attributes,
                            credentialDefinitionId: credentialRecord.credential.cred_def_id,
                            credentialId: credentialRecord.credentialId,
                            schemaId: credentialRecord.credential.schema_id,
                            credentialRevocationId: credentialRecord.credentialRevocationId,
                            revocationRegistryId: credentialRecord.credential.rev_reg_id,
                            methodName: credentialRecord.methodName,
                        },
                        interval: proofRequest.non_revoked,
                    };
                });
            });
        }
        queryFromRestrictions(restrictions) {
            var _a, _b;
            const query = [];
            const { restrictions: parsedRestrictions } = core_1.JsonTransformer.fromJSON({ restrictions }, anoncreds_1.AnonCredsRestrictionWrapper);
            for (const restriction of parsedRestrictions) {
                const queryElements = {};
                if (restriction.credentialDefinitionId) {
                    queryElements.credentialDefinitionId = restriction.credentialDefinitionId;
                }
                if (restriction.issuerId || restriction.issuerDid) {
                    queryElements.issuerId = (_a = restriction.issuerId) !== null && _a !== void 0 ? _a : restriction.issuerDid;
                }
                if (restriction.schemaId) {
                    queryElements.schemaId = restriction.schemaId;
                }
                if (restriction.schemaIssuerId || restriction.schemaIssuerDid) {
                    queryElements.schemaIssuerId = (_b = restriction.schemaIssuerId) !== null && _b !== void 0 ? _b : restriction.issuerDid;
                }
                if (restriction.schemaName) {
                    queryElements.schemaName = restriction.schemaName;
                }
                if (restriction.schemaVersion) {
                    queryElements.schemaVersion = restriction.schemaVersion;
                }
                for (const [attributeName, attributeValue] of Object.entries(restriction.attributeValues)) {
                    queryElements[`attr::${attributeName}::value`] = attributeValue;
                }
                for (const [attributeName, isAvailable] of Object.entries(restriction.attributeMarkers)) {
                    if (isAvailable) {
                        queryElements[`attr::${attributeName}::marker`] = isAvailable;
                    }
                }
                query.push(queryElements);
            }
            return query.length === 1 ? query[0] : { $or: query };
        }
    };
    __setFunctionName(_classThis, "AnonCredsRsHolderService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AnonCredsRsHolderService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AnonCredsRsHolderService = _classThis;
})();
exports.AnonCredsRsHolderService = AnonCredsRsHolderService;
