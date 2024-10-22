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
exports.IndyVdrApi = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const indy_vdr_shared_1 = require("@hyperledger/indy-vdr-shared");
const didIndyUtil_1 = require("./dids/didIndyUtil");
const error_1 = require("./error");
const sign_1 = require("./utils/sign");
let IndyVdrApi = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IndyVdrApi = _classThis = class {
        constructor(agentContext, indyVdrPoolService) {
            this.agentContext = agentContext;
            this.indyVdrPoolService = indyVdrPoolService;
        }
        multiSignRequest(request, signingKey, identifier) {
            return __awaiter(this, void 0, void 0, function* () {
                return (0, sign_1.multiSignRequest)(this.agentContext, request, signingKey, identifier);
            });
        }
        signRequest(request, submitterDid) {
            return __awaiter(this, void 0, void 0, function* () {
                const { pool } = yield this.indyVdrPoolService.getPoolForDid(this.agentContext, submitterDid);
                return (0, sign_1.signRequest)(this.agentContext, pool, request, submitterDid);
            });
        }
        /**
         * This method endorses a transaction. The transaction can be either a string or a JSON object.
         * If the transaction has a signature, it means the transaction was created by another author and will be endorsed.
         * This requires the `endorser` on the transaction to be equal to the unqualified variant of the `endorserDid`.
         *
         * If the transaction is not signed, we have a special case where the endorser will author the transaction.
         * This is required when a new did is created, as the author and the endorser did must already exist on the ledger.
         * In this case, the author did (`identifier`) must be equal to the unqualified identifier of the `endorserDid`.
         * @param transaction the transaction body to be endorsed
         * @param endorserDid the did of the endorser
         * @returns An endorsed transaction
         */
        endorseTransaction(transaction, endorserDid) {
            return __awaiter(this, void 0, void 0, function* () {
                const endorserSigningKey = yield (0, didIndyUtil_1.verificationKeyForIndyDid)(this.agentContext, endorserDid);
                const { namespaceIdentifier } = (0, anoncreds_1.parseIndyDid)(endorserDid);
                const request = new indy_vdr_shared_1.CustomRequest({ customRequest: transaction });
                let endorsedTransaction;
                // the request is not parsed correctly due to too large numbers. The reqId overflows.
                const txBody = typeof transaction === 'string' ? JSON.parse(transaction) : transaction;
                if (txBody.signature) {
                    if (txBody.endorser !== namespaceIdentifier)
                        throw new error_1.IndyVdrError('Submitter does not match Endorser');
                    endorsedTransaction = yield this.multiSignRequest(request, endorserSigningKey, namespaceIdentifier);
                }
                else {
                    if (txBody.identifier !== namespaceIdentifier)
                        throw new error_1.IndyVdrError('Submitter does not match identifier');
                    endorsedTransaction = yield this.signRequest(request, endorserDid);
                }
                return endorsedTransaction.body;
            });
        }
    };
    __setFunctionName(_classThis, "IndyVdrApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        IndyVdrApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return IndyVdrApi = _classThis;
})();
exports.IndyVdrApi = IndyVdrApi;
