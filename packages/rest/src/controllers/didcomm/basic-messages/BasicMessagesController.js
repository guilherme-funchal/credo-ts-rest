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
exports.DidCommBasicMessagesController = void 0;
const core_1 = require("@credo-ts/core");
const tsoa_1 = require("tsoa");
const tsyringe_1 = require("tsyringe");
const response_1 = require("../../../utils/response");
const BasicMessagesControllerExamples_1 = require("./BasicMessagesControllerExamples");
const BasicMessagesControllerTypes_1 = require("./BasicMessagesControllerTypes");
let DidCommBasicMessagesController = (() => {
    let _classDecorators = [(0, tsoa_1.Tags)('DIDComm Basic Messages'), (0, tsoa_1.Route)('/didcomm/basic-messages'), (0, tsoa_1.Security)('tenants', ['tenant']), (0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = tsoa_1.Controller;
    let _instanceExtraInitializers = [];
    let _findBasicMessagesByQuery_decorators;
    let _sendMessage_decorators;
    var DidCommBasicMessagesController = _classThis = class extends _classSuper {
        /**
         * Retrieve basic messages by connection id
         *
         * @param connectionId Connection identifier
         * @returns BasicMessageRecord[]
         */
        findBasicMessagesByQuery(request, connectionId, role, threadId, parentThreadId) {
            return __awaiter(this, void 0, void 0, function* () {
                const basicMessageRecords = yield request.user.agent.basicMessages.findAllByQuery({
                    connectionId,
                    role,
                    threadId,
                    parentThreadId,
                });
                return basicMessageRecords.map(BasicMessagesControllerTypes_1.basicMessageRecordToApiModel);
            });
        }
        /**
         * Send a basic message to a connection
         *
         * @param connectionId Connection identifier
         * @param content The content of the message
         * @returns BasicMessageRecord
         */
        sendMessage(request, body) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const basicMessageRecord = yield request.user.agent.basicMessages.sendMessage(body.connectionId, body.content, body.parentThreadId);
                    return (0, BasicMessagesControllerTypes_1.basicMessageRecordToApiModel)(basicMessageRecord);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError) {
                        this.setStatus(404);
                        return (0, response_1.apiErrorResponse)(`connection with id '${body.connectionId}' not found.`);
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
    __setFunctionName(_classThis, "DidCommBasicMessagesController");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _findBasicMessagesByQuery_decorators = [(0, tsoa_1.Example)([BasicMessagesControllerExamples_1.basicMessageRecordExample]), (0, tsoa_1.Get)('/')];
        _sendMessage_decorators = [(0, tsoa_1.Example)(BasicMessagesControllerExamples_1.basicMessageRecordExample), (0, tsoa_1.Post)('/send')];
        __esDecorate(_classThis, null, _findBasicMessagesByQuery_decorators, { kind: "method", name: "findBasicMessagesByQuery", static: false, private: false, access: { has: obj => "findBasicMessagesByQuery" in obj, get: obj => obj.findBasicMessagesByQuery }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendMessage_decorators, { kind: "method", name: "sendMessage", static: false, private: false, access: { has: obj => "sendMessage" in obj, get: obj => obj.sendMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DidCommBasicMessagesController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DidCommBasicMessagesController = _classThis;
})();
exports.DidCommBasicMessagesController = DidCommBasicMessagesController;
