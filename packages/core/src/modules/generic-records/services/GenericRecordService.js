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
exports.GenericRecordService = void 0;
const error_1 = require("../../../error");
const plugins_1 = require("../../../plugins");
const GenericRecord_1 = require("../repository/GenericRecord");
let GenericRecordService = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var GenericRecordService = _classThis = class {
        constructor(genericRecordsRepository) {
            this.genericRecordsRepository = genericRecordsRepository;
        }
        save(agentContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (agentContext, { content, tags, id }) {
                const genericRecord = new GenericRecord_1.GenericRecord({
                    id,
                    content,
                    tags,
                });
                try {
                    yield this.genericRecordsRepository.save(agentContext, genericRecord);
                    return genericRecord;
                }
                catch (error) {
                    throw new error_1.AriesFrameworkError(`Unable to store the genericRecord record with id ${genericRecord.id}. Message: ${error}`);
                }
            });
        }
        delete(agentContext, record) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.genericRecordsRepository.delete(agentContext, record);
                }
                catch (error) {
                    throw new error_1.AriesFrameworkError(`Unable to delete the genericRecord record with id ${record.id}. Message: ${error}`);
                }
            });
        }
        deleteById(agentContext, id) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.genericRecordsRepository.deleteById(agentContext, id);
            });
        }
        update(agentContext, record) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.genericRecordsRepository.update(agentContext, record);
                }
                catch (error) {
                    throw new error_1.AriesFrameworkError(`Unable to update the genericRecord record with id ${record.id}. Message: ${error}`);
                }
            });
        }
        findAllByQuery(agentContext, query) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.genericRecordsRepository.findByQuery(agentContext, query);
            });
        }
        findById(agentContext, id) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.genericRecordsRepository.findById(agentContext, id);
            });
        }
        getAll(agentContext) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.genericRecordsRepository.getAll(agentContext);
            });
        }
    };
    __setFunctionName(_classThis, "GenericRecordService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GenericRecordService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GenericRecordService = _classThis;
})();
exports.GenericRecordService = GenericRecordService;
