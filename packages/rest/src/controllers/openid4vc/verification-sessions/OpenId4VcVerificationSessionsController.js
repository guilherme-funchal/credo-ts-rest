"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
exports.OpenId4VcVerificationSessionsController = void 0;
const core_1 = require("@credo-ts/core");
const repository_1 = require("@credo-ts/openid4vc/build/openid4vc-verifier/repository");
const tsoa_1 = require("tsoa");
const tsyringe_1 = require("tsyringe");
const response_1 = require("../../../utils/response");
const OpenId4VcVerificationSessionsControllerExamples_1 = require("./OpenId4VcVerificationSessionsControllerExamples");
const OpenId4VcVerificationSessionsControllerTypes_1 = require("./OpenId4VcVerificationSessionsControllerTypes");
let OpenId4VcVerificationSessionsController = (() => {
    let _classDecorators = [(0, tsoa_1.Tags)('OpenID4VC Verification Sessions'), (0, tsoa_1.Route)('/openid4vc/verifiers/sessions'), (0, tsoa_1.Security)('tenants', ['tenant']), (0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = tsoa_1.Controller;
    let _instanceExtraInitializers = [];
    let _createRequest_decorators;
    let _getVerifiedAuthorizationResponse_decorators;
    let _getVerificationSessionsByQuery_decorators;
    let _getVerificationSession_decorators;
    let _deleteVerificationSession_decorators;
    var OpenId4VcVerificationSessionsController = _classThis = class extends _classSuper {
        /**
         * Create an OpenID4VC verification session by creating a authorization request
         */
        createRequest(request, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { publicVerifierId } = options, rest = __rest(options, ["publicVerifierId"]);
                try {
                    const { authorizationRequest, verificationSession } = yield request.user.agent.modules.openId4VcVerifier.createAuthorizationRequest(Object.assign(Object.assign({}, rest), { verifierId: publicVerifierId }));
                    return {
                        verificationSession: (0, OpenId4VcVerificationSessionsControllerTypes_1.openId4VcVerificationSessionRecordToApiModel)(verificationSession),
                        authorizationRequest,
                    };
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Get the verified authorization response data for a OpenID4VC verification session.
         *
         * This endpoint can only be called for verification sessions where the state is `ResponseVerified`.
         */
        getVerifiedAuthorizationResponse(request, verificationSessionId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const verifiedAuthorizationResponse = yield request.user.agent.modules.openId4VcVerifier.getVerifiedAuthorizationResponse(verificationSessionId);
                    verifiedAuthorizationResponse.presentationExchange;
                    return Object.assign(Object.assign({}, verifiedAuthorizationResponse), { presentationExchange: verifiedAuthorizationResponse.presentationExchange
                            ? Object.assign(Object.assign({}, verifiedAuthorizationResponse.presentationExchange), { presentations: verifiedAuthorizationResponse.presentationExchange.presentations.map((presentation) => {
                                    if (presentation instanceof core_1.W3cJsonLdVerifiablePresentation) {
                                        return {
                                            format: presentation.claimFormat,
                                            encoded: presentation.toJSON(),
                                            vcPayload: presentation.toJSON(),
                                        };
                                    }
                                    else if (presentation instanceof core_1.W3cJwtVerifiablePresentation) {
                                        return {
                                            format: presentation.claimFormat,
                                            encoded: presentation.serializedJwt,
                                            vcPayload: presentation.presentation.toJSON(),
                                            signedPayload: presentation.jwt.payload.toJson(),
                                            header: presentation.jwt.header,
                                        };
                                    }
                                    else {
                                        return {
                                            format: core_1.ClaimFormat.SdJwtVc,
                                            encoded: presentation.compact,
                                            vcPayload: presentation.prettyClaims,
                                            signedPayload: presentation.payload,
                                            header: presentation.header,
                                        };
                                    }
                                }) }) : undefined });
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Find all OpenID4VC verification sessions by query
         */
        getVerificationSessionsByQuery(request, nonce, publicVerifierId, payloadState, state, authorizationRequestUri) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const verificationSessionRepository = request.user.agent.dependencyManager.resolve(repository_1.OpenId4VcVerificationSessionRepository);
                    const issuanceSessions = yield verificationSessionRepository.findByQuery(request.user.agent.context, {
                        verifierId: publicVerifierId,
                        authorizationRequestUri,
                        payloadState,
                        nonce,
                        state,
                    });
                    return issuanceSessions.map(OpenId4VcVerificationSessionsControllerTypes_1.openId4VcVerificationSessionRecordToApiModel);
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Get an OpenID4VC verification session by verification session id
         */
        getVerificationSession(request, verificationSessionId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const verificationSessionRepository = request.user.agent.dependencyManager.resolve(repository_1.OpenId4VcVerificationSessionRepository);
                    const issuanceSession = yield verificationSessionRepository.getById(request.user.agent.context, verificationSessionId);
                    return (0, OpenId4VcVerificationSessionsControllerTypes_1.openId4VcVerificationSessionRecordToApiModel)(issuanceSession);
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Delete an OpenID4VC verification session by id
         */
        deleteVerificationSession(request, verificationSessionId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    this.setStatus(204);
                    const verificationSessionRepository = request.user.agent.dependencyManager.resolve(repository_1.OpenId4VcVerificationSessionRepository);
                    yield verificationSessionRepository.deleteById(request.user.agent.context, verificationSessionId);
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _instanceExtraInitializers);
        }
    };
    __setFunctionName(_classThis, "OpenId4VcVerificationSessionsController");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _createRequest_decorators = [(0, tsoa_1.Post)('/create-request'), (0, tsoa_1.Example)(OpenId4VcVerificationSessionsControllerExamples_1.openId4VcVerificationSessionsCreateRequestResponse)];
        _getVerifiedAuthorizationResponse_decorators = [(0, tsoa_1.Get)('/{verificationSessionId}/verified-authorization-response'), (0, tsoa_1.Example)(OpenId4VcVerificationSessionsControllerExamples_1.openId4VcVerificationSessionsGetVerifiedAuthorizationResponseExample)];
        _getVerificationSessionsByQuery_decorators = [(0, tsoa_1.Get)('/'), (0, tsoa_1.Example)([OpenId4VcVerificationSessionsControllerExamples_1.openId4VcIssuanceSessionRecordExample])];
        _getVerificationSession_decorators = [(0, tsoa_1.Get)('/{verificationSessionId}'), (0, tsoa_1.Example)(OpenId4VcVerificationSessionsControllerExamples_1.openId4VcIssuanceSessionRecordExample)];
        _deleteVerificationSession_decorators = [(0, tsoa_1.Delete)('/{verificationSessionId}')];
        __esDecorate(_classThis, null, _createRequest_decorators, { kind: "method", name: "createRequest", static: false, private: false, access: { has: obj => "createRequest" in obj, get: obj => obj.createRequest }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getVerifiedAuthorizationResponse_decorators, { kind: "method", name: "getVerifiedAuthorizationResponse", static: false, private: false, access: { has: obj => "getVerifiedAuthorizationResponse" in obj, get: obj => obj.getVerifiedAuthorizationResponse }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getVerificationSessionsByQuery_decorators, { kind: "method", name: "getVerificationSessionsByQuery", static: false, private: false, access: { has: obj => "getVerificationSessionsByQuery" in obj, get: obj => obj.getVerificationSessionsByQuery }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getVerificationSession_decorators, { kind: "method", name: "getVerificationSession", static: false, private: false, access: { has: obj => "getVerificationSession" in obj, get: obj => obj.getVerificationSession }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteVerificationSession_decorators, { kind: "method", name: "deleteVerificationSession", static: false, private: false, access: { has: obj => "deleteVerificationSession" in obj, get: obj => obj.deleteVerificationSession }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OpenId4VcVerificationSessionsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OpenId4VcVerificationSessionsController = _classThis;
})();
exports.OpenId4VcVerificationSessionsController = OpenId4VcVerificationSessionsController;
