"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const revocationIdentifier_1 = require("../revocationIdentifier");
describe('revocationIdentifier', () => {
    describe('v1ThreadRegex', () => {
        test('should match', () => {
            const revocationRegistryId = 'AABC12D3EFgHIjKL4mnOPQ:4:AsB27X6KRrJFsqZ3unNAH6:3:cl:48187:N4s7y-5hema_tag ;:CL_ACCUM:3b24a9b0-a979-41e0-9964-2292f2b1b7e9';
            const credentialRevocationId = '2';
            const revocationThreadId = `indy::${revocationRegistryId}::${credentialRevocationId}`;
            const [mRevocationThreadId, mIndy, mRevocationRegistryId, mCredentialRevocationId] = revocationThreadId.match(revocationIdentifier_1.v1ThreadRegex);
            expect([mRevocationThreadId, mIndy, mRevocationRegistryId, mCredentialRevocationId]).toStrictEqual([
                revocationThreadId,
                'indy',
                revocationRegistryId,
                credentialRevocationId,
            ]);
        });
    });
    describe('v2IndyRevocationIdentifierRegex', () => {
        test('should match', () => {
            const revocationRegistryId = 'AABC12D3EFgHIjKL4mnOPQ:4:AsB27X6KRrJFsqZ3unNAH6:3:cl:48187:N4s7y-5hema_tag ;:CL_ACCUM:3b24a9b0-a979-41e0-9964-2292f2b1b7e9';
            const credentialRevocationId = '2';
            const revocationCredentialId = `${revocationRegistryId}::${credentialRevocationId}`;
            const [mRevocationCredentialId, mRevocationRegistryId, mCredentialRevocationId] = revocationCredentialId.match(revocationIdentifier_1.v2IndyRevocationIdentifierRegex);
            expect([mRevocationCredentialId, mRevocationRegistryId, mCredentialRevocationId]).toStrictEqual([
                revocationCredentialId,
                revocationRegistryId,
                credentialRevocationId,
            ]);
        });
    });
});
