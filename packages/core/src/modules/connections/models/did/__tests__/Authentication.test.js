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
const authentication_1 = require("../authentication");
const publicKey_1 = require("../publicKey");
describe('Did | Authentication', () => {
    describe('EmbeddedAuthentication', () => {
        it('should correctly transform ReferencedAuthentication class to Json', () => __awaiter(void 0, void 0, void 0, function* () {
            const publicKey = new publicKey_1.RsaSig2018({
                controller: 'test',
                publicKeyPem: 'test',
                id: 'test#1',
            });
            const referencedAuthentication = new authentication_1.ReferencedAuthentication(publicKey, 'RsaSignatureAuthentication2018');
            const transformed = (0, class_transformer_1.instanceToPlain)(referencedAuthentication);
            expect(transformed).toMatchObject({
                type: 'RsaSignatureAuthentication2018',
                publicKey: 'test#1',
            });
        }));
    });
    describe('AuthenticationTransformer', () => {
        let AuthenticationTransformerTest = (() => {
            var _a;
            let _authentication_decorators;
            let _authentication_initializers = [];
            let _authentication_extraInitializers = [];
            return _a = class AuthenticationTransformerTest {
                    constructor() {
                        this.publicKey = [];
                        this.authentication = __runInitializers(this, _authentication_initializers, []);
                        __runInitializers(this, _authentication_extraInitializers);
                    }
                },
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _authentication_decorators = [(0, authentication_1.AuthenticationTransformer)()];
                    __esDecorate(null, null, _authentication_decorators, { kind: "field", name: "authentication", static: false, private: false, access: { has: obj => "authentication" in obj, get: obj => obj.authentication, set: (obj, value) => { obj.authentication = value; } }, metadata: _metadata }, _authentication_initializers, _authentication_extraInitializers);
                    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })(),
                _a;
        })();
        it("should use generic 'publicKey' type when no matching public key type class is present", () => __awaiter(void 0, void 0, void 0, function* () {
            const embeddedAuthenticationJson = {
                controller: 'did:sov:1123123',
                id: 'did:sov:1123123#1',
                type: 'RandomType',
                publicKeyPem: '-----BEGIN PUBLIC X...',
            };
            const referencedAuthenticationJson = {
                type: 'RandomType',
                publicKey: 'did:sov:1123123#1',
            };
            const authenticationWrapperJson = {
                publicKey: [embeddedAuthenticationJson],
                authentication: [referencedAuthenticationJson, embeddedAuthenticationJson],
            };
            const authenticationWrapper = (0, class_transformer_1.plainToInstance)(AuthenticationTransformerTest, authenticationWrapperJson);
            expect(authenticationWrapper.authentication.length).toBe(2);
            const [referencedAuthentication, embeddedAuthentication] = authenticationWrapper.authentication;
            expect(referencedAuthentication.publicKey).toBeInstanceOf(publicKey_1.PublicKey);
            expect(embeddedAuthentication.publicKey).toBeInstanceOf(publicKey_1.PublicKey);
        }));
        it("should transform Json to ReferencedAuthentication class when the 'publicKey' key is present on the authentication object", () => __awaiter(void 0, void 0, void 0, function* () {
            const publicKeyJson = {
                controller: 'did:sov:1123123',
                id: 'did:sov:1123123#1',
                type: 'RsaVerificationKey2018',
                publicKeyPem: '-----BEGIN PUBLIC X...',
            };
            const referencedAuthenticationJson = {
                type: 'RsaSignatureAuthentication2018',
                publicKey: 'did:sov:1123123#1',
            };
            const authenticationWrapperJson = {
                publicKey: [publicKeyJson],
                authentication: [referencedAuthenticationJson],
            };
            const authenticationWrapper = (0, class_transformer_1.plainToInstance)(AuthenticationTransformerTest, authenticationWrapperJson);
            expect(authenticationWrapper.authentication.length).toBe(1);
            const firstAuth = authenticationWrapper.authentication[0];
            expect(firstAuth).toBeInstanceOf(authentication_1.ReferencedAuthentication);
            expect(firstAuth.publicKey).toBeInstanceOf(publicKey_1.RsaSig2018);
            expect(firstAuth.type).toBe(referencedAuthenticationJson.type);
        }));
        it("should throw an error when the 'publicKey' is present, but no publicKey entry exists with the corresponding id", () => __awaiter(void 0, void 0, void 0, function* () {
            const referencedAuthenticationJson = {
                type: 'RsaVerificationKey2018',
                publicKey: 'did:sov:1123123#1',
            };
            const authenticationWrapperJson = {
                publicKey: [],
                authentication: [referencedAuthenticationJson],
            };
            expect(() => (0, class_transformer_1.plainToInstance)(AuthenticationTransformerTest, authenticationWrapperJson)).toThrowError(`Invalid public key referenced ${referencedAuthenticationJson.publicKey}`);
        }));
        it("should transform Json to EmbeddedAuthentication class when the 'publicKey' key is not present on the authentication object", () => __awaiter(void 0, void 0, void 0, function* () {
            const publicKeyJson = {
                controller: 'did:sov:1123123',
                id: 'did:sov:1123123#1',
                type: 'RsaVerificationKey2018',
                publicKeyPem: '-----BEGIN PUBLIC X...',
            };
            const authenticationWrapperJson = {
                authentication: [publicKeyJson],
            };
            const authenticationWrapper = (0, class_transformer_1.plainToInstance)(AuthenticationTransformerTest, authenticationWrapperJson);
            expect(authenticationWrapper.authentication.length).toBe(1);
            const firstAuth = authenticationWrapper.authentication[0];
            expect(firstAuth).toBeInstanceOf(authentication_1.EmbeddedAuthentication);
            expect(firstAuth.publicKey).toBeInstanceOf(publicKey_1.RsaSig2018);
            expect(firstAuth.publicKey.value).toBe(publicKeyJson.publicKeyPem);
        }));
        it('should transform EmbeddedAuthentication and ReferencedAuthentication class to Json', () => __awaiter(void 0, void 0, void 0, function* () {
            const authenticationWrapper = new AuthenticationTransformerTest();
            authenticationWrapper.authentication = [
                new authentication_1.EmbeddedAuthentication(new publicKey_1.RsaSig2018({
                    controller: 'test',
                    publicKeyPem: 'test',
                    id: 'test#1',
                })),
                new authentication_1.ReferencedAuthentication(new publicKey_1.RsaSig2018({
                    controller: 'test',
                    publicKeyPem: 'test',
                    id: 'test#1',
                }), 'RsaSignatureAuthentication2018'),
            ];
            expect(authenticationWrapper.authentication.length).toBe(2);
            const [embeddedJson, referencedJson] = (0, class_transformer_1.instanceToPlain)(authenticationWrapper).authentication;
            expect(embeddedJson).toMatchObject({
                controller: 'test',
                publicKeyPem: 'test',
                id: 'test#1',
                type: 'RsaVerificationKey2018',
            });
            expect(referencedJson).toMatchObject({
                type: 'RsaSignatureAuthentication2018',
                publicKey: 'test#1',
            });
        }));
    });
});
