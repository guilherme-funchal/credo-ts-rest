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
const setupIndySdkModule_1 = require("../../../../../indy-sdk/tests/setupIndySdkModule");
const tests_1 = require("../../../../tests");
const helpers_1 = require("../../../../tests/helpers");
const Agent_1 = require("../../../agent/Agent");
const DiscoverFeaturesEvents_1 = require("../DiscoverFeaturesEvents");
const helpers_2 = require("./helpers");
const faberAgentOptions = (0, helpers_1.getAgentOptions)('Faber Discover Features V1 E2E', {
    endpoints: ['rxjs:faber'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
const aliceAgentOptions = (0, helpers_1.getAgentOptions)('Alice Discover Features V1 E2E', {
    endpoints: ['rxjs:alice'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
describe('v1 discover features', () => {
    let faberAgent;
    let aliceAgent;
    let faberConnection;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        faberAgent = new Agent_1.Agent(faberAgentOptions);
        aliceAgent = new Agent_1.Agent(aliceAgentOptions);
        (0, tests_1.setupSubjectTransports)([faberAgent, aliceAgent]);
        yield faberAgent.initialize();
        yield aliceAgent.initialize();
        [faberConnection] = yield (0, helpers_1.makeConnection)(faberAgent, aliceAgent);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('Faber asks Alice for revocation notification protocol support', () => __awaiter(void 0, void 0, void 0, function* () {
        const faberReplay = new rxjs_1.ReplaySubject();
        const aliceReplay = new rxjs_1.ReplaySubject();
        faberAgent.events
            .observable(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.DisclosureReceived)
            .subscribe(faberReplay);
        aliceAgent.events
            .observable(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived)
            .subscribe(aliceReplay);
        yield faberAgent.discovery.queryFeatures({
            connectionId: faberConnection.id,
            protocolVersion: 'v1',
            queries: [{ featureType: 'protocol', match: 'https://didcomm.org/revocation_notification/*' }],
        });
        const query = yield (0, helpers_2.waitForQuerySubject)(aliceReplay, { timeoutMs: 10000 });
        expect(query).toMatchObject({
            protocolVersion: 'v1',
            queries: [{ featureType: 'protocol', match: 'https://didcomm.org/revocation_notification/*' }],
        });
        const disclosure = yield (0, helpers_2.waitForDisclosureSubject)(faberReplay, { timeoutMs: 10000 });
        expect(disclosure).toMatchObject({
            protocolVersion: 'v1',
            disclosures: [
                { type: 'protocol', id: 'https://didcomm.org/revocation_notification/1.0', roles: ['holder'] },
                { type: 'protocol', id: 'https://didcomm.org/revocation_notification/2.0', roles: ['holder'] },
            ],
        });
    }));
    test('Faber asks Alice for revocation notification protocol support synchronously', () => __awaiter(void 0, void 0, void 0, function* () {
        const matchingFeatures = yield faberAgent.discovery.queryFeatures({
            connectionId: faberConnection.id,
            protocolVersion: 'v1',
            queries: [{ featureType: 'protocol', match: 'https://didcomm.org/revocation_notification/*' }],
            awaitDisclosures: true,
        });
        expect(matchingFeatures).toMatchObject({
            features: [
                { type: 'protocol', id: 'https://didcomm.org/revocation_notification/1.0', roles: ['holder'] },
                { type: 'protocol', id: 'https://didcomm.org/revocation_notification/2.0', roles: ['holder'] },
            ],
        });
    }));
});
