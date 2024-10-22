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
    let faberReplay;
    let aliceAgent;
    let aliceReplay;
    let aliceConnectionId;
    let faberConnectionId;
    let credentialDefinitionId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Initializing the agents');
        ({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            credentialDefinitionId,
            holderIssuerConnectionId: aliceConnectionId,
            issuerHolderConnectionId: faberConnectionId,
        } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber - V1 Indy Proof',
            holderName: 'Alice - V1 Indy Proof',
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
                        value: 'John',
                    },
                    {
                        name: 'age',
                        value: '55',
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
        let faberProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(faberAgent, {
            state: src_1.ProofState.ProposalReceived,
        });
        let aliceProofExchangeRecord = yield aliceAgent.proofs.proposeProof({
            connectionId: aliceConnectionId,
            protocolVersion: 'v1',
            proofFormats: {
                indy: {
                    name: 'ProofRequest',
                    version: '1.0',
                    attributes: [
                        {
                            name: 'name',
                            value: 'John',
                            credentialDefinitionId,
                            referent: '0',
                        },
                    ],
                    predicates: [
                        {
                            name: 'age',
                            predicate: '>=',
                            threshold: 50,
                            credentialDefinitionId,
                        },
                    ],
                },
            },
            comment: 'V1 propose proof test',
        });
        tests_1.testLogger.test('Faber waits for presentation from Alice');
        let faberProofExchangeRecord = yield faberProofExchangeRecordPromise;
        const proposal = yield faberAgent.proofs.findProposalMessage(faberProofExchangeRecord.id);
        expect(proposal).toMatchObject({
            type: 'https://didcomm.org/present-proof/1.0/propose-presentation',
            id: expect.any(String),
            comment: 'V1 propose proof test',
            presentationProposal: {
                type: 'https://didcomm.org/present-proof/1.0/presentation-preview',
                attributes: [
                    {
                        name: 'name',
                        credentialDefinitionId,
                        value: 'John',
                        referent: '0',
                    },
                ],
                predicates: [
                    {
                        name: 'age',
                        credentialDefinitionId,
                        predicate: '>=',
                        threshold: 50,
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
        let aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
            threadId: faberProofExchangeRecord.threadId,
            state: src_1.ProofState.RequestReceived,
        });
        tests_1.testLogger.test('Faber accepts presentation proposal from Alice');
        faberProofExchangeRecord = yield faberAgent.proofs.acceptProposal({
            proofRecordId: faberProofExchangeRecord.id,
        });
        tests_1.testLogger.test('Alice waits for proof request from Faber');
        aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
        const request = yield faberAgent.proofs.findRequestMessage(faberProofExchangeRecord.id);
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
        const requestedCredentials = yield aliceAgent.proofs.selectCredentialsForRequest({
            proofRecordId: aliceProofExchangeRecord.id,
        });
        faberProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(faberAgent, {
            threadId: aliceProofExchangeRecord.threadId,
            state: src_1.ProofState.PresentationReceived,
        });
        yield aliceAgent.proofs.acceptRequest({
            proofRecordId: aliceProofExchangeRecord.id,
            proofFormats: { indy: requestedCredentials.proofFormats.indy },
        });
        // Faber waits for the presentation from Alice
        tests_1.testLogger.test('Faber waits for presentation from Alice');
        faberProofExchangeRecord = yield faberProofExchangeRecordPromise;
        const presentation = yield faberAgent.proofs.findPresentationMessage(faberProofExchangeRecord.id);
        expect(presentation).toMatchObject({
            type: 'https://didcomm.org/present-proof/1.0/presentation',
            id: expect.any(String),
            presentationAttachments: [
                {
                    id: 'libindy-presentation-0',
                    mimeType: 'application/json',
                    data: {
                        base64: expect.any(String),
                    },
                },
            ],
            thread: {
                threadId: expect.any(String),
            },
        });
        expect(faberProofExchangeRecord.id).not.toBeNull();
        expect(faberProofExchangeRecord).toMatchObject({
            threadId: faberProofExchangeRecord.threadId,
            state: src_1.ProofState.PresentationReceived,
            protocolVersion: 'v1',
        });
        aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
            threadId: aliceProofExchangeRecord.threadId,
            state: src_1.ProofState.Done,
        });
        // Faber accepts the presentation provided by Alice
        yield faberAgent.proofs.acceptPresentation({ proofRecordId: faberProofExchangeRecord.id });
        // Alice waits until she received a presentation acknowledgement
        tests_1.testLogger.test('Alice waits until she receives a presentation acknowledgement');
        aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
        expect(faberProofExchangeRecord).toMatchObject({
            type: src_1.ProofExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            threadId: aliceProofExchangeRecord.threadId,
            connectionId: expect.any(String),
            isVerified: true,
            state: src_1.ProofState.PresentationReceived,
        });
        expect(aliceProofExchangeRecord).toMatchObject({
            type: src_1.ProofExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            threadId: faberProofExchangeRecord.threadId,
            connectionId: expect.any(String),
            state: src_1.ProofState.Done,
        });
    }));
});
