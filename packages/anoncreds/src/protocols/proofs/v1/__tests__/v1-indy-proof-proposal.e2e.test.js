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
    test(`Alice Creates and sends Proof Proposal to Faber`, () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Alice sends proof proposal to Faber');
        const faberProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(faberAgent, {
            state: src_1.ProofState.ProposalReceived,
        });
        yield aliceAgent.proofs.proposeProof({
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
        const faberProofExchangeRecord = yield faberProofExchangeRecordPromise;
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
    }));
});
