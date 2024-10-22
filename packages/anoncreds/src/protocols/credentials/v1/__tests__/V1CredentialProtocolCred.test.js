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
const core_1 = require("@aries-framework/core");
const rxjs_1 = require("rxjs");
const ConnectionService_1 = require("../../../../../../core/src/modules/connections/services/ConnectionService");
const CredentialRepository_1 = require("../../../../../../core/src/modules/credentials/repository/CredentialRepository");
const DidCommMessageRepository_1 = require("../../../../../../core/src/storage/didcomm/DidCommMessageRepository");
const helpers_1 = require("../../../../../../core/tests/helpers");
const LegacyIndyCredentialFormatService_1 = require("../../../../formats/LegacyIndyCredentialFormatService");
const credential_1 = require("../../../../utils/credential");
const V1CredentialProtocol_1 = require("../V1CredentialProtocol");
const messages_1 = require("../messages");
// Mock classes
jest.mock('../../../../../../core/src/modules/credentials/repository/CredentialRepository');
jest.mock('../../../../formats/LegacyIndyCredentialFormatService');
jest.mock('../../../../../../core/src/storage/didcomm/DidCommMessageRepository');
jest.mock('../../../../../../core/src/modules/connections/services/ConnectionService');
// Mock typed object
const CredentialRepositoryMock = CredentialRepository_1.CredentialRepository;
const LegacyIndyCredentialFormatServiceMock = LegacyIndyCredentialFormatService_1.LegacyIndyCredentialFormatService;
const DidCommMessageRepositoryMock = DidCommMessageRepository_1.DidCommMessageRepository;
const ConnectionServiceMock = ConnectionService_1.ConnectionService;
const credentialRepository = new CredentialRepositoryMock();
const didCommMessageRepository = new DidCommMessageRepositoryMock();
const legacyIndyCredentialFormatService = new LegacyIndyCredentialFormatServiceMock();
const connectionService = new ConnectionServiceMock();
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
legacyIndyCredentialFormatService.credentialRecordType = 'anoncreds';
const connection = (0, helpers_1.getMockConnection)({
    id: '123',
    state: core_1.DidExchangeState.Completed,
});
const credentialPreview = messages_1.V1CredentialPreview.fromRecord({
    name: 'John',
    age: '99',
});
const offerAttachment = new core_1.Attachment({
    id: messages_1.INDY_CREDENTIAL_OFFER_ATTACHMENT_ID,
    mimeType: 'application/json',
    data: new core_1.AttachmentData({
        base64: 'eyJzY2hlbWFfaWQiOiJhYWEiLCJjcmVkX2RlZl9pZCI6IlRoN01wVGFSWlZSWW5QaWFiZHM4MVk6MzpDTDoxNzpUQUciLCJub25jZSI6Im5vbmNlIiwia2V5X2NvcnJlY3RuZXNzX3Byb29mIjp7fX0',
    }),
});
const requestAttachment = new core_1.Attachment({
    id: messages_1.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID,
    mimeType: 'application/json',
    data: new core_1.AttachmentData({
        base64: core_1.JsonEncoder.toBase64({}),
    }),
});
const credentialAttachment = new core_1.Attachment({
    id: messages_1.INDY_CREDENTIAL_ATTACHMENT_ID,
    mimeType: 'application/json',
    data: new core_1.AttachmentData({
        base64: core_1.JsonEncoder.toBase64({
            values: (0, credential_1.convertAttributesToCredentialValues)(credentialPreview.attributes),
        }),
    }),
});
const credentialProposalMessage = new messages_1.V1ProposeCredentialMessage({
    comment: 'comment',
    credentialDefinitionId: 'Th7MpTaRZVRYnPiabds81Y:3:CL:17:TAG',
});
const credentialRequestMessage = new messages_1.V1RequestCredentialMessage({
    comment: 'abcd',
    requestAttachments: [requestAttachment],
});
const credentialOfferMessage = new messages_1.V1OfferCredentialMessage({
    comment: 'some comment',
    credentialPreview: credentialPreview,
    offerAttachments: [offerAttachment],
});
const credentialIssueMessage = new messages_1.V1IssueCredentialMessage({
    comment: 'some comment',
    credentialAttachments: [offerAttachment],
});
const didCommMessageRecord = new core_1.DidCommMessageRecord({
    associatedRecordId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
    message: { '@id': '123', '@type': 'https://didcomm.org/issue-credential/1.0/offer-credential' },
    role: core_1.DidCommMessageRole.Receiver,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAgentMessageMock = (agentContext, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (options.messageClass === messages_1.V1ProposeCredentialMessage) {
        return credentialProposalMessage;
    }
    if (options.messageClass === messages_1.V1OfferCredentialMessage) {
        return credentialOfferMessage;
    }
    if (options.messageClass === messages_1.V1RequestCredentialMessage) {
        return credentialRequestMessage;
    }
    if (options.messageClass === messages_1.V1IssueCredentialMessage) {
        return credentialIssueMessage;
    }
    throw new core_1.AriesFrameworkError('Could not find message');
});
// A record is deserialized to JSON when it's stored into the storage. We want to simulate this behaviour for `offer`
// object to test our service would behave correctly. We use type assertion for `offer` attribute to `any`.
const mockCredentialRecord = ({ state, threadId, connectionId, tags, id, credentialAttributes, } = {}) => {
    const credentialRecord = new core_1.CredentialExchangeRecord({
        id,
        credentialAttributes: credentialAttributes || credentialPreview.attributes,
        state: state || core_1.CredentialState.OfferSent,
        threadId: threadId !== null && threadId !== void 0 ? threadId : '809dd7ec-f0e7-4b97-9231-7a3615af6139',
        connectionId: connectionId !== null && connectionId !== void 0 ? connectionId : '123',
        credentials: [
            {
                credentialRecordType: 'anoncreds',
                credentialRecordId: '123456',
            },
        ],
        tags,
        protocolVersion: 'v1',
    });
    return credentialRecord;
};
describe('V1CredentialProtocol', () => {
    let eventEmitter;
    let agentConfig;
    let agentContext;
    let credentialProtocol;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // real objects
        agentConfig = (0, helpers_1.getAgentConfig)('V1CredentialProtocolCredTest');
        eventEmitter = new core_1.EventEmitter(agentConfig.agentDependencies, new rxjs_1.Subject());
        agentContext = (0, helpers_1.getAgentContext)({
            registerInstances: [
                [CredentialRepository_1.CredentialRepository, credentialRepository],
                [DidCommMessageRepository_1.DidCommMessageRepository, didCommMessageRepository],
                [core_1.EventEmitter, eventEmitter],
                [ConnectionService_1.ConnectionService, connectionService],
            ],
            agentConfig,
        });
        // mock function implementations
        (0, helpers_1.mockFunction)(connectionService.getById).mockResolvedValue(connection);
        (0, helpers_1.mockFunction)(didCommMessageRepository.findAgentMessage).mockImplementation(getAgentMessageMock);
        (0, helpers_1.mockFunction)(didCommMessageRepository.getAgentMessage).mockImplementation(getAgentMessageMock);
        (0, helpers_1.mockFunction)(didCommMessageRepository.findByQuery).mockResolvedValue([
            didCommMessageRecord,
            didCommMessageRecord,
            didCommMessageRecord,
        ]);
        credentialProtocol = new V1CredentialProtocol_1.V1CredentialProtocol({ indyCredentialFormat: legacyIndyCredentialFormatService });
    }));
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('acceptOffer', () => {
        test(`calls the format service and updates state to ${core_1.CredentialState.RequestSent}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = mockCredentialRecord({
                id: '84353745-8bd9-42e1-8d81-238ca77c29d2',
                state: core_1.CredentialState.OfferReceived,
                threadId: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
            // mock resolved format call
            (0, helpers_1.mockFunction)(legacyIndyCredentialFormatService.acceptOffer).mockResolvedValue({
                attachment: requestAttachment,
                format: new core_1.CredentialFormatSpec({
                    format: 'indy',
                    attachmentId: messages_1.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID,
                }),
            });
            // when
            const { message } = yield credentialProtocol.acceptOffer(agentContext, {
                comment: 'hello',
                autoAcceptCredential: core_1.AutoAcceptCredential.Never,
                credentialRecord,
            });
            // then
            expect(credentialRecord).toMatchObject({
                state: core_1.CredentialState.RequestSent,
                autoAcceptCredential: core_1.AutoAcceptCredential.Never,
            });
            expect(message).toBeInstanceOf(messages_1.V1RequestCredentialMessage);
            expect(message.toJSON()).toMatchObject({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/issue-credential/1.0/request-credential',
                comment: 'hello',
                '~thread': {
                    thid: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
                },
                'requests~attach': [core_1.JsonTransformer.toJSON(requestAttachment)],
            });
            expect(credentialRepository.update).toHaveBeenCalledTimes(1);
            expect(legacyIndyCredentialFormatService.acceptOffer).toHaveBeenCalledWith(agentContext, {
                credentialRecord,
                attachmentId: messages_1.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID,
                offerAttachment,
            });
            expect(didCommMessageRepository.saveOrUpdateAgentMessage).toHaveBeenCalledWith(agentContext, {
                agentMessage: message,
                associatedRecordId: '84353745-8bd9-42e1-8d81-238ca77c29d2',
                role: core_1.DidCommMessageRole.Sender,
            });
        }));
        test(`calls updateState to update the state to ${core_1.CredentialState.RequestSent}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const credentialRecord = mockCredentialRecord({
                state: core_1.CredentialState.OfferReceived,
            });
            const updateStateSpy = jest.spyOn(credentialProtocol, 'updateState');
            // mock resolved format call
            (0, helpers_1.mockFunction)(legacyIndyCredentialFormatService.acceptOffer).mockResolvedValue({
                attachment: requestAttachment,
                format: new core_1.CredentialFormatSpec({
                    format: 'indy',
                    attachmentId: messages_1.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID,
                }),
            });
            // when
            yield credentialProtocol.acceptOffer(agentContext, {
                credentialRecord,
            });
            // then
            expect(updateStateSpy).toHaveBeenCalledWith(agentContext, credentialRecord, core_1.CredentialState.RequestSent);
        }));
        const validState = core_1.CredentialState.OfferReceived;
        const invalidCredentialStates = Object.values(core_1.CredentialState).filter((state) => state !== validState);
        test(`throws an error when state transition is invalid`, () => __awaiter(void 0, void 0, void 0, function* () {
            yield Promise.all(invalidCredentialStates.map((state) => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(credentialProtocol.acceptOffer(agentContext, { credentialRecord: mockCredentialRecord({ state }) })).rejects.toThrowError(`Credential record is in invalid state ${state}. Valid states are: ${validState}.`);
            })));
        }));
    });
    describe('processRequest', () => {
        let credential;
        let messageContext;
        beforeEach(() => {
            credential = mockCredentialRecord({ state: core_1.CredentialState.OfferSent });
            const credentialRequest = new messages_1.V1RequestCredentialMessage({
                comment: 'abcd',
                requestAttachments: [requestAttachment],
            });
            credentialRequest.setThread({ threadId: 'somethreadid' });
            messageContext = new core_1.InboundMessageContext(credentialRequest, {
                agentContext,
                connection,
            });
        });
        test(`updates state to ${core_1.CredentialState.RequestReceived}, set request and returns credential record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const repositoryUpdateSpy = jest.spyOn(credentialRepository, 'update');
            // given
            (0, helpers_1.mockFunction)(credentialRepository.getSingleByQuery).mockReturnValue(Promise.resolve(credential));
            // when
            const returnedCredentialRecord = yield credentialProtocol.processRequest(messageContext);
            // then
            expect(credentialRepository.getSingleByQuery).toHaveBeenNthCalledWith(1, agentContext, {
                threadId: 'somethreadid',
            });
            expect(repositoryUpdateSpy).toHaveBeenCalledTimes(1);
            expect(returnedCredentialRecord.state).toEqual(core_1.CredentialState.RequestReceived);
        }));
        test(`emits stateChange event from ${core_1.CredentialState.OfferSent} to ${core_1.CredentialState.RequestReceived}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(core_1.CredentialEventTypes.CredentialStateChanged, eventListenerMock);
            (0, helpers_1.mockFunction)(credentialRepository.getSingleByQuery).mockReturnValue(Promise.resolve(credential));
            // mock offer so that the request works
            const returnedCredentialRecord = yield credentialProtocol.processRequest(messageContext);
            // then
            expect(credentialRepository.getSingleByQuery).toHaveBeenNthCalledWith(1, agentContext, {
                threadId: 'somethreadid',
            });
            expect(returnedCredentialRecord.state).toEqual(core_1.CredentialState.RequestReceived);
        }));
        const validState = core_1.CredentialState.OfferSent;
        const invalidCredentialStates = Object.values(core_1.CredentialState).filter((state) => state !== validState);
        test(`throws an error when state transition is invalid`, () => __awaiter(void 0, void 0, void 0, function* () {
            yield Promise.all(invalidCredentialStates.map((state) => __awaiter(void 0, void 0, void 0, function* () {
                (0, helpers_1.mockFunction)(credentialRepository.getSingleByQuery).mockReturnValue(Promise.resolve(mockCredentialRecord({ state })));
                yield expect(credentialProtocol.processRequest(messageContext)).rejects.toThrowError(`Credential record is in invalid state ${state}. Valid states are: ${validState}.`);
            })));
        }));
    });
    describe('acceptRequest', () => {
        test(`updates state to ${core_1.CredentialState.CredentialIssued}`, () => __awaiter(void 0, void 0, void 0, function* () {
            // given
            const credentialRecord = mockCredentialRecord({
                state: core_1.CredentialState.RequestReceived,
                threadId: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
            (0, helpers_1.mockFunction)(legacyIndyCredentialFormatService.acceptRequest).mockResolvedValue({
                attachment: credentialAttachment,
                format: new core_1.CredentialFormatSpec({
                    format: 'the-format',
                    attachmentId: 'the-attach-id',
                }),
            });
            // when
            yield credentialProtocol.acceptRequest(agentContext, { credentialRecord });
            // then
            expect(credentialRepository.update).toHaveBeenCalledWith(agentContext, expect.objectContaining({
                state: core_1.CredentialState.CredentialIssued,
            }));
        }));
        test(`emits stateChange event from ${core_1.CredentialState.RequestReceived} to ${core_1.CredentialState.CredentialIssued}`, () => __awaiter(void 0, void 0, void 0, function* () {
            // given
            const credentialRecord = mockCredentialRecord({
                state: core_1.CredentialState.RequestReceived,
                threadId: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockResolvedValue(credentialRecord);
            (0, helpers_1.mockFunction)(legacyIndyCredentialFormatService.acceptRequest).mockResolvedValue({
                attachment: credentialAttachment,
                format: new core_1.CredentialFormatSpec({
                    format: 'the-format',
                    attachmentId: 'the-attach-id',
                }),
            });
            const eventListenerMock = jest.fn();
            eventEmitter.on(core_1.CredentialEventTypes.CredentialStateChanged, eventListenerMock);
            // when
            yield credentialProtocol.acceptRequest(agentContext, { credentialRecord });
            // then
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'CredentialStateChanged',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: core_1.CredentialState.RequestReceived,
                    credentialRecord: expect.objectContaining({
                        state: core_1.CredentialState.CredentialIssued,
                    }),
                },
            });
        }));
        test('returns credential response message based on credential request message', () => __awaiter(void 0, void 0, void 0, function* () {
            // given
            const credentialRecord = mockCredentialRecord({
                state: core_1.CredentialState.RequestReceived,
                threadId: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockResolvedValue(credentialRecord);
            const comment = 'credential response comment';
            (0, helpers_1.mockFunction)(legacyIndyCredentialFormatService.acceptRequest).mockResolvedValue({
                attachment: credentialAttachment,
                format: new core_1.CredentialFormatSpec({
                    format: 'the-format',
                    attachmentId: 'the-attach-id',
                }),
            });
            // when
            const { message } = yield credentialProtocol.acceptRequest(agentContext, { credentialRecord, comment });
            // then
            expect(message.toJSON()).toMatchObject({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/issue-credential/1.0/issue-credential',
                '~thread': {
                    thid: credentialRecord.threadId,
                },
                comment,
                'credentials~attach': [core_1.JsonTransformer.toJSON(credentialAttachment)],
                '~please_ack': expect.any(Object),
            });
            expect(legacyIndyCredentialFormatService.acceptRequest).toHaveBeenCalledWith(agentContext, {
                credentialRecord,
                requestAttachment,
                offerAttachment,
                attachmentId: messages_1.INDY_CREDENTIAL_ATTACHMENT_ID,
            });
        }));
    });
    describe('processCredential', () => {
        test('finds credential record by thread id and calls processCredential on indyCredentialFormatService', () => __awaiter(void 0, void 0, void 0, function* () {
            // given
            const credentialRecord = mockCredentialRecord({
                state: core_1.CredentialState.RequestSent,
            });
            const credentialResponse = new messages_1.V1IssueCredentialMessage({
                comment: 'abcd',
                credentialAttachments: [credentialAttachment],
            });
            credentialResponse.setThread({ threadId: 'somethreadid' });
            const messageContext = new core_1.InboundMessageContext(credentialResponse, { agentContext, connection });
            (0, helpers_1.mockFunction)(credentialRepository.getSingleByQuery).mockResolvedValue(credentialRecord);
            // when
            yield credentialProtocol.processCredential(messageContext);
            // then
            expect(credentialRepository.getSingleByQuery).toHaveBeenNthCalledWith(1, agentContext, {
                threadId: 'somethreadid',
                connectionId: connection.id,
            });
            expect(didCommMessageRepository.saveAgentMessage).toHaveBeenCalledWith(agentContext, {
                agentMessage: credentialResponse,
                role: core_1.DidCommMessageRole.Receiver,
                associatedRecordId: credentialRecord.id,
            });
            expect(legacyIndyCredentialFormatService.processCredential).toHaveBeenNthCalledWith(1, agentContext, {
                attachment: credentialAttachment,
                credentialRecord,
                requestAttachment: expect.any(core_1.Attachment),
            });
        }));
    });
    describe('acceptCredential', () => {
        const threadId = 'fd9c5ddb-ec11-4acd-bc32-540736249746';
        let credential;
        beforeEach(() => {
            credential = mockCredentialRecord({
                state: core_1.CredentialState.CredentialReceived,
                threadId,
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
        });
        test(`updates state to ${core_1.CredentialState.Done}`, () => __awaiter(void 0, void 0, void 0, function* () {
            // given
            const repositoryUpdateSpy = jest.spyOn(credentialRepository, 'update');
            // when
            yield credentialProtocol.acceptCredential(agentContext, { credentialRecord: credential });
            // then
            expect(repositoryUpdateSpy).toHaveBeenCalledTimes(1);
            const [[, updatedCredentialRecord]] = repositoryUpdateSpy.mock.calls;
            expect(updatedCredentialRecord).toMatchObject({
                state: core_1.CredentialState.Done,
            });
        }));
        test(`emits stateChange event from ${core_1.CredentialState.CredentialReceived} to ${core_1.CredentialState.Done}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(core_1.CredentialEventTypes.CredentialStateChanged, eventListenerMock);
            // when
            yield credentialProtocol.acceptCredential(agentContext, { credentialRecord: credential });
            // then
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'CredentialStateChanged',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: core_1.CredentialState.CredentialReceived,
                    credentialRecord: expect.objectContaining({
                        state: core_1.CredentialState.Done,
                    }),
                },
            });
        }));
        test('returns credential response message base on credential request message', () => __awaiter(void 0, void 0, void 0, function* () {
            // given
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockReturnValue(Promise.resolve(credential));
            // when
            const { message: ackMessage } = yield credentialProtocol.acceptCredential(agentContext, {
                credentialRecord: credential,
            });
            // then
            expect(ackMessage.toJSON()).toMatchObject({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/issue-credential/1.0/ack',
                '~thread': {
                    thid: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
                },
            });
        }));
        const validState = core_1.CredentialState.CredentialReceived;
        const invalidCredentialStates = Object.values(core_1.CredentialState).filter((state) => state !== validState);
        test(`throws an error when state transition is invalid`, () => __awaiter(void 0, void 0, void 0, function* () {
            yield Promise.all(invalidCredentialStates.map((state) => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(credentialProtocol.acceptCredential(agentContext, {
                    credentialRecord: mockCredentialRecord({
                        state,
                        threadId,
                        connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
                    }),
                })).rejects.toThrowError(`Credential record is in invalid state ${state}. Valid states are: ${validState}.`);
            })));
        }));
    });
    describe('processAck', () => {
        let credential;
        let messageContext;
        beforeEach(() => {
            credential = mockCredentialRecord({
                state: core_1.CredentialState.CredentialIssued,
            });
            const credentialRequest = new messages_1.V1CredentialAckMessage({
                status: core_1.AckStatus.OK,
                threadId: 'somethreadid',
            });
            messageContext = new core_1.InboundMessageContext(credentialRequest, { agentContext, connection });
        });
        test(`updates state to ${core_1.CredentialState.Done} and returns credential record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const repositoryUpdateSpy = jest.spyOn(credentialRepository, 'update');
            // given
            (0, helpers_1.mockFunction)(credentialRepository.getSingleByQuery).mockReturnValue(Promise.resolve(credential));
            // when
            const returnedCredentialRecord = yield credentialProtocol.processAck(messageContext);
            // then
            const expectedCredentialRecord = {
                state: core_1.CredentialState.Done,
            };
            expect(credentialRepository.getSingleByQuery).toHaveBeenNthCalledWith(1, agentContext, {
                threadId: 'somethreadid',
                connectionId: connection.id,
            });
            expect(repositoryUpdateSpy).toHaveBeenCalledTimes(1);
            const [[, updatedCredentialRecord]] = repositoryUpdateSpy.mock.calls;
            expect(updatedCredentialRecord).toMatchObject(expectedCredentialRecord);
            expect(returnedCredentialRecord).toMatchObject(expectedCredentialRecord);
        }));
    });
    describe('createProblemReport', () => {
        const threadId = 'fd9c5ddb-ec11-4acd-bc32-540736249746';
        let credential;
        beforeEach(() => {
            credential = mockCredentialRecord({
                state: core_1.CredentialState.OfferReceived,
                threadId,
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
        });
        test('returns problem report message base once get error', () => __awaiter(void 0, void 0, void 0, function* () {
            // given
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockReturnValue(Promise.resolve(credential));
            // when
            const { message } = yield credentialProtocol.createProblemReport(agentContext, {
                description: 'Indy error',
                credentialRecord: credential,
            });
            message.setThread({ threadId });
            // then
            expect(message.toJSON()).toMatchObject({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/issue-credential/1.0/problem-report',
                '~thread': {
                    thid: threadId,
                },
                description: {
                    code: core_1.CredentialProblemReportReason.IssuanceAbandoned,
                    en: 'Indy error',
                },
            });
        }));
    });
    describe('processProblemReport', () => {
        let credential;
        let messageContext;
        beforeEach(() => {
            credential = mockCredentialRecord({
                state: core_1.CredentialState.OfferReceived,
            });
            const credentialProblemReportMessage = new messages_1.V1CredentialProblemReportMessage({
                description: {
                    en: 'Indy error',
                    code: core_1.CredentialProblemReportReason.IssuanceAbandoned,
                },
            });
            credentialProblemReportMessage.setThread({ threadId: 'somethreadid' });
            messageContext = new core_1.InboundMessageContext(credentialProblemReportMessage, { agentContext, connection });
        });
        test(`updates problem report error message and returns credential record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const repositoryUpdateSpy = jest.spyOn(credentialRepository, 'update');
            // given
            (0, helpers_1.mockFunction)(credentialRepository.getSingleByQuery).mockReturnValue(Promise.resolve(credential));
            // when
            const returnedCredentialRecord = yield credentialProtocol.processProblemReport(messageContext);
            // then
            const expectedCredentialRecord = {
                errorMessage: 'issuance-abandoned: Indy error',
            };
            expect(credentialRepository.getSingleByQuery).toHaveBeenNthCalledWith(1, agentContext, {
                threadId: 'somethreadid',
                connectionId: connection.id,
            });
            expect(repositoryUpdateSpy).toHaveBeenCalledTimes(1);
            const [[, updatedCredentialRecord]] = repositoryUpdateSpy.mock.calls;
            expect(updatedCredentialRecord).toMatchObject(expectedCredentialRecord);
            expect(returnedCredentialRecord).toMatchObject(expectedCredentialRecord);
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
            const result = yield credentialProtocol.findAllByQuery(agentContext, { state: core_1.CredentialState.OfferSent });
            expect(credentialRepository.findByQuery).toBeCalledWith(agentContext, { state: core_1.CredentialState.OfferSent });
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
        it('should call deleteCredentialById in indyCredentialFormatService if deleteAssociatedCredential is true', () => __awaiter(void 0, void 0, void 0, function* () {
            const deleteCredentialMock = (0, helpers_1.mockFunction)(legacyIndyCredentialFormatService.deleteCredentialById);
            const credentialRecord = mockCredentialRecord();
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockResolvedValue(credentialRecord);
            yield credentialProtocol.delete(agentContext, credentialRecord, {
                deleteAssociatedCredentials: true,
                deleteAssociatedDidCommMessages: false,
            });
            expect(deleteCredentialMock).toHaveBeenNthCalledWith(1, agentContext, credentialRecord.credentials[0].credentialRecordId);
        }));
        it('should not call deleteCredentialById in indyCredentialFormatService if deleteAssociatedCredential is false', () => __awaiter(void 0, void 0, void 0, function* () {
            const deleteCredentialMock = (0, helpers_1.mockFunction)(legacyIndyCredentialFormatService.deleteCredentialById);
            const credentialRecord = mockCredentialRecord();
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockResolvedValue(credentialRecord);
            yield credentialProtocol.delete(agentContext, credentialRecord, {
                deleteAssociatedCredentials: false,
                deleteAssociatedDidCommMessages: false,
            });
            expect(deleteCredentialMock).not.toHaveBeenCalled();
        }));
        it('deleteAssociatedCredentials should default to true', () => __awaiter(void 0, void 0, void 0, function* () {
            const deleteCredentialMock = (0, helpers_1.mockFunction)(legacyIndyCredentialFormatService.deleteCredentialById);
            const credentialRecord = mockCredentialRecord();
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockResolvedValue(credentialRecord);
            yield credentialProtocol.delete(agentContext, credentialRecord);
            expect(deleteCredentialMock).toHaveBeenNthCalledWith(1, agentContext, credentialRecord.credentials[0].credentialRecordId);
        }));
        it('deleteAssociatedDidCommMessages should default to true', () => __awaiter(void 0, void 0, void 0, function* () {
            const deleteCredentialMock = (0, helpers_1.mockFunction)(legacyIndyCredentialFormatService.deleteCredentialById);
            const credentialRecord = mockCredentialRecord();
            (0, helpers_1.mockFunction)(credentialRepository.getById).mockResolvedValue(credentialRecord);
            yield credentialProtocol.delete(agentContext, credentialRecord);
            expect(deleteCredentialMock).toHaveBeenNthCalledWith(1, agentContext, credentialRecord.credentials[0].credentialRecordId);
            expect(didCommMessageRepository.delete).toHaveBeenCalledTimes(3);
        }));
    });
});
