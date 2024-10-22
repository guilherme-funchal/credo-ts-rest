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
exports.DidCommMessageRepository = void 0;
const plugins_1 = require("../../plugins");
const messageType_1 = require("../../utils/messageType");
const Repository_1 = require("../Repository");
const DidCommMessageRecord_1 = require("./DidCommMessageRecord");
let DidCommMessageRepository = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = Repository_1.Repository;
    var DidCommMessageRepository = _classThis = class extends _classSuper {
        constructor(storageService, eventEmitter) {
            super(DidCommMessageRecord_1.DidCommMessageRecord, storageService, eventEmitter);
        }
        saveAgentMessage(agentContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (agentContext, { role, agentMessage, associatedRecordId }) {
                const didCommMessageRecord = new DidCommMessageRecord_1.DidCommMessageRecord({
                    message: agentMessage.toJSON(),
                    role,
                    associatedRecordId,
                });
                yield this.save(agentContext, didCommMessageRecord);
            });
        }
        saveOrUpdateAgentMessage(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { messageName, protocolName, protocolMajorVersion } = (0, messageType_1.parseMessageType)(options.agentMessage.type);
                const record = yield this.findSingleByQuery(agentContext, {
                    associatedRecordId: options.associatedRecordId,
                    messageName: messageName,
                    protocolName: protocolName,
                    protocolMajorVersion: String(protocolMajorVersion),
                });
                if (record) {
                    record.message = options.agentMessage.toJSON();
                    record.role = options.role;
                    yield this.update(agentContext, record);
                    return;
                }
                yield this.saveAgentMessage(agentContext, options);
            });
        }
        getAgentMessage(agentContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (agentContext, { associatedRecordId, messageClass }) {
                const record = yield this.getSingleByQuery(agentContext, {
                    associatedRecordId,
                    messageName: messageClass.type.messageName,
                    protocolName: messageClass.type.protocolName,
                    protocolMajorVersion: String(messageClass.type.protocolMajorVersion),
                });
                return record.getMessageInstance(messageClass);
            });
        }
        findAgentMessage(agentContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (agentContext, { associatedRecordId, messageClass }) {
                var _b;
                const record = yield this.findSingleByQuery(agentContext, {
                    associatedRecordId,
                    messageName: messageClass.type.messageName,
                    protocolName: messageClass.type.protocolName,
                    protocolMajorVersion: String(messageClass.type.protocolMajorVersion),
                });
                return (_b = record === null || record === void 0 ? void 0 : record.getMessageInstance(messageClass)) !== null && _b !== void 0 ? _b : null;
            });
        }
    };
    __setFunctionName(_classThis, "DidCommMessageRepository");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DidCommMessageRepository = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DidCommMessageRepository = _classThis;
})();
exports.DidCommMessageRepository = DidCommMessageRepository;