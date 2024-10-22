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
exports.V2QueriesMessage = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const AgentMessage_1 = require("../../../../../agent/AgentMessage");
const models_1 = require("../../../../../agent/models");
const messageType_1 = require("../../../../../utils/messageType");
let V2QueriesMessage = (() => {
    var _a;
    let _classSuper = AgentMessage_1.AgentMessage;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _queries_decorators;
    let _queries_initializers = [];
    let _queries_extraInitializers = [];
    return _a = class V2QueriesMessage extends _classSuper {
            constructor(options) {
                var _b;
                super();
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                this.queries = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _queries_initializers, void 0));
                __runInitializers(this, _queries_extraInitializers);
                if (options) {
                    this.id = (_b = options.id) !== null && _b !== void 0 ? _b : this.generateId();
                    this.queries = options.queries.map((q) => new models_1.FeatureQuery(q));
                }
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _type_decorators = [(0, messageType_1.IsValidMessageType)(V2QueriesMessage.type)];
            _queries_decorators = [(0, class_validator_1.IsInstance)(models_1.FeatureQuery, { each: true }), (0, class_transformer_1.Type)(() => models_1.FeatureQuery), (0, class_validator_1.ArrayNotEmpty)()];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _queries_decorators, { kind: "field", name: "queries", static: false, private: false, access: { has: obj => "queries" in obj, get: obj => obj.queries, set: (obj, value) => { obj.queries = value; } }, metadata: _metadata }, _queries_initializers, _queries_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, messageType_1.parseMessageType)('https://didcomm.org/discover-features/2.0/queries'),
        _a;
})();
exports.V2QueriesMessage = V2QueriesMessage;
