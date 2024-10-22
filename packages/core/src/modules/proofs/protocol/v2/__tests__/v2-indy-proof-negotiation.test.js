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
const AnonCredsProofRequest_1 = require("../../../../../../../anoncreds/src/models/AnonCredsProofRequest");
const legacyAnonCredsSetup_1 = require("../../../../../../../anoncreds/tests/legacyAnonCredsSetup");
const tests_1 = require("../../../../../../tests");
const JsonTransformer_1 = require("../../../../../utils/JsonTransformer");
const ProofState_1 = require("../../../models/ProofState");
describe('V2 Proofs Negotiation - Indy', () => {
    let faberAgent;
    let faberReplay;
    let aliceAgent;
    let aliceReplay;
    let faberConnectionId;
    let aliceConnectionId;
    let credentialDefinitionId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Initializing the agents');
        ({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            issuerHolderConnectionId: faberConnectionId,
            holderIssuerConnectionId: aliceConnectionId,
            credentialDefinitionId,
        } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber agent v2',
            holderName: 'Alice agent v2',
            attributeNames: ['name', 'age'],
        }));
        yield (0, legacyAnonCredsSetup_1.issueLegacyAnonCredsCredential)({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            issuerHolderConnectionId: faberConnectionId,
            offer: {
                credentialDefinitionId,
                attributes: [
                    {
                        name: 'name',
                        value: 'Alice',
                    },
                    {
                        name: 'age',
                        value: '99',
                    },
                ],
            },
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Shutting down both agents');
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test(`Proof negotiation between Alice and Faber`, () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        tests_1.testLogger.test('Alice sends proof proposal to Faber');
        let aliceProofExchangeRecord = yield aliceAgent.proofs.proposeProof({
            connectionId: aliceConnectionId,
            protocolVersion: 'v2',
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
                            threshold: 50,
                        },
                    ],
                },
            },
            comment: 'V2 propose proof test 1',
        });
        tests_1.testLogger.test('Faber waits for presentation from Alice');
        let faberProofExchangeRecord = yield (0, tests_1.waitForProofExchangeRecordSubject)(faberReplay, {
            state: ProofState_1.ProofState.ProposalReceived,
            threadId: aliceProofExchangeRecord.threadId,
        });
        const proposal = yield faberAgent.proofs.findProposalMessage(faberProofExchangeRecord.id);
        expect(proposal).toMatchObject({
            type: 'https://didcomm.org/present-proof/2.0/propose-presentation',
            formats: [
                {
                    attachmentId: expect.any(String),
                    format: 'hlindy/proof-req@v2.0',
                },
            ],
            proposalAttachments: [
                {
                    id: expect.any(String),
                    mimeType: 'application/json',
                    data: {
                        base64: expect.any(String),
                    },
                },
            ],
            id: expect.any(String),
            comment: 'V2 propose proof test 1',
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const proposalAttach = (_a = proposal === null || proposal === void 0 ? void 0 : proposal.proposalAttachments) === null || _a === void 0 ? void 0 : _a[0].getDataAsJson();
        expect(proposalAttach).toMatchObject({
            requested_attributes: {},
            requested_predicates: {
                [Object.keys(proposalAttach.requested_predicates)[0]]: {
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
        });
        expect(faberProofExchangeRecord).toMatchObject({
            id: expect.anything(),
            threadId: faberProofExchangeRecord.threadId,
            state: ProofState_1.ProofState.ProposalReceived,
            protocolVersion: 'v2',
        });
        tests_1.testLogger.test('Faber sends new proof request to Alice');
        faberProofExchangeRecord = yield faberAgent.proofs.negotiateProposal({
            proofRecordId: faberProofExchangeRecord.id,
            proofFormats: {
                indy: {
                    name: 'proof-request',
                    version: '1.0',
                    requested_attributes: {
                        name: {
                            name: 'name',
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                    },
                    requested_predicates: {
                        age: {
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
        aliceProofExchangeRecord = yield (0, tests_1.waitForProofExchangeRecordSubject)(aliceReplay, {
            threadId: faberProofExchangeRecord.threadId,
            state: ProofState_1.ProofState.RequestReceived,
        });
        const request = yield faberAgent.proofs.findRequestMessage(faberProofExchangeRecord.id);
        expect(request).toMatchObject({
            type: 'https://didcomm.org/present-proof/2.0/request-presentation',
            id: expect.any(String),
            requestAttachments: [
                {
                    id: expect.any(String),
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
            state: ProofState_1.ProofState.RequestReceived,
            protocolVersion: 'v2',
        });
        tests_1.testLogger.test('Alice sends proof proposal to Faber');
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
                            threshold: 50,
                        },
                    ],
                },
            },
            comment: 'V2 propose proof test 2',
        });
        tests_1.testLogger.test('Faber waits for presentation from Alice');
        faberProofExchangeRecord = yield (0, tests_1.waitForProofExchangeRecordSubject)(faberReplay, {
            state: ProofState_1.ProofState.ProposalReceived,
            threadId: aliceProofExchangeRecord.threadId,
            // Negotiation so this will be the second proposal
            count: 2,
        });
        const proposal2 = yield faberAgent.proofs.findProposalMessage(faberProofExchangeRecord.id);
        expect(proposal2).toMatchObject({
            type: 'https://didcomm.org/present-proof/2.0/propose-presentation',
            formats: [
                {
                    attachmentId: expect.any(String),
                    format: 'hlindy/proof-req@v2.0',
                },
            ],
            proposalAttachments: [
                {
                    id: expect.any(String),
                    mimeType: 'application/json',
                    data: {
                        base64: expect.any(String),
                    },
                },
            ],
            id: expect.any(String),
            comment: 'V2 propose proof test 2',
        });
        const proposalAttach2 = proposal === null || proposal === void 0 ? void 0 : proposal.proposalAttachments[0].getDataAsJson();
        expect(proposalAttach2).toMatchObject({
            requested_attributes: {},
            requested_predicates: {
                [Object.keys(proposalAttach2.requested_predicates)[0]]: {
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
        });
        expect(faberProofExchangeRecord).toMatchObject({
            id: expect.anything(),
            threadId: faberProofExchangeRecord.threadId,
            state: ProofState_1.ProofState.ProposalReceived,
            protocolVersion: 'v2',
        });
        // Accept Proposal
        tests_1.testLogger.test('Faber accepts presentation proposal from Alice');
        faberProofExchangeRecord = yield faberAgent.proofs.acceptProposal({
            proofRecordId: faberProofExchangeRecord.id,
        });
        tests_1.testLogger.test('Alice waits for proof request from Faber');
        aliceProofExchangeRecord = yield (0, tests_1.waitForProofExchangeRecordSubject)(aliceReplay, {
            threadId: faberProofExchangeRecord.threadId,
            state: ProofState_1.ProofState.RequestReceived,
            // Negotiation so this will be the second request
            count: 2,
        });
        const request2 = yield faberAgent.proofs.findRequestMessage(faberProofExchangeRecord.id);
        expect(request2).toMatchObject({
            type: 'https://didcomm.org/present-proof/2.0/request-presentation',
            formats: [
                {
                    attachmentId: expect.any(String),
                    format: 'hlindy/proof-req@v2.0',
                },
            ],
            requestAttachments: [
                {
                    id: expect.any(String),
                    mimeType: 'application/json',
                    data: {
                        base64: expect.any(String),
                    },
                },
            ],
            id: expect.any(String),
            thread: {
                threadId: faberProofExchangeRecord.threadId,
            },
        });
        expect(aliceProofExchangeRecord).toMatchObject({
            id: expect.anything(),
            threadId: faberProofExchangeRecord.threadId,
            state: ProofState_1.ProofState.RequestReceived,
            protocolVersion: 'v2',
        });
        const proposalMessage = yield aliceAgent.proofs.findProposalMessage(aliceProofExchangeRecord.id);
        expect(proposalMessage).toMatchObject({
            type: 'https://didcomm.org/present-proof/2.0/propose-presentation',
            formats: [
                {
                    attachmentId: expect.any(String),
                    format: 'hlindy/proof-req@v2.0',
                },
            ],
            proposalAttachments: [
                {
                    id: expect.any(String),
                    mimeType: 'application/json',
                    data: {
                        base64: expect.any(String),
                    },
                },
            ],
            id: expect.any(String),
            comment: 'V2 propose proof test 2',
        });
        const proposalAttach3 = proposal === null || proposal === void 0 ? void 0 : proposal.proposalAttachments[0].getDataAsJson();
        expect(proposalAttach3).toMatchObject({
            requested_attributes: {},
            requested_predicates: {
                [Object.keys((_b = proposalAttach3.requested_predicates) !== null && _b !== void 0 ? _b : {})[0]]: {
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
        });
        const proofRequestMessage = (yield aliceAgent.proofs.findRequestMessage(aliceProofExchangeRecord.id));
        const proofRequest = JsonTransformer_1.JsonTransformer.fromJSON(proofRequestMessage.requestAttachments[0].getDataAsJson(), AnonCredsProofRequest_1.AnonCredsProofRequest);
        const predicateKey = (_c = proofRequest.requestedPredicates) === null || _c === void 0 ? void 0 : _c.keys().next().value;
        expect(JsonTransformer_1.JsonTransformer.toJSON(proofRequest)).toMatchObject({
            name: 'proof-request',
            nonce: expect.any(String),
            version: '1.0',
            requested_attributes: {},
            requested_predicates: {
                [predicateKey]: {
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
        });
    }));
});
