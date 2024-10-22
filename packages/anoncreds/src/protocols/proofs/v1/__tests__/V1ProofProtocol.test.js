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
const src_1 = require("../../../../../../core/src");
const ConnectionService_1 = require("../../../../../../core/src/modules/connections/services/ConnectionService");
const ProofRepository_1 = require("../../../../../../core/src/modules/proofs/repository/ProofRepository");
const DidCommMessageRepository_1 = require("../../../../../../core/src/storage/didcomm/DidCommMessageRepository");
const tests_1 = require("../../../../../../core/tests");
const LegacyIndyProofFormatService_1 = require("../../../../formats/LegacyIndyProofFormatService");
const V1ProofProtocol_1 = require("../V1ProofProtocol");
const messages_1 = require("../messages");
const V1PresentationProblemReportMessage_1 = require("../messages/V1PresentationProblemReportMessage");
// Mock classes
jest.mock('../../../../../../core/src/modules/proofs/repository/ProofRepository');
jest.mock('../../../../formats/LegacyIndyProofFormatService');
jest.mock('../../../../../../core/src/storage/didcomm/DidCommMessageRepository');
jest.mock('../../../../../../core/src/modules/connections/services/ConnectionService');
// Mock typed object
const ProofRepositoryMock = ProofRepository_1.ProofRepository;
const connectionServiceMock = ConnectionService_1.ConnectionService;
const didCommMessageRepositoryMock = DidCommMessageRepository_1.DidCommMessageRepository;
const indyProofFormatServiceMock = LegacyIndyProofFormatService_1.LegacyIndyProofFormatService;
const proofRepository = new ProofRepositoryMock();
const connectionService = new connectionServiceMock();
const didCommMessageRepository = new didCommMessageRepositoryMock();
const indyProofFormatService = new indyProofFormatServiceMock();
const connection = (0, tests_1.getMockConnection)({
    id: '123',
    state: src_1.DidExchangeState.Completed,
});
const requestAttachment = new src_1.Attachment({
    id: messages_1.INDY_PROOF_REQUEST_ATTACHMENT_ID,
    mimeType: 'application/json',
    data: new src_1.AttachmentData({
        base64: 'eyJuYW1lIjogIlByb29mIHJlcXVlc3QiLCAibm9uX3Jldm9rZWQiOiB7ImZyb20iOiAxNjQwOTk1MTk5LCAidG8iOiAxNjQwOTk1MTk5fSwgIm5vbmNlIjogIjEiLCAicmVxdWVzdGVkX2F0dHJpYnV0ZXMiOiB7ImFkZGl0aW9uYWxQcm9wMSI6IHsibmFtZSI6ICJmYXZvdXJpdGVEcmluayIsICJub25fcmV2b2tlZCI6IHsiZnJvbSI6IDE2NDA5OTUxOTksICJ0byI6IDE2NDA5OTUxOTl9LCAicmVzdHJpY3Rpb25zIjogW3siY3JlZF9kZWZfaWQiOiAiV2dXeHF6dHJOb29HOTJSWHZ4U1RXdjozOkNMOjIwOnRhZyJ9XX19LCAicmVxdWVzdGVkX3ByZWRpY2F0ZXMiOiB7fSwgInZlcnNpb24iOiAiMS4wIn0=',
    }),
});
// A record is deserialized to JSON when it's stored into the storage. We want to simulate this behaviour for `offer`
// object to test our service would behave correctly. We use type assertion for `offer` attribute to `any`.
const mockProofExchangeRecord = ({ state, threadId, connectionId, tags, id, } = {}) => {
    const requestPresentationMessage = new messages_1.V1RequestPresentationMessage({
        comment: 'some comment',
        requestAttachments: [requestAttachment],
    });
    const proofRecord = new src_1.ProofExchangeRecord({
        protocolVersion: 'v1',
        id,
        state: state || src_1.ProofState.RequestSent,
        threadId: threadId !== null && threadId !== void 0 ? threadId : requestPresentationMessage.id,
        connectionId: connectionId !== null && connectionId !== void 0 ? connectionId : '123',
        tags,
    });
    return proofRecord;
};
describe('V1ProofProtocol', () => {
    let eventEmitter;
    let agentConfig;
    let agentContext;
    let proofProtocol;
    beforeEach(() => {
        // real objects
        agentConfig = (0, tests_1.getAgentConfig)('V1ProofProtocolTest');
        eventEmitter = new src_1.EventEmitter(agentConfig.agentDependencies, new rxjs_1.Subject());
        agentContext = (0, tests_1.getAgentContext)({
            registerInstances: [
                [ProofRepository_1.ProofRepository, proofRepository],
                [DidCommMessageRepository_1.DidCommMessageRepository, didCommMessageRepository],
                [src_1.EventEmitter, eventEmitter],
                [ConnectionService_1.ConnectionService, connectionService],
            ],
            agentConfig,
        });
        proofProtocol = new V1ProofProtocol_1.V1ProofProtocol({ indyProofFormat: indyProofFormatService });
    });
    describe('processRequest', () => {
        let presentationRequest;
        let messageContext;
        beforeEach(() => {
            presentationRequest = new messages_1.V1RequestPresentationMessage({
                comment: 'abcd',
                requestAttachments: [requestAttachment],
            });
            messageContext = new src_1.InboundMessageContext(presentationRequest, {
                connection,
                agentContext,
            });
        });
        test(`creates and return proof record in ${src_1.ProofState.PresentationReceived} state with offer, without thread ID`, () => __awaiter(void 0, void 0, void 0, function* () {
            const repositorySaveSpy = jest.spyOn(proofRepository, 'save');
            // when
            const returnedProofExchangeRecord = yield proofProtocol.processRequest(messageContext);
            // then
            const expectedProofExchangeRecord = {
                type: src_1.ProofExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                state: src_1.ProofState.RequestReceived,
                threadId: presentationRequest.id,
                connectionId: connection.id,
            };
            expect(repositorySaveSpy).toHaveBeenCalledTimes(1);
            const [[, createdProofExchangeRecord]] = repositorySaveSpy.mock.calls;
            expect(createdProofExchangeRecord).toMatchObject(expectedProofExchangeRecord);
            expect(returnedProofExchangeRecord).toMatchObject(expectedProofExchangeRecord);
        }));
        test(`emits stateChange event with ${src_1.ProofState.RequestReceived}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(src_1.ProofEventTypes.ProofStateChanged, eventListenerMock);
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
                        state: src_1.ProofState.RequestReceived,
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
                state: src_1.ProofState.RequestReceived,
                threadId,
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
        });
        test('returns problem report message base once get error', () => __awaiter(void 0, void 0, void 0, function* () {
            // given
            (0, tests_1.mockFunction)(proofRepository.getById).mockReturnValue(Promise.resolve(proof));
            // when
            const presentationProblemReportMessage = yield new V1PresentationProblemReportMessage_1.V1PresentationProblemReportMessage({
                description: {
                    en: 'Indy error',
                    code: src_1.PresentationProblemReportReason.Abandoned,
                },
            });
            presentationProblemReportMessage.setThread({ threadId });
            // then
            expect(presentationProblemReportMessage.toJSON()).toMatchObject({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/present-proof/1.0/problem-report',
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
                state: src_1.ProofState.RequestReceived,
            });
            const presentationProblemReportMessage = new V1PresentationProblemReportMessage_1.V1PresentationProblemReportMessage({
                description: {
                    en: 'Indy error',
                    code: src_1.PresentationProblemReportReason.Abandoned,
                },
            });
            presentationProblemReportMessage.setThread({ threadId: 'somethreadid' });
            messageContext = new src_1.InboundMessageContext(presentationProblemReportMessage, {
                connection,
                agentContext,
            });
        });
        test(`updates problem report error message and returns proof record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const repositoryUpdateSpy = jest.spyOn(proofRepository, 'update');
            // given
            (0, tests_1.mockFunction)(proofRepository.getSingleByQuery).mockReturnValue(Promise.resolve(proof));
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
