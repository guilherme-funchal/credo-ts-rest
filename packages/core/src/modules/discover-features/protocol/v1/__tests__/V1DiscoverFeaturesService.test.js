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
const InboundMessageContext_1 = require("../../../../../agent/models/InboundMessageContext");
const ConsoleLogger_1 = require("../../../../../logger/ConsoleLogger");
const connections_1 = require("../../../../../modules/connections");
const DiscoverFeaturesEvents_1 = require("../../../DiscoverFeaturesEvents");
const DiscoverFeaturesModuleConfig_1 = require("../../../DiscoverFeaturesModuleConfig");
const V1DiscoverFeaturesService_1 = require("../V1DiscoverFeaturesService");
const messages_1 = require("../messages");
jest.mock('../../../../../agent/MessageHandlerRegistry');
const MessageHandlerRegistryMock = MessageHandlerRegistry_1.MessageHandlerRegistry;
const eventEmitter = new EventEmitter_1.EventEmitter(helpers_1.agentDependencies, new rxjs_1.Subject());
const featureRegistry = new FeatureRegistry_1.FeatureRegistry();
featureRegistry.register(new models_1.Protocol({ id: 'https://didcomm.org/connections/1.0' }));
featureRegistry.register(new models_1.Protocol({ id: 'https://didcomm.org/notification/1.0', roles: ['role-1', 'role-2'] }));
featureRegistry.register(new models_1.Protocol({ id: 'https://didcomm.org/issue-credential/1.0' }));
jest.mock('../../../../../logger/Logger');
const LoggerMock = ConsoleLogger_1.ConsoleLogger;
describe('V1DiscoverFeaturesService - auto accept queries', () => {
    const discoverFeaturesModuleConfig = new DiscoverFeaturesModuleConfig_1.DiscoverFeaturesModuleConfig({ autoAcceptQueries: true });
    const discoverFeaturesService = new V1DiscoverFeaturesService_1.V1DiscoverFeaturesService(featureRegistry, eventEmitter, new MessageHandlerRegistryMock(), new LoggerMock(), discoverFeaturesModuleConfig);
    describe('createDisclosure', () => {
        it('should return all protocols when query is *', () => __awaiter(void 0, void 0, void 0, function* () {
            const queryMessage = new messages_1.V1QueryMessage({
                query: '*',
            });
            const { message } = yield discoverFeaturesService.createDisclosure({
                disclosureQueries: [{ featureType: 'protocol', match: queryMessage.query }],
                threadId: queryMessage.threadId,
            });
            expect(message.protocols.map((p) => p.protocolId)).toStrictEqual([
                'https://didcomm.org/connections/1.0',
                'https://didcomm.org/notification/1.0',
                'https://didcomm.org/issue-credential/1.0',
            ]);
        }));
        it('should return only one protocol if the query specifies a specific protocol', () => __awaiter(void 0, void 0, void 0, function* () {
            const queryMessage = new messages_1.V1QueryMessage({
                query: 'https://didcomm.org/connections/1.0',
            });
            const { message } = yield discoverFeaturesService.createDisclosure({
                disclosureQueries: [{ featureType: 'protocol', match: queryMessage.query }],
                threadId: queryMessage.threadId,
            });
            expect(message.protocols.map((p) => p.protocolId)).toStrictEqual(['https://didcomm.org/connections/1.0']);
        }));
        it('should respect a wild card at the end of the query', () => __awaiter(void 0, void 0, void 0, function* () {
            const queryMessage = new messages_1.V1QueryMessage({
                query: 'https://didcomm.org/connections/*',
            });
            const { message } = yield discoverFeaturesService.createDisclosure({
                disclosureQueries: [{ featureType: 'protocol', match: queryMessage.query }],
                threadId: queryMessage.threadId,
            });
            expect(message.protocols.map((p) => p.protocolId)).toStrictEqual(['https://didcomm.org/connections/1.0']);
        }));
        it('should send an empty array if no feature matches query', () => __awaiter(void 0, void 0, void 0, function* () {
            const queryMessage = new messages_1.V1QueryMessage({
                query: 'not-supported',
            });
            const { message } = yield discoverFeaturesService.createDisclosure({
                disclosureQueries: [{ featureType: 'protocol', match: queryMessage.query }],
                threadId: queryMessage.threadId,
            });
            expect(message.protocols.map((p) => p.protocolId)).toStrictEqual([]);
        }));
        it('should throw error if features other than protocols are disclosed', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(discoverFeaturesService.createDisclosure({
                disclosureQueries: [
                    { featureType: 'protocol', match: '1' },
                    { featureType: 'goal-code', match: '2' },
                ],
                threadId: '1234',
            })).rejects.toThrow('Discover Features V1 only supports protocols');
        }));
        it('should throw error if no thread id is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(discoverFeaturesService.createDisclosure({
                disclosureQueries: [{ featureType: 'protocol', match: '1' }],
            })).rejects.toThrow('Thread Id is required for Discover Features V1 disclosure');
        }));
    });
    describe('createQuery', () => {
        it('should return a query message with the query and comment', () => __awaiter(void 0, void 0, void 0, function* () {
            const { message } = yield discoverFeaturesService.createQuery({
                queries: [{ featureType: 'protocol', match: '*' }],
                comment: 'Hello',
            });
            expect(message.query).toBe('*');
            expect(message.comment).toBe('Hello');
        }));
        it('should throw error if multiple features are queried', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(discoverFeaturesService.createQuery({
                queries: [
                    { featureType: 'protocol', match: '1' },
                    { featureType: 'protocol', match: '2' },
                ],
            })).rejects.toThrow('Discover Features V1 only supports a single query');
        }));
        it('should throw error if a feature other than protocol is queried', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(discoverFeaturesService.createQuery({
                queries: [{ featureType: 'goal-code', match: '1' }],
            })).rejects.toThrow('Discover Features V1 only supports querying for protocol support');
        }));
    });
    describe('processQuery', () => {
        it('should emit event and create disclosure message', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived, eventListenerMock);
            const queryMessage = new messages_1.V1QueryMessage({ query: '*' });
            const connection = (0, helpers_1.getMockConnection)({ state: connections_1.DidExchangeState.Completed });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(queryMessage, {
                agentContext: (0, helpers_1.getAgentContext)(),
                connection,
            });
            const outboundMessage = yield discoverFeaturesService.processQuery(messageContext);
            eventEmitter.off(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived, eventListenerMock);
            expect(eventListenerMock).toHaveBeenCalledWith(expect.objectContaining({
                type: DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived,
                payload: expect.objectContaining({
                    connection,
                    protocolVersion: 'v1',
                    queries: [{ featureType: 'protocol', match: queryMessage.query }],
                    threadId: queryMessage.threadId,
                }),
            }));
            expect(outboundMessage).toBeDefined();
            expect(outboundMessage.message.protocols.map((p) => p.protocolId)).toStrictEqual([
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
            const discloseMessage = new messages_1.V1DiscloseMessage({
                protocols: [{ protocolId: 'prot1', roles: ['role1', 'role2'] }, { protocolId: 'prot2' }],
                threadId: '1234',
            });
            const connection = (0, helpers_1.getMockConnection)({ state: connections_1.DidExchangeState.Completed });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(discloseMessage, {
                agentContext: (0, helpers_1.getAgentContext)(),
                connection,
            });
            yield discoverFeaturesService.processDisclosure(messageContext);
            eventEmitter.off(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.DisclosureReceived, eventListenerMock);
            expect(eventListenerMock).toHaveBeenCalledWith(expect.objectContaining({
                type: DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.DisclosureReceived,
                payload: expect.objectContaining({
                    connection,
                    protocolVersion: 'v1',
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
describe('V1DiscoverFeaturesService - auto accept disabled', () => {
    const discoverFeaturesModuleConfig = new DiscoverFeaturesModuleConfig_1.DiscoverFeaturesModuleConfig({ autoAcceptQueries: false });
    const discoverFeaturesService = new V1DiscoverFeaturesService_1.V1DiscoverFeaturesService(featureRegistry, eventEmitter, new MessageHandlerRegistry_1.MessageHandlerRegistry(), new LoggerMock(), discoverFeaturesModuleConfig);
    describe('processQuery', () => {
        it('should emit event and not send any message', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived, eventListenerMock);
            const queryMessage = new messages_1.V1QueryMessage({ query: '*' });
            const connection = (0, helpers_1.getMockConnection)({ state: connections_1.DidExchangeState.Completed });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(queryMessage, {
                agentContext: (0, helpers_1.getAgentContext)(),
                connection,
            });
            const outboundMessage = yield discoverFeaturesService.processQuery(messageContext);
            eventEmitter.off(DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived, eventListenerMock);
            expect(eventListenerMock).toHaveBeenCalledWith(expect.objectContaining({
                type: DiscoverFeaturesEvents_1.DiscoverFeaturesEventTypes.QueryReceived,
                payload: expect.objectContaining({
                    connection,
                    protocolVersion: 'v1',
                    queries: [{ featureType: 'protocol', match: queryMessage.query }],
                    threadId: queryMessage.threadId,
                }),
            }));
            expect(outboundMessage).toBeUndefined();
        }));
    });
});
