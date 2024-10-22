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
const credentials_1 = require("../../../../../../src/modules/credentials");
const helpers_1 = require("../../../../../../tests/helpers");
const Agent_1 = require("../../../../../agent/Agent");
const CredentialRepository_1 = require("../../../../../modules/credentials/repository/CredentialRepository");
const utils_1 = require("../../../../../utils");
const didcomm_1 = require("../../../../didcomm");
const DidCommMessageRepository_1 = require("../../../../didcomm/DidCommMessageRepository");
const testModule = __importStar(require("../credential"));
const agentConfig = (0, helpers_1.getAgentConfig)('Migration CredentialRecord 0.1-0.2');
const agentContext = (0, helpers_1.getAgentContext)();
jest.mock('../../../../../modules/credentials/repository/CredentialRepository');
const CredentialRepositoryMock = CredentialRepository_1.CredentialRepository;
const credentialRepository = new CredentialRepositoryMock();
jest.mock('../../../../didcomm/DidCommMessageRepository');
const DidCommMessageRepositoryMock = DidCommMessageRepository_1.DidCommMessageRepository;
const didCommMessageRepository = new DidCommMessageRepositoryMock();
jest.mock('../../../../../agent/Agent', () => {
    return {
        Agent: jest.fn(() => ({
            config: agentConfig,
            context: agentContext,
            dependencyManager: {
                resolve: jest.fn((token) => token === CredentialRepositoryMock ? credentialRepository : didCommMessageRepository),
            },
        })),
    };
});
// Mock typed object
const AgentMock = Agent_1.Agent;
describe('0.1-0.2 | Credential', () => {
    let agent;
    beforeEach(() => {
        agent = new AgentMock();
    });
    afterEach(() => {
        (0, helpers_1.mockFunction)(didCommMessageRepository.save).mockReset();
    });
    describe('migrateCredentialRecordToV0_2()', () => {
        it('should fetch all records and apply the needed updates ', () => __awaiter(void 0, void 0, void 0, function* () {
            const records = [
                getCredential({
                    credentialId: 'credentialId1',
                    metadata: {
                        schemaId: 'schemaId',
                        credentialDefinitionId: 'credentialDefinitionId',
                        anotherObject: {
                            someNested: 'value',
                        },
                        requestMetadata: {
                            the: {
                                indy: {
                                    meta: 'data',
                                },
                            },
                        },
                    },
                }),
            ];
            (0, helpers_1.mockFunction)(credentialRepository.getAll).mockResolvedValue(records);
            yield testModule.migrateCredentialRecordToV0_2(agent);
            expect(credentialRepository.getAll).toHaveBeenCalledTimes(1);
            expect(credentialRepository.update).toHaveBeenCalledTimes(records.length);
            const updatedRecord = (0, helpers_1.mockFunction)(credentialRepository.update).mock.calls[0][1];
            // Check first object is transformed correctly
            expect(updatedRecord.toJSON()).toMatchObject({
                credentials: [
                    {
                        credentialRecordId: 'credentialId1',
                        credentialRecordType: 'indy',
                    },
                ],
                protocolVersion: 'v1',
                metadata: {
                    '_internal/indyCredential': {
                        schemaId: 'schemaId',
                        credentialDefinitionId: 'credentialDefinitionId',
                    },
                    anotherObject: {
                        someNested: 'value',
                    },
                    '_internal/indyRequest': {
                        the: {
                            indy: {
                                meta: 'data',
                            },
                        },
                    },
                },
            });
        }));
    });
    describe('updateIndyMetadata()', () => {
        it('should correctly update the old top-level keys into the nested structure', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = getCredential({
                metadata: {
                    schemaId: 'schemaId',
                    credentialDefinitionId: 'schemaId',
                    anotherObject: {
                        someNested: 'value',
                    },
                    requestMetadata: {
                        the: {
                            indy: {
                                meta: 'data',
                            },
                        },
                    },
                },
            });
            yield testModule.updateIndyMetadata(agent, credentialRecord);
            expect(credentialRecord).toMatchObject({
                metadata: {
                    data: {
                        '_internal/indyCredential': {
                            schemaId: 'schemaId',
                            credentialDefinitionId: 'schemaId',
                        },
                        anotherObject: {
                            someNested: 'value',
                        },
                        '_internal/indyRequest': {
                            the: {
                                indy: {
                                    meta: 'data',
                                },
                            },
                        },
                    },
                },
            });
        }));
        it('should not fail if some the top-level metadata keys do not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = getCredential({
                metadata: {
                    schemaId: 'schemaId',
                    anotherObject: {
                        someNested: 'value',
                    },
                },
            });
            yield testModule.updateIndyMetadata(agent, credentialRecord);
            expect(credentialRecord).toMatchObject({
                metadata: {
                    data: {
                        '_internal/indyCredential': {
                            schemaId: 'schemaId',
                        },
                        anotherObject: {
                            someNested: 'value',
                        },
                    },
                },
            });
        }));
        it('should not fail if all of the top-level metadata keys do not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = getCredential({
                metadata: {
                    anotherObject: {
                        someNested: 'value',
                    },
                },
            });
            yield testModule.updateIndyMetadata(agent, credentialRecord);
            expect(credentialRecord).toMatchObject({
                metadata: {
                    data: {
                        anotherObject: {
                            someNested: 'value',
                        },
                    },
                },
            });
        }));
    });
    describe('migrateInternalCredentialRecordProperties()', () => {
        it('should set the protocol version to v1 if not set on the record', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = getCredential({});
            yield testModule.migrateInternalCredentialRecordProperties(agent, credentialRecord);
            expect(credentialRecord).toMatchObject({
                protocolVersion: 'v1',
            });
        }));
        it('should not set the protocol version if a value is already set', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = getCredential({
                protocolVersion: 'v2',
            });
            yield testModule.migrateInternalCredentialRecordProperties(agent, credentialRecord);
            expect(credentialRecord).toMatchObject({
                protocolVersion: 'v2',
            });
        }));
        it('should migrate the credentialId to credentials array if present', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = getCredential({
                credentialId: 'theCredentialId',
            });
            yield testModule.migrateInternalCredentialRecordProperties(agent, credentialRecord);
            expect(credentialRecord.toJSON()).toMatchObject({
                protocolVersion: 'v1',
                credentials: [
                    {
                        credentialRecordId: 'theCredentialId',
                        credentialRecordType: 'indy',
                    },
                ],
            });
        }));
        it('should migrate the credentialId if not present', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = getCredential({});
            yield testModule.migrateInternalCredentialRecordProperties(agent, credentialRecord);
            expect(credentialRecord.toJSON()).toMatchObject({
                protocolVersion: 'v1',
                credentialId: undefined,
                credentials: [],
            });
        }));
    });
    describe('moveDidCommMessages()', () => {
        it('should move the proposalMessage, offerMessage, requestMessage and credentialMessage to the didCommMessageRepository', () => __awaiter(void 0, void 0, void 0, function* () {
            const proposalMessage = { '@type': 'ProposalMessage' };
            const offerMessage = { '@type': 'OfferMessage' };
            const requestMessage = { '@type': 'RequestMessage' };
            const credentialMessage = { '@type': 'CredentialMessage' };
            const credentialRecord = getCredential({
                id: 'theCredentialId',
                state: credentials_1.CredentialState.Done,
                credentials: [
                    {
                        credentialRecordId: 'theCredentialRecordId',
                        credentialRecordType: 'indy',
                    },
                ],
                proposalMessage,
                offerMessage,
                requestMessage,
                credentialMessage,
            });
            yield testModule.moveDidCommMessages(agent, credentialRecord);
            expect(didCommMessageRepository.save).toHaveBeenCalledTimes(4);
            const [[, proposalMessageRecord], [, offerMessageRecord], [, requestMessageRecord], [, credentialMessageRecord]] = (0, helpers_1.mockFunction)(didCommMessageRepository.save).mock.calls;
            expect(proposalMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Sender,
                associatedRecordId: 'theCredentialId',
                message: proposalMessage,
            });
            expect(offerMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Receiver,
                associatedRecordId: 'theCredentialId',
                message: offerMessage,
            });
            expect(requestMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Sender,
                associatedRecordId: 'theCredentialId',
                message: requestMessage,
            });
            expect(credentialMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Receiver,
                associatedRecordId: 'theCredentialId',
                message: credentialMessage,
            });
            expect(credentialRecord.toJSON()).toEqual({
                _tags: {},
                credentialId: undefined,
                metadata: {},
                protocolVersion: undefined,
                id: 'theCredentialId',
                state: credentials_1.CredentialState.Done,
                credentials: [
                    {
                        credentialRecordId: 'theCredentialRecordId',
                        credentialRecordType: 'indy',
                    },
                ],
            });
        }));
        it('should only move the messages which exist in the record', () => __awaiter(void 0, void 0, void 0, function* () {
            const proposalMessage = { '@type': 'ProposalMessage' };
            const offerMessage = { '@type': 'OfferMessage' };
            const credentialRecord = getCredential({
                id: 'theCredentialId',
                state: credentials_1.CredentialState.Done,
                credentials: [
                    {
                        credentialRecordId: 'theCredentialRecordId',
                        credentialRecordType: 'indy',
                    },
                ],
                proposalMessage,
                offerMessage,
            });
            yield testModule.moveDidCommMessages(agent, credentialRecord);
            expect(didCommMessageRepository.save).toHaveBeenCalledTimes(2);
            const [[, proposalMessageRecord], [, offerMessageRecord]] = (0, helpers_1.mockFunction)(didCommMessageRepository.save).mock.calls;
            expect(proposalMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Sender,
                associatedRecordId: 'theCredentialId',
                message: proposalMessage,
            });
            expect(offerMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Receiver,
                associatedRecordId: 'theCredentialId',
                message: offerMessage,
            });
            expect(credentialRecord.toJSON()).toEqual({
                _tags: {},
                credentialId: undefined,
                metadata: {},
                protocolVersion: undefined,
                id: 'theCredentialId',
                state: credentials_1.CredentialState.Done,
                credentials: [
                    {
                        credentialRecordId: 'theCredentialRecordId',
                        credentialRecordType: 'indy',
                    },
                ],
            });
        }));
        it('should determine the correct DidCommMessageRole for each message', () => __awaiter(void 0, void 0, void 0, function* () {
            const proposalMessage = { '@type': 'ProposalMessage' };
            const offerMessage = { '@type': 'OfferMessage' };
            const requestMessage = { '@type': 'RequestMessage' };
            const credentialMessage = { '@type': 'CredentialMessage' };
            const credentialRecord = getCredential({
                id: 'theCredentialId',
                state: credentials_1.CredentialState.Done,
                proposalMessage,
                offerMessage,
                requestMessage,
                credentialMessage,
            });
            yield testModule.moveDidCommMessages(agent, credentialRecord);
            expect(didCommMessageRepository.save).toHaveBeenCalledTimes(4);
            const [[, proposalMessageRecord], [, offerMessageRecord], [, requestMessageRecord], [, credentialMessageRecord]] = (0, helpers_1.mockFunction)(didCommMessageRepository.save).mock.calls;
            expect(proposalMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Receiver,
                associatedRecordId: 'theCredentialId',
                message: proposalMessage,
            });
            expect(offerMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Sender,
                associatedRecordId: 'theCredentialId',
                message: offerMessage,
            });
            expect(requestMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Receiver,
                associatedRecordId: 'theCredentialId',
                message: requestMessage,
            });
            expect(credentialMessageRecord).toMatchObject({
                role: didcomm_1.DidCommMessageRole.Sender,
                associatedRecordId: 'theCredentialId',
                message: credentialMessage,
            });
            expect(credentialRecord.toJSON()).toEqual({
                _tags: {},
                credentialId: undefined,
                metadata: {},
                protocolVersion: undefined,
                id: 'theCredentialId',
                credentials: [],
                state: credentials_1.CredentialState.Done,
            });
        }));
    });
    describe('getCredentialRole', () => {
        it('should return CredentialRole.Holder if the credentials array is not empty', () => {
            const credentialRecord = getCredential({
                credentials: [
                    {
                        credentialRecordId: 'theCredentialRecordId',
                        credentialRecordType: 'indy',
                    },
                ],
            });
            expect(testModule.getCredentialRole(credentialRecord)).toBe(testModule.CredentialRole.Holder);
        });
        it('should return CredentialRole.Issuer if state is Done and credentials array is empty', () => {
            const credentialRecord = getCredential({
                state: credentials_1.CredentialState.Done,
                credentials: [],
            });
            expect(testModule.getCredentialRole(credentialRecord)).toBe(testModule.CredentialRole.Issuer);
        });
        it('should return CredentialRole.Holder if the value is a holder state', () => {
            const holderStates = [
                credentials_1.CredentialState.Declined,
                credentials_1.CredentialState.ProposalSent,
                credentials_1.CredentialState.OfferReceived,
                credentials_1.CredentialState.RequestSent,
                credentials_1.CredentialState.CredentialReceived,
            ];
            for (const holderState of holderStates) {
                expect(testModule.getCredentialRole(getCredential({
                    state: holderState,
                }))).toBe(testModule.CredentialRole.Holder);
            }
        });
        it('should return CredentialRole.Issuer if the state is not a holder state no credentials are in the array and the state is not Done', () => {
            expect(testModule.getCredentialRole(getCredential({
                state: credentials_1.CredentialState.CredentialIssued,
            }))).toBe(testModule.CredentialRole.Issuer);
        });
    });
});
function getCredential({ metadata, credentialId, protocolVersion, proposalMessage, offerMessage, requestMessage, credentialMessage, state, credentials, id, }) {
    return utils_1.JsonTransformer.fromJSON({
        protocolVersion,
        credentialId,
        metadata,
        proposalMessage,
        offerMessage,
        requestMessage,
        credentialMessage,
        state,
        credentials,
        id,
    }, credentials_1.CredentialExchangeRecord);
}
