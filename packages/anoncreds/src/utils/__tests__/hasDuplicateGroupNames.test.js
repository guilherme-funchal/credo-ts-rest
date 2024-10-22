"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hasDuplicateGroupNames_1 = require("../hasDuplicateGroupNames");
const credentialDefinitionId = '9vPXgSpQJPkJEALbLXueBp:3:CL:57753:tag1';
describe('util | assertNoDuplicateGroupsNamesInProofRequest', () => {
    describe('assertNoDuplicateGroupsNamesInProofRequest', () => {
        test('attribute names match', () => {
            const proofRequest = {
                name: 'proof-request',
                version: '1.0',
                nonce: 'testtesttest12345',
                requested_attributes: {
                    age1: {
                        name: 'age',
                        restrictions: [
                            {
                                cred_def_id: credentialDefinitionId,
                            },
                        ],
                    },
                    age2: {
                        name: 'age',
                        restrictions: [
                            {
                                cred_def_id: credentialDefinitionId,
                            },
                        ],
                    },
                },
                requested_predicates: {},
            };
            expect(() => (0, hasDuplicateGroupNames_1.assertNoDuplicateGroupsNamesInProofRequest)(proofRequest)).not.toThrow();
        });
        test('attribute names match with predicates name', () => {
            const proofRequest = {
                name: 'proof-request',
                version: '1.0',
                nonce: 'testtesttest12345',
                requested_attributes: {
                    attrib: {
                        name: 'age',
                        restrictions: [
                            {
                                cred_def_id: credentialDefinitionId,
                            },
                        ],
                    },
                },
                requested_predicates: {
                    predicate: {
                        name: 'age',
                        p_type: '>=',
                        p_value: 50,
                        restrictions: [
                            {
                                cred_def_id: credentialDefinitionId,
                            },
                        ],
                    },
                },
            };
            expect(() => (0, hasDuplicateGroupNames_1.assertNoDuplicateGroupsNamesInProofRequest)(proofRequest)).toThrowError('The proof request contains duplicate predicates and attributes: age');
        });
    });
});
