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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleContextLruCacheRecord = void 0;
const class_transformer_1 = require("class-transformer");
const BaseRecord_1 = require("../../../storage/BaseRecord");
const uuid_1 = require("../../../utils/uuid");
let SingleContextLruCacheRecord = (() => {
    var _a;
    let _classSuper = BaseRecord_1.BaseRecord;
    let _entries_decorators;
    let _entries_initializers = [];
    let _entries_extraInitializers = [];
    return _a = class SingleContextLruCacheRecord extends _classSuper {
            constructor(props) {
                var _b, _c, _d;
                super();
                this.entries = __runInitializers(this, _entries_initializers, void 0);
                this.type = (__runInitializers(this, _entries_extraInitializers), _a.type);
                if (props) {
                    this.id = (_b = props.id) !== null && _b !== void 0 ? _b : (0, uuid_1.uuid)();
                    this.createdAt = (_c = props.createdAt) !== null && _c !== void 0 ? _c : new Date();
                    this.entries = props.entries;
                    this._tags = (_d = props.tags) !== null && _d !== void 0 ? _d : {};
                }
            }
            getTags() {
                return Object.assign({}, this._tags);
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _entries_decorators = [(0, class_transformer_1.Type)(() => Object)];
            __esDecorate(null, null, _entries_decorators, { kind: "field", name: "entries", static: false, private: false, access: { has: obj => "entries" in obj, get: obj => obj.entries, set: (obj, value) => { obj.entries = value; } }, metadata: _metadata }, _entries_initializers, _entries_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = 'SingleContextLruCacheRecord',
        _a;
})();
exports.SingleContextLruCacheRecord = SingleContextLruCacheRecord;
