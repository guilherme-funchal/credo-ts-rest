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
const legacyAnonCredsSetup_1 = require("../../../../../../../anoncreds/tests/legacyAnonCredsSetup");
const tests_1 = require("../../../../../../tests");
const ProofState_1 = require("../../../models/ProofState");
const ProofExchangeRecord_1 = require("../../../repository/ProofExchangeRecord");
describe('V2 Proofs - Indy', () => {
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
    test(`Alice Creates and sends Proof Proposal to Faber`, () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Alice sends proof proposal to Faber');
        let aliceProofExchangeRecord = yield aliceAgent.proofs.proposeProof({
            connectionId: aliceConnectionId,
            protocolVersion: 'v2',
            proofFormats: {
                indy: {
                    name: 'ProofRequest',
                    version: '1.0',
                    attributes: [
                        {
                            name: 'name',
                            value: 'Alice',
                            credentialDefinitionId,
                        },
                    ],
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
            comment: 'V2 propose proof test',
        });
        tests_1.testLogger.test('Faber waits for presentation from Alice');
        let faberProofExchangeRecord = yield (0, tests_1.waitForProofExchangeRecordSubject)(faberReplay, {
            state: ProofState_1.ProofState.ProposalReceived,
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
            comment: 'V2 propose proof test',
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
        });
        const request = yield faberAgent.proofs.findRequestMessage(faberProofExchangeRecord.id);
        expect(request).toMatchObject({
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
        // Alice retrieves the requested credentials and accepts the presentation request
        tests_1.testLogger.test('Alice accepts presentation request from Faber');
        const requestedCredentials = yield aliceAgent.proofs.selectCredentialsForRequest({
            proofRecordId: aliceProofExchangeRecord.id,
        });
        yield aliceAgent.proofs.acceptRequest({
            proofRecordId: aliceProofExchangeRecord.id,
            proofFormats: { indy: requestedCredentials.proofFormats.indy },
        });
        faberProofExchangeRecord = yield (0, tests_1.waitForProofExchangeRecordSubject)(faberReplay, {
            threadId: aliceProofExchangeRecord.threadId,
            state: ProofState_1.ProofState.PresentationReceived,
        });
        // Faber waits for the presentation from Alice
        tests_1.testLogger.test('Faber waits for presentation from Alice');
        const presentation = yield faberAgent.proofs.findPresentationMessage(faberProofExchangeRecord.id);
        expect(presentation).toMatchObject({
            type: 'https://didcomm.org/present-proof/2.0/presentation',
            formats: [
                {
                    attachmentId: expect.any(String),
                    format: 'hlindy/proof@v2.0',
                },
            ],
            presentationAttachments: [
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
        expect(faberProofExchangeRecord.id).not.toBeNull();
        expect(faberProofExchangeRecord).toMatchObject({
            threadId: faberProofExchangeRecord.threadId,
            state: ProofState_1.ProofState.PresentationReceived,
            protocolVersion: 'v2',
        });
        const aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecordSubject)(aliceReplay, {
            threadId: aliceProofExchangeRecord.threadId,
            state: ProofState_1.ProofState.Done,
        });
        // Faber accepts the presentation provided by Alice
        tests_1.testLogger.test('Faber accepts the presentation provided by Alice');
        yield faberAgent.proofs.acceptPresentation({ proofRecordId: faberProofExchangeRecord.id });
        // Alice waits until she received a presentation acknowledgement
        tests_1.testLogger.test('Alice waits until she receives a presentation acknowledgement');
        aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
        expect(faberProofExchangeRecord).toMatchObject({
            type: ProofExchangeRecord_1.ProofExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            threadId: aliceProofExchangeRecord.threadId,
            connectionId: expect.any(String),
            isVerified: true,
            state: ProofState_1.ProofState.PresentationReceived,
        });
        expect(aliceProofExchangeRecord).toMatchObject({
            type: ProofExchangeRecord_1.ProofExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            threadId: faberProofExchangeRecord.threadId,
            connectionId: expect.any(String),
            state: ProofState_1.ProofState.Done,
        });
    }));
});
