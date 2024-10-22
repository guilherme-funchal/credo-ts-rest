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
const helpers_1 = require("../../../../../../tests/helpers");
const Dispatcher_1 = require("../../../../../agent/Dispatcher");
const EventEmitter_1 = require("../../../../../agent/EventEmitter");
const InboundMessageContext_1 = require("../../../../../agent/models/InboundMessageContext");
const Attachment_1 = require("../../../../../decorators/attachment/Attachment");
const storage_1 = require("../../../../../storage");
const utils_1 = require("../../../../../utils");
const connections_1 = require("../../../../connections");
const ConnectionService_1 = require("../../../../connections/services/ConnectionService");
const RoutingService_1 = require("../../../../routing/services/RoutingService");
const CredentialEvents_1 = require("../../../CredentialEvents");
const models_1 = require("../../../models");
const CredentialState_1 = require("../../../models/CredentialState");
const CredentialExchangeRecord_1 = require("../../../repository/CredentialExchangeRecord");
const CredentialRepository_1 = require("../../../repository/CredentialRepository");
const V2CredentialProtocol_1 = require("../V2CredentialProtocol");
const messages_1 = require("../messages");
const V2OfferCredentialMessage_1 = require("../messages/V2OfferCredentialMessage");
const offerFormat = new models_1.CredentialFormatSpec({
    attachmentId: 'offer-attachment-id',
    format: 'hlindy/cred-abstract@v2.0',
});
const offerAttachment = new Attachment_1.Attachment({
    id: 'offer-attachment-id',
    mimeType: 'application/json',
    data: new Attachment_1.AttachmentData({
        base64: 'eyJzY2hlbWFfaWQiOiJhYWEiLCJjcmVkX2RlZl9pZCI6IlRoN01wVGFSWlZSWW5QaWFiZHM4MVk6MzpDTDoxNzpUQUciLCJub25jZSI6Im5vbmNlIiwia2V5X2NvcnJlY3RuZXNzX3Byb29mIjp7fX0',
    }),
});
exports.testCredentialFormatService = {
    credentialRecordType: 'test',
    formatKey: 'test',
    supportsFormat: (_format) => true,
    createOffer: (_agentContext, _options) => __awaiter(void 0, void 0, void 0, function* () {
        return ({
            attachment: offerAttachment,
            format: offerFormat,
            previewAttributes: [
                {
                    mimeType: 'text/plain',
                    name: 'name',
                    value: 'John',
                },
                {
                    mimeType: 'text/plain',
                    name: 'age',
                    value: '99',
                },
            ],
        });
    }),
    acceptRequest: jest.fn(),
    deleteCredentialById: jest.fn(),
    processCredential: jest.fn(),
    acceptOffer: jest.fn(),
    processRequest: jest.fn(),
    processOffer: jest.fn(),
};
// Mock classes
jest.mock('../../../repository/CredentialRepository');
jest.mock('../../../../../storage/didcomm/DidCommMessageRepository');
jest.mock('../../../../routing/services/RoutingService');
jest.mock('../../../../connections/services/ConnectionService');
jest.mock('../../../../../agent/Dispatcher');
// Mock typed object
const CredentialRepositoryMock = CredentialRepository_1.CredentialRepository;
const DidCommMessageRepositoryMock = storage_1.DidCommMessageRepository;
const RoutingServiceMock = RoutingService_1.RoutingService;
const ConnectionServiceMock = ConnectionService_1.ConnectionService;
const DispatcherMock = Dispatcher_1.Dispatcher;
const credentialRepository = new CredentialRepositoryMock();
const didCommMessageRepository = new DidCommMessageRepositoryMock();
const routingService = new RoutingServiceMock();
const dispatcher = new DispatcherMock();
const connectionService = new ConnectionServiceMock();
const agentConfig = (0, helpers_1.getAgentConfig)('V2CredentialProtocolOfferTest');
const eventEmitter = new EventEmitter_1.EventEmitter(agentConfig.agentDependencies, new rxjs_1.Subject());
const agentContext = (0, helpers_1.getAgentContext)({
    registerInstances: [
        [CredentialRepository_1.CredentialRepository, credentialRepository],
        [storage_1.DidCommMessageRepository, didCommMessageRepository],
        [RoutingService_1.RoutingService, routingService],
        [Dispatcher_1.Dispatcher, dispatcher],
        [ConnectionService_1.ConnectionService, connectionService],
        [EventEmitter_1.EventEmitter, eventEmitter],
    ],
    agentConfig,
});
const connectionRecord = (0, helpers_1.getMockConnection)({
    id: '123',
    state: connections_1.DidExchangeState.Completed,
});
describe('V2CredentialProtocolOffer', () => {
    let credentialProtocol;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // mock function implementations
        (0, helpers_1.mockFunction)(connectionService.getById).mockResolvedValue(connectionRecord);
        credentialProtocol = new V2CredentialProtocol_1.V2CredentialProtocol({
            credentialFormats: [exports.testCredentialFormatService],
        });
    }));
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('createOffer', () => {
        const offerOptions = {
            comment: 'some comment',
            connectionRecord,
            credentialFormats: {
                test: {},
            },
        };
        test(`creates credential record in ${CredentialState_1.CredentialState.OfferSent} state with offer, thread ID`, () => __awaiter(void 0, void 0, void 0, function* () {
            // when
            yield credentialProtocol.createOffer(agentContext, offerOptions);
            // then
            expect(credentialRepository.save).toHaveBeenNthCalledWith(1, agentContext, expect.objectContaining({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                state: CredentialState_1.CredentialState.OfferSent,
                connectionId: connectionRecord.id,
            }));
        }));
        test(`emits stateChange event with a new credential in ${CredentialState_1.CredentialState.OfferSent} state`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(CredentialEvents_1.CredentialEventTypes.CredentialStateChanged, eventListenerMock);
            yield credentialProtocol.createOffer(agentContext, offerOptions);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'CredentialStateChanged',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: null,
                    credentialRecord: expect.objectContaining({
                        state: CredentialState_1.CredentialState.OfferSent,
                    }),
                },
            });
        }));
        test('returns credential offer message', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message: credentialOffer } = yield credentialProtocol.createOffer(agentContext, offerOptions);
            expect(credentialOffer.toJSON()).toMatchObject({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/issue-credential/2.0/offer-credential',
                comment: 'some comment',
                credential_preview: {
                    '@type': 'https://didcomm.org/issue-credential/2.0/credential-preview',
                    attributes: [
                        {
                            name: 'name',
                            'mime-type': 'text/plain',
                            value: 'John',
                        },
                        {
                            name: 'age',
                            'mime-type': 'text/plain',
                            value: '99',
                        },
                    ],
                },
                formats: [utils_1.JsonTransformer.toJSON(offerFormat)],
                'offers~attach': [utils_1.JsonTransformer.toJSON(offerAttachment)],
            });
        }));
    });
    describe('processOffer', () => {
        const credentialOfferMessage = new V2OfferCredentialMessage_1.V2OfferCredentialMessage({
            formats: [offerFormat],
            comment: 'some comment',
            credentialPreview: new messages_1.V2CredentialPreview({
                attributes: [],
            }),
            offerAttachments: [offerAttachment],
        });
        const messageContext = new InboundMessageContext_1.InboundMessageContext(credentialOfferMessage, {
            agentContext,
            connection: connectionRecord,
        });
        test(`creates and return credential record in ${CredentialState_1.CredentialState.OfferReceived} state with offer, thread ID`, () => __awaiter(void 0, void 0, void 0, function* () {
            // when
            yield credentialProtocol.processOffer(messageContext);
            // then
            expect(credentialRepository.save).toHaveBeenNthCalledWith(1, agentContext, expect.objectContaining({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                threadId: credentialOfferMessage.id,
                connectionId: connectionRecord.id,
                state: CredentialState_1.CredentialState.OfferReceived,
            }));
        }));
        test(`emits stateChange event with ${CredentialState_1.CredentialState.OfferReceived}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(CredentialEvents_1.CredentialEventTypes.CredentialStateChanged, eventListenerMock);
            // when
            yield credentialProtocol.processOffer(messageContext);
            // then
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'CredentialStateChanged',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: null,
                    credentialRecord: expect.objectContaining({
                        state: CredentialState_1.CredentialState.OfferReceived,
                    }),
                },
            });
        }));
    });
});
