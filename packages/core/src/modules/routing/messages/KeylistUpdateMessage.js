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
exports.KeylistUpdateMessage = exports.KeylistUpdate = exports.KeylistUpdateAction = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const AgentMessage_1 = require("../../../agent/AgentMessage");
const messageType_1 = require("../../../utils/messageType");
var KeylistUpdateAction;
(function (KeylistUpdateAction) {
    KeylistUpdateAction["add"] = "add";
    KeylistUpdateAction["remove"] = "remove";
})(KeylistUpdateAction || (exports.KeylistUpdateAction = KeylistUpdateAction = {}));
let KeylistUpdate = (() => {
    var _a;
    let _recipientKey_decorators;
    let _recipientKey_initializers = [];
    let _recipientKey_extraInitializers = [];
    let _action_decorators;
    let _action_initializers = [];
    let _action_extraInitializers = [];
    return _a = class KeylistUpdate {
            constructor(options) {
                this.recipientKey = __runInitializers(this, _recipientKey_initializers, void 0);
                this.action = (__runInitializers(this, _recipientKey_extraInitializers), __runInitializers(this, _action_initializers, void 0));
                __runInitializers(this, _action_extraInitializers);
                if (options) {
                    this.recipientKey = options.recipientKey;
                    this.action = options.action;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _recipientKey_decorators = [(0, class_validator_1.IsString)(), (0, class_transformer_1.Expose)({ name: 'recipient_key' })];
            _action_decorators = [(0, class_validator_1.IsEnum)(KeylistUpdateAction)];
            __esDecorate(null, null, _recipientKey_decorators, { kind: "field", name: "recipientKey", static: false, private: false, access: { has: obj => "recipientKey" in obj, get: obj => obj.recipientKey, set: (obj, value) => { obj.recipientKey = value; } }, metadata: _metadata }, _recipientKey_initializers, _recipientKey_extraInitializers);
            __esDecorate(null, null, _action_decorators, { kind: "field", name: "action", static: false, private: false, access: { has: obj => "action" in obj, get: obj => obj.action, set: (obj, value) => { obj.action = value; } }, metadata: _metadata }, _action_initializers, _action_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.KeylistUpdate = KeylistUpdate;
/**
 * Used to notify the mediator of keys in use by the recipient.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0211-route-coordination/README.md#keylist-update
 */
let KeylistUpdateMessage = (() => {
    var _a;
    let _classSuper = AgentMessage_1.AgentMessage;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _updates_decorators;
    let _updates_initializers = [];
    let _updates_extraInitializers = [];
    return _a = class KeylistUpdateMessage extends _classSuper {
            constructor(options) {
                super();
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                this.updates = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _updates_initializers, void 0));
                __runInitializers(this, _updates_extraInitializers);
                if (options) {
                    this.id = options.id || this.generateId();
                    this.updates = options.updates;
                }
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _type_decorators = [(0, messageType_1.IsValidMessageType)(KeylistUpdateMessage.type)];
            _updates_decorators = [(0, class_transformer_1.Type)(() => KeylistUpdate), (0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)(), (0, class_validator_1.IsInstance)(KeylistUpdate, { each: true })];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _updates_decorators, { kind: "field", name: "updates", static: false, private: false, access: { has: obj => "updates" in obj, get: obj => obj.updates, set: (obj, value) => { obj.updates = value; } }, metadata: _metadata }, _updates_initializers, _updates_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, messageType_1.parseMessageType)('https://didcomm.org/coordinate-mediation/1.0/keylist-update'),
        _a;
})();
exports.KeylistUpdateMessage = KeylistUpdateMessage;
