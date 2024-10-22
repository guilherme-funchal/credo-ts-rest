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
const models_1 = require("../../../agent/models");
const DiscoverFeaturesEvents_1 = require("../DiscoverFeaturesEvents");
const helpers_2 = require("./helpers");
const faberAgentOptions = (0, helpers_1.getAgentOptions)('Faber Discover Features V2 E2E', {
    endpoints: ['rxjs:faber'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
const aliceAgentOptions = (0, helpers_1.getAgentOptions)('Alice Discover Features V2 E2E', {
    endpoints: ['rxjs:alice'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
describe('v2 discover features', () => {
    let faberAgent;
    let aliceAgent;
    let aliceConnection;
    let faberConnection;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        faberAgent = new Agent_1.Agent(faberAgentOptions);
        aliceAgent = new Agent_1.Agent(aliceAgentOptions);
        (0, tests_1.setupSubjectTransports)([faberAgent, aliceAgent]);
        yield faberAgent.initialize();
        yield aliceAgent.initialize();
        [faberConnection, aliceConnection] = yield (0, helpers_1.makeConnection)(faberAgent, aliceAgent);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('Faber asks Alice for issue credential protocol support', () => __awaiter(void 0, void 0, void 0, function* () {
        const faberReplay = new rxjs_1.ReplaySubject();
        const aliceReplay = new rxjs_1.ReplaySubject();
        faberAgent.discovery.config.autoAcceptQueries;
        faberAgent.events
            .observable(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.DisclosureReceived)
            .subscribe(faberReplay);
        aliceAgent.events
            .observable(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived)
            .subscribe(aliceReplay);
        yield faberAgent.discovery.queryFeatures({
            connectionId: faberConnection.id,
            protocolVersion: 'v2',
            queries: [{ featureType: 'protocol', match: 'https://didcomm.org/revocation_notification/*' }],
        });
        const query = yield (0, helpers_2.waitForQuerySubject)(aliceReplay, { timeoutMs: 10000 });
        expect(query).toMatchObject({
            protocolVersion: 'v2',
            queries: [{ featureType: 'protocol', match: 'https://didcomm.org/revocation_notification/*' }],
        });
        const disclosure = yield (0, helpers_2.waitForDisclosureSubject)(faberReplay, { timeoutMs: 10000 });
        expect(disclosure).toMatchObject({
            protocolVersion: 'v2',
            disclosures: [
                { type: 'protocol', id: 'https://didcomm.org/revocation_notification/1.0', roles: ['holder'] },
                { type: 'protocol', id: 'https://didcomm.org/revocation_notification/2.0', roles: ['holder'] },
            ],
        });
    }));
    test('Faber defines a supported goal code and Alice queries', () => __awaiter(void 0, void 0, void 0, function* () {
        const faberReplay = new rxjs_1.ReplaySubject();
        const aliceReplay = new rxjs_1.ReplaySubject();
        aliceAgent.events
            .observable(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.DisclosureReceived)
            .subscribe(aliceReplay);
        faberAgent.events
            .observable(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived)
            .subscribe(faberReplay);
        // Register some goal codes
        faberAgent.features.register(new models_1.GoalCode({ id: 'faber.vc.issuance' }), new models_1.GoalCode({ id: 'faber.vc.query' }));
        yield aliceAgent.discovery.queryFeatures({
            connectionId: aliceConnection.id,
            protocolVersion: 'v2',
            queries: [{ featureType: 'goal-code', match: '*' }],
        });
        const query = yield (0, helpers_2.waitForQuerySubject)(faberReplay, { timeoutMs: 10000 });
        expect(query).toMatchObject({
            protocolVersion: 'v2',
            queries: [{ featureType: 'goal-code', match: '*' }],
        });
        const disclosure = yield (0, helpers_2.waitForDisclosureSubject)(aliceReplay, { timeoutMs: 10000 });
        expect(disclosure).toMatchObject({
            protocolVersion: 'v2',
            disclosures: [
                { type: 'goal-code', id: 'faber.vc.issuance' },
                { type: 'goal-code', id: 'faber.vc.query' },
            ],
        });
    }));
    test('Faber defines a custom feature and Alice queries', () => __awaiter(void 0, void 0, void 0, function* () {
        const faberReplay = new rxjs_1.ReplaySubject();
        const aliceReplay = new rxjs_1.ReplaySubject();
        aliceAgent.events
            .observable(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.DisclosureReceived)
            .subscribe(aliceReplay);
        faberAgent.events
            .observable(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived)
            .subscribe(faberReplay);
        // Define a custom feature type
        class GenericFeature extends models_1.Feature {
            constructor(options) {
                super({ id: options.id, type: 'generic' });
                this['generic-field'] = options.genericField;
            }
        }
        // Register a custom feature
        faberAgent.features.register(new GenericFeature({ id: 'custom-feature', genericField: 'custom-field' }));
        yield aliceAgent.discovery.queryFeatures({
            connectionId: aliceConnection.id,
            protocolVersion: 'v2',
            queries: [{ featureType: 'generic', match: 'custom-feature' }],
        });
        const query = yield (0, helpers_2.waitForQuerySubject)(faberReplay, { timeoutMs: 10000 });
        expect(query).toMatchObject({
            protocolVersion: 'v2',
            queries: [{ featureType: 'generic', match: 'custom-feature' }],
        });
        const disclosure = yield (0, helpers_2.waitForDisclosureSubject)(aliceReplay, { timeoutMs: 10000 });
        expect(disclosure).toMatchObject({
            protocolVersion: 'v2',
            disclosures: [
                {
                    type: 'generic',
                    id: 'custom-feature',
                    'generic-field': 'custom-field',
                },
            ],
        });
    }));
    test('Faber proactively sends a set of features to Alice', () => __awaiter(void 0, void 0, void 0, function* () {
        const faberReplay = new rxjs_1.ReplaySubject();
        const aliceReplay = new rxjs_1.ReplaySubject();
        aliceAgent.events
            .observable(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.DisclosureReceived)
            .subscribe(aliceReplay);
        faberAgent.events
            .observable(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived)
            .subscribe(faberReplay);
        // Register a custom feature
        faberAgent.features.register(new models_1.Feature({ id: 'AIP2.0', type: 'aip' }), new models_1.Feature({ id: 'AIP2.0/INDYCRED', type: 'aip' }), new models_1.Feature({ id: 'AIP2.0/MEDIATE', type: 'aip' }));
        yield faberAgent.discovery.discloseFeatures({
            connectionId: faberConnection.id,
            protocolVersion: 'v2',
            disclosureQueries: [{ featureType: 'aip', match: '*' }],
        });
        const disclosure = yield (0, helpers_2.waitForDisclosureSubject)(aliceReplay, { timeoutMs: 10000 });
        expect(disclosure).toMatchObject({
            protocolVersion: 'v2',
            disclosures: [
                { type: 'aip', id: 'AIP2.0' },
                { type: 'aip', id: 'AIP2.0/INDYCRED' },
                { type: 'aip', id: 'AIP2.0/MEDIATE' },
            ],
        });
    }));
    test('Faber asks Alice for issue credential protocol support synchronously', () => __awaiter(void 0, void 0, void 0, function* () {
        const matchingFeatures = yield faberAgent.discovery.queryFeatures({
            connectionId: faberConnection.id,
            protocolVersion: 'v2',
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
