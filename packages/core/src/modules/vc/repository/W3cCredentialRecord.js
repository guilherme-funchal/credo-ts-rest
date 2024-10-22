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
exports.W3cCredentialRecord = void 0;
const BaseRecord_1 = require("../../../storage/BaseRecord");
const utils_1 = require("../../../utils");
const uuid_1 = require("../../../utils/uuid");
const models_1 = require("../models");
let W3cCredentialRecord = (() => {
    var _a;
    let _classSuper = BaseRecord_1.BaseRecord;
    let _credential_decorators;
    let _credential_initializers = [];
    let _credential_extraInitializers = [];
    return _a = class W3cCredentialRecord extends _classSuper {
            constructor(props) {
                var _b, _c;
                super();
                this.type = _a.type;
                this.credential = __runInitializers(this, _credential_initializers, void 0);
                __runInitializers(this, _credential_extraInitializers);
                if (props) {
                    this.id = (_b = props.id) !== null && _b !== void 0 ? _b : (0, uuid_1.uuid)();
                    this.createdAt = (_c = props.createdAt) !== null && _c !== void 0 ? _c : new Date();
                    this._tags = props.tags;
                    this.credential = props.credential;
                }
            }
            getTags() {
                // Contexts are usually strings, but can sometimes be objects. We're unable to use objects as tags,
                // so we filter out the objects before setting the tags.
                const stringContexts = this.credential.contexts.filter((ctx) => typeof ctx === 'string');
                const tags = Object.assign(Object.assign({}, this._tags), { issuerId: this.credential.issuerId, subjectIds: this.credential.credentialSubjectIds, schemaIds: this.credential.credentialSchemaIds, contexts: stringContexts, givenId: this.credential.id, claimFormat: this.credential.claimFormat });
                // Proof types is used for ldp_vc credentials
                if (this.credential.claimFormat === models_1.ClaimFormat.LdpVc) {
                    tags.proofTypes = this.credential.proofTypes;
                }
                // Algs is used for jwt_vc credentials
                else if (this.credential.claimFormat === models_1.ClaimFormat.JwtVc) {
                    tags.algs = [this.credential.jwt.header.alg];
                }
                return tags;
            }
            /**
             * This overwrites the default clone method for records
             * as the W3cRecord has issues with the default clone method
             * due to how W3cJwtVerifiableCredential is implemented. This is
             * a temporary way to make sure the clone still works, but ideally
             * we find an alternative.
             */
            clone() {
                return utils_1.JsonTransformer.fromJSON(utils_1.JsonTransformer.toJSON(this), this.constructor);
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _credential_decorators = [(0, models_1.W3cVerifiableCredentialTransformer)()];
            __esDecorate(null, null, _credential_decorators, { kind: "field", name: "credential", static: false, private: false, access: { has: obj => "credential" in obj, get: obj => obj.credential, set: (obj, value) => { obj.credential = value; } }, metadata: _metadata }, _credential_initializers, _credential_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = 'W3cCredentialRecord',
        _a;
})();
exports.W3cCredentialRecord = W3cCredentialRecord;
