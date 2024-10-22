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
exports.V2StatusMessage = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const AgentMessage_1 = require("../../../../../agent/AgentMessage");
const TransportDecorator_1 = require("../../../../../decorators/transport/TransportDecorator");
const messageType_1 = require("../../../../../utils/messageType");
const transformers_1 = require("../../../../../utils/transformers");
let V2StatusMessage = (() => {
    var _a;
    let _classSuper = AgentMessage_1.AgentMessage;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _recipientKey_decorators;
    let _recipientKey_initializers = [];
    let _recipientKey_extraInitializers = [];
    let _messageCount_decorators;
    let _messageCount_initializers = [];
    let _messageCount_extraInitializers = [];
    let _longestWaitedSeconds_decorators;
    let _longestWaitedSeconds_initializers = [];
    let _longestWaitedSeconds_extraInitializers = [];
    let _newestReceivedTime_decorators;
    let _newestReceivedTime_initializers = [];
    let _newestReceivedTime_extraInitializers = [];
    let _oldestReceivedTime_decorators;
    let _oldestReceivedTime_initializers = [];
    let _oldestReceivedTime_extraInitializers = [];
    let _totalBytes_decorators;
    let _totalBytes_initializers = [];
    let _totalBytes_extraInitializers = [];
    let _liveDelivery_decorators;
    let _liveDelivery_initializers = [];
    let _liveDelivery_extraInitializers = [];
    return _a = class V2StatusMessage extends _classSuper {
            constructor(options) {
                super();
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                this.recipientKey = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _recipientKey_initializers, void 0));
                this.messageCount = (__runInitializers(this, _recipientKey_extraInitializers), __runInitializers(this, _messageCount_initializers, void 0));
                this.longestWaitedSeconds = (__runInitializers(this, _messageCount_extraInitializers), __runInitializers(this, _longestWaitedSeconds_initializers, void 0));
                this.newestReceivedTime = (__runInitializers(this, _longestWaitedSeconds_extraInitializers), __runInitializers(this, _newestReceivedTime_initializers, void 0));
                this.oldestReceivedTime = (__runInitializers(this, _newestReceivedTime_extraInitializers), __runInitializers(this, _oldestReceivedTime_initializers, void 0));
                this.totalBytes = (__runInitializers(this, _oldestReceivedTime_extraInitializers), __runInitializers(this, _totalBytes_initializers, void 0));
                this.liveDelivery = (__runInitializers(this, _totalBytes_extraInitializers), __runInitializers(this, _liveDelivery_initializers, void 0));
                __runInitializers(this, _liveDelivery_extraInitializers);
                if (options) {
                    this.id = options.id || this.generateId();
                    this.recipientKey = options.recipientKey;
                    this.messageCount = options.messageCount;
                    this.longestWaitedSeconds = options.longestWaitedSeconds;
                    this.newestReceivedTime = options.newestReceivedTime;
                    this.oldestReceivedTime = options.oldestReceivedTime;
                    this.totalBytes = options.totalBytes;
                    this.liveDelivery = options.liveDelivery;
                    this.setThread({
                        threadId: options.threadId,
                    });
                }
                this.setReturnRouting(TransportDecorator_1.ReturnRouteTypes.all);
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _type_decorators = [(0, messageType_1.IsValidMessageType)(V2StatusMessage.type)];
            _recipientKey_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)(), (0, class_transformer_1.Expose)({ name: 'recipient_key' })];
            _messageCount_decorators = [(0, class_validator_1.IsInt)(), (0, class_transformer_1.Expose)({ name: 'message_count' })];
            _longestWaitedSeconds_decorators = [(0, class_validator_1.IsInt)(), (0, class_validator_1.IsOptional)(), (0, class_transformer_1.Expose)({ name: 'longest_waited_seconds' })];
            _newestReceivedTime_decorators = [(0, class_transformer_1.Expose)({ name: 'newest_received_time' }), (0, class_transformer_1.Transform)(({ value }) => (0, transformers_1.DateParser)(value)), (0, class_validator_1.IsDate)(), (0, class_validator_1.IsOptional)()];
            _oldestReceivedTime_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Transform)(({ value }) => (0, transformers_1.DateParser)(value)), (0, class_validator_1.IsDate)(), (0, class_transformer_1.Expose)({ name: 'oldest_received_time' })];
            _totalBytes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)(), (0, class_transformer_1.Expose)({ name: 'total_bytes' })];
            _liveDelivery_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)(), (0, class_transformer_1.Expose)({ name: 'live_delivery' })];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _recipientKey_decorators, { kind: "field", name: "recipientKey", static: false, private: false, access: { has: obj => "recipientKey" in obj, get: obj => obj.recipientKey, set: (obj, value) => { obj.recipientKey = value; } }, metadata: _metadata }, _recipientKey_initializers, _recipientKey_extraInitializers);
            __esDecorate(null, null, _messageCount_decorators, { kind: "field", name: "messageCount", static: false, private: false, access: { has: obj => "messageCount" in obj, get: obj => obj.messageCount, set: (obj, value) => { obj.messageCount = value; } }, metadata: _metadata }, _messageCount_initializers, _messageCount_extraInitializers);
            __esDecorate(null, null, _longestWaitedSeconds_decorators, { kind: "field", name: "longestWaitedSeconds", static: false, private: false, access: { has: obj => "longestWaitedSeconds" in obj, get: obj => obj.longestWaitedSeconds, set: (obj, value) => { obj.longestWaitedSeconds = value; } }, metadata: _metadata }, _longestWaitedSeconds_initializers, _longestWaitedSeconds_extraInitializers);
            __esDecorate(null, null, _newestReceivedTime_decorators, { kind: "field", name: "newestReceivedTime", static: false, private: false, access: { has: obj => "newestReceivedTime" in obj, get: obj => obj.newestReceivedTime, set: (obj, value) => { obj.newestReceivedTime = value; } }, metadata: _metadata }, _newestReceivedTime_initializers, _newestReceivedTime_extraInitializers);
            __esDecorate(null, null, _oldestReceivedTime_decorators, { kind: "field", name: "oldestReceivedTime", static: false, private: false, access: { has: obj => "oldestReceivedTime" in obj, get: obj => obj.oldestReceivedTime, set: (obj, value) => { obj.oldestReceivedTime = value; } }, metadata: _metadata }, _oldestReceivedTime_initializers, _oldestReceivedTime_extraInitializers);
            __esDecorate(null, null, _totalBytes_decorators, { kind: "field", name: "totalBytes", static: false, private: false, access: { has: obj => "totalBytes" in obj, get: obj => obj.totalBytes, set: (obj, value) => { obj.totalBytes = value; } }, metadata: _metadata }, _totalBytes_initializers, _totalBytes_extraInitializers);
            __esDecorate(null, null, _liveDelivery_decorators, { kind: "field", name: "liveDelivery", static: false, private: false, access: { has: obj => "liveDelivery" in obj, get: obj => obj.liveDelivery, set: (obj, value) => { obj.liveDelivery = value; } }, metadata: _metadata }, _liveDelivery_initializers, _liveDelivery_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, messageType_1.parseMessageType)('https://didcomm.org/messagepickup/2.0/status'),
        _a;
})();
exports.V2StatusMessage = V2StatusMessage;
