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
exports.IndySdkVerifierService = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const error_1 = require("../../error");
const assertUnqualified_1 = require("../utils/assertUnqualified");
const transform_1 = require("../utils/transform");
let IndySdkVerifierService = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IndySdkVerifierService = _classThis = class {
        constructor(indySdk) {
            this.indySdk = indySdk;
        }
        verifyProof(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertUnqualified_1.assertAllUnqualified)({
                    credentialDefinitionIds: Object.keys(options.credentialDefinitions),
                    schemaIds: Object.keys(options.schemas),
                    revocationRegistryIds: Object.keys(options.revocationRegistries),
                });
                try {
                    // The AnonCredsSchema doesn't contain the seqNo anymore. However, the indy credential definition id
                    // does contain the seqNo, so we can extract it from the credential definition id.
                    const seqNoMap = {};
                    // Convert AnonCreds credential definitions to Indy credential definitions
                    const indyCredentialDefinitions = {};
                    for (const credentialDefinitionId in options.credentialDefinitions) {
                        const credentialDefinition = options.credentialDefinitions[credentialDefinitionId];
                        indyCredentialDefinitions[credentialDefinitionId] = (0, transform_1.indySdkCredentialDefinitionFromAnonCreds)(credentialDefinitionId, credentialDefinition);
                        // Get the seqNo for the schemas so we can use it when transforming the schemas
                        const { schemaSeqNo } = (0, anoncreds_1.parseIndyCredentialDefinitionId)(credentialDefinitionId);
                        seqNoMap[credentialDefinition.schemaId] = Number(schemaSeqNo);
                    }
                    // Convert AnonCreds schemas to Indy schemas
                    const indySchemas = {};
                    for (const schemaId in options.schemas) {
                        const schema = options.schemas[schemaId];
                        indySchemas[schemaId] = (0, transform_1.indySdkSchemaFromAnonCreds)(schemaId, schema, seqNoMap[schemaId]);
                    }
                    // Convert AnonCreds revocation definitions to Indy revocation definitions
                    const indyRevocationDefinitions = {};
                    const indyRevocationRegistries = {};
                    for (const revocationRegistryDefinitionId in options.revocationRegistries) {
                        const { definition, revocationStatusLists } = options.revocationRegistries[revocationRegistryDefinitionId];
                        indyRevocationDefinitions[revocationRegistryDefinitionId] = (0, transform_1.indySdkRevocationRegistryDefinitionFromAnonCreds)(revocationRegistryDefinitionId, definition);
                        // Initialize empty object for this revocation registry
                        indyRevocationRegistries[revocationRegistryDefinitionId] = {};
                        // Also transform the revocation lists for the specified timestamps into the revocation registry
                        // format Indy expects
                        for (const timestamp in revocationStatusLists) {
                            const revocationStatusList = revocationStatusLists[timestamp];
                            indyRevocationRegistries[revocationRegistryDefinitionId][timestamp] =
                                (0, transform_1.indySdkRevocationRegistryFromAnonCreds)(revocationStatusList);
                        }
                    }
                    return yield this.indySdk.verifierVerifyProof(options.proofRequest, 
                    // FIXME IndyProof if badly typed in indy-sdk. It contains a `requested_predicates` property, which should be `predicates`.
                    options.proof, indySchemas, indyCredentialDefinitions, indyRevocationDefinitions, indyRevocationRegistries);
                }
                catch (error) {
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
    };
    __setFunctionName(_classThis, "IndySdkVerifierService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        IndySdkVerifierService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return IndySdkVerifierService = _classThis;
})();
exports.IndySdkVerifierService = IndySdkVerifierService;
