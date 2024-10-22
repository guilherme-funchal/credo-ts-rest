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
exports.GenericRecordsApi = void 0;
const plugins_1 = require("../../plugins");
let GenericRecordsApi = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var GenericRecordsApi = _classThis = class {
        constructor(genericRecordsService, logger, agentContext) {
            this.genericRecordsService = genericRecordsService;
            this.logger = logger;
            this.agentContext = agentContext;
        }
        save(_a) {
            return __awaiter(this, arguments, void 0, function* ({ content, tags, id }) {
                try {
                    const record = yield this.genericRecordsService.save(this.agentContext, {
                        id,
                        content: content,
                        tags: tags,
                    });
                    return record;
                }
                catch (error) {
                    this.logger.error('Error while saving generic-record', {
                        error,
                        content,
                        errorMessage: error instanceof Error ? error.message : error,
                    });
                    throw error;
                }
            });
        }
        delete(record) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.genericRecordsService.delete(this.agentContext, record);
                }
                catch (error) {
                    this.logger.error('Error while saving generic-record', {
                        error,
                        content: record.content,
                        errorMessage: error instanceof Error ? error.message : error,
                    });
                    throw error;
                }
            });
        }
        deleteById(id) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.genericRecordsService.deleteById(this.agentContext, id);
            });
        }
        update(record) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.genericRecordsService.update(this.agentContext, record);
                }
                catch (error) {
                    this.logger.error('Error while update generic-record', {
                        error,
                        content: record.content,
                        errorMessage: error instanceof Error ? error.message : error,
                    });
                    throw error;
                }
            });
        }
        findById(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.genericRecordsService.findById(this.agentContext, id);
            });
        }
        findAllByQuery(query) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.genericRecordsService.findAllByQuery(this.agentContext, query);
            });
        }
        getAll() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.genericRecordsService.getAll(this.agentContext);
            });
        }
    };
    __setFunctionName(_classThis, "GenericRecordsApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GenericRecordsApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GenericRecordsApi = _classThis;
})();
exports.GenericRecordsApi = GenericRecordsApi;