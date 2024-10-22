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
exports.IndySdkRevocationService = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const error_1 = require("../../error");
const tails_1 = require("../utils/tails");
const transform_1 = require("../utils/transform");
var RequestReferentType;
(function (RequestReferentType) {
    RequestReferentType["Attribute"] = "attribute";
    RequestReferentType["Predicate"] = "predicate";
    RequestReferentType["SelfAttestedAttribute"] = "self-attested-attribute";
})(RequestReferentType || (RequestReferentType = {}));
/**
 * Internal class that handles revocation related logic for the Indy SDK
 *
 * @internal
 */
let IndySdkRevocationService = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IndySdkRevocationService = _classThis = class {
        constructor(indySdk) {
            this.indySdk = indySdk;
        }
        /**
         * Creates the revocation state for the requested credentials in a format that the Indy SDK expects.
         */
        createRevocationState(agentContext, proofRequest, selectedCredentials, revocationRegistries) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                try {
                    agentContext.config.logger.debug(`Creating Revocation State(s) for proof request`, {
                        proofRequest,
                        selectedCredentials,
                    });
                    const indyRevocationStates = {};
                    const referentCredentials = [];
                    //Retrieve information for referents and push to single array
                    for (const [referent, selectedCredential] of Object.entries((_a = selectedCredentials.attributes) !== null && _a !== void 0 ? _a : {})) {
                        referentCredentials.push({
                            referent,
                            credentialInfo: selectedCredential.credentialInfo,
                            type: RequestReferentType.Attribute,
                            referentRevocationInterval: proofRequest.requested_attributes[referent].non_revoked,
                            timestamp: selectedCredential.timestamp,
                        });
                    }
                    for (const [referent, selectedCredential] of Object.entries((_b = selectedCredentials.predicates) !== null && _b !== void 0 ? _b : {})) {
                        referentCredentials.push({
                            referent,
                            credentialInfo: selectedCredential.credentialInfo,
                            type: RequestReferentType.Predicate,
                            referentRevocationInterval: proofRequest.requested_predicates[referent].non_revoked,
                            timestamp: selectedCredential.timestamp,
                        });
                    }
                    for (const { referent, credentialInfo, type, referentRevocationInterval, timestamp } of referentCredentials) {
                        // Prefer referent-specific revocation interval over global revocation interval
                        const requestRevocationInterval = referentRevocationInterval !== null && referentRevocationInterval !== void 0 ? referentRevocationInterval : proofRequest.non_revoked;
                        const credentialRevocationId = credentialInfo.credentialRevocationId;
                        const revocationRegistryId = credentialInfo.revocationRegistryId;
                        // If revocation interval is present and the credential is revocable then create revocation state
                        if (requestRevocationInterval && timestamp && credentialRevocationId && revocationRegistryId) {
                            agentContext.config.logger.trace(`Presentation is requesting proof of non revocation for ${type} referent '${referent}', creating revocation state for credential`, {
                                requestRevocationInterval,
                                credentialRevocationId,
                                revocationRegistryId,
                            });
                            (0, anoncreds_1.assertBestPracticeRevocationInterval)(requestRevocationInterval);
                            const { definition, revocationStatusLists, tailsFilePath } = revocationRegistries[revocationRegistryId];
                            // Extract revocation status list for the given timestamp
                            const revocationStatusList = revocationStatusLists[timestamp];
                            if (!revocationStatusList) {
                                throw new core_1.AriesFrameworkError(`Revocation status list for revocation registry ${revocationRegistryId} and timestamp ${timestamp} not found in revocation status lists. All revocation status lists must be present.`);
                            }
                            const tails = yield (0, tails_1.createTailsReader)(agentContext, tailsFilePath);
                            const revocationState = yield this.indySdk.createRevocationState(tails, (0, transform_1.indySdkRevocationRegistryDefinitionFromAnonCreds)(revocationRegistryId, definition), (0, transform_1.indySdkRevocationDeltaFromAnonCreds)(revocationStatusList), revocationStatusList.timestamp, credentialRevocationId);
                            if (!indyRevocationStates[revocationRegistryId]) {
                                indyRevocationStates[revocationRegistryId] = {};
                            }
                            indyRevocationStates[revocationRegistryId][timestamp] = revocationState;
                        }
                    }
                    agentContext.config.logger.debug(`Created Revocation States for Proof Request`, {
                        indyRevocationStates,
                    });
                    return indyRevocationStates;
                }
                catch (error) {
                    agentContext.config.logger.error(`Error creating Indy Revocation State for Proof Request`, {
                        error,
                        proofRequest,
                        selectedCredentials,
                    });
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
    };
    __setFunctionName(_classThis, "IndySdkRevocationService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        IndySdkRevocationService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return IndySdkRevocationService = _classThis;
})();
exports.IndySdkRevocationService = IndySdkRevocationService;
