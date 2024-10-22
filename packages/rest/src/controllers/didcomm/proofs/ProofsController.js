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
exports.ProofsController = void 0;
const core_1 = require("@credo-ts/core");
const tsoa_1 = require("tsoa");
const tsyringe_1 = require("tsyringe");
const response_1 = require("../../../utils/response");
const ProofsControllerExamples_1 = require("./ProofsControllerExamples");
const ProofsControllerTypes_1 = require("./ProofsControllerTypes");
let ProofsController = (() => {
    let _classDecorators = [(0, tsoa_1.Tags)('DIDComm Proofs'), (0, tsoa_1.Route)('/didcomm/proofs'), (0, tsoa_1.Security)('tenants', ['tenant']), (0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = tsoa_1.Controller;
    let _instanceExtraInitializers = [];
    let _findProofsByQuery_decorators;
    let _getFormatDateForProofExchange_decorators;
    let _getProofExchangeById_decorators;
    let _deleteProof_decorators;
    let _proposeProof_decorators;
    let _acceptProposal_decorators;
    let _createRequest_decorators;
    let _requestProof_decorators;
    let _acceptRequest_decorators;
    let _acceptPresentation_decorators;
    var ProofsController = _classThis = class extends _classSuper {
        /**
         * Find proof exchanges by query
         */
        findProofsByQuery(request, threadId, connectionId, state, parentThreadId, role) {
            return __awaiter(this, void 0, void 0, function* () {
                const proofs = yield request.user.agent.proofs.findAllByQuery({
                    threadId,
                    connectionId,
                    state,
                    parentThreadId,
                    role,
                });
                return proofs.map(ProofsControllerTypes_1.proofExchangeRecordToApiModel);
            });
        }
        /**
         * Retrieve the format data associated with a proof exchange
         */
        getFormatDateForProofExchange(request, proofExchangeId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const formatData = yield request.user.agent.proofs.getFormatData(proofExchangeId);
                    return formatData;
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`proof exchange with id "${proofExchangeId}" not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Retrieve proof exchange by proof exchange id
         */
        getProofExchangeById(request, proofExchangeId) {
            return __awaiter(this, void 0, void 0, function* () {
                const proofExchange = yield request.user.agent.proofs.findById(proofExchangeId);
                if (!proofExchange) {
                    this.setStatus(404);
                    return (0, response_1.apiErrorResponse)(`proof exchange with id "${proofExchangeId}" not found.`);
                }
                return (0, ProofsControllerTypes_1.proofExchangeRecordToApiModel)(proofExchange);
            });
        }
        /**
         * Deletes a proof exchange record.
         */
        deleteProof(request, proofExchangeId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    this.setStatus(204);
                    yield request.user.agent.proofs.deleteById(proofExchangeId);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`proof exchange with id "${proofExchangeId}" not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Initiate a new presentation exchange as prover by sending a presentation proposal request
         * to the connection with the specified connection id.
         */
        proposeProof(request, body) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const proofExchange = yield request.user.agent.proofs.proposeProof(body);
                    return (0, ProofsControllerTypes_1.proofExchangeRecordToApiModel)(proofExchange);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`connection with id "${body.connectionId}" not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Accept a presentation proposal as verifier by sending an accept proposal message
         * to the connection associated with the proof record.
         */
        acceptProposal(request, proofExchangeId, body) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const proof = yield request.user.agent.proofs.acceptProposal(Object.assign({ proofRecordId: proofExchangeId }, body));
                    return (0, ProofsControllerTypes_1.proofExchangeRecordToApiModel)(proof);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`proof exchange with id "${proofExchangeId}" not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Creates a presentation request not bound to any proposal or existing connection
         */
        createRequest(request, body) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    // NOTE: Credo does not work well if 'undefined' is passed. We should fix this in credo
                    const proofFormats = {};
                    if (body.proofFormats.anoncreds) {
                        proofFormats.anoncreds = (0, ProofsControllerTypes_1.transformApiProofFormatToCredo)(body.proofFormats.anoncreds);
                    }
                    if (body.proofFormats.indy) {
                        proofFormats.indy = (0, ProofsControllerTypes_1.transformApiProofFormatToCredo)(body.proofFormats.indy);
                    }
                    const { message, proofRecord: proofExchange } = yield request.user.agent.proofs.createRequest(Object.assign(Object.assign({}, body), { proofFormats }));
                    return {
                        message: message.toJSON(),
                        proofExchange: (0, ProofsControllerTypes_1.proofExchangeRecordToApiModel)(proofExchange),
                    };
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Creates a presentation request bound to existing connection
         */
        requestProof(request, body) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    // NOTE: Credo does not work well if 'undefined' is passed as a proofFormat key. We should fix this in credo
                    const proofFormats = {};
                    if (body.proofFormats.anoncreds) {
                        proofFormats.anoncreds = (0, ProofsControllerTypes_1.transformApiProofFormatToCredo)(body.proofFormats.anoncreds);
                    }
                    if (body.proofFormats.indy) {
                        proofFormats.indy = (0, ProofsControllerTypes_1.transformApiProofFormatToCredo)(body.proofFormats.indy);
                    }
                    const proof = yield request.user.agent.proofs.requestProof(Object.assign(Object.assign({}, body), { proofFormats }));
                    return (0, ProofsControllerTypes_1.proofExchangeRecordToApiModel)(proof);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`connection with id "${body.connectionId}" not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Accept a presentation request as prover by sending an accept request message
         * to the connection associated with the proof record.
         */
        acceptRequest(request, proofExchangeId, body) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const proof = yield request.user.agent.proofs.acceptRequest(Object.assign(Object.assign({}, body), { proofRecordId: proofExchangeId, proofFormats: body.proofFormats }));
                    return (0, ProofsControllerTypes_1.proofExchangeRecordToApiModel)(proof);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`proof exchange with id "${proofExchangeId}" not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Accept a presentation as prover by sending an accept presentation message
         * to the connection associated with the proof record.
         */
        acceptPresentation(request, proofExchangeId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const proof = yield request.user.agent.proofs.acceptPresentation({ proofRecordId: proofExchangeId });
                    return (0, ProofsControllerTypes_1.proofExchangeRecordToApiModel)(proof);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`proof exchange with id "${proofExchangeId}" not found.`);
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
    __setFunctionName(_classThis, "ProofsController");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _findProofsByQuery_decorators = [(0, tsoa_1.Example)([ProofsControllerExamples_1.proofExchangeRecordExample]), (0, tsoa_1.Get)('/')];
        _getFormatDateForProofExchange_decorators = [(0, tsoa_1.Get)('/:proofExchangeId/format-data'), (0, tsoa_1.Example)(ProofsControllerExamples_1.didCommProofsGetFormatDataExample)];
        _getProofExchangeById_decorators = [(0, tsoa_1.Get)('/:proofExchangeId'), (0, tsoa_1.Example)(ProofsControllerExamples_1.proofExchangeRecordExample)];
        _deleteProof_decorators = [(0, tsoa_1.Delete)('/:proofExchangeId')];
        _proposeProof_decorators = [(0, tsoa_1.Post)('/propose-proof'), (0, tsoa_1.Example)(ProofsControllerExamples_1.proofExchangeRecordExample)];
        _acceptProposal_decorators = [(0, tsoa_1.Post)('/:proofExchangeId/accept-proposal'), (0, tsoa_1.Example)(ProofsControllerExamples_1.proofExchangeRecordExample)];
        _createRequest_decorators = [(0, tsoa_1.Post)('/create-request'), (0, tsoa_1.Example)(ProofsControllerExamples_1.didCommProofsCreateRequestResponse)];
        _requestProof_decorators = [(0, tsoa_1.Post)('/request-proof'), (0, tsoa_1.Example)(ProofsControllerExamples_1.proofExchangeRecordExample)];
        _acceptRequest_decorators = [(0, tsoa_1.Post)('/:proofExchangeId/accept-request'), (0, tsoa_1.Example)(ProofsControllerExamples_1.proofExchangeRecordExample)];
        _acceptPresentation_decorators = [(0, tsoa_1.Post)('/:proofExchangeId/accept-presentation'), (0, tsoa_1.Example)(ProofsControllerExamples_1.proofExchangeRecordExample)];
        __esDecorate(_classThis, null, _findProofsByQuery_decorators, { kind: "method", name: "findProofsByQuery", static: false, private: false, access: { has: obj => "findProofsByQuery" in obj, get: obj => obj.findProofsByQuery }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getFormatDateForProofExchange_decorators, { kind: "method", name: "getFormatDateForProofExchange", static: false, private: false, access: { has: obj => "getFormatDateForProofExchange" in obj, get: obj => obj.getFormatDateForProofExchange }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProofExchangeById_decorators, { kind: "method", name: "getProofExchangeById", static: false, private: false, access: { has: obj => "getProofExchangeById" in obj, get: obj => obj.getProofExchangeById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteProof_decorators, { kind: "method", name: "deleteProof", static: false, private: false, access: { has: obj => "deleteProof" in obj, get: obj => obj.deleteProof }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _proposeProof_decorators, { kind: "method", name: "proposeProof", static: false, private: false, access: { has: obj => "proposeProof" in obj, get: obj => obj.proposeProof }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _acceptProposal_decorators, { kind: "method", name: "acceptProposal", static: false, private: false, access: { has: obj => "acceptProposal" in obj, get: obj => obj.acceptProposal }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createRequest_decorators, { kind: "method", name: "createRequest", static: false, private: false, access: { has: obj => "createRequest" in obj, get: obj => obj.createRequest }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _requestProof_decorators, { kind: "method", name: "requestProof", static: false, private: false, access: { has: obj => "requestProof" in obj, get: obj => obj.requestProof }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _acceptRequest_decorators, { kind: "method", name: "acceptRequest", static: false, private: false, access: { has: obj => "acceptRequest" in obj, get: obj => obj.acceptRequest }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _acceptPresentation_decorators, { kind: "method", name: "acceptPresentation", static: false, private: false, access: { has: obj => "acceptPresentation" in obj, get: obj => obj.acceptPresentation }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProofsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProofsController = _classThis;
})();
exports.ProofsController = ProofsController;
