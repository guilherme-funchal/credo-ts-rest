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
exports.resolverAgent = void 0;
const core_1 = require("@aries-framework/core");
const helpers_1 = require("../../core/tests/helpers");
const didCheqdUtil_1 = require("../src/dids/didCheqdUtil");
const CheqdLedgerService_1 = require("../src/ledger/CheqdLedgerService");
const setupCheqdModule_1 = require("./setupCheqdModule");
exports.resolverAgent = new core_1.Agent((0, helpers_1.getAgentOptions)('Cheqd resolver', {}, (0, setupCheqdModule_1.getCheqdModules)(undefined, CheqdLedgerService_1.DefaultRPCUrl.Testnet)));
describe('Cheqd DID resolver', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield exports.resolverAgent.initialize();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield exports.resolverAgent.shutdown();
        yield exports.resolverAgent.wallet.delete();
    }));
    it('should resolve a did:cheqd:testnet did', () => __awaiter(void 0, void 0, void 0, function* () {
        const did = yield exports.resolverAgent.dids.resolve('did:cheqd:testnet:3053e034-8faa-458d-9f01-2e3e1e8b2ab8');
        expect(core_1.JsonTransformer.toJSON(did)).toMatchObject({
            didDocument: {
                '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/ed25519-2020/v1'],
                id: 'did:cheqd:testnet:3053e034-8faa-458d-9f01-2e3e1e8b2ab8',
                controller: ['did:cheqd:testnet:3053e034-8faa-458d-9f01-2e3e1e8b2ab8'],
                verificationMethod: [
                    {
                        controller: 'did:cheqd:testnet:3053e034-8faa-458d-9f01-2e3e1e8b2ab8',
                        id: 'did:cheqd:testnet:3053e034-8faa-458d-9f01-2e3e1e8b2ab8#key-1',
                        publicKeyMultibase: 'z6MksPpyxgw5aFymMboa81CQ7h1kJJ9yehNzPgo714y1HrAA',
                        type: 'Ed25519VerificationKey2020',
                    },
                ],
                authentication: ['did:cheqd:testnet:3053e034-8faa-458d-9f01-2e3e1e8b2ab8#key-1'],
            },
            didDocumentMetadata: {
                created: '2022-10-17T13:42:37.000Z',
                updated: '0001-01-01T00:00:00.000Z',
                deactivated: false,
                versionId: '7314e3e5-f9cc-50e9-b249-348963937c96',
                nextVersionId: '',
            },
            didResolutionMetadata: {},
        });
    }));
    it('should getClosestResourceVersion', () => __awaiter(void 0, void 0, void 0, function* () {
        const did = yield exports.resolverAgent.dids.resolve('did:cheqd:testnet:SiVQgrFZ7jFZFrTGstT4ZD');
        let resource = (0, didCheqdUtil_1.getClosestResourceVersion)(did.didDocumentMetadata.linkedResourceMetadata, new Date());
        expect(resource).toMatchObject({
            id: '0b02ebf4-07c4-4df7-9015-e93c21108240',
        });
        resource = (0, didCheqdUtil_1.getClosestResourceVersion)(did.didDocumentMetadata.linkedResourceMetadata, new Date('2022-11-16T10:56:34Z'));
        expect(resource).toMatchObject({
            id: '8140ec3a-d8bb-4f59-9784-a1cbf91a4a35',
        });
        resource = (0, didCheqdUtil_1.getClosestResourceVersion)(did.didDocumentMetadata.linkedResourceMetadata, new Date('2022-11-16T11:41:48Z'));
        expect(resource).toMatchObject({
            id: 'a20aa56a-a76f-4828-8a98-4c85d9494545',
        });
    }));
});
