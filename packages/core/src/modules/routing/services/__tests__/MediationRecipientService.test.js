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
const helpers_1 = require("../../../../../tests/helpers");
const EventEmitter_1 = require("../../../../agent/EventEmitter");
const MessageSender_1 = require("../../../../agent/MessageSender");
const InboundMessageContext_1 = require("../../../../agent/models/InboundMessageContext");
const crypto_1 = require("../../../../crypto");
const uuid_1 = require("../../../../utils/uuid");
const connections_1 = require("../../../connections");
const ConnectionMetadataTypes_1 = require("../../../connections/repository/ConnectionMetadataTypes");
const ConnectionRepository_1 = require("../../../connections/repository/ConnectionRepository");
const ConnectionService_1 = require("../../../connections/services/ConnectionService");
const DidRepository_1 = require("../../../dids/repository/DidRepository");
const RoutingEvents_1 = require("../../RoutingEvents");
const messages_1 = require("../../messages");
const models_1 = require("../../models");
const MediationRecord_1 = require("../../repository/MediationRecord");
const MediationRepository_1 = require("../../repository/MediationRepository");
const MediationRecipientService_1 = require("../MediationRecipientService");
jest.mock('../../repository/MediationRepository');
const MediationRepositoryMock = MediationRepository_1.MediationRepository;
jest.mock('../../../connections/repository/ConnectionRepository');
const ConnectionRepositoryMock = ConnectionRepository_1.ConnectionRepository;
jest.mock('../../../dids/repository/DidRepository');
const DidRepositoryMock = DidRepository_1.DidRepository;
jest.mock('../../../../agent/EventEmitter');
const EventEmitterMock = EventEmitter_1.EventEmitter;
jest.mock('../../../../agent/MessageSender');
const MessageSenderMock = MessageSender_1.MessageSender;
const connectionImageUrl = 'https://example.com/image.png';
describe('MediationRecipientService', () => {
    const config = (0, helpers_1.getAgentConfig)('MediationRecipientServiceTest', {
        endpoints: ['http://agent.com:8080'],
        connectionImageUrl,
    });
    let mediationRepository;
    let didRepository;
    let eventEmitter;
    let connectionService;
    let connectionRepository;
    let messageSender;
    let mediationRecipientService;
    let mediationRecord;
    let agentContext;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agentContext = (0, helpers_1.getAgentContext)({
            agentConfig: config,
        });
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        eventEmitter = new EventEmitterMock();
        connectionRepository = new ConnectionRepositoryMock();
        didRepository = new DidRepositoryMock();
        connectionService = new ConnectionService_1.ConnectionService(config.logger, connectionRepository, didRepository, eventEmitter);
        mediationRepository = new MediationRepositoryMock();
        messageSender = new MessageSenderMock();
        // Mock default return value
        mediationRecord = new MediationRecord_1.MediationRecord({
            connectionId: 'connectionId',
            role: models_1.MediationRole.Recipient,
            state: models_1.MediationState.Granted,
            threadId: 'threadId',
        });
        (0, helpers_1.mockFunction)(mediationRepository.getByConnectionId).mockResolvedValue(mediationRecord);
        mediationRecipientService = new MediationRecipientService_1.MediationRecipientService(connectionService, messageSender, mediationRepository, eventEmitter);
    }));
    describe('processMediationGrant', () => {
        test('should process base58 encoded routing keys', () => __awaiter(void 0, void 0, void 0, function* () {
            mediationRecord.state = models_1.MediationState.Requested;
            const mediationGrant = new messages_1.MediationGrantMessage({
                endpoint: 'http://agent.com:8080',
                routingKeys: ['79CXkde3j8TNuMXxPdV7nLUrT2g7JAEjH5TreyVY7GEZ'],
                threadId: 'threadId',
            });
            const connection = (0, helpers_1.getMockConnection)({
                state: connections_1.DidExchangeState.Completed,
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(mediationGrant, { connection, agentContext });
            yield mediationRecipientService.processMediationGrant(messageContext);
            expect(connection.metadata.get(ConnectionMetadataTypes_1.ConnectionMetadataKeys.UseDidKeysForProtocol)).toEqual({
                'https://didcomm.org/coordinate-mediation/1.0': false,
            });
            expect(mediationRecord.routingKeys).toEqual(['79CXkde3j8TNuMXxPdV7nLUrT2g7JAEjH5TreyVY7GEZ']);
        }));
        test('should process did:key encoded routing keys', () => __awaiter(void 0, void 0, void 0, function* () {
            mediationRecord.state = models_1.MediationState.Requested;
            const mediationGrant = new messages_1.MediationGrantMessage({
                endpoint: 'http://agent.com:8080',
                routingKeys: ['did:key:z6MkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th'],
                threadId: 'threadId',
            });
            const connection = (0, helpers_1.getMockConnection)({
                state: connections_1.DidExchangeState.Completed,
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(mediationGrant, { connection, agentContext });
            yield mediationRecipientService.processMediationGrant(messageContext);
            expect(connection.metadata.get(ConnectionMetadataTypes_1.ConnectionMetadataKeys.UseDidKeysForProtocol)).toEqual({
                'https://didcomm.org/coordinate-mediation/1.0': true,
            });
            expect(mediationRecord.routingKeys).toEqual(['8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K']);
        }));
    });
    describe('processKeylistUpdateResults', () => {
        it('it stores did:key-encoded keys in base58 format', () => __awaiter(void 0, void 0, void 0, function* () {
            const spyAddRecipientKey = jest.spyOn(mediationRecord, 'addRecipientKey');
            const connection = (0, helpers_1.getMockConnection)({
                state: connections_1.DidExchangeState.Completed,
            });
            const keylist = [
                {
                    result: messages_1.KeylistUpdateResult.Success,
                    recipientKey: 'did:key:z6MkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th',
                    action: messages_1.KeylistUpdateAction.add,
                },
            ];
            const keyListUpdateResponse = new messages_1.KeylistUpdateResponseMessage({
                threadId: (0, uuid_1.uuid)(),
                keylist,
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(keyListUpdateResponse, { connection, agentContext });
            expect(connection.metadata.get(ConnectionMetadataTypes_1.ConnectionMetadataKeys.UseDidKeysForProtocol)).toBeNull();
            yield mediationRecipientService.processKeylistUpdateResults(messageContext);
            expect(connection.metadata.get(ConnectionMetadataTypes_1.ConnectionMetadataKeys.UseDidKeysForProtocol)).toEqual({
                'https://didcomm.org/coordinate-mediation/1.0': true,
            });
            expect(eventEmitter.emit).toHaveBeenCalledWith(agentContext, {
                type: RoutingEvents_1.RoutingEventTypes.RecipientKeylistUpdated,
                payload: {
                    mediationRecord,
                    keylist,
                },
            });
            expect(spyAddRecipientKey).toHaveBeenCalledWith('8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K');
            spyAddRecipientKey.mockClear();
        }));
    });
    describe('addMediationRouting', () => {
        const routingKey = crypto_1.Key.fromFingerprint('z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL');
        const recipientKey = crypto_1.Key.fromFingerprint('z6MkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th');
        const routing = {
            routingKeys: [routingKey],
            recipientKey,
            endpoints: [],
        };
        const mediationRecord = new MediationRecord_1.MediationRecord({
            connectionId: 'connection-id',
            role: models_1.MediationRole.Recipient,
            state: models_1.MediationState.Granted,
            threadId: 'thread-id',
            endpoint: 'https://a-mediator-endpoint.com',
            routingKeys: [routingKey.publicKeyBase58],
        });
        beforeEach(() => {
            jest.spyOn(mediationRecipientService, 'keylistUpdateAndAwait').mockResolvedValue(mediationRecord);
        });
        test('adds mediation routing id mediator id is passed', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(mediationRepository.getById).mockResolvedValue(mediationRecord);
            const extendedRouting = yield mediationRecipientService.addMediationRouting(agentContext, routing, {
                mediatorId: 'mediator-id',
            });
            expect(extendedRouting).toMatchObject({
                endpoints: ['https://a-mediator-endpoint.com'],
                routingKeys: [routingKey],
            });
            expect(mediationRepository.getById).toHaveBeenCalledWith(agentContext, 'mediator-id');
        }));
        test('adds mediation routing if useDefaultMediator is true and default mediation is found', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(mediationRepository.findSingleByQuery).mockResolvedValue(mediationRecord);
            jest.spyOn(mediationRecipientService, 'keylistUpdateAndAwait').mockResolvedValue(mediationRecord);
            const extendedRouting = yield mediationRecipientService.addMediationRouting(agentContext, routing, {
                useDefaultMediator: true,
            });
            expect(extendedRouting).toMatchObject({
                endpoints: ['https://a-mediator-endpoint.com'],
                routingKeys: [routingKey],
            });
            expect(mediationRepository.findSingleByQuery).toHaveBeenCalledWith(agentContext, { default: true });
        }));
        test('does not add mediation routing if no mediation is found', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(mediationRepository.findSingleByQuery).mockResolvedValue(mediationRecord);
            jest.spyOn(mediationRecipientService, 'keylistUpdateAndAwait').mockResolvedValue(mediationRecord);
            const extendedRouting = yield mediationRecipientService.addMediationRouting(agentContext, routing, {
                useDefaultMediator: false,
            });
            expect(extendedRouting).toMatchObject(routing);
            expect(mediationRepository.findSingleByQuery).not.toHaveBeenCalled();
            expect(mediationRepository.getById).not.toHaveBeenCalled();
        }));
    });
});
