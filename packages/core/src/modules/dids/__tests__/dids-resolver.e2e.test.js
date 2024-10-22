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
const src_1 = require("../../../../../indy-sdk/src");
const tests_1 = require("../../../../tests");
const helpers_1 = require("../../../../tests/helpers");
const Agent_1 = require("../../../agent/Agent");
const utils_1 = require("../../../utils");
const agent = new Agent_1.Agent((0, helpers_1.getAgentOptions)('Faber Dids', {}, {
    indySdk: new src_1.IndySdkModule({
        indySdk: tests_1.indySdk,
    }),
}));
describe('dids', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.initialize();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    it('should resolve a did:key did', () => __awaiter(void 0, void 0, void 0, function* () {
        const did = yield agent.dids.resolve('did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL');
        expect(utils_1.JsonTransformer.toJSON(did)).toMatchObject({
            didDocument: {
                '@context': [
                    'https://w3id.org/did/v1',
                    'https://w3id.org/security/suites/ed25519-2018/v1',
                    'https://w3id.org/security/suites/x25519-2019/v1',
                ],
                id: 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                alsoKnownAs: undefined,
                controller: undefined,
                verificationMethod: [
                    {
                        id: 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                        type: 'Ed25519VerificationKey2018',
                        controller: 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                        publicKeyBase58: '6fioC1zcDPyPEL19pXRS2E4iJ46zH7xP6uSgAaPdwDrx',
                    },
                ],
                authentication: [
                    'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                ],
                assertionMethod: [
                    'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                ],
                capabilityInvocation: [
                    'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                ],
                capabilityDelegation: [
                    'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                ],
                keyAgreement: [
                    {
                        id: 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6LSrdqo4M24WRDJj1h2hXxgtDTyzjjKCiyapYVgrhwZAySn',
                        type: 'X25519KeyAgreementKey2019',
                        controller: 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                        publicKeyBase58: 'FxfdY3DCQxVZddKGAtSjZdFW9bCCW7oRwZn1NFJ2Tbg2',
                    },
                ],
                service: undefined,
            },
            didDocumentMetadata: {},
            didResolutionMetadata: {
                contentType: 'application/did+ld+json',
            },
        });
    }));
    it('should resolve a did:peer did', () => __awaiter(void 0, void 0, void 0, function* () {
        const did = yield agent.dids.resolve('did:peer:0z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL');
        expect(utils_1.JsonTransformer.toJSON(did)).toMatchObject({
            didDocument: {
                '@context': [
                    'https://w3id.org/did/v1',
                    'https://w3id.org/security/suites/ed25519-2018/v1',
                    'https://w3id.org/security/suites/x25519-2019/v1',
                ],
                id: 'did:peer:0z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                alsoKnownAs: undefined,
                controller: undefined,
                verificationMethod: [
                    {
                        id: 'did:peer:0z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                        type: 'Ed25519VerificationKey2018',
                        controller: 'did:peer:0z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                        publicKeyBase58: '6fioC1zcDPyPEL19pXRS2E4iJ46zH7xP6uSgAaPdwDrx',
                    },
                ],
                authentication: [
                    'did:peer:0z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                ],
                assertionMethod: [
                    'did:peer:0z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                ],
                capabilityInvocation: [
                    'did:peer:0z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                ],
                capabilityDelegation: [
                    'did:peer:0z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                ],
                keyAgreement: [
                    {
                        id: 'did:peer:0z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6LSrdqo4M24WRDJj1h2hXxgtDTyzjjKCiyapYVgrhwZAySn',
                        type: 'X25519KeyAgreementKey2019',
                        controller: 'did:peer:0z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
                        publicKeyBase58: 'FxfdY3DCQxVZddKGAtSjZdFW9bCCW7oRwZn1NFJ2Tbg2',
                    },
                ],
                service: undefined,
            },
            didDocumentMetadata: {},
            didResolutionMetadata: {
                contentType: 'application/did+ld+json',
            },
        });
    }));
});
