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
const setupIndySdkModule_1 = require("../../indy-sdk/tests/setupIndySdkModule");
const Agent_1 = require("../src/agent/Agent");
const connections_1 = require("../src/modules/connections");
const routing_1 = require("../src/modules/routing");
const helpers_1 = require("./helpers");
const transport_1 = require("./transport");
const faberAgentOptions = (0, helpers_1.getAgentOptions)('OOB mediation provision - Faber Agent', {
    endpoints: ['rxjs:faber'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
const aliceAgentOptions = (0, helpers_1.getAgentOptions)('OOB mediation provision - Alice Recipient Agent', {
    endpoints: ['rxjs:alice'],
}, Object.assign(Object.assign({}, (0, setupIndySdkModule_1.getIndySdkModules)()), { mediationRecipient: new routing_1.MediationRecipientModule({
        // FIXME: discover features returns that we support this protocol, but we don't support all roles
        // we should return that we only support the mediator role so we don't have to explicitly declare this
        mediatorPickupStrategy: routing_1.MediatorPickupStrategy.PickUpV1,
    }) }));
const mediatorAgentOptions = (0, helpers_1.getAgentOptions)('OOB mediation provision - Mediator Agent', {
    endpoints: ['rxjs:mediator'],
}, Object.assign(Object.assign({}, (0, setupIndySdkModule_1.getIndySdkModules)()), { mediator: new routing_1.MediatorModule({ autoAcceptMediationRequests: true }) }));
describe('out of band with mediation set up with provision method', () => {
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
    let mediatorOutOfBandInvitation;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        mediatorAgent = new Agent_1.Agent(mediatorAgentOptions);
        aliceAgent = new Agent_1.Agent(aliceAgentOptions);
        faberAgent = new Agent_1.Agent(faberAgentOptions);
        (0, transport_1.setupSubjectTransports)([mediatorAgent, aliceAgent, faberAgent]);
        yield mediatorAgent.initialize();
        yield aliceAgent.initialize();
        yield faberAgent.initialize();
        const mediationOutOfBandRecord = yield mediatorAgent.oob.createInvitation(makeConnectionConfig);
        mediatorOutOfBandInvitation = mediationOutOfBandRecord.outOfBandInvitation;
        let { connectionRecord } = yield aliceAgent.oob.receiveInvitation(mediatorOutOfBandInvitation);
        connectionRecord = yield aliceAgent.connections.returnWhenIsConnected(connectionRecord.id);
        yield aliceAgent.mediationRecipient.provision(connectionRecord);
        yield aliceAgent.mediationRecipient.initialize();
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
        // Check if mediation between Alice and Mediator has been set
        const defaultMediator = yield aliceAgent.mediationRecipient.findDefaultMediator();
        expect(defaultMediator).not.toBeNull();
        expect(defaultMediator === null || defaultMediator === void 0 ? void 0 : defaultMediator.state).toBe(routing_1.MediationState.Granted);
        // Make a connection between Alice and Faber
        const outOfBandRecord = yield faberAgent.oob.createInvitation(makeConnectionConfig);
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
        const basicMessage = yield (0, helpers_1.waitForBasicMessage)(faberAgent, {});
        expect(basicMessage.content).toBe('hello');
        // Test if we can call provision for the same out-of-band record, respectively connection
        const reusedOutOfBandRecord = yield aliceAgent.oob.findByReceivedInvitationId(mediatorOutOfBandInvitation.id);
        const [reusedAliceMediatorConnection] = reusedOutOfBandRecord
            ? yield aliceAgent.connections.findAllByOutOfBandId(reusedOutOfBandRecord.id)
            : [];
        yield aliceAgent.mediationRecipient.provision(reusedAliceMediatorConnection);
        const mediators = yield aliceAgent.mediationRecipient.getMediators();
        expect(mediators).toHaveLength(1);
    }));
});
