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
exports.CredentialsController = void 0;
const core_1 = require("@credo-ts/core");
const tsoa_1 = require("tsoa");
const tsyringe_1 = require("tsyringe");
const response_1 = require("../../../utils/response");
const CredentialsControllerExamples_1 = require("./CredentialsControllerExamples");
const CredentialsControllerTypes_1 = require("./CredentialsControllerTypes");
let CredentialsController = (() => {
    let _classDecorators = [(0, tsoa_1.Tags)('DIDComm Credentials'), (0, tsoa_1.Route)('/didcomm/credentials'), (0, tsoa_1.Security)('tenants', ['tenant']), (0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = tsoa_1.Controller;
    let _instanceExtraInitializers = [];
    let _findCredentialsByQuery_decorators;
    let _getCredentialById_decorators;
    let _getFormatDateForCredentialExchange_decorators;
    let _deleteCredential_decorators;
    let _proposeCredential_decorators;
    let _acceptProposal_decorators;
    let _createOffer_decorators;
    let _offerCredential_decorators;
    let _acceptOffer_decorators;
    let _acceptRequest_decorators;
    let _acceptCredential_decorators;
    var CredentialsController = _classThis = class extends _classSuper {
        /**
         * Retrieve all credential exchange records by query
         */
        findCredentialsByQuery(request, threadId, parentThreadId, connectionId, state, role) {
            return __awaiter(this, void 0, void 0, function* () {
                const credentials = yield request.user.agent.credentials.findAllByQuery({
                    connectionId,
                    threadId,
                    state,
                    parentThreadId,
                    role,
                });
                return credentials.map(CredentialsControllerTypes_1.credentialExchangeRecordToApiModel);
            });
        }
        /**
         * Retrieve credential exchange record by credential record id
         *
         * @param credentialExchangeId
         * @returns CredentialExchangeRecord
         */
        getCredentialById(request, credentialExchangeId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const credential = yield request.user.agent.credentials.getById(credentialExchangeId);
                    return (0, CredentialsControllerTypes_1.credentialExchangeRecordToApiModel)(credential);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`credential exchange with id "${credentialExchangeId}" not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Retrieve the format data associated with a credential exchange
         */
        getFormatDateForCredentialExchange(request, credentialExchangeId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const formatData = yield request.user.agent.credentials.getFormatData(credentialExchangeId);
                    return formatData;
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`credential exchange with id "${credentialExchangeId}" not found.`);
                    }
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Deletes a credential exchange record in the credential repository.
         *
         * @param credentialExchangeId
         */
        deleteCredential(request, credentialExchangeId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    this.setStatus(204);
                    yield request.user.agent.credentials.deleteById(credentialExchangeId);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`credential exchange with id "${credentialExchangeId}" not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Initiate a new credential exchange as holder by sending a propose credential message
         * to the connection with a specified connection id.
         *
         * @param options
         * @returns CredentialExchangeRecord
         */
        proposeCredential(request, options) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const credential = yield request.user.agent.credentials.proposeCredential(options);
                    return (0, CredentialsControllerTypes_1.credentialExchangeRecordToApiModel)(credential);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`connection with id "${options.connectionId}" not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Accept a credential proposal as issuer by sending an accept proposal message
         * to the connection associated with the credential exchange record.
         */
        acceptProposal(request, credentialExchangeId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const credential = yield request.user.agent.credentials.acceptProposal(Object.assign(Object.assign({}, options), { credentialRecordId: credentialExchangeId }));
                    return (0, CredentialsControllerTypes_1.credentialExchangeRecordToApiModel)(credential);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`credential exchange with id "${credentialExchangeId}" not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Initiate a new credential exchange as issuer by creating a credential offer
         * without specifying a connection id
         */
        createOffer(request, options) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const offer = yield request.user.agent.credentials.createOffer(options);
                    return {
                        message: offer.message.toJSON(),
                        credentialExchange: (0, CredentialsControllerTypes_1.credentialExchangeRecordToApiModel)(offer.credentialRecord),
                    };
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Initiate a new credential exchange as issuer by sending a offer credential message
         * to the connection with the specified connection id.
         */
        offerCredential(request, options) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const credential = yield request.user.agent.credentials.offerCredential(options);
                    return (0, CredentialsControllerTypes_1.credentialExchangeRecordToApiModel)(credential);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`connection with id "${options.connectionId}" not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Accept a credential offer as holder by sending an accept offer message
         * to the connection associated with the credential exchange record.
         */
        acceptOffer(request, credentialExchangeId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const credential = yield request.user.agent.credentials.acceptOffer(Object.assign(Object.assign({}, options), { credentialRecordId: credentialExchangeId }));
                    return (0, CredentialsControllerTypes_1.credentialExchangeRecordToApiModel)(credential);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`credential exchange with id "${credentialExchangeId}" not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Accept a credential request as issuer by sending an accept request message
         * to the connection associated with the credential exchange record.
         */
        acceptRequest(request, credentialExchangeId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const credential = yield request.user.agent.credentials.acceptRequest(Object.assign(Object.assign({}, options), { credentialRecordId: credentialExchangeId }));
                    return (0, CredentialsControllerTypes_1.credentialExchangeRecordToApiModel)(credential);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`credential exchange with id "${credentialExchangeId}" not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Accept a credential as holder by sending an accept credential message
         * to the connection associated with the credential exchange record.
         */
        acceptCredential(request, credentialExchangeId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const credential = yield request.user.agent.credentials.acceptCredential({
                        credentialRecordId: credentialExchangeId,
                    });
                    return (0, CredentialsControllerTypes_1.credentialExchangeRecordToApiModel)(credential);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`credential exchange with id "${credentialExchangeId}" not found.`);
                    }
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
    __setFunctionName(_classThis, "CredentialsController");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _findCredentialsByQuery_decorators = [(0, tsoa_1.Example)([CredentialsControllerExamples_1.credentialExchangeRecordExample]), (0, tsoa_1.Get)('/')];
        _getCredentialById_decorators = [(0, tsoa_1.Example)(CredentialsControllerExamples_1.credentialExchangeRecordExample), (0, tsoa_1.Get)('/:credentialExchangeId')];
        _getFormatDateForCredentialExchange_decorators = [(0, tsoa_1.Get)('/:credentialExchangeId/format-data'), (0, tsoa_1.Example)(CredentialsControllerExamples_1.didCommCredentialsGetFormatDataExample)];
        _deleteCredential_decorators = [(0, tsoa_1.Delete)('/:credentialExchangeId')];
        _proposeCredential_decorators = [(0, tsoa_1.Example)(CredentialsControllerExamples_1.credentialExchangeRecordExample), (0, tsoa_1.Post)('/propose-credential')];
        _acceptProposal_decorators = [(0, tsoa_1.Example)(CredentialsControllerExamples_1.credentialExchangeRecordExample), (0, tsoa_1.Post)('/:credentialExchangeId/accept-proposal')];
        _createOffer_decorators = [(0, tsoa_1.Example)(CredentialsControllerExamples_1.didCommCredentialsCreateOfferResponse), (0, tsoa_1.Post)('/create-offer')];
        _offerCredential_decorators = [(0, tsoa_1.Example)(CredentialsControllerExamples_1.credentialExchangeRecordExample), (0, tsoa_1.Post)('/offer-credential')];
        _acceptOffer_decorators = [(0, tsoa_1.Example)(CredentialsControllerExamples_1.credentialExchangeRecordExample), (0, tsoa_1.Post)('/:credentialExchangeId/accept-offer')];
        _acceptRequest_decorators = [(0, tsoa_1.Example)(CredentialsControllerExamples_1.credentialExchangeRecordExample), (0, tsoa_1.Post)('/:credentialExchangeId/accept-request')];
        _acceptCredential_decorators = [(0, tsoa_1.Example)(CredentialsControllerExamples_1.credentialExchangeRecordExample), (0, tsoa_1.Post)('/:credentialExchangeId/accept-credential')];
        __esDecorate(_classThis, null, _findCredentialsByQuery_decorators, { kind: "method", name: "findCredentialsByQuery", static: false, private: false, access: { has: obj => "findCredentialsByQuery" in obj, get: obj => obj.findCredentialsByQuery }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCredentialById_decorators, { kind: "method", name: "getCredentialById", static: false, private: false, access: { has: obj => "getCredentialById" in obj, get: obj => obj.getCredentialById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getFormatDateForCredentialExchange_decorators, { kind: "method", name: "getFormatDateForCredentialExchange", static: false, private: false, access: { has: obj => "getFormatDateForCredentialExchange" in obj, get: obj => obj.getFormatDateForCredentialExchange }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteCredential_decorators, { kind: "method", name: "deleteCredential", static: false, private: false, access: { has: obj => "deleteCredential" in obj, get: obj => obj.deleteCredential }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _proposeCredential_decorators, { kind: "method", name: "proposeCredential", static: false, private: false, access: { has: obj => "proposeCredential" in obj, get: obj => obj.proposeCredential }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _acceptProposal_decorators, { kind: "method", name: "acceptProposal", static: false, private: false, access: { has: obj => "acceptProposal" in obj, get: obj => obj.acceptProposal }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createOffer_decorators, { kind: "method", name: "createOffer", static: false, private: false, access: { has: obj => "createOffer" in obj, get: obj => obj.createOffer }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _offerCredential_decorators, { kind: "method", name: "offerCredential", static: false, private: false, access: { has: obj => "offerCredential" in obj, get: obj => obj.offerCredential }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _acceptOffer_decorators, { kind: "method", name: "acceptOffer", static: false, private: false, access: { has: obj => "acceptOffer" in obj, get: obj => obj.acceptOffer }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _acceptRequest_decorators, { kind: "method", name: "acceptRequest", static: false, private: false, access: { has: obj => "acceptRequest" in obj, get: obj => obj.acceptRequest }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _acceptCredential_decorators, { kind: "method", name: "acceptCredential", static: false, private: false, access: { has: obj => "acceptCredential" in obj, get: obj => obj.acceptCredential }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CredentialsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CredentialsController = _classThis;
})();
exports.CredentialsController = CredentialsController;
