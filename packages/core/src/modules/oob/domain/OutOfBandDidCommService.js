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
exports.OutOfBandDidCommService = void 0;
const class_validator_1 = require("class-validator");
const utils_1 = require("../../../utils");
const dids_1 = require("../../dids");
let OutOfBandDidCommService = (() => {
    var _a;
    let _classSuper = dids_1.DidDocumentService;
    let _recipientKeys_decorators;
    let _recipientKeys_initializers = [];
    let _recipientKeys_extraInitializers = [];
    let _routingKeys_decorators;
    let _routingKeys_initializers = [];
    let _routingKeys_extraInitializers = [];
    let _accept_decorators;
    let _accept_initializers = [];
    let _accept_extraInitializers = [];
    return _a = class OutOfBandDidCommService extends _classSuper {
            constructor(options) {
                super(Object.assign(Object.assign({}, options), { type: _a.type }));
                this.recipientKeys = __runInitializers(this, _recipientKeys_initializers, void 0);
                this.routingKeys = (__runInitializers(this, _recipientKeys_extraInitializers), __runInitializers(this, _routingKeys_initializers, void 0));
                this.accept = (__runInitializers(this, _routingKeys_extraInitializers), __runInitializers(this, _accept_initializers, void 0));
                __runInitializers(this, _accept_extraInitializers);
                if (options) {
                    this.recipientKeys = options.recipientKeys;
                    this.routingKeys = options.routingKeys;
                    this.accept = options.accept;
                }
            }
            get resolvedDidCommService() {
                var _b, _c;
                return {
                    id: this.id,
                    recipientKeys: this.recipientKeys.map((didKey) => dids_1.DidKey.fromDid(didKey).key),
                    routingKeys: (_c = (_b = this.routingKeys) === null || _b === void 0 ? void 0 : _b.map((didKey) => dids_1.DidKey.fromDid(didKey).key)) !== null && _c !== void 0 ? _c : [],
                    serviceEndpoint: this.serviceEndpoint,
                };
            }
            static fromResolvedDidCommService(service) {
                return new _a({
                    id: service.id,
                    recipientKeys: service.recipientKeys.map((key) => new dids_1.DidKey(key).did),
                    routingKeys: service.routingKeys.map((key) => new dids_1.DidKey(key).did),
                    serviceEndpoint: service.serviceEndpoint,
                });
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _recipientKeys_decorators = [(0, class_validator_1.ArrayNotEmpty)(), IsDidKeyString({ each: true })];
            _routingKeys_decorators = [IsDidKeyString({ each: true }), (0, class_validator_1.IsOptional)()];
            _accept_decorators = [(0, class_validator_1.IsString)({ each: true }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _recipientKeys_decorators, { kind: "field", name: "recipientKeys", static: false, private: false, access: { has: obj => "recipientKeys" in obj, get: obj => obj.recipientKeys, set: (obj, value) => { obj.recipientKeys = value; } }, metadata: _metadata }, _recipientKeys_initializers, _recipientKeys_extraInitializers);
            __esDecorate(null, null, _routingKeys_decorators, { kind: "field", name: "routingKeys", static: false, private: false, access: { has: obj => "routingKeys" in obj, get: obj => obj.routingKeys, set: (obj, value) => { obj.routingKeys = value; } }, metadata: _metadata }, _routingKeys_initializers, _routingKeys_extraInitializers);
            __esDecorate(null, null, _accept_decorators, { kind: "field", name: "accept", static: false, private: false, access: { has: obj => "accept" in obj, get: obj => obj.accept, set: (obj, value) => { obj.accept = value; } }, metadata: _metadata }, _accept_initializers, _accept_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = 'did-communication',
        _a;
})();
exports.OutOfBandDidCommService = OutOfBandDidCommService;
/**
 * Checks if a given value is a did:key did string
 */
function IsDidKeyString(validationOptions) {
    return (0, class_validator_1.ValidateBy)({
        name: 'isDidKeyString',
        validator: {
            validate: (value) => (0, class_validator_1.isString)(value) && (0, utils_1.isDid)(value, 'key'),
            defaultMessage: (0, class_validator_1.buildMessage)((eachPrefix) => eachPrefix + '$property must be a did:key string', validationOptions),
        },
    }, validationOptions);
}
