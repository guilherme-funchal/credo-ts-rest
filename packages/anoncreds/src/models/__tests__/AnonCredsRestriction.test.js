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
const core_1 = require("@aries-framework/core");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const AnonCredsRestriction_1 = require("../AnonCredsRestriction");
// We need to add the transformer class to the wrapper
let Wrapper = (() => {
    var _a;
    let _restrictions_decorators;
    let _restrictions_initializers = [];
    let _restrictions_extraInitializers = [];
    return _a = class Wrapper {
            constructor(options) {
                this.restrictions = __runInitializers(this, _restrictions_initializers, void 0);
                __runInitializers(this, _restrictions_extraInitializers);
                if (options) {
                    this.restrictions = options.restrictions;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _restrictions_decorators = [(0, class_transformer_1.Type)(() => AnonCredsRestriction_1.AnonCredsRestriction), (0, class_validator_1.IsArray)(), (0, AnonCredsRestriction_1.AnonCredsRestrictionTransformer)()];
            __esDecorate(null, null, _restrictions_decorators, { kind: "field", name: "restrictions", static: false, private: false, access: { has: obj => "restrictions" in obj, get: obj => obj.restrictions, set: (obj, value) => { obj.restrictions = value; } }, metadata: _metadata }, _restrictions_initializers, _restrictions_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
describe('AnonCredsRestriction', () => {
    test('parses attribute values and markers', () => {
        const anonCredsRestrictions = core_1.JsonTransformer.fromJSON({
            restrictions: [
                {
                    'attr::test_prop::value': 'test_value',
                    'attr::test_prop2::value': 'test_value2',
                    'attr::test_prop::marker': '1',
                    'attr::test_prop2::marker': '1',
                },
            ],
        }, Wrapper);
        expect(anonCredsRestrictions).toEqual({
            restrictions: [
                {
                    attributeValues: {
                        test_prop: 'test_value',
                        test_prop2: 'test_value2',
                    },
                    attributeMarkers: {
                        test_prop: true,
                        test_prop2: true,
                    },
                },
            ],
        });
    });
    test('transforms attributeValues and attributeMarkers to json', () => {
        const restrictions = new Wrapper({
            restrictions: [
                new AnonCredsRestriction_1.AnonCredsRestriction({
                    attributeMarkers: {
                        test_prop: true,
                        test_prop2: true,
                    },
                    attributeValues: {
                        test_prop: 'test_value',
                        test_prop2: 'test_value2',
                    },
                }),
            ],
        });
        expect(core_1.JsonTransformer.toJSON(restrictions)).toMatchObject({
            restrictions: [
                {
                    'attr::test_prop::value': 'test_value',
                    'attr::test_prop2::value': 'test_value2',
                    'attr::test_prop::marker': '1',
                    'attr::test_prop2::marker': '1',
                },
            ],
        });
    });
    test('transforms properties from and to json with correct casing', () => {
        const restrictions = new Wrapper({
            restrictions: [
                new AnonCredsRestriction_1.AnonCredsRestriction({
                    credentialDefinitionId: 'credentialDefinitionId',
                    issuerDid: 'issuerDid',
                    issuerId: 'issuerId',
                    schemaName: 'schemaName',
                    schemaVersion: 'schemaVersion',
                    schemaId: 'schemaId',
                    schemaIssuerDid: 'schemaIssuerDid',
                    schemaIssuerId: 'schemaIssuerId',
                }),
            ],
        });
        expect(core_1.JsonTransformer.toJSON(restrictions)).toMatchObject({
            restrictions: [
                {
                    cred_def_id: 'credentialDefinitionId',
                    issuer_did: 'issuerDid',
                    issuer_id: 'issuerId',
                    schema_name: 'schemaName',
                    schema_version: 'schemaVersion',
                    schema_id: 'schemaId',
                    schema_issuer_did: 'schemaIssuerDid',
                    schema_issuer_id: 'schemaIssuerId',
                },
            ],
        });
        expect(core_1.JsonTransformer.fromJSON({
            restrictions: [
                {
                    cred_def_id: 'credentialDefinitionId',
                    issuer_did: 'issuerDid',
                    issuer_id: 'issuerId',
                    schema_name: 'schemaName',
                    schema_version: 'schemaVersion',
                    schema_id: 'schemaId',
                    schema_issuer_did: 'schemaIssuerDid',
                    schema_issuer_id: 'schemaIssuerId',
                },
            ],
        }, Wrapper)).toMatchObject({
            restrictions: [
                {
                    credentialDefinitionId: 'credentialDefinitionId',
                    issuerDid: 'issuerDid',
                    issuerId: 'issuerId',
                    schemaName: 'schemaName',
                    schemaVersion: 'schemaVersion',
                    schemaId: 'schemaId',
                    schemaIssuerDid: 'schemaIssuerDid',
                    schemaIssuerId: 'schemaIssuerId',
                },
            ],
        });
    });
});
