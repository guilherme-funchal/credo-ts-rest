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
exports.W3cJsonLdVerifiablePresentation = void 0;
const utils_1 = require("../../../../utils");
const models_1 = require("../../models");
const W3cPresentation_1 = require("../../models/presentation/W3cPresentation");
const LinkedDataProof_1 = require("./LinkedDataProof");
let W3cJsonLdVerifiablePresentation = (() => {
    var _a;
    let _classSuper = W3cPresentation_1.W3cPresentation;
    let _proof_decorators;
    let _proof_initializers = [];
    let _proof_extraInitializers = [];
    return _a = class W3cJsonLdVerifiablePresentation extends _classSuper {
            constructor(options) {
                super(options);
                this.proof = __runInitializers(this, _proof_initializers, void 0);
                __runInitializers(this, _proof_extraInitializers);
                if (options) {
                    this.proof = new LinkedDataProof_1.LinkedDataProof(options.proof);
                }
            }
            get proofTypes() {
                var _b;
                const proofArray = (_b = (0, utils_1.asArray)(this.proof)) !== null && _b !== void 0 ? _b : [];
                return proofArray.map((proof) => proof.type);
            }
            toJson() {
                return utils_1.JsonTransformer.toJSON(this);
            }
            /**
             * The {@link ClaimFormat} of the presentation. For JSON-LD credentials this is always `ldp_vp`.
             */
            get claimFormat() {
                return models_1.ClaimFormat.LdpVp;
            }
            /**
             * Get the encoded variant of the W3C Verifiable Presentation. For JSON-LD presentations this is
             * a JSON object.
             */
            get encoded() {
                return this.toJson();
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _proof_decorators = [(0, LinkedDataProof_1.LinkedDataProofTransformer)(), (0, utils_1.IsInstanceOrArrayOfInstances)({ classType: LinkedDataProof_1.LinkedDataProof })];
            __esDecorate(null, null, _proof_decorators, { kind: "field", name: "proof", static: false, private: false, access: { has: obj => "proof" in obj, get: obj => obj.proof, set: (obj, value) => { obj.proof = value; } }, metadata: _metadata }, _proof_initializers, _proof_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.W3cJsonLdVerifiablePresentation = W3cJsonLdVerifiablePresentation;
