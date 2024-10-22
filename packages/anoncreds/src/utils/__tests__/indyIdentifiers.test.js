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
Object.defineProperty(exports, "__esModule", { value: true });
const indyIdentifiers_1 = require("../indyIdentifiers");
describe('Legacy Indy Identifier Regex', () => {
    const invalidTest = 'test';
    test('test for legacyIndyCredentialDefinitionIdRegex', () => __awaiter(void 0, void 0, void 0, function* () {
        const test = 'q7ATwTYbQDgiigVijUAej:3:CL:160971:1.0.0';
        expect(test).toMatch(indyIdentifiers_1.unqualifiedCredentialDefinitionIdRegex);
        expect(indyIdentifiers_1.unqualifiedCredentialDefinitionIdRegex.test(invalidTest)).toBeFalsy();
    }));
    test('test for legacyIndyDidRegex', () => __awaiter(void 0, void 0, void 0, function* () {
        const test = 'did:sov:q7ATwTYbQDgiigVijUAej';
        expect(test).toMatch(indyIdentifiers_1.unqualifiedIndyDidRegex);
        expect(indyIdentifiers_1.unqualifiedIndyDidRegex.test(invalidTest)).toBeFalsy();
    }));
    test('test for legacyIndySchemaIdRegex', () => __awaiter(void 0, void 0, void 0, function* () {
        const test = 'q7ATwTYbQDgiigVijUAej:2:test:1.0';
        expect(test).toMatch(indyIdentifiers_1.unqualifiedSchemaIdRegex);
        expect(indyIdentifiers_1.unqualifiedSchemaIdRegex.test(invalidTest)).toBeFalsy();
    }));
    test('test for legacyIndySchemaIdRegex', () => __awaiter(void 0, void 0, void 0, function* () {
        const test = 'N7baRMcyvPwWc8v85CtZ6e:4:N7baRMcyvPwWc8v85CtZ6e:3:CL:100669:SCH Employee ID:CL_ACCUM:1-1024';
        expect(test).toMatch(indyIdentifiers_1.unqualifiedRevocationRegistryIdRegex);
        expect(indyIdentifiers_1.unqualifiedRevocationRegistryIdRegex.test(invalidTest)).toBeFalsy();
    }));
    test('test for legacyIndySchemaVersionRegex', () => __awaiter(void 0, void 0, void 0, function* () {
        const test = '1.0.0';
        expect(test).toMatch(indyIdentifiers_1.unqualifiedSchemaVersionRegex);
        expect(indyIdentifiers_1.unqualifiedSchemaVersionRegex.test(invalidTest)).toBeFalsy();
    }));
    test('getUnqualifiedSchemaId returns a valid schema id given a did, name, and version', () => {
        const did = '12345';
        const name = 'backbench';
        const version = '420';
        expect((0, indyIdentifiers_1.getUnqualifiedSchemaId)(did, name, version)).toEqual('12345:2:backbench:420');
    });
    test('getUnqualifiedCredentialDefinitionId returns a valid credential definition id given a did, seqNo, and tag', () => {
        const did = '12345';
        const seqNo = 420;
        const tag = 'someTag';
        expect((0, indyIdentifiers_1.getUnqualifiedCredentialDefinitionId)(did, seqNo, tag)).toEqual('12345:3:CL:420:someTag');
    });
    test('getUnqualifiedRevocationRegistryId returns a valid credential definition id given a did, seqNo, and tag', () => {
        const did = '12345';
        const seqNo = 420;
        const credentialDefinitionTag = 'someTag';
        const tag = 'anotherTag';
        expect((0, indyIdentifiers_1.getUnqualifiedRevocationRegistryId)(did, seqNo, credentialDefinitionTag, tag)).toEqual('12345:4:12345:3:CL:420:someTag:CL_ACCUM:anotherTag');
    });
    describe('parseIndySchemaId', () => {
        test('parses legacy schema id', () => {
            expect((0, indyIdentifiers_1.parseIndySchemaId)('SDqTzbVuCowusqGBNbNDjH:2:schema-name:1.0')).toEqual({
                did: 'SDqTzbVuCowusqGBNbNDjH',
                namespaceIdentifier: 'SDqTzbVuCowusqGBNbNDjH',
                schemaName: 'schema-name',
                schemaVersion: '1.0',
            });
        });
        test('parses did:indy schema id', () => {
            expect((0, indyIdentifiers_1.parseIndySchemaId)('did:indy:bcovrin:test:SDqTzbVuCowusqGBNbNDjH/anoncreds/v0/SCHEMA/schema-name/1.0')).toEqual({
                namespaceIdentifier: 'SDqTzbVuCowusqGBNbNDjH',
                did: 'did:indy:bcovrin:test:SDqTzbVuCowusqGBNbNDjH',
                schemaName: 'schema-name',
                schemaVersion: '1.0',
                namespace: 'bcovrin:test',
            });
        });
    });
    describe('parseIndyCredentialDefinitionId', () => {
        test('parses legacy credential definition id', () => {
            expect((0, indyIdentifiers_1.parseIndyCredentialDefinitionId)('TL1EaPFCZ8Si5aUrqScBDt:3:CL:10:TAG')).toEqual({
                did: 'TL1EaPFCZ8Si5aUrqScBDt',
                namespaceIdentifier: 'TL1EaPFCZ8Si5aUrqScBDt',
                schemaSeqNo: '10',
                tag: 'TAG',
            });
        });
        test('parses did:indy credential definition id', () => {
            expect((0, indyIdentifiers_1.parseIndyCredentialDefinitionId)('did:indy:pool:localtest:TL1EaPFCZ8Si5aUrqScBDt/anoncreds/v0/CLAIM_DEF/10/TAG')).toEqual({
                namespaceIdentifier: 'TL1EaPFCZ8Si5aUrqScBDt',
                did: 'did:indy:pool:localtest:TL1EaPFCZ8Si5aUrqScBDt',
                namespace: 'pool:localtest',
                schemaSeqNo: '10',
                tag: 'TAG',
            });
        });
    });
    describe('parseIndyRevocationRegistryId', () => {
        test('parses legacy revocation registry id', () => {
            expect((0, indyIdentifiers_1.parseIndyRevocationRegistryId)('5nDyJVP1NrcPAttP3xwMB9:4:5nDyJVP1NrcPAttP3xwMB9:3:CL:56495:npdb:CL_ACCUM:TAG1')).toEqual({
                did: '5nDyJVP1NrcPAttP3xwMB9',
                namespaceIdentifier: '5nDyJVP1NrcPAttP3xwMB9',
                schemaSeqNo: '56495',
                credentialDefinitionTag: 'npdb',
                revocationRegistryTag: 'TAG1',
            });
        });
        test('parses did:indy revocation registry id', () => {
            expect((0, indyIdentifiers_1.parseIndyRevocationRegistryId)('did:indy:sovrin:5nDyJVP1NrcPAttP3xwMB9/anoncreds/v0/REV_REG_DEF/56495/npdb/TAG1')).toEqual({
                namespace: 'sovrin',
                namespaceIdentifier: '5nDyJVP1NrcPAttP3xwMB9',
                did: 'did:indy:sovrin:5nDyJVP1NrcPAttP3xwMB9',
                schemaSeqNo: '56495',
                credentialDefinitionTag: 'npdb',
                revocationRegistryTag: 'TAG1',
            });
        });
    });
});
