"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transform_1 = require("../transform");
describe('transform', () => {
    it('anonCredsSchemaFromIndySdk should return a valid anoncreds schema', () => {
        const schema = {
            attrNames: ['hello'],
            id: 'TL1EaPFCZ8Si5aUrqScBDt:2:Example Schema:1.0.0',
            name: 'Example Schema',
            seqNo: 150,
            ver: '1.0',
            version: '1.0.0',
        };
        expect((0, transform_1.anonCredsSchemaFromIndySdk)(schema)).toEqual({
            attrNames: ['hello'],
            issuerId: 'TL1EaPFCZ8Si5aUrqScBDt',
            name: 'Example Schema',
            version: '1.0.0',
        });
    });
    it('indySdkSchemaFromAnonCreds should return a valid indy sdk schema', () => {
        const schemaId = 'TL1EaPFCZ8Si5aUrqScBDt:2:Example Schema:1.0.0';
        const schema = {
            attrNames: ['hello'],
            issuerId: 'TL1EaPFCZ8Si5aUrqScBDt',
            name: 'Example Schema',
            version: '1.0.0',
        };
        expect((0, transform_1.indySdkSchemaFromAnonCreds)(schemaId, schema, 150)).toEqual({
            attrNames: ['hello'],
            id: 'TL1EaPFCZ8Si5aUrqScBDt:2:Example Schema:1.0.0',
            name: 'Example Schema',
            seqNo: 150,
            ver: '1.0',
            version: '1.0.0',
        });
    });
    it('anonCredsCredentialDefinitionFromIndySdk should return a valid anoncreds credential definition', () => {
        const credDef = {
            id: 'TL1EaPFCZ8Si5aUrqScBDt:3:CL:420:someTag',
            schemaId: '8910:2:Example Schema:1.0.0',
            tag: 'someTag',
            type: 'CL',
            value: {
                primary: {
                    something: 'string',
                },
            },
            ver: '1.0',
        };
        expect((0, transform_1.anonCredsCredentialDefinitionFromIndySdk)(credDef)).toEqual({
            issuerId: 'TL1EaPFCZ8Si5aUrqScBDt',
            schemaId: '8910:2:Example Schema:1.0.0',
            tag: 'someTag',
            type: 'CL',
            value: {
                primary: {
                    something: 'string',
                },
            },
        });
    });
    it('indySdkCredentialDefinitionFromAnonCreds should return a valid indy sdk credential definition', () => {
        const credentialDefinitionId = 'TL1EaPFCZ8Si5aUrqScBDt:3:CL:420:someTag';
        const credentialDefinition = {
            issuerId: 'TL1EaPFCZ8Si5aUrqScBDt',
            schemaId: '8910:2:Example Schema:1.0.0',
            tag: 'someTag',
            type: 'CL',
            value: {
                primary: {
                    something: 'string',
                },
            },
        };
        expect((0, transform_1.indySdkCredentialDefinitionFromAnonCreds)(credentialDefinitionId, credentialDefinition)).toEqual({
            id: 'TL1EaPFCZ8Si5aUrqScBDt:3:CL:420:someTag',
            schemaId: '8910:2:Example Schema:1.0.0',
            tag: 'someTag',
            type: 'CL',
            value: {
                primary: {
                    something: 'string',
                },
            },
            ver: '1.0',
        });
    });
    // TODO: add tests for these models once finalized in the anoncreds spec
    test.todo('anonCredsRevocationRegistryDefinitionFromIndySdk should return a valid anoncreds revocation registry definition');
    test.todo('indySdkRevocationRegistryDefinitionFromAnonCreds should return a valid indy sdk revocation registry definition');
    test.todo('anonCredsRevocationStatusListFromIndySdk should return a valid anoncreds revocation list');
    test.todo('indySdkRevocationRegistryFromAnonCreds should return a valid indy sdk revocation registry');
    test.todo('indySdkRevocationDeltaFromAnonCreds should return a valid indy sdk revocation delta');
});
