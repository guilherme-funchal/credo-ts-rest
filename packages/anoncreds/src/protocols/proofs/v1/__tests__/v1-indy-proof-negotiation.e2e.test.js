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
const src_1 = require("../../../../../../core/src");
const tests_1 = require("../../../../../../core/tests");
const legacyAnonCredsSetup_1 = require("../../../../../tests/legacyAnonCredsSetup");
describe('Present Proof', () => {
    let faberAgent;
    let aliceAgent;
    let aliceConnectionId;
    let credentialDefinitionId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Initializing the agents');
        ({
            issuerAgent: faberAgent,
            holderAgent: aliceAgent,
            credentialDefinitionId,
            holderIssuerConnectionId: aliceConnectionId,
        } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber - V1 Indy Proof Negotiation',
            holderName: 'Alice - V1 Indy Proof Negotiation',
            attributeNames: ['name', 'age'],
        }));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Shutting down both agents');
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test(`Proof negotiation between Alice and Faber`, () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        tests_1.testLogger.test('Alice sends proof proposal to Faber');
        let faberProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(faberAgent, {
            state: src_1.ProofState.ProposalReceived,
        });
        let aliceProofExchangeRecord = yield aliceAgent.proofs.proposeProof({
            connectionId: aliceConnectionId,
            protocolVersion: 'v1',
            proofFormats: {
                indy: {
                    name: 'proof-request',
                    version: '1.0',
                    attributes: [],
                    predicates: [
                        {
                            credentialDefinitionId,
                            name: 'age',
                            predicate: '>=',
                            threshold: 18,
                        },
                    ],
                },
            },
            comment: 'V1 propose proof test 1',
        });
        tests_1.testLogger.test('Faber waits for presentation from Alice');
        let faberProofExchangeRecord = yield faberProofExchangeRecordPromise;
        let proposal = yield faberAgent.proofs.findProposalMessage(faberProofExchangeRecord.id);
        expect(proposal).toMatchObject({
            type: 'https://didcomm.org/present-proof/1.0/propose-presentation',
            id: expect.any(String),
            comment: 'V1 propose proof test 1',
            presentationProposal: {
                type: 'https://didcomm.org/present-proof/1.0/presentation-preview',
                attributes: [],
                predicates: [
                    {
                        name: 'age',
                        credentialDefinitionId,
                        predicate: '>=',
                        threshold: 18,
                    },
                ],
            },
        });
        expect(faberProofExchangeRecord).toMatchObject({
            id: expect.anything(),
            threadId: faberProofExchangeRecord.threadId,
            state: src_1.ProofState.ProposalReceived,
            protocolVersion: 'v1',
        });
        let aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
            threadId: faberProofExchangeRecord.threadId,
            state: src_1.ProofState.RequestReceived,
        });
        tests_1.testLogger.test('Faber sends new proof request to Alice');
        faberProofExchangeRecord = yield faberAgent.proofs.negotiateProposal({
            proofRecordId: faberProofExchangeRecord.id,
            proofFormats: {
                indy: {
                    name: 'proof-request',
                    version: '1.0',
                    requested_attributes: {
                        something: {
                            name: 'name',
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                    },
                    requested_predicates: {
                        somethingElse: {
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
                },
            },
        });
        tests_1.testLogger.test('Alice waits for proof request from Faber');
        aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
        let request = yield faberAgent.proofs.findRequestMessage(faberProofExchangeRecord.id);
        expect(request).toMatchObject({
            type: 'https://didcomm.org/present-proof/1.0/request-presentation',
            id: expect.any(String),
            requestAttachments: [
                {
                    id: 'libindy-request-presentation-0',
                    mimeType: 'application/json',
                    data: {
                        base64: expect.any(String),
                    },
                },
            ],
            thread: {
                threadId: faberProofExchangeRecord.threadId,
            },
        });
        expect(aliceProofExchangeRecord).toMatchObject({
            id: expect.anything(),
            threadId: faberProofExchangeRecord.threadId,
            state: src_1.ProofState.RequestReceived,
            protocolVersion: 'v1',
        });
        tests_1.testLogger.test('Alice sends proof proposal to Faber');
        faberProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(faberAgent, {
            state: src_1.ProofState.ProposalReceived,
        });
        aliceProofExchangeRecord = yield aliceAgent.proofs.negotiateRequest({
            proofRecordId: aliceProofExchangeRecord.id,
            proofFormats: {
                indy: {
                    name: 'proof-request',
                    version: '1.0',
                    attributes: [],
                    predicates: [
                        {
                            credentialDefinitionId,
                            name: 'age',
                            predicate: '>=',
                            threshold: 18,
                        },
                    ],
                },
            },
            comment: 'V1 propose proof test 2',
        });
        tests_1.testLogger.test('Faber waits for presentation from Alice');
        faberProofExchangeRecord = yield faberProofExchangeRecordPromise;
        proposal = yield faberAgent.proofs.findProposalMessage(faberProofExchangeRecord.id);
        expect(proposal).toMatchObject({
            type: 'https://didcomm.org/present-proof/1.0/propose-presentation',
            id: expect.any(String),
            comment: 'V1 propose proof test 2',
            presentationProposal: {
                type: 'https://didcomm.org/present-proof/1.0/presentation-preview',
                attributes: [],
                predicates: [
                    {
                        name: 'age',
                        credentialDefinitionId,
                        predicate: '>=',
                        threshold: 18,
                    },
                ],
            },
        });
        expect(faberProofExchangeRecord).toMatchObject({
            id: expect.anything(),
            threadId: faberProofExchangeRecord.threadId,
            state: src_1.ProofState.ProposalReceived,
            protocolVersion: 'v1',
        });
        // Accept Proposal
        const acceptProposalOptions = {
            proofRecordId: faberProofExchangeRecord.id,
        };
        aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
            threadId: faberProofExchangeRecord.threadId,
            state: src_1.ProofState.RequestReceived,
        });
        tests_1.testLogger.test('Faber accepts presentation proposal from Alice');
        faberProofExchangeRecord = yield faberAgent.proofs.acceptProposal(acceptProposalOptions);
        tests_1.testLogger.test('Alice waits for proof request from Faber');
        aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
        request = yield faberAgent.proofs.findRequestMessage(faberProofExchangeRecord.id);
        expect(request).toMatchObject({
            type: 'https://didcomm.org/present-proof/1.0/request-presentation',
            id: expect.any(String),
            requestAttachments: [
                {
                    id: 'libindy-request-presentation-0',
                    mimeType: 'application/json',
                    data: {
                        base64: expect.any(String),
                    },
                },
            ],
            thread: {
                threadId: faberProofExchangeRecord.threadId,
            },
        });
        expect(aliceProofExchangeRecord).toMatchObject({
            id: expect.anything(),
            threadId: faberProofExchangeRecord.threadId,
            state: src_1.ProofState.RequestReceived,
            protocolVersion: 'v1',
        });
        const proposalMessage = yield aliceAgent.proofs.findProposalMessage(aliceProofExchangeRecord.id);
        expect(proposalMessage).toMatchObject({
            type: 'https://didcomm.org/present-proof/1.0/propose-presentation',
            id: expect.any(String),
            comment: 'V1 propose proof test 2',
            presentationProposal: {
                type: 'https://didcomm.org/present-proof/1.0/presentation-preview',
                attributes: [],
                predicates: [
                    {
                        name: 'age',
                        credentialDefinitionId,
                        predicate: '>=',
                        threshold: 18,
                    },
                ],
            },
        });
        const proofRequestMessage = (yield aliceAgent.proofs.findRequestMessage(aliceProofExchangeRecord.id));
        const predicateKey = Object.keys((_b = (_a = proofRequestMessage.indyProofRequest) === null || _a === void 0 ? void 0 : _a.requested_predicates) !== null && _b !== void 0 ? _b : {})[0];
        expect(proofRequestMessage.indyProofRequest).toMatchObject({
            name: 'Proof Request',
            version: '1.0',
            requested_attributes: {},
            requested_predicates: {
                [predicateKey]: {
                    p_type: '>=',
                    p_value: 18,
                    restrictions: [
                        {
                            cred_def_id: credentialDefinitionId,
                        },
                    ],
                },
            },
        });
    }));
});
