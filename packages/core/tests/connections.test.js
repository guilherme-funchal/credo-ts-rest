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
const setupIndySdkModule_1 = require("../../indy-sdk/tests/setupIndySdkModule");
const src_1 = require("../src");
const Agent_1 = require("../src/agent/Agent");
const helpers_1 = require("../src/modules/dids/helpers");
const OutOfBandState_1 = require("../src/modules/oob/domain/OutOfBandState");
const helpers_2 = require("./helpers");
const transport_1 = require("./transport");
describe('connections', () => {
    let faberAgent;
    let aliceAgent;
    let acmeAgent;
    let mediatorAgent;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const faberAgentOptions = (0, helpers_2.getAgentOptions)('Faber Agent Connections', {
            endpoints: ['rxjs:faber'],
        }, (0, setupIndySdkModule_1.getIndySdkModules)());
        const aliceAgentOptions = (0, helpers_2.getAgentOptions)('Alice Agent Connections', {
            endpoints: ['rxjs:alice'],
        }, (0, setupIndySdkModule_1.getIndySdkModules)());
        const acmeAgentOptions = (0, helpers_2.getAgentOptions)('Acme Agent Connections', {
            endpoints: ['rxjs:acme'],
        }, (0, setupIndySdkModule_1.getIndySdkModules)());
        const mediatorAgentOptions = (0, helpers_2.getAgentOptions)('Mediator Agent Connections', {
            endpoints: ['rxjs:mediator'],
        }, Object.assign(Object.assign({}, (0, setupIndySdkModule_1.getIndySdkModules)()), { mediator: new src_1.MediatorModule({
                autoAcceptMediationRequests: true,
            }) }));
        faberAgent = new Agent_1.Agent(faberAgentOptions);
        aliceAgent = new Agent_1.Agent(aliceAgentOptions);
        acmeAgent = new Agent_1.Agent(acmeAgentOptions);
        mediatorAgent = new Agent_1.Agent(mediatorAgentOptions);
        (0, transport_1.setupSubjectTransports)([faberAgent, aliceAgent, acmeAgent, mediatorAgent]);
        yield faberAgent.initialize();
        yield aliceAgent.initialize();
        yield acmeAgent.initialize();
        yield mediatorAgent.initialize();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
        yield acmeAgent.shutdown();
        yield acmeAgent.wallet.delete();
        yield mediatorAgent.shutdown();
        yield mediatorAgent.wallet.delete();
    }));
    it('one agent should be able to send and receive a ping', () => __awaiter(void 0, void 0, void 0, function* () {
        const faberOutOfBandRecord = yield faberAgent.oob.createInvitation({
            handshakeProtocols: [src_1.HandshakeProtocol.Connections],
            multiUseInvitation: true,
        });
        const invitation = faberOutOfBandRecord.outOfBandInvitation;
        const invitationUrl = invitation.toUrl({ domain: 'https://example.com' });
        // Receive invitation with alice agent
        let { connectionRecord: aliceFaberConnection } = yield aliceAgent.oob.receiveInvitationFromUrl(invitationUrl);
        aliceFaberConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceFaberConnection.id);
        expect(aliceFaberConnection.state).toBe(src_1.DidExchangeState.Completed);
        const ping = yield aliceAgent.connections.sendPing(aliceFaberConnection.id, {});
        yield (0, helpers_2.waitForTrustPingResponseReceivedEvent)(aliceAgent, { threadId: ping.threadId });
    }));
    it('one should be able to make multiple connections using a multi use invite', () => __awaiter(void 0, void 0, void 0, function* () {
        const faberOutOfBandRecord = yield faberAgent.oob.createInvitation({
            handshakeProtocols: [src_1.HandshakeProtocol.Connections],
            multiUseInvitation: true,
        });
        const invitation = faberOutOfBandRecord.outOfBandInvitation;
        const invitationUrl = invitation.toUrl({ domain: 'https://example.com' });
        // Receive invitation first time with alice agent
        let { connectionRecord: aliceFaberConnection } = yield aliceAgent.oob.receiveInvitationFromUrl(invitationUrl);
        aliceFaberConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceFaberConnection.id);
        expect(aliceFaberConnection.state).toBe(src_1.DidExchangeState.Completed);
        // Receive invitation second time with acme agent
        let { connectionRecord: acmeFaberConnection } = yield acmeAgent.oob.receiveInvitationFromUrl(invitationUrl, {
            reuseConnection: false,
        });
        acmeFaberConnection = yield acmeAgent.connections.returnWhenIsConnected(acmeFaberConnection.id);
        expect(acmeFaberConnection.state).toBe(src_1.DidExchangeState.Completed);
        let faberAliceConnection = yield faberAgent.connections.getByThreadId(aliceFaberConnection.threadId);
        let faberAcmeConnection = yield faberAgent.connections.getByThreadId(acmeFaberConnection.threadId);
        faberAliceConnection = yield faberAgent.connections.returnWhenIsConnected(faberAliceConnection.id);
        faberAcmeConnection = yield faberAgent.connections.returnWhenIsConnected(faberAcmeConnection.id);
        expect(faberAliceConnection).toBeConnectedWith(aliceFaberConnection);
        expect(faberAcmeConnection).toBeConnectedWith(acmeFaberConnection);
        expect(faberAliceConnection.id).not.toBe(faberAcmeConnection.id);
        return expect(faberOutOfBandRecord.state).toBe(OutOfBandState_1.OutOfBandState.AwaitResponse);
    }));
    it('tag connections with multiple types and query them', () => __awaiter(void 0, void 0, void 0, function* () {
        const faberOutOfBandRecord = yield faberAgent.oob.createInvitation({
            handshakeProtocols: [src_1.HandshakeProtocol.Connections],
            multiUseInvitation: true,
        });
        const invitation = faberOutOfBandRecord.outOfBandInvitation;
        const invitationUrl = invitation.toUrl({ domain: 'https://example.com' });
        // Receive invitation first time with alice agent
        let { connectionRecord: aliceFaberConnection } = yield aliceAgent.oob.receiveInvitationFromUrl(invitationUrl);
        aliceFaberConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceFaberConnection.id);
        expect(aliceFaberConnection.state).toBe(src_1.DidExchangeState.Completed);
        // Mark connection with three different types
        aliceFaberConnection = yield aliceAgent.connections.addConnectionType(aliceFaberConnection.id, 'alice-faber-1');
        aliceFaberConnection = yield aliceAgent.connections.addConnectionType(aliceFaberConnection.id, 'alice-faber-2');
        aliceFaberConnection = yield aliceAgent.connections.addConnectionType(aliceFaberConnection.id, 'alice-faber-3');
        // Now search for them
        let connectionsFound = yield aliceAgent.connections.findAllByConnectionTypes(['alice-faber-4']);
        expect(connectionsFound).toEqual([]);
        connectionsFound = yield aliceAgent.connections.findAllByConnectionTypes(['alice-faber-1']);
        expect(connectionsFound.map((item) => item.id)).toMatchObject([aliceFaberConnection.id]);
        connectionsFound = yield aliceAgent.connections.findAllByConnectionTypes(['alice-faber-2']);
        expect(connectionsFound.map((item) => item.id)).toMatchObject([aliceFaberConnection.id]);
        connectionsFound = yield aliceAgent.connections.findAllByConnectionTypes(['alice-faber-3']);
        expect(connectionsFound.map((item) => item.id)).toMatchObject([aliceFaberConnection.id]);
        connectionsFound = yield aliceAgent.connections.findAllByConnectionTypes(['alice-faber-1', 'alice-faber-3']);
        expect(connectionsFound.map((item) => item.id)).toMatchObject([aliceFaberConnection.id]);
        connectionsFound = yield aliceAgent.connections.findAllByConnectionTypes([
            'alice-faber-1',
            'alice-faber-2',
            'alice-faber-3',
        ]);
        expect(connectionsFound.map((item) => item.id)).toMatchObject([aliceFaberConnection.id]);
        connectionsFound = yield aliceAgent.connections.findAllByConnectionTypes(['alice-faber-1', 'alice-faber-4']);
        expect(connectionsFound).toEqual([]);
    }));
    xit('should be able to make multiple connections using a multi use invite', () => __awaiter(void 0, void 0, void 0, function* () {
        const faberOutOfBandRecord = yield faberAgent.oob.createInvitation({
            handshakeProtocols: [src_1.HandshakeProtocol.Connections],
            multiUseInvitation: true,
        });
        const invitation = faberOutOfBandRecord.outOfBandInvitation;
        const invitationUrl = invitation.toUrl({ domain: 'https://example.com' });
        // Create first connection
        let { connectionRecord: aliceFaberConnection1 } = yield aliceAgent.oob.receiveInvitationFromUrl(invitationUrl);
        aliceFaberConnection1 = yield aliceAgent.connections.returnWhenIsConnected(aliceFaberConnection1.id);
        expect(aliceFaberConnection1.state).toBe(src_1.DidExchangeState.Completed);
        // Create second connection
        let { connectionRecord: aliceFaberConnection2 } = yield aliceAgent.oob.receiveInvitationFromUrl(invitationUrl, {
            reuseConnection: false,
        });
        aliceFaberConnection2 = yield aliceAgent.connections.returnWhenIsConnected(aliceFaberConnection2.id);
        expect(aliceFaberConnection2.state).toBe(src_1.DidExchangeState.Completed);
        let faberAliceConnection1 = yield faberAgent.connections.getByThreadId(aliceFaberConnection1.threadId);
        let faberAliceConnection2 = yield faberAgent.connections.getByThreadId(aliceFaberConnection2.threadId);
        faberAliceConnection1 = yield faberAgent.connections.returnWhenIsConnected(faberAliceConnection1.id);
        faberAliceConnection2 = yield faberAgent.connections.returnWhenIsConnected(faberAliceConnection2.id);
        expect(faberAliceConnection1).toBeConnectedWith(aliceFaberConnection1);
        expect(faberAliceConnection2).toBeConnectedWith(aliceFaberConnection2);
        expect(faberAliceConnection1.id).not.toBe(faberAliceConnection2.id);
        return expect(faberOutOfBandRecord.state).toBe(OutOfBandState_1.OutOfBandState.AwaitResponse);
    }));
    it('agent using mediator should be able to make multiple connections using a multi use invite', () => __awaiter(void 0, void 0, void 0, function* () {
        // Make Faber use a mediator
        const { outOfBandInvitation: mediatorOutOfBandInvitation } = yield mediatorAgent.oob.createInvitation({});
        let { connectionRecord } = yield faberAgent.oob.receiveInvitation(mediatorOutOfBandInvitation);
        connectionRecord = yield faberAgent.connections.returnWhenIsConnected(connectionRecord.id);
        yield faberAgent.mediationRecipient.provision(connectionRecord);
        yield faberAgent.mediationRecipient.initialize();
        // Create observable for event
        const keyAddMessageObservable = mediatorAgent.events
            .observable(src_1.AgentEventTypes.AgentMessageProcessed)
            .pipe((0, rxjs_1.filter)((event) => event.payload.message.type === src_1.KeylistUpdateMessage.type.messageTypeUri), (0, rxjs_1.map)((event) => event.payload.message), (0, rxjs_1.timeout)(5000));
        const keylistAddEvents = [];
        keyAddMessageObservable.subscribe((value) => {
            value.updates.forEach((update) => keylistAddEvents.push({ action: update.action, recipientKey: (0, helpers_1.didKeyToVerkey)(update.recipientKey) }));
        });
        // Now create invitations that will be mediated
        const faberOutOfBandRecord = yield faberAgent.oob.createInvitation({
            handshakeProtocols: [src_1.HandshakeProtocol.Connections],
            multiUseInvitation: true,
        });
        const invitation = faberOutOfBandRecord.outOfBandInvitation;
        const invitationUrl = invitation.toUrl({ domain: 'https://example.com' });
        // Receive invitation first time with alice agent
        let { connectionRecord: aliceFaberConnection } = yield aliceAgent.oob.receiveInvitationFromUrl(invitationUrl);
        aliceFaberConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceFaberConnection.id);
        expect(aliceFaberConnection.state).toBe(src_1.DidExchangeState.Completed);
        // Receive invitation second time with acme agent
        let { connectionRecord: acmeFaberConnection } = yield acmeAgent.oob.receiveInvitationFromUrl(invitationUrl, {
            reuseConnection: false,
        });
        acmeFaberConnection = yield acmeAgent.connections.returnWhenIsConnected(acmeFaberConnection.id);
        expect(acmeFaberConnection.state).toBe(src_1.DidExchangeState.Completed);
        let faberAliceConnection = yield faberAgent.connections.getByThreadId(aliceFaberConnection.threadId);
        let faberAcmeConnection = yield faberAgent.connections.getByThreadId(acmeFaberConnection.threadId);
        faberAliceConnection = yield faberAgent.connections.returnWhenIsConnected(faberAliceConnection.id);
        faberAcmeConnection = yield faberAgent.connections.returnWhenIsConnected(faberAcmeConnection.id);
        expect(faberAliceConnection).toBeConnectedWith(aliceFaberConnection);
        expect(faberAcmeConnection).toBeConnectedWith(acmeFaberConnection);
        expect(faberAliceConnection.id).not.toBe(faberAcmeConnection.id);
        expect(faberOutOfBandRecord.state).toBe(OutOfBandState_1.OutOfBandState.AwaitResponse);
        // Mediator should have received all new keys (the one of the invitation + the ones generated on each connection)
        expect(keylistAddEvents.length).toEqual(3);
        expect(keylistAddEvents).toEqual(expect.arrayContaining([
            {
                action: src_1.KeylistUpdateAction.add,
                recipientKey: src_1.Key.fromFingerprint(faberOutOfBandRecord.getTags().recipientKeyFingerprints[0]).publicKeyBase58,
            },
            {
                action: src_1.KeylistUpdateAction.add,
                recipientKey: (yield faberAgent.dids.resolveDidDocument(faberAliceConnection.did)).recipientKeys[0]
                    .publicKeyBase58,
            },
            {
                action: src_1.KeylistUpdateAction.add,
                recipientKey: (yield faberAgent.dids.resolveDidDocument(faberAcmeConnection.did)).recipientKeys[0]
                    .publicKeyBase58,
            },
        ]));
        for (const connection of [faberAcmeConnection, faberAliceConnection]) {
            const keyRemoveMessagePromise = (0, rxjs_1.firstValueFrom)(mediatorAgent.events.observable(src_1.AgentEventTypes.AgentMessageProcessed).pipe((0, rxjs_1.filter)((event) => event.payload.message.type === src_1.KeylistUpdateMessage.type.messageTypeUri), (0, rxjs_1.map)((event) => event.payload.message), (0, rxjs_1.timeout)(5000)));
            yield faberAgent.connections.deleteById(connection.id);
            const keyRemoveMessage = yield keyRemoveMessagePromise;
            expect(keyRemoveMessage.updates.length).toEqual(1);
            expect(keyRemoveMessage.updates.map((update) => ({
                action: update.action,
                recipientKey: (0, helpers_1.didKeyToVerkey)(update.recipientKey),
            }))[0]).toEqual({
                action: src_1.KeylistUpdateAction.remove,
                recipientKey: (yield faberAgent.dids.resolveDidDocument(connection.did)).recipientKeys[0].publicKeyBase58,
            });
        }
    }));
});
