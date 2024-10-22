"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../../../utils");
const W3cCredential_1 = require("../W3cCredential");
const validCredential = {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
    id: 'http://example.edu/credentials/1872',
    type: ['VerifiableCredential', 'AlumniCredential'],
    issuer: 'https://example.edu/issuers/14',
    issuanceDate: '2010-01-01T19:23:24Z',
    credentialSubject: {
        id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
        alumniOf: {
            id: 'did:example:c276e12ec21ebfeb1f712ebc6f1',
            name: [
                {
                    value: 'Example University',
                    lang: 'en',
                },
            ],
        },
    },
    credentialSchema: {
        id: 'https://example.org/examples/degree.json',
        type: 'JsonSchemaValidator2018',
    },
};
describe('W3cCredential', () => {
    test('throws an error when verifiable credential context is missing or not the first entry', () => {
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { '@context': [] }), W3cCredential_1.W3cCredential)).toThrowError(/context must be an array of strings or objects, where the first item is the verifiable credential context URL./);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { '@context': ['https://www.w3.org/2018/credentials/examples/v1', 'https://www.w3.org/2018/credentials/v1'] }), W3cCredential_1.W3cCredential)).toThrowError(/context must be an array of strings or objects, where the first item is the verifiable credential context URL./);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { '@context': { some: 'property' } }), W3cCredential_1.W3cCredential)).toThrowError(/context must be an array of strings or objects, where the first item is the verifiable credential context URL./);
    });
    test('throws an error when id is present and it is not an uri', () => {
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { id: 'f8c7d9c9-3f9f-4d1d-9c0d-5b3b5d7b8f5c' }), W3cCredential_1.W3cCredential)).toThrowError(/id must be an URI/);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { id: 10 }), W3cCredential_1.W3cCredential)).toThrowError(/id must be an URI/);
    });
    test('throws an error when type is not an array of string or does not include VerifiableCredential', () => {
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { type: [] }), W3cCredential_1.W3cCredential)).toThrowError(/type must be an array of strings which includes "VerifiableCredential"/);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { type: ['AnotherType'] }), W3cCredential_1.W3cCredential)).toThrowError(/type must be an array of strings which includes "VerifiableCredential"/);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { type: { some: 'prop' } }), W3cCredential_1.W3cCredential)).toThrowError(/type must be an array of strings which includes "VerifiableCredential"/);
    });
    test('throws an error when issuer is not a valid uri or object with id', () => {
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { issuer: 'f8c7d9c9-3f9f-4d1d-9c0d-5b3b5d7b8f5c' }), W3cCredential_1.W3cCredential)).toThrowError(/issuer must be an URI or an object with an id property which is an URI/);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { issuer: { id: 'f8c7d9c9-3f9f-4d1d-9c0d-5b3b5d7b8f5c' } }), W3cCredential_1.W3cCredential)).toThrowError(/issuer must be an URI or an object with an id property which is an URI/);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { issuer: 10 }), W3cCredential_1.W3cCredential)).toThrowError(/issuer must be an URI or an object with an id property which is an URI/);
        // Valid cases
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { issuer: { id: 'urn:uri' } }), W3cCredential_1.W3cCredential)).not.toThrowError();
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { issuer: 'uri:uri' }), W3cCredential_1.W3cCredential)).not.toThrowError();
    });
    test('throws an error when issuanceDate is not a valid date', () => {
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { issuanceDate: '2020' }), W3cCredential_1.W3cCredential)).toThrowError(/property issuanceDate has failed the following constraints: issuanceDate must be RFC 3339 date/);
    });
    test('throws an error when expirationDate is present and it is not a valid date', () => {
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { expirationDate: '2020' }), W3cCredential_1.W3cCredential)).toThrowError(/property expirationDate has failed the following constraints: expirationDate must be RFC 3339 date/);
    });
    test('throws an error when credentialSchema is present and it is not a valid credentialSchema object/array', () => {
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { credentialSchema: {} }), W3cCredential_1.W3cCredential)).toThrowError(/property credentialSchema\./);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { credentialSchema: [{}] }), W3cCredential_1.W3cCredential)).toThrowError(/property credentialSchema\[0\]\./);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { credentialSchema: [{ id: 'some-random-value', type: 'valid' }] }), W3cCredential_1.W3cCredential)).toThrowError(/property credentialSchema\[0\]\.id has failed the following constraints/);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { credentialSchema: [validCredential.credentialSchema, validCredential.credentialSchema] }), W3cCredential_1.W3cCredential)).not.toThrowError();
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { credentialSchema: [] }), W3cCredential_1.W3cCredential)).not.toThrowError();
    });
    test('throws an error when credentialSubject is present and it is not a valid credentialSubject object/array', () => {
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { credentialSubject: [] }), W3cCredential_1.W3cCredential)).toThrowError(/credentialSubject has failed the following constraints: credentialSubject value must be an instance of, or an array of instances containing W3cCredentialSubject/);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { credentialSubject: [
                {
                    id: 'some-random-value',
                },
            ] }), W3cCredential_1.W3cCredential)).toThrowError(/property credentialSubject\[0\]\.id has failed the following constraints: id must be an URI/);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validCredential), { credentialSubject: [
                {
                    id: 'urn:uri',
                },
            ] }), W3cCredential_1.W3cCredential)).not.toThrowError();
    });
    it('should transform from JSON to a class instance and back', () => {
        const credential = utils_1.JsonTransformer.fromJSON(validCredential, W3cCredential_1.W3cCredential);
        expect(credential).toBeInstanceOf(W3cCredential_1.W3cCredential);
        const transformedJson = utils_1.JsonTransformer.toJSON(credential);
        expect(transformedJson).toEqual(validCredential);
    });
});
