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
const core_1 = require("@aries-framework/core");
const agentOptions = (0, helpers_1.getAgentOptions)('DidsApi', {}, {
    indySdk: new src_1.IndySdkModule({
        indySdk: tests_1.indySdk,
    }),
});
const agent = new Agent_1.Agent(agentOptions);
describe('DidsApi', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.initialize();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    test('import an existing did without providing a did document', () => __awaiter(void 0, void 0, void 0, function* () {
        const createKeySpy = jest.spyOn(agent.context.wallet, 'createKey');
        // Private key is for public key associated with did:key did
        const privateKey = core_1.TypedArrayEncoder.fromString('a-sample-seed-of-32-bytes-in-tot');
        const did = 'did:key:z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty';
        expect(yield agent.dids.getCreatedDids({ did })).toHaveLength(0);
        yield agent.dids.import({
            did,
            privateKeys: [
                {
                    privateKey,
                    keyType: core_1.KeyType.Ed25519,
                },
            ],
        });
        expect(createKeySpy).toHaveBeenCalledWith({
            privateKey,
            keyType: core_1.KeyType.Ed25519,
        });
        const createdDids = yield agent.dids.getCreatedDids({
            did,
        });
        expect(createdDids).toHaveLength(1);
        expect(createdDids[0].getTags()).toEqual({
            did,
            legacyUnqualifiedDid: undefined,
            method: 'key',
            methodSpecificIdentifier: 'z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty',
            role: 'created',
        });
        expect(createdDids[0].toJSON()).toMatchObject({
            did,
            didDocument: {
                '@context': [
                    'https://w3id.org/did/v1',
                    'https://w3id.org/security/suites/ed25519-2018/v1',
                    'https://w3id.org/security/suites/x25519-2019/v1',
                ],
                id: 'did:key:z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty',
                verificationMethod: [
                    {
                        id: 'did:key:z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty#z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty',
                        type: 'Ed25519VerificationKey2018',
                        controller: 'did:key:z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty',
                        publicKeyBase58: '5nKwL9aJ9kpnEE1pSsqvLMqDnE1ubeBr4TjzC56roC7b',
                    },
                ],
                authentication: [
                    'did:key:z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty#z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty',
                ],
                assertionMethod: [
                    'did:key:z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty#z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty',
                ],
                keyAgreement: [
                    {
                        id: 'did:key:z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty#z6LSd6ed6s6HGsVsDL9vyx3s1Vi2jQYsX9TqjqVFam2oz776',
                        type: 'X25519KeyAgreementKey2019',
                        controller: 'did:key:z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty',
                        publicKeyBase58: '2RUTaZHRBQn87wnATJXuguVYtG1kpYHgrrma6JPHGjLL',
                    },
                ],
                capabilityInvocation: [
                    'did:key:z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty#z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty',
                ],
                capabilityDelegation: [
                    'did:key:z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty#z6MkjEayvPpjVJKFLirX8SomBTPDboHm1XSCkUev2M4siQty',
                ],
            },
        });
    }));
    test('import an existing did with providing a did document', () => __awaiter(void 0, void 0, void 0, function* () {
        const createKeySpy = jest.spyOn(agent.context.wallet, 'createKey');
        // Private key is for public key associated with did:key did
        const privateKey = core_1.TypedArrayEncoder.fromString('a-new-sample-seed-of-32-bytes-in');
        const did = 'did:peer:0z6Mkhu3G8viiebsWmCiSgWiQoCZrTeuX76oLDow81YNYvJQM';
        expect(yield agent.dids.getCreatedDids({ did })).toHaveLength(0);
        yield agent.dids.import({
            did,
            didDocument: new core_1.DidDocument({
                id: did,
            }),
            privateKeys: [
                {
                    privateKey,
                    keyType: core_1.KeyType.Ed25519,
                },
            ],
        });
        expect(createKeySpy).toHaveBeenCalledWith({
            privateKey,
            keyType: core_1.KeyType.Ed25519,
        });
        const createdDids = yield agent.dids.getCreatedDids({
            did,
        });
        expect(createdDids).toHaveLength(1);
        expect(createdDids[0].getTags()).toEqual({
            did,
            legacyUnqualifiedDid: undefined,
            method: 'peer',
            methodSpecificIdentifier: '0z6Mkhu3G8viiebsWmCiSgWiQoCZrTeuX76oLDow81YNYvJQM',
            role: 'created',
        });
        expect(createdDids[0].toJSON()).toMatchObject({
            did,
            didDocument: {
                id: did,
            },
        });
    }));
    test('can only overwrite if overwrite option is set', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const did = 'did:example:123';
        const didDocument = new core_1.DidDocument({ id: did });
        const didDocument2 = new core_1.DidDocument({
            id: did,
            service: [new core_1.DidDocumentService({ id: 'did:example:123#service', type: 'test', serviceEndpoint: 'test' })],
        });
        expect(yield agent.dids.getCreatedDids({ did })).toHaveLength(0);
        // First import, should work
        yield agent.dids.import({
            did,
            didDocument,
        });
        expect(yield agent.dids.getCreatedDids({ did })).toHaveLength(1);
        expect(agent.dids.import({
            did,
            didDocument: didDocument2,
        })).rejects.toThrowError("A created did did:example:123 already exists. If you want to override the existing did, set the 'overwrite' option to update the did.");
        // Should not have stored the updated record
        const createdDids = yield agent.dids.getCreatedDids({ did });
        expect((_a = createdDids[0].didDocument) === null || _a === void 0 ? void 0 : _a.service).toBeUndefined();
        // Should work, overwrite is set
        yield agent.dids.import({
            did,
            didDocument: didDocument2,
            overwrite: true,
        });
        // Should not have stored the updated record
        const createdDidsOverwrite = yield agent.dids.getCreatedDids({ did });
        expect((_b = createdDidsOverwrite[0].didDocument) === null || _b === void 0 ? void 0 : _b.service).toHaveLength(1);
    }));
    test('providing privateKeys that already exist is allowd', () => __awaiter(void 0, void 0, void 0, function* () {
        const privateKey = core_1.TypedArrayEncoder.fromString('another-samples-seed-of-32-bytes');
        const did = 'did:example:456';
        const didDocument = new core_1.DidDocument({ id: did });
        yield agent.dids.import({
            did,
            didDocument,
            privateKeys: [
                {
                    keyType: core_1.KeyType.Ed25519,
                    privateKey,
                },
            ],
        });
        // Provide the same key again, should work
        yield agent.dids.import({
            did,
            didDocument,
            overwrite: true,
            privateKeys: [
                {
                    keyType: core_1.KeyType.Ed25519,
                    privateKey,
                },
            ],
        });
    }));
});
