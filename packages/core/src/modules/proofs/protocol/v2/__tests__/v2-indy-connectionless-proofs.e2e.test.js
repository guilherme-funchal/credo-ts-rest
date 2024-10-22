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
const SubjectInboundTransport_1 = require("../../../../../../../../tests/transport/SubjectInboundTransport");
const SubjectOutboundTransport_1 = require("../../../../../../../../tests/transport/SubjectOutboundTransport");
const src_1 = require("../../../../../../../anoncreds/src");
const legacyAnonCredsSetup_1 = require("../../../../../../../anoncreds/tests/legacyAnonCredsSetup");
const tests_1 = require("../../../../../../tests");
const Agent_1 = require("../../../../../agent/Agent");
const Attachment_1 = require("../../../../../decorators/attachment/Attachment");
const LinkedAttachment_1 = require("../../../../../utils/LinkedAttachment");
const uuid_1 = require("../../../../../utils/uuid");
const connections_1 = require("../../../../connections");
const credentials_1 = require("../../../../credentials");
const routing_1 = require("../../../../routing");
const ProofEvents_1 = require("../../../ProofEvents");
const models_1 = require("../../../models");
describe('V2 Connectionless Proofs - Indy', () => {
    let agents;
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        for (const agent of agents) {
            yield agent.shutdown();
            yield agent.wallet.delete();
        }
    }));
    const connectionlessTest = (returnRoute) => __awaiter(void 0, void 0, void 0, function* () {
        const { issuerAgent: faberAgent, issuerReplay: faberReplay, holderAgent: aliceAgent, holderReplay: aliceReplay, credentialDefinitionId, issuerHolderConnectionId: faberConnectionId, } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber connection-less Proofs v2',
            holderName: 'Alice connection-less Proofs v2',
            autoAcceptProofs: models_1.AutoAcceptProof.Never,
            attributeNames: ['name', 'age'],
        });
        yield (0, legacyAnonCredsSetup_1.issueLegacyAnonCredsCredential)({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            issuerHolderConnectionId: faberConnectionId,
            offer: {
                credentialDefinitionId,
                attributes: [
                    {
                        name: 'name',
                        value: 'Alice',
                    },
                    {
                        name: 'age',
                        value: '99',
                    },
                ],
            },
        });
        agents = [aliceAgent, faberAgent];
        tests_1.testLogger.test('Faber sends presentation request to Alice');
        // eslint-disable-next-line prefer-const
        let { proofRecord: faberProofExchangeRecord, message } = yield faberAgent.proofs.createRequest({
            protocolVersion: 'v2',
            proofFormats: {
                indy: {
                    name: 'test-proof-request',
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
        const { message: requestMessage } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
            recordId: faberProofExchangeRecord.id,
            message,
            domain: 'https://a-domain.com',
        });
        yield aliceAgent.receiveMessage(requestMessage.toJSON());
        tests_1.testLogger.test('Alice waits for presentation request from Faber');
        let aliceProofExchangeRecord = yield (0, tests_1.waitForProofExchangeRecordSubject)(aliceReplay, {
            state: models_1.ProofState.RequestReceived,
        });
        tests_1.testLogger.test('Alice accepts presentation request from Faber');
        const requestedCredentials = yield aliceAgent.proofs.selectCredentialsForRequest({
            proofRecordId: aliceProofExchangeRecord.id,
        });
        aliceProofExchangeRecord = yield aliceAgent.proofs.acceptRequest({
            proofRecordId: aliceProofExchangeRecord.id,
            useReturnRoute: returnRoute,
            proofFormats: { indy: requestedCredentials.proofFormats.indy },
        });
        tests_1.testLogger.test('Faber waits for presentation from Alice');
        faberProofExchangeRecord = yield (0, tests_1.waitForProofExchangeRecordSubject)(faberReplay, {
            threadId: aliceProofExchangeRecord.threadId,
            state: models_1.ProofState.PresentationReceived,
        });
        const sentPresentationMessage = aliceAgent.proofs.findPresentationMessage(aliceProofExchangeRecord.id);
        // assert presentation is valid
        expect(faberProofExchangeRecord.isVerified).toBe(true);
        // Faber accepts presentation
        yield faberAgent.proofs.acceptPresentation({ proofRecordId: faberProofExchangeRecord.id });
        // Alice waits until it receives presentation ack
        aliceProofExchangeRecord = yield (0, tests_1.waitForProofExchangeRecordSubject)(aliceReplay, {
            threadId: aliceProofExchangeRecord.threadId,
            state: models_1.ProofState.Done,
        });
        return sentPresentationMessage;
    });
    test('Faber starts with connection-less proof requests to Alice', () => __awaiter(void 0, void 0, void 0, function* () {
        yield connectionlessTest();
    }));
    test('Faber starts with connection-less proof requests to Alice with auto-accept enabled', () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Faber sends presentation request to Alice');
        const { issuerAgent: faberAgent, issuerReplay: faberReplay, holderAgent: aliceAgent, holderReplay: aliceReplay, credentialDefinitionId, issuerHolderConnectionId: faberConnectionId, } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber connection-less Proofs v2 - Auto Accept',
            holderName: 'Alice connection-less Proofs v2 - Auto Accept',
            autoAcceptProofs: models_1.AutoAcceptProof.Always,
            attributeNames: ['name', 'age'],
        });
        yield (0, legacyAnonCredsSetup_1.issueLegacyAnonCredsCredential)({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            issuerHolderConnectionId: faberConnectionId,
            offer: {
                credentialDefinitionId,
                attributes: [
                    {
                        name: 'name',
                        value: 'Alice',
                    },
                    {
                        name: 'age',
                        value: '99',
                    },
                ],
            },
        });
        agents = [aliceAgent, faberAgent];
        // eslint-disable-next-line prefer-const
        let { message, proofRecord: faberProofExchangeRecord } = yield faberAgent.proofs.createRequest({
            protocolVersion: 'v2',
            proofFormats: {
                indy: {
                    name: 'test-proof-request',
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
            autoAcceptProof: models_1.AutoAcceptProof.ContentApproved,
        });
        const { message: requestMessage } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
            recordId: faberProofExchangeRecord.id,
            message,
            domain: 'https://a-domain.com',
        });
        yield aliceAgent.receiveMessage(requestMessage.toJSON());
        yield (0, tests_1.waitForProofExchangeRecordSubject)(aliceReplay, {
            state: models_1.ProofState.Done,
            threadId: requestMessage.threadId,
        });
        yield (0, tests_1.waitForProofExchangeRecordSubject)(faberReplay, {
            state: models_1.ProofState.Done,
            threadId: requestMessage.threadId,
        });
    }));
    test('Faber starts with connection-less proof requests to Alice with auto-accept enabled and both agents having a mediator', () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Faber sends presentation request to Alice');
        const credentialPreview = src_1.V1CredentialPreview.fromRecord({
            name: 'John',
            age: '99',
        });
        const unique = (0, uuid_1.uuid)().substring(0, 4);
        const mediatorOptions = (0, tests_1.getAgentOptions)(`Connectionless proofs with mediator Mediator-${unique}`, {
            endpoints: ['rxjs:mediator'],
        }, Object.assign(Object.assign({}, (0, legacyAnonCredsSetup_1.getLegacyAnonCredsModules)({
            autoAcceptProofs: models_1.AutoAcceptProof.Always,
        })), { mediator: new routing_1.MediatorModule({
                autoAcceptMediationRequests: true,
            }) }));
        const mediatorMessages = new rxjs_1.Subject();
        const subjectMap = { 'rxjs:mediator': mediatorMessages };
        // Initialize mediator
        const mediatorAgent = new Agent_1.Agent(mediatorOptions);
        mediatorAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        mediatorAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(mediatorMessages));
        yield mediatorAgent.initialize();
        const faberMediationOutOfBandRecord = yield mediatorAgent.oob.createInvitation({
            label: 'faber invitation',
            handshakeProtocols: [connections_1.HandshakeProtocol.Connections],
        });
        const aliceMediationOutOfBandRecord = yield mediatorAgent.oob.createInvitation({
            label: 'alice invitation',
            handshakeProtocols: [connections_1.HandshakeProtocol.Connections],
        });
        const faberOptions = (0, tests_1.getAgentOptions)(`Connectionless proofs with mediator Faber-${unique}`, {}, Object.assign(Object.assign({}, (0, legacyAnonCredsSetup_1.getLegacyAnonCredsModules)({
            autoAcceptProofs: models_1.AutoAcceptProof.Always,
        })), { mediationRecipient: new routing_1.MediationRecipientModule({
                mediatorInvitationUrl: faberMediationOutOfBandRecord.outOfBandInvitation.toUrl({
                    domain: 'https://example.com',
                }),
                mediatorPickupStrategy: routing_1.MediatorPickupStrategy.PickUpV1,
            }) }));
        const aliceOptions = (0, tests_1.getAgentOptions)(`Connectionless proofs with mediator Alice-${unique}`, {}, Object.assign(Object.assign({}, (0, legacyAnonCredsSetup_1.getLegacyAnonCredsModules)({
            autoAcceptProofs: models_1.AutoAcceptProof.Always,
        })), { mediationRecipient: new routing_1.MediationRecipientModule({
                mediatorInvitationUrl: aliceMediationOutOfBandRecord.outOfBandInvitation.toUrl({
                    domain: 'https://example.com',
                }),
                mediatorPickupStrategy: routing_1.MediatorPickupStrategy.PickUpV1,
            }) }));
        const faberAgent = new Agent_1.Agent(faberOptions);
        faberAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield faberAgent.initialize();
        const aliceAgent = new Agent_1.Agent(aliceOptions);
        aliceAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield aliceAgent.initialize();
        const [faberReplay, aliceReplay] = (0, tests_1.setupEventReplaySubjects)([faberAgent, aliceAgent], [credentials_1.CredentialEventTypes.CredentialStateChanged, ProofEvents_1.ProofEventTypes.ProofStateChanged]);
        agents = [aliceAgent, faberAgent, mediatorAgent];
        const { credentialDefinition } = yield (0, legacyAnonCredsSetup_1.prepareForAnonCredsIssuance)(faberAgent, {
            attributeNames: ['name', 'age', 'image_0', 'image_1'],
        });
        const [faberConnection] = yield (0, tests_1.makeConnection)(faberAgent, aliceAgent);
        // issue credential with two linked attachments
        yield (0, legacyAnonCredsSetup_1.issueLegacyAnonCredsCredential)({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            issuerHolderConnectionId: faberConnection.id,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            offer: {
                credentialDefinitionId: credentialDefinition.credentialDefinitionId,
                attributes: credentialPreview.attributes,
                linkedAttachments: [
                    new LinkedAttachment_1.LinkedAttachment({
                        name: 'image_0',
                        attachment: new Attachment_1.Attachment({
                            filename: 'picture-of-a-cat.png',
                            data: new Attachment_1.AttachmentData({ base64: 'cGljdHVyZSBvZiBhIGNhdA==' }),
                        }),
                    }),
                    new LinkedAttachment_1.LinkedAttachment({
                        name: 'image_1',
                        attachment: new Attachment_1.Attachment({
                            filename: 'picture-of-a-dog.png',
                            data: new Attachment_1.AttachmentData({ base64: 'UGljdHVyZSBvZiBhIGRvZw==' }),
                        }),
                    }),
                ],
            },
        });
        // eslint-disable-next-line prefer-const
        let { message, proofRecord: faberProofExchangeRecord } = yield faberAgent.proofs.createRequest({
            protocolVersion: 'v2',
            proofFormats: {
                indy: {
                    name: 'test-proof-request',
                    version: '1.0',
                    requested_attributes: {
                        name: {
                            name: 'name',
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinition.credentialDefinitionId,
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
                                    cred_def_id: credentialDefinition.credentialDefinitionId,
                                },
                            ],
                        },
                    },
                },
            },
            autoAcceptProof: models_1.AutoAcceptProof.ContentApproved,
        });
        const { message: requestMessage } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
            recordId: faberProofExchangeRecord.id,
            message,
            domain: 'https://a-domain.com',
        });
        const mediationRecord = yield faberAgent.mediationRecipient.findDefaultMediator();
        if (!mediationRecord)
            throw new Error('Faber agent has no default mediator');
        expect(requestMessage).toMatchObject({
            service: {
                recipientKeys: [expect.any(String)],
                routingKeys: mediationRecord.routingKeys,
                serviceEndpoint: mediationRecord.endpoint,
            },
        });
        yield aliceAgent.receiveMessage(requestMessage.toJSON());
        yield (0, tests_1.waitForProofExchangeRecordSubject)(aliceReplay, {
            state: models_1.ProofState.Done,
            threadId: requestMessage.threadId,
        });
        yield (0, tests_1.waitForProofExchangeRecordSubject)(faberReplay, {
            state: models_1.ProofState.Done,
            threadId: requestMessage.threadId,
        });
    }));
    test('Faber starts with connection-less proof requests to Alice with auto-accept enabled and without an outbound transport', () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Faber sends presentation request to Alice');
        const { issuerAgent: faberAgent, issuerReplay: faberReplay, holderAgent: aliceAgent, holderReplay: aliceReplay, credentialDefinitionId, issuerHolderConnectionId: faberConnectionId, } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber connection-less Proofs v2 - Auto Accept',
            holderName: 'Alice connection-less Proofs v2 - Auto Accept',
            autoAcceptProofs: models_1.AutoAcceptProof.Always,
            attributeNames: ['name', 'age'],
        });
        yield (0, legacyAnonCredsSetup_1.issueLegacyAnonCredsCredential)({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            issuerHolderConnectionId: faberConnectionId,
            offer: {
                credentialDefinitionId,
                attributes: [
                    {
                        name: 'name',
                        value: 'Alice',
                    },
                    {
                        name: 'age',
                        value: '99',
                    },
                ],
            },
        });
        agents = [aliceAgent, faberAgent];
        // eslint-disable-next-line prefer-const
        let { message, proofRecord: faberProofExchangeRecord } = yield faberAgent.proofs.createRequest({
            protocolVersion: 'v2',
            proofFormats: {
                indy: {
                    name: 'test-proof-request',
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
            autoAcceptProof: models_1.AutoAcceptProof.ContentApproved,
        });
        const { message: requestMessage } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
            recordId: faberProofExchangeRecord.id,
            message,
            domain: 'rxjs:faber',
        });
        for (const transport of faberAgent.outboundTransports) {
            yield faberAgent.unregisterOutboundTransport(transport);
        }
        yield aliceAgent.receiveMessage(requestMessage.toJSON());
        yield (0, tests_1.waitForProofExchangeRecordSubject)(aliceReplay, {
            state: models_1.ProofState.Done,
            threadId: requestMessage.threadId,
        });
        yield (0, tests_1.waitForProofExchangeRecordSubject)(faberReplay, {
            state: models_1.ProofState.Done,
            threadId: requestMessage.threadId,
        });
    }));
    test('Faber starts with connection-less proof requests to Alice but gets Problem Reported', () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Faber sends presentation request to Alice');
        const { issuerAgent: faberAgent, issuerReplay: faberReplay, holderAgent: aliceAgent, holderReplay: aliceReplay, credentialDefinitionId, issuerHolderConnectionId: faberConnectionId, } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber connection-less Proofs v2 - Reject Request',
            holderName: 'Alice connection-less Proofs v2 - Reject Request',
            autoAcceptProofs: models_1.AutoAcceptProof.Never,
            attributeNames: ['name', 'age'],
        });
        yield (0, legacyAnonCredsSetup_1.issueLegacyAnonCredsCredential)({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            issuerHolderConnectionId: faberConnectionId,
            offer: {
                credentialDefinitionId,
                attributes: [
                    {
                        name: 'name',
                        value: 'Alice',
                    },
                    {
                        name: 'age',
                        value: '99',
                    },
                ],
            },
        });
        agents = [aliceAgent, faberAgent];
        // eslint-disable-next-line prefer-const
        // eslint-disable-next-line prefer-const
        let { message, proofRecord: faberProofExchangeRecord } = yield faberAgent.proofs.createRequest({
            protocolVersion: 'v2',
            proofFormats: {
                indy: {
                    name: 'test-proof-request',
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
                    requested_predicates: {},
                },
            },
            autoAcceptProof: models_1.AutoAcceptProof.ContentApproved,
        });
        const { message: requestMessage } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
            recordId: faberProofExchangeRecord.id,
            message,
            domain: 'rxjs:faber',
        });
        for (const transport of faberAgent.outboundTransports) {
            yield faberAgent.unregisterOutboundTransport(transport);
        }
        const aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
            state: models_1.ProofState.RequestReceived,
        });
        yield aliceAgent.receiveMessage(requestMessage.toJSON());
        const aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
        yield aliceAgent.proofs.declineRequest({ proofRecordId: aliceProofExchangeRecord.id, sendProblemReport: true });
        yield (0, tests_1.waitForProofExchangeRecordSubject)(aliceReplay, {
            state: models_1.ProofState.Declined,
            threadId: requestMessage.threadId,
        });
        yield (0, tests_1.waitForProofExchangeRecordSubject)(faberReplay, {
            state: models_1.ProofState.Abandoned,
            threadId: requestMessage.threadId,
        });
    }));
});
