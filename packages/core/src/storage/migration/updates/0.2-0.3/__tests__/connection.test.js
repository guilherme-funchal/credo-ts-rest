"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const helpers_1 = require("../../../../../../tests/helpers");
const Agent_1 = require("../../../../../agent/Agent");
const connections_1 = require("../../../../../modules/connections");
const routing_1 = require("../../../../../modules/routing");
const utils_1 = require("../../../../../utils");
const testModule = __importStar(require("../connection"));
const agentConfig = (0, helpers_1.getAgentConfig)('Migration ConnectionRecord 0.2-0.3');
const agentContext = (0, helpers_1.getAgentContext)();
jest.mock('../../../../../modules/connections/repository/ConnectionRepository');
const ConnectionRepositoryMock = connections_1.ConnectionRepository;
const connectionRepository = new ConnectionRepositoryMock();
jest.mock('../../../../../modules/routing/repository/MediationRepository');
const MediationRepositoryMock = routing_1.MediationRepository;
const mediationRepository = new MediationRepositoryMock();
jest.mock('../../../../../agent/Agent', () => {
    return {
        Agent: jest.fn(() => ({
            config: agentConfig,
            context: agentContext,
            dependencyManager: {
                resolve: jest.fn((token) => (token === ConnectionRepositoryMock ? connectionRepository : mediationRepository)),
            },
        })),
    };
});
const AgentMock = Agent_1.Agent;
describe('0.2-0.3 | Connection', () => {
    let agent;
    beforeEach(() => {
        agent = AgentMock();
    });
    describe('migrateConnectionRecordToV0_3', () => {
        it('should fetch all records and apply the needed updates', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionRecordsProps = [
                getConnection({
                    state: connections_1.DidExchangeState.Completed,
                    role: connections_1.DidExchangeRole.Responder,
                    id: 'theConnectionId',
                }),
                getConnection({
                    state: connections_1.DidExchangeState.Completed,
                    role: connections_1.DidExchangeRole.Responder,
                    id: 'theConnectionId2',
                }),
            ];
            const mediationRecordsProps = [
                getMediator({
                    state: routing_1.MediationState.Granted,
                    role: routing_1.MediationRole.Recipient,
                    connectionId: 'theConnectionId',
                    threadId: 'theThreadId',
                }),
            ];
            const connectionRecords = connectionRecordsProps;
            (0, helpers_1.mockFunction)(connectionRepository.getAll).mockResolvedValue(connectionRecords);
            const mediationRecords = mediationRecordsProps;
            (0, helpers_1.mockFunction)(mediationRepository.getAll).mockResolvedValue(mediationRecords);
            yield testModule.migrateConnectionRecordToV0_3(agent);
            expect(connectionRepository.getAll).toBeCalledTimes(1);
            expect(mediationRepository.getAll).toBeCalledTimes(1);
            expect(connectionRepository.update).toBeCalledTimes(connectionRecords.length);
        }));
    });
    describe('migrateConnectionRecordMediatorTags', () => {
        it('should set the mediator connection type on the record, connection type tags should be undefined', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionRecordProps = {
                state: connections_1.DidExchangeState.Completed,
                role: connections_1.DidExchangeRole.Responder,
                id: 'theConnectionId',
            };
            const connectionRecord = getConnection(connectionRecordProps);
            yield testModule.migrateConnectionRecordTags(agent, connectionRecord, new Set(['theConnectionId']));
            expect(connectionRecord.toJSON()).toEqual(Object.assign(Object.assign({}, connectionRecordProps), { connectionTypes: [connections_1.ConnectionType.Mediator], _tags: {
                    connectionType: undefined,
                }, metadata: {} }));
        }));
        it('should add the mediator connection type to existing types on the record, connection type tags should be undefined', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionRecordProps = {
                state: connections_1.DidExchangeState.Completed,
                role: connections_1.DidExchangeRole.Responder,
                id: 'theConnectionId',
                _tags: {
                    connectionType: ['theConnectionType'],
                },
            };
            const connectionRecord = getConnection(connectionRecordProps);
            yield testModule.migrateConnectionRecordTags(agent, connectionRecord, new Set(['theConnectionId']));
            expect(connectionRecord.toJSON()).toEqual(Object.assign(Object.assign({}, connectionRecordProps), { connectionTypes: ['theConnectionType', connections_1.ConnectionType.Mediator], _tags: {
                    connectionType: undefined,
                }, metadata: {} }));
        }));
        it('should not set the mediator connection type on the record, connection type tags should be undefined', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionRecordProps = {
                state: connections_1.DidExchangeState.Completed,
                role: connections_1.DidExchangeRole.Responder,
                id: 'theConnectionId',
            };
            const connectionRecord = getConnection(connectionRecordProps);
            yield testModule.migrateConnectionRecordTags(agent, connectionRecord);
            expect(connectionRecord.toJSON()).toEqual(Object.assign(Object.assign({}, connectionRecordProps), { connectionTypes: [], _tags: {
                    connectionType: undefined,
                }, metadata: {} }));
        }));
        it('should not add the mediator connection type to existing types on the record, connection type tags should be undefined', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionRecordProps = {
                state: connections_1.DidExchangeState.Completed,
                role: connections_1.DidExchangeRole.Responder,
                id: 'theConnectionId',
                _tags: {
                    connectionType: ['theConnectionType'],
                },
            };
            const connectionRecord = getConnection(connectionRecordProps);
            yield testModule.migrateConnectionRecordTags(agent, connectionRecord);
            expect(connectionRecord.toJSON()).toEqual(Object.assign(Object.assign({}, connectionRecordProps), { connectionTypes: ['theConnectionType'], _tags: {
                    connectionType: undefined,
                }, metadata: {} }));
        }));
    });
});
function getConnection({ state, role, id, _tags }) {
    return utils_1.JsonTransformer.fromJSON({ state, role, id, _tags }, connections_1.ConnectionRecord);
}
function getMediator({ state, role, connectionId, threadId }) {
    return utils_1.JsonTransformer.fromJSON({ state, role, connectionId, threadId }, routing_1.MediationRecord);
}
