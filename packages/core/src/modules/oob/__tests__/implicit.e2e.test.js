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
const legacyAnonCredsSetup_1 = require("../../../../../anoncreds/tests/legacyAnonCredsSetup");
const tests_1 = require("../../../../tests");
const helpers_1 = require("../../../../tests/helpers");
const Agent_1 = require("../../../agent/Agent");
const utils_1 = require("../../../utils");
const sleep_1 = require("../../../utils/sleep");
const connections_1 = require("../../connections");
const faberAgentOptions = (0, helpers_1.getAgentOptions)('Faber Agent OOB Implicit', {
    endpoints: ['rxjs:faber'],
}, (0, legacyAnonCredsSetup_1.getLegacyAnonCredsModules)());
const aliceAgentOptions = (0, helpers_1.getAgentOptions)('Alice Agent OOB Implicit', {
    endpoints: ['rxjs:alice'],
}, (0, legacyAnonCredsSetup_1.getLegacyAnonCredsModules)());
describe('out of band implicit', () => {
    let faberAgent;
    let aliceAgent;
    let unqualifiedSubmitterDid;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        faberAgent = new Agent_1.Agent(faberAgentOptions);
        aliceAgent = new Agent_1.Agent(aliceAgentOptions);
        (0, tests_1.setupSubjectTransports)([faberAgent, aliceAgent]);
        yield faberAgent.initialize();
        yield aliceAgent.initialize();
        unqualifiedSubmitterDid = yield (0, helpers_1.importExistingIndyDidFromPrivateKey)(faberAgent, utils_1.TypedArrayEncoder.fromString(helpers_1.publicDidSeed));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const connections = yield faberAgent.connections.getAll();
        for (const connection of connections) {
            yield faberAgent.connections.deleteById(connection.id);
        }
        jest.resetAllMocks();
    }));
    test(`make a connection with ${connections_1.HandshakeProtocol.DidExchange} based on implicit OOB invitation`, () => __awaiter(void 0, void 0, void 0, function* () {
        const publicDid = yield createPublicDid(faberAgent, unqualifiedSubmitterDid, 'rxjs:faber');
        expect(publicDid.did).toBeDefined();
        let { connectionRecord: aliceFaberConnection } = yield aliceAgent.oob.receiveImplicitInvitation({
            did: publicDid.did,
            alias: 'Faber public',
            label: 'Alice',
            handshakeProtocols: [connections_1.HandshakeProtocol.DidExchange],
        });
        // Wait for a connection event in faber agent and accept the request
        let faberAliceConnection = yield (0, helpers_1.waitForConnectionRecord)(faberAgent, { state: connections_1.DidExchangeState.RequestReceived });
        yield faberAgent.connections.acceptRequest(faberAliceConnection.id);
        faberAliceConnection = yield faberAgent.connections.returnWhenIsConnected(faberAliceConnection.id);
        expect(faberAliceConnection.state).toBe(connections_1.DidExchangeState.Completed);
        // Alice should now be connected
        aliceFaberConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceFaberConnection.id);
        expect(aliceFaberConnection.state).toBe(connections_1.DidExchangeState.Completed);
        expect(aliceFaberConnection).toBeConnectedWith(faberAliceConnection);
        expect(faberAliceConnection).toBeConnectedWith(aliceFaberConnection);
        expect(faberAliceConnection.theirLabel).toBe('Alice');
        expect(aliceFaberConnection.alias).toBe('Faber public');
        expect(aliceFaberConnection.invitationDid).toBe(publicDid.did);
        // It is possible for an agent to check if it has already a connection to a certain public entity
        expect(yield aliceAgent.connections.findByInvitationDid(publicDid.did)).toEqual([aliceFaberConnection]);
    }));
    test(`make a connection with ${connections_1.HandshakeProtocol.DidExchange} based on implicit OOB invitation pointing to specific service`, () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const publicDid = yield createPublicDid(faberAgent, unqualifiedSubmitterDid, 'rxjs:faber');
        expect(publicDid.did).toBeDefined();
        const serviceDidUrl = (_a = publicDid.didDocument) === null || _a === void 0 ? void 0 : _a.didCommServices[0].id;
        let { connectionRecord: aliceFaberConnection } = yield aliceAgent.oob.receiveImplicitInvitation({
            did: serviceDidUrl,
            alias: 'Faber public',
            label: 'Alice',
            handshakeProtocols: [connections_1.HandshakeProtocol.DidExchange],
        });
        // Wait for a connection event in faber agent and accept the request
        let faberAliceConnection = yield (0, helpers_1.waitForConnectionRecord)(faberAgent, { state: connections_1.DidExchangeState.RequestReceived });
        yield faberAgent.connections.acceptRequest(faberAliceConnection.id);
        faberAliceConnection = yield faberAgent.connections.returnWhenIsConnected(faberAliceConnection.id);
        expect(faberAliceConnection.state).toBe(connections_1.DidExchangeState.Completed);
        // Alice should now be connected
        aliceFaberConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceFaberConnection.id);
        expect(aliceFaberConnection.state).toBe(connections_1.DidExchangeState.Completed);
        expect(aliceFaberConnection).toBeConnectedWith(faberAliceConnection);
        expect(faberAliceConnection).toBeConnectedWith(aliceFaberConnection);
        expect(faberAliceConnection.theirLabel).toBe('Alice');
        expect(aliceFaberConnection.alias).toBe('Faber public');
        expect(aliceFaberConnection.invitationDid).toBe(serviceDidUrl);
        // It is possible for an agent to check if it has already a connection to a certain public entity
        expect(yield aliceAgent.connections.findByInvitationDid(serviceDidUrl)).toEqual([aliceFaberConnection]);
    }));
    test(`make a connection with ${connections_1.HandshakeProtocol.Connections} based on implicit OOB invitation`, () => __awaiter(void 0, void 0, void 0, function* () {
        const publicDid = yield createPublicDid(faberAgent, unqualifiedSubmitterDid, 'rxjs:faber');
        expect(publicDid.did).toBeDefined();
        let { connectionRecord: aliceFaberConnection } = yield aliceAgent.oob.receiveImplicitInvitation({
            did: publicDid.did,
            alias: 'Faber public',
            label: 'Alice',
            handshakeProtocols: [connections_1.HandshakeProtocol.Connections],
        });
        // Wait for a connection event in faber agent and accept the request
        let faberAliceConnection = yield (0, helpers_1.waitForConnectionRecord)(faberAgent, { state: connections_1.DidExchangeState.RequestReceived });
        yield faberAgent.connections.acceptRequest(faberAliceConnection.id);
        faberAliceConnection = yield faberAgent.connections.returnWhenIsConnected(faberAliceConnection.id);
        expect(faberAliceConnection.state).toBe(connections_1.DidExchangeState.Completed);
        // Alice should now be connected
        aliceFaberConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceFaberConnection.id);
        expect(aliceFaberConnection.state).toBe(connections_1.DidExchangeState.Completed);
        expect(aliceFaberConnection).toBeConnectedWith(faberAliceConnection);
        expect(faberAliceConnection).toBeConnectedWith(aliceFaberConnection);
        expect(faberAliceConnection.theirLabel).toBe('Alice');
        expect(aliceFaberConnection.alias).toBe('Faber public');
        expect(aliceFaberConnection.invitationDid).toBe(publicDid.did);
        // It is possible for an agent to check if it has already a connection to a certain public entity
        expect(yield aliceAgent.connections.findByInvitationDid(publicDid.did)).toEqual([aliceFaberConnection]);
    }));
    test(`receive an implicit invitation using an unresolvable did`, () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(aliceAgent.oob.receiveImplicitInvitation({
            did: 'did:sov:ZSEqSci581BDZCFPa29ScB',
            alias: 'Faber public',
            label: 'Alice',
            handshakeProtocols: [connections_1.HandshakeProtocol.DidExchange],
        })).rejects.toThrowError(/Unable to resolve did/);
    }));
    test(`create two connections using the same implicit invitation`, () => __awaiter(void 0, void 0, void 0, function* () {
        const publicDid = yield createPublicDid(faberAgent, unqualifiedSubmitterDid, 'rxjs:faber');
        expect(publicDid).toBeDefined();
        let { connectionRecord: aliceFaberConnection } = yield aliceAgent.oob.receiveImplicitInvitation({
            did: publicDid.did,
            alias: 'Faber public',
            label: 'Alice',
            handshakeProtocols: [connections_1.HandshakeProtocol.Connections],
        });
        // Wait for a connection event in faber agent and accept the request
        let faberAliceConnection = yield (0, helpers_1.waitForConnectionRecord)(faberAgent, { state: connections_1.DidExchangeState.RequestReceived });
        yield faberAgent.connections.acceptRequest(faberAliceConnection.id);
        faberAliceConnection = yield faberAgent.connections.returnWhenIsConnected(faberAliceConnection.id);
        expect(faberAliceConnection.state).toBe(connections_1.DidExchangeState.Completed);
        // Alice should now be connected
        aliceFaberConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceFaberConnection.id);
        expect(aliceFaberConnection.state).toBe(connections_1.DidExchangeState.Completed);
        expect(aliceFaberConnection).toBeConnectedWith(faberAliceConnection);
        expect(faberAliceConnection).toBeConnectedWith(aliceFaberConnection);
        expect(faberAliceConnection.theirLabel).toBe('Alice');
        expect(aliceFaberConnection.alias).toBe('Faber public');
        expect(aliceFaberConnection.invitationDid).toBe(publicDid.did);
        // Repeat implicit invitation procedure
        let { connectionRecord: aliceFaberNewConnection } = yield aliceAgent.oob.receiveImplicitInvitation({
            did: publicDid.did,
            alias: 'Faber public New',
            label: 'Alice New',
            handshakeProtocols: [connections_1.HandshakeProtocol.Connections],
        });
        // Wait for a connection event in faber agent
        let faberAliceNewConnection = yield (0, helpers_1.waitForConnectionRecord)(faberAgent, { state: connections_1.DidExchangeState.RequestReceived });
        yield faberAgent.connections.acceptRequest(faberAliceNewConnection.id);
        faberAliceNewConnection = yield faberAgent.connections.returnWhenIsConnected(faberAliceNewConnection.id);
        expect(faberAliceNewConnection.state).toBe(connections_1.DidExchangeState.Completed);
        // Alice should now be connected
        aliceFaberNewConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceFaberNewConnection.id);
        expect(aliceFaberNewConnection.state).toBe(connections_1.DidExchangeState.Completed);
        expect(aliceFaberNewConnection).toBeConnectedWith(faberAliceNewConnection);
        expect(faberAliceNewConnection).toBeConnectedWith(aliceFaberNewConnection);
        expect(faberAliceNewConnection.theirLabel).toBe('Alice New');
        expect(aliceFaberNewConnection.alias).toBe('Faber public New');
        expect(aliceFaberNewConnection.invitationDid).toBe(publicDid.did);
        // Both connections will be associated to the same invitation did
        const connectionsFromFaberPublicDid = yield aliceAgent.connections.findByInvitationDid(publicDid.did);
        expect(connectionsFromFaberPublicDid).toHaveLength(2);
        expect(connectionsFromFaberPublicDid).toEqual(expect.arrayContaining([aliceFaberConnection, aliceFaberNewConnection]));
    }));
});
function createPublicDid(agent, unqualifiedSubmitterDid, endpoint) {
    return __awaiter(this, void 0, void 0, function* () {
        const createResult = yield agent.dids.create({
            method: 'indy',
            options: {
                submitterDid: `did:indy:pool:localtest:${unqualifiedSubmitterDid}`,
                alias: 'Alias',
                endpoints: {
                    endpoint,
                    types: ['DIDComm', 'did-communication', 'endpoint'],
                },
            },
        });
        yield (0, sleep_1.sleep)(1000);
        return createResult.didState;
    });
}
