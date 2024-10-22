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
const SubjectInboundTransport_1 = require("../../../../../../../tests/transport/SubjectInboundTransport");
const SubjectOutboundTransport_1 = require("../../../../../../../tests/transport/SubjectOutboundTransport");
const src_1 = require("../../../../../../core/src");
const uuid_1 = require("../../../../../../core/src/utils/uuid");
const tests_1 = require("../../../../../../core/tests");
const setupIndySdkModule_1 = require("../../../../../../indy-sdk/tests/setupIndySdkModule");
const legacyAnonCredsSetup_1 = require("../../../../../tests/legacyAnonCredsSetup");
const v1_1 = require("../../../credentials/v1");
describe('V1 Proofs - Connectionless - Indy', () => {
    let agents;
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        for (const agent of agents) {
            yield agent.shutdown();
            yield agent.wallet.delete();
        }
    }));
    // new method to test the return route and mediator together
    const connectionlessTest = (returnRoute) => __awaiter(void 0, void 0, void 0, function* () {
        const { holderAgent: aliceAgent, issuerAgent: faberAgent, holderReplay: aliceReplay, credentialDefinitionId, issuerReplay: faberReplay, issuerHolderConnectionId: faberConnectionId, } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber v1 connection-less Proofs - Never',
            holderName: 'Alice v1 connection-less Proofs - Never',
            autoAcceptProofs: src_1.AutoAcceptProof.Never,
            attributeNames: ['name', 'age'],
        });
        yield (0, legacyAnonCredsSetup_1.issueLegacyAnonCredsCredential)({
            issuerAgent: faberAgent,
            holderAgent: aliceAgent,
            issuerReplay: faberReplay,
            holderReplay: aliceReplay,
            issuerHolderConnectionId: faberConnectionId,
            offer: {
                credentialDefinitionId,
                attributes: [
                    {
                        name: 'name',
                        value: 'John',
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
            protocolVersion: 'v1',
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
        const outOfBandRecord = yield faberAgent.oob.createInvitation({
            messages: [message],
            handshake: false,
        });
        yield aliceAgent.oob.receiveInvitation(outOfBandRecord.outOfBandInvitation);
        tests_1.testLogger.test('Alice waits for presentation request from Faber');
        let aliceProofExchangeRecord = yield (0, tests_1.waitForProofExchangeRecordSubject)(aliceReplay, {
            state: src_1.ProofState.RequestReceived,
        });
        tests_1.testLogger.test('Alice accepts presentation request from Faber');
        const requestedCredentials = yield aliceAgent.proofs.selectCredentialsForRequest({
            proofRecordId: aliceProofExchangeRecord.id,
        });
        yield aliceAgent.proofs.acceptRequest({
            proofRecordId: aliceProofExchangeRecord.id,
            useReturnRoute: returnRoute,
            proofFormats: { indy: requestedCredentials.proofFormats.indy },
        });
        tests_1.testLogger.test('Faber waits for presentation from Alice');
        faberProofExchangeRecord = yield (0, tests_1.waitForProofExchangeRecordSubject)(faberReplay, {
            threadId: aliceProofExchangeRecord.threadId,
            state: src_1.ProofState.PresentationReceived,
        });
        const sentPresentationMessage = aliceAgent.proofs.findPresentationMessage(aliceProofExchangeRecord.id);
        // assert presentation is valid
        expect(faberProofExchangeRecord.isVerified).toBe(true);
        // Faber accepts presentation
        yield faberAgent.proofs.acceptPresentation({ proofRecordId: faberProofExchangeRecord.id });
        // Alice waits till it receives presentation ack
        aliceProofExchangeRecord = yield (0, tests_1.waitForProofExchangeRecordSubject)(aliceReplay, {
            threadId: aliceProofExchangeRecord.threadId,
            state: src_1.ProofState.Done,
        });
        return sentPresentationMessage;
    });
    test('Faber starts with connection-less proof requests to Alice', () => __awaiter(void 0, void 0, void 0, function* () {
        yield connectionlessTest();
    }));
    test('Faber starts with connection-less proof requests to Alice with auto-accept enabled', () => __awaiter(void 0, void 0, void 0, function* () {
        const { holderAgent: aliceAgent, issuerAgent: faberAgent, holderReplay: aliceReplay, credentialDefinitionId, issuerReplay: faberReplay, issuerHolderConnectionId: faberConnectionId, } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber v1 connection-less Proofs - Always',
            holderName: 'Alice v1 connection-less Proofs - Always',
            autoAcceptProofs: src_1.AutoAcceptProof.Always,
            attributeNames: ['name', 'age'],
        });
        yield (0, legacyAnonCredsSetup_1.issueLegacyAnonCredsCredential)({
            issuerAgent: faberAgent,
            holderAgent: aliceAgent,
            issuerReplay: faberReplay,
            holderReplay: aliceReplay,
            issuerHolderConnectionId: faberConnectionId,
            offer: {
                credentialDefinitionId,
                attributes: [
                    {
                        name: 'name',
                        value: 'John',
                    },
                    {
                        name: 'age',
                        value: '99',
                    },
                ],
            },
        });
        agents = [aliceAgent, faberAgent];
        const { message, proofRecord: faberProofExchangeRecord } = yield faberAgent.proofs.createRequest({
            protocolVersion: 'v1',
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
            autoAcceptProof: src_1.AutoAcceptProof.ContentApproved,
        });
        const { message: requestMessage } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
            recordId: faberProofExchangeRecord.id,
            message,
            domain: 'https://a-domain.com',
        });
        yield aliceAgent.receiveMessage(requestMessage.toJSON());
        yield (0, tests_1.waitForProofExchangeRecordSubject)(aliceReplay, {
            state: src_1.ProofState.Done,
            threadId: message.threadId,
        });
        yield (0, tests_1.waitForProofExchangeRecordSubject)(faberReplay, {
            state: src_1.ProofState.Done,
            threadId: message.threadId,
        });
    }));
    test('Faber starts with connection-less proof requests to Alice with auto-accept enabled and without an outbound transport', () => __awaiter(void 0, void 0, void 0, function* () {
        const { holderAgent: aliceAgent, issuerAgent: faberAgent, holderReplay: aliceReplay, credentialDefinitionId, issuerReplay: faberReplay, issuerHolderConnectionId: faberConnectionId, } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber v1 connection-less Proofs - Always',
            holderName: 'Alice v1 connection-less Proofs - Always',
            autoAcceptProofs: src_1.AutoAcceptProof.Always,
            attributeNames: ['name', 'age'],
        });
        yield (0, legacyAnonCredsSetup_1.issueLegacyAnonCredsCredential)({
            issuerAgent: faberAgent,
            holderAgent: aliceAgent,
            issuerReplay: faberReplay,
            holderReplay: aliceReplay,
            issuerHolderConnectionId: faberConnectionId,
            offer: {
                credentialDefinitionId,
                attributes: [
                    {
                        name: 'name',
                        value: 'John',
                    },
                    {
                        name: 'age',
                        value: '99',
                    },
                ],
            },
        });
        agents = [aliceAgent, faberAgent];
        const { message } = yield faberAgent.proofs.createRequest({
            protocolVersion: 'v1',
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
            autoAcceptProof: src_1.AutoAcceptProof.ContentApproved,
        });
        const { invitationUrl, message: requestMessage } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
            message,
            domain: 'https://a-domain.com',
        });
        for (const transport of faberAgent.outboundTransports) {
            yield faberAgent.unregisterOutboundTransport(transport);
        }
        yield aliceAgent.oob.receiveInvitationFromUrl(invitationUrl);
        yield (0, tests_1.waitForProofExchangeRecordSubject)(aliceReplay, {
            state: src_1.ProofState.Done,
            threadId: requestMessage.threadId,
        });
        yield (0, tests_1.waitForProofExchangeRecordSubject)(faberReplay, {
            state: src_1.ProofState.Done,
            threadId: requestMessage.threadId,
        });
    }));
    test('Faber starts with connection-less proof requests to Alice with auto-accept enabled and both agents having a mediator', () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Faber sends presentation request to Alice');
        const credentialPreview = v1_1.V1CredentialPreview.fromRecord({
            name: 'John',
            age: '99',
        });
        const unique = (0, uuid_1.uuid)().substring(0, 4);
        const mediatorAgentOptions = (0, tests_1.getAgentOptions)(`Connectionless proofs with mediator Mediator-${unique}`, {
            endpoints: ['rxjs:mediator'],
        }, Object.assign(Object.assign({}, (0, setupIndySdkModule_1.getIndySdkModules)()), { mediator: new src_1.MediatorModule({
                autoAcceptMediationRequests: true,
            }) }));
        const mediatorMessages = new rxjs_1.Subject();
        const subjectMap = { 'rxjs:mediator': mediatorMessages };
        // Initialize mediator
        const mediatorAgent = new src_1.Agent(mediatorAgentOptions);
        mediatorAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        mediatorAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(mediatorMessages));
        yield mediatorAgent.initialize();
        const faberMediationOutOfBandRecord = yield mediatorAgent.oob.createInvitation({
            label: 'faber invitation',
            handshakeProtocols: [src_1.HandshakeProtocol.Connections],
        });
        const aliceMediationOutOfBandRecord = yield mediatorAgent.oob.createInvitation({
            label: 'alice invitation',
            handshakeProtocols: [src_1.HandshakeProtocol.Connections],
        });
        const faberAgentOptions = (0, tests_1.getAgentOptions)(`Connectionless proofs with mediator Faber-${unique}`, {}, Object.assign(Object.assign({}, (0, legacyAnonCredsSetup_1.getLegacyAnonCredsModules)({
            autoAcceptProofs: src_1.AutoAcceptProof.Always,
        })), { mediationRecipient: new src_1.MediationRecipientModule({
                mediatorInvitationUrl: faberMediationOutOfBandRecord.outOfBandInvitation.toUrl({
                    domain: 'https://example.com',
                }),
                mediatorPickupStrategy: src_1.MediatorPickupStrategy.PickUpV1,
            }) }));
        const aliceAgentOptions = (0, tests_1.getAgentOptions)(`Connectionless proofs with mediator Alice-${unique}`, {}, Object.assign(Object.assign({}, (0, legacyAnonCredsSetup_1.getLegacyAnonCredsModules)({
            autoAcceptProofs: src_1.AutoAcceptProof.Always,
        })), { mediationRecipient: new src_1.MediationRecipientModule({
                mediatorInvitationUrl: aliceMediationOutOfBandRecord.outOfBandInvitation.toUrl({
                    domain: 'https://example.com',
                }),
                mediatorPickupStrategy: src_1.MediatorPickupStrategy.PickUpV1,
            }) }));
        const faberAgent = new src_1.Agent(faberAgentOptions);
        faberAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield faberAgent.initialize();
        const aliceAgent = new src_1.Agent(aliceAgentOptions);
        aliceAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield aliceAgent.initialize();
        const [faberReplay, aliceReplay] = (0, tests_1.setupEventReplaySubjects)([faberAgent, aliceAgent], [src_1.CredentialEventTypes.CredentialStateChanged, src_1.ProofEventTypes.ProofStateChanged]);
        agents = [aliceAgent, faberAgent, mediatorAgent];
        const { credentialDefinition } = yield (0, legacyAnonCredsSetup_1.prepareForAnonCredsIssuance)(faberAgent, {
            attributeNames: ['name', 'age', 'image_0', 'image_1'],
        });
        const [faberConnection, aliceConnection] = yield (0, tests_1.makeConnection)(faberAgent, aliceAgent);
        expect(faberConnection.isReady).toBe(true);
        expect(aliceConnection.isReady).toBe(true);
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
                    new src_1.LinkedAttachment({
                        name: 'image_0',
                        attachment: new src_1.Attachment({
                            filename: 'picture-of-a-cat.png',
                            data: new src_1.AttachmentData({ base64: 'cGljdHVyZSBvZiBhIGNhdA==' }),
                        }),
                    }),
                    new src_1.LinkedAttachment({
                        name: 'image_1',
                        attachment: new src_1.Attachment({
                            filename: 'picture-of-a-dog.png',
                            data: new src_1.AttachmentData({ base64: 'UGljdHVyZSBvZiBhIGRvZw==' }),
                        }),
                    }),
                ],
            },
        });
        // eslint-disable-next-line prefer-const
        let { message, proofRecord: faberProofExchangeRecord } = yield faberAgent.proofs.createRequest({
            protocolVersion: 'v1',
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
            autoAcceptProof: src_1.AutoAcceptProof.ContentApproved,
        });
        const { message: requestMessage } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
            recordId: faberProofExchangeRecord.id,
            message,
            domain: 'https://a-domain.com',
        });
        const mediationRecord = yield faberAgent.mediationRecipient.findDefaultMediator();
        if (!mediationRecord) {
            throw new Error('Faber agent has no default mediator');
        }
        expect(requestMessage).toMatchObject({
            service: {
                recipientKeys: [expect.any(String)],
                routingKeys: mediationRecord.routingKeys,
                serviceEndpoint: mediationRecord.endpoint,
            },
        });
        yield aliceAgent.receiveMessage(requestMessage.toJSON());
        yield (0, tests_1.waitForProofExchangeRecordSubject)(aliceReplay, {
            state: src_1.ProofState.Done,
            threadId: requestMessage.threadId,
        });
        yield (0, tests_1.waitForProofExchangeRecordSubject)(faberReplay, {
            state: src_1.ProofState.Done,
            threadId: requestMessage.threadId,
        });
        yield aliceAgent.mediationRecipient.stopMessagePickup();
        yield faberAgent.mediationRecipient.stopMessagePickup();
    }));
});
