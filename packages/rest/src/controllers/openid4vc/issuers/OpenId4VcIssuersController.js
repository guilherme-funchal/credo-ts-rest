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
exports.OpenId4VcIssuersController = void 0;
const repository_1 = require("@credo-ts/openid4vc/build/openid4vc-issuer/repository");
const tsoa_1 = require("tsoa");
const tsyringe_1 = require("tsyringe");
const response_1 = require("../../../utils/response");
const OpenId4VcIssuersControllerExamples_1 = require("./OpenId4VcIssuersControllerExamples");
const OpenId4VcIssuersControllerTypes_1 = require("./OpenId4VcIssuersControllerTypes");
let OpenId4VcIssuersController = (() => {
    let _classDecorators = [(0, tsoa_1.Tags)('OpenID4VC Issuers'), (0, tsoa_1.Route)('/openid4vc/issuers'), (0, tsoa_1.Security)('tenants', ['tenant']), (0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = tsoa_1.Controller;
    let _instanceExtraInitializers = [];
    let _createIssuer_decorators;
    let _getIssuersByQuery_decorators;
    let _deleteIssuer_decorators;
    let _getIssuer_decorators;
    let _updateIssuerMetadata_decorators;
    var OpenId4VcIssuersController = _classThis = class extends _classSuper {
        /**
         * Create a new OpenID4VCI Issuer
         */
        createIssuer(request, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { publicIssuerId } = options, rest = __rest(options, ["publicIssuerId"]);
                try {
                    const issuer = yield request.user.agent.modules.openId4VcIssuer.createIssuer(Object.assign(Object.assign({}, rest), { issuerId: publicIssuerId }));
                    return (0, OpenId4VcIssuersControllerTypes_1.openId4VcIssuerRecordToApiModel)(issuer);
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        getIssuersByQuery(request, publicIssuerId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const issuerRepository = request.user.agent.dependencyManager.resolve(repository_1.OpenId4VcIssuerRepository);
                    const issuers = yield issuerRepository.findByQuery(request.user.agent.context, {
                        issuerId: publicIssuerId,
                    });
                    return issuers.map(OpenId4VcIssuersControllerTypes_1.openId4VcIssuerRecordToApiModel);
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Delete an OpenID4VCI issuer by id
         */
        deleteIssuer(request, issuerId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    this.setStatus(204);
                    const issuerRepository = request.user.agent.dependencyManager.resolve(repository_1.OpenId4VcIssuerRepository);
                    yield issuerRepository.deleteById(request.user.agent.context, issuerId);
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Get an OpenID4VCI issuer by id
         */
        getIssuer(request, issuerId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    this.setStatus(204);
                    const issuerRepository = request.user.agent.dependencyManager.resolve(repository_1.OpenId4VcIssuerRepository);
                    const issuer = yield issuerRepository.getById(request.user.agent.context, issuerId);
                    return (0, OpenId4VcIssuersControllerTypes_1.openId4VcIssuerRecordToApiModel)(issuer);
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Update issuer metadata (`display` and `credentialsSupported`).
         *
         * NOTE: this method overwrites the existing metadata with the new metadata, so
         * make sure to include all the metadata you want to keep in the new metadata.
         */
        updateIssuerMetadata(request, issuerId, body) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    // FIXME: in Credo we update based on the public issuerId, but that's quit weird and we should
                    // do it based on the internal record id. So in the API we do it consistently, but need to fetch
                    // the record first in this case
                    const issuerRepository = request.user.agent.dependencyManager.resolve(repository_1.OpenId4VcIssuerRepository);
                    const issuer = yield issuerRepository.getById(request.user.agent.context, issuerId);
                    // FIXME: should return the updated record, now we fetch (AGAIN!!)
                    yield request.user.agent.modules.openId4VcIssuer.updateIssuerMetadata(Object.assign(Object.assign({}, body), { issuerId: issuer.issuerId }));
                    const updatedIssuer = yield issuerRepository.getById(request.user.agent.context, issuerId);
                    return (0, OpenId4VcIssuersControllerTypes_1.openId4VcIssuerRecordToApiModel)(updatedIssuer);
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
    __setFunctionName(_classThis, "OpenId4VcIssuersController");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _createIssuer_decorators = [(0, tsoa_1.Post)('/'), (0, tsoa_1.Example)(OpenId4VcIssuersControllerExamples_1.openId4VcIssuerRecordExample)];
        _getIssuersByQuery_decorators = [(0, tsoa_1.Get)('/'), (0, tsoa_1.Example)([OpenId4VcIssuersControllerExamples_1.openId4VcIssuerRecordExample])];
        _deleteIssuer_decorators = [(0, tsoa_1.Delete)('/{issuerId}')];
        _getIssuer_decorators = [(0, tsoa_1.Get)('/{issuerId}'), (0, tsoa_1.Example)(OpenId4VcIssuersControllerExamples_1.openId4VcIssuerRecordExample)];
        _updateIssuerMetadata_decorators = [(0, tsoa_1.Put)('/{issuerId}'), (0, tsoa_1.Example)(OpenId4VcIssuersControllerExamples_1.openId4VcIssuerRecordExample)];
        __esDecorate(_classThis, null, _createIssuer_decorators, { kind: "method", name: "createIssuer", static: false, private: false, access: { has: obj => "createIssuer" in obj, get: obj => obj.createIssuer }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getIssuersByQuery_decorators, { kind: "method", name: "getIssuersByQuery", static: false, private: false, access: { has: obj => "getIssuersByQuery" in obj, get: obj => obj.getIssuersByQuery }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteIssuer_decorators, { kind: "method", name: "deleteIssuer", static: false, private: false, access: { has: obj => "deleteIssuer" in obj, get: obj => obj.deleteIssuer }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getIssuer_decorators, { kind: "method", name: "getIssuer", static: false, private: false, access: { has: obj => "getIssuer" in obj, get: obj => obj.getIssuer }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateIssuerMetadata_decorators, { kind: "method", name: "updateIssuerMetadata", static: false, private: false, access: { has: obj => "updateIssuerMetadata" in obj, get: obj => obj.updateIssuerMetadata }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OpenId4VcIssuersController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OpenId4VcIssuersController = _classThis;
})();
exports.OpenId4VcIssuersController = OpenId4VcIssuersController;
