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
const class_transformer_1 = require("class-transformer");
const dids_1 = require("../../../../dids");
const DidDoc_1 = require("../DidDoc");
const authentication_1 = require("../authentication");
const publicKey_1 = require("../publicKey");
const diddoc_json_1 = __importDefault(require("./diddoc.json"));
const didDoc = new DidDoc_1.DidDoc({
    authentication: [
        new authentication_1.ReferencedAuthentication(new publicKey_1.RsaSig2018({
            id: '3',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyPem: '-----BEGIN PUBLIC X...',
        }), 'RsaSignatureAuthentication2018'),
        new authentication_1.EmbeddedAuthentication(new publicKey_1.EddsaSaSigSecp256k1({
            id: '6',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyHex: '-----BEGIN PUBLIC A...',
        })),
    ],
    id: 'test-id',
    publicKey: [
        new publicKey_1.RsaSig2018({
            id: '3',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyPem: '-----BEGIN PUBLIC X...',
        }),
        new publicKey_1.Ed25119Sig2018({
            id: 'did:sov:LjgpST2rjsoxYegQDRm7EL#4',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyBase58: '-----BEGIN PUBLIC 9...',
        }),
        new publicKey_1.EddsaSaSigSecp256k1({
            id: '6',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyHex: '-----BEGIN PUBLIC A...',
        }),
    ],
    service: [
        new dids_1.DidDocumentService({
            id: '0',
            type: 'Mediator',
            serviceEndpoint: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h',
        }),
        new dids_1.IndyAgentService({
            id: '6',
            serviceEndpoint: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h',
            recipientKeys: ['Q4zqM7aXqm7gDQkUVLng9h'],
            routingKeys: ['Q4zqM7aXqm7gDQkUVLng9h'],
            priority: 5,
        }),
        new dids_1.DidCommV1Service({
            id: '7',
            serviceEndpoint: 'https://agent.com/did-comm',
            recipientKeys: ['DADEajsDSaksLng9h'],
            routingKeys: ['DADEajsDSaksLng9h'],
            priority: 10,
        }),
    ],
});
// Test adopted from ACA-Py
// TODO: add more tests
describe('Did | DidDoc', () => {
    it('should correctly transforms Json to DidDoc class', () => {
        const didDoc = (0, class_transformer_1.plainToInstance)(DidDoc_1.DidDoc, diddoc_json_1.default);
        // Check array length of all items
        expect(didDoc.publicKey.length).toBe(diddoc_json_1.default.publicKey.length);
        expect(didDoc.service.length).toBe(diddoc_json_1.default.service.length);
        expect(didDoc.authentication.length).toBe(diddoc_json_1.default.authentication.length);
        // Check other properties
        expect(didDoc.id).toBe(diddoc_json_1.default.id);
        expect(didDoc.context).toBe(diddoc_json_1.default['@context']);
        // Check publicKey
        expect(didDoc.publicKey[0]).toBeInstanceOf(publicKey_1.RsaSig2018);
        expect(didDoc.publicKey[1]).toBeInstanceOf(publicKey_1.Ed25119Sig2018);
        expect(didDoc.publicKey[2]).toBeInstanceOf(publicKey_1.EddsaSaSigSecp256k1);
        // Check Service
        expect(didDoc.service[0]).toBeInstanceOf(dids_1.DidDocumentService);
        expect(didDoc.service[1]).toBeInstanceOf(dids_1.IndyAgentService);
        expect(didDoc.service[2]).toBeInstanceOf(dids_1.DidCommV1Service);
        // Check Authentication
        expect(didDoc.authentication[0]).toBeInstanceOf(authentication_1.ReferencedAuthentication);
        expect(didDoc.authentication[1]).toBeInstanceOf(authentication_1.EmbeddedAuthentication);
    });
    it('should correctly transforms DidDoc class to Json', () => {
        const json = (0, class_transformer_1.instanceToPlain)(didDoc);
        // Check array length of all items
        expect(json.publicKey.length).toBe(didDoc.publicKey.length);
        expect(json.service.length).toBe(didDoc.service.length);
        expect(json.authentication.length).toBe(didDoc.authentication.length);
        // Check other properties
        expect(json.id).toBe(didDoc.id);
        expect(json['@context']).toBe(didDoc.context);
        // Check publicKey
        expect(json.publicKey[0]).toMatchObject({
            id: '3',
            type: 'RsaVerificationKey2018',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyPem: '-----BEGIN PUBLIC X...',
        });
        expect(json.publicKey[1]).toMatchObject({
            id: 'did:sov:LjgpST2rjsoxYegQDRm7EL#4',
            type: 'Ed25519VerificationKey2018',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyBase58: '-----BEGIN PUBLIC 9...',
        });
        expect(json.publicKey[2]).toMatchObject({
            id: '6',
            type: 'Secp256k1VerificationKey2018',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyHex: '-----BEGIN PUBLIC A...',
        });
        // Check Service
        expect(json.service[0]).toMatchObject({
            id: '0',
            type: 'Mediator',
            serviceEndpoint: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h',
        });
        expect(json.service[1]).toMatchObject({
            id: '6',
            type: 'IndyAgent',
            serviceEndpoint: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h',
            recipientKeys: ['Q4zqM7aXqm7gDQkUVLng9h'],
            routingKeys: ['Q4zqM7aXqm7gDQkUVLng9h'],
            priority: 5,
        });
        expect(json.service[2]).toMatchObject({
            id: '7',
            type: 'did-communication',
            serviceEndpoint: 'https://agent.com/did-comm',
            recipientKeys: ['DADEajsDSaksLng9h'],
            routingKeys: ['DADEajsDSaksLng9h'],
            priority: 10,
        });
        // Check Authentication
        expect(json.authentication[0]).toMatchObject({
            type: 'RsaSignatureAuthentication2018',
            publicKey: '3',
        });
        expect(json.authentication[1]).toMatchObject({
            id: '6',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: '-----BEGIN PUBLIC A...',
        });
    });
    describe('getPublicKey', () => {
        it('return the public key with the specified id', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(didDoc.getPublicKey('3')).toEqual(didDoc.publicKey.find((item) => item.id === '3'));
        }));
    });
    describe('getServicesByType', () => {
        it('returns all services with specified type', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(didDoc.getServicesByType('IndyAgent')).toEqual(didDoc.service.filter((service) => service.type === 'IndyAgent'));
        }));
    });
    describe('getServicesByClassType', () => {
        it('returns all services with specified class', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(didDoc.getServicesByClassType(dids_1.IndyAgentService)).toEqual(didDoc.service.filter((service) => service instanceof dids_1.IndyAgentService));
        }));
    });
    describe('didCommServices', () => {
        it('returns all IndyAgentService and DidCommService instances', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(didDoc.didCommServices).toEqual(expect.arrayContaining([didDoc.service[1], didDoc.service[2]]));
        }));
        it('returns all IndyAgentService and DidCommService instances sorted by priority', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(didDoc.didCommServices).toEqual([didDoc.service[1], didDoc.service[2]]);
        }));
    });
});
