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
exports.ThreadDecorator = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const BaseMessage_1 = require("../../agent/BaseMessage");
/**
 * Represents `~thread` decorator
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/concepts/0008-message-id-and-threading/README.md
 */
let ThreadDecorator = (() => {
    var _a;
    let _threadId_decorators;
    let _threadId_initializers = [];
    let _threadId_extraInitializers = [];
    let _parentThreadId_decorators;
    let _parentThreadId_initializers = [];
    let _parentThreadId_extraInitializers = [];
    let _senderOrder_decorators;
    let _senderOrder_initializers = [];
    let _senderOrder_extraInitializers = [];
    let _receivedOrders_decorators;
    let _receivedOrders_initializers = [];
    let _receivedOrders_extraInitializers = [];
    return _a = class ThreadDecorator {
            constructor(partial) {
                /**
                 * The ID of the message that serves as the thread start.
                 */
                this.threadId = __runInitializers(this, _threadId_initializers, void 0);
                /**
                 * An optional parent `thid`. Used when branching or nesting a new interaction off of an existing one.
                 */
                this.parentThreadId = (__runInitializers(this, _threadId_extraInitializers), __runInitializers(this, _parentThreadId_initializers, void 0));
                /**
                 * A number that tells where this message fits in the sequence of all messages that the current sender has contributed to this thread.
                 */
                this.senderOrder = (__runInitializers(this, _parentThreadId_extraInitializers), __runInitializers(this, _senderOrder_initializers, void 0));
                /**
                 * Reports the highest `sender_order` value that the sender has seen from other sender(s) on the thread.
                 * This value is often missing if it is the first message in an interaction, but should be used otherwise, as it provides an implicit ACK.
                 */
                this.receivedOrders = (__runInitializers(this, _senderOrder_extraInitializers), __runInitializers(this, _receivedOrders_initializers, void 0));
                __runInitializers(this, _receivedOrders_extraInitializers);
                this.threadId = partial === null || partial === void 0 ? void 0 : partial.threadId;
                this.parentThreadId = partial === null || partial === void 0 ? void 0 : partial.parentThreadId;
                this.senderOrder = partial === null || partial === void 0 ? void 0 : partial.senderOrder;
                this.receivedOrders = partial === null || partial === void 0 ? void 0 : partial.receivedOrders;
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _threadId_decorators = [(0, class_transformer_1.Expose)({ name: 'thid' }), (0, class_validator_1.Matches)(BaseMessage_1.MessageIdRegExp), (0, class_validator_1.IsOptional)()];
            _parentThreadId_decorators = [(0, class_transformer_1.Expose)({ name: 'pthid' }), (0, class_validator_1.Matches)(BaseMessage_1.MessageIdRegExp), (0, class_validator_1.IsOptional)()];
            _senderOrder_decorators = [(0, class_transformer_1.Expose)({ name: 'sender_order' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)()];
            _receivedOrders_decorators = [(0, class_transformer_1.Expose)({ name: 'received_orders' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _threadId_decorators, { kind: "field", name: "threadId", static: false, private: false, access: { has: obj => "threadId" in obj, get: obj => obj.threadId, set: (obj, value) => { obj.threadId = value; } }, metadata: _metadata }, _threadId_initializers, _threadId_extraInitializers);
            __esDecorate(null, null, _parentThreadId_decorators, { kind: "field", name: "parentThreadId", static: false, private: false, access: { has: obj => "parentThreadId" in obj, get: obj => obj.parentThreadId, set: (obj, value) => { obj.parentThreadId = value; } }, metadata: _metadata }, _parentThreadId_initializers, _parentThreadId_extraInitializers);
            __esDecorate(null, null, _senderOrder_decorators, { kind: "field", name: "senderOrder", static: false, private: false, access: { has: obj => "senderOrder" in obj, get: obj => obj.senderOrder, set: (obj, value) => { obj.senderOrder = value; } }, metadata: _metadata }, _senderOrder_initializers, _senderOrder_extraInitializers);
            __esDecorate(null, null, _receivedOrders_decorators, { kind: "field", name: "receivedOrders", static: false, private: false, access: { has: obj => "receivedOrders" in obj, get: obj => obj.receivedOrders, set: (obj, value) => { obj.receivedOrders = value; } }, metadata: _metadata }, _receivedOrders_initializers, _receivedOrders_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.ThreadDecorator = ThreadDecorator;
