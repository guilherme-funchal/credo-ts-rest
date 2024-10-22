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
const rxjs_1 = require("rxjs");
const helpers_1 = require("../../../../../../tests/helpers");
const EventEmitter_1 = require("../../../../../agent/EventEmitter");
const InboundMessageContext_1 = require("../../../../../agent/models/InboundMessageContext");
const Attachment_1 = require("../../../../../decorators/attachment/Attachment");
const storage_1 = require("../../../../../storage");
const uuid_1 = require("../../../../../utils/uuid");
const connections_1 = require("../../../../connections");
const ProofEvents_1 = require("../../../ProofEvents");
const PresentationProblemReportReason_1 = require("../../../errors/PresentationProblemReportReason");
const ProofFormatSpec_1 = require("../../../models/ProofFormatSpec");
const ProofState_1 = require("../../../models/ProofState");
const ProofExchangeRecord_1 = require("../../../repository/ProofExchangeRecord");
const ProofRepository_1 = require("../../../repository/ProofRepository");
const V2ProofProtocol_1 = require("../V2ProofProtocol");
const messages_1 = require("../messages");
// Mock classes
jest.mock('../../../repository/ProofRepository');
jest.mock('../../../../connections/services/ConnectionService');
jest.mock('../../../../../storage/Repository');
// Mock typed object
const ProofRepositoryMock = ProofRepository_1.ProofRepository;
const connectionServiceMock = connections_1.ConnectionService;
const didCommMessageRepositoryMock = storage_1.DidCommMessageRepository;
const proofRepository = new ProofRepositoryMock();
const connectionService = new connectionServiceMock();
const didCommMessageRepository = new didCommMessageRepositoryMock();
const proofFormatService = {
    supportsFormat: () => true,
    processRequest: jest.fn(),
};
const agentConfig = (0, helpers_1.getAgentConfig)('V2ProofProtocolTest');
const eventEmitter = new EventEmitter_1.EventEmitter(agentConfig.agentDependencies, new rxjs_1.Subject());
const agentContext = (0, helpers_1.getAgentContext)({
    registerInstances: [
        [ProofRepository_1.ProofRepository, proofRepository],
        [storage_1.DidCommMessageRepository, didCommMessageRepository],
        [connections_1.ConnectionService, connectionService],
        [EventEmitter_1.EventEmitter, eventEmitter],
    ],
    agentConfig,
});
const proofProtocol = new V2ProofProtocol_1.V2ProofProtocol({ proofFormats: [proofFormatService] });
const connection = (0, helpers_1.getMockConnection)({
    id: '123',
    state: connections_1.DidExchangeState.Completed,
});
const requestAttachment = new Attachment_1.Attachment({
    id: 'abdc8b63-29c6-49ad-9e10-98f9d85db9a2',
    mimeType: 'application/json',
    data: new Attachment_1.AttachmentData({
        base64: 'eyJuYW1lIjogIlByb29mIHJlcXVlc3QiLCAibm9uX3Jldm9rZWQiOiB7ImZyb20iOiAxNjQwOTk1MTk5LCAidG8iOiAxNjQwOTk1MTk5fSwgIm5vbmNlIjogIjEiLCAicmVxdWVzdGVkX2F0dHJpYnV0ZXMiOiB7ImFkZGl0aW9uYWxQcm9wMSI6IHsibmFtZSI6ICJmYXZvdXJpdGVEcmluayIsICJub25fcmV2b2tlZCI6IHsiZnJvbSI6IDE2NDA5OTUxOTksICJ0byI6IDE2NDA5OTUxOTl9LCAicmVzdHJpY3Rpb25zIjogW3siY3JlZF9kZWZfaWQiOiAiV2dXeHF6dHJOb29HOTJSWHZ4U1RXdjozOkNMOjIwOnRhZyJ9XX19LCAicmVxdWVzdGVkX3ByZWRpY2F0ZXMiOiB7fSwgInZlcnNpb24iOiAiMS4wIn0=',
    }),
});
// A record is deserialized to JSON when it's stored into the storage. We want to simulate this behaviour for `offer`
// object to test our service would behave correctly. We use type assertion for `offer` attribute to `any`.
const mockProofExchangeRecord = ({ state, threadId, connectionId, tags, id, } = {}) => {
    const proofRecord = new ProofExchangeRecord_1.ProofExchangeRecord({
        protocolVersion: 'v2',
        id,
        state: state || ProofState_1.ProofState.RequestSent,
        threadId: threadId !== null && threadId !== void 0 ? threadId : (0, uuid_1.uuid)(),
        connectionId: connectionId !== null && connectionId !== void 0 ? connectionId : '123',
        tags,
    });
    return proofRecord;
};
describe('V2ProofProtocol', () => {
    describe('processProofRequest', () => {
        let presentationRequest;
        let messageContext;
        beforeEach(() => {
            presentationRequest = new messages_1.V2RequestPresentationMessage({
                formats: [
                    new ProofFormatSpec_1.ProofFormatSpec({
                        attachmentId: 'abdc8b63-29c6-49ad-9e10-98f9d85db9a2',
                        format: 'hlindy/proof-req@v2.0',
                    }),
                ],
                requestAttachments: [requestAttachment],
                comment: 'Proof Request',
            });
            messageContext = new InboundMessageContext_1.InboundMessageContext(presentationRequest, { agentContext, connection });
        });
        test(`creates and return proof record in ${ProofState_1.ProofState.PresentationReceived} state with offer, without thread ID`, () => __awaiter(void 0, void 0, void 0, function* () {
            const repositorySaveSpy = jest.spyOn(proofRepository, 'save');
            // when
            const returnedProofExchangeRecord = yield proofProtocol.processRequest(messageContext);
            // then
            const expectedProofExchangeRecord = {
                type: ProofExchangeRecord_1.ProofExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                state: ProofState_1.ProofState.RequestReceived,
                threadId: presentationRequest.id,
                connectionId: connection.id,
            };
            expect(repositorySaveSpy).toHaveBeenCalledTimes(1);
            const [[, createdProofExchangeRecord]] = repositorySaveSpy.mock.calls;
            expect(createdProofExchangeRecord).toMatchObject(expectedProofExchangeRecord);
            expect(returnedProofExchangeRecord).toMatchObject(expectedProofExchangeRecord);
        }));
        test(`emits stateChange event with ${ProofState_1.ProofState.RequestReceived}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(ProofEvents_1.ProofEventTypes.ProofStateChanged, eventListenerMock);
            // when
            yield proofProtocol.processRequest(messageContext);
            // then
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'ProofStateChanged',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: null,
                    proofRecord: expect.objectContaining({
                        state: ProofState_1.ProofState.RequestReceived,
                    }),
                },
            });
        }));
    });
    describe('createProblemReport', () => {
        const threadId = 'fd9c5ddb-ec11-4acd-bc32-540736249746';
        let proof;
        beforeEach(() => {
            proof = mockProofExchangeRecord({
                state: ProofState_1.ProofState.RequestReceived,
                threadId,
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
        });
        test('returns problem report message base once get error', () => __awaiter(void 0, void 0, void 0, function* () {
            // given
            (0, helpers_1.mockFunction)(proofRepository.getById).mockReturnValue(Promise.resolve(proof));
            // when
            const presentationProblemReportMessage = yield new messages_1.V2PresentationProblemReportMessage({
                description: {
                    en: 'Indy error',
                    code: PresentationProblemReportReason_1.PresentationProblemReportReason.Abandoned,
                },
            });
            presentationProblemReportMessage.setThread({ threadId });
            // then
            expect(presentationProblemReportMessage.toJSON()).toMatchObject({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/present-proof/2.0/problem-report',
                '~thread': {
                    thid: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
                },
            });
        }));
    });
    describe('processProblemReport', () => {
        let proof;
        let messageContext;
        beforeEach(() => {
            proof = mockProofExchangeRecord({
                state: ProofState_1.ProofState.RequestReceived,
            });
            const presentationProblemReportMessage = new messages_1.V2PresentationProblemReportMessage({
                description: {
                    en: 'Indy error',
                    code: PresentationProblemReportReason_1.PresentationProblemReportReason.Abandoned,
                },
            });
            presentationProblemReportMessage.setThread({ threadId: 'somethreadid' });
            messageContext = new InboundMessageContext_1.InboundMessageContext(presentationProblemReportMessage, { agentContext, connection });
        });
        test(`updates problem report error message and returns proof record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const repositoryUpdateSpy = jest.spyOn(proofRepository, 'update');
            // given
            (0, helpers_1.mockFunction)(proofRepository.getSingleByQuery).mockReturnValue(Promise.resolve(proof));
            // when
            const returnedCredentialRecord = yield proofProtocol.processProblemReport(messageContext);
            // then
            const expectedCredentialRecord = {
                errorMessage: 'abandoned: Indy error',
            };
            expect(proofRepository.getSingleByQuery).toHaveBeenNthCalledWith(1, agentContext, {
                threadId: 'somethreadid',
                connectionId: connection.id,
            });
            expect(repositoryUpdateSpy).toHaveBeenCalledTimes(1);
            const [[, updatedCredentialRecord]] = repositoryUpdateSpy.mock.calls;
            expect(updatedCredentialRecord).toMatchObject(expectedCredentialRecord);
            expect(returnedCredentialRecord).toMatchObject(expectedCredentialRecord);
        }));
    });
});
