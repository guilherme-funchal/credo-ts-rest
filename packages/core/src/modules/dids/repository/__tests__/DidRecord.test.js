"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DidDocumentRole_1 = require("../../domain/DidDocumentRole");
const DidRecord_1 = require("../DidRecord");
const didRecordMetadataTypes_1 = require("../didRecordMetadataTypes");
describe('DidRecord', () => {
    describe('getTags', () => {
        it('should return default tags', () => {
            const didRecord = new DidRecord_1.DidRecord({
                did: 'did:example:123456789abcdefghi',
                role: DidDocumentRole_1.DidDocumentRole.Created,
            });
            didRecord.metadata.set(didRecordMetadataTypes_1.DidRecordMetadataKeys.LegacyDid, {
                didDocumentString: '{}',
                unqualifiedDid: 'unqualifiedDid',
            });
            expect(didRecord.getTags()).toEqual({
                role: DidDocumentRole_1.DidDocumentRole.Created,
                method: 'example',
                legacyUnqualifiedDid: 'unqualifiedDid',
                did: 'did:example:123456789abcdefghi',
                methodSpecificIdentifier: '123456789abcdefghi',
            });
        });
    });
});
