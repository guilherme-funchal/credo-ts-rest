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
const helpers_1 = require("../../../../../../tests/helpers");
const EventEmitter_1 = require("../../../../../agent/EventEmitter");
const FeatureRegistry_1 = require("../../../../../agent/FeatureRegistry");
const MessageHandlerRegistry_1 = require("../../../../../agent/MessageHandlerRegistry");
const models_1 = require("../../../../../agent/models");
const ConsoleLogger_1 = require("../../../../../logger/ConsoleLogger");
const connections_1 = require("../../../../connections");
const DiscoverFeaturesEvents_1 = require("../../../DiscoverFeaturesEvents");
const DiscoverFeaturesModuleConfig_1 = require("../../../DiscoverFeaturesModuleConfig");
const V2DiscoverFeaturesService_1 = require("../V2DiscoverFeaturesService");
const messages_1 = require("../messages");
jest.mock('../../../../../agent/MessageHandlerRegistry');
const MessageHandlerRegistryMock = MessageHandlerRegistry_1.MessageHandlerRegistry;
const eventEmitter = new EventEmitter_1.EventEmitter(helpers_1.agentDependencies, new rxjs_1.Subject());
const featureRegistry = new FeatureRegistry_1.FeatureRegistry();
featureRegistry.register(new models_1.Protocol({ id: 'https://didcomm.org/connections/1.0' }));
featureRegistry.register(new models_1.Protocol({ id: 'https://didcomm.org/notification/1.0', roles: ['role-1', 'role-2'] }));
featureRegistry.register(new models_1.Protocol({ id: 'https://didcomm.org/issue-credential/1.0' }));
featureRegistry.register(new models_1.GoalCode({ id: 'aries.vc.1' }));
featureRegistry.register(new models_1.GoalCode({ id: 'aries.vc.2' }));
featureRegistry.register(new models_1.GoalCode({ id: 'caries.vc.3' }));
jest.mock('../../../../../logger/Logger');
const LoggerMock = ConsoleLogger_1.ConsoleLogger;
describe('V2DiscoverFeaturesService - auto accept queries', () => {
    const discoverFeaturesModuleConfig = new DiscoverFeaturesModuleConfig_1.DiscoverFeaturesModuleConfig({ autoAcceptQueries: true });
    const discoverFeaturesService = new V2DiscoverFeaturesService_1.V2DiscoverFeaturesService(featureRegistry, eventEmitter, new MessageHandlerRegistryMock(), new LoggerMock(), discoverFeaturesModuleConfig);
    describe('createDisclosure', () => {
        it('should return all items when query is *', () => __awaiter(void 0, void 0, void 0, function* () {
            const queryMessage = new messages_1.V2QueriesMessage({
                queries: [
                    { featureType: models_1.Protocol.type, match: '*' },
                    { featureType: models_1.GoalCode.type, match: '*' },
                ],
            });
            const { message } = yield discoverFeaturesService.createDisclosure({
                disclosureQueries: queryMessage.queries,
                threadId: queryMessage.threadId,
            });
            expect(message.disclosures.map((p) => p.id)).toStrictEqual([
                'https://didcomm.org/connections/1.0',
                'https://didcomm.org/notification/1.0',
                'https://didcomm.org/issue-credential/1.0',
                'aries.vc.1',
                'aries.vc.2',
                'caries.vc.3',
            ]);
        }));
        it('should return only one protocol if the query specifies a specific protocol', () => __awaiter(void 0, void 0, void 0, function* () {
            const queryMessage = new messages_1.V2QueriesMessage({
                queries: [{ featureType: 'protocol', match: 'https://didcomm.org/connections/1.0' }],
            });
            const { message } = yield discoverFeaturesService.createDisclosure({
                disclosureQueries: queryMessage.queries,
                threadId: queryMessage.threadId,
            });
            expect(message.disclosures).toEqual([{ type: 'protocol', id: 'https://didcomm.org/connections/1.0' }]);
        }));
        it('should respect a wild card at the end of the query', () => __awaiter(void 0, void 0, void 0, function* () {
            const queryMessage = new messages_1.V2QueriesMessage({
                queries: [
                    { featureType: 'protocol', match: 'https://didcomm.org/connections/*' },
                    { featureType: 'goal-code', match: 'aries*' },
                ],
            });
            const { message } = yield discoverFeaturesService.createDisclosure({
                disclosureQueries: queryMessage.queries,
                threadId: queryMessage.threadId,
            });
            expect(message.disclosures.map((p) => p.id)).toStrictEqual([
                'https://didcomm.org/connections/1.0',
                'aries.vc.1',
                'aries.vc.2',
            ]);
        }));
        it('should send an empty array if no feature matches query', () => __awaiter(void 0, void 0, void 0, function* () {
            const queryMessage = new messages_1.V2QueriesMessage({
                queries: [{ featureType: 'anything', match: 'not-supported' }],
            });
            const { message } = yield discoverFeaturesService.createDisclosure({
                disclosureQueries: queryMessage.queries,
                threadId: queryMessage.threadId,
            });
            expect(message.disclosures).toStrictEqual([]);
        }));
        it('should accept an empty queries object', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message } = yield discoverFeaturesService.createDisclosure({
                disclosureQueries: [],
                threadId: '1234',
            });
            expect(message.disclosures).toStrictEqual([]);
        }));
        it('should accept no thread Id', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message } = yield discoverFeaturesService.createDisclosure({
                disclosureQueries: [{ featureType: 'goal-code', match: 'caries*' }],
            });
            expect(message.disclosures).toEqual([
                {
                    type: 'goal-code',
                    id: 'caries.vc.3',
                },
            ]);
            expect(message.threadId).toEqual(message.id);
        }));
    });
    describe('createQuery', () => {
        it('should return a queries message with the query and comment', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message } = yield discoverFeaturesService.createQuery({
                queries: [{ featureType: 'protocol', match: '*' }],
            });
            expect(message.queries).toEqual([{ featureType: 'protocol', match: '*' }]);
        }));
        it('should accept multiple features', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message } = yield discoverFeaturesService.createQuery({
                queries: [
                    { featureType: 'protocol', match: '1' },
                    { featureType: 'anything', match: '2' },
                ],
            });
            expect(message.queries).toEqual([
                { featureType: 'protocol', match: '1' },
                { featureType: 'anything', match: '2' },
            ]);
        }));
    });
    describe('processQuery', () => {
        it('should emit event and create disclosure message', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived, eventListenerMock);
            const queryMessage = new messages_1.V2QueriesMessage({ queries: [{ featureType: 'protocol', match: '*' }] });
            const connection = (0, helpers_1.getMockConnection)({ state: connections_1.DidExchangeState.Completed });
            const messageContext = new models_1.InboundMessageContext(queryMessage, {
                agentContext: (0, helpers_1.getAgentContext)(),
                connection,
            });
            const outboundMessage = yield discoverFeaturesService.processQuery(messageContext);
            eventEmitter.off(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived, eventListenerMock);
            expect(eventListenerMock).toHaveBeenCalledWith(expect.objectContaining({
                type: DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived,
                payload: expect.objectContaining({
                    connection,
                    protocolVersion: 'v2',
                    queries: queryMessage.queries,
                    threadId: queryMessage.threadId,
                }),
            }));
            expect(outboundMessage).toBeDefined();
            expect(outboundMessage.message.disclosures.map((p) => p.id)).toStrictEqual([
                'https://didcomm.org/connections/1.0',
                'https://didcomm.org/notification/1.0',
                'https://didcomm.org/issue-credential/1.0',
            ]);
        }));
    });
    describe('processDisclosure', () => {
        it('should emit event', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.DisclosureReceived, eventListenerMock);
            const discloseMessage = new messages_1.V2DisclosuresMessage({
                features: [new models_1.Protocol({ id: 'prot1', roles: ['role1', 'role2'] }), new models_1.Protocol({ id: 'prot2' })],
                threadId: '1234',
            });
            const connection = (0, helpers_1.getMockConnection)({ state: connections_1.DidExchangeState.Completed });
            const messageContext = new models_1.InboundMessageContext(discloseMessage, {
                agentContext: (0, helpers_1.getAgentContext)(),
                connection,
            });
            yield discoverFeaturesService.processDisclosure(messageContext);
            eventEmitter.off(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.DisclosureReceived, eventListenerMock);
            expect(eventListenerMock).toHaveBeenCalledWith(expect.objectContaining({
                type: DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.DisclosureReceived,
                payload: expect.objectContaining({
                    connection,
                    protocolVersion: 'v2',
                    disclosures: [
                        { type: 'protocol', id: 'prot1', roles: ['role1', 'role2'] },
                        { type: 'protocol', id: 'prot2' },
                    ],
                    threadId: discloseMessage.threadId,
                }),
            }));
        }));
    });
});
describe('V2DiscoverFeaturesService - auto accept disabled', () => {
    const discoverFeaturesModuleConfig = new DiscoverFeaturesModuleConfig_1.DiscoverFeaturesModuleConfig({ autoAcceptQueries: false });
    const discoverFeaturesService = new V2DiscoverFeaturesService_1.V2DiscoverFeaturesService(featureRegistry, eventEmitter, new MessageHandlerRegistryMock(), new LoggerMock(), discoverFeaturesModuleConfig);
    describe('processQuery', () => {
        it('should emit event and not send any message', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived, eventListenerMock);
            const queryMessage = new messages_1.V2QueriesMessage({ queries: [{ featureType: 'protocol', match: '*' }] });
            const connection = (0, helpers_1.getMockConnection)({ state: connections_1.DidExchangeState.Completed });
            const messageContext = new models_1.InboundMessageContext(queryMessage, {
                agentContext: (0, helpers_1.getAgentContext)(),
                connection,
            });
            const outboundMessage = yield discoverFeaturesService.processQuery(messageContext);
            eventEmitter.off(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived, eventListenerMock);
            expect(eventListenerMock).toHaveBeenCalledWith(expect.objectContaining({
                type: DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived,
                payload: expect.objectContaining({
                    connection,
                    protocolVersion: 'v2',
                    queries: queryMessage.queries,
                    threadId: queryMessage.threadId,
                }),
            }));
            expect(outboundMessage).toBeUndefined();
        }));
    });
});
