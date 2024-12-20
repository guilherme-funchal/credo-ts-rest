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
exports.V1DiscloseMessage = exports.DiscloseProtocol = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const AgentMessage_1 = require("../../../../../agent/AgentMessage");
const messageType_1 = require("../../../../../utils/messageType");
let DiscloseProtocol = (() => {
    var _a;
    let _protocolId_decorators;
    let _protocolId_initializers = [];
    let _protocolId_extraInitializers = [];
    let _roles_decorators;
    let _roles_initializers = [];
    let _roles_extraInitializers = [];
    return _a = class DiscloseProtocol {
            constructor(options) {
                this.protocolId = __runInitializers(this, _protocolId_initializers, void 0);
                this.roles = (__runInitializers(this, _protocolId_extraInitializers), __runInitializers(this, _roles_initializers, void 0));
                __runInitializers(this, _roles_extraInitializers);
                if (options) {
                    this.protocolId = options.protocolId;
                    this.roles = options.roles;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _protocolId_decorators = [(0, class_transformer_1.Expose)({ name: 'pid' }), (0, class_validator_1.IsString)()];
            _roles_decorators = [(0, class_validator_1.IsString)({ each: true }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _protocolId_decorators, { kind: "field", name: "protocolId", static: false, private: false, access: { has: obj => "protocolId" in obj, get: obj => obj.protocolId, set: (obj, value) => { obj.protocolId = value; } }, metadata: _metadata }, _protocolId_initializers, _protocolId_extraInitializers);
            __esDecorate(null, null, _roles_decorators, { kind: "field", name: "roles", static: false, private: false, access: { has: obj => "roles" in obj, get: obj => obj.roles, set: (obj, value) => { obj.roles = value; } }, metadata: _metadata }, _roles_initializers, _roles_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.DiscloseProtocol = DiscloseProtocol;
let V1DiscloseMessage = (() => {
    var _a;
    let _classSuper = AgentMessage_1.AgentMessage;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _protocols_decorators;
    let _protocols_initializers = [];
    let _protocols_extraInitializers = [];
    return _a = class V1DiscloseMessage extends _classSuper {
            constructor(options) {
                var _b;
                super();
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                this.protocols = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _protocols_initializers, void 0));
                __runInitializers(this, _protocols_extraInitializers);
                if (options) {
                    this.id = (_b = options.id) !== null && _b !== void 0 ? _b : this.generateId();
                    this.protocols = options.protocols.map((p) => new DiscloseProtocol(p));
                    this.setThread({
                        threadId: options.threadId,
                    });
                }
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _type_decorators = [(0, messageType_1.IsValidMessageType)(V1DiscloseMessage.type)];
            _protocols_decorators = [(0, class_validator_1.IsInstance)(DiscloseProtocol, { each: true }), (0, class_transformer_1.Type)(() => DiscloseProtocol)];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _protocols_decorators, { kind: "field", name: "protocols", static: false, private: false, access: { has: obj => "protocols" in obj, get: obj => obj.protocols, set: (obj, value) => { obj.protocols = value; } }, metadata: _metadata }, _protocols_initializers, _protocols_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, messageType_1.parseMessageType)('https://didcomm.org/discover-features/1.0/disclose'),
        _a;
})();
exports.V1DiscloseMessage = V1DiscloseMessage;
