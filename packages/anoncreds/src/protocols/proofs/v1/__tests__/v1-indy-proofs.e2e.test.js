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
const messages_1 = require("../messages");
describe('Present Proof', () => {
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
            credentialDefinitionId,
            issuerHolderConnectionId: faberConnectionId,
            holderIssuerConnectionId: aliceConnectionId,
        } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber Proofs V1 - Full',
            holderName: 'Alice Proofs V1 - Full',
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
    test('Alice starts with proof proposal to Faber', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        // Alice sends a presentation proposal to Faber
        tests_1.testLogger.test('Alice sends a presentation proposal to Faber');
        let faberProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(faberAgent, {
            state: src_1.ProofState.ProposalReceived,
        });
        let aliceProofExchangeRecord = yield aliceAgent.proofs.proposeProof({
            connectionId: aliceConnectionId,
            protocolVersion: 'v1',
            proofFormats: {
                indy: {
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
        });
        // Faber waits for a presentation proposal from Alice
        tests_1.testLogger.test('Faber waits for a presentation proposal from Alice');
        let faberProofExchangeRecord = yield faberProofExchangeRecordPromise;
        const proposal = yield faberAgent.proofs.findProposalMessage(faberProofExchangeRecord.id);
        expect(proposal).toMatchObject({
            type: 'https://didcomm.org/present-proof/1.0/propose-presentation',
            id: expect.any(String),
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
        expect(faberProofExchangeRecord.id).not.toBeNull();
        expect(faberProofExchangeRecord).toMatchObject({
            threadId: faberProofExchangeRecord.threadId,
            state: src_1.ProofState.ProposalReceived,
            protocolVersion: 'v1',
        });
        let aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
            threadId: aliceProofExchangeRecord.threadId,
            state: src_1.ProofState.RequestReceived,
        });
        // Faber accepts the presentation proposal from Alice
        tests_1.testLogger.test('Faber accepts presentation proposal from Alice');
        faberProofExchangeRecord = yield faberAgent.proofs.acceptProposal({
            proofRecordId: faberProofExchangeRecord.id,
        });
        // Alice waits for presentation request from Faber
        tests_1.testLogger.test('Alice waits for presentation request from Faber');
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
        // Alice retrieves the requested credentials and accepts the presentation request
        tests_1.testLogger.test('Alice accepts presentation request from Faber');
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
        tests_1.testLogger.test('Faber accepts the presentation provided by Alice');
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
        const proposalMessage = yield aliceAgent.proofs.findProposalMessage(aliceProofExchangeRecord.id);
        const requestMessage = yield aliceAgent.proofs.findRequestMessage(aliceProofExchangeRecord.id);
        const presentationMessage = yield aliceAgent.proofs.findPresentationMessage(aliceProofExchangeRecord.id);
        expect(proposalMessage).toBeInstanceOf(messages_1.V1ProposePresentationMessage);
        expect(requestMessage).toBeInstanceOf(messages_1.V1RequestPresentationMessage);
        expect(presentationMessage).toBeInstanceOf(messages_1.V1PresentationMessage);
        const formatData = yield aliceAgent.proofs.getFormatData(aliceProofExchangeRecord.id);
        const proposalPredicateKey = Object.keys(((_b = (_a = formatData.proposal) === null || _a === void 0 ? void 0 : _a.indy) === null || _b === void 0 ? void 0 : _b.requested_predicates) || {})[0];
        const requestPredicateKey = Object.keys(((_d = (_c = formatData.request) === null || _c === void 0 ? void 0 : _c.indy) === null || _d === void 0 ? void 0 : _d.requested_predicates) || {})[0];
        expect(formatData).toMatchObject({
            proposal: {
                indy: {
                    name: 'Proof Request',
                    version: '1.0',
                    nonce: expect.any(String),
                    requested_attributes: {
                        0: {
                            name: 'name',
                        },
                    },
                    requested_predicates: {
                        [proposalPredicateKey]: {
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
            request: {
                indy: {
                    name: 'Proof Request',
                    version: '1.0',
                    nonce: expect.any(String),
                    requested_attributes: {
                        0: {
                            name: 'name',
                        },
                    },
                    requested_predicates: {
                        [requestPredicateKey]: {
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
            presentation: {
                indy: {
                    proof: expect.any(Object),
                    requested_proof: expect.any(Object),
                    identifiers: expect.any(Array),
                },
            },
        });
    }));
    test('Faber starts with proof request to Alice', () => __awaiter(void 0, void 0, void 0, function* () {
        let aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
            state: src_1.ProofState.RequestReceived,
        });
        // Faber sends a presentation request to Alice
        tests_1.testLogger.test('Faber sends a presentation request to Alice');
        let faberProofExchangeRecord = yield faberAgent.proofs.requestProof({
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
        // Alice waits for presentation request from Faber
        tests_1.testLogger.test('Alice waits for presentation request from Faber');
        let aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
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
        });
        expect(aliceProofExchangeRecord.id).not.toBeNull();
        expect(aliceProofExchangeRecord).toMatchObject({
            threadId: aliceProofExchangeRecord.threadId,
            state: src_1.ProofState.RequestReceived,
            protocolVersion: 'v1',
        });
        // Alice retrieves the requested credentials and accepts the presentation request
        tests_1.testLogger.test('Alice accepts presentation request from Faber');
        const requestedCredentials = yield aliceAgent.proofs.selectCredentialsForRequest({
            proofRecordId: aliceProofExchangeRecord.id,
        });
        const faberProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(faberAgent, {
            threadId: aliceProofExchangeRecord.threadId,
            state: src_1.ProofState.PresentationReceived,
        });
        yield aliceAgent.proofs.acceptRequest({
            proofRecordId: aliceProofExchangeRecord.id,
            proofFormats: { indy: requestedCredentials.proofFormats.indy },
        });
        // Faber waits until it receives a presentation from Alice
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
        // Faber accepts the presentation
        tests_1.testLogger.test('Faber accept the presentation from Alice');
        yield faberAgent.proofs.acceptPresentation({ proofRecordId: faberProofExchangeRecord.id });
        // Alice waits until she receives a presentation acknowledgement
        tests_1.testLogger.test('Alice waits for acceptance by Faber');
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
    test('an attribute group name matches with a predicate group name so an error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(faberAgent.proofs.requestProof({
            protocolVersion: 'v1',
            connectionId: faberConnectionId,
            proofFormats: {
                indy: {
                    name: 'proof-request',
                    version: '1.0',
                    requested_attributes: {
                        age: {
                            name: 'age',
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
        })).rejects.toThrowError(`The proof request contains duplicate predicates and attributes: age`);
    }));
    test('Faber starts with proof request to Alice but gets Problem Reported', () => __awaiter(void 0, void 0, void 0, function* () {
        const aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
            state: src_1.ProofState.RequestReceived,
        });
        // Faber sends a presentation request to Alice
        tests_1.testLogger.test('Faber sends a presentation request to Alice');
        let faberProofExchangeRecord = yield faberAgent.proofs.requestProof({
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
        // Alice waits for presentation request from Faber
        tests_1.testLogger.test('Alice waits for presentation request from Faber');
        let aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
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
        });
        expect(aliceProofExchangeRecord.id).not.toBeNull();
        expect(aliceProofExchangeRecord).toMatchObject({
            threadId: aliceProofExchangeRecord.threadId,
            state: src_1.ProofState.RequestReceived,
            protocolVersion: 'v1',
        });
        const faberProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(faberAgent, {
            threadId: aliceProofExchangeRecord.threadId,
            state: src_1.ProofState.Abandoned,
        });
        aliceProofExchangeRecord = yield aliceAgent.proofs.sendProblemReport({
            proofRecordId: aliceProofExchangeRecord.id,
            description: 'Problem inside proof request',
        });
        faberProofExchangeRecord = yield faberProofExchangeRecordPromise;
        expect(faberProofExchangeRecord).toMatchObject({
            threadId: aliceProofExchangeRecord.threadId,
            state: src_1.ProofState.Abandoned,
            protocolVersion: 'v1',
        });
    }));
});
