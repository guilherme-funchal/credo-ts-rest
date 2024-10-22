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
const SubjectInboundTransport_1 = require("../../../../../../tests/transport/SubjectInboundTransport");
const SubjectOutboundTransport_1 = require("../../../../../../tests/transport/SubjectOutboundTransport");
const setupIndySdkModule_1 = require("../../../../../indy-sdk/tests/setupIndySdkModule");
const helpers_1 = require("../../../../tests/helpers");
const Agent_1 = require("../../../agent/Agent");
const sleep_1 = require("../../../utils/sleep");
const connections_1 = require("../../connections");
const MediationRecipientModule_1 = require("../MediationRecipientModule");
const MediatorModule_1 = require("../MediatorModule");
const MediatorPickupStrategy_1 = require("../MediatorPickupStrategy");
const MediationState_1 = require("../models/MediationState");
const recipientAgentOptions = (0, helpers_1.getAgentOptions)('Mediation: Recipient', {}, (0, setupIndySdkModule_1.getIndySdkModules)());
const mediatorAgentOptions = (0, helpers_1.getAgentOptions)('Mediation: Mediator', {
    endpoints: ['rxjs:mediator'],
}, Object.assign(Object.assign({}, (0, setupIndySdkModule_1.getIndySdkModules)()), { mediator: new MediatorModule_1.MediatorModule({
        autoAcceptMediationRequests: true,
    }) }));
const senderAgentOptions = (0, helpers_1.getAgentOptions)('Mediation: Sender', {
    endpoints: ['rxjs:sender'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
describe('mediator establishment', () => {
    let recipientAgent;
    let mediatorAgent;
    let senderAgent;
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (recipientAgent === null || recipientAgent === void 0 ? void 0 : recipientAgent.shutdown());
        yield (recipientAgent === null || recipientAgent === void 0 ? void 0 : recipientAgent.wallet.delete());
        yield (mediatorAgent === null || mediatorAgent === void 0 ? void 0 : mediatorAgent.shutdown());
        yield (mediatorAgent === null || mediatorAgent === void 0 ? void 0 : mediatorAgent.wallet.delete());
        yield (senderAgent === null || senderAgent === void 0 ? void 0 : senderAgent.shutdown());
        yield (senderAgent === null || senderAgent === void 0 ? void 0 : senderAgent.wallet.delete());
    }));
    const e2eMediationTest = (mediatorAgentOptions, recipientAgentOptions) => __awaiter(void 0, void 0, void 0, function* () {
        const mediatorMessages = new rxjs_1.Subject();
        const recipientMessages = new rxjs_1.Subject();
        const senderMessages = new rxjs_1.Subject();
        const subjectMap = {
            'rxjs:mediator': mediatorMessages,
            'rxjs:sender': senderMessages,
        };
        // Initialize mediatorReceived message
        mediatorAgent = new Agent_1.Agent(mediatorAgentOptions);
        mediatorAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        mediatorAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(mediatorMessages));
        yield mediatorAgent.initialize();
        // Create connection to use for recipient
        const mediatorOutOfBandRecord = yield mediatorAgent.oob.createInvitation({
            label: 'mediator invitation',
            handshake: true,
            handshakeProtocols: [connections_1.HandshakeProtocol.Connections],
        });
        // Initialize recipient with mediation connections invitation
        recipientAgent = new Agent_1.Agent(Object.assign(Object.assign({}, recipientAgentOptions), { modules: Object.assign(Object.assign({}, recipientAgentOptions.modules), { mediationRecipient: new MediationRecipientModule_1.MediationRecipientModule({
                    mediatorPickupStrategy: MediatorPickupStrategy_1.MediatorPickupStrategy.PickUpV1,
                    mediatorInvitationUrl: mediatorOutOfBandRecord.outOfBandInvitation.toUrl({
                        domain: 'https://example.com/ssi',
                    }),
                }) }) }));
        recipientAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        recipientAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(recipientMessages));
        yield recipientAgent.initialize();
        const recipientMediator = yield recipientAgent.mediationRecipient.findDefaultMediator();
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-non-null-assertion
        const recipientMediatorConnection = yield recipientAgent.connections.getById(recipientMediator.connectionId);
        expect(recipientMediatorConnection).toBeInstanceOf(connections_1.ConnectionRecord);
        expect(recipientMediatorConnection === null || recipientMediatorConnection === void 0 ? void 0 : recipientMediatorConnection.isReady).toBe(true);
        const [mediatorRecipientConnection] = yield mediatorAgent.connections.findAllByOutOfBandId(mediatorOutOfBandRecord.id);
        expect(mediatorRecipientConnection.isReady).toBe(true);
        expect(mediatorRecipientConnection).toBeConnectedWith(recipientMediatorConnection);
        expect(recipientMediatorConnection).toBeConnectedWith(mediatorRecipientConnection);
        expect(recipientMediator === null || recipientMediator === void 0 ? void 0 : recipientMediator.state).toBe(MediationState_1.MediationState.Granted);
        // Initialize sender agent
        senderAgent = new Agent_1.Agent(senderAgentOptions);
        senderAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        senderAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(senderMessages));
        yield senderAgent.initialize();
        const recipientOutOfBandRecord = yield recipientAgent.oob.createInvitation({
            label: 'mediator invitation',
            handshake: true,
            handshakeProtocols: [connections_1.HandshakeProtocol.Connections],
        });
        const recipientInvitation = recipientOutOfBandRecord.outOfBandInvitation;
        let { connectionRecord: senderRecipientConnection } = yield senderAgent.oob.receiveInvitationFromUrl(recipientInvitation.toUrl({ domain: 'https://example.com/ssi' }));
        senderRecipientConnection = yield senderAgent.connections.returnWhenIsConnected(senderRecipientConnection.id);
        let [recipientSenderConnection] = yield recipientAgent.connections.findAllByOutOfBandId(recipientOutOfBandRecord.id);
        expect(recipientSenderConnection).toBeConnectedWith(senderRecipientConnection);
        expect(senderRecipientConnection).toBeConnectedWith(recipientSenderConnection);
        expect(recipientSenderConnection.isReady).toBe(true);
        expect(senderRecipientConnection.isReady).toBe(true);
        recipientSenderConnection = yield recipientAgent.connections.returnWhenIsConnected(recipientSenderConnection.id);
        const message = 'hello, world';
        yield senderAgent.basicMessages.sendMessage(senderRecipientConnection.id, message);
        const basicMessage = yield (0, helpers_1.waitForBasicMessage)(recipientAgent, {
            content: message,
        });
        // polling interval is 100ms, so 500ms should be enough to make sure no messages are sent
        yield recipientAgent.mediationRecipient.stopMessagePickup();
        yield (0, sleep_1.sleep)(500);
        expect(basicMessage.content).toBe(message);
    });
    test(`Mediation end-to-end flow
        1. Start mediator agent and create invitation
        2. Start recipient agent with mediatorConnectionsInvite from mediator
        3. Assert mediator and recipient are connected and mediation state is Granted
        4. Start sender agent and create connection with recipient
        5. Assert endpoint in recipient invitation for sender is mediator endpoint
        6. Send basic message from sender to recipient and assert it is received on the recipient side
`, () => __awaiter(void 0, void 0, void 0, function* () {
        yield e2eMediationTest(mediatorAgentOptions, recipientAgentOptions);
    }));
    test('Mediation end-to-end flow (not using did:key)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield e2eMediationTest(Object.assign(Object.assign({}, mediatorAgentOptions), { config: Object.assign(Object.assign({}, mediatorAgentOptions.config), { useDidKeyInProtocols: false }) }), Object.assign(Object.assign({}, recipientAgentOptions), { config: Object.assign(Object.assign({}, recipientAgentOptions.config), { useDidKeyInProtocols: false }) }));
    }));
    test('restart recipient agent and create connection through mediator after recipient agent is restarted', () => __awaiter(void 0, void 0, void 0, function* () {
        const mediatorMessages = new rxjs_1.Subject();
        const recipientMessages = new rxjs_1.Subject();
        const senderMessages = new rxjs_1.Subject();
        const subjectMap = {
            'rxjs:mediator': mediatorMessages,
            'rxjs:sender': senderMessages,
        };
        // Initialize mediator
        mediatorAgent = new Agent_1.Agent(mediatorAgentOptions);
        mediatorAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        mediatorAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(mediatorMessages));
        yield mediatorAgent.initialize();
        // Create connection to use for recipient
        const mediatorOutOfBandRecord = yield mediatorAgent.oob.createInvitation({
            label: 'mediator invitation',
            handshake: true,
            handshakeProtocols: [connections_1.HandshakeProtocol.Connections],
        });
        // Initialize recipient with mediation connections invitation
        recipientAgent = new Agent_1.Agent(Object.assign(Object.assign({}, recipientAgentOptions), { modules: Object.assign(Object.assign({}, recipientAgentOptions.modules), { mediationRecipient: new MediationRecipientModule_1.MediationRecipientModule({
                    mediatorInvitationUrl: mediatorOutOfBandRecord.outOfBandInvitation.toUrl({
                        domain: 'https://example.com/ssi',
                    }),
                    mediatorPickupStrategy: MediatorPickupStrategy_1.MediatorPickupStrategy.PickUpV1,
                }) }) }));
        recipientAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        recipientAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(recipientMessages));
        yield recipientAgent.initialize();
        const recipientMediator = yield recipientAgent.mediationRecipient.findDefaultMediator();
        const recipientMediatorConnection = yield recipientAgent.connections.getById(recipientMediator.connectionId);
        expect(recipientMediatorConnection === null || recipientMediatorConnection === void 0 ? void 0 : recipientMediatorConnection.isReady).toBe(true);
        const [mediatorRecipientConnection] = yield mediatorAgent.connections.findAllByOutOfBandId(mediatorOutOfBandRecord.id);
        expect(mediatorRecipientConnection.isReady).toBe(true);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(mediatorRecipientConnection).toBeConnectedWith(recipientMediatorConnection);
        expect(recipientMediatorConnection).toBeConnectedWith(mediatorRecipientConnection);
        expect(recipientMediator === null || recipientMediator === void 0 ? void 0 : recipientMediator.state).toBe(MediationState_1.MediationState.Granted);
        // Restart recipient agent
        yield recipientAgent.shutdown();
        recipientAgent = new Agent_1.Agent(Object.assign(Object.assign({}, recipientAgentOptions), { modules: Object.assign(Object.assign({}, recipientAgentOptions.modules), { mediationRecipient: new MediationRecipientModule_1.MediationRecipientModule({
                    mediatorInvitationUrl: mediatorOutOfBandRecord.outOfBandInvitation.toUrl({
                        domain: 'https://example.com/ssi',
                    }),
                    mediatorPickupStrategy: MediatorPickupStrategy_1.MediatorPickupStrategy.PickUpV1,
                }) }) }));
        recipientAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        recipientAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(recipientMessages));
        yield recipientAgent.initialize();
        // Initialize sender agent
        senderAgent = new Agent_1.Agent(senderAgentOptions);
        senderAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        senderAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(senderMessages));
        yield senderAgent.initialize();
        const recipientOutOfBandRecord = yield recipientAgent.oob.createInvitation({
            label: 'mediator invitation',
            handshake: true,
            handshakeProtocols: [connections_1.HandshakeProtocol.Connections],
        });
        const recipientInvitation = recipientOutOfBandRecord.outOfBandInvitation;
        let { connectionRecord: senderRecipientConnection } = yield senderAgent.oob.receiveInvitationFromUrl(recipientInvitation.toUrl({ domain: 'https://example.com/ssi' }));
        senderRecipientConnection = yield senderAgent.connections.returnWhenIsConnected(senderRecipientConnection.id);
        const [recipientSenderConnection] = yield recipientAgent.connections.findAllByOutOfBandId(recipientOutOfBandRecord.id);
        expect(recipientSenderConnection).toBeConnectedWith(senderRecipientConnection);
        expect(senderRecipientConnection).toBeConnectedWith(recipientSenderConnection);
        expect(recipientSenderConnection.isReady).toBe(true);
        expect(senderRecipientConnection.isReady).toBe(true);
        const message = 'hello, world';
        yield senderAgent.basicMessages.sendMessage(senderRecipientConnection.id, message);
        const basicMessage = yield (0, helpers_1.waitForBasicMessage)(recipientAgent, {
            content: message,
        });
        expect(basicMessage.content).toBe(message);
        yield recipientAgent.mediationRecipient.stopMessagePickup();
    }));
});
