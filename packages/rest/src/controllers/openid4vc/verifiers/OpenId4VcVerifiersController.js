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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcVerifiersController = void 0;
const repository_1 = require("@credo-ts/openid4vc/build/openid4vc-verifier/repository");
const tsoa_1 = require("tsoa");
const tsyringe_1 = require("tsyringe");
const response_1 = require("../../../utils/response");
const OpenId4VcVerifiersControllerExamples_1 = require("./OpenId4VcVerifiersControllerExamples");
const OpenId4VcVerifiersControllerTypes_1 = require("./OpenId4VcVerifiersControllerTypes");
let OpenId4VcVerifiersController = (() => {
    let _classDecorators = [(0, tsoa_1.Tags)('OpenID4VC Verifiers'), (0, tsoa_1.Route)('/openid4vc/verifiers'), (0, tsoa_1.Security)('tenants', ['tenant']), (0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = tsoa_1.Controller;
    let _instanceExtraInitializers = [];
    let _createVerifier_decorators;
    let _getVerifiersByQuery_decorators;
    let _getVerifier_decorators;
    let _deleteVerifier_decorators;
    var OpenId4VcVerifiersController = _classThis = class extends _classSuper {
        /**
         * Create a new OpenID4VC Verifier
         */
        createVerifier(request, options) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const verifier = yield request.user.agent.modules.openId4VcVerifier.createVerifier({
                        verifierId: options.publicVerifierId,
                    });
                    return (0, OpenId4VcVerifiersControllerTypes_1.openId4vcVerifierRecordToApiModel)(verifier);
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Get OpenID4VC verifiers by query
         */
        getVerifiersByQuery(request, publicVerifierId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const verifierRepository = request.user.agent.dependencyManager.resolve(repository_1.OpenId4VcVerifierRepository);
                    const verifiers = yield verifierRepository.findByQuery(request.user.agent.context, {
                        verifierId: publicVerifierId,
                    });
                    return verifiers.map(OpenId4VcVerifiersControllerTypes_1.openId4vcVerifierRecordToApiModel);
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Get an OpenID4VC verifier by id
         */
        getVerifier(request, verifierId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const verifierRepository = request.user.agent.dependencyManager.resolve(repository_1.OpenId4VcVerifierRepository);
                    const verifier = yield verifierRepository.getById(request.user.agent.context, verifierId);
                    return (0, OpenId4VcVerifiersControllerTypes_1.openId4vcVerifierRecordToApiModel)(verifier);
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Delete an OpenID4VC verifier by id
         */
        deleteVerifier(request, verifierId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    this.setStatus(204);
                    const verifierRepository = request.user.agent.dependencyManager.resolve(repository_1.OpenId4VcVerifierRepository);
                    yield verifierRepository.deleteById(request.user.agent.context, verifierId);
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
    __setFunctionName(_classThis, "OpenId4VcVerifiersController");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _createVerifier_decorators = [(0, tsoa_1.Post)('/'), (0, tsoa_1.Example)(OpenId4VcVerifiersControllerExamples_1.openId4VcIssuerRecordExample)];
        _getVerifiersByQuery_decorators = [(0, tsoa_1.Get)('/'), (0, tsoa_1.Example)([OpenId4VcVerifiersControllerExamples_1.openId4VcIssuerRecordExample])];
        _getVerifier_decorators = [(0, tsoa_1.Get)('/{verifierId}'), (0, tsoa_1.Example)(OpenId4VcVerifiersControllerExamples_1.openId4VcIssuerRecordExample)];
        _deleteVerifier_decorators = [(0, tsoa_1.Delete)('/{verifierId}')];
        __esDecorate(_classThis, null, _createVerifier_decorators, { kind: "method", name: "createVerifier", static: false, private: false, access: { has: obj => "createVerifier" in obj, get: obj => obj.createVerifier }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getVerifiersByQuery_decorators, { kind: "method", name: "getVerifiersByQuery", static: false, private: false, access: { has: obj => "getVerifiersByQuery" in obj, get: obj => obj.getVerifiersByQuery }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getVerifier_decorators, { kind: "method", name: "getVerifier", static: false, private: false, access: { has: obj => "getVerifier" in obj, get: obj => obj.getVerifier }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteVerifier_decorators, { kind: "method", name: "deleteVerifier", static: false, private: false, access: { has: obj => "deleteVerifier" in obj, get: obj => obj.deleteVerifier }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OpenId4VcVerifiersController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OpenId4VcVerifiersController = _classThis;
})();
exports.OpenId4VcVerifiersController = OpenId4VcVerifiersController;
