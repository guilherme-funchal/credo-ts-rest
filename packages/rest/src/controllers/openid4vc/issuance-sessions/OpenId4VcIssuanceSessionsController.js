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
exports.OpenId4VcIssuanceSessionsController = void 0;
const repository_1 = require("@credo-ts/openid4vc/build/openid4vc-issuer/repository");
const tsoa_1 = require("tsoa");
const tsyringe_1 = require("tsyringe");
const response_1 = require("../../../utils/response");
const OpenId4VcIssuanceSessionsControllerExamples_1 = require("./OpenId4VcIssuanceSessionsControllerExamples");
const OpenId4VcIssuanceSessionsControllerTypes_1 = require("./OpenId4VcIssuanceSessionsControllerTypes");
let OpenId4VcIssuanceSessionsController = (() => {
    let _classDecorators = [(0, tsoa_1.Tags)('OpenID4VC Issuance Sessions'), (0, tsoa_1.Route)('/openid4vc/issuers/sessions'), (0, tsoa_1.Security)('tenants', ['tenant']), (0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = tsoa_1.Controller;
    let _instanceExtraInitializers = [];
    let _createOffer_decorators;
    let _getIssuanceSessionsByQuery_decorators;
    let _getIssuanceSession_decorators;
    let _deleteIssuanceSession_decorators;
    var OpenId4VcIssuanceSessionsController = _classThis = class extends _classSuper {
        /**
         * Create an OpenID4VC issuance session by creating a credential offer
         */
        createOffer(request, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { credentials, publicIssuerId } = options, rest = __rest(options, ["credentials", "publicIssuerId"]);
                try {
                    const issuer = yield request.user.agent.modules.openId4VcIssuer.getIssuerByIssuerId(publicIssuerId);
                    // Maps credentials, adds properties, and throws errors if needed
                    const mappedCredentials = credentials.map((c) => {
                        var _a;
                        const credentialSupported = issuer.credentialsSupported.find((supported) => supported.id === c.credentialSupportedId);
                        if (!credentialSupported) {
                            throw new Error(`Offered credentialSupportedId ${c.credentialSupportedId} not in the issuer credential supported list`);
                        }
                        if (credentialSupported.format !== c.format) {
                            throw new Error(`Offered credentialSupportedId ${c.credentialSupportedId} has format ${c.format} but expected ${credentialSupported.format}`);
                        }
                        // Add vct to payload if not already there
                        return Object.assign(Object.assign({}, c), { payload: Object.assign(Object.assign({}, c.payload), { vct: (_a = c.payload.vct) !== null && _a !== void 0 ? _a : credentialSupported.vct }) });
                    });
                    const { credentialOffer, issuanceSession } = yield request.user.agent.modules.openId4VcIssuer.createCredentialOffer(Object.assign(Object.assign({}, rest), { offeredCredentials: credentials.map((c) => c.credentialSupportedId), issuerId: publicIssuerId, issuanceMetadata: {
                            credentials: mappedCredentials,
                        } }));
                    return {
                        issuanceSession: (0, OpenId4VcIssuanceSessionsControllerTypes_1.openId4VcIssuanceSessionRecordToApiModel)(issuanceSession),
                        credentialOffer,
                    };
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Find all OpenID4VC issuance sessions by query
         */
        getIssuanceSessionsByQuery(request, cNonce, publicIssuerId, preAuthorizedCode, state, credentialOfferUri) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const issuanceSessionRepository = request.user.agent.dependencyManager.resolve(repository_1.OpenId4VcIssuanceSessionRepository);
                    const issuanceSessions = yield issuanceSessionRepository.findByQuery(request.user.agent.context, {
                        cNonce,
                        issuerId: publicIssuerId,
                        preAuthorizedCode,
                        state,
                        credentialOfferUri,
                    });
                    return issuanceSessions.map(OpenId4VcIssuanceSessionsControllerTypes_1.openId4VcIssuanceSessionRecordToApiModel);
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Get an OpenID4VC issuance session by issuance session id
         */
        getIssuanceSession(request, issuanceSessionId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const issuanceSessionRepository = request.user.agent.dependencyManager.resolve(repository_1.OpenId4VcIssuanceSessionRepository);
                    const issuanceSession = yield issuanceSessionRepository.getById(request.user.agent.context, issuanceSessionId);
                    return (0, OpenId4VcIssuanceSessionsControllerTypes_1.openId4VcIssuanceSessionRecordToApiModel)(issuanceSession);
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Delete an OpenID4VC issuance session by id
         */
        deleteIssuanceSession(request, issuanceSessionId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    this.setStatus(204);
                    const issuanceSessionRepository = request.user.agent.dependencyManager.resolve(repository_1.OpenId4VcIssuanceSessionRepository);
                    yield issuanceSessionRepository.deleteById(request.user.agent.context, issuanceSessionId);
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
    __setFunctionName(_classThis, "OpenId4VcIssuanceSessionsController");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _createOffer_decorators = [(0, tsoa_1.Post)('/create-offer'), (0, tsoa_1.Example)(OpenId4VcIssuanceSessionsControllerExamples_1.openId4VcIssuanceSessionsCreateOfferResponse)];
        _getIssuanceSessionsByQuery_decorators = [(0, tsoa_1.Get)('/')];
        _getIssuanceSession_decorators = [(0, tsoa_1.Get)('/{issuanceSessionId}')];
        _deleteIssuanceSession_decorators = [(0, tsoa_1.Delete)('/{issuanceSessionId}')];
        __esDecorate(_classThis, null, _createOffer_decorators, { kind: "method", name: "createOffer", static: false, private: false, access: { has: obj => "createOffer" in obj, get: obj => obj.createOffer }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getIssuanceSessionsByQuery_decorators, { kind: "method", name: "getIssuanceSessionsByQuery", static: false, private: false, access: { has: obj => "getIssuanceSessionsByQuery" in obj, get: obj => obj.getIssuanceSessionsByQuery }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getIssuanceSession_decorators, { kind: "method", name: "getIssuanceSession", static: false, private: false, access: { has: obj => "getIssuanceSession" in obj, get: obj => obj.getIssuanceSession }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteIssuanceSession_decorators, { kind: "method", name: "deleteIssuanceSession", static: false, private: false, access: { has: obj => "deleteIssuanceSession" in obj, get: obj => obj.deleteIssuanceSession }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OpenId4VcIssuanceSessionsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OpenId4VcIssuanceSessionsController = _classThis;
})();
exports.OpenId4VcIssuanceSessionsController = OpenId4VcIssuanceSessionsController;
