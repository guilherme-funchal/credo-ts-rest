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
describe('Present Proof | V1ProofProtocol', () => {
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
            issuerName: 'Faber - V1 Indy Proof Request',
            holderName: 'Alice - V1 Indy Proof Request',
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
    test(`Alice Creates and sends Proof Proposal to Faber and Faber accepts the proposal`, () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Alice sends proof proposal to Faber');
        const faberProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(faberAgent, {
            state: src_1.ProofState.ProposalReceived,
        });
        let aliceProofExchangeRecord = yield aliceAgent.proofs.proposeProof({
            connectionId: aliceConnectionId,
            protocolVersion: 'v1',
            proofFormats: {
                indy: {
                    name: 'Proof Request',
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
        expect(proposal === null || proposal === void 0 ? void 0 : proposal.toJSON()).toMatchObject({
            '@type': 'https://didcomm.org/present-proof/1.0/propose-presentation',
            '@id': expect.any(String),
            comment: 'V1 propose proof test',
            presentation_proposal: {
                '@type': 'https://didcomm.org/present-proof/1.0/presentation-preview',
                attributes: [
                    {
                        name: 'name',
                        cred_def_id: credentialDefinitionId,
                        value: 'John',
                        referent: '0',
                    },
                ],
                predicates: [
                    {
                        name: 'age',
                        cred_def_id: credentialDefinitionId,
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
        const aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
            threadId: faberProofExchangeRecord.threadId,
            state: src_1.ProofState.RequestReceived,
        });
        // Accept Proposal
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
    }));
});
