"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../../../utils");
const W3cPresentation_1 = require("../W3cPresentation");
const jsonLdCredential = {
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
    proof: {
        type: 'RsaSignature2018',
        verificationMethod: 'did:example:123#5',
        created: '2017-06-18T21:19:10Z',
        proofPurpose: 'assertionMethod',
    },
};
const jwtCredential = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRpZDpleGFtcGxlOmFiZmUxM2Y3MTIxMjA0MzFjMjc2ZTEyZWNhYiNrZXlzLTEifQ.eyJzdWIiOiJkaWQ6ZXhhbXBsZTplYmZlYjFmNzEyZWJjNmYxYzI3NmUxMmVjMjEiLCJqdGkiOiJodHRwOi8vZXhhbXBsZS5lZHUvY3JlZGVudGlhbHMvMzczMiIsImlzcyI6Imh0dHBzOi8vZXhhbXBsZS5jb20va2V5cy9mb28uandrIiwibmJmIjoxNTQxNDkzNzI0LCJpYXQiOjE1NDE0OTM3MjQsImV4cCI6MTU3MzAyOTcyMywibm9uY2UiOiI2NjAhNjM0NUZTZXIiLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL2V4YW1wbGVzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJVbml2ZXJzaXR5RGVncmVlQ3JlZGVudGlhbCJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJkZWdyZWUiOnsidHlwZSI6IkJhY2hlbG9yRGVncmVlIiwibmFtZSI6IjxzcGFuIGxhbmc9J2ZyLUNBJz5CYWNjYWxhdXLDqWF0IGVuIG11c2lxdWVzIG51bcOpcmlxdWVzPC9zcGFuPiJ9fX19.KLJo5GAyBND3LDTn9H7FQokEsUEi8jKwXhGvoN3JtRa51xrNDgXDb0cq1UTYB-rK4Ft9YVmR1NI_ZOF8oGc_7wAp8PHbF2HaWodQIoOBxxT-4WNqAxft7ET6lkH-4S6Ux3rSGAmczMohEEf8eCeN-jC8WekdPl6zKZQj0YPB1rx6X0-xlFBs7cl6Wt8rfBP_tZ9YgVWrQmUWypSioc0MUyiphmyEbLZagTyPlUyflGlEdqrZAv6eSe6RtxJy6M1-lD7a5HTzanYTWBPAUHDZGyGKXdJw-W_x0IWChBzI8t3kpG253fg6V3tPgHeKXE94fz_QpYfg--7kLsyBAfQGbg';
const validPresentation = {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
    type: ['VerifiablePresentation'],
    id: 'http://example.edu/credentials/1872',
    verifiableCredential: [jsonLdCredential, jwtCredential],
};
describe('W3cPresentation', () => {
    test('throws an error when verifiable credential context is missing or not the first entry', () => {
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validPresentation), { '@context': [] }), W3cPresentation_1.W3cPresentation)).toThrowError(/context must be an array of strings or objects, where the first item is the verifiable credential context URL./);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validPresentation), { '@context': ['https://www.w3.org/2018/credentials/examples/v1', 'https://www.w3.org/2018/credentials/v1'] }), W3cPresentation_1.W3cPresentation)).toThrowError(/context must be an array of strings or objects, where the first item is the verifiable credential context URL./);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validPresentation), { '@context': { some: 'property' } }), W3cPresentation_1.W3cPresentation)).toThrowError(/context must be an array of strings or objects, where the first item is the verifiable credential context URL./);
    });
    test('throws an error when id is present and it is not an uri', () => {
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validPresentation), { id: 'f8c7d9c9-3f9f-4d1d-9c0d-5b3b5d7b8f5c' }), W3cPresentation_1.W3cPresentation)).toThrowError(/id must be an URI/);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validPresentation), { id: 10 }), W3cPresentation_1.W3cPresentation)).toThrowError(/id must be an URI/);
    });
    test('throws an error when type is not an array of string or does not include VerifiablePresentation', () => {
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validPresentation), { type: [] }), W3cPresentation_1.W3cPresentation)).toThrowError(/type must be an array of strings which includes "VerifiablePresentation"/);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validPresentation), { type: ['AnotherType'] }), W3cPresentation_1.W3cPresentation)).toThrowError(/type must be an array of strings which includes "VerifiablePresentation"/);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validPresentation), { type: { some: 'prop' } }), W3cPresentation_1.W3cPresentation)).toThrowError(/type must be an array of strings which includes "VerifiablePresentation"/);
    });
    test('throws an error when holder is present and it is not an uri', () => {
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validPresentation), { holder: 'f8c7d9c9-3f9f-4d1d-9c0d-5b3b5d7b8f5c' }), W3cPresentation_1.W3cPresentation)).toThrowError(/holder must be an URI/);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validPresentation), { holder: 10 }), W3cPresentation_1.W3cPresentation)).toThrowError(/holder must be an URI/);
    });
    test('throws an error when verifiableCredential is not a credential or an array of credentials', () => {
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validPresentation), { verifiableCredential: undefined }), W3cPresentation_1.W3cPresentation)).toThrowError(/verifiableCredential value must be an instance of, or an array of instances containing W3cJsonLdVerifiableCredential, W3cJwtVerifiableCredential/);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validPresentation), { verifiableCredential: [] }), W3cPresentation_1.W3cPresentation)).toThrowError(/verifiableCredential value must be an instance of, or an array of instances containing W3cJsonLdVerifiableCredential, W3cJwtVerifiableCredential/);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validPresentation), { verifiableCredential: [{ random: 'prop' }] }), W3cPresentation_1.W3cPresentation)).toThrowError(/property verifiableCredential\[0\]\./);
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validPresentation), { verifiableCredential: ['ey.incorrect.jwt'] }), W3cPresentation_1.W3cPresentation)).toThrowError(/value 'ey.incorrect.jwt' is not a valid W3cJwtVerifiableCredential. Invalid JWT. Unexpected end of JSON input/);
        // Deeply nested property missing
        expect(() => utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, validPresentation), { verifiableCredential: [
                Object.assign(Object.assign({}, jsonLdCredential), { proof: Object.assign(Object.assign({}, jsonLdCredential.proof), { verificationMethod: undefined }) }),
            ] }), W3cPresentation_1.W3cPresentation)).toThrowError(/property verifiableCredential\[0\]\.proof\.verificationMethod has failed the following constraints: verificationMethod must be a string/);
    });
    it('should transform from JSON to a class instance and back', () => {
        const presentation = utils_1.JsonTransformer.fromJSON(validPresentation, W3cPresentation_1.W3cPresentation);
        expect(presentation).toBeInstanceOf(W3cPresentation_1.W3cPresentation);
        const transformedJson = utils_1.JsonTransformer.toJSON(presentation);
        expect(transformedJson).toEqual(validPresentation);
    });
});
