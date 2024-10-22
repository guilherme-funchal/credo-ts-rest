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
exports.PushNotificationsFcmDeviceInfoMessage = void 0;
const core_1 = require("@credo-ts/core");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
/**
 * Message to send the fcm device information from another agent for push notifications
 * This is used as a response for the `get-device-info` message
 *
 * @see https://github.com/hyperledger/aries-rfcs/tree/main/features/0734-push-notifications-fcm#device-info
 */
let PushNotificationsFcmDeviceInfoMessage = (() => {
    var _a;
    let _classSuper = core_1.AgentMessage;
    let _deviceToken_decorators;
    let _deviceToken_initializers = [];
    let _deviceToken_extraInitializers = [];
    let _devicePlatform_decorators;
    let _devicePlatform_initializers = [];
    let _devicePlatform_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    return _a = class PushNotificationsFcmDeviceInfoMessage extends _classSuper {
            constructor(options) {
                var _b;
                super();
                this.deviceToken = __runInitializers(this, _deviceToken_initializers, void 0);
                this.devicePlatform = (__runInitializers(this, _deviceToken_extraInitializers), __runInitializers(this, _devicePlatform_initializers, void 0));
                this.type = (__runInitializers(this, _devicePlatform_extraInitializers), __runInitializers(this, _type_initializers, _a.type.messageTypeUri));
                __runInitializers(this, _type_extraInitializers);
                if (options) {
                    this.id = (_b = options.id) !== null && _b !== void 0 ? _b : this.generateId();
                    this.setThread({ threadId: options.threadId });
                    this.deviceToken = options.deviceToken;
                    this.devicePlatform = options.devicePlatform;
                }
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _deviceToken_decorators = [(0, class_transformer_1.Expose)({ name: 'device_token' }), (0, class_validator_1.IsString)(), (0, class_validator_1.ValidateIf)((object, value) => value !== null)];
            _devicePlatform_decorators = [(0, class_transformer_1.Expose)({ name: 'device_platform' }), (0, class_validator_1.IsString)(), (0, class_validator_1.ValidateIf)((object, value) => value !== null)];
            _type_decorators = [(0, core_1.IsValidMessageType)(PushNotificationsFcmDeviceInfoMessage.type)];
            __esDecorate(null, null, _deviceToken_decorators, { kind: "field", name: "deviceToken", static: false, private: false, access: { has: obj => "deviceToken" in obj, get: obj => obj.deviceToken, set: (obj, value) => { obj.deviceToken = value; } }, metadata: _metadata }, _deviceToken_initializers, _deviceToken_extraInitializers);
            __esDecorate(null, null, _devicePlatform_decorators, { kind: "field", name: "devicePlatform", static: false, private: false, access: { has: obj => "devicePlatform" in obj, get: obj => obj.devicePlatform, set: (obj, value) => { obj.devicePlatform = value; } }, metadata: _metadata }, _devicePlatform_initializers, _devicePlatform_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, core_1.parseMessageType)('https://didcomm.org/push-notifications-fcm/1.0/device-info'),
        _a;
})();
exports.PushNotificationsFcmDeviceInfoMessage = PushNotificationsFcmDeviceInfoMessage;
