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
const V1CredentialProtocol_1 = require("../V1CredentialProtocol");
const messages_1 = require("../messages");
// Mock classes
jest.mock('../../../../../../core/src/modules/credentials/repository/CredentialRepository');
jest.mock('../../../../formats/LegacyIndyCredentialFormatService');
jest.mock('../../../../../../core/src/storage/didcomm/DidCommMessageRepository');
jest.mock('../../../../../../core/src/modules/connections/services/ConnectionService');
// Mock typed object
const CredentialRepositoryMock = CredentialRepository_1.CredentialRepository;
const DidCommMessageRepositoryMock = DidCommMessageRepository_1.DidCommMessageRepository;
const ConnectionServiceMock = ConnectionService_1.ConnectionService;
const LegacyIndyCredentialFormatServiceMock = LegacyIndyCredentialFormatService_1.LegacyIndyCredentialFormatService;
const credentialRepository = new CredentialRepositoryMock();
const didCommMessageRepository = new DidCommMessageRepositoryMock();
const connectionService = new ConnectionServiceMock();
const indyCredentialFormatService = new LegacyIndyCredentialFormatServiceMock();
const agentConfig = (0, helpers_1.getAgentConfig)('V1CredentialProtocolProposeOfferTest');
const eventEmitter = new core_1.EventEmitter(agentConfig.agentDependencies, new rxjs_1.Subject());
const agentContext = (0, helpers_1.getAgentContext)({
    registerInstances: [
        [CredentialRepository_1.CredentialRepository, credentialRepository],
        [DidCommMessageRepository_1.DidCommMessageRepository, didCommMessageRepository],
        [ConnectionService_1.ConnectionService, connectionService],
        [core_1.EventEmitter, eventEmitter],
    ],
    agentConfig,
});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
indyCredentialFormatService.credentialRecordType = 'anoncreds';
const connectionRecord = (0, helpers_1.getMockConnection)({
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
const proposalAttachment = new core_1.Attachment({
    data: new core_1.AttachmentData({
        json: {
            cred_def_id: 'Th7MpTaRZVRYnPiabds81Y:3:CL:17:TAG',
            schema_issuer_did: 'GMm4vMw8LLrLJjp81kRRLp',
            schema_name: 'ahoy',
            schema_version: '1.0',
            schema_id: 'q7ATwTYbQDgiigVijUAej:2:test:1.0',
            issuer_did: 'GMm4vMw8LLrLJjp81kRRLp',
        },
    }),
});
describe('V1CredentialProtocolProposeOffer', () => {
    let credentialProtocol;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // mock function implementations
        (0, helpers_1.mockFunction)(connectionService.getById).mockResolvedValue(connectionRecord);
        credentialProtocol = new V1CredentialProtocol_1.V1CredentialProtocol({
            indyCredentialFormat: indyCredentialFormatService,
        });
    }));
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('createProposal', () => {
        const proposeOptions = {
            connectionRecord: connectionRecord,
            credentialFormats: {
                indy: {
                    credentialDefinitionId: 'Th7MpTaRZVRYnPiabds81Y:3:CL:17:TAG',
                    schemaIssuerDid: 'GMm4vMw8LLrLJjp81kRRLp',
                    schemaName: 'ahoy',
                    schemaVersion: '1.0',
                    schemaId: 'q7ATwTYbQDgiigVijUAej:2:test:1.0',
                    issuerDid: 'GMm4vMw8LLrLJjp81kRRLp',
                    attributes: credentialPreview.attributes,
                },
            },
            comment: 'v1 propose credential test',
        };
        test(`creates credential record in ${core_1.CredentialState.OfferSent} state with offer, thread id`, () => __awaiter(void 0, void 0, void 0, function* () {
            const repositorySaveSpy = jest.spyOn(credentialRepository, 'save');
            (0, helpers_1.mockFunction)(indyCredentialFormatService.createProposal).mockResolvedValue({
                attachment: proposalAttachment,
                format: new core_1.CredentialFormatSpec({
                    format: 'indy',
                    attachmentId: 'indy-proposal',
                }),
            });
            yield credentialProtocol.createProposal(agentContext, proposeOptions);
            // then
            expect(repositorySaveSpy).toHaveBeenNthCalledWith(1, agentContext, expect.objectContaining({
                type: core_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                connectionId: connectionRecord.id,
                state: core_1.CredentialState.ProposalSent,
            }));
        }));
        test(`emits stateChange event with a new credential in ${core_1.CredentialState.ProposalSent} state`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(core_1.CredentialEventTypes.CredentialStateChanged, eventListenerMock);
            (0, helpers_1.mockFunction)(indyCredentialFormatService.createProposal).mockResolvedValue({
                attachment: proposalAttachment,
                format: new core_1.CredentialFormatSpec({
                    format: 'indy',
                    attachmentId: 'indy-proposal',
                }),
            });
            yield credentialProtocol.createProposal(agentContext, proposeOptions);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'CredentialStateChanged',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: null,
                    credentialRecord: expect.objectContaining({
                        state: core_1.CredentialState.ProposalSent,
                    }),
                },
            });
        }));
        test('returns credential proposal message', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(indyCredentialFormatService.createProposal).mockResolvedValue({
                attachment: proposalAttachment,
                format: new core_1.CredentialFormatSpec({
                    format: 'indy',
                    attachmentId: 'indy-proposal',
                }),
                previewAttributes: credentialPreview.attributes,
            });
            const { message } = yield credentialProtocol.createProposal(agentContext, proposeOptions);
            expect(message.toJSON()).toMatchObject({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/issue-credential/1.0/propose-credential',
                comment: 'v1 propose credential test',
                cred_def_id: 'Th7MpTaRZVRYnPiabds81Y:3:CL:17:TAG',
                schema_issuer_did: 'GMm4vMw8LLrLJjp81kRRLp',
                schema_name: 'ahoy',
                schema_version: '1.0',
                schema_id: 'q7ATwTYbQDgiigVijUAej:2:test:1.0',
                issuer_did: 'GMm4vMw8LLrLJjp81kRRLp',
                credential_proposal: {
                    '@type': 'https://didcomm.org/issue-credential/1.0/credential-preview',
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
            });
        }));
    });
    describe('createOffer', () => {
        const offerOptions = {
            comment: 'some comment',
            connectionRecord,
            credentialFormats: {
                indy: {
                    attributes: credentialPreview.attributes,
                    credentialDefinitionId: 'Th7MpTaRZVRYnPiabds81Y:3:CL:17:TAG',
                },
            },
        };
        test(`creates credential record in ${core_1.CredentialState.OfferSent} state with offer, thread id`, () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(indyCredentialFormatService.createOffer).mockResolvedValue({
                attachment: offerAttachment,
                format: new core_1.CredentialFormatSpec({
                    format: 'indy',
                    attachmentId: 'indy-offer',
                }),
                previewAttributes: credentialPreview.attributes,
            });
            const repositorySaveSpy = jest.spyOn(credentialRepository, 'save');
            yield credentialProtocol.createOffer(agentContext, offerOptions);
            // then
            expect(repositorySaveSpy).toHaveBeenCalledTimes(1);
            const [[, createdCredentialRecord]] = repositorySaveSpy.mock.calls;
            expect(createdCredentialRecord).toMatchObject({
                type: core_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                threadId: createdCredentialRecord.threadId,
                connectionId: connectionRecord.id,
                state: core_1.CredentialState.OfferSent,
            });
        }));
        test(`emits stateChange event with a new credential in ${core_1.CredentialState.OfferSent} state`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(core_1.CredentialEventTypes.CredentialStateChanged, eventListenerMock);
            (0, helpers_1.mockFunction)(indyCredentialFormatService.createOffer).mockResolvedValue({
                attachment: offerAttachment,
                format: new core_1.CredentialFormatSpec({
                    format: 'indy',
                    attachmentId: 'indy-offer',
                }),
                previewAttributes: credentialPreview.attributes,
            });
            yield credentialProtocol.createOffer(agentContext, offerOptions);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'CredentialStateChanged',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: null,
                    credentialRecord: expect.objectContaining({
                        state: core_1.CredentialState.OfferSent,
                    }),
                },
            });
        }));
        test('throws error if preview is not returned from createProposal in indyCredentialFormatService', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(indyCredentialFormatService.createOffer).mockResolvedValue({
                attachment: offerAttachment,
                format: new core_1.CredentialFormatSpec({
                    format: 'indy',
                    attachmentId: 'indy-offer',
                }),
            });
            yield expect(credentialProtocol.createOffer(agentContext, offerOptions)).rejects.toThrowError('Missing required credential preview from indy format service');
        }));
        test('returns credential offer message', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(indyCredentialFormatService.createOffer).mockResolvedValue({
                attachment: offerAttachment,
                format: new core_1.CredentialFormatSpec({
                    format: 'indy',
                    attachmentId: 'indy-offer',
                }),
                previewAttributes: credentialPreview.attributes,
            });
            const { message: credentialOffer } = yield credentialProtocol.createOffer(agentContext, offerOptions);
            expect(credentialOffer.toJSON()).toMatchObject({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/issue-credential/1.0/offer-credential',
                comment: 'some comment',
                credential_preview: {
                    '@type': 'https://didcomm.org/issue-credential/1.0/credential-preview',
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
                'offers~attach': [core_1.JsonTransformer.toJSON(offerAttachment)],
            });
        }));
    });
    describe('processOffer', () => {
        const credentialOfferMessage = new messages_1.V1OfferCredentialMessage({
            comment: 'some comment',
            credentialPreview: credentialPreview,
            offerAttachments: [offerAttachment],
        });
        const messageContext = new core_1.InboundMessageContext(credentialOfferMessage, {
            agentContext,
            connection: connectionRecord,
        });
        test(`creates and return credential record in ${core_1.CredentialState.OfferReceived} state with offer, thread ID`, () => __awaiter(void 0, void 0, void 0, function* () {
            // when
            yield credentialProtocol.processOffer(messageContext);
            // then
            expect(credentialRepository.save).toHaveBeenNthCalledWith(1, agentContext, expect.objectContaining({
                type: core_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                threadId: credentialOfferMessage.id,
                connectionId: connectionRecord.id,
                state: core_1.CredentialState.OfferReceived,
                credentialAttributes: undefined,
            }));
        }));
        test(`emits stateChange event with ${core_1.CredentialState.OfferReceived}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(core_1.CredentialEventTypes.CredentialStateChanged, eventListenerMock);
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
                        state: core_1.CredentialState.OfferReceived,
                    }),
                },
            });
        }));
    });
});
