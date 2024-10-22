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
exports.DidRecord = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const BaseRecord_1 = require("../../../storage/BaseRecord");
const uuid_1 = require("../../../utils/uuid");
const domain_1 = require("../domain");
const DidDocumentRole_1 = require("../domain/DidDocumentRole");
const parse_1 = require("../domain/parse");
const didRecordMetadataTypes_1 = require("./didRecordMetadataTypes");
let DidRecord = (() => {
    var _a;
    let _classSuper = BaseRecord_1.BaseRecord;
    let _didDocument_decorators;
    let _didDocument_initializers = [];
    let _didDocument_extraInitializers = [];
    let _role_decorators;
    let _role_initializers = [];
    let _role_extraInitializers = [];
    return _a = class DidRecord extends _classSuper {
            constructor(props) {
                var _b, _c, _d;
                super();
                this.didDocument = __runInitializers(this, _didDocument_initializers, void 0);
                this.did = __runInitializers(this, _didDocument_extraInitializers);
                this.role = __runInitializers(this, _role_initializers, void 0);
                this.type = (__runInitializers(this, _role_extraInitializers), _a.type);
                if (props) {
                    this.id = (_b = props.id) !== null && _b !== void 0 ? _b : (0, uuid_1.uuid)();
                    this.did = props.did;
                    this.role = props.role;
                    this.didDocument = props.didDocument;
                    this.createdAt = (_c = props.createdAt) !== null && _c !== void 0 ? _c : new Date();
                    this._tags = (_d = props.tags) !== null && _d !== void 0 ? _d : {};
                }
            }
            getTags() {
                const did = (0, parse_1.parseDid)(this.did);
                const legacyDid = this.metadata.get(didRecordMetadataTypes_1.DidRecordMetadataKeys.LegacyDid);
                return Object.assign(Object.assign({}, this._tags), { role: this.role, method: did.method, legacyUnqualifiedDid: legacyDid === null || legacyDid === void 0 ? void 0 : legacyDid.unqualifiedDid, did: this.did, methodSpecificIdentifier: did.id });
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _didDocument_decorators = [(0, class_transformer_1.Type)(() => domain_1.DidDocument), (0, class_validator_1.ValidateNested)()];
            _role_decorators = [(0, class_validator_1.IsEnum)(DidDocumentRole_1.DidDocumentRole)];
            __esDecorate(null, null, _didDocument_decorators, { kind: "field", name: "didDocument", static: false, private: false, access: { has: obj => "didDocument" in obj, get: obj => obj.didDocument, set: (obj, value) => { obj.didDocument = value; } }, metadata: _metadata }, _didDocument_initializers, _didDocument_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: obj => "role" in obj, get: obj => obj.role, set: (obj, value) => { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = 'DidRecord',
        _a;
})();
exports.DidRecord = DidRecord;
