"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testAnonCredsCredentialDefinition = exports.testAnonCredsSchema = void 0;
exports.testAnonCredsSchema = {
    schemaId: 'schema:gSl0JkGIcmRif593Q6XYGsJndHGOzm1jWRFa-Lwrz9o',
    schema: {
        issuerId: 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
        name: 'test',
        version: '1.0',
        attrNames: ['prop1', 'prop2'],
    },
};
exports.testAnonCredsCredentialDefinition = {
    credentialDefinitionId: 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL/credential-definition',
    credentialDefinition: {
        issuerId: 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
        schemaId: '9999',
        type: 'CL',
        tag: 'latest',
        value: {
            primary: {
                n: 'x',
                s: 'x',
                r: {
                    master_secret: 'x',
                    name: 'x',
                    title: 'x',
                },
                rctxt: 'x',
                z: 'x',
            },
        },
    },
};
