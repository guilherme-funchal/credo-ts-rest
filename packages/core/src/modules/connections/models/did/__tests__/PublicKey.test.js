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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const publicKey_1 = require("../publicKey");
const publicKeysJson = [
    {
        class: publicKey_1.RsaSig2018,
        valueKey: 'publicKeyPem',
        json: {
            id: '3',
            type: 'RsaVerificationKey2018',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyPem: '-----BEGIN PUBLIC X...',
        },
    },
    {
        class: publicKey_1.Ed25119Sig2018,
        valueKey: 'publicKeyBase58',
        json: {
            id: '4',
            type: 'Ed25519VerificationKey2018',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyBase58: '-----BEGIN PUBLIC X...',
        },
    },
    {
        class: publicKey_1.EddsaSaSigSecp256k1,
        valueKey: 'publicKeyHex',
        json: {
            id: 'did:sov:LjgpST2rjsoxYegQDRm7EL#5',
            type: 'Secp256k1VerificationKey2018',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyHex: '-----BEGIN PUBLIC X...',
        },
    },
];
describe('Did | PublicKey', () => {
    it('should correctly transform Json to PublicKey class', () => __awaiter(void 0, void 0, void 0, function* () {
        const json = {
            id: 'did:sov:LjgpST2rjsoxYegQDRm7EL#5',
            type: 'RandomType',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
        };
        const service = (0, class_transformer_1.plainToInstance)(publicKey_1.PublicKey, json);
        expect(service.id).toBe(json.id);
        expect(service.type).toBe(json.type);
        expect(service.controller).toBe(json.controller);
    }));
    it('should correctly transform PublicKey class to Json', () => __awaiter(void 0, void 0, void 0, function* () {
        const json = {
            id: 'did:sov:LjgpST2rjsoxYegQDRm7EL#5',
            type: 'RandomType',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
        };
        const publicKey = new publicKey_1.PublicKey(Object.assign({}, json));
        const transformed = (0, class_transformer_1.instanceToPlain)(publicKey);
        expect(transformed).toEqual(json);
    }));
    const publicKeyJsonToClassTests = publicKeysJson.map((pk) => [pk.class.name, pk.class, pk.json, pk.valueKey]);
    test.each(publicKeyJsonToClassTests)('should correctly transform Json to %s class', (_, publicKeyClass, json, valueKey) => __awaiter(void 0, void 0, void 0, function* () {
        const publicKey = (0, class_transformer_1.plainToInstance)(publicKeyClass, json);
        expect(publicKey.id).toBe(json.id);
        expect(publicKey.type).toBe(json.type);
        expect(publicKey.controller).toBe(json.controller);
        expect(publicKey.value).toBe(json[valueKey]);
    }));
    const publicKeyClassToJsonTests = 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publicKeysJson.map((pk) => [pk.class.name, new pk.class(Object.assign({}, pk.json)), pk.json, pk.valueKey]);
    test.each(publicKeyClassToJsonTests)('should correctly transform %s class to Json', (_, publicKey, json, valueKey) => __awaiter(void 0, void 0, void 0, function* () {
        const publicKeyJson = (0, class_transformer_1.instanceToPlain)(publicKey);
        expect(publicKey.value).toBe(json[valueKey]);
        expect(publicKeyJson).toMatchObject(json);
    }));
    describe('PublicKeyTransformer', () => {
        let PublicKeyTransformerTest = (() => {
            var _a;
            let _publicKey_decorators;
            let _publicKey_initializers = [];
            let _publicKey_extraInitializers = [];
            return _a = class PublicKeyTransformerTest {
                    constructor() {
                        this.publicKey = __runInitializers(this, _publicKey_initializers, []);
                        __runInitializers(this, _publicKey_extraInitializers);
                    }
                },
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _publicKey_decorators = [(0, publicKey_1.PublicKeyTransformer)()];
                    __esDecorate(null, null, _publicKey_decorators, { kind: "field", name: "publicKey", static: false, private: false, access: { has: obj => "publicKey" in obj, get: obj => obj.publicKey, set: (obj, value) => { obj.publicKey = value; } }, metadata: _metadata }, _publicKey_initializers, _publicKey_extraInitializers);
                    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })(),
                _a;
        })();
        it("should transform Json to default PublicKey class when the 'type' key is not present in 'publicKeyTypes'", () => __awaiter(void 0, void 0, void 0, function* () {
            const publicKeyJson = {
                id: '3',
                type: 'RsaVerificationKey2018--unknown',
                controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
                publicKeyPem: '-----BEGIN PUBLIC X...',
            };
            const publicKeyWrapperJson = {
                publicKey: [publicKeyJson],
            };
            const publicKeyWrapper = (0, class_transformer_1.plainToInstance)(PublicKeyTransformerTest, publicKeyWrapperJson);
            expect(publicKeyWrapper.publicKey.length).toBe(1);
            const firstPublicKey = publicKeyWrapper.publicKey[0];
            expect(firstPublicKey).toBeInstanceOf(publicKey_1.PublicKey);
            expect(firstPublicKey.id).toBe(publicKeyJson.id);
            expect(firstPublicKey.type).toBe(publicKeyJson.type);
            expect(firstPublicKey.controller).toBe(publicKeyJson.controller);
            expect(firstPublicKey.value).toBeUndefined();
        }));
        it("should transform Json to corresponding class when the 'type' key is present in 'publicKeyTypes'", () => __awaiter(void 0, void 0, void 0, function* () {
            const publicKeyArray = publicKeysJson.map((pk) => pk.json);
            const publicKeyWrapperJson = {
                publicKey: publicKeyArray,
            };
            const publicKeyWrapper = (0, class_transformer_1.plainToInstance)(PublicKeyTransformerTest, publicKeyWrapperJson);
            expect(publicKeyWrapper.publicKey.length).toBe(publicKeyArray.length);
            for (let i = 0; i < publicKeyArray.length; i++) {
                const publicKeyJson = publicKeyArray[i];
                const publicKey = publicKeyWrapper.publicKey[i];
                expect(publicKey).toBeInstanceOf(publicKey_1.publicKeyTypes[publicKeyJson.type]);
            }
        }));
    });
});
