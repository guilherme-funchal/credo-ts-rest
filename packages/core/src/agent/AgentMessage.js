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
exports.AgentMessage = void 0;
const class_transformer_1 = require("class-transformer");
const AckDecoratorExtension_1 = require("../decorators/ack/AckDecoratorExtension");
const AttachmentExtension_1 = require("../decorators/attachment/AttachmentExtension");
const L10nDecoratorExtension_1 = require("../decorators/l10n/L10nDecoratorExtension");
const ServiceDecoratorExtension_1 = require("../decorators/service/ServiceDecoratorExtension");
const ThreadDecoratorExtension_1 = require("../decorators/thread/ThreadDecoratorExtension");
const TimingDecoratorExtension_1 = require("../decorators/timing/TimingDecoratorExtension");
const TransportDecoratorExtension_1 = require("../decorators/transport/TransportDecoratorExtension");
const JsonTransformer_1 = require("../utils/JsonTransformer");
const messageType_1 = require("../utils/messageType");
const BaseMessage_1 = require("./BaseMessage");
const Decorated = (0, ThreadDecoratorExtension_1.ThreadDecorated)((0, L10nDecoratorExtension_1.L10nDecorated)((0, TransportDecoratorExtension_1.TransportDecorated)((0, TimingDecoratorExtension_1.TimingDecorated)((0, AckDecoratorExtension_1.AckDecorated)((0, AttachmentExtension_1.AttachmentDecorated)((0, ServiceDecoratorExtension_1.ServiceDecorated)(BaseMessage_1.BaseMessage)))))));
let AgentMessage = (() => {
    var _a;
    let _classSuper = Decorated;
    let _allowDidSovPrefix_decorators;
    let _allowDidSovPrefix_initializers = [];
    let _allowDidSovPrefix_extraInitializers = [];
    return _a = class AgentMessage extends _classSuper {
            toJSON({ useDidSovPrefixWhereAllowed } = {}) {
                const json = JsonTransformer_1.JsonTransformer.toJSON(this);
                // If we have `useDidSovPrefixWhereAllowed` enabled, we want to replace the new https://didcomm.org prefix with the legacy did:sov prefix.
                // However, we only do this if the protocol RFC was initially written with the did:sov message type prefix
                // See https://github.com/hyperledger/aries-rfcs/blob/main/features/0348-transition-msg-type-to-https/README.md
                if (this.allowDidSovPrefix && useDidSovPrefixWhereAllowed) {
                    (0, messageType_1.replaceNewDidCommPrefixWithLegacyDidSovOnMessage)(json);
                }
                return json;
            }
            is(Class) {
                return this.type === Class.type.messageTypeUri;
            }
            constructor() {
                super(...arguments);
                /**
                 * Whether the protocol RFC was initially written using the legacy did:prefix instead of the
                 * new https://didcomm.org message type prefix.
                 *
                 * @see https://github.com/hyperledger/aries-rfcs/blob/main/features/0348-transition-msg-type-to-https/README.md
                 */
                this.allowDidSovPrefix = __runInitializers(this, _allowDidSovPrefix_initializers, false);
                __runInitializers(this, _allowDidSovPrefix_extraInitializers);
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _allowDidSovPrefix_decorators = [(0, class_transformer_1.Exclude)()];
            __esDecorate(null, null, _allowDidSovPrefix_decorators, { kind: "field", name: "allowDidSovPrefix", static: false, private: false, access: { has: obj => "allowDidSovPrefix" in obj, get: obj => obj.allowDidSovPrefix, set: (obj, value) => { obj.allowDidSovPrefix = value; } }, metadata: _metadata }, _allowDidSovPrefix_initializers, _allowDidSovPrefix_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.AgentMessage = AgentMessage;
