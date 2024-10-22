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
exports.DidDoc = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const service_1 = require("../../../dids/domain/service");
const authentication_1 = require("./authentication");
const publicKey_1 = require("./publicKey");
let DidDoc = (() => {
    var _a;
    let _context_decorators;
    let _context_initializers = [];
    let _context_extraInitializers = [];
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _publicKey_decorators;
    let _publicKey_initializers = [];
    let _publicKey_extraInitializers = [];
    let _service_decorators;
    let _service_initializers = [];
    let _service_extraInitializers = [];
    let _authentication_decorators;
    let _authentication_initializers = [];
    let _authentication_extraInitializers = [];
    return _a = class DidDoc {
            constructor(options) {
                this.context = __runInitializers(this, _context_initializers, 'https://w3id.org/did/v1');
                this.id = (__runInitializers(this, _context_extraInitializers), __runInitializers(this, _id_initializers, void 0));
                this.publicKey = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _publicKey_initializers, []));
                this.service = (__runInitializers(this, _publicKey_extraInitializers), __runInitializers(this, _service_initializers, []));
                this.authentication = (__runInitializers(this, _service_extraInitializers), __runInitializers(this, _authentication_initializers, []));
                __runInitializers(this, _authentication_extraInitializers);
                if (options) {
                    this.id = options.id;
                    this.publicKey = options.publicKey;
                    this.service = options.service;
                    this.authentication = options.authentication;
                }
            }
            /**
             * Gets the matching public key for a given key id
             *
             * @param id fully qualified key id
             */
            getPublicKey(id) {
                return this.publicKey.find((item) => item.id === id);
            }
            /**
             * Returns all of the service endpoints matching the given type.
             *
             * @param type The type of service(s) to query.
             */
            getServicesByType(type) {
                return this.service.filter((service) => service.type === type);
            }
            /**
             * Returns all of the service endpoints matching the given class
             *
             * @param classType The class to query services.
             */
            getServicesByClassType(classType) {
                return this.service.filter((service) => service instanceof classType);
            }
            /**
             * Get all DIDComm services ordered by priority descending. This means the highest
             * priority will be the first entry.
             */
            get didCommServices() {
                const didCommServiceTypes = [service_1.IndyAgentService.type, service_1.DidCommV1Service.type];
                const services = this.service.filter((service) => didCommServiceTypes.includes(service.type));
                // Sort services based on indicated priority
                return services.sort((a, b) => a.priority - b.priority);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _context_decorators = [(0, class_transformer_1.Expose)({ name: '@context' }), (0, class_validator_1.Equals)('https://w3id.org/did/v1')];
            _id_decorators = [(0, class_validator_1.IsString)()];
            _publicKey_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)(), (0, publicKey_1.PublicKeyTransformer)()];
            _service_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)(), (0, service_1.ServiceTransformer)()];
            _authentication_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)(), (0, authentication_1.AuthenticationTransformer)()];
            __esDecorate(null, null, _context_decorators, { kind: "field", name: "context", static: false, private: false, access: { has: obj => "context" in obj, get: obj => obj.context, set: (obj, value) => { obj.context = value; } }, metadata: _metadata }, _context_initializers, _context_extraInitializers);
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _publicKey_decorators, { kind: "field", name: "publicKey", static: false, private: false, access: { has: obj => "publicKey" in obj, get: obj => obj.publicKey, set: (obj, value) => { obj.publicKey = value; } }, metadata: _metadata }, _publicKey_initializers, _publicKey_extraInitializers);
            __esDecorate(null, null, _service_decorators, { kind: "field", name: "service", static: false, private: false, access: { has: obj => "service" in obj, get: obj => obj.service, set: (obj, value) => { obj.service = value; } }, metadata: _metadata }, _service_initializers, _service_extraInitializers);
            __esDecorate(null, null, _authentication_decorators, { kind: "field", name: "authentication", static: false, private: false, access: { has: obj => "authentication" in obj, get: obj => obj.authentication, set: (obj, value) => { obj.authentication = value; } }, metadata: _metadata }, _authentication_initializers, _authentication_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.DidDoc = DidDoc;
