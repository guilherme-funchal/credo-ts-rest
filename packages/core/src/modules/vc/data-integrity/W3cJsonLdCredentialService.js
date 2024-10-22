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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.W3cJsonLdCredentialService = void 0;
const WalletKeyPair_1 = require("../../../crypto/WalletKeyPair");
const error_1 = require("../../../error");
const plugins_1 = require("../../../plugins");
const utils_1 = require("../../../utils");
const dids_1 = require("../../dids");
const key_type_1 = require("../../dids/domain/key-type");
const util_1 = require("../util");
const deriveProof_1 = require("./deriveProof");
const jsonldUtil_1 = require("./jsonldUtil");
const jsonld_1 = __importDefault(require("./libraries/jsonld"));
const vc_1 = __importDefault(require("./libraries/vc"));
const models_1 = require("./models");
const W3cJsonLdVerifiablePresentation_1 = require("./models/W3cJsonLdVerifiablePresentation");
/**
 * Supports signing and verification of credentials according to the [Verifiable Credential Data Model](https://www.w3.org/TR/vc-data-model)
 * using [Data Integrity Proof](https://www.w3.org/TR/vc-data-model/#data-integrity-proofs).
 */
let W3cJsonLdCredentialService = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var W3cJsonLdCredentialService = _classThis = class {
        constructor(signatureSuiteRegistry, w3cCredentialsModuleConfig) {
            this.signatureSuiteRegistry = signatureSuiteRegistry;
            this.w3cCredentialsModuleConfig = w3cCredentialsModuleConfig;
        }
        /**
         * Signs a credential
         */
        signCredential(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const WalletKeyPair = (0, WalletKeyPair_1.createWalletKeyPairClass)(agentContext.wallet);
                const signingKey = yield this.getPublicKeyFromVerificationMethod(agentContext, options.verificationMethod);
                const suiteInfo = this.signatureSuiteRegistry.getByProofType(options.proofType);
                if (!suiteInfo.keyTypes.includes(signingKey.keyType)) {
                    throw new error_1.AriesFrameworkError('The key type of the verification method does not match the suite');
                }
                const keyPair = new WalletKeyPair({
                    controller: options.credential.issuerId, // should we check this against the verificationMethod.controller?
                    id: options.verificationMethod,
                    key: signingKey,
                    wallet: agentContext.wallet,
                });
                const SuiteClass = suiteInfo.suiteClass;
                const suite = new SuiteClass({
                    key: keyPair,
                    LDKeyClass: WalletKeyPair,
                    proof: {
                        verificationMethod: options.verificationMethod,
                    },
                    useNativeCanonize: false,
                    date: (_a = options.created) !== null && _a !== void 0 ? _a : (0, util_1.w3cDate)(),
                });
                const result = yield vc_1.default.issue({
                    credential: utils_1.JsonTransformer.toJSON(options.credential),
                    suite: suite,
                    purpose: options.proofPurpose,
                    documentLoader: this.w3cCredentialsModuleConfig.documentLoader(agentContext),
                });
                return utils_1.JsonTransformer.fromJSON(result, models_1.W3cJsonLdVerifiableCredential);
            });
        }
        /**
         * Verifies the signature(s) of a credential
         *
         * @param credential the credential to be verified
         * @returns the verification result
         */
        verifyCredential(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    const verifyCredentialStatus = (_a = options.verifyCredentialStatus) !== null && _a !== void 0 ? _a : true;
                    const suites = this.getSignatureSuitesForCredential(agentContext, options.credential);
                    const verifyOptions = {
                        credential: utils_1.JsonTransformer.toJSON(options.credential),
                        suite: suites,
                        documentLoader: this.w3cCredentialsModuleConfig.documentLoader(agentContext),
                        checkStatus: () => {
                            if (verifyCredentialStatus) {
                                throw new error_1.AriesFrameworkError('Verifying credential status for JSON-LD credentials is currently not supported');
                            }
                            return {
                                verified: true,
                            };
                        },
                    };
                    // this is a hack because vcjs throws if purpose is passed as undefined or null
                    if (options.proofPurpose) {
                        verifyOptions['purpose'] = options.proofPurpose;
                    }
                    const result = yield vc_1.default.verifyCredential(verifyOptions);
                    const { verified: isValid } = result, remainingResult = __rest(result
                    // We map the result to our own result type to make it easier to work with
                    // however, for now we just add a single vcJs validation result as we don't
                    // have access to the internal validation results of vc-js
                    , ["verified"]);
                    // We map the result to our own result type to make it easier to work with
                    // however, for now we just add a single vcJs validation result as we don't
                    // have access to the internal validation results of vc-js
                    return {
                        isValid,
                        validations: {
                            vcJs: Object.assign({ isValid }, remainingResult),
                        },
                        error: result.error,
                    };
                }
                catch (error) {
                    return {
                        isValid: false,
                        validations: {},
                        error,
                    };
                }
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
                // create keyPair
                const WalletKeyPair = (0, WalletKeyPair_1.createWalletKeyPairClass)(agentContext.wallet);
                const suiteInfo = this.signatureSuiteRegistry.getByProofType(options.proofType);
                if (!suiteInfo) {
                    throw new error_1.AriesFrameworkError(`The requested proofType ${options.proofType} is not supported`);
                }
                const signingKey = yield this.getPublicKeyFromVerificationMethod(agentContext, options.verificationMethod);
                if (!suiteInfo.keyTypes.includes(signingKey.keyType)) {
                    throw new error_1.AriesFrameworkError('The key type of the verification method does not match the suite');
                }
                const documentLoader = this.w3cCredentialsModuleConfig.documentLoader(agentContext);
                const verificationMethodObject = (yield documentLoader(options.verificationMethod)).document;
                const keyPair = new WalletKeyPair({
                    controller: verificationMethodObject['controller'],
                    id: options.verificationMethod,
                    key: signingKey,
                    wallet: agentContext.wallet,
                });
                const suite = new suiteInfo.suiteClass({
                    LDKeyClass: WalletKeyPair,
                    proof: {
                        verificationMethod: options.verificationMethod,
                    },
                    date: new Date().toISOString(),
                    key: keyPair,
                    useNativeCanonize: false,
                });
                const result = yield vc_1.default.signPresentation({
                    presentation: utils_1.JsonTransformer.toJSON(options.presentation),
                    suite: suite,
                    challenge: options.challenge,
                    domain: options.domain,
                    documentLoader: this.w3cCredentialsModuleConfig.documentLoader(agentContext),
                });
                return utils_1.JsonTransformer.fromJSON(result, W3cJsonLdVerifiablePresentation_1.W3cJsonLdVerifiablePresentation);
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
                try {
                    // create keyPair
                    const WalletKeyPair = (0, WalletKeyPair_1.createWalletKeyPairClass)(agentContext.wallet);
                    let proofs = options.presentation.proof;
                    if (!Array.isArray(proofs)) {
                        proofs = [proofs];
                    }
                    if (options.purpose) {
                        proofs = proofs.filter((proof) => proof.proofPurpose === options.purpose.term);
                    }
                    const presentationSuites = proofs.map((proof) => {
                        const SuiteClass = this.signatureSuiteRegistry.getByProofType(proof.type).suiteClass;
                        return new SuiteClass({
                            LDKeyClass: WalletKeyPair,
                            proof: {
                                verificationMethod: proof.verificationMethod,
                            },
                            date: proof.created,
                            useNativeCanonize: false,
                        });
                    });
                    const credentials = (0, utils_1.asArray)(options.presentation.verifiableCredential);
                    (0, jsonldUtil_1.assertOnlyW3cJsonLdVerifiableCredentials)(credentials);
                    const credentialSuites = credentials.map((credential) => this.getSignatureSuitesForCredential(agentContext, credential));
                    const allSuites = presentationSuites.concat(...credentialSuites);
                    const verifyOptions = {
                        presentation: utils_1.JsonTransformer.toJSON(options.presentation),
                        suite: allSuites,
                        challenge: options.challenge,
                        domain: options.domain,
                        documentLoader: this.w3cCredentialsModuleConfig.documentLoader(agentContext),
                    };
                    // this is a hack because vcjs throws if purpose is passed as undefined or null
                    if (options.purpose) {
                        verifyOptions['presentationPurpose'] = options.purpose;
                    }
                    const result = yield vc_1.default.verify(verifyOptions);
                    const { verified: isValid } = result, remainingResult = __rest(result
                    // We map the result to our own result type to make it easier to work with
                    // however, for now we just add a single vcJs validation result as we don't
                    // have access to the internal validation results of vc-js
                    , ["verified"]);
                    // We map the result to our own result type to make it easier to work with
                    // however, for now we just add a single vcJs validation result as we don't
                    // have access to the internal validation results of vc-js
                    return {
                        isValid,
                        validations: {
                            vcJs: Object.assign({ isValid }, remainingResult),
                        },
                        error: result.error,
                    };
                }
                catch (error) {
                    return {
                        isValid: false,
                        validations: {},
                        error,
                    };
                }
            });
        }
        deriveProof(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                // TODO: make suite dynamic
                const suiteInfo = this.signatureSuiteRegistry.getByProofType('BbsBlsSignatureProof2020');
                const SuiteClass = suiteInfo.suiteClass;
                const suite = new SuiteClass();
                const proof = yield (0, deriveProof_1.deriveProof)(utils_1.JsonTransformer.toJSON(options.credential), options.revealDocument, {
                    suite: suite,
                    documentLoader: this.w3cCredentialsModuleConfig.documentLoader(agentContext),
                });
                return proof;
            });
        }
        getVerificationMethodTypesByProofType(proofType) {
            return this.signatureSuiteRegistry.getByProofType(proofType).verificationMethodTypes;
        }
        getKeyTypesByProofType(proofType) {
            return this.signatureSuiteRegistry.getByProofType(proofType).keyTypes;
        }
        getProofTypeByVerificationMethodType(verificationMethodType) {
            const suite = this.signatureSuiteRegistry.getByVerificationMethodType(verificationMethodType);
            if (!suite) {
                throw new error_1.AriesFrameworkError(`No suite found for verification method type ${verificationMethodType}}`);
            }
            return suite.proofType;
        }
        getExpandedTypesForCredential(agentContext, credential) {
            return __awaiter(this, void 0, void 0, function* () {
                // Get the expanded types
                const expandedTypes = (yield jsonld_1.default.expand(utils_1.JsonTransformer.toJSON(credential), {
                    documentLoader: this.w3cCredentialsModuleConfig.documentLoader(agentContext),
                }))[0]['@type'];
                return (0, utils_1.asArray)(expandedTypes);
            });
        }
        getPublicKeyFromVerificationMethod(agentContext, verificationMethod) {
            return __awaiter(this, void 0, void 0, function* () {
                const documentLoader = this.w3cCredentialsModuleConfig.documentLoader(agentContext);
                const verificationMethodObject = yield documentLoader(verificationMethod);
                const verificationMethodClass = utils_1.JsonTransformer.fromJSON(verificationMethodObject.document, dids_1.VerificationMethod);
                const key = (0, key_type_1.getKeyFromVerificationMethod)(verificationMethodClass);
                return key;
            });
        }
        getSignatureSuitesForCredential(agentContext, credential) {
            const WalletKeyPair = (0, WalletKeyPair_1.createWalletKeyPairClass)(agentContext.wallet);
            let proofs = credential.proof;
            if (!Array.isArray(proofs)) {
                proofs = [proofs];
            }
            return proofs.map((proof) => {
                var _a;
                const SuiteClass = (_a = this.signatureSuiteRegistry.getByProofType(proof.type)) === null || _a === void 0 ? void 0 : _a.suiteClass;
                if (SuiteClass) {
                    return new SuiteClass({
                        LDKeyClass: WalletKeyPair,
                        proof: {
                            verificationMethod: proof.verificationMethod,
                        },
                        date: proof.created,
                        useNativeCanonize: false,
                    });
                }
            });
        }
    };
    __setFunctionName(_classThis, "W3cJsonLdCredentialService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        W3cJsonLdCredentialService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return W3cJsonLdCredentialService = _classThis;
})();
exports.W3cJsonLdCredentialService = W3cJsonLdCredentialService;
