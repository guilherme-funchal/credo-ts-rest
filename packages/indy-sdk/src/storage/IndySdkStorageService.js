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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndySdkStorageService = void 0;
const core_1 = require("@aries-framework/core");
const error_1 = require("../error");
const assertIndySdkWallet_1 = require("../utils/assertIndySdkWallet");
let IndySdkStorageService = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IndySdkStorageService = _classThis = class {
        constructor(indySdk) {
            this.indySdk = indySdk;
        }
        transformToRecordTagValues(tags) {
            const transformedTags = {};
            for (const [key, value] of Object.entries(tags)) {
                // If the value is a boolean string ('1' or '0')
                // use the boolean val
                if (value === '1' && (key === null || key === void 0 ? void 0 : key.includes(':'))) {
                    const [tagName, tagValue] = key.split(':');
                    const transformedValue = transformedTags[tagName];
                    if (Array.isArray(transformedValue)) {
                        transformedTags[tagName] = [...transformedValue, tagValue];
                    }
                    else {
                        transformedTags[tagName] = [tagValue];
                    }
                }
                // Transform '1' and '0' to boolean
                else if (value === '1' || value === '0') {
                    transformedTags[key] = value === '1';
                }
                // If 1 or 0 is prefixed with 'n__' we need to remove it. This is to prevent
                // casting the value to a boolean
                else if (value === 'n__1' || value === 'n__0') {
                    transformedTags[key] = value === 'n__1' ? '1' : '0';
                }
                // Otherwise just use the value
                else {
                    transformedTags[key] = value;
                }
            }
            return transformedTags;
        }
        transformFromRecordTagValues(tags) {
            const transformedTags = {};
            for (const [key, value] of Object.entries(tags)) {
                // If the value is of type null we use the value undefined
                // Indy doesn't support null as a value
                if (value === null) {
                    transformedTags[key] = undefined;
                }
                // If the value is a boolean use the indy
                // '1' or '0' syntax
                else if (typeof value === 'boolean') {
                    transformedTags[key] = value ? '1' : '0';
                }
                // If the value is 1 or 0, we need to add something to the value, otherwise
                // the next time we deserialize the tag values it will be converted to boolean
                else if (value === '1' || value === '0') {
                    transformedTags[key] = `n__${value}`;
                }
                // If the value is an array we create a tag for each array
                // item ("tagName:arrayItem" = "1")
                else if (Array.isArray(value)) {
                    value.forEach((item) => {
                        const tagName = `${key}:${item}`;
                        transformedTags[tagName] = '1';
                    });
                }
                // Otherwise just use the value
                else {
                    transformedTags[key] = value;
                }
            }
            return transformedTags;
        }
        /**
         * Transforms the search query into a wallet query compatible with indy WQL.
         *
         * The format used by AFJ is almost the same as the indy query, with the exception of
         * the encoding of values, however this is handled by the {@link IndyStorageService.transformToRecordTagValues}
         * method.
         */
        indyQueryFromSearchQuery(query) {
            // eslint-disable-next-line prefer-const
            let { $and, $or, $not } = query, tags = __rest(query, ["$and", "$or", "$not"]);
            $and = $and === null || $and === void 0 ? void 0 : $and.map((q) => this.indyQueryFromSearchQuery(q));
            $or = $or === null || $or === void 0 ? void 0 : $or.map((q) => this.indyQueryFromSearchQuery(q));
            $not = $not ? this.indyQueryFromSearchQuery($not) : undefined;
            const indyQuery = Object.assign(Object.assign({}, this.transformFromRecordTagValues(tags)), { $and,
                $or,
                $not });
            return indyQuery;
        }
        recordToInstance(record, recordClass) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const instance = core_1.JsonTransformer.deserialize(record.value, recordClass);
            instance.id = record.id;
            const tags = record.tags ? this.transformToRecordTagValues(record.tags) : {};
            instance.replaceTags(tags);
            return instance;
        }
        /** @inheritDoc */
        save(agentContext, record) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                record.updatedAt = new Date();
                const value = core_1.JsonTransformer.serialize(record);
                const tags = this.transformFromRecordTagValues(record.getTags());
                try {
                    yield this.indySdk.addWalletRecord(agentContext.wallet.handle, record.type, record.id, value, tags);
                }
                catch (error) {
                    // Record already exists
                    if ((0, error_1.isIndyError)(error, 'WalletItemAlreadyExists')) {
                        throw new core_1.RecordDuplicateError(`Record with id ${record.id} already exists`, { recordType: record.type });
                    }
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        /** @inheritDoc */
        update(agentContext, record) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                record.updatedAt = new Date();
                const value = core_1.JsonTransformer.serialize(record);
                const tags = this.transformFromRecordTagValues(record.getTags());
                try {
                    yield this.indySdk.updateWalletRecordValue(agentContext.wallet.handle, record.type, record.id, value);
                    yield this.indySdk.updateWalletRecordTags(agentContext.wallet.handle, record.type, record.id, tags);
                }
                catch (error) {
                    // Record does not exist
                    if ((0, error_1.isIndyError)(error, 'WalletItemNotFound')) {
                        throw new core_1.RecordNotFoundError(`record with id ${record.id} not found.`, {
                            recordType: record.type,
                            cause: error,
                        });
                    }
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        /** @inheritDoc */
        delete(agentContext, record) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                try {
                    yield this.indySdk.deleteWalletRecord(agentContext.wallet.handle, record.type, record.id);
                }
                catch (error) {
                    // Record does not exist
                    if ((0, error_1.isIndyError)(error, 'WalletItemNotFound')) {
                        throw new core_1.RecordNotFoundError(`record with id ${record.id} not found.`, {
                            recordType: record.type,
                            cause: error,
                        });
                    }
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        /** @inheritDoc */
        deleteById(agentContext, recordClass, id) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                try {
                    yield this.indySdk.deleteWalletRecord(agentContext.wallet.handle, recordClass.type, id);
                }
                catch (error) {
                    if ((0, error_1.isIndyError)(error, 'WalletItemNotFound')) {
                        throw new core_1.RecordNotFoundError(`record with id ${id} not found.`, {
                            recordType: recordClass.type,
                            cause: error,
                        });
                    }
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        /** @inheritDoc */
        getById(agentContext, recordClass, id) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                try {
                    const record = yield this.indySdk.getWalletRecord(agentContext.wallet.handle, recordClass.type, id, IndySdkStorageService.DEFAULT_QUERY_OPTIONS);
                    return this.recordToInstance(record, recordClass);
                }
                catch (error) {
                    if ((0, error_1.isIndyError)(error, 'WalletItemNotFound')) {
                        throw new core_1.RecordNotFoundError(`record with id ${id} not found.`, {
                            recordType: recordClass.type,
                            cause: error,
                        });
                    }
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        /** @inheritDoc */
        getAll(agentContext, recordClass) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, e_1, _b, _c;
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                const recordIterator = this.search(agentContext.wallet, recordClass.type, {}, IndySdkStorageService.DEFAULT_QUERY_OPTIONS);
                const records = [];
                try {
                    for (var _d = true, recordIterator_1 = __asyncValues(recordIterator), recordIterator_1_1; recordIterator_1_1 = yield recordIterator_1.next(), _a = recordIterator_1_1.done, !_a; _d = true) {
                        _c = recordIterator_1_1.value;
                        _d = false;
                        const record = _c;
                        records.push(this.recordToInstance(record, recordClass));
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = recordIterator_1.return)) yield _b.call(recordIterator_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return records;
            });
        }
        /** @inheritDoc */
        findByQuery(agentContext, recordClass, query) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, e_2, _b, _c;
                (0, assertIndySdkWallet_1.assertIndySdkWallet)(agentContext.wallet);
                const indyQuery = this.indyQueryFromSearchQuery(query);
                const recordIterator = this.search(agentContext.wallet, recordClass.type, indyQuery, IndySdkStorageService.DEFAULT_QUERY_OPTIONS);
                const records = [];
                try {
                    for (var _d = true, recordIterator_2 = __asyncValues(recordIterator), recordIterator_2_1; recordIterator_2_1 = yield recordIterator_2.next(), _a = recordIterator_2_1.done, !_a; _d = true) {
                        _c = recordIterator_2_1.value;
                        _d = false;
                        const record = _c;
                        records.push(this.recordToInstance(record, recordClass));
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = recordIterator_2.return)) yield _b.call(recordIterator_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                return records;
            });
        }
        search(wallet_1, type_1, query_1, _a) {
            return __asyncGenerator(this, arguments, function* search_1(wallet, type, query, _b) {
                var { limit = Infinity } = _b, options = __rest(_b, ["limit"]);
                try {
                    const searchHandle = yield __await(this.indySdk.openWalletSearch(wallet.handle, type, query, options));
                    let records = [];
                    // Allow max of 256 per fetch operation
                    const chunk = limit ? Math.min(256, limit) : 256;
                    // Loop while limit not reached (or no limit specified)
                    while (!limit || records.length < limit) {
                        // Retrieve records
                        const recordsJson = yield __await(this.indySdk.fetchWalletSearchNextRecords(wallet.handle, searchHandle, chunk));
                        if (recordsJson.records) {
                            records = [...records, ...recordsJson.records];
                            for (const record of recordsJson.records) {
                                yield yield __await(record);
                            }
                        }
                        // If the number of records returned is less than chunk
                        // It means we reached the end of the iterator (no more records)
                        if (!records.length || !recordsJson.records || recordsJson.records.length < chunk) {
                            yield __await(this.indySdk.closeWalletSearch(searchHandle));
                            return yield __await(void 0);
                        }
                    }
                }
                catch (error) {
                    throw new error_1.IndySdkError(error, `Searching '${type}' records for query '${JSON.stringify(query)}' failed`);
                }
            });
        }
    };
    __setFunctionName(_classThis, "IndySdkStorageService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        IndySdkStorageService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.DEFAULT_QUERY_OPTIONS = {
        retrieveType: true,
        retrieveTags: true,
    };
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return IndySdkStorageService = _classThis;
})();
exports.IndySdkStorageService = IndySdkStorageService;
