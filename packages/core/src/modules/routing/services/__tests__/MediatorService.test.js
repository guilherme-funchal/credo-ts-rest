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
const helpers_1 = require("../../../../../tests/helpers");
const EventEmitter_1 = require("../../../../agent/EventEmitter");
const InboundMessageContext_1 = require("../../../../agent/models/InboundMessageContext");
const connections_1 = require("../../../connections");
const helpers_2 = require("../../../dids/helpers");
const messages_1 = require("../../messages");
const models_1 = require("../../models");
const repository_1 = require("../../repository");
const MediationRepository_1 = require("../../repository/MediationRepository");
const MediatorRoutingRepository_1 = require("../../repository/MediatorRoutingRepository");
const MediatorService_1 = require("../MediatorService");
jest.mock('../../repository/MediationRepository');
const MediationRepositoryMock = MediationRepository_1.MediationRepository;
jest.mock('../../repository/MediatorRoutingRepository');
const MediatorRoutingRepositoryMock = MediatorRoutingRepository_1.MediatorRoutingRepository;
jest.mock('../../../connections/services/ConnectionService');
const ConnectionServiceMock = connections_1.ConnectionService;
const mediationRepository = new MediationRepositoryMock();
const mediatorRoutingRepository = new MediatorRoutingRepositoryMock();
const connectionService = new ConnectionServiceMock();
const mockConnection = (0, helpers_1.getMockConnection)({
    state: connections_1.DidExchangeState.Completed,
});
describe('MediatorService - default config', () => {
    const agentConfig = (0, helpers_1.getAgentConfig)('MediatorService');
    const agentContext = (0, helpers_1.getAgentContext)({
        agentConfig,
    });
    const mediatorService = new MediatorService_1.MediatorService(mediationRepository, mediatorRoutingRepository, new EventEmitter_1.EventEmitter(agentConfig.agentDependencies, new rxjs_1.Subject()), agentConfig.logger, connectionService);
    describe('createGrantMediationMessage', () => {
        test('sends did:key encoded recipient keys by default', () => __awaiter(void 0, void 0, void 0, function* () {
            const mediationRecord = new repository_1.MediationRecord({
                connectionId: 'connectionId',
                role: models_1.MediationRole.Mediator,
                state: models_1.MediationState.Requested,
                threadId: 'threadId',
            });
            (0, helpers_1.mockFunction)(mediationRepository.getByConnectionId).mockResolvedValue(mediationRecord);
            (0, helpers_1.mockFunction)(mediatorRoutingRepository.findById).mockResolvedValue(new repository_1.MediatorRoutingRecord({
                routingKeys: ['8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K'],
            }));
            const { message } = yield mediatorService.createGrantMediationMessage(agentContext, mediationRecord);
            expect(message.routingKeys.length).toBe(1);
            expect((0, helpers_2.isDidKey)(message.routingKeys[0])).toBeTruthy();
        }));
    });
    describe('processKeylistUpdateRequest', () => {
        test('processes base58 encoded recipient keys', () => __awaiter(void 0, void 0, void 0, function* () {
            const mediationRecord = new repository_1.MediationRecord({
                connectionId: 'connectionId',
                role: models_1.MediationRole.Mediator,
                state: models_1.MediationState.Granted,
                threadId: 'threadId',
                recipientKeys: ['8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K'],
            });
            (0, helpers_1.mockFunction)(mediationRepository.getByConnectionId).mockResolvedValue(mediationRecord);
            const keyListUpdate = new messages_1.KeylistUpdateMessage({
                updates: [
                    {
                        action: messages_1.KeylistUpdateAction.add,
                        recipientKey: '79CXkde3j8TNuMXxPdV7nLUrT2g7JAEjH5TreyVY7GEZ',
                    },
                    {
                        action: messages_1.KeylistUpdateAction.remove,
                        recipientKey: '8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K',
                    },
                ],
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(keyListUpdate, { connection: mockConnection, agentContext });
            const response = yield mediatorService.processKeylistUpdateRequest(messageContext);
            expect(mediationRecord.recipientKeys).toEqual(['79CXkde3j8TNuMXxPdV7nLUrT2g7JAEjH5TreyVY7GEZ']);
            expect(response.updated).toEqual([
                {
                    action: messages_1.KeylistUpdateAction.add,
                    recipientKey: '79CXkde3j8TNuMXxPdV7nLUrT2g7JAEjH5TreyVY7GEZ',
                    result: messages_1.KeylistUpdateResult.Success,
                },
                {
                    action: messages_1.KeylistUpdateAction.remove,
                    recipientKey: '8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K',
                    result: messages_1.KeylistUpdateResult.Success,
                },
            ]);
        }));
    });
    test('processes did:key encoded recipient keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const mediationRecord = new repository_1.MediationRecord({
            connectionId: 'connectionId',
            role: models_1.MediationRole.Mediator,
            state: models_1.MediationState.Granted,
            threadId: 'threadId',
            recipientKeys: ['8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K'],
        });
        (0, helpers_1.mockFunction)(mediationRepository.getByConnectionId).mockResolvedValue(mediationRecord);
        const keyListUpdate = new messages_1.KeylistUpdateMessage({
            updates: [
                {
                    action: messages_1.KeylistUpdateAction.add,
                    recipientKey: 'did:key:z6MkkbTaLstV4fwr1rNf5CSxdS2rGbwxi3V5y6NnVFTZ2V1w',
                },
                {
                    action: messages_1.KeylistUpdateAction.remove,
                    recipientKey: 'did:key:z6MkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th',
                },
            ],
        });
        const messageContext = new InboundMessageContext_1.InboundMessageContext(keyListUpdate, { connection: mockConnection, agentContext });
        const response = yield mediatorService.processKeylistUpdateRequest(messageContext);
        expect(mediationRecord.recipientKeys).toEqual(['79CXkde3j8TNuMXxPdV7nLUrT2g7JAEjH5TreyVY7GEZ']);
        expect(response.updated).toEqual([
            {
                action: messages_1.KeylistUpdateAction.add,
                recipientKey: 'did:key:z6MkkbTaLstV4fwr1rNf5CSxdS2rGbwxi3V5y6NnVFTZ2V1w',
                result: messages_1.KeylistUpdateResult.Success,
            },
            {
                action: messages_1.KeylistUpdateAction.remove,
                recipientKey: 'did:key:z6MkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th',
                result: messages_1.KeylistUpdateResult.Success,
            },
        ]);
    }));
});
describe('MediatorService - useDidKeyInProtocols set to false', () => {
    const agentConfig = (0, helpers_1.getAgentConfig)('MediatorService', { useDidKeyInProtocols: false });
    const agentContext = (0, helpers_1.getAgentContext)({
        agentConfig,
    });
    const mediatorService = new MediatorService_1.MediatorService(mediationRepository, mediatorRoutingRepository, new EventEmitter_1.EventEmitter(agentConfig.agentDependencies, new rxjs_1.Subject()), agentConfig.logger, connectionService);
    describe('createGrantMediationMessage', () => {
        test('sends base58 encoded recipient keys when config is set', () => __awaiter(void 0, void 0, void 0, function* () {
            const mediationRecord = new repository_1.MediationRecord({
                connectionId: 'connectionId',
                role: models_1.MediationRole.Mediator,
                state: models_1.MediationState.Requested,
                threadId: 'threadId',
            });
            (0, helpers_1.mockFunction)(mediationRepository.getByConnectionId).mockResolvedValue(mediationRecord);
            const routingRecord = new repository_1.MediatorRoutingRecord({
                routingKeys: ['8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K'],
            });
            (0, helpers_1.mockFunction)(mediatorRoutingRepository.findById).mockResolvedValue(routingRecord);
            const { message } = yield mediatorService.createGrantMediationMessage(agentContext, mediationRecord);
            expect(message.routingKeys.length).toBe(1);
            expect((0, helpers_2.isDidKey)(message.routingKeys[0])).toBeFalsy();
        }));
    });
});
