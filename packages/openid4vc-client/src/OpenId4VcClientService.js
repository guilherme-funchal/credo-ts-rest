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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcClientService = void 0;
const core_1 = require("@aries-framework/core");
const openid4vci_client_1 = require("@sphereon/openid4vci-client");
const random_1 = require("@stablelib/random");
const OpenId4VcClientServiceOptions_1 = require("./OpenId4VcClientServiceOptions");
const flowTypeMapping = {
    [OpenId4VcClientServiceOptions_1.AuthFlowType.AuthorizationCodeFlow]: openid4vci_client_1.AuthzFlowType.AUTHORIZATION_CODE_FLOW,
    [OpenId4VcClientServiceOptions_1.AuthFlowType.PreAuthorizedCodeFlow]: openid4vci_client_1.AuthzFlowType.PRE_AUTHORIZED_CODE_FLOW,
};
/**
 * @internal
 */
let OpenId4VcClientService = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var OpenId4VcClientService = _classThis = class {
        constructor(logger, w3cCredentialService, jwsService) {
            this.w3cCredentialService = w3cCredentialService;
            this.jwsService = jwsService;
            this.logger = logger;
        }
        generateCodeVerifier() {
            return (0, random_1.randomStringForEntropy)(256);
        }
        generateAuthorizationUrl(options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                this.logger.debug('Generating authorization url');
                if (!options.scope || options.scope.length === 0) {
                    throw new core_1.AriesFrameworkError('Only scoped based authorization requests are supported at this time. Please provide at least one scope');
                }
                const client = yield openid4vci_client_1.OpenID4VCIClient.initiateFromURI({
                    issuanceInitiationURI: options.initiationUri,
                    flowType: openid4vci_client_1.AuthzFlowType.AUTHORIZATION_CODE_FLOW,
                });
                const codeVerifier = this.generateCodeVerifier();
                const codeVerifierSha256 = core_1.Hasher.hash(core_1.TypedArrayEncoder.fromString(codeVerifier), 'sha2-256');
                const base64Url = core_1.TypedArrayEncoder.toBase64URL(codeVerifierSha256);
                this.logger.debug('Converted code_verifier to code_challenge', {
                    codeVerifier: codeVerifier,
                    sha256: codeVerifierSha256.toString(),
                    base64Url: base64Url,
                });
                const authorizationUrl = client.createAuthorizationRequestUrl({
                    clientId: options.clientId,
                    codeChallengeMethod: openid4vci_client_1.CodeChallengeMethod.SHA256,
                    codeChallenge: base64Url,
                    redirectUri: options.redirectUri,
                    scope: (_a = options.scope) === null || _a === void 0 ? void 0 : _a.join(' '),
                });
                return {
                    authorizationUrl,
                    codeVerifier,
                };
            });
        }
        requestCredential(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const receivedCredentials = [];
                const supportedJwaSignatureAlgorithms = this.getSupportedJwaSignatureAlgorithms(agentContext);
                const allowedProofOfPossessionSignatureAlgorithms = options.allowedProofOfPossessionSignatureAlgorithms
                    ? options.allowedProofOfPossessionSignatureAlgorithms.filter((algorithm) => supportedJwaSignatureAlgorithms.includes(algorithm))
                    : supportedJwaSignatureAlgorithms;
                // Take the allowed credential formats from the options or use the default
                const allowedCredentialFormats = (_a = options.allowedCredentialFormats) !== null && _a !== void 0 ? _a : OpenId4VcClientServiceOptions_1.supportedCredentialFormats;
                const flowType = flowTypeMapping[options.flowType];
                if (!flowType) {
                    throw new core_1.AriesFrameworkError(`Unsupported flowType ${options.flowType}. Valid values are ${Object.values(OpenId4VcClientServiceOptions_1.AuthFlowType)}`);
                }
                const client = yield openid4vci_client_1.OpenID4VCIClient.initiateFromURI({
                    issuanceInitiationURI: options.issuerUri,
                    flowType,
                });
                // acquire the access token
                // NOTE: only scope based flow is supported for authorized flow. However there's not clear mapping between
                // the scope property and which credential to request (this is out of scope of the spec), so it will still
                // just request all credentials that have been offered in the credential offer. We may need to add some extra
                // input properties that allows to define the credential type(s) to request.
                const accessToken = options.flowType === OpenId4VcClientServiceOptions_1.AuthFlowType.AuthorizationCodeFlow
                    ? yield client.acquireAccessToken({
                        clientId: options.clientId,
                        code: options.authorizationCode,
                        codeVerifier: options.codeVerifier,
                        redirectUri: options.redirectUri,
                    })
                    : yield client.acquireAccessToken({});
                const serverMetadata = yield client.retrieveServerMetadata();
                this.logger.info('Fetched server metadata', {
                    issuer: serverMetadata.issuer,
                    credentialEndpoint: serverMetadata.credential_endpoint,
                    tokenEndpoint: serverMetadata.token_endpoint,
                });
                const credentialsSupported = client.getCredentialsSupported(true);
                this.logger.debug('Full server metadata', serverMetadata);
                // Loop through all the credentialTypes in the credential offer
                for (const credentialType of client.getCredentialTypesFromInitiation()) {
                    const credentialMetadata = credentialsSupported[credentialType];
                    // Get all options for the credential request (such as which kid to use, the signature algorithm, etc)
                    const { verificationMethod, credentialFormat, signatureAlgorithm } = yield this.getCredentialRequestOptions(agentContext, {
                        allowedCredentialFormats,
                        allowedProofOfPossessionSignatureAlgorithms,
                        credentialMetadata,
                        credentialType,
                        proofOfPossessionVerificationMethodResolver: options.proofOfPossessionVerificationMethodResolver,
                    });
                    // Create the proof of possession
                    const proofInput = yield openid4vci_client_1.ProofOfPossessionBuilder.fromAccessTokenResponse({
                        accessTokenResponse: accessToken,
                        callbacks: {
                            signCallback: this.signCallback(agentContext, verificationMethod),
                        },
                    })
                        .withEndpointMetadata(serverMetadata)
                        .withAlg(signatureAlgorithm)
                        .withKid(verificationMethod.id)
                        .build();
                    this.logger.debug('Generated JWS', proofInput);
                    // Acquire the credential
                    const credentialRequestClient = openid4vci_client_1.CredentialRequestClientBuilder.fromIssuanceInitiationURI({
                        uri: options.issuerUri,
                        metadata: serverMetadata,
                    })
                        .withTokenFromResponse(accessToken)
                        .build();
                    const credentialResponse = yield credentialRequestClient.acquireCredentialsUsingProof({
                        proofInput,
                        credentialType,
                        format: credentialFormat,
                    });
                    const storedCredential = yield this.handleCredentialResponse(agentContext, credentialResponse, {
                        verifyCredentialStatus: options.verifyCredentialStatus,
                    });
                    receivedCredentials.push(storedCredential);
                }
                return receivedCredentials;
            });
        }
        /**
         * Get the options for the credential request. Internally this will resolve the proof of possession
         * requirements, and based on that it will call the proofOfPossessionVerificationMethodResolver to
         * allow the caller to select the correct verification method based on the requirements for the proof
         * of possession.
         */
        getCredentialRequestOptions(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { credentialFormat, signatureAlgorithm, supportedDidMethods, supportsAllDidMethods } = this.getProofOfPossessionRequirements(agentContext, {
                    credentialType: options.credentialType,
                    credentialMetadata: options.credentialMetadata,
                    allowedCredentialFormats: options.allowedCredentialFormats,
                    allowedProofOfPossessionSignatureAlgorithms: options.allowedProofOfPossessionSignatureAlgorithms,
                });
                const JwkClass = (0, core_1.getJwkClassFromJwaSignatureAlgorithm)(signatureAlgorithm);
                if (!JwkClass) {
                    throw new core_1.AriesFrameworkError(`Could not determine JWK key type based on JWA signature algorithm '${signatureAlgorithm}'`);
                }
                const supportedVerificationMethods = (0, core_1.getSupportedVerificationMethodTypesFromKeyType)(JwkClass.keyType);
                // Now we need to determine the did method and alg based on the cryptographic suite
                const verificationMethod = yield options.proofOfPossessionVerificationMethodResolver({
                    credentialFormat,
                    proofOfPossessionSignatureAlgorithm: signatureAlgorithm,
                    supportedVerificationMethods,
                    keyType: JwkClass.keyType,
                    credentialType: options.credentialType,
                    supportsAllDidMethods,
                    supportedDidMethods,
                });
                // Make sure the verification method uses a supported did method
                if (!supportsAllDidMethods &&
                    !supportedDidMethods.find((supportedDidMethod) => verificationMethod.id.startsWith(supportedDidMethod))) {
                    const { method } = (0, core_1.parseDid)(verificationMethod.id);
                    const supportedDidMethodsString = supportedDidMethods.join(', ');
                    throw new core_1.AriesFrameworkError(`Verification method uses did method '${method}', but issuer only supports '${supportedDidMethodsString}'`);
                }
                // Make sure the verification method uses a supported verification method type
                if (!supportedVerificationMethods.includes(verificationMethod.type)) {
                    const supportedVerificationMethodsString = supportedVerificationMethods.join(', ');
                    throw new core_1.AriesFrameworkError(`Verification method uses verification method type '${verificationMethod.type}', but only '${supportedVerificationMethodsString}' verification methods are supported for key type '${JwkClass.keyType}'`);
                }
                return { verificationMethod, signatureAlgorithm, credentialFormat };
            });
        }
        /**
         * Get the requirements for creating the proof of possession. Based on the allowed
         * credential formats, the allowed proof of possession signature algorithms, and the
         * credential type, this method will select the best credential format and signature
         * algorithm to use, based on the order of preference.
         */
        getProofOfPossessionRequirements(agentContext, options) {
            var _a, _b, _c;
            // Find the potential credentialFormat to use
            const potentialCredentialFormats = options.allowedCredentialFormats.filter((allowedFormat) => options.credentialMetadata.formats[allowedFormat] !== undefined);
            // TODO: we may want to add a logging statement here if the supported formats of the wallet
            // DOES support one of the issuer formats, but it is not in the allowedFormats
            if (potentialCredentialFormats.length === 0) {
                const formatsString = Object.keys(options.credentialMetadata.formats).join(', ');
                throw new core_1.AriesFrameworkError(`Issuer only supports formats '${formatsString}' for credential type '${options.credentialType}', but the wallet only allows formats '${options.allowedCredentialFormats.join(', ')}'`);
            }
            // Loop through all the potential credential formats and find the first one that we have a matching
            // cryptographic suite supported for.
            for (const potentialCredentialFormat of potentialCredentialFormats) {
                const credentialFormat = options.credentialMetadata.formats[potentialCredentialFormat];
                const issuerSupportedCryptographicSuites = (_a = credentialFormat.cryptographic_suites_supported) !== null && _a !== void 0 ? _a : [];
                // FIXME: somehow the MATTR Launchpad returns binding_methods_supported instead of cryptographic_binding_methods_supported
                const issuerSupportedBindingMethods = (_c = (_b = credentialFormat.cryptographic_binding_methods_supported) !== null && _b !== void 0 ? _b : credentialFormat.binding_methods_supported) !== null && _c !== void 0 ? _c : [];
                // For each of the supported algs, find the key types, then find the proof types
                const signatureSuiteRegistry = agentContext.dependencyManager.resolve(core_1.SignatureSuiteRegistry);
                let potentialSignatureAlgorithm;
                switch (potentialCredentialFormat) {
                    case core_1.ClaimFormat.JwtVc:
                        potentialSignatureAlgorithm = options.allowedProofOfPossessionSignatureAlgorithms.find((signatureAlgorithm) => issuerSupportedCryptographicSuites.includes(signatureAlgorithm));
                        break;
                    case core_1.ClaimFormat.LdpVc:
                        // We need to find it based on the JSON-LD proof type
                        potentialSignatureAlgorithm = options.allowedProofOfPossessionSignatureAlgorithms.find((signatureAlgorithm) => {
                            const JwkClass = (0, core_1.getJwkClassFromJwaSignatureAlgorithm)(signatureAlgorithm);
                            if (!JwkClass)
                                return false;
                            // TODO: getByKeyType should return a list
                            const matchingSuite = signatureSuiteRegistry.getByKeyType(JwkClass.keyType);
                            if (!matchingSuite)
                                return false;
                            return issuerSupportedCryptographicSuites.includes(matchingSuite.proofType);
                        });
                        break;
                }
                // If no match, continue to the next one.
                if (!potentialSignatureAlgorithm)
                    continue;
                const supportsAllDidMethods = issuerSupportedBindingMethods.includes('did');
                const supportedDidMethods = issuerSupportedBindingMethods.filter((method) => method.startsWith('did:'));
                // Make sure that the issuer supports the 'did' binding method, or at least one specific did method
                if (!supportsAllDidMethods && supportedDidMethods.length === 0)
                    continue;
                return {
                    credentialFormat: potentialCredentialFormat,
                    signatureAlgorithm: potentialSignatureAlgorithm,
                    supportedDidMethods,
                    supportsAllDidMethods,
                };
            }
            throw new core_1.AriesFrameworkError('Could not determine the correct credential format and signature algorithm to use for the proof of possession.');
        }
        /**
         * Returns the JWA Signature Algorithms that are supported by the wallet.
         *
         * This is an approximation based on the supported key types of the wallet.
         * This is not 100% correct as a supporting a key type does not mean you support
         * all the algorithms for that key type. However, this needs refactoring of the wallet
         * that is planned for the 0.5.0 release.
         */
        getSupportedJwaSignatureAlgorithms(agentContext) {
            const supportedKeyTypes = agentContext.wallet.supportedKeyTypes;
            // Extract the supported JWS algs based on the key types the wallet support.
            const supportedJwaSignatureAlgorithms = supportedKeyTypes
                // Map the supported key types to the supported JWK class
                .map(core_1.getJwkClassFromKeyType)
                // Filter out the undefined values
                .filter((jwkClass) => jwkClass !== undefined)
                // Extract the supported JWA signature algorithms from the JWK class
                .map((jwkClass) => jwkClass.supportedSignatureAlgorithms)
                // Flatten the array of arrays
                .reduce((allAlgorithms, algorithms) => [...allAlgorithms, ...algorithms], []);
            return supportedJwaSignatureAlgorithms;
        }
        handleCredentialResponse(agentContext, credentialResponse, options) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug('Credential request response', credentialResponse);
                if (!credentialResponse.successBody) {
                    throw new core_1.AriesFrameworkError('Did not receive a successful credential response');
                }
                let credential;
                let result;
                if (credentialResponse.successBody.format === core_1.ClaimFormat.LdpVc) {
                    credential = core_1.JsonTransformer.fromJSON(credentialResponse.successBody.credential, core_1.W3cJsonLdVerifiableCredential);
                    result = yield this.w3cCredentialService.verifyCredential(agentContext, {
                        credential,
                        verifyCredentialStatus: options.verifyCredentialStatus,
                    });
                }
                else if (credentialResponse.successBody.format === core_1.ClaimFormat.JwtVc) {
                    credential = core_1.W3cJwtVerifiableCredential.fromSerializedJwt(credentialResponse.successBody.credential);
                    result = yield this.w3cCredentialService.verifyCredential(agentContext, {
                        credential,
                        verifyCredentialStatus: options.verifyCredentialStatus,
                    });
                }
                else {
                    throw new core_1.AriesFrameworkError(`Unsupported credential format ${credentialResponse.successBody.format}`);
                }
                if (!result || !result.isValid) {
                    throw new core_1.AriesFrameworkError(`Failed to validate credential, error = ${result.error}`);
                }
                const storedCredential = yield this.w3cCredentialService.storeCredential(agentContext, {
                    credential,
                });
                this.logger.info(`Stored credential with id: ${storedCredential.id}`);
                this.logger.debug('Full credential', storedCredential);
                return storedCredential;
            });
        }
        signCallback(agentContext, verificationMethod) {
            return (jwt, kid) => __awaiter(this, void 0, void 0, function* () {
                if (!jwt.header) {
                    throw new core_1.AriesFrameworkError('No header present on JWT');
                }
                if (!jwt.payload) {
                    throw new core_1.AriesFrameworkError('No payload present on JWT');
                }
                // We have determined the verification method before and already passed that when creating the callback,
                // however we just want to make sure that the kid matches the verification method id
                if (verificationMethod.id !== kid) {
                    throw new core_1.AriesFrameworkError(`kid ${kid} does not match verification method id ${verificationMethod.id}`);
                }
                const key = (0, core_1.getKeyFromVerificationMethod)(verificationMethod);
                const jwk = (0, core_1.getJwkFromKey)(key);
                const payload = core_1.JsonEncoder.toBuffer(jwt.payload);
                if (!jwk.supportsSignatureAlgorithm(jwt.header.alg)) {
                    throw new core_1.AriesFrameworkError(`kid ${kid} refers to a key of type '${jwk.keyType}', which does not support the JWS signature alg '${jwt.header.alg}'`);
                }
                // We don't support these properties, remove them, so we can pass all other header properties to the JWS service
                if (jwt.header.x5c || jwt.header.jwk)
                    throw new core_1.AriesFrameworkError('x5c and jwk are not supported');
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const _a = jwt.header, { x5c: _x5c, jwk: _jwk } = _a, supportedHeaderOptions = __rest(_a, ["x5c", "jwk"]);
                const jws = yield this.jwsService.createJwsCompact(agentContext, {
                    key,
                    payload,
                    protectedHeaderOptions: supportedHeaderOptions,
                });
                return jws;
            });
        }
    };
    __setFunctionName(_classThis, "OpenId4VcClientService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OpenId4VcClientService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OpenId4VcClientService = _classThis;
})();
exports.OpenId4VcClientService = OpenId4VcClientService;
