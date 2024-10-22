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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicMessageService = void 0;
const plugins_1 = require("../../../plugins");
const BasicMessageEvents_1 = require("../BasicMessageEvents");
const BasicMessageRole_1 = require("../BasicMessageRole");
const messages_1 = require("../messages");
const repository_1 = require("../repository");
let BasicMessageService = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var BasicMessageService = _classThis = class {
        constructor(basicMessageRepository, eventEmitter) {
            this.basicMessageRepository = basicMessageRepository;
            this.eventEmitter = eventEmitter;
        }
        createMessage(agentContext, message, connectionRecord, parentThreadId) {
            return __awaiter(this, void 0, void 0, function* () {
                const basicMessage = new messages_1.BasicMessage({ content: message });
                // If no parentThreadid is defined, there is no need to explicitly send a thread decorator
                if (parentThreadId) {
                    basicMessage.setThread({ parentThreadId });
                }
                const basicMessageRecord = new repository_1.BasicMessageRecord({
                    sentTime: basicMessage.sentTime.toISOString(),
                    content: basicMessage.content,
                    connectionId: connectionRecord.id,
                    role: BasicMessageRole_1.BasicMessageRole.Sender,
                    threadId: basicMessage.threadId,
                    parentThreadId,
                });
                yield this.basicMessageRepository.save(agentContext, basicMessageRecord);
                this.emitStateChangedEvent(agentContext, basicMessageRecord, basicMessage);
                return { message: basicMessage, record: basicMessageRecord };
            });
        }
        /**
         * @todo use connection from message context
         */
        save(_a, connection_1) {
            return __awaiter(this, arguments, void 0, function* ({ message, agentContext }, connection) {
                var _b;
                const basicMessageRecord = new repository_1.BasicMessageRecord({
                    sentTime: message.sentTime.toISOString(),
                    content: message.content,
                    connectionId: connection.id,
                    role: BasicMessageRole_1.BasicMessageRole.Receiver,
                    threadId: message.threadId,
                    parentThreadId: (_b = message.thread) === null || _b === void 0 ? void 0 : _b.parentThreadId,
                });
                yield this.basicMessageRepository.save(agentContext, basicMessageRecord);
                this.emitStateChangedEvent(agentContext, basicMessageRecord, message);
            });
        }
        emitStateChangedEvent(agentContext, basicMessageRecord, basicMessage) {
            this.eventEmitter.emit(agentContext, {
                type: BasicMessageEvents_1.BasicMessageEventTypes.BasicMessageStateChanged,
                payload: { message: basicMessage, basicMessageRecord: basicMessageRecord.clone() },
            });
        }
        findAllByQuery(agentContext, query) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.basicMessageRepository.findByQuery(agentContext, query);
            });
        }
        getById(agentContext, basicMessageRecordId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.basicMessageRepository.getById(agentContext, basicMessageRecordId);
            });
        }
        getByThreadId(agentContext, threadId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.basicMessageRepository.getSingleByQuery(agentContext, { threadId });
            });
        }
        findAllByParentThreadId(agentContext, parentThreadId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.basicMessageRepository.findByQuery(agentContext, { parentThreadId });
            });
        }
        deleteById(agentContext, basicMessageRecordId) {
            return __awaiter(this, void 0, void 0, function* () {
                const basicMessageRecord = yield this.getById(agentContext, basicMessageRecordId);
                return this.basicMessageRepository.delete(agentContext, basicMessageRecord);
            });
        }
    };
    __setFunctionName(_classThis, "BasicMessageService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BasicMessageService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BasicMessageService = _classThis;
})();
exports.BasicMessageService = BasicMessageService;
