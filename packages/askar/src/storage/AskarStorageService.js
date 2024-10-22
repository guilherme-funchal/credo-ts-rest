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
exports.AskarStorageService = void 0;
const core_1 = require("@aries-framework/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const askarError_1 = require("../utils/askarError");
const assertAskarWallet_1 = require("../utils/assertAskarWallet");
const utils_1 = require("./utils");
let AskarStorageService = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AskarStorageService = _classThis = class {
        /** @inheritDoc */
        save(agentContext, record) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertAskarWallet_1.assertAskarWallet)(agentContext.wallet);
                const session = agentContext.wallet.session;
                record.updatedAt = new Date();
                const value = core_1.JsonTransformer.serialize(record);
                const tags = (0, utils_1.transformFromRecordTagValues)(record.getTags());
                try {
                    yield session.insert({ category: record.type, name: record.id, value, tags });
                }
                catch (error) {
                    if ((0, askarError_1.isAskarError)(error, askarError_1.AskarErrorCode.Duplicate)) {
                        throw new core_1.RecordDuplicateError(`Record with id ${record.id} already exists`, { recordType: record.type });
                    }
                    throw new core_1.WalletError('Error saving record', { cause: error });
                }
            });
        }
        /** @inheritDoc */
        update(agentContext, record) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertAskarWallet_1.assertAskarWallet)(agentContext.wallet);
                const session = agentContext.wallet.session;
                record.updatedAt = new Date();
                const value = core_1.JsonTransformer.serialize(record);
                const tags = (0, utils_1.transformFromRecordTagValues)(record.getTags());
                try {
                    yield session.replace({ category: record.type, name: record.id, value, tags });
                }
                catch (error) {
                    if ((0, askarError_1.isAskarError)(error, askarError_1.AskarErrorCode.NotFound)) {
                        throw new core_1.RecordNotFoundError(`record with id ${record.id} not found.`, {
                            recordType: record.type,
                            cause: error,
                        });
                    }
                    throw new core_1.WalletError('Error updating record', { cause: error });
                }
            });
        }
        /** @inheritDoc */
        delete(agentContext, record) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertAskarWallet_1.assertAskarWallet)(agentContext.wallet);
                const session = agentContext.wallet.session;
                try {
                    yield session.remove({ category: record.type, name: record.id });
                }
                catch (error) {
                    if ((0, askarError_1.isAskarError)(error, askarError_1.AskarErrorCode.NotFound)) {
                        throw new core_1.RecordNotFoundError(`record with id ${record.id} not found.`, {
                            recordType: record.type,
                            cause: error,
                        });
                    }
                    throw new core_1.WalletError('Error deleting record', { cause: error });
                }
            });
        }
        /** @inheritDoc */
        deleteById(agentContext, recordClass, id) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertAskarWallet_1.assertAskarWallet)(agentContext.wallet);
                const session = agentContext.wallet.session;
                try {
                    yield session.remove({ category: recordClass.type, name: id });
                }
                catch (error) {
                    if ((0, askarError_1.isAskarError)(error, askarError_1.AskarErrorCode.NotFound)) {
                        throw new core_1.RecordNotFoundError(`record with id ${id} not found.`, {
                            recordType: recordClass.type,
                            cause: error,
                        });
                    }
                    throw new core_1.WalletError('Error deleting record', { cause: error });
                }
            });
        }
        /** @inheritDoc */
        getById(agentContext, recordClass, id) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertAskarWallet_1.assertAskarWallet)(agentContext.wallet);
                const session = agentContext.wallet.session;
                try {
                    const record = yield session.fetch({ category: recordClass.type, name: id });
                    if (!record) {
                        throw new core_1.RecordNotFoundError(`record with id ${id} not found.`, {
                            recordType: recordClass.type,
                        });
                    }
                    return (0, utils_1.recordToInstance)(record, recordClass);
                }
                catch (error) {
                    if (error instanceof core_1.RecordNotFoundError)
                        throw error;
                    throw new core_1.WalletError(`Error getting record`, { cause: error });
                }
            });
        }
        /** @inheritDoc */
        getAll(agentContext, recordClass) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertAskarWallet_1.assertAskarWallet)(agentContext.wallet);
                const session = agentContext.wallet.session;
                const records = yield session.fetchAll({ category: recordClass.type });
                const instances = [];
                for (const record of records) {
                    instances.push((0, utils_1.recordToInstance)(record, recordClass));
                }
                return instances;
            });
        }
        /** @inheritDoc */
        findByQuery(agentContext, recordClass, query) {
            return __awaiter(this, void 0, void 0, function* () {
                const wallet = agentContext.wallet;
                (0, assertAskarWallet_1.assertAskarWallet)(wallet);
                const askarQuery = (0, utils_1.askarQueryFromSearchQuery)(query);
                const scan = new aries_askar_shared_1.Scan({
                    category: recordClass.type,
                    store: wallet.store,
                    tagFilter: askarQuery,
                    profile: wallet.profile,
                });
                const instances = [];
                try {
                    const records = yield scan.fetchAll();
                    for (const record of records) {
                        instances.push((0, utils_1.recordToInstance)(record, recordClass));
                    }
                    return instances;
                }
                catch (error) {
                    throw new core_1.WalletError(`Error executing query. ${error.message}`, { cause: error });
                }
            });
        }
    };
    __setFunctionName(_classThis, "AskarStorageService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AskarStorageService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AskarStorageService = _classThis;
})();
exports.AskarStorageService = AskarStorageService;
