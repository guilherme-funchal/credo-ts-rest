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
describe('Auto accept present proof', () => {
    let faberAgent;
    let faberReplay;
    let aliceAgent;
    let aliceReplay;
    let faberConnectionId;
    let aliceConnectionId;
    let credentialDefinitionId;
    describe("Auto accept on 'always'", () => {
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            ;
            ({
                issuerAgent: faberAgent,
                issuerReplay: faberReplay,
                holderAgent: aliceAgent,
                holderReplay: aliceReplay,
                credentialDefinitionId,
                issuerHolderConnectionId: faberConnectionId,
                holderIssuerConnectionId: aliceConnectionId,
            } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
                issuerName: 'Faber Auto Accept Always Proofs',
                holderName: 'Alice Auto Accept Always Proofs',
                autoAcceptProofs: src_1.AutoAcceptProof.Always,
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
                        { name: 'name', value: 'John' },
                        { name: 'age', value: '99' },
                    ],
                },
            });
        }));
        afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield faberAgent.shutdown();
            yield faberAgent.wallet.delete();
            yield aliceAgent.shutdown();
            yield aliceAgent.wallet.delete();
        }));
        test("Alice starts with proof proposal to Faber, both with autoAcceptProof on 'always'", () => __awaiter(void 0, void 0, void 0, function* () {
            tests_1.testLogger.test('Alice sends presentation proposal to Faber');
            yield aliceAgent.proofs.proposeProof({
                connectionId: aliceConnectionId,
                protocolVersion: 'v1',
                proofFormats: {
                    indy: {
                        name: 'abc',
                        version: '1.0',
                        attributes: [
                            {
                                name: 'name',
                                value: 'John',
                                credentialDefinitionId,
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
            });
            tests_1.testLogger.test('Faber waits for presentation from Alice');
            tests_1.testLogger.test('Alice waits till it receives presentation ack');
            yield Promise.all([
                (0, tests_1.waitForProofExchangeRecord)(faberAgent, { state: src_1.ProofState.Done }),
                (0, tests_1.waitForProofExchangeRecord)(aliceAgent, { state: src_1.ProofState.Done }),
            ]);
        }));
        test("Faber starts with proof requests to Alice, both with autoAcceptProof on 'always'", () => __awaiter(void 0, void 0, void 0, function* () {
            tests_1.testLogger.test('Faber sends presentation request to Alice');
            yield faberAgent.proofs.requestProof({
                protocolVersion: 'v1',
                connectionId: faberConnectionId,
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
            tests_1.testLogger.test('Faber waits for presentation from Alice');
            yield Promise.all([
                (0, tests_1.waitForProofExchangeRecord)(faberAgent, { state: src_1.ProofState.Done }),
                (0, tests_1.waitForProofExchangeRecord)(aliceAgent, { state: src_1.ProofState.Done }),
            ]);
        }));
    });
    describe("Auto accept on 'contentApproved'", () => {
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            tests_1.testLogger.test('Initializing the agents');
            ({
                issuerAgent: faberAgent,
                issuerReplay: faberReplay,
                holderAgent: aliceAgent,
                holderReplay: aliceReplay,
                credentialDefinitionId,
                issuerHolderConnectionId: faberConnectionId,
                holderIssuerConnectionId: aliceConnectionId,
            } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
                issuerName: 'Faber Auto Accept ContentApproved Proofs',
                holderName: 'Alice Auto Accept ContentApproved Proofs',
                autoAcceptProofs: src_1.AutoAcceptProof.ContentApproved,
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
                        { name: 'name', value: 'John' },
                        { name: 'age', value: '99' },
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
        test("Alice starts with proof proposal to Faber, both with autoAcceptProof on 'contentApproved'", () => __awaiter(void 0, void 0, void 0, function* () {
            tests_1.testLogger.test('Alice sends presentation proposal to Faber');
            const aliceProofExchangeRecord = yield aliceAgent.proofs.proposeProof({
                connectionId: aliceConnectionId,
                protocolVersion: 'v1',
                proofFormats: {
                    indy: {
                        name: 'abc',
                        version: '1.0',
                        attributes: [
                            {
                                name: 'name',
                                value: 'John',
                                credentialDefinitionId,
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
            });
            tests_1.testLogger.test('Faber waits for presentation proposal from Alice');
            const faberProofExchangeRecord = yield (0, tests_1.waitForProofExchangeRecord)(faberAgent, {
                threadId: aliceProofExchangeRecord.threadId,
                state: src_1.ProofState.ProposalReceived,
            });
            tests_1.testLogger.test('Faber accepts presentation proposal from Alice');
            yield faberAgent.proofs.acceptProposal({ proofRecordId: faberProofExchangeRecord.id });
            yield Promise.all([
                (0, tests_1.waitForProofExchangeRecord)(aliceAgent, { state: src_1.ProofState.Done }),
                (0, tests_1.waitForProofExchangeRecord)(faberAgent, { state: src_1.ProofState.Done }),
            ]);
        }));
        test("Faber starts with proof requests to Alice, both with autoAcceptProof on 'contentApproved'", () => __awaiter(void 0, void 0, void 0, function* () {
            tests_1.testLogger.test('Faber sends presentation request to Alice');
            yield faberAgent.proofs.requestProof({
                protocolVersion: 'v1',
                connectionId: faberConnectionId,
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
            tests_1.testLogger.test('Alice waits for request from Faber');
            const { id: proofRecordId } = yield (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
                state: src_1.ProofState.RequestReceived,
            });
            const { proofFormats } = yield aliceAgent.proofs.selectCredentialsForRequest({ proofRecordId });
            yield aliceAgent.proofs.acceptRequest({ proofRecordId, proofFormats });
            yield Promise.all([
                (0, tests_1.waitForProofExchangeRecord)(aliceAgent, { state: src_1.ProofState.Done }),
                (0, tests_1.waitForProofExchangeRecord)(faberAgent, { state: src_1.ProofState.Done }),
            ]);
        }));
    });
});
