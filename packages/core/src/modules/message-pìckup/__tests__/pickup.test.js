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
const connections_1 = require("../../connections");
const recipientOptions = (0, helpers_1.getAgentOptions)('Mediation: Recipient Pickup', {}, (0, setupIndySdkModule_1.getIndySdkModules)());
const mediatorOptions = (0, helpers_1.getAgentOptions)('Mediation: Mediator Pickup', {
    endpoints: ['wss://mediator'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
describe('E2E Pick Up protocol', () => {
    let recipientAgent;
    let mediatorAgent;
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield recipientAgent.shutdown();
        yield recipientAgent.wallet.delete();
        yield mediatorAgent.shutdown();
        yield mediatorAgent.wallet.delete();
    }));
    test('E2E Pick Up V1 protocol', () => __awaiter(void 0, void 0, void 0, function* () {
        const mediatorMessages = new rxjs_1.Subject();
        const subjectMap = {
            'wss://mediator': mediatorMessages,
        };
        // Initialize mediatorReceived message
        mediatorAgent = new Agent_1.Agent(mediatorOptions);
        mediatorAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        mediatorAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(mediatorMessages));
        yield mediatorAgent.initialize();
        // Create connection to use for recipient
        const mediatorOutOfBandRecord = yield mediatorAgent.oob.createInvitation({
            label: 'mediator invitation',
            handshake: true,
            handshakeProtocols: [connections_1.HandshakeProtocol.DidExchange],
        });
        // Initialize recipient
        recipientAgent = new Agent_1.Agent(recipientOptions);
        recipientAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield recipientAgent.initialize();
        // Connect
        const mediatorInvitation = mediatorOutOfBandRecord.outOfBandInvitation;
        let { connectionRecord: recipientMediatorConnection } = yield recipientAgent.oob.receiveInvitationFromUrl(mediatorInvitation.toUrl({ domain: 'https://example.com/ssi' }));
        recipientMediatorConnection = yield recipientAgent.connections.returnWhenIsConnected(recipientMediatorConnection.id);
        let [mediatorRecipientConnection] = yield mediatorAgent.connections.findAllByOutOfBandId(mediatorOutOfBandRecord.id);
        mediatorRecipientConnection = yield mediatorAgent.connections.returnWhenIsConnected(mediatorRecipientConnection.id);
        // Now they are connected, reinitialize recipient agent in order to lose the session (as with SubjectTransport it remains open)
        yield recipientAgent.shutdown();
        recipientAgent = new Agent_1.Agent(recipientOptions);
        recipientAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield recipientAgent.initialize();
        const message = 'hello pickup V1';
        yield mediatorAgent.basicMessages.sendMessage(mediatorRecipientConnection.id, message);
        yield recipientAgent.messagePickup.pickupMessages({
            connectionId: recipientMediatorConnection.id,
            protocolVersion: 'v1',
        });
        const basicMessage = yield (0, helpers_1.waitForBasicMessage)(recipientAgent, {
            content: message,
        });
        expect(basicMessage.content).toBe(message);
    }));
    test('E2E Pick Up V2 protocol', () => __awaiter(void 0, void 0, void 0, function* () {
        const mediatorMessages = new rxjs_1.Subject();
        // FIXME: we harcoded that pickup of messages MUST be using ws(s) scheme when doing implicit pickup
        // For liver delivery we need a duplex transport. however that means we can't test it with the subject transport. Using wss here to 'hack' this. We should
        // extend the API to allow custom schemes (or maybe add a `supportsDuplex` transport / `supportMultiReturnMessages`)
        // For pickup v2 pickup message (which we're testing here) we could just as well use `http` as it is just request/response.
        const subjectMap = {
            'wss://mediator': mediatorMessages,
        };
        // Initialize mediatorReceived message
        mediatorAgent = new Agent_1.Agent(mediatorOptions);
        mediatorAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        mediatorAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(mediatorMessages));
        yield mediatorAgent.initialize();
        // Create connection to use for recipient
        const mediatorOutOfBandRecord = yield mediatorAgent.oob.createInvitation({
            label: 'mediator invitation',
            handshake: true,
            handshakeProtocols: [connections_1.HandshakeProtocol.DidExchange],
        });
        // Initialize recipient
        recipientAgent = new Agent_1.Agent(recipientOptions);
        recipientAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield recipientAgent.initialize();
        // Connect
        const mediatorInvitation = mediatorOutOfBandRecord.outOfBandInvitation;
        let { connectionRecord: recipientMediatorConnection } = yield recipientAgent.oob.receiveInvitationFromUrl(mediatorInvitation.toUrl({ domain: 'https://example.com/ssi' }));
        recipientMediatorConnection = yield recipientAgent.connections.returnWhenIsConnected(recipientMediatorConnection.id);
        let [mediatorRecipientConnection] = yield mediatorAgent.connections.findAllByOutOfBandId(mediatorOutOfBandRecord.id);
        mediatorRecipientConnection = yield mediatorAgent.connections.returnWhenIsConnected(mediatorRecipientConnection.id);
        const message = 'hello pickup V2';
        yield mediatorAgent.basicMessages.sendMessage(mediatorRecipientConnection.id, message);
        const basicMessagePromise = (0, helpers_1.waitForBasicMessage)(recipientAgent, {
            content: message,
        });
        const trustPingPromise = (0, helpers_1.waitForTrustPingReceivedEvent)(mediatorAgent, {});
        yield recipientAgent.messagePickup.pickupMessages({
            connectionId: recipientMediatorConnection.id,
            protocolVersion: 'v2',
        });
        const basicMessage = yield basicMessagePromise;
        expect(basicMessage.content).toBe(message);
        // Wait for trust ping to be received and stop message pickup
        yield trustPingPromise;
        yield recipientAgent.mediationRecipient.stopMessagePickup();
    }));
});
