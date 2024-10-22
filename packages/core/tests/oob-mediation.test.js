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
const setupIndySdkModule_1 = require("../../indy-sdk/tests/setupIndySdkModule");
const Agent_1 = require("../src/agent/Agent");
const Events_1 = require("../src/agent/Events");
const connections_1 = require("../src/modules/connections");
const ConnectionType_1 = require("../src/modules/connections/models/ConnectionType");
const helpers_1 = require("../src/modules/dids/helpers");
const routing_1 = require("../src/modules/routing");
const helpers_2 = require("./helpers");
const faberAgentOptions = (0, helpers_2.getAgentOptions)('OOB mediation - Faber Agent', {
    endpoints: ['rxjs:faber'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
const aliceAgentOptions = (0, helpers_2.getAgentOptions)('OOB mediation - Alice Recipient Agent', {
    endpoints: ['rxjs:alice'],
}, Object.assign(Object.assign({}, (0, setupIndySdkModule_1.getIndySdkModules)()), { mediationRecipient: new routing_1.MediationRecipientModule({
        // FIXME: discover features returns that we support this protocol, but we don't support all roles
        // we should return that we only support the mediator role so we don't have to explicitly declare this
        mediatorPickupStrategy: routing_1.MediatorPickupStrategy.PickUpV1,
    }) }));
const mediatorAgentOptions = (0, helpers_2.getAgentOptions)('OOB mediation - Mediator Agent', {
    endpoints: ['rxjs:mediator'],
}, Object.assign(Object.assign({}, (0, setupIndySdkModule_1.getIndySdkModules)()), { mediator: new routing_1.MediatorModule({ autoAcceptMediationRequests: true }) }));
describe('out of band with mediation', () => {
    const makeConnectionConfig = {
        goal: 'To make a connection',
        goalCode: 'p2p-messaging',
        label: 'Faber College',
        handshake: true,
        multiUseInvitation: false,
    };
    let faberAgent;
    let aliceAgent;
    let mediatorAgent;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const faberMessages = new rxjs_1.Subject();
        const aliceMessages = new rxjs_1.Subject();
        const mediatorMessages = new rxjs_1.Subject();
        const subjectMap = {
            'rxjs:faber': faberMessages,
            'rxjs:alice': aliceMessages,
            'rxjs:mediator': mediatorMessages,
        };
        faberAgent = new Agent_1.Agent(faberAgentOptions);
        faberAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(faberMessages));
        faberAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield faberAgent.initialize();
        aliceAgent = new Agent_1.Agent(aliceAgentOptions);
        aliceAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(aliceMessages));
        aliceAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield aliceAgent.initialize();
        mediatorAgent = new Agent_1.Agent(mediatorAgentOptions);
        mediatorAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(mediatorMessages));
        mediatorAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield mediatorAgent.initialize();
        // ========== Make a connection between Alice and Mediator agents ==========
        const mediationOutOfBandRecord = yield mediatorAgent.oob.createInvitation(makeConnectionConfig);
        const { outOfBandInvitation: mediatorOutOfBandInvitation } = mediationOutOfBandRecord;
        const mediatorUrlMessage = mediatorOutOfBandInvitation.toUrl({ domain: 'http://example.com' });
        let { connectionRecord: aliceMediatorConnection } = yield aliceAgent.oob.receiveInvitationFromUrl(mediatorUrlMessage);
        aliceMediatorConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceMediatorConnection.id);
        expect(aliceMediatorConnection.state).toBe(connections_1.DidExchangeState.Completed);
        // Tag the connection with an initial type
        aliceMediatorConnection = yield aliceAgent.connections.addConnectionType(aliceMediatorConnection.id, 'initial-type');
        let [mediatorAliceConnection] = yield mediatorAgent.connections.findAllByOutOfBandId(mediationOutOfBandRecord.id);
        mediatorAliceConnection = yield mediatorAgent.connections.returnWhenIsConnected(mediatorAliceConnection.id);
        expect(mediatorAliceConnection.state).toBe(connections_1.DidExchangeState.Completed);
        // ========== Set mediation between Alice and Mediator agents ==========
        let connectionTypes = yield aliceAgent.connections.getConnectionTypes(aliceMediatorConnection.id);
        expect(connectionTypes).toMatchObject(['initial-type']);
        const mediationRecord = yield aliceAgent.mediationRecipient.requestAndAwaitGrant(aliceMediatorConnection);
        connectionTypes = yield aliceAgent.connections.getConnectionTypes(mediationRecord.connectionId);
        expect(connectionTypes.sort()).toMatchObject(['initial-type', ConnectionType_1.ConnectionType.Mediator].sort());
        yield aliceAgent.connections.removeConnectionType(mediationRecord.connectionId, 'initial-type');
        connectionTypes = yield aliceAgent.connections.getConnectionTypes(mediationRecord.connectionId);
        expect(connectionTypes).toMatchObject([ConnectionType_1.ConnectionType.Mediator]);
        expect(mediationRecord.state).toBe(routing_1.MediationState.Granted);
        yield aliceAgent.mediationRecipient.setDefaultMediator(mediationRecord);
        yield aliceAgent.mediationRecipient.initiateMessagePickup(mediationRecord);
        const defaultMediator = yield aliceAgent.mediationRecipient.findDefaultMediator();
        expect(defaultMediator === null || defaultMediator === void 0 ? void 0 : defaultMediator.id).toBe(mediationRecord.id);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
        yield mediatorAgent.shutdown();
        yield mediatorAgent.wallet.delete();
    }));
    test(`make a connection with ${connections_1.HandshakeProtocol.DidExchange} on OOB invitation encoded in URL`, () => __awaiter(void 0, void 0, void 0, function* () {
        // ========== Make a connection between Alice and Faber ==========
        const outOfBandRecord = yield faberAgent.oob.createInvitation({ multiUseInvitation: false });
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
        yield aliceAgent.basicMessages.sendMessage(aliceFaberConnection.id, 'hello');
        const basicMessage = yield (0, helpers_2.waitForBasicMessage)(faberAgent, {});
        expect(basicMessage.content).toBe('hello');
    }));
    test(`create and delete OOB invitation when using mediation`, () => __awaiter(void 0, void 0, void 0, function* () {
        // Alice creates an invitation: the key is notified to her mediator
        const keyAddMessagePromise = (0, rxjs_1.firstValueFrom)(mediatorAgent.events.observable(Events_1.AgentEventTypes.AgentMessageProcessed).pipe((0, rxjs_1.filter)((event) => event.payload.message.type === routing_1.KeylistUpdateMessage.type.messageTypeUri), (0, rxjs_1.map)((event) => event.payload.message), (0, rxjs_1.timeout)(5000)));
        const outOfBandRecord = yield aliceAgent.oob.createInvitation({});
        const { outOfBandInvitation } = outOfBandRecord;
        const keyAddMessage = yield keyAddMessagePromise;
        expect(keyAddMessage.updates.length).toEqual(1);
        expect(keyAddMessage.updates.map((update) => ({
            action: update.action,
            recipientKey: (0, helpers_1.didKeyToVerkey)(update.recipientKey),
        }))[0]).toEqual({
            action: routing_1.KeylistUpdateAction.add,
            recipientKey: (0, helpers_1.didKeyToVerkey)(outOfBandInvitation.getServices()[0].recipientKeys[0]),
        });
        const keyRemoveMessagePromise = (0, rxjs_1.firstValueFrom)(mediatorAgent.events.observable(Events_1.AgentEventTypes.AgentMessageProcessed).pipe((0, rxjs_1.filter)((event) => event.payload.message.type === routing_1.KeylistUpdateMessage.type.messageTypeUri), (0, rxjs_1.map)((event) => event.payload.message), (0, rxjs_1.timeout)(5000)));
        yield aliceAgent.oob.deleteById(outOfBandRecord.id);
        const keyRemoveMessage = yield keyRemoveMessagePromise;
        expect(keyRemoveMessage.updates.length).toEqual(1);
        expect(keyRemoveMessage.updates.map((update) => ({
            action: update.action,
            recipientKey: (0, helpers_1.didKeyToVerkey)(update.recipientKey),
        }))[0]).toEqual({
            action: routing_1.KeylistUpdateAction.remove,
            recipientKey: (0, helpers_1.didKeyToVerkey)(outOfBandInvitation.getServices()[0].recipientKeys[0]),
        });
    }));
});
