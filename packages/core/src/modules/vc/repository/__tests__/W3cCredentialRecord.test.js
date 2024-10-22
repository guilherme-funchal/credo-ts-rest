"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../../utils");
const fixtures_1 = require("../../data-integrity/__tests__/fixtures");
const models_1 = require("../../data-integrity/models");
const W3cCredentialRecord_1 = require("../W3cCredentialRecord");
describe('W3cCredentialRecord', () => {
    describe('getTags', () => {
        it('should return default tags', () => {
            const credential = utils_1.JsonTransformer.fromJSON(fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED, models_1.W3cJsonLdVerifiableCredential);
            const w3cCredentialRecord = new W3cCredentialRecord_1.W3cCredentialRecord({
                credential,
                tags: {
                    expandedTypes: ['https://expanded.tag#1'],
                },
            });
            expect(w3cCredentialRecord.getTags()).toEqual({
                claimFormat: 'ldp_vc',
                issuerId: credential.issuerId,
                subjectIds: credential.credentialSubjectIds,
                schemaIds: credential.credentialSchemaIds,
                contexts: credential.contexts,
                proofTypes: credential.proofTypes,
                givenId: credential.id,
                expandedTypes: ['https://expanded.tag#1'],
            });
        });
    });
});
