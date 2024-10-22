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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const legacyAnonCredsSetup_1 = require("../../anoncreds/tests/legacyAnonCredsSetup");
const ProofState_1 = require("../src/modules/proofs/models/ProofState");
const uuid_1 = require("../src/utils/uuid");
const helpers_1 = require("./helpers");
const logger_1 = __importDefault(require("./logger"));
describe('Present Proof Subprotocol', () => {
    let faberAgent;
    let faberReplay;
    let aliceAgent;
    let aliceReplay;
    let credentialDefinitionId;
    let faberConnectionId;
    let aliceConnectionId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.test('Initializing the agents');
        ({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            credentialDefinitionId,
            issuerHolderConnectionId: faberConnectionId,
            holderIssuerConnectionId: aliceConnectionId,
        } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber agent',
            holderName: 'Alice agent',
            attributeNames: ['name', 'age'],
        }));
        yield (0, legacyAnonCredsSetup_1.issueLegacyAnonCredsCredential)({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            issuerHolderConnectionId: faberConnectionId,
            offer: {
                attributes: [
                    {
                        name: 'name',
                        value: 'Alice',
                    },
                    {
                        name: 'age',
                        value: '50',
                    },
                ],
                credentialDefinitionId,
            },
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.test('Shutting down both agents');
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('Alice starts with v1 proof proposal to Faber with parentThreadId', () => __awaiter(void 0, void 0, void 0, function* () {
        const parentThreadId = (0, uuid_1.uuid)();
        // Alice sends a presentation proposal to Faber
        logger_1.default.test('Alice sends a presentation proposal to Faber');
        const faberProofExchangeRecordPromise = (0, helpers_1.waitForProofExchangeRecord)(faberAgent, {
            parentThreadId,
            state: ProofState_1.ProofState.ProposalReceived,
        });
        const aliceProofExchangeRecord = yield aliceAgent.proofs.proposeProof({
            connectionId: aliceConnectionId,
            protocolVersion: 'v1',
            parentThreadId,
            proofFormats: {
                indy: {
                    name: 'abc',
                    version: '1.0',
                    attributes: [
                        {
                            name: 'name',
                            credentialDefinitionId,
                            value: 'Alice',
                        },
                    ],
                    predicates: [
                        {
                            credentialDefinitionId,
                            name: 'age',
                            predicate: '>=',
                            threshold: 40,
                        },
                    ],
                },
            },
        });
        expect(aliceProofExchangeRecord.parentThreadId).toBe(parentThreadId);
        const proofsByParentThread = yield aliceAgent.proofs.getByParentThreadAndConnectionId(parentThreadId);
        expect(proofsByParentThread.length).toEqual(1);
        expect(proofsByParentThread[0].parentThreadId).toBe(parentThreadId);
        const threadId = aliceProofExchangeRecord.threadId;
        logger_1.default.test('Faber waits for a presentation proposal from Alice');
        let faberProofExchangeRecord = yield faberProofExchangeRecordPromise;
        // Faber accepts the presentation proposal from Alice
        logger_1.default.test('Faber accepts the presentation proposal from Alice');
        yield faberAgent.proofs.acceptProposal({ proofRecordId: faberProofExchangeRecord.id });
        logger_1.default.test('Alice waits till it receives presentation ack');
        yield (0, helpers_1.waitForProofExchangeRecord)(aliceAgent, {
            threadId,
            parentThreadId,
            state: ProofState_1.ProofState.RequestReceived,
        });
        // Alice retrieves the requested credentials and accepts the presentation request
        logger_1.default.test('Alice accepts presentation request from Faber');
        const requestedCredentials = yield aliceAgent.proofs.selectCredentialsForRequest({
            proofRecordId: aliceProofExchangeRecord.id,
        });
        yield aliceAgent.proofs.acceptRequest({
            proofRecordId: aliceProofExchangeRecord.id,
            proofFormats: requestedCredentials.proofFormats,
        });
        logger_1.default.test('Faber waits for presentation from Alice');
        faberProofExchangeRecord = yield (0, helpers_1.waitForProofExchangeRecord)(faberAgent, {
            threadId,
            parentThreadId,
            state: ProofState_1.ProofState.PresentationReceived,
        });
        // Faber accepts the presentation provided by Alice
        logger_1.default.test('Faber accepts the presentation provided by Alice');
        yield faberAgent.proofs.acceptPresentation({ proofRecordId: faberProofExchangeRecord.id });
        // Alice waits until she received a presentation acknowledgement
        logger_1.default.test('Alice waits until she receives a presentation acknowledgement');
        yield (0, helpers_1.waitForProofExchangeRecord)(aliceAgent, {
            threadId,
            parentThreadId,
            state: ProofState_1.ProofState.Done,
        });
    }));
    test('Faber starts with v1 proof requests to Alice with parentThreadId', () => __awaiter(void 0, void 0, void 0, function* () {
        const parentThreadId = (0, uuid_1.uuid)();
        logger_1.default.test('Faber sends presentation request to Alice');
        const aliceProofExchangeRecordPromise = (0, helpers_1.waitForProofExchangeRecord)(aliceAgent, {
            parentThreadId,
            state: ProofState_1.ProofState.RequestReceived,
        });
        // Faber sends a presentation request to Alice
        logger_1.default.test('Faber sends a presentation request to Alice');
        const faberProofExchangeRecord = yield faberAgent.proofs.requestProof({
            connectionId: faberConnectionId,
            parentThreadId,
            protocolVersion: 'v1',
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
        expect(faberProofExchangeRecord.parentThreadId).toBe(parentThreadId);
        const proofsByParentThread = yield faberAgent.proofs.getByParentThreadAndConnectionId(parentThreadId);
        expect(proofsByParentThread.length).toEqual(1);
        expect(proofsByParentThread[0].parentThreadId).toBe(parentThreadId);
        const threadId = faberProofExchangeRecord.threadId;
        // Alice waits for presentation request from Faber
        logger_1.default.test('Alice waits for presentation request from Faber');
        const aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
        // Alice retrieves the requested credentials and accepts the presentation request
        logger_1.default.test('Alice accepts presentation request from Faber');
        const requestedCredentials = yield aliceAgent.proofs.selectCredentialsForRequest({
            proofRecordId: aliceProofExchangeRecord.id,
        });
        yield aliceAgent.proofs.acceptRequest({
            proofRecordId: aliceProofExchangeRecord.id,
            proofFormats: requestedCredentials.proofFormats,
        });
        // Faber waits until it receives a presentation from Alice
        logger_1.default.test('Faber waits for presentation from Alice');
        yield (0, helpers_1.waitForProofExchangeRecord)(faberAgent, {
            threadId,
            parentThreadId,
            state: ProofState_1.ProofState.PresentationReceived,
        });
        // Faber accepts the presentation
        logger_1.default.test('Faber accept the presentation from Alice');
        yield faberAgent.proofs.acceptPresentation({ proofRecordId: faberProofExchangeRecord.id });
        // Alice waits until she receives a presentation acknowledgement
        logger_1.default.test('Alice waits for acceptance by Faber');
        yield (0, helpers_1.waitForProofExchangeRecord)(aliceAgent, {
            threadId,
            parentThreadId,
            state: ProofState_1.ProofState.Done,
        });
    }));
    test('Alice starts with v2 proof proposal to Faber with parentThreadId', () => __awaiter(void 0, void 0, void 0, function* () {
        const parentThreadId = (0, uuid_1.uuid)();
        // Alice sends a presentation proposal to Faber
        logger_1.default.test('Alice sends a presentation proposal to Faber');
        const faberProofExchangeRecordPromise = (0, helpers_1.waitForProofExchangeRecord)(faberAgent, {
            parentThreadId,
            state: ProofState_1.ProofState.ProposalReceived,
        });
        const aliceProofExchangeRecord = yield aliceAgent.proofs.proposeProof({
            connectionId: aliceConnectionId,
            protocolVersion: 'v2',
            parentThreadId,
            proofFormats: {
                indy: {
                    name: 'abc',
                    version: '1.0',
                    attributes: [
                        {
                            name: 'name',
                            credentialDefinitionId,
                            value: 'Alice',
                        },
                    ],
                    predicates: [
                        {
                            credentialDefinitionId,
                            name: 'age',
                            predicate: '>=',
                            threshold: 40,
                        },
                    ],
                },
            },
        });
        expect(aliceProofExchangeRecord.parentThreadId).toBe(parentThreadId);
        const proofsByParentThread = yield aliceAgent.proofs.getByParentThreadAndConnectionId(parentThreadId);
        expect(proofsByParentThread.length).toEqual(1);
        expect(proofsByParentThread[0].parentThreadId).toBe(parentThreadId);
        const threadId = aliceProofExchangeRecord.threadId;
        logger_1.default.test('Faber waits for a presentation proposal from Alice');
        let faberProofExchangeRecord = yield faberProofExchangeRecordPromise;
        // Faber accepts the presentation proposal from Alice
        logger_1.default.test('Faber accepts the presentation proposal from Alice');
        yield faberAgent.proofs.acceptProposal({ proofRecordId: faberProofExchangeRecord.id });
        logger_1.default.test('Alice waits till it receives presentation ack');
        yield (0, helpers_1.waitForProofExchangeRecord)(aliceAgent, {
            threadId,
            parentThreadId,
            state: ProofState_1.ProofState.RequestReceived,
        });
        // Alice retrieves the requested credentials and accepts the presentation request
        logger_1.default.test('Alice accepts presentation request from Faber');
        const requestedCredentials = yield aliceAgent.proofs.selectCredentialsForRequest({
            proofRecordId: aliceProofExchangeRecord.id,
        });
        yield aliceAgent.proofs.acceptRequest({
            proofRecordId: aliceProofExchangeRecord.id,
            proofFormats: requestedCredentials.proofFormats,
        });
        logger_1.default.test('Faber waits for presentation from Alice');
        faberProofExchangeRecord = yield (0, helpers_1.waitForProofExchangeRecord)(faberAgent, {
            threadId,
            parentThreadId,
            state: ProofState_1.ProofState.PresentationReceived,
        });
        // Faber accepts the presentation provided by Alice
        logger_1.default.test('Faber accepts the presentation provided by Alice');
        yield faberAgent.proofs.acceptPresentation({ proofRecordId: faberProofExchangeRecord.id });
        // Alice waits until she received a presentation acknowledgement
        logger_1.default.test('Alice waits until she receives a presentation acknowledgement');
        yield (0, helpers_1.waitForProofExchangeRecord)(aliceAgent, {
            threadId,
            parentThreadId,
            state: ProofState_1.ProofState.Done,
        });
    }));
    test('Faber starts with v2 proof requests to Alice with parentThreadId', () => __awaiter(void 0, void 0, void 0, function* () {
        const parentThreadId = (0, uuid_1.uuid)();
        logger_1.default.test('Faber sends presentation request to Alice');
        const aliceProofExchangeRecordPromise = (0, helpers_1.waitForProofExchangeRecord)(aliceAgent, {
            parentThreadId,
            state: ProofState_1.ProofState.RequestReceived,
        });
        // Faber sends a presentation request to Alice
        logger_1.default.test('Faber sends a presentation request to Alice');
        const faberProofExchangeRecord = yield faberAgent.proofs.requestProof({
            connectionId: faberConnectionId,
            parentThreadId,
            protocolVersion: 'v2',
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
        expect(faberProofExchangeRecord.parentThreadId).toBe(parentThreadId);
        const proofsByParentThread = yield faberAgent.proofs.getByParentThreadAndConnectionId(parentThreadId);
        expect(proofsByParentThread.length).toEqual(1);
        expect(proofsByParentThread[0].parentThreadId).toBe(parentThreadId);
        const threadId = faberProofExchangeRecord.threadId;
        // Alice waits for presentation request from Faber
        logger_1.default.test('Alice waits for presentation request from Faber');
        const aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
        // Alice retrieves the requested credentials and accepts the presentation request
        logger_1.default.test('Alice accepts presentation request from Faber');
        const requestedCredentials = yield aliceAgent.proofs.selectCredentialsForRequest({
            proofRecordId: aliceProofExchangeRecord.id,
        });
        yield aliceAgent.proofs.acceptRequest({
            proofRecordId: aliceProofExchangeRecord.id,
            proofFormats: requestedCredentials.proofFormats,
        });
        // Faber waits until it receives a presentation from Alice
        logger_1.default.test('Faber waits for presentation from Alice');
        yield (0, helpers_1.waitForProofExchangeRecord)(faberAgent, {
            threadId,
            parentThreadId,
            state: ProofState_1.ProofState.PresentationReceived,
        });
        // Faber accepts the presentation
        logger_1.default.test('Faber accept the presentation from Alice');
        yield faberAgent.proofs.acceptPresentation({ proofRecordId: faberProofExchangeRecord.id });
        // Alice waits until she receives a presentation acknowledgement
        logger_1.default.test('Alice waits for acceptance by Faber');
        yield (0, helpers_1.waitForProofExchangeRecord)(aliceAgent, {
            threadId,
            parentThreadId,
            state: ProofState_1.ProofState.Done,
        });
    }));
});
