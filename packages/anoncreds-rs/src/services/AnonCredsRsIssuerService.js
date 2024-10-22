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
exports.AnonCredsRsIssuerService = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const anoncreds_shared_1 = require("@hyperledger/anoncreds-shared");
const AnonCredsRsError_1 = require("../errors/AnonCredsRsError");
let AnonCredsRsIssuerService = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AnonCredsRsIssuerService = _classThis = class {
        createSchema(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { issuerId, name, version, attrNames: attributeNames } = options;
                let schema;
                try {
                    const schema = anoncreds_shared_1.Schema.create({
                        issuerId,
                        name,
                        version,
                        attributeNames,
                    });
                    return schema.toJson();
                }
                finally {
                    schema === null || schema === void 0 ? void 0 : schema.handle.clear();
                }
            });
        }
        createCredentialDefinition(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { tag, supportRevocation, schema, issuerId, schemaId } = options;
                let createReturnObj;
                try {
                    createReturnObj = anoncreds_shared_1.CredentialDefinition.create({
                        schema: schema,
                        issuerId,
                        schemaId,
                        tag,
                        supportRevocation,
                        signatureType: 'CL',
                    });
                    return {
                        credentialDefinition: createReturnObj.credentialDefinition.toJson(),
                        credentialDefinitionPrivate: createReturnObj.credentialDefinitionPrivate.toJson(),
                        keyCorrectnessProof: createReturnObj.keyCorrectnessProof.toJson(),
                    };
                }
                finally {
                    createReturnObj === null || createReturnObj === void 0 ? void 0 : createReturnObj.credentialDefinition.handle.clear();
                    createReturnObj === null || createReturnObj === void 0 ? void 0 : createReturnObj.credentialDefinitionPrivate.handle.clear();
                    createReturnObj === null || createReturnObj === void 0 ? void 0 : createReturnObj.keyCorrectnessProof.handle.clear();
                }
            });
        }
        createCredentialOffer(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { credentialDefinitionId } = options;
                let credentialOffer;
                try {
                    // The getByCredentialDefinitionId supports both qualified and unqualified identifiers, even though the
                    // record is always stored using the qualified identifier.
                    const credentialDefinitionRecord = yield agentContext.dependencyManager
                        .resolve(anoncreds_1.AnonCredsCredentialDefinitionRepository)
                        .getByCredentialDefinitionId(agentContext, options.credentialDefinitionId);
                    // We fetch the keyCorrectnessProof based on the credential definition record id, as the
                    // credential definition id passed to this module could be unqualified, and the key correctness
                    // proof is only stored using the qualified identifier.
                    const keyCorrectnessProofRecord = yield agentContext.dependencyManager
                        .resolve(anoncreds_1.AnonCredsKeyCorrectnessProofRepository)
                        .getByCredentialDefinitionId(agentContext, credentialDefinitionRecord.credentialDefinitionId);
                    if (!credentialDefinitionRecord) {
                        throw new AnonCredsRsError_1.AnonCredsRsError(`Credential Definition ${credentialDefinitionId} not found`);
                    }
                    let schemaId = credentialDefinitionRecord.credentialDefinition.schemaId;
                    // if the credentialDefinitionId is not qualified, we need to transform the schemaId to also be unqualified
                    if ((0, anoncreds_1.isUnqualifiedCredentialDefinitionId)(options.credentialDefinitionId)) {
                        const { namespaceIdentifier, schemaName, schemaVersion } = (0, anoncreds_1.parseIndySchemaId)(schemaId);
                        schemaId = (0, anoncreds_1.getUnqualifiedSchemaId)(namespaceIdentifier, schemaName, schemaVersion);
                    }
                    credentialOffer = anoncreds_shared_1.CredentialOffer.create({
                        credentialDefinitionId,
                        keyCorrectnessProof: keyCorrectnessProofRecord === null || keyCorrectnessProofRecord === void 0 ? void 0 : keyCorrectnessProofRecord.value,
                        schemaId,
                    });
                    return credentialOffer.toJson();
                }
                finally {
                    credentialOffer === null || credentialOffer === void 0 ? void 0 : credentialOffer.handle.clear();
                }
            });
        }
        createCredential(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { tailsFilePath, credentialOffer, credentialRequest, credentialValues, revocationRegistryId } = options;
                let credential;
                try {
                    if (revocationRegistryId || tailsFilePath) {
                        throw new core_1.AriesFrameworkError('Revocation not supported yet');
                    }
                    const attributeRawValues = {};
                    const attributeEncodedValues = {};
                    Object.keys(credentialValues).forEach((key) => {
                        attributeRawValues[key] = credentialValues[key].raw;
                        attributeEncodedValues[key] = credentialValues[key].encoded;
                    });
                    const credentialDefinitionRecord = yield agentContext.dependencyManager
                        .resolve(anoncreds_1.AnonCredsCredentialDefinitionRepository)
                        .getByCredentialDefinitionId(agentContext, options.credentialRequest.cred_def_id);
                    // We fetch the private record based on the cred def id from the cred def record, as the
                    // credential definition id passed to this module could be unqualified, and the private record
                    // is only stored using the qualified identifier.
                    const credentialDefinitionPrivateRecord = yield agentContext.dependencyManager
                        .resolve(anoncreds_1.AnonCredsCredentialDefinitionPrivateRepository)
                        .getByCredentialDefinitionId(agentContext, credentialDefinitionRecord.credentialDefinitionId);
                    let credentialDefinition = credentialDefinitionRecord.credentialDefinition;
                    if ((0, anoncreds_1.isUnqualifiedCredentialDefinitionId)(options.credentialRequest.cred_def_id)) {
                        const { namespaceIdentifier, schemaName, schemaVersion } = (0, anoncreds_1.parseIndySchemaId)(credentialDefinition.schemaId);
                        const { namespaceIdentifier: unqualifiedDid } = (0, anoncreds_1.parseIndyDid)(credentialDefinition.issuerId);
                        anoncreds_1.parseIndyDid;
                        credentialDefinition = Object.assign(Object.assign({}, credentialDefinition), { schemaId: (0, anoncreds_1.getUnqualifiedSchemaId)(namespaceIdentifier, schemaName, schemaVersion), issuerId: unqualifiedDid });
                    }
                    credential = anoncreds_shared_1.Credential.create({
                        credentialDefinition: credentialDefinitionRecord.credentialDefinition,
                        credentialOffer: credentialOffer,
                        credentialRequest: credentialRequest,
                        revocationRegistryId,
                        attributeEncodedValues,
                        attributeRawValues,
                        credentialDefinitionPrivate: credentialDefinitionPrivateRecord.value,
                    });
                    return {
                        credential: credential.toJson(),
                        credentialRevocationId: (_a = credential.revocationRegistryIndex) === null || _a === void 0 ? void 0 : _a.toString(),
                    };
                }
                finally {
                    credential === null || credential === void 0 ? void 0 : credential.handle.clear();
                }
            });
        }
    };
    __setFunctionName(_classThis, "AnonCredsRsIssuerService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AnonCredsRsIssuerService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AnonCredsRsIssuerService = _classThis;
})();
exports.AnonCredsRsIssuerService = AnonCredsRsIssuerService;
