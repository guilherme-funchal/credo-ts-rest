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
exports.ConnectionsController = void 0;
const core_1 = require("@credo-ts/core");
const tsoa_1 = require("tsoa");
const tsyringe_1 = require("tsyringe");
const response_1 = require("../../../utils/response");
const ConnectionsControllerExamples_1 = require("./ConnectionsControllerExamples");
const ConnectionsControllerTypes_1 = require("./ConnectionsControllerTypes");
let ConnectionsController = (() => {
    let _classDecorators = [(0, tsoa_1.Tags)('DIDComm Connections'), (0, tsoa_1.Route)('/didcomm/connections'), (0, tsoa_1.Security)('tenants', ['tenant']), (0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = tsoa_1.Controller;
    let _instanceExtraInitializers = [];
    let _findConnectionsByQuery_decorators;
    let _getConnectionById_decorators;
    let _deleteConnection_decorators;
    let _acceptRequest_decorators;
    let _acceptResponse_decorators;
    var ConnectionsController = _classThis = class extends _classSuper {
        /**
         * Find connection record by query
         */
        findConnectionsByQuery(request, outOfBandId, alias, state, did, theirDid, theirLabel) {
            return __awaiter(this, void 0, void 0, function* () {
                const connections = yield request.user.agent.connections.findAllByQuery({
                    alias,
                    did,
                    theirDid,
                    theirLabel,
                    state,
                    outOfBandId,
                });
                return connections.map(ConnectionsControllerTypes_1.connectionRecordToApiModel);
            });
        }
        /**
         * Retrieve connection record by connection id
         * @param connectionId Connection identifier
         * @returns ConnectionRecord
         */
        getConnectionById(request, connectionId) {
            return __awaiter(this, void 0, void 0, function* () {
                const connection = yield request.user.agent.connections.findById(connectionId);
                if (!connection) {
                    this.setStatus(404);
                    return (0, response_1.apiErrorResponse)(`connection with connection id "${connectionId}" not found.`);
                }
                return (0, ConnectionsControllerTypes_1.connectionRecordToApiModel)(connection);
            });
        }
        /**
         * Deletes a connection record from the connection repository.
         *
         * @param connectionId Connection identifier
         */
        deleteConnection(request, connectionId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    this.setStatus(204);
                    yield request.user.agent.connections.deleteById(connectionId);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`connection with connection id "${connectionId}" not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Accept a connection request as inviter by sending a connection response message
         * for the connection with the specified connection id.
         *
         * This is not needed when auto accepting of connection is enabled.
         */
        acceptRequest(request, connectionId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const connection = yield request.user.agent.connections.acceptRequest(connectionId);
                    return (0, ConnectionsControllerTypes_1.connectionRecordToApiModel)(connection);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`connection with connection id "${connectionId}" not found.`);
                    }
                    this.setStatus(500);
                    return (0, response_1.apiErrorResponse)(error);
                }
            });
        }
        /**
         * Accept a connection response as invitee by sending a trust ping message
         * for the connection with the specified connection id.
         *
         * This is not needed when auto accepting of connection is enabled.
         *
         * @param connectionId Connection identifier
         * @returns ConnectionRecord
         */
        acceptResponse(request, connectionId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const connection = yield request.user.agent.connections.acceptResponse(connectionId);
                    return (0, ConnectionsControllerTypes_1.connectionRecordToApiModel)(connection);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`connection with connection id "${connectionId}" not found.`);
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
    __setFunctionName(_classThis, "ConnectionsController");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _findConnectionsByQuery_decorators = [(0, tsoa_1.Example)([ConnectionsControllerExamples_1.connectionRecordExample]), (0, tsoa_1.Get)('/')];
        _getConnectionById_decorators = [(0, tsoa_1.Example)(ConnectionsControllerExamples_1.connectionRecordExample), (0, tsoa_1.Get)('/:connectionId')];
        _deleteConnection_decorators = [(0, tsoa_1.Delete)('/:connectionId')];
        _acceptRequest_decorators = [(0, tsoa_1.Example)(ConnectionsControllerExamples_1.connectionRecordExample), (0, tsoa_1.Post)('/:connectionId/accept-request')];
        _acceptResponse_decorators = [(0, tsoa_1.Example)(ConnectionsControllerExamples_1.connectionRecordExample), (0, tsoa_1.Post)('/:connectionId/accept-response')];
        __esDecorate(_classThis, null, _findConnectionsByQuery_decorators, { kind: "method", name: "findConnectionsByQuery", static: false, private: false, access: { has: obj => "findConnectionsByQuery" in obj, get: obj => obj.findConnectionsByQuery }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getConnectionById_decorators, { kind: "method", name: "getConnectionById", static: false, private: false, access: { has: obj => "getConnectionById" in obj, get: obj => obj.getConnectionById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteConnection_decorators, { kind: "method", name: "deleteConnection", static: false, private: false, access: { has: obj => "deleteConnection" in obj, get: obj => obj.deleteConnection }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _acceptRequest_decorators, { kind: "method", name: "acceptRequest", static: false, private: false, access: { has: obj => "acceptRequest" in obj, get: obj => obj.acceptRequest }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _acceptResponse_decorators, { kind: "method", name: "acceptResponse", static: false, private: false, access: { has: obj => "acceptResponse" in obj, get: obj => obj.acceptResponse }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ConnectionsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ConnectionsController = _classThis;
})();
exports.ConnectionsController = ConnectionsController;
