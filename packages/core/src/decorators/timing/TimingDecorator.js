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
exports.TimingDecorator = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
/**
 * Represents `~timing` decorator
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0032-message-timing/README.md
 */
let TimingDecorator = (() => {
    var _a;
    let _inTime_decorators;
    let _inTime_initializers = [];
    let _inTime_extraInitializers = [];
    let _outTime_decorators;
    let _outTime_initializers = [];
    let _outTime_extraInitializers = [];
    let _staleTime_decorators;
    let _staleTime_initializers = [];
    let _staleTime_extraInitializers = [];
    let _expiresTime_decorators;
    let _expiresTime_initializers = [];
    let _expiresTime_extraInitializers = [];
    let _delayMilli_decorators;
    let _delayMilli_initializers = [];
    let _delayMilli_extraInitializers = [];
    let _waitUntilTime_decorators;
    let _waitUntilTime_initializers = [];
    let _waitUntilTime_extraInitializers = [];
    return _a = class TimingDecorator {
            constructor(partial) {
                /**
                 * The timestamp when the preceding message in this thread (the one that elicited this message as a response) was received.
                 * Or, on a dynamically composed forward message, the timestamp when an upstream relay first received the message it's now asking to be forwarded.
                 */
                this.inTime = __runInitializers(this, _inTime_initializers, void 0);
                /**
                 * The timestamp when the message was emitted. At least millisecond precision is preferred, though second precision is acceptable.
                 */
                this.outTime = (__runInitializers(this, _inTime_extraInitializers), __runInitializers(this, _outTime_initializers, void 0));
                /**
                 * Ideally, the decorated message should be processed by the the specified timestamp. After that, the message may become irrelevant or less meaningful than intended.
                 * This is a hint only.
                 */
                this.staleTime = (__runInitializers(this, _outTime_extraInitializers), __runInitializers(this, _staleTime_initializers, void 0));
                /**
                 * The decorated message should be considered invalid or expired if encountered after the specified timestamp.
                 * This is a much stronger claim than the one for `stale_time`; it says that the receiver should cancel attempts to process it once the deadline is past,
                 * because the sender won't stand behind it any longer. While processing of the received message should stop,
                 * the thread of the message should be retained as the sender may send an updated/replacement message.
                 * In the case that the sender does not follow up, the policy of the receiver agent related to abandoned threads would presumably be used to eventually delete the thread.
                 */
                this.expiresTime = (__runInitializers(this, _staleTime_extraInitializers), __runInitializers(this, _expiresTime_initializers, void 0));
                /**
                 * Wait at least this many milliseconds before processing the message. This may be useful to defeat temporal correlation.
                 * It is recommended that agents supporting this field should not honor requests for delays longer than 10 minutes (600,000 milliseconds).
                 */
                this.delayMilli = (__runInitializers(this, _expiresTime_extraInitializers), __runInitializers(this, _delayMilli_initializers, void 0));
                /**
                 * Wait until this time before processing the message.
                 */
                this.waitUntilTime = (__runInitializers(this, _delayMilli_extraInitializers), __runInitializers(this, _waitUntilTime_initializers, void 0));
                __runInitializers(this, _waitUntilTime_extraInitializers);
                this.inTime = partial === null || partial === void 0 ? void 0 : partial.inTime;
                this.outTime = partial === null || partial === void 0 ? void 0 : partial.outTime;
                this.staleTime = partial === null || partial === void 0 ? void 0 : partial.staleTime;
                this.expiresTime = partial === null || partial === void 0 ? void 0 : partial.expiresTime;
                this.delayMilli = partial === null || partial === void 0 ? void 0 : partial.delayMilli;
                this.waitUntilTime = partial === null || partial === void 0 ? void 0 : partial.waitUntilTime;
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _inTime_decorators = [(0, class_transformer_1.Expose)({ name: 'in_time' }), (0, class_transformer_1.Type)(() => Date), (0, class_validator_1.IsDate)(), (0, class_validator_1.IsOptional)()];
            _outTime_decorators = [(0, class_transformer_1.Expose)({ name: 'out_time' }), (0, class_transformer_1.Type)(() => Date), (0, class_validator_1.IsDate)(), (0, class_validator_1.IsOptional)()];
            _staleTime_decorators = [(0, class_transformer_1.Expose)({ name: 'stale_time' }), (0, class_transformer_1.Type)(() => Date), (0, class_validator_1.IsDate)(), (0, class_validator_1.IsOptional)()];
            _expiresTime_decorators = [(0, class_transformer_1.Expose)({ name: 'expires_time' }), (0, class_transformer_1.Type)(() => Date), (0, class_validator_1.IsDate)(), (0, class_validator_1.IsOptional)()];
            _delayMilli_decorators = [(0, class_transformer_1.Expose)({ name: 'delay_milli' }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _waitUntilTime_decorators = [(0, class_transformer_1.Expose)({ name: 'wait_until_time' }), (0, class_transformer_1.Type)(() => Date), (0, class_validator_1.IsDate)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _inTime_decorators, { kind: "field", name: "inTime", static: false, private: false, access: { has: obj => "inTime" in obj, get: obj => obj.inTime, set: (obj, value) => { obj.inTime = value; } }, metadata: _metadata }, _inTime_initializers, _inTime_extraInitializers);
            __esDecorate(null, null, _outTime_decorators, { kind: "field", name: "outTime", static: false, private: false, access: { has: obj => "outTime" in obj, get: obj => obj.outTime, set: (obj, value) => { obj.outTime = value; } }, metadata: _metadata }, _outTime_initializers, _outTime_extraInitializers);
            __esDecorate(null, null, _staleTime_decorators, { kind: "field", name: "staleTime", static: false, private: false, access: { has: obj => "staleTime" in obj, get: obj => obj.staleTime, set: (obj, value) => { obj.staleTime = value; } }, metadata: _metadata }, _staleTime_initializers, _staleTime_extraInitializers);
            __esDecorate(null, null, _expiresTime_decorators, { kind: "field", name: "expiresTime", static: false, private: false, access: { has: obj => "expiresTime" in obj, get: obj => obj.expiresTime, set: (obj, value) => { obj.expiresTime = value; } }, metadata: _metadata }, _expiresTime_initializers, _expiresTime_extraInitializers);
            __esDecorate(null, null, _delayMilli_decorators, { kind: "field", name: "delayMilli", static: false, private: false, access: { has: obj => "delayMilli" in obj, get: obj => obj.delayMilli, set: (obj, value) => { obj.delayMilli = value; } }, metadata: _metadata }, _delayMilli_initializers, _delayMilli_extraInitializers);
            __esDecorate(null, null, _waitUntilTime_decorators, { kind: "field", name: "waitUntilTime", static: false, private: false, access: { has: obj => "waitUntilTime" in obj, get: obj => obj.waitUntilTime, set: (obj, value) => { obj.waitUntilTime = value; } }, metadata: _metadata }, _waitUntilTime_initializers, _waitUntilTime_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.TimingDecorator = TimingDecorator;
