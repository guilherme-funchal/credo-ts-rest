"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const helpers_1 = require("../../../../../../tests/helpers");
const Agent_1 = require("../../../../../agent/Agent");
const proofs_1 = require("../../../../../modules/proofs");
const ProofRepository_1 = require("../../../../../modules/proofs/repository/ProofRepository");
const utils_1 = require("../../../../../utils");
const didcomm_1 = require("../../../../didcomm");
const DidCommMessageRepository_1 = require("../../../../didcomm/DidCommMessageRepository");
const testModule = __importStar(require("../proof"));
const agentConfig = (0, helpers_1.getAgentConfig)('Migration ProofExchangeRecord 0.2-0.3');
const agentContext = (0, helpers_1.getAgentContext)();
jest.mock('../../../../../modules/proofs/repository/ProofRepository');
const ProofRepositoryMock = ProofRepository_1.ProofRepository;
const proofRepository = new ProofRepositoryMock();
jest.mock('../../../../didcomm/DidCommMessageRepository');
const DidCommMessageRepositoryMock = DidCommMessageRepository_1.DidCommMessageRepository;
const didCommMessageRepository = new DidCommMessageRepositoryMock();
jest.mock('../../../../../agent/Agent', () => {
    return {
        Agent: jest.fn(() => ({
            config: agentConfig,
            context: agentContext,
            dependencyManager: {
                resolve: jest.fn((token) => (token === ProofRepositoryMock ? proofRepository : didCommMessageRepository)),
            },
        })),
    };
});
// Mock typed object
const AgentMock = Agent_1.Agent;
describe('0.2-0.3 | Proof', () => {
    let agent;
    beforeEach(() => {
        agent = new AgentMock();
    });
    afterEach(() => {
        (0, helpers_1.mockFunction)(didCommMessageRepository.save).mockReset();
    });
    describe('migrateProofExchangeRecordToV0_3()', () => {
        it('should fetch all records and apply the needed updates ', () => __awaiter(void 0, void 0, void 0, function* () {
            const records = [getProof({})];
            (0, helpers_1.mockFunction)(proofRepository.getAll).mockResolvedValue(records);
            yield testModule.migrateProofExchangeRecordToV0_3(agent);
            expect(proofRepository.getAll).toHaveBeenCalledTimes(1);
            expect(proofRepository.update).toHaveBeenCalledTimes(records.length);
            const updatedRecord = (0, helpers_1.mockFunction)(proofRepository.update).mock.calls[0][1];
            // Check first object is transformed correctly
            expect(updatedRecord.toJSON()).toMatchObject({
                protocolVersion: 'v1',
            });
        }));
    });
    describe('migrateInternalProofExchangeRecordProperties()', () => {
        it('should set the protocol version to v1 if not set on the record', () => __awaiter(void 0, void 0, void 0, function* () {
            const proofRecord = getProof({});
            yield testModule.migrateInternalProofExchangeRecordProperties(agent, proofRecord);
            expect(proofRecord).toMatchObject({
                protocolVersion: 'v1',
            });
        }));
        it('should not set the protocol version if a value is already set', () => __awaiter(void 0, void 0, void 0, function* () {
            const proofRecord = getProof({
                protocolVersion: 'v2',
            });
            yield testModule.migrateInternalProofExchangeRecordProperties(agent, proofRecord);
            expect(proofRecord).toMatchObject({
                protocolVersion: 'v2',
            });
        }));
    });
    describe('moveDidCommMessages()', () => {
        it('should move the proposalMessage, requestMessage and presentationMessage to the didCommMessageRepository', () => __awaiter(void 0, void 0, void 0, function* () {
            const proposalMessage = { '@type': 'ProposalMessage' };
            const requestMessage = { '@type': 'RequestMessage' };
            const presentationMessage = { '@type': 'ProofMessage' };
            const proofRecord = getProof({
                id: 'theProofId',
                state: proofs_1.ProofState.Done,
                proposalMessage,
                requestMessage,
                presentationMessage,
            });
            yield testModule.moveDidCommMessages(agent, proofRecord);
            expect(didCommMessageRepository.save).toHaveBeenCalledTimes(3);
            const [[, proposalMessageRecord], [, requestMessageRecord], [, presentationMessageRecord]] = (0, helpers_1.mockFunction)(didCommMessageRepository.save).mock.calls;
            expect(proposalMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Sender,
                associatedRecordId: 'theProofId',
                message: proposalMessage,
            });
            expect(requestMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Receiver,
                associatedRecordId: 'theProofId',
                message: requestMessage,
            });
            expect(presentationMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Sender,
                associatedRecordId: 'theProofId',
                message: presentationMessage,
            });
            expect(proofRecord.toJSON()).toEqual({
                _tags: {},
                protocolVersion: undefined,
                id: 'theProofId',
                state: proofs_1.ProofState.Done,
                metadata: {},
                isVerified: undefined,
            });
        }));
        it('should only move the messages which exist in the record', () => __awaiter(void 0, void 0, void 0, function* () {
            const proposalMessage = { '@type': 'ProposalMessage' };
            const proofRecord = getProof({
                id: 'theProofId',
                state: proofs_1.ProofState.Done,
                proposalMessage,
                isVerified: true,
            });
            yield testModule.moveDidCommMessages(agent, proofRecord);
            expect(didCommMessageRepository.save).toHaveBeenCalledTimes(1);
            const [[, proposalMessageRecord]] = (0, helpers_1.mockFunction)(didCommMessageRepository.save).mock.calls;
            expect(proposalMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Receiver,
                associatedRecordId: 'theProofId',
                message: proposalMessage,
            });
            expect(proofRecord.toJSON()).toEqual({
                _tags: {},
                protocolVersion: undefined,
                id: 'theProofId',
                state: proofs_1.ProofState.Done,
                metadata: {},
                isVerified: true,
                presentationMessage: undefined,
                requestMessage: undefined,
            });
        }));
        it('should determine the correct DidCommMessageRole for each message', () => __awaiter(void 0, void 0, void 0, function* () {
            const proposalMessage = { '@type': 'ProposalMessage' };
            const requestMessage = { '@type': 'RequestMessage' };
            const presentationMessage = { '@type': 'ProofMessage' };
            const proofRecord = getProof({
                id: 'theProofId',
                state: proofs_1.ProofState.Done,
                proposalMessage,
                requestMessage,
                presentationMessage,
            });
            yield testModule.moveDidCommMessages(agent, proofRecord);
            expect(didCommMessageRepository.save).toHaveBeenCalledTimes(3);
            const [[, proposalMessageRecord], [, requestMessageRecord], [, presentationMessageRecord]] = (0, helpers_1.mockFunction)(didCommMessageRepository.save).mock.calls;
            expect(proposalMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Sender,
                associatedRecordId: 'theProofId',
                message: proposalMessage,
            });
            expect(requestMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Receiver,
                associatedRecordId: 'theProofId',
                message: requestMessage,
            });
            expect(presentationMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Sender,
                associatedRecordId: 'theProofId',
                message: presentationMessage,
            });
            expect(proofRecord.toJSON()).toEqual({
                _tags: {},
                metadata: {},
                protocolVersion: undefined,
                id: 'theProofId',
                state: proofs_1.ProofState.Done,
            });
        }));
    });
    describe('getProofRole', () => {
        it('should return ProofRole.Verifier if isVerified is set', () => {
            expect(testModule.getProofRole(getProof({
                isVerified: true,
            }))).toBe(testModule.ProofRole.Verifier);
            expect(testModule.getProofRole(getProof({
                isVerified: false,
            }))).toBe(testModule.ProofRole.Verifier);
        });
        it('should return ProofRole.Prover if state is Done and isVerified is not set', () => {
            const proofRecord = getProof({
                state: proofs_1.ProofState.Done,
            });
            expect(testModule.getProofRole(proofRecord)).toBe(testModule.ProofRole.Prover);
        });
        it('should return ProofRole.Prover if the value is a prover state', () => {
            const holderStates = [
                proofs_1.ProofState.Declined,
                proofs_1.ProofState.ProposalSent,
                proofs_1.ProofState.RequestReceived,
                proofs_1.ProofState.PresentationSent,
            ];
            for (const holderState of holderStates) {
                expect(testModule.getProofRole(getProof({
                    state: holderState,
                }))).toBe(testModule.ProofRole.Prover);
            }
        });
        it('should return ProofRole.Verifier if the state is not a prover state, isVerified is not set and the state is not Done', () => {
            expect(testModule.getProofRole(getProof({
                state: proofs_1.ProofState.PresentationReceived,
            }))).toBe(testModule.ProofRole.Verifier);
        });
    });
});
function getProof({ protocolVersion, proposalMessage, requestMessage, presentationMessage, state, isVerified, id, }) {
    return utils_1.JsonTransformer.fromJSON({
        protocolVersion,
        proposalMessage,
        requestMessage,
        presentationMessage,
        state,
        isVerified,
        id,
    }, proofs_1.ProofExchangeRecord);
}
