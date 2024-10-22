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
const SubjectInboundTransport_1 = require("../../../tests/transport/SubjectInboundTransport");
const SubjectOutboundTransport_1 = require("../../../tests/transport/SubjectOutboundTransport");
const legacyAnonCredsSetup_1 = require("../../anoncreds/tests/legacyAnonCredsSetup");
const Agent_1 = require("../src/agent/Agent");
const crypto_1 = require("../src/crypto");
const connections_1 = require("../src/modules/connections");
const OutOfBandDidCommService_1 = require("../src/modules/oob/domain/OutOfBandDidCommService");
const OutOfBandEvents_1 = require("../src/modules/oob/domain/OutOfBandEvents");
const OutOfBandRole_1 = require("../src/modules/oob/domain/OutOfBandRole");
const OutOfBandState_1 = require("../src/modules/oob/domain/OutOfBandState");
const messages_1 = require("../src/modules/oob/messages");
const utils_1 = require("../src/utils");
const TestMessage_1 = require("./TestMessage");
const helpers_1 = require("./helpers");
const core_1 = require("@aries-framework/core");
const faberAgentOptions = (0, helpers_1.getAgentOptions)('Faber Agent OOB', {
    endpoints: ['rxjs:faber'],
}, (0, legacyAnonCredsSetup_1.getLegacyAnonCredsModules)({
    autoAcceptCredentials: core_1.AutoAcceptCredential.ContentApproved,
}));
const aliceAgentOptions = (0, helpers_1.getAgentOptions)('Alice Agent OOB', {
    endpoints: ['rxjs:alice'],
}, (0, legacyAnonCredsSetup_1.getLegacyAnonCredsModules)({
    autoAcceptCredentials: core_1.AutoAcceptCredential.ContentApproved,
}));
describe('out of band', () => {
    const makeConnectionConfig = {
        goal: 'To make a connection',
        goalCode: 'p2p-messaging',
        label: 'Faber College',
        alias: `Faber's connection with Alice`,
        imageUrl: 'http://faber.image.url',
    };
    const issueCredentialConfig = {
        goal: 'To issue a credential',
        goalCode: 'issue-vc',
        label: 'Faber College',
        handshake: false,
    };
    const receiveInvitationConfig = {
        autoAcceptConnection: false,
    };
    let faberAgent;
    let aliceAgent;
    let credentialTemplate;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const faberMessages = new rxjs_1.Subject();
        const aliceMessages = new rxjs_1.Subject();
        const subjectMap = {
            'rxjs:faber': faberMessages,
            'rxjs:alice': aliceMessages,
        };
        faberAgent = new Agent_1.Agent(faberAgentOptions);
        faberAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(faberMessages));
        faberAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield faberAgent.initialize();
        aliceAgent = new Agent_1.Agent(aliceAgentOptions);
        aliceAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(aliceMessages));
        aliceAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield aliceAgent.initialize();
        yield aliceAgent.modules.anoncreds.createLinkSecret();
        const { credentialDefinition } = yield (0, legacyAnonCredsSetup_1.prepareForAnonCredsIssuance)(faberAgent, {
            attributeNames: ['name', 'age', 'profile_picture', 'x-ray'],
        });
        credentialTemplate = {
            protocolVersion: 'v1',
            credentialFormats: {
                indy: {
                    attributes: [
                        {
                            name: 'name',
                            value: 'name',
                        },
                        {
                            name: 'age',
                            value: 'age',
                        },
                        {
                            name: 'profile_picture',
                            value: 'profile_picture',
                        },
                        {
                            name: 'x-ray',
                            value: 'x-ray',
                        },
                    ],
                    credentialDefinitionId: credentialDefinition.credentialDefinitionId,
                },
            },
            autoAcceptCredential: core_1.AutoAcceptCredential.Never,
        };
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const credentials = yield aliceAgent.credentials.getAll();
        for (const credential of credentials) {
            yield aliceAgent.credentials.deleteById(credential.id);
        }
        const connections = yield faberAgent.connections.getAll();
        for (const connection of connections) {
            yield faberAgent.connections.deleteById(connection.id);
        }
        jest.resetAllMocks();
    }));
    describe('createInvitation', () => {
        test('throw error when there is no handshake or message', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(faberAgent.oob.createInvitation({ label: 'test-connection', handshake: false })).rejects.toEqual(new core_1.AriesFrameworkError('One or both of handshake_protocols and requests~attach MUST be included in the message.'));
        }));
        test('throw error when multiUseInvitation is true and messages are provided', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(faberAgent.oob.createInvitation({
                label: 'test-connection',
                messages: [{}],
                multiUseInvitation: true,
            })).rejects.toEqual(new core_1.AriesFrameworkError("Attribute 'multiUseInvitation' can not be 'true' when 'messages' is defined."));
        }));
        test('handles empty messages array as no messages being passed', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(faberAgent.oob.createInvitation({
                messages: [],
                handshake: false,
            })).rejects.toEqual(new core_1.AriesFrameworkError('One or both of handshake_protocols and requests~attach MUST be included in the message.'));
        }));
        test('create OOB record', () => __awaiter(void 0, void 0, void 0, function* () {
            const outOfBandRecord = yield faberAgent.oob.createInvitation(makeConnectionConfig);
            // expect contains services
            expect(outOfBandRecord.autoAcceptConnection).toBe(true);
            expect(outOfBandRecord.role).toBe(OutOfBandRole_1.OutOfBandRole.Sender);
            expect(outOfBandRecord.state).toBe(OutOfBandState_1.OutOfBandState.AwaitResponse);
            expect(outOfBandRecord.alias).toBe(makeConnectionConfig.alias);
            expect(outOfBandRecord.reusable).toBe(false);
            expect(outOfBandRecord.outOfBandInvitation.goal).toBe(makeConnectionConfig.goal);
            expect(outOfBandRecord.outOfBandInvitation.goalCode).toBe(makeConnectionConfig.goalCode);
            expect(outOfBandRecord.outOfBandInvitation.label).toBe(makeConnectionConfig.label);
            expect(outOfBandRecord.outOfBandInvitation.imageUrl).toBe(makeConnectionConfig.imageUrl);
        }));
        test('create OOB message only with handshake', () => __awaiter(void 0, void 0, void 0, function* () {
            const { outOfBandInvitation } = yield faberAgent.oob.createInvitation(makeConnectionConfig);
            // expect supported handshake protocols
            expect(outOfBandInvitation.handshakeProtocols).toContain(connections_1.HandshakeProtocol.DidExchange);
            expect(outOfBandInvitation.getRequests()).toBeUndefined();
            // expect contains services
            const [service] = outOfBandInvitation.getInlineServices();
            expect(service).toMatchObject(new OutOfBandDidCommService_1.OutOfBandDidCommService({
                id: expect.any(String),
                serviceEndpoint: 'rxjs:faber',
                recipientKeys: [expect.stringContaining('did:key:')],
                routingKeys: [],
            }));
        }));
        test('create OOB message only with requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message } = yield faberAgent.credentials.createOffer(credentialTemplate);
            const { outOfBandInvitation } = yield faberAgent.oob.createInvitation({
                label: 'test-connection',
                handshake: false,
                messages: [message],
            });
            // expect supported handshake protocols
            expect(outOfBandInvitation.handshakeProtocols).toBeUndefined();
            expect(outOfBandInvitation.getRequests()).toHaveLength(1);
            // expect contains services
            const [service] = outOfBandInvitation.getServices();
            expect(service).toMatchObject(new OutOfBandDidCommService_1.OutOfBandDidCommService({
                id: expect.any(String),
                serviceEndpoint: 'rxjs:faber',
                recipientKeys: [expect.stringContaining('did:key:')],
                routingKeys: [],
            }));
        }));
        test('create OOB message with both handshake and requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message } = yield faberAgent.credentials.createOffer(credentialTemplate);
            const { outOfBandInvitation } = yield faberAgent.oob.createInvitation({
                label: 'test-connection',
                handshakeProtocols: [connections_1.HandshakeProtocol.Connections],
                messages: [message],
            });
            // expect supported handshake protocols
            expect(outOfBandInvitation.handshakeProtocols).toContain(connections_1.HandshakeProtocol.Connections);
            expect(outOfBandInvitation.getRequests()).toHaveLength(1);
            // expect contains services
            const [service] = outOfBandInvitation.getInlineServices();
            expect(service).toMatchObject(new OutOfBandDidCommService_1.OutOfBandDidCommService({
                id: expect.any(String),
                serviceEndpoint: 'rxjs:faber',
                recipientKeys: [expect.stringMatching('did:key:')],
                routingKeys: [],
            }));
        }));
        test('emits OutOfBandStateChanged event', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListener = jest.fn();
            faberAgent.events.on(OutOfBandEvents_1.OutOfBandEventTypes.OutOfBandStateChanged, eventListener);
            const outOfBandRecord = yield faberAgent.oob.createInvitation({
                label: 'test-connection',
                handshake: true,
            });
            faberAgent.events.off(OutOfBandEvents_1.OutOfBandEventTypes.OutOfBandStateChanged, eventListener);
            expect(eventListener).toHaveBeenCalledWith({
                type: OutOfBandEvents_1.OutOfBandEventTypes.OutOfBandStateChanged,
                metadata: {
                    contextCorrelationId: 'default',
                },
                payload: {
                    outOfBandRecord,
                    previousState: null,
                },
            });
        }));
    });
    describe('receiveInvitation', () => {
        test('receive OOB connection invitation', () => __awaiter(void 0, void 0, void 0, function* () {
            const outOfBandRecord = yield faberAgent.oob.createInvitation(makeConnectionConfig);
            const { outOfBandInvitation } = outOfBandRecord;
            const { outOfBandRecord: receivedOutOfBandRecord, connectionRecord } = yield aliceAgent.oob.receiveInvitation(outOfBandInvitation, {
                autoAcceptInvitation: false,
                autoAcceptConnection: false,
            });
            expect(connectionRecord).not.toBeDefined();
            expect(receivedOutOfBandRecord.role).toBe(OutOfBandRole_1.OutOfBandRole.Receiver);
            expect(receivedOutOfBandRecord.state).toBe(OutOfBandState_1.OutOfBandState.Initial);
            expect(receivedOutOfBandRecord.outOfBandInvitation).toEqual(outOfBandInvitation);
        }));
        test(`make a connection with ${connections_1.HandshakeProtocol.DidExchange} on OOB invitation encoded in URL`, () => __awaiter(void 0, void 0, void 0, function* () {
            const outOfBandRecord = yield faberAgent.oob.createInvitation(makeConnectionConfig);
            const { outOfBandInvitation } = outOfBandRecord;
            const urlMessage = outOfBandInvitation.toUrl({ domain: 'http://example.com' });
            // eslint-disable-next-line prefer-const
            let { outOfBandRecord: receivedOutOfBandRecord, connectionRecord: aliceFaberConnection } = yield aliceAgent.oob.receiveInvitationFromUrl(urlMessage);
            expect(receivedOutOfBandRecord.state).toBe(OutOfBandState_1.OutOfBandState.PrepareResponse);
            aliceFaberConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceFaberConnection.id);
            expect(aliceFaberConnection.state).toBe(connections_1.DidExchangeState.Completed);
            let [faberAliceConnection] = yield faberAgent.connections.findAllByOutOfBandId(outOfBandRecord.id);
            faberAliceConnection = yield faberAgent.connections.returnWhenIsConnected(faberAliceConnection.id);
            expect(faberAliceConnection === null || faberAliceConnection === void 0 ? void 0 : faberAliceConnection.state).toBe(connections_1.DidExchangeState.Completed);
            expect(aliceFaberConnection).toBeConnectedWith(faberAliceConnection);
            expect(aliceFaberConnection.imageUrl).toBe(makeConnectionConfig.imageUrl);
            expect(faberAliceConnection).toBeConnectedWith(aliceFaberConnection);
            expect(faberAliceConnection.alias).toBe(makeConnectionConfig.alias);
        }));
        test(`make a connection with ${connections_1.HandshakeProtocol.Connections} based on OOB invitation encoded in URL`, () => __awaiter(void 0, void 0, void 0, function* () {
            const outOfBandRecord = yield faberAgent.oob.createInvitation(Object.assign(Object.assign({}, makeConnectionConfig), { handshakeProtocols: [connections_1.HandshakeProtocol.Connections] }));
            const { outOfBandInvitation } = outOfBandRecord;
            const urlMessage = outOfBandInvitation.toUrl({ domain: 'http://example.com' });
            let { connectionRecord: aliceFaberConnection } = yield aliceAgent.oob.receiveInvitationFromUrl(urlMessage);
            aliceFaberConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceFaberConnection.id);
            expect(aliceFaberConnection.state).toBe(connections_1.DidExchangeState.Completed);
            let [faberAliceConnection] = yield faberAgent.connections.findAllByOutOfBandId(outOfBandRecord.id);
            faberAliceConnection = yield faberAgent.connections.returnWhenIsConnected(faberAliceConnection.id);
            expect(faberAliceConnection.state).toBe(connections_1.DidExchangeState.Completed);
            expect(aliceFaberConnection).toBeConnectedWith(faberAliceConnection);
            expect(faberAliceConnection).toBeConnectedWith(aliceFaberConnection);
            expect(faberAliceConnection.alias).toBe(makeConnectionConfig.alias);
        }));
        test('make a connection based on old connection invitation encoded in URL', () => __awaiter(void 0, void 0, void 0, function* () {
            const { outOfBandRecord, invitation } = yield faberAgent.oob.createLegacyInvitation(makeConnectionConfig);
            const urlMessage = invitation.toUrl({ domain: 'http://example.com' });
            let { connectionRecord: aliceFaberConnection } = yield aliceAgent.oob.receiveInvitationFromUrl(urlMessage);
            aliceFaberConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceFaberConnection.id);
            let [faberAliceConnection] = yield faberAgent.connections.findAllByOutOfBandId(outOfBandRecord.id);
            faberAliceConnection = yield faberAgent.connections.returnWhenIsConnected(faberAliceConnection.id);
            expect(aliceFaberConnection.state).toBe(connections_1.DidExchangeState.Completed);
            expect(faberAliceConnection.state).toBe(connections_1.DidExchangeState.Completed);
            expect(faberAliceConnection).toBeConnectedWith(aliceFaberConnection);
            expect(aliceFaberConnection).toBeConnectedWith(faberAliceConnection);
        }));
        test('make a connection based on old connection invitation with multiple endpoints uses first endpoint for invitation', () => __awaiter(void 0, void 0, void 0, function* () {
            const { invitation } = yield faberAgent.oob.createLegacyInvitation(Object.assign(Object.assign({}, makeConnectionConfig), { routing: {
                    endpoints: ['https://endpoint-1.com', 'https://endpoint-2.com'],
                    routingKeys: [crypto_1.Key.fromFingerprint('z6MkiP5ghmdLFh1GyGRQQQLVJhJtjQjTpxUY3AnY3h5gu3BE')],
                    recipientKey: crypto_1.Key.fromFingerprint('z6MkuXrzmDjBoy7r9LA1Czjv9eQXMGr9gt6JBH8zPUMKkCQH'),
                } }));
            expect(invitation.serviceEndpoint).toBe('https://endpoint-1.com');
        }));
        test('process credential offer requests based on OOB message', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message } = yield faberAgent.credentials.createOffer(credentialTemplate);
            const { outOfBandInvitation } = yield faberAgent.oob.createInvitation(Object.assign(Object.assign({}, issueCredentialConfig), { messages: [message] }));
            const urlMessage = outOfBandInvitation.toUrl({ domain: 'http://example.com' });
            const aliceCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                state: core_1.CredentialState.OfferReceived,
                threadId: message.threadId,
            });
            yield aliceAgent.oob.receiveInvitationFromUrl(urlMessage, receiveInvitationConfig);
            const aliceCredentialRecord = yield aliceCredentialRecordPromise;
            expect(aliceCredentialRecord.state).toBe(core_1.CredentialState.OfferReceived);
        }));
        test('process credential offer requests with legacy did:sov prefix on message type based on OOB message', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message } = yield faberAgent.credentials.createOffer(credentialTemplate);
            // we need to override the message type to use the legacy did:sov prefix
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            message.type = message.type.replace('https://didcomm.org', 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec');
            const { outOfBandInvitation } = yield faberAgent.oob.createInvitation(Object.assign(Object.assign({}, issueCredentialConfig), { messages: [message] }));
            const urlMessage = outOfBandInvitation.toUrl({ domain: 'http://example.com' });
            const aliceCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                state: core_1.CredentialState.OfferReceived,
                threadId: message.threadId,
            });
            yield aliceAgent.oob.receiveInvitationFromUrl(urlMessage, receiveInvitationConfig);
            const aliceCredentialRecord = yield aliceCredentialRecordPromise;
            expect(aliceCredentialRecord.state).toBe(core_1.CredentialState.OfferReceived);
        }));
        test('do not process requests when a connection is not ready', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListener = jest.fn();
            aliceAgent.events.on(core_1.AgentEventTypes.AgentMessageReceived, eventListener);
            const { message } = yield faberAgent.credentials.createOffer(credentialTemplate);
            const { outOfBandInvitation } = yield faberAgent.oob.createInvitation(Object.assign(Object.assign({}, makeConnectionConfig), { messages: [message] }));
            // First, we crate a connection but we won't accept it, therefore it won't be ready
            yield aliceAgent.oob.receiveInvitation(outOfBandInvitation, { autoAcceptConnection: false });
            // Event should not be emitted because an agent must wait until the connection is ready
            expect(eventListener).toHaveBeenCalledTimes(0);
            aliceAgent.events.off(core_1.AgentEventTypes.AgentMessageReceived, eventListener);
        }));
        test('make a connection based on OOB invitation and process requests after the acceptation', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message } = yield faberAgent.credentials.createOffer(credentialTemplate);
            const outOfBandRecord = yield faberAgent.oob.createInvitation(Object.assign(Object.assign({}, makeConnectionConfig), { messages: [message] }));
            const { outOfBandInvitation } = outOfBandRecord;
            // First, we crate a connection but we won't accept it, therefore it won't be ready
            const { outOfBandRecord: aliceFaberOutOfBandRecord } = yield aliceAgent.oob.receiveInvitation(outOfBandInvitation, {
                autoAcceptInvitation: false,
                autoAcceptConnection: false,
            });
            const aliceCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                state: core_1.CredentialState.OfferReceived,
                threadId: message.threadId,
                // We need to create the connection beforehand so it can take a while to complete
                timeoutMs: 20000,
            });
            // Accept connection invitation
            let { connectionRecord: aliceFaberConnection } = yield aliceAgent.oob.acceptInvitation(aliceFaberOutOfBandRecord.id, {
                label: 'alice',
                autoAcceptConnection: true,
            });
            // Wait until connection is ready
            aliceFaberConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceFaberConnection.id);
            let [faberAliceConnection] = yield faberAgent.connections.findAllByOutOfBandId(outOfBandRecord.id);
            faberAliceConnection = yield faberAgent.connections.returnWhenIsConnected(faberAliceConnection.id);
            expect(faberAliceConnection).toBeConnectedWith(aliceFaberConnection);
            expect(aliceFaberConnection).toBeConnectedWith(faberAliceConnection);
            const aliceCredentialRecord = yield aliceCredentialRecordPromise;
            expect(aliceCredentialRecord.state).toBe(core_1.CredentialState.OfferReceived);
        }));
        test('do not create a new connection when no messages and handshake reuse succeeds', () => __awaiter(void 0, void 0, void 0, function* () {
            const aliceReuseListener = jest.fn();
            const faberReuseListener = jest.fn();
            // Create first connection
            const outOfBandRecord = yield faberAgent.oob.createInvitation(makeConnectionConfig);
            let { connectionRecord: firstAliceFaberConnection } = yield aliceAgent.oob.receiveInvitation(outOfBandRecord.outOfBandInvitation);
            firstAliceFaberConnection = yield aliceAgent.connections.returnWhenIsConnected(firstAliceFaberConnection.id);
            const [firstFaberAliceConnection] = yield faberAgent.connections.findAllByOutOfBandId(outOfBandRecord.id);
            // Create second connection
            const outOfBandRecord2 = yield faberAgent.oob.createInvitation(makeConnectionConfig);
            // Take over the recipientKeys from the first invitation so they match when encoded
            const [firstInvitationService] = outOfBandRecord.outOfBandInvitation.getInlineServices();
            const [secondInvitationService] = outOfBandRecord2.outOfBandInvitation.getInlineServices();
            secondInvitationService.recipientKeys = firstInvitationService.recipientKeys;
            aliceAgent.events.on(OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused, aliceReuseListener);
            faberAgent.events.on(OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused, faberReuseListener);
            const { connectionRecord: secondAliceFaberConnection, outOfBandRecord: { id: secondOobRecordId }, } = yield aliceAgent.oob.receiveInvitation(outOfBandRecord2.outOfBandInvitation, { reuseConnection: true });
            aliceAgent.events.off(OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused, aliceReuseListener);
            faberAgent.events.off(OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused, faberReuseListener);
            yield aliceAgent.connections.returnWhenIsConnected(secondAliceFaberConnection.id);
            // There shouldn't be any connection records for this oob id, as we reused an existing one
            expect((yield faberAgent.connections.findAllByOutOfBandId(secondOobRecordId)).length).toBe(0);
            expect(firstAliceFaberConnection.id).toEqual(secondAliceFaberConnection === null || secondAliceFaberConnection === void 0 ? void 0 : secondAliceFaberConnection.id);
            expect(faberReuseListener).toHaveBeenCalledTimes(1);
            expect(aliceReuseListener).toHaveBeenCalledTimes(1);
            const [[faberEvent]] = faberReuseListener.mock.calls;
            const [[aliceEvent]] = aliceReuseListener.mock.calls;
            const reuseThreadId = faberEvent.payload.reuseThreadId;
            expect(faberEvent).toMatchObject({
                type: OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused,
                payload: {
                    connectionRecord: {
                        id: firstFaberAliceConnection.id,
                    },
                    outOfBandRecord: {
                        id: outOfBandRecord2.id,
                    },
                    reuseThreadId,
                },
            });
            expect(aliceEvent).toMatchObject({
                type: OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused,
                payload: {
                    connectionRecord: {
                        id: firstAliceFaberConnection.id,
                    },
                    outOfBandRecord: {
                        id: secondOobRecordId,
                    },
                    reuseThreadId,
                },
            });
        }));
        test('create a new connection when connection exists and reuse is false', () => __awaiter(void 0, void 0, void 0, function* () {
            const reuseListener = jest.fn();
            // Create first connection
            const outOfBandRecord = yield faberAgent.oob.createInvitation(makeConnectionConfig);
            let { connectionRecord: firstAliceFaberConnection } = yield aliceAgent.oob.receiveInvitation(outOfBandRecord.outOfBandInvitation);
            firstAliceFaberConnection = yield aliceAgent.connections.returnWhenIsConnected(firstAliceFaberConnection.id);
            // Create second connection
            const outOfBandRecord2 = yield faberAgent.oob.createInvitation(makeConnectionConfig);
            aliceAgent.events.on(OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused, reuseListener);
            faberAgent.events.on(OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused, reuseListener);
            const { connectionRecord: secondAliceFaberConnection } = yield aliceAgent.oob.receiveInvitation(outOfBandRecord2.outOfBandInvitation, { reuseConnection: false });
            aliceAgent.events.off(OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused, reuseListener);
            faberAgent.events.off(OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused, reuseListener);
            yield aliceAgent.connections.returnWhenIsConnected(secondAliceFaberConnection.id);
            // If we're not reusing the connection, the reuse listener shouldn't be called
            expect(reuseListener).not.toHaveBeenCalled();
            expect(firstAliceFaberConnection.id).not.toEqual(secondAliceFaberConnection === null || secondAliceFaberConnection === void 0 ? void 0 : secondAliceFaberConnection.id);
            const faberConnections = yield faberAgent.connections.getAll();
            let [firstFaberAliceConnection, secondFaberAliceConnection] = faberConnections;
            firstFaberAliceConnection = yield faberAgent.connections.returnWhenIsConnected(firstFaberAliceConnection.id);
            secondFaberAliceConnection = yield faberAgent.connections.returnWhenIsConnected(secondFaberAliceConnection.id);
            // expect the two connections contain the two out of band ids
            expect(faberConnections.map((c) => c.outOfBandId)).toEqual(expect.arrayContaining([outOfBandRecord.id, outOfBandRecord2.id]));
            expect(faberConnections).toHaveLength(2);
            expect(firstFaberAliceConnection.state).toBe(connections_1.DidExchangeState.Completed);
            expect(secondFaberAliceConnection.state).toBe(connections_1.DidExchangeState.Completed);
        }));
        test('throws an error when the invitation has already been received', () => __awaiter(void 0, void 0, void 0, function* () {
            const outOfBandRecord = yield faberAgent.oob.createInvitation(makeConnectionConfig);
            const { outOfBandInvitation } = outOfBandRecord;
            const { connectionRecord: aliceFaberConnection } = yield aliceAgent.oob.receiveInvitation(outOfBandInvitation);
            // Wait until connection is ready
            yield aliceAgent.connections.returnWhenIsConnected(aliceFaberConnection.id);
            const [faberAliceConnection] = yield faberAgent.connections.findAllByOutOfBandId(outOfBandRecord.id);
            yield faberAgent.connections.returnWhenIsConnected(faberAliceConnection.id);
            // Try to receive the invitation again
            yield expect(aliceAgent.oob.receiveInvitation(outOfBandInvitation)).rejects.toThrow(new core_1.AriesFrameworkError(`An out of band record with invitation ${outOfBandInvitation.id} has already been received. Invitations should have a unique id.`));
        }));
        test('emits OutOfBandStateChanged event', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListener = jest.fn();
            const { outOfBandInvitation, id } = yield faberAgent.oob.createInvitation(makeConnectionConfig);
            aliceAgent.events.on(OutOfBandEvents_1.OutOfBandEventTypes.OutOfBandStateChanged, eventListener);
            const { outOfBandRecord, connectionRecord } = yield aliceAgent.oob.receiveInvitation(outOfBandInvitation, {
                autoAcceptConnection: true,
                autoAcceptInvitation: true,
            });
            // Wait for the connection to complete so we don't get wallet closed errors
            yield aliceAgent.connections.returnWhenIsConnected(connectionRecord.id);
            aliceAgent.events.off(OutOfBandEvents_1.OutOfBandEventTypes.OutOfBandStateChanged, eventListener);
            const [faberAliceConnection] = yield faberAgent.connections.findAllByOutOfBandId(id);
            yield faberAgent.connections.returnWhenIsConnected(faberAliceConnection.id);
            // Receiving the invitation
            expect(eventListener).toHaveBeenNthCalledWith(1, {
                type: OutOfBandEvents_1.OutOfBandEventTypes.OutOfBandStateChanged,
                metadata: {
                    contextCorrelationId: 'default',
                },
                payload: {
                    outOfBandRecord: expect.objectContaining({ state: OutOfBandState_1.OutOfBandState.Initial }),
                    previousState: null,
                },
            });
            // Accepting the invitation
            expect(eventListener).toHaveBeenNthCalledWith(2, {
                type: OutOfBandEvents_1.OutOfBandEventTypes.OutOfBandStateChanged,
                metadata: {
                    contextCorrelationId: 'default',
                },
                payload: {
                    outOfBandRecord,
                    previousState: OutOfBandState_1.OutOfBandState.Initial,
                },
            });
        }));
        test.skip('do not create a new connection when connection exists and multiuse is false', () => __awaiter(void 0, void 0, void 0, function* () {
            const outOfBandRecord = yield faberAgent.oob.createInvitation(Object.assign(Object.assign({}, makeConnectionConfig), { multiUseInvitation: false }));
            const { outOfBandInvitation } = outOfBandRecord;
            let { connectionRecord: firstAliceFaberConnection } = yield aliceAgent.oob.receiveInvitation(outOfBandInvitation);
            firstAliceFaberConnection = yield aliceAgent.connections.returnWhenIsConnected(firstAliceFaberConnection.id);
            yield aliceAgent.oob.receiveInvitation(outOfBandInvitation);
            // TODO Somehow check agents throws an error or sends problem report
            let [faberAliceConnection] = yield faberAgent.connections.findAllByOutOfBandId(outOfBandRecord.id);
            faberAliceConnection = yield faberAgent.connections.returnWhenIsConnected(faberAliceConnection.id);
            const faberConnections = yield faberAgent.connections.getAll();
            expect(faberConnections).toHaveLength(1);
            expect(faberAliceConnection.state).toBe(connections_1.DidExchangeState.Completed);
            expect(firstAliceFaberConnection.state).toBe(connections_1.DidExchangeState.Completed);
        }));
        test('throw an error when handshake protocols are not supported', () => __awaiter(void 0, void 0, void 0, function* () {
            const outOfBandInvitation = new messages_1.OutOfBandInvitation({ label: 'test-connection', services: [] });
            const unsupportedProtocol = 'https://didcomm.org/unsupported-connections-protocol/1.0';
            outOfBandInvitation.handshakeProtocols = [unsupportedProtocol];
            yield expect(aliceAgent.oob.receiveInvitation(outOfBandInvitation, receiveInvitationConfig)).rejects.toEqual(new core_1.AriesFrameworkError(`Handshake protocols [${unsupportedProtocol}] are not supported. Supported protocols are [https://didcomm.org/didexchange/1.0,https://didcomm.org/connections/1.0]`));
        }));
        test('throw an error when the OOB message does not contain either handshake or requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const outOfBandInvitation = new messages_1.OutOfBandInvitation({ label: 'test-connection', services: [] });
            yield expect(aliceAgent.oob.receiveInvitation(outOfBandInvitation, receiveInvitationConfig)).rejects.toEqual(new core_1.AriesFrameworkError('One or both of handshake_protocols and requests~attach MUST be included in the message.'));
        }));
        test('throw an error when the OOB message contains unsupported message request', () => __awaiter(void 0, void 0, void 0, function* () {
            const testMessage = new TestMessage_1.TestMessage();
            testMessage.type = 'https://didcomm.org/test-protocol/1.0/test-message';
            const { outOfBandInvitation } = yield faberAgent.oob.createInvitation(Object.assign(Object.assign({}, issueCredentialConfig), { messages: [testMessage] }));
            yield expect(aliceAgent.oob.receiveInvitation(outOfBandInvitation, receiveInvitationConfig)).rejects.toEqual(new core_1.AriesFrameworkError('There is no message in requests~attach supported by agent.'));
        }));
    });
    describe('messages and connection exchange', () => {
        test('oob exchange with handshake where response is received to invitation', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message } = yield faberAgent.credentials.createOffer(credentialTemplate);
            const outOfBandRecord = yield faberAgent.oob.createInvitation({
                handshake: true,
                messages: [message],
            });
            const { outOfBandInvitation } = outOfBandRecord;
            yield aliceAgent.oob.receiveInvitation(outOfBandInvitation);
            const aliceCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                state: core_1.CredentialState.OfferReceived,
                threadId: message.threadId,
                timeoutMs: 10000,
            });
            const aliceCredentialRecord = yield aliceCredentialRecordPromise;
            expect(aliceCredentialRecord.state).toBe(core_1.CredentialState.OfferReceived);
            // If we receive the event, we know the processing went well
            const faberCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(faberAgent, {
                state: core_1.CredentialState.RequestReceived,
                threadId: message.threadId,
                timeoutMs: 10000,
            });
            yield aliceAgent.credentials.acceptOffer({
                credentialRecordId: aliceCredentialRecord.id,
            });
            yield faberCredentialRecordPromise;
        }));
        test('oob exchange with reuse where response is received to invitation', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message } = yield faberAgent.credentials.createOffer(credentialTemplate);
            const routing = yield faberAgent.mediationRecipient.getRouting({});
            const connectionOutOfBandRecord = yield faberAgent.oob.createInvitation({
                routing,
            });
            // Create connection
            const { connectionRecord } = yield aliceAgent.oob.receiveInvitation(connectionOutOfBandRecord.outOfBandInvitation);
            if (!connectionRecord)
                throw new Error('Connection record is undefined');
            yield aliceAgent.connections.returnWhenIsConnected(connectionRecord.id);
            // Create offer and reuse
            const outOfBandRecord = yield faberAgent.oob.createInvitation({
                routing,
                messages: [message],
            });
            // Create connection
            const { connectionRecord: offerConnectionRecord } = yield aliceAgent.oob.receiveInvitation(outOfBandRecord.outOfBandInvitation, {
                reuseConnection: true,
            });
            if (!offerConnectionRecord)
                throw new Error('Connection record is undefined');
            // Should be the same, as connection is reused.
            expect(offerConnectionRecord.id).toEqual(connectionRecord.id);
            const aliceCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                state: core_1.CredentialState.OfferReceived,
                threadId: message.threadId,
                timeoutMs: 10000,
            });
            const aliceCredentialRecord = yield aliceCredentialRecordPromise;
            expect(aliceCredentialRecord.state).toBe(core_1.CredentialState.OfferReceived);
            // If we receive the event, we know the processing went well
            const faberCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(faberAgent, {
                state: core_1.CredentialState.RequestReceived,
                threadId: message.threadId,
                timeoutMs: 10000,
            });
            yield aliceAgent.credentials.acceptOffer({
                credentialRecordId: aliceCredentialRecord.id,
            });
            yield faberCredentialRecordPromise;
        }));
    });
    describe('connection-less exchange', () => {
        test('oob exchange without handshake where response is received to invitation', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message } = yield faberAgent.credentials.createOffer(credentialTemplate);
            const outOfBandRecord = yield faberAgent.oob.createInvitation({
                handshake: false,
                messages: [message],
            });
            const { outOfBandInvitation } = outOfBandRecord;
            yield aliceAgent.oob.receiveInvitation(outOfBandInvitation);
            const aliceCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                state: core_1.CredentialState.OfferReceived,
                threadId: message.threadId,
                timeoutMs: 10000,
            });
            const aliceCredentialRecord = yield aliceCredentialRecordPromise;
            expect(aliceCredentialRecord.state).toBe(core_1.CredentialState.OfferReceived);
            // If we receive the event, we know the processing went well
            const faberCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(faberAgent, {
                state: core_1.CredentialState.RequestReceived,
                threadId: message.threadId,
                timeoutMs: 10000,
            });
            yield aliceAgent.credentials.acceptOffer({
                credentialRecordId: aliceCredentialRecord.id,
            });
            yield faberCredentialRecordPromise;
        }));
        test('oob exchange without handshake where response is received and custom routing is used on recipient', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message } = yield faberAgent.credentials.createOffer(credentialTemplate);
            const outOfBandRecord = yield faberAgent.oob.createInvitation({
                handshake: false,
                messages: [message],
            });
            const { outOfBandInvitation } = outOfBandRecord;
            const routing = yield aliceAgent.mediationRecipient.getRouting({});
            yield aliceAgent.oob.receiveInvitation(outOfBandInvitation, {
                routing,
            });
            const aliceCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                state: core_1.CredentialState.OfferReceived,
                threadId: message.threadId,
                timeoutMs: 10000,
            });
            const aliceCredentialRecord = yield aliceCredentialRecordPromise;
            expect(aliceCredentialRecord.state).toBe(core_1.CredentialState.OfferReceived);
            // If we receive the event, we know the processing went well
            const faberCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(faberAgent, {
                state: core_1.CredentialState.RequestReceived,
                threadId: message.threadId,
                timeoutMs: 10000,
            });
            yield aliceAgent.credentials.acceptOffer({
                credentialRecordId: aliceCredentialRecord.id,
            });
            const faberCredentialRecord = yield faberCredentialRecordPromise;
            const faberCredentialRequest = yield faberAgent.credentials.findRequestMessage(faberCredentialRecord.id);
            expect(utils_1.JsonTransformer.toJSON(faberCredentialRequest === null || faberCredentialRequest === void 0 ? void 0 : faberCredentialRequest.service)).toEqual({
                recipientKeys: [routing.recipientKey.publicKeyBase58],
                serviceEndpoint: routing.endpoints[0],
                routingKeys: routing.routingKeys.map((r) => r.publicKeyBase58),
            });
        }));
        test('legacy connectionless exchange where response is received to invitation', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message, credentialRecord } = yield faberAgent.credentials.createOffer(credentialTemplate);
            const { invitationUrl } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
                domain: 'http://example.com',
                message,
                recordId: credentialRecord.id,
            });
            const aliceCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                state: core_1.CredentialState.OfferReceived,
                threadId: message.threadId,
                timeoutMs: 10000,
            });
            yield aliceAgent.oob.receiveInvitationFromUrl(invitationUrl);
            const aliceCredentialRecord = yield aliceCredentialRecordPromise;
            expect(aliceCredentialRecord.state).toBe(core_1.CredentialState.OfferReceived);
            // If we receive the event, we know the processing went well
            const faberCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(faberAgent, {
                state: core_1.CredentialState.RequestReceived,
                threadId: message.threadId,
                timeoutMs: 10000,
            });
            yield aliceAgent.credentials.acceptOffer({
                credentialRecordId: aliceCredentialRecord.id,
            });
            yield faberCredentialRecordPromise;
        }));
        test('legacy connectionless exchange where response is received to invitation and custom routing is used on recipient', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message, credentialRecord } = yield faberAgent.credentials.createOffer(credentialTemplate);
            const { invitationUrl } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
                domain: 'http://example.com',
                message,
                recordId: credentialRecord.id,
            });
            const routing = yield aliceAgent.mediationRecipient.getRouting({});
            const aliceCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                state: core_1.CredentialState.OfferReceived,
                threadId: message.threadId,
                timeoutMs: 10000,
            });
            yield aliceAgent.oob.receiveInvitationFromUrl(invitationUrl, { routing });
            const aliceCredentialRecord = yield aliceCredentialRecordPromise;
            expect(aliceCredentialRecord.state).toBe(core_1.CredentialState.OfferReceived);
            // If we receive the event, we know the processing went well
            const faberCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(faberAgent, {
                state: core_1.CredentialState.RequestReceived,
                threadId: message.threadId,
                timeoutMs: 10000,
            });
            yield aliceAgent.credentials.acceptOffer({
                credentialRecordId: aliceCredentialRecord.id,
            });
            const faberCredentialRecord = yield faberCredentialRecordPromise;
            const faberCredentialRequest = yield faberAgent.credentials.findRequestMessage(faberCredentialRecord.id);
            expect(utils_1.JsonTransformer.toJSON(faberCredentialRequest === null || faberCredentialRequest === void 0 ? void 0 : faberCredentialRequest.service)).toEqual({
                recipientKeys: [routing.recipientKey.publicKeyBase58],
                serviceEndpoint: routing.endpoints[0],
                routingKeys: routing.routingKeys.map((r) => r.publicKeyBase58),
            });
        }));
        test('legacy connectionless exchange without receiving message through oob receiveInvitation, where response is received to invitation', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message, credentialRecord } = yield faberAgent.credentials.createOffer(credentialTemplate);
            const { message: messageWithService } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
                domain: 'http://example.com',
                message,
                recordId: credentialRecord.id,
            });
            const aliceCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                state: core_1.CredentialState.OfferReceived,
                threadId: message.threadId,
                timeoutMs: 10000,
            });
            yield aliceAgent.receiveMessage(messageWithService.toJSON());
            const aliceCredentialRecord = yield aliceCredentialRecordPromise;
            expect(aliceCredentialRecord.state).toBe(core_1.CredentialState.OfferReceived);
            // If we receive the event, we know the processing went well
            const faberCredentialRecordPromise = (0, helpers_1.waitForCredentialRecord)(faberAgent, {
                state: core_1.CredentialState.RequestReceived,
                threadId: message.threadId,
                timeoutMs: 10000,
            });
            yield aliceAgent.credentials.acceptOffer({
                credentialRecordId: aliceCredentialRecord.id,
            });
            yield faberCredentialRecordPromise;
        }));
        test('add ~service decorator to the message and returns invitation url in createLegacyConnectionlessInvitation', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message, credentialRecord } = yield faberAgent.credentials.createOffer(credentialTemplate);
            const { message: offerMessage, invitationUrl } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
                recordId: credentialRecord.id,
                domain: 'https://test.com',
                message,
            });
            expect(offerMessage.service).toMatchObject({
                serviceEndpoint: expect.any(String),
                recipientKeys: [expect.any(String)],
                routingKeys: [],
            });
            expect(invitationUrl).toEqual(expect.stringContaining('https://test.com?d_m='));
            const messageBase64 = invitationUrl.split('https://test.com?d_m=')[1];
            expect(utils_1.JsonEncoder.fromBase64(messageBase64)).toMatchObject({
                '@id': expect.any(String),
                '@type': 'https://didcomm.org/issue-credential/1.0/offer-credential',
            });
        }));
    });
});
