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
exports.DidRepository = void 0;
const plugins_1 = require("../../../plugins");
const Repository_1 = require("../../../storage/Repository");
const DidDocumentRole_1 = require("../domain/DidDocumentRole");
const DidRecord_1 = require("./DidRecord");
let DidRepository = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = Repository_1.Repository;
    var DidRepository = _classThis = class extends _classSuper {
        constructor(storageService, eventEmitter) {
            super(DidRecord_1.DidRecord, storageService, eventEmitter);
        }
        /**
         * Finds a {@link DidRecord}, containing the specified recipientKey that was received by this agent.
         * To find a {@link DidRecord} that was created by this agent, use {@link DidRepository.findCreatedDidByRecipientKey}.
         */
        findReceivedDidByRecipientKey(agentContext, recipientKey) {
            return this.findSingleByQuery(agentContext, {
                recipientKeyFingerprints: [recipientKey.fingerprint],
                role: DidDocumentRole_1.DidDocumentRole.Received,
            });
        }
        /**
         * Finds a {@link DidRecord}, containing the specified recipientKey that was created by this agent.
         * To find a {@link DidRecord} that was received by this agent, use {@link DidRepository.findReceivedDidByRecipientKey}.
         */
        findCreatedDidByRecipientKey(agentContext, recipientKey) {
            return this.findSingleByQuery(agentContext, {
                recipientKeyFingerprints: [recipientKey.fingerprint],
                role: DidDocumentRole_1.DidDocumentRole.Created,
            });
        }
        findAllByRecipientKey(agentContext, recipientKey) {
            return this.findByQuery(agentContext, { recipientKeyFingerprints: [recipientKey.fingerprint] });
        }
        findAllByDid(agentContext, did) {
            return this.findByQuery(agentContext, { did });
        }
        findReceivedDid(agentContext, receivedDid) {
            return this.findSingleByQuery(agentContext, { did: receivedDid, role: DidDocumentRole_1.DidDocumentRole.Received });
        }
        findCreatedDid(agentContext, createdDid) {
            return this.findSingleByQuery(agentContext, { did: createdDid, role: DidDocumentRole_1.DidDocumentRole.Created });
        }
        getCreatedDids(agentContext, { method, did }) {
            return this.findByQuery(agentContext, {
                role: DidDocumentRole_1.DidDocumentRole.Created,
                method,
                did,
            });
        }
        storeCreatedDid(agentContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (agentContext, { did, didDocument, tags }) {
                const didRecord = new DidRecord_1.DidRecord({
                    did,
                    didDocument,
                    role: DidDocumentRole_1.DidDocumentRole.Created,
                    tags,
                });
                yield this.save(agentContext, didRecord);
                return didRecord;
            });
        }
        storeReceivedDid(agentContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (agentContext, { did, didDocument, tags }) {
                const didRecord = new DidRecord_1.DidRecord({
                    did,
                    didDocument,
                    role: DidDocumentRole_1.DidDocumentRole.Received,
                    tags,
                });
                yield this.save(agentContext, didRecord);
                return didRecord;
            });
        }
    };
    __setFunctionName(_classThis, "DidRepository");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DidRepository = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DidRepository = _classThis;
})();
exports.DidRepository = DidRepository;