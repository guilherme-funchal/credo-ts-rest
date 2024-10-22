"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertUnqualified_1 = require("../assertUnqualified");
describe('assertUnqualified', () => {
    describe('assertUnqualifiedCredentialDefinitionId', () => {
        test('throws when a non-unqualified credential definition id is passed', () => {
            expect(() => (0, assertUnqualified_1.assertUnqualifiedCredentialDefinitionId)('did:indy:local:N7baRMcyvPwWc8v85CtZ6e/anoncreds/v0/CLAIM_DEF/100669/SCH Employee ID')).toThrow();
        });
        test('does not throw when an unqualified credential definition id is passed', () => {
            expect(() => (0, assertUnqualified_1.assertUnqualifiedCredentialDefinitionId)('N7baRMcyvPwWc8v85CtZ6e:3:CL:100669:SCH Employee ID')).not.toThrow();
        });
    });
    describe('assertUnqualifiedSchemaId', () => {
        test('throws when a non-unqualified schema id is passed', () => {
            expect(() => (0, assertUnqualified_1.assertUnqualifiedSchemaId)('did:indy:local:BQ42WeE24jFHeyGg8x9XAz/anoncreds/v0/SCHEMA/Medical Bill/1.0')).toThrowError('Schema id');
        });
        test('does not throw when an unqualified schema id is passed', () => {
            expect(() => (0, assertUnqualified_1.assertUnqualifiedSchemaId)('BQ42WeE24jFHeyGg8x9XAz:2:Medical Bill:1.0')).not.toThrow();
        });
    });
    describe('assertUnqualifiedRevocationRegistryId', () => {
        test('throws when a non-unqualified revocation registry id is passed', () => {
            expect(() => (0, assertUnqualified_1.assertUnqualifiedRevocationRegistryId)('did:indy:local:N7baRMcyvPwWc8v85CtZ6e/anoncreds/v0/REV_REG_DEF/100669/SCH Employee ID/1-1024')).toThrowError('Revocation registry id');
        });
        test('does not throw when an unqualified revocation registry id is passed', () => {
            expect(() => (0, assertUnqualified_1.assertUnqualifiedRevocationRegistryId)('N7baRMcyvPwWc8v85CtZ6e:4:N7baRMcyvPwWc8v85CtZ6e:3:CL:100669:SCH Employee ID:CL_ACCUM:1-1024')).not.toThrow();
        });
    });
    describe('assertUnqualifiedIssuerId', () => {
        test('throws when a non-unqualified issuer id is passed', () => {
            expect(() => (0, assertUnqualified_1.assertUnqualifiedIssuerId)('did:indy:sovrin:N7baRMcyvPwWc8v85CtZ6e')).toThrowError('Issuer id');
        });
        test('does not throw when an unqualified issuer id is passed', () => {
            expect(() => (0, assertUnqualified_1.assertUnqualifiedIssuerId)('N7baRMcyvPwWc8v85CtZ6e')).not.toThrow();
        });
    });
    describe('assertUnqualifiedCredentialOffer', () => {
        test('throws when non-unqualified identifiers are passed', () => {
            expect(() => (0, assertUnqualified_1.assertUnqualifiedCredentialOffer)({
                cred_def_id: 'did:indy:local:N7baRMcyvPwWc8v85CtZ6e/anoncreds/v0/CLAIM_DEF/100669/SCH Employee ID',
                schema_id: 'BQ42WeE24jFHeyGg8x9XAz:2:Medical Bill:1.0',
            })).toThrowError('Credential definition id');
            expect(() => (0, assertUnqualified_1.assertUnqualifiedCredentialOffer)({
                cred_def_id: 'N7baRMcyvPwWc8v85CtZ6e:3:CL:100669:SCH Employee ID',
                schema_id: 'did:indy:local:BQ42WeE24jFHeyGg8x9XAz/anoncreds/v0/SCHEMA/Medical Bill/1.0',
            })).toThrowError('Schema id');
        });
        test('does not throw when only unqualified identifiers are passed', () => {
            expect(() => (0, assertUnqualified_1.assertUnqualifiedCredentialOffer)({
                cred_def_id: 'N7baRMcyvPwWc8v85CtZ6e:3:CL:100669:SCH Employee ID',
                schema_id: 'BQ42WeE24jFHeyGg8x9XAz:2:Medical Bill:1.0',
            })).not.toThrow();
        });
    });
    describe('assertUnqualifiedCredentialRequest', () => {
        test('throws when non-unqualified identifiers are passed', () => {
            expect(() => (0, assertUnqualified_1.assertUnqualifiedCredentialRequest)({
                cred_def_id: 'did:indy:local:N7baRMcyvPwWc8v85CtZ6e/anoncreds/v0/CLAIM_DEF/100669/SCH Employee ID',
            })).toThrowError('Credential definition id');
        });
        test('does not throw when only unqualified identifiers are passed', () => {
            expect(() => (0, assertUnqualified_1.assertUnqualifiedCredentialRequest)({
                cred_def_id: 'N7baRMcyvPwWc8v85CtZ6e:3:CL:100669:SCH Employee ID',
            })).not.toThrow();
        });
    });
    describe('assertUnqualifiedProofRequest', () => {
        test('throws when non-unqualified identifiers are passed', () => {
            expect(() => (0, assertUnqualified_1.assertUnqualifiedProofRequest)({
                requested_attributes: {
                    a: {
                        restrictions: [
                            {
                                cred_def_id: 'did:indy:local:N7baRMcyvPwWc8v85CtZ6e/anoncreds/v0/CLAIM_DEF/100669/SCH Employee ID',
                            },
                        ],
                    },
                },
                requested_predicates: {},
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            })).toThrowError('Credential definition id');
        });
        test('does not throw when only unqualified identifiers are passed', () => {
            expect(() => (0, assertUnqualified_1.assertUnqualifiedProofRequest)({
                requested_attributes: {
                    a: {
                        restrictions: [
                            {
                                schema_id: 'BQ42WeE24jFHeyGg8x9XAz:2:Medical Bill:1.0',
                            },
                        ],
                    },
                },
                requested_predicates: {},
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            })).not.toThrow();
        });
    });
});
