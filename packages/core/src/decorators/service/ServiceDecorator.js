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
exports.ServiceDecorator = void 0;
const class_validator_1 = require("class-validator");
const helpers_1 = require("../../modules/dids/helpers");
const uuid_1 = require("../../utils/uuid");
/**
 * Represents `~service` decorator
 *
 * Based on specification Aries RFC 0056: Service Decorator
 * @see https://github.com/hyperledger/aries-rfcs/tree/master/features/0056-service-decorator
 */
let ServiceDecorator = (() => {
    var _a;
    let _recipientKeys_decorators;
    let _recipientKeys_initializers = [];
    let _recipientKeys_extraInitializers = [];
    let _routingKeys_decorators;
    let _routingKeys_initializers = [];
    let _routingKeys_extraInitializers = [];
    let _serviceEndpoint_decorators;
    let _serviceEndpoint_initializers = [];
    let _serviceEndpoint_extraInitializers = [];
    return _a = class ServiceDecorator {
            constructor(options) {
                this.recipientKeys = __runInitializers(this, _recipientKeys_initializers, void 0);
                this.routingKeys = (__runInitializers(this, _recipientKeys_extraInitializers), __runInitializers(this, _routingKeys_initializers, void 0));
                this.serviceEndpoint = (__runInitializers(this, _routingKeys_extraInitializers), __runInitializers(this, _serviceEndpoint_initializers, void 0));
                __runInitializers(this, _serviceEndpoint_extraInitializers);
                if (options) {
                    this.recipientKeys = options.recipientKeys;
                    this.routingKeys = options.routingKeys;
                    this.serviceEndpoint = options.serviceEndpoint;
                }
            }
            get resolvedDidCommService() {
                var _b, _c;
                return {
                    id: (0, uuid_1.uuid)(),
                    recipientKeys: this.recipientKeys.map(helpers_1.verkeyToInstanceOfKey),
                    routingKeys: (_c = (_b = this.routingKeys) === null || _b === void 0 ? void 0 : _b.map(helpers_1.verkeyToInstanceOfKey)) !== null && _c !== void 0 ? _c : [],
                    serviceEndpoint: this.serviceEndpoint,
                };
            }
            static fromResolvedDidCommService(service) {
                return new _a({
                    recipientKeys: service.recipientKeys.map((k) => k.publicKeyBase58),
                    routingKeys: service.routingKeys.map((k) => k.publicKeyBase58),
                    serviceEndpoint: service.serviceEndpoint,
                });
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _recipientKeys_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _routingKeys_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true }), (0, class_validator_1.IsOptional)()];
            _serviceEndpoint_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _recipientKeys_decorators, { kind: "field", name: "recipientKeys", static: false, private: false, access: { has: obj => "recipientKeys" in obj, get: obj => obj.recipientKeys, set: (obj, value) => { obj.recipientKeys = value; } }, metadata: _metadata }, _recipientKeys_initializers, _recipientKeys_extraInitializers);
            __esDecorate(null, null, _routingKeys_decorators, { kind: "field", name: "routingKeys", static: false, private: false, access: { has: obj => "routingKeys" in obj, get: obj => obj.routingKeys, set: (obj, value) => { obj.routingKeys = value; } }, metadata: _metadata }, _routingKeys_initializers, _routingKeys_extraInitializers);
            __esDecorate(null, null, _serviceEndpoint_decorators, { kind: "field", name: "serviceEndpoint", static: false, private: false, access: { has: obj => "serviceEndpoint" in obj, get: obj => obj.serviceEndpoint, set: (obj, value) => { obj.serviceEndpoint = value; } }, metadata: _metadata }, _serviceEndpoint_initializers, _serviceEndpoint_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.ServiceDecorator = ServiceDecorator;
