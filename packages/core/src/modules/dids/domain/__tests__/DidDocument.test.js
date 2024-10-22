"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ClassValidationError_1 = require("../../../../error/ClassValidationError");
const JsonTransformer_1 = require("../../../../utils/JsonTransformer");
const didExample123_json_1 = __importDefault(require("../../__tests__/__fixtures__/didExample123.json"));
const didExample456Invalid_json_1 = __importDefault(require("../../__tests__/__fixtures__/didExample456Invalid.json"));
const DidDocument_1 = require("../DidDocument");
const service_1 = require("../service");
const verificationMethod_1 = require("../verificationMethod");
const didDocumentInstance = new DidDocument_1.DidDocument({
    id: 'did:example:123',
    alsoKnownAs: ['did:example:456'],
    controller: ['did:example:456'],
    verificationMethod: [
        new verificationMethod_1.VerificationMethod({
            id: 'did:example:123#key-1',
            type: 'RsaVerificationKey2018',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyPem: '-----BEGIN PUBLIC X...',
        }),
        new verificationMethod_1.VerificationMethod({
            id: 'did:example:123#key-2',
            type: 'Ed25519VerificationKey2018',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyBase58: '-----BEGIN PUBLIC 9...',
        }),
        new verificationMethod_1.VerificationMethod({
            id: 'did:example:123#key-3',
            type: 'Secp256k1VerificationKey2018',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyHex: '-----BEGIN PUBLIC A...',
        }),
    ],
    service: [
        new service_1.DidDocumentService({
            id: 'did:example:123#service-1',
            type: 'Mediator',
            serviceEndpoint: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h',
        }),
        new service_1.IndyAgentService({
            id: 'did:example:123#service-2',
            serviceEndpoint: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h',
            recipientKeys: ['Q4zqM7aXqm7gDQkUVLng9h'],
            routingKeys: ['Q4zqM7aXqm7gDQkUVLng9h'],
            priority: 5,
        }),
        new service_1.DidCommV1Service({
            id: 'did:example:123#service-3',
            serviceEndpoint: 'https://agent.com/did-comm',
            recipientKeys: ['DADEajsDSaksLng9h'],
            routingKeys: ['DADEajsDSaksLng9h'],
            priority: 10,
        }),
    ],
    authentication: [
        'did:example:123#key-1',
        new verificationMethod_1.VerificationMethod({
            id: 'did:example:123#authentication-1',
            type: 'RsaVerificationKey2018',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyPem: '-----BEGIN PUBLIC A...',
        }),
    ],
    assertionMethod: [
        'did:example:123#key-1',
        new verificationMethod_1.VerificationMethod({
            id: 'did:example:123#assertionMethod-1',
            type: 'RsaVerificationKey2018',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyPem: '-----BEGIN PUBLIC A...',
        }),
    ],
    capabilityDelegation: [
        'did:example:123#key-1',
        new verificationMethod_1.VerificationMethod({
            id: 'did:example:123#capabilityDelegation-1',
            type: 'RsaVerificationKey2018',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyPem: '-----BEGIN PUBLIC A...',
        }),
    ],
    capabilityInvocation: [
        'did:example:123#key-1',
        new verificationMethod_1.VerificationMethod({
            id: 'did:example:123#capabilityInvocation-1',
            type: 'RsaVerificationKey2018',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyPem: '-----BEGIN PUBLIC A...',
        }),
    ],
    keyAgreement: [
        'did:example:123#key-1',
        new verificationMethod_1.VerificationMethod({
            id: 'did:example:123#keyAgreement-1',
            type: 'RsaVerificationKey2018',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyPem: '-----BEGIN PUBLIC A...',
        }),
        new verificationMethod_1.VerificationMethod({
            id: 'did:example:123#keyAgreement-1',
            type: 'Ed25519VerificationKey2018',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyPem: '-----BEGIN PUBLIC A...',
        }),
    ],
});
describe('Did | DidDocument', () => {
    it('should correctly transforms Json to DidDocument class', () => {
        var _a, _b, _c, _d, _e, _f, _g;
        const didDocument = JsonTransformer_1.JsonTransformer.fromJSON(didExample123_json_1.default, DidDocument_1.DidDocument);
        // Check other properties
        expect(didDocument.id).toBe(didExample123_json_1.default.id);
        expect(didDocument.alsoKnownAs).toEqual(didExample123_json_1.default.alsoKnownAs);
        expect(didDocument.context).toEqual(didExample123_json_1.default['@context']);
        expect(didDocument.controller).toEqual(didExample123_json_1.default.controller);
        // Check verification method
        const verificationMethods = (_a = didDocument.verificationMethod) !== null && _a !== void 0 ? _a : [];
        expect(verificationMethods[0]).toBeInstanceOf(verificationMethod_1.VerificationMethod);
        expect(verificationMethods[1]).toBeInstanceOf(verificationMethod_1.VerificationMethod);
        expect(verificationMethods[2]).toBeInstanceOf(verificationMethod_1.VerificationMethod);
        // Check Service
        const services = (_b = didDocument.service) !== null && _b !== void 0 ? _b : [];
        expect(services[0]).toBeInstanceOf(service_1.DidDocumentService);
        expect(services[1]).toBeInstanceOf(service_1.IndyAgentService);
        expect(services[2]).toBeInstanceOf(service_1.DidCommV1Service);
        // Check Authentication
        const authentication = (_c = didDocument.authentication) !== null && _c !== void 0 ? _c : [];
        expect(typeof authentication[0]).toBe('string');
        expect(authentication[1]).toBeInstanceOf(verificationMethod_1.VerificationMethod);
        // Check assertionMethod
        const assertionMethod = (_d = didDocument.assertionMethod) !== null && _d !== void 0 ? _d : [];
        expect(typeof assertionMethod[0]).toBe('string');
        expect(assertionMethod[1]).toBeInstanceOf(verificationMethod_1.VerificationMethod);
        // Check capabilityDelegation
        const capabilityDelegation = (_e = didDocument.capabilityDelegation) !== null && _e !== void 0 ? _e : [];
        expect(typeof capabilityDelegation[0]).toBe('string');
        expect(capabilityDelegation[1]).toBeInstanceOf(verificationMethod_1.VerificationMethod);
        // Check capabilityInvocation
        const capabilityInvocation = (_f = didDocument.capabilityInvocation) !== null && _f !== void 0 ? _f : [];
        expect(typeof capabilityInvocation[0]).toBe('string');
        expect(capabilityInvocation[1]).toBeInstanceOf(verificationMethod_1.VerificationMethod);
        // Check keyAgreement
        const keyAgreement = (_g = didDocument.keyAgreement) !== null && _g !== void 0 ? _g : [];
        expect(typeof keyAgreement[0]).toBe('string');
        expect(keyAgreement[1]).toBeInstanceOf(verificationMethod_1.VerificationMethod);
    });
    it('validation should throw an error if the did document is invalid', () => {
        try {
            JsonTransformer_1.JsonTransformer.fromJSON(didExample456Invalid_json_1.default, DidDocument_1.DidDocument);
        }
        catch (error) {
            expect(error).toBeInstanceOf(ClassValidationError_1.ClassValidationError);
            expect(error.message).toMatch(/property type has failed the following constraints: type must be a string/);
            expect(error.validationErrors).toMatchObject([
                {
                    children: [],
                    constraints: {
                        isString: 'type must be a string',
                    },
                    property: 'type',
                    target: {
                        controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
                        id: 'did:example:123#assertionMethod-1',
                        publicKeyPem: '-----BEGIN PUBLIC A...',
                    },
                    value: undefined,
                },
            ]);
        }
    });
    it('should correctly transforms DidDoc class to Json', () => {
        const didDocumentJson = JsonTransformer_1.JsonTransformer.toJSON(didDocumentInstance);
        expect(didDocumentJson).toMatchObject(didExample123_json_1.default);
    });
    describe('getServicesByType', () => {
        it('returns all services with specified type', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            expect(didDocumentInstance.getServicesByType('IndyAgent')).toEqual((_a = didDocumentInstance.service) === null || _a === void 0 ? void 0 : _a.filter((service) => service.type === 'IndyAgent'));
        }));
    });
    describe('getServicesByClassType', () => {
        it('returns all services with specified class', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            expect(didDocumentInstance.getServicesByClassType(service_1.IndyAgentService)).toEqual((_a = didDocumentInstance.service) === null || _a === void 0 ? void 0 : _a.filter((service) => service instanceof service_1.IndyAgentService));
        }));
    });
    describe('didCommServices', () => {
        it('returns all IndyAgentService and DidCommService instances', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const services = (_a = didDocumentInstance.service) !== null && _a !== void 0 ? _a : [];
            expect(didDocumentInstance.didCommServices).toEqual(expect.arrayContaining([services[1], services[2]]));
        }));
        it('returns all IndyAgentService and DidCommService instances sorted by priority', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const services = (_a = didDocumentInstance.service) !== null && _a !== void 0 ? _a : [];
            expect(didDocumentInstance.didCommServices).toEqual([services[1], services[2]]);
        }));
    });
    describe('findVerificationMethodByKeyType', () => {
        it('return first verification method that match key type', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(yield (0, DidDocument_1.findVerificationMethodByKeyType)('Ed25519VerificationKey2018', didDocumentInstance)).toBeInstanceOf(verificationMethod_1.VerificationMethod);
        }));
    });
});
