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
exports.DidExchangeResponseMessage = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const AgentMessage_1 = require("../../../agent/AgentMessage");
const Attachment_1 = require("../../../decorators/attachment/Attachment");
const messageType_1 = require("../../../utils/messageType");
/**
 * Message part of connection protocol used to complete the connection
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/main/features/0023-did-exchange/README.md#2-exchange-response
 */
let DidExchangeResponseMessage = (() => {
    var _a;
    let _classSuper = AgentMessage_1.AgentMessage;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _did_decorators;
    let _did_initializers = [];
    let _did_extraInitializers = [];
    let _didDoc_decorators;
    let _didDoc_initializers = [];
    let _didDoc_extraInitializers = [];
    return _a = class DidExchangeResponseMessage extends _classSuper {
            /**
             * Create new DidExchangeResponseMessage instance.
             * @param options
             */
            constructor(options) {
                super();
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                this.did = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _did_initializers, void 0));
                this.didDoc = (__runInitializers(this, _did_extraInitializers), __runInitializers(this, _didDoc_initializers, void 0));
                __runInitializers(this, _didDoc_extraInitializers);
                if (options) {
                    this.id = options.id || this.generateId();
                    this.did = options.did;
                    this.setThread({
                        threadId: options.threadId,
                    });
                }
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _type_decorators = [(0, messageType_1.IsValidMessageType)(DidExchangeResponseMessage.type)];
            _did_decorators = [(0, class_validator_1.IsString)()];
            _didDoc_decorators = [(0, class_transformer_1.Expose)({ name: 'did_doc~attach' }), (0, class_transformer_1.Type)(() => Attachment_1.Attachment), (0, class_validator_1.ValidateNested)()];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _did_decorators, { kind: "field", name: "did", static: false, private: false, access: { has: obj => "did" in obj, get: obj => obj.did, set: (obj, value) => { obj.did = value; } }, metadata: _metadata }, _did_initializers, _did_extraInitializers);
            __esDecorate(null, null, _didDoc_decorators, { kind: "field", name: "didDoc", static: false, private: false, access: { has: obj => "didDoc" in obj, get: obj => obj.didDoc, set: (obj, value) => { obj.didDoc = value; } }, metadata: _metadata }, _didDoc_initializers, _didDoc_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, messageType_1.parseMessageType)('https://didcomm.org/didexchange/1.0/response'),
        _a;
})();
exports.DidExchangeResponseMessage = DidExchangeResponseMessage;
