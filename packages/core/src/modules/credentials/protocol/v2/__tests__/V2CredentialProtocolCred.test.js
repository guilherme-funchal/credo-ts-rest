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
exports.testCredentialFormatService = void 0;
const rxjs_1 = require("rxjs");
const __1 = require("../../../../..");
const helpers_1 = require("../../../../../../tests/helpers");
const EventEmitter_1 = require("../../../../../agent/EventEmitter");
const InboundMessageContext_1 = require("../../../../../agent/models/InboundMessageContext");
const Attachment_1 = require("../../../../../decorators/attachment/Attachment");
const storage_1 = require("../../../../../storage");
const utils_1 = require("../../../../../utils");
const JsonEncoder_1 = require("../../../../../utils/JsonEncoder");
const AckMessage_1 = require("../../../../common/messages/AckMessage");
const connections_1 = require("../../../../connections");
const ConnectionService_1 = require("../../../../connections/services/ConnectionService");
const CredentialEvents_1 = require("../../../CredentialEvents");
const fixtures_1 = require("../../../__tests__/fixtures");
const CredentialProblemReportReason_1 = require("../../../models/CredentialProblemReportReason");
const CredentialState_1 = require("../../../models/CredentialState");
const CredentialExchangeRecord_1 = require("../../../repository/CredentialExchangeRecord");
const CredentialRepository_1 = require("../../../repository/CredentialRepository");
const V2CredentialProtocol_1 = require("../V2CredentialProtocol");
const messages_1 = require("../messages");
const V2CredentialAckMessage_1 = require("../messages/V2CredentialAckMessage");
const V2CredentialProblemReportMessage_1 = require("../messages/V2CredentialProblemReportMessage");
const V2IssueCredentialMessage_1 = require("../messages/V2IssueCredentialMessage");
const V2OfferCredentialMessage_1 = require("../messages/V2OfferCredentialMessage");
const V2RequestCredentialMessage_1 = require("../messages/V2RequestCredentialMessage");
// Mock classes
jest.mock('../../../repository/CredentialRepository');
jest.mock('../../../../../storage/didcomm/DidCommMessageRepository');
jest.mock('../../../../routing/services/RoutingService');
jest.mock('../../../../connections/services/ConnectionService');
jest.mock('../../../../../agent/Dispatcher');
// Mock typed object
const CredentialRepositoryMock = CredentialRepository_1.CredentialRepository;
const DidCommMessageRepositoryMock = storage_1.DidCommMessageRepository;
const ConnectionServiceMock = ConnectionService_1.ConnectionService;
const credentialRepository = new CredentialRepositoryMock();
const didCommMessageRepository = new DidCommMessageRepositoryMock();
const connectionService = new ConnectionServiceMock();
const agentConfig = (0, helpers_1.getAgentConfig)('V2CredentialProtocolCredTest');
const eventEmitter = new EventEmitter_1.EventEmitter(agentConfig.agentDependencies, new rxjs_1.Subject());
const agentContext = (0, helpers_1.getAgentContext)({
    registerInstances: [
        [CredentialRepository_1.CredentialRepository, credentialRepository],
        [storage_1.DidCommMessageRepository, didCommMessageRepository],
        [ConnectionService_1.ConnectionService, connectionService],
        [EventEmitter_1.EventEmitter, eventEmitter],
    ],
    agentConfig,
});
const connection = (0, helpers_1.getMockConnection)({
    id: '123',
    state: connections_1.DidExchangeState.Completed,
});
const offerAttachment = new Attachment_1.Attachment({
    id: 'offer-attachment-id',
    mimeType: 'application/json',
    data: new Attachment_1.AttachmentData({
        base64: 'eyJzY2hlbWFfaWQiOiJhYWEiLCJjcmVkX2RlZl9pZCI6IlRoN01wVGFSWlZSWW5QaWFiZHM4MVk6MzpDTDoxNzpUQUciLCJub25jZSI6Im5vbmNlIiwia2V5X2NvcnJlY3RuZXNzX3Byb29mIjp7fX0',
    }),
});
const requestAttachment = new Attachment_1.Attachment({
    id: 'request-attachment-id',
    mimeType: 'application/json',
    data: new Attachment_1.AttachmentData({
        base64: JsonEncoder_1.JsonEncoder.toBase64(fixtures_1.credReq),
    }),
});
const credentialAttachment = new Attachment_1.Attachment({
    id: 'credential-attachment-id',
    mimeType: 'application/json',
    data: new Attachment_1.AttachmentData({
        base64: JsonEncoder_1.JsonEncoder.toBase64({
            values: {},
        }),
    }),
});
const requestFormat = new __1.CredentialFormatSpec({
    attachmentId: 'request-attachment-id',
    format: 'hlindy/cred-filter@v2.0',
});
const proposalAttachment = new Attachment_1.Attachment({
    id: 'proposal-attachment-id',
    data: new Attachment_1.AttachmentData({
        json: {
            any: 'value',
        },
    }),
});
const offerFormat = new __1.CredentialFormatSpec({
    attachmentId: 'offer-attachment-id',
    format: 'hlindy/cred-abstract@v2.0',
});
const proposalFormat = new __1.CredentialFormatSpec({
    attachmentId: 'proposal-attachment-id',
    format: 'hlindy/cred-abstract@v2.0',
});
const credentialFormat = new __1.CredentialFormatSpec({
    attachmentId: 'credential-attachment-id',
    format: 'hlindy/cred@v2.0',
});
const credentialProposalMessage = new messages_1.V2ProposeCredentialMessage({
    formats: [proposalFormat],
    proposalAttachments: [proposalAttachment],
});
const credentialRequestMessage = new V2RequestCredentialMessage_1.V2RequestCredentialMessage({
    formats: [requestFormat],
    requestAttachments: [requestAttachment],
});
credentialRequestMessage.setThread({ threadId: 'somethreadid' });
const credentialOfferMessage = new V2OfferCredentialMessage_1.V2OfferCredentialMessage({
    formats: [offerFormat],
    comment: 'some comment',
    credentialPreview: new messages_1.V2CredentialPreview({
        attributes: [],
    }),
    offerAttachments: [offerAttachment],
});
const credentialIssueMessage = new V2IssueCredentialMessage_1.V2IssueCredentialMessage({
    credentialAttachments: [credentialAttachment],
    formats: [credentialFormat],
});
credentialIssueMessage.setThread({ threadId: 'somethreadid' });
const didCommMessageRecord = new storage_1.DidCommMessageRecord({
    associatedRecordId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
    message: {},
    role: storage_1.DidCommMessageRole.Receiver,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAgentMessageMock = (agentContext, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (options.messageClass === messages_1.V2ProposeCredentialMessage) {
        return credentialProposalMessage;
    }
    if (options.messageClass === V2OfferCredentialMessage_1.V2OfferCredentialMessage) {
        return credentialOfferMessage;
    }
    if (options.messageClass === V2RequestCredentialMessage_1.V2RequestCredentialMessage) {
        return credentialRequestMessage;
    }
    if (options.messageClass === V2IssueCredentialMessage_1.V2IssueCredentialMessage) {
        return credentialIssueMessage;
    }
    throw new __1.AriesFrameworkError('Could not find message');
});
// A record is deserialized to JSON when it's stored into the storage. We want to simulate this behaviour for `offer`
// object to test our service would behave correctly. We use type assertion for `offer` attribute to `any`.
const mockCredentialRecord = ({ state, threadId, connectionId, tags, id, credentialAttributes, } = {}) => {
    const credentialRecord = new CredentialExchangeRecord_1.CredentialExchangeRecord({
        id,
        credentialAttributes: credentialAttributes,
        state: state || CredentialState_1.CredentialState.OfferSent,
        threadId: threadId || 'thread-id',
        connectionId: connectionId !== null && connectionId !== void 0 ? connectionId : '123',
        credentials: [
            {
                credentialRecordType: 'test',
                credentialRecordId: '123456',
            },
        ],
        tags,
        protocolVersion: 'v2',
    });
    return credentialRecord;
};
exports.testCredentialFormatService = {
    credentialRecordType: 'test',
    formatKey: 'test',
    supportsFormat: (_format) => true,
    createOffer: (_agentContext, _options) => __awaiter(void 0, void 0, void 0, function* () {
        return ({
            attachment: offerAttachment,
            format: offerFormat,
        });
    }),
    acceptRequest: (_agentContext, _options) => __awaiter(void 0, void 0, void 0, function* () { return ({ attachment: credentialAttachment, format: credentialFormat }); }),
    deleteCredentialById: jest.fn(),
    processCredential: jest.fn(),
    acceptOffer: () => ({ attachment: requestAttachment, format: requestFormat }),
    processRequest: jest.fn(),
};
describe('credentialProtocol', () => {
    let credentialProtocol;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // mock function implementations
        (0, helpers_1.mockFunction)(connectionService.getById).mockResolvedValue(connection);
        (0, helpers_1.mockFunction)(didCommMessageRepository.findAgentMessage).mockImplementation(getAgentMessageMock);
        (0, helpers_1.mockFunction)(didCommMessageRepository.getAgentMessage).mockImplementation(getAgentMessageMock);
        (0, helpers_1.mockFunction)(didCommMessageRepository.findByQuery).mockResolvedValue([
            didCommMessageRecord,
            didCommMessageRecord,
            didCommMessageRecord,
        ]);
        credentialProtocol = new V2CredentialProtocol_1.V2CredentialProtocol({
            credentialFormats: [exports.testCredentialFormatService],
        });
    }));
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('acceptOffer', () => {
        test(`updates state to ${CredentialState_1.CredentialState.RequestSent}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = mockCredentialRecord({
                state: CredentialState_1.CredentialState.OfferReceived,
                threadId: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
            // when
            yield credentialProtocol.acceptOffer(agentContext, {
                credentialRecord,
                credentialFormats: {},
            });
            // then
            expect(credentialRepository.update).toHaveBeenNthCalledWith(1, agentContext, expect.objectContaining({
                state: CredentialState_1.CredentialState.RequestSent,
            }));
        }));
        test('returns credential request message base on existing credential offer message', () => __awaiter(void 0, void 0, void 0, function* () {
            // given
            const comment = 'credential request comment';
            const credentialRecord = mockCredentialRecord({
                state: CredentialState_1.CredentialState.OfferReceived,
                threadId: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
            // when
            const { message: credentialRequest } = yield credentialProtocol.acceptOffer(agentContext, {
                credentialRecord,
                comment,
            });
            // then
            expect(credentialRequest.toJSON()).toMatchObject({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/issue-credential/2.0/request-credential',
                '~thread': {
                    thid: credentialRecord.threadId,
                },
                formats: [utils_1.JsonTransformer.toJSON(requestFormat)],
                comment,
                'requests~attach': [utils_1.JsonTransformer.toJSON(requestAttachment)],
            });
        }));
        const validState = CredentialState_1.CredentialState.OfferReceived;
        const invalidCredentialStates = Object.values(CredentialState_1.CredentialState).filter((state) => state !== validState);
        test(`throws an error when state transition is invalid`, () => __awaiter(void 0, void 0, void 0, function* () {
            yield Promise.all(invalidCredentialStates.map((state) => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(credentialProtocol.acceptOffer(agentContext, { credentialRecord: mockCredentialRecord({ state }) })).rejects.toThrowError(`Credential record is in invalid state ${state}. Valid states are: ${validState}.`);
            })));
        }));
    });
    describe('processRequest', () => {
        test(`updates state to ${CredentialState_1.CredentialState.RequestReceived}, set request and returns credential record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = mockCredentialRecord({ state: CredentialState_1.CredentialState.OfferSent });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(credentialRequestMessage, {
                connection,
                agentContext,
            });
            // given
            (0, helpers_1.mockFunction)(credentialRepository.findSingleByQuery).mockResolvedValue(credentialRecord);
            // when
            const returnedCredentialRecord = yield credentialProtocol.processRequest(messageContext);
            // then
            expect(credentialRepository.findSingleByQuery).toHaveBeenNthCalledWith(1, agentContext, {
                threadId: 'somethreadid',
            });
            expect(credentialRepository.update).toHaveBeenCalledTimes(1);
            expect(returnedCredentialRecord.state).toEqual(CredentialState_1.CredentialState.RequestReceived);
        }));
        test(`emits stateChange event from ${CredentialState_1.CredentialState.OfferSent} to ${CredentialState_1.CredentialState.RequestReceived}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = mockCredentialRecord({ state: CredentialState_1.CredentialState.OfferSent });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(credentialRequestMessage, {
                connection,
                agentContext,
            });
            const eventListenerMock = jest.fn();
            eventEmitter.on(CredentialEvents_1.CredentialEventTypes.CredentialStateChanged, eventListenerMock);
            (0, helpers_1.mockFunction)(credentialRepository.findSingleByQuery).mockResolvedValue(credentialRecord);
            const returnedCredentialRecord = yield credentialProtocol.processRequest(messageContext);
            // then
            expect(credentialRepository.findSingleByQuery).toHaveBeenNthCalledWith(1, agentContext, {
                threadId: 'somethreadid',
            });
            expect(eventListenerMock).toHaveBeenCalled();
            expect(returnedCredentialRecord.state).toEqual(CredentialState_1.CredentialState.RequestReceived);
        }));
        const validState = CredentialState_1.CredentialState.OfferSent;
        const invalidCredentialStates = Object.values(CredentialState_1.CredentialState).filter((state) => state !== validState);
        test(`throws an error when state transition is invalid`, () => __awaiter(void 0, void 0, void 0, function* () {
            const messageContext = new InboundMessageContext_1.InboundMessageContext(credentialRequestMessage, {
                connection,
                agentContext,
            });
            yield Promise.all(invalidCredentialStates.map((state) => __awaiter(void 0, void 0, void 0, function* () {
                (0, helpers_1.mockFunction)(credentialRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockCredentialRecord({ state })));
                yield expect(credentialProtocol.processRequest(messageContext)).rejects.toThrowError(`Credential record is in invalid state ${state}. Valid states are: ${validState}.`);
            })));
        }));
    });
    describe('acceptRequest', () => {
        test(`updates state to ${CredentialState_1.CredentialState.CredentialIssued}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = mockCredentialRecord({
                state: CredentialState_1.CredentialState.RequestReceived,
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
            yield credentialProtocol.acceptRequest(agentContext, {
                credentialRecord,
                comment: 'credential response comment',
            });
            // then
            expect(credentialRepository.update).toHaveBeenNthCalledWith(1, agentContext, expect.objectContaining({
                state: CredentialState_1.CredentialState.CredentialIssued,
            }));
        }));
        test(`emits stateChange event from ${CredentialState_1.CredentialState.RequestReceived} to ${CredentialState_1.CredentialState.CredentialIssued}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = mockCredentialRecord({
                state: CredentialState_1.CredentialState.RequestReceived,
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
            const eventListenerMock = jest.fn();
            // given
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockResolvedValue(credentialRecord);
            eventEmitter.on(CredentialEvents_1.CredentialEventTypes.CredentialStateChanged, eventListenerMock);
            // when
            yield credentialProtocol.acceptRequest(agentContext, {
                credentialRecord,
                comment: 'credential response comment',
            });
            // then
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'CredentialStateChanged',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: CredentialState_1.CredentialState.RequestReceived,
                    credentialRecord: expect.objectContaining({
                        state: CredentialState_1.CredentialState.CredentialIssued,
                    }),
                },
            });
        }));
        test('returns credential response message base on credential request message', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = mockCredentialRecord({
                state: CredentialState_1.CredentialState.RequestReceived,
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
            // given
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockResolvedValue(credentialRecord);
            const comment = 'credential response comment';
            // when
            const { message: credentialResponse } = yield credentialProtocol.acceptRequest(agentContext, {
                comment: 'credential response comment',
                credentialRecord,
            });
            // then
            expect(credentialResponse.toJSON()).toMatchObject({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/issue-credential/2.0/issue-credential',
                '~thread': {
                    thid: credentialRecord.threadId,
                },
                comment,
                formats: [utils_1.JsonTransformer.toJSON(credentialFormat)],
                'credentials~attach': [utils_1.JsonTransformer.toJSON(credentialAttachment)],
                '~please_ack': expect.any(Object),
            });
        }));
    });
    describe('processCredential', () => {
        test('finds credential record by thread ID and saves credential attachment into the wallet', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = mockCredentialRecord({
                state: CredentialState_1.CredentialState.RequestSent,
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(credentialIssueMessage, {
                connection,
                agentContext,
            });
            // given
            (0, helpers_1.mockFunction)(credentialRepository.getSingleByQuery).mockResolvedValue(credentialRecord);
            yield credentialProtocol.processCredential(messageContext);
        }));
    });
    describe('acceptCredential', () => {
        test(`updates state to ${CredentialState_1.CredentialState.Done}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = mockCredentialRecord({
                state: CredentialState_1.CredentialState.CredentialReceived,
                threadId: 'somethreadid',
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
            // when
            yield credentialProtocol.acceptCredential(agentContext, { credentialRecord });
            // then
            expect(credentialRepository.update).toHaveBeenNthCalledWith(1, agentContext, expect.objectContaining({
                state: CredentialState_1.CredentialState.Done,
            }));
        }));
        test(`emits stateChange event from ${CredentialState_1.CredentialState.CredentialReceived} to ${CredentialState_1.CredentialState.Done}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = mockCredentialRecord({
                state: CredentialState_1.CredentialState.CredentialReceived,
                threadId: 'somethreadid',
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
            const eventListenerMock = jest.fn();
            eventEmitter.on(CredentialEvents_1.CredentialEventTypes.CredentialStateChanged, eventListenerMock);
            // when
            yield credentialProtocol.acceptCredential(agentContext, { credentialRecord });
            // then
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'CredentialStateChanged',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: CredentialState_1.CredentialState.CredentialReceived,
                    credentialRecord: expect.objectContaining({
                        state: CredentialState_1.CredentialState.Done,
                    }),
                },
            });
        }));
        test('returns ack message base on credential issue message', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = mockCredentialRecord({
                state: CredentialState_1.CredentialState.CredentialReceived,
                threadId: 'somethreadid',
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
            // given
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockResolvedValue(credentialRecord);
            // when
            const { message: ackMessage } = yield credentialProtocol.acceptCredential(agentContext, { credentialRecord });
            // then
            expect(ackMessage.toJSON()).toMatchObject({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/issue-credential/2.0/ack',
                '~thread': {
                    thid: 'somethreadid',
                },
            });
        }));
        const validState = CredentialState_1.CredentialState.CredentialReceived;
        const invalidCredentialStates = Object.values(CredentialState_1.CredentialState).filter((state) => state !== validState);
        test(`throws an error when state transition is invalid`, () => __awaiter(void 0, void 0, void 0, function* () {
            yield Promise.all(invalidCredentialStates.map((state) => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(credentialProtocol.acceptCredential(agentContext, {
                    credentialRecord: mockCredentialRecord({
                        state,
                        threadId: 'somethreadid',
                        connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
                    }),
                })).rejects.toThrowError(`Credential record is in invalid state ${state}. Valid states are: ${validState}.`);
            })));
        }));
    });
    describe('processAck', () => {
        const credentialRequest = new V2CredentialAckMessage_1.V2CredentialAckMessage({
            status: AckMessage_1.AckStatus.OK,
            threadId: 'somethreadid',
        });
        const messageContext = new InboundMessageContext_1.InboundMessageContext(credentialRequest, { agentContext, connection });
        test(`updates state to ${CredentialState_1.CredentialState.Done} and returns credential record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = mockCredentialRecord({
                state: CredentialState_1.CredentialState.CredentialIssued,
            });
            // given
            (0, helpers_1.mockFunction)(credentialRepository.getSingleByQuery).mockResolvedValue(credentialRecord);
            // when
            const returnedCredentialRecord = yield credentialProtocol.processAck(messageContext);
            expect(credentialRepository.getSingleByQuery).toHaveBeenNthCalledWith(1, agentContext, {
                threadId: 'somethreadid',
                connectionId: '123',
            });
            expect(returnedCredentialRecord.state).toBe(CredentialState_1.CredentialState.Done);
        }));
    });
    describe('createProblemReport', () => {
        test('returns problem report message base once get error', () => __awaiter(void 0, void 0, void 0, function* () {
            // given
            const credentialRecord = mockCredentialRecord({
                state: CredentialState_1.CredentialState.OfferReceived,
                threadId: 'somethreadid',
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
            const description = 'Indy error';
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockResolvedValue(credentialRecord);
            // when
            const { message } = yield credentialProtocol.createProblemReport(agentContext, {
                description,
                credentialRecord,
            });
            message.setThread({ threadId: 'somethreadid' });
            // then
            expect(message.toJSON()).toMatchObject({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/issue-credential/2.0/problem-report',
                '~thread': {
                    thid: 'somethreadid',
                },
                description: {
                    code: CredentialProblemReportReason_1.CredentialProblemReportReason.IssuanceAbandoned,
                    en: description,
                },
            });
        }));
    });
    describe('processProblemReport', () => {
        const message = new V2CredentialProblemReportMessage_1.V2CredentialProblemReportMessage({
            description: {
                en: 'Indy error',
                code: CredentialProblemReportReason_1.CredentialProblemReportReason.IssuanceAbandoned,
            },
        });
        message.setThread({ threadId: 'somethreadid' });
        const messageContext = new InboundMessageContext_1.InboundMessageContext(message, {
            connection,
            agentContext,
        });
        test(`updates problem report error message and returns credential record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = mockCredentialRecord({
                state: CredentialState_1.CredentialState.OfferReceived,
            });
            // given
            (0, helpers_1.mockFunction)(credentialRepository.getSingleByQuery).mockResolvedValue(credentialRecord);
            // when
            const returnedCredentialRecord = yield credentialProtocol.processProblemReport(messageContext);
            // then
            expect(credentialRepository.getSingleByQuery).toHaveBeenNthCalledWith(1, agentContext, {
                threadId: 'somethreadid',
                connectionId: '123',
            });
            expect(credentialRepository.update).toHaveBeenCalled();
            expect(returnedCredentialRecord.errorMessage).toBe('issuance-abandoned: Indy error');
        }));
    });
    describe('repository methods', () => {
        it('getById should return value from credentialRepository.getById', () => __awaiter(void 0, void 0, void 0, function* () {
            const expected = mockCredentialRecord();
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockReturnValue(Promise.resolve(expected));
            const result = yield credentialProtocol.getById(agentContext, expected.id);
            expect(credentialRepository.getById).toBeCalledWith(agentContext, expected.id);
            expect(result).toBe(expected);
        }));
        it('getById should return value from credentialRepository.getSingleByQuery', () => __awaiter(void 0, void 0, void 0, function* () {
            const expected = mockCredentialRecord();
            (0, helpers_1.mockFunction)(credentialRepository.getSingleByQuery).mockReturnValue(Promise.resolve(expected));
            const result = yield credentialProtocol.getByThreadAndConnectionId(agentContext, 'threadId', 'connectionId');
            expect(credentialRepository.getSingleByQuery).toBeCalledWith(agentContext, {
                threadId: 'threadId',
                connectionId: 'connectionId',
            });
            expect(result).toBe(expected);
        }));
        it('findById should return value from credentialRepository.findById', () => __awaiter(void 0, void 0, void 0, function* () {
            const expected = mockCredentialRecord();
            (0, helpers_1.mockFunction)(credentialRepository.findById).mockReturnValue(Promise.resolve(expected));
            const result = yield credentialProtocol.findById(agentContext, expected.id);
            expect(credentialRepository.findById).toBeCalledWith(agentContext, expected.id);
            expect(result).toBe(expected);
        }));
        it('getAll should return value from credentialRepository.getAll', () => __awaiter(void 0, void 0, void 0, function* () {
            const expected = [mockCredentialRecord(), mockCredentialRecord()];
            (0, helpers_1.mockFunction)(credentialRepository.getAll).mockReturnValue(Promise.resolve(expected));
            const result = yield credentialProtocol.getAll(agentContext);
            expect(credentialRepository.getAll).toBeCalledWith(agentContext);
            expect(result).toEqual(expect.arrayContaining(expected));
        }));
        it('findAllByQuery should return value from credentialRepository.findByQuery', () => __awaiter(void 0, void 0, void 0, function* () {
            const expected = [mockCredentialRecord(), mockCredentialRecord()];
            (0, helpers_1.mockFunction)(credentialRepository.findByQuery).mockReturnValue(Promise.resolve(expected));
            const result = yield credentialProtocol.findAllByQuery(agentContext, { state: CredentialState_1.CredentialState.OfferSent });
            expect(credentialRepository.findByQuery).toBeCalledWith(agentContext, { state: CredentialState_1.CredentialState.OfferSent });
            expect(result).toEqual(expect.arrayContaining(expected));
        }));
    });
    describe('deleteCredential', () => {
        it('should call delete from repository', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = mockCredentialRecord();
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockReturnValue(Promise.resolve(credentialRecord));
            const repositoryDeleteSpy = jest.spyOn(credentialRepository, 'delete');
            yield credentialProtocol.delete(agentContext, credentialRecord);
            expect(repositoryDeleteSpy).toHaveBeenNthCalledWith(1, agentContext, credentialRecord);
        }));
        it('should call deleteCredentialById in testCredentialFormatService if deleteAssociatedCredential is true', () => __awaiter(void 0, void 0, void 0, function* () {
            const deleteCredentialMock = (0, helpers_1.mockFunction)(exports.testCredentialFormatService.deleteCredentialById);
            const credentialRecord = mockCredentialRecord();
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockResolvedValue(credentialRecord);
            yield credentialProtocol.delete(agentContext, credentialRecord, {
                deleteAssociatedCredentials: true,
                deleteAssociatedDidCommMessages: false,
            });
            expect(deleteCredentialMock).toHaveBeenNthCalledWith(1, agentContext, credentialRecord.credentials[0].credentialRecordId);
        }));
        it('should not call deleteCredentialById in testCredentialFormatService if deleteAssociatedCredential is false', () => __awaiter(void 0, void 0, void 0, function* () {
            const deleteCredentialMock = (0, helpers_1.mockFunction)(exports.testCredentialFormatService.deleteCredentialById);
            const credentialRecord = mockCredentialRecord();
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockResolvedValue(credentialRecord);
            yield credentialProtocol.delete(agentContext, credentialRecord, {
                deleteAssociatedCredentials: false,
                deleteAssociatedDidCommMessages: false,
            });
            expect(deleteCredentialMock).not.toHaveBeenCalled();
        }));
        it('deleteAssociatedCredentials should default to true', () => __awaiter(void 0, void 0, void 0, function* () {
            const deleteCredentialMock = (0, helpers_1.mockFunction)(exports.testCredentialFormatService.deleteCredentialById);
            const credentialRecord = mockCredentialRecord();
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockResolvedValue(credentialRecord);
            yield credentialProtocol.delete(agentContext, credentialRecord);
            expect(deleteCredentialMock).toHaveBeenNthCalledWith(1, agentContext, credentialRecord.credentials[0].credentialRecordId);
        }));
        it('deleteAssociatedDidCommMessages should default to true', () => __awaiter(void 0, void 0, void 0, function* () {
            const deleteCredentialMock = (0, helpers_1.mockFunction)(exports.testCredentialFormatService.deleteCredentialById);
            const credentialRecord = mockCredentialRecord();
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockResolvedValue(credentialRecord);
            yield credentialProtocol.delete(agentContext, credentialRecord);
            expect(deleteCredentialMock).toHaveBeenNthCalledWith(1, agentContext, credentialRecord.credentials[0].credentialRecordId);
            expect(didCommMessageRepository.delete).toHaveBeenCalledTimes(3);
        }));
    });
});
