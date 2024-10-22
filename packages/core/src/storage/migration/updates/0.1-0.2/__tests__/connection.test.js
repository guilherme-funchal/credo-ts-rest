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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../../../../../../tests/helpers");
const Agent_1 = require("../../../../../agent/Agent");
const connections_1 = require("../../../../../modules/connections");
const ConnectionRepository_1 = require("../../../../../modules/connections/repository/ConnectionRepository");
const DidDocumentRole_1 = require("../../../../../modules/dids/domain/DidDocumentRole");
const repository_1 = require("../../../../../modules/dids/repository");
const DidRepository_1 = require("../../../../../modules/dids/repository/DidRepository");
const OutOfBandRole_1 = require("../../../../../modules/oob/domain/OutOfBandRole");
const OutOfBandState_1 = require("../../../../../modules/oob/domain/OutOfBandState");
const repository_2 = require("../../../../../modules/oob/repository");
const OutOfBandRepository_1 = require("../../../../../modules/oob/repository/OutOfBandRepository");
const utils_1 = require("../../../../../utils");
const testModule = __importStar(require("../connection"));
const didPeer4kgVt6CidfKgo1MoWMqsQX_json_1 = __importDefault(require("./__fixtures__/didPeer4kgVt6CidfKgo1MoWMqsQX.json"));
const didPeerR1xKJw17sUoXhejEpugMYJ_json_1 = __importDefault(require("./__fixtures__/didPeerR1xKJw17sUoXhejEpugMYJ.json"));
const legacyDidPeer4kgVt6CidfKgo1MoWMqsQX_json_1 = __importDefault(require("./__fixtures__/legacyDidPeer4kgVt6CidfKgo1MoWMqsQX.json"));
const legacyDidPeerR1xKJw17sUoXhejEpugMYJ_json_1 = __importDefault(require("./__fixtures__/legacyDidPeerR1xKJw17sUoXhejEpugMYJ.json"));
const agentConfig = (0, helpers_1.getAgentConfig)('Migration ConnectionRecord 0.1-0.2');
const agentContext = (0, helpers_1.getAgentContext)();
jest.mock('../../../../../modules/connections/repository/ConnectionRepository');
const ConnectionRepositoryMock = ConnectionRepository_1.ConnectionRepository;
const connectionRepository = new ConnectionRepositoryMock();
jest.mock('../../../../../modules/dids/repository/DidRepository');
const DidRepositoryMock = DidRepository_1.DidRepository;
const didRepository = new DidRepositoryMock();
jest.mock('../../../../../modules/oob/repository/OutOfBandRepository');
const OutOfBandRepositoryMock = OutOfBandRepository_1.OutOfBandRepository;
const outOfBandRepository = new OutOfBandRepositoryMock();
jest.mock('../../../../../agent/Agent', () => {
    return {
        Agent: jest.fn(() => ({
            config: agentConfig,
            context: agentContext,
            dependencyManager: {
                resolve: jest.fn((cls) => {
                    if (cls === ConnectionRepository_1.ConnectionRepository) {
                        return connectionRepository;
                    }
                    else if (cls === DidRepository_1.DidRepository) {
                        return didRepository;
                    }
                    else if (cls === OutOfBandRepository_1.OutOfBandRepository) {
                        return outOfBandRepository;
                    }
                    throw new Error(`No instance found for ${cls}`);
                }),
            },
        })),
    };
});
const connectionJson = {
    role: 'inviter',
    state: 'invited',
    did: legacyDidPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id,
    didDoc: legacyDidPeerR1xKJw17sUoXhejEpugMYJ_json_1.default,
    theirDid: legacyDidPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default.id,
    theirDidDoc: legacyDidPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default,
    invitation: {
        '@type': 'https://didcomm.org/connections/1.0/invitation',
        '@id': '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
        recipientKeys: ['E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu'],
        serviceEndpoint: 'https://example.com',
        label: 'test',
    },
    createdAt: '2020-04-08T15:51:43.819Z',
};
const connectionJsonNewDidStateRole = {
    role: 'responder',
    state: 'invitation-sent',
    did: didPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id,
    theirDid: didPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default.id,
    invitation: {
        '@type': 'https://didcomm.org/connections/1.0/invitation',
        '@id': '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
        recipientKeys: ['E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu'],
        serviceEndpoint: 'https://example.com',
        label: 'test',
    },
    createdAt: '2020-04-08T15:51:43.819Z',
    autoAcceptConnection: true,
    multiUseInvitation: false,
    mediatorId: 'a-mediator-id',
};
// Mock typed object
const AgentMock = Agent_1.Agent;
describe('0.1-0.2 | Connection', () => {
    let agent;
    beforeEach(() => {
        agent = new AgentMock();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('migrateCredentialRecordToV0_2()', () => {
        it('should fetch all records and apply the needed updates', () => __awaiter(void 0, void 0, void 0, function* () {
            const input = utils_1.JsonTransformer.fromJSON(connectionJson, connections_1.ConnectionRecord);
            const records = [input];
            (0, helpers_1.mockFunction)(connectionRepository.getAll).mockResolvedValue(records);
            // Not records exist yet
            (0, helpers_1.mockFunction)(outOfBandRepository.findByQuery).mockResolvedValue([]);
            (0, helpers_1.mockFunction)(didRepository.findById).mockResolvedValue(null);
            yield testModule.migrateConnectionRecordToV0_2(agent);
            expect(connectionRepository.getAll).toHaveBeenCalledTimes(1);
            expect(connectionRepository.update).toHaveBeenCalledTimes(records.length);
            const [[, updatedConnectionRecord]] = (0, helpers_1.mockFunction)(connectionRepository.update).mock.calls;
            // Check first object is transformed correctly.
            //  - removed invitation, theirDidDoc, didDoc
            //  - Added invitationDid
            //  - Updated did, theirDid
            expect(updatedConnectionRecord.toJSON()).toEqual({
                _tags: {},
                metadata: {},
                createdAt: '2020-04-08T15:51:43.819Z',
                role: 'responder',
                state: 'invitation-sent',
                did: didPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id,
                invitationDid: 'did:peer:2.SeyJzIjoiaHR0cHM6Ly9leGFtcGxlLmNvbSIsInQiOiJkaWQtY29tbXVuaWNhdGlvbiIsInByaW9yaXR5IjowLCJyZWNpcGllbnRLZXlzIjpbImRpZDprZXk6ejZNa3NZVTRNSHRmbU5oTm0xdUdNdkFOcjlqNENCdjJGeW1qaUp0UmdBMzZiU1ZII3o2TWtzWVU0TUh0Zm1OaE5tMXVHTXZBTnI5ajRDQnYyRnltamlKdFJnQTM2YlNWSCJdfQ',
                theirDid: didPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default.id,
                outOfBandId: expect.any(String),
                connectionTypes: [],
            });
        }));
    });
    describe('updateConnectionRoleAndState', () => {
        it('should update the connection role and state to did exchange values', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionRecord = utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, connectionJson), { state: 'requested', role: 'invitee' }), connections_1.ConnectionRecord);
            yield testModule.updateConnectionRoleAndState(agent, connectionRecord);
            expect(connectionRecord.toJSON()).toEqual({
                _tags: {},
                metadata: {},
                createdAt: '2020-04-08T15:51:43.819Z',
                role: 'requester',
                state: 'request-sent',
                did: legacyDidPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id,
                didDoc: legacyDidPeerR1xKJw17sUoXhejEpugMYJ_json_1.default,
                theirDid: legacyDidPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default.id,
                theirDidDoc: legacyDidPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default,
                invitation: {
                    '@type': 'https://didcomm.org/connections/1.0/invitation',
                    '@id': '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                    recipientKeys: ['E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu'],
                    serviceEndpoint: 'https://example.com',
                    label: 'test',
                },
                connectionTypes: [],
            });
        }));
    });
    describe('extractDidDocument', () => {
        it('should extract the did document from the connection record and update the did to a did:peer did', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionRecord = utils_1.JsonTransformer.fromJSON(connectionJson, connections_1.ConnectionRecord);
            // No did record exists yet
            (0, helpers_1.mockFunction)(didRepository.findById).mockResolvedValue(null);
            yield testModule.extractDidDocument(agent, connectionRecord);
            expect(connectionRecord.toJSON()).toEqual({
                _tags: {},
                metadata: {},
                createdAt: '2020-04-08T15:51:43.819Z',
                role: 'inviter',
                state: 'invited',
                did: didPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id,
                theirDid: didPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default.id,
                invitation: {
                    '@type': 'https://didcomm.org/connections/1.0/invitation',
                    '@id': '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                    recipientKeys: ['E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu'],
                    serviceEndpoint: 'https://example.com',
                    label: 'test',
                },
                connectionTypes: [],
            });
        }));
        it('should create a DidRecord for didDoc and theirDidDoc', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionRecord = utils_1.JsonTransformer.fromJSON(connectionJson, connections_1.ConnectionRecord);
            // No did record exists yet
            (0, helpers_1.mockFunction)(didRepository.findById).mockResolvedValue(null);
            yield testModule.extractDidDocument(agent, connectionRecord);
            expect(didRepository.save).toHaveBeenCalledTimes(2);
            const [[, didRecord], [, theirDidRecord]] = (0, helpers_1.mockFunction)(didRepository.save).mock.calls;
            expect(didRecord.toJSON()).toMatchObject({
                id: didPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id,
                role: DidDocumentRole_1.DidDocumentRole.Created,
                didDocument: didPeerR1xKJw17sUoXhejEpugMYJ_json_1.default,
                createdAt: connectionRecord.createdAt.toISOString(),
                metadata: {
                    '_internal/legacyDid': {
                        unqualifiedDid: legacyDidPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id,
                        didDocumentString: JSON.stringify(legacyDidPeerR1xKJw17sUoXhejEpugMYJ_json_1.default),
                    },
                },
                _tags: {
                    recipientKeyFingerprints: [
                        'z6MksYU4MHtfmNhNm1uGMvANr9j4CBv2FymjiJtRgA36bSVH',
                        'z6MksYU4MHtfmNhNm1uGMvANr9j4CBv2FymjiJtRgA36bSVH',
                    ],
                },
            });
            expect(theirDidRecord.toJSON()).toMatchObject({
                id: didPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default.id,
                role: DidDocumentRole_1.DidDocumentRole.Received,
                didDocument: didPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default,
                createdAt: connectionRecord.createdAt.toISOString(),
                metadata: {
                    '_internal/legacyDid': {
                        unqualifiedDid: legacyDidPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default.id,
                        didDocumentString: JSON.stringify(legacyDidPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default),
                    },
                },
                _tags: {
                    recipientKeyFingerprints: [
                        'z6MkjKUBV9DDUj7cgW8UbDJZhPcHCH8up26Lrr8YqkAS4wcb',
                        'z6MkjKUBV9DDUj7cgW8UbDJZhPcHCH8up26Lrr8YqkAS4wcb',
                    ],
                },
            });
        }));
        it('should not extract the did document if it does not exist on the connection record', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionRecord = utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, connectionJson), { didDoc: undefined, theirDidDoc: undefined }), connections_1.ConnectionRecord);
            yield testModule.extractDidDocument(agent, connectionRecord);
            expect(didRepository.findById).not.toHaveBeenCalled();
            expect(didRepository.save).not.toHaveBeenCalled();
            // Should be the same as the input
            expect(connectionRecord.toJSON()).toEqual(Object.assign(Object.assign({}, connectionJson), { didDoc: undefined, theirDidDoc: undefined, metadata: {}, _tags: {}, connectionTypes: [] }));
        }));
        it('should not create a did record if a did record for the did already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionRecord = utils_1.JsonTransformer.fromJSON(connectionJson, connections_1.ConnectionRecord);
            const didRecord = utils_1.JsonTransformer.fromJSON({
                id: didPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id,
                role: DidDocumentRole_1.DidDocumentRole.Created,
                didDocument: didPeerR1xKJw17sUoXhejEpugMYJ_json_1.default,
                createdAt: connectionRecord.createdAt.toISOString(),
                metadata: {
                    '_internal/legacyDid': {
                        unqualifiedDid: legacyDidPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id,
                        didDocumentString: JSON.stringify(legacyDidPeerR1xKJw17sUoXhejEpugMYJ_json_1.default),
                    },
                },
                _tags: {
                    recipientKeys: ['R1xKJw17sUoXhejEpugMYJ#4', 'E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu'],
                },
            }, repository_1.DidRecord);
            const theirDidRecord = utils_1.JsonTransformer.fromJSON({
                id: didPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default.id,
                role: DidDocumentRole_1.DidDocumentRole.Received,
                didDocument: didPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default,
                createdAt: connectionRecord.createdAt.toISOString(),
                metadata: {
                    '_internal/legacyDid': {
                        unqualifiedDid: legacyDidPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default.id,
                        didDocumentString: JSON.stringify(legacyDidPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default),
                    },
                },
                _tags: {
                    recipientKeys: ['4kgVt6CidfKgo1MoWMqsQX#4', '5sD8ttxn9Bd9a1HmueLirJ4HNhs4Q8qzAqDd1UCR9iqD'],
                },
            }, repository_1.DidRecord);
            // Both did records already exist
            (0, helpers_1.mockFunction)(didRepository.findById).mockImplementation((_, id) => Promise.resolve(id === didPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id ? didRecord : theirDidRecord));
            yield testModule.extractDidDocument(agent, connectionRecord);
            expect(didRepository.save).not.toHaveBeenCalled();
            expect(didRepository.findById).toHaveBeenNthCalledWith(1, agentContext, didPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id);
            expect(didRepository.findById).toHaveBeenNthCalledWith(2, agentContext, didPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default.id);
            expect(connectionRecord.toJSON()).toEqual({
                _tags: {},
                metadata: {},
                createdAt: '2020-04-08T15:51:43.819Z',
                role: 'inviter',
                state: 'invited',
                did: didPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id,
                theirDid: didPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default.id,
                invitation: {
                    '@type': 'https://didcomm.org/connections/1.0/invitation',
                    '@id': '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                    recipientKeys: ['E6D1m3eERqCueX4ZgMCY14B4NceAr6XP2HyVqt55gDhu'],
                    serviceEndpoint: 'https://example.com',
                    label: 'test',
                },
                connectionTypes: [],
            });
        }));
    });
    describe('migrateToOobRecord', () => {
        it('should extract the invitation from the connection record and generate an invitation did', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionRecord = utils_1.JsonTransformer.fromJSON(connectionJsonNewDidStateRole, connections_1.ConnectionRecord);
            // No did record exists yet
            (0, helpers_1.mockFunction)(outOfBandRepository.findByQuery).mockResolvedValue([]);
            yield testModule.migrateToOobRecord(agent, connectionRecord);
            expect(connectionRecord.toJSON()).toEqual({
                _tags: {},
                metadata: {},
                createdAt: '2020-04-08T15:51:43.819Z',
                role: 'responder',
                state: 'invitation-sent',
                did: didPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id,
                theirDid: didPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default.id,
                invitationDid: 'did:peer:2.SeyJzIjoiaHR0cHM6Ly9leGFtcGxlLmNvbSIsInQiOiJkaWQtY29tbXVuaWNhdGlvbiIsInByaW9yaXR5IjowLCJyZWNpcGllbnRLZXlzIjpbImRpZDprZXk6ejZNa3NZVTRNSHRmbU5oTm0xdUdNdkFOcjlqNENCdjJGeW1qaUp0UmdBMzZiU1ZII3o2TWtzWVU0TUh0Zm1OaE5tMXVHTXZBTnI5ajRDQnYyRnltamlKdFJnQTM2YlNWSCJdfQ',
                outOfBandId: expect.any(String),
                autoAcceptConnection: true,
                mediatorId: 'a-mediator-id',
                connectionTypes: [],
            });
        }));
        it('should create an OutOfBandRecord from the invitation and store the outOfBandId in the connection record', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionRecord = utils_1.JsonTransformer.fromJSON(connectionJsonNewDidStateRole, connections_1.ConnectionRecord);
            // No did record exists yet
            (0, helpers_1.mockFunction)(outOfBandRepository.findByQuery).mockResolvedValue([]);
            yield testModule.migrateToOobRecord(agent, connectionRecord);
            const [[, outOfBandRecord]] = (0, helpers_1.mockFunction)(outOfBandRepository.save).mock.calls;
            expect(outOfBandRepository.save).toHaveBeenCalledTimes(1);
            expect(connectionRecord.outOfBandId).toEqual(outOfBandRecord.id);
            expect(outOfBandRecord.toJSON()).toEqual({
                id: expect.any(String),
                _tags: { recipientKeyFingerprints: ['z6MksYU4MHtfmNhNm1uGMvANr9j4CBv2FymjiJtRgA36bSVH'] },
                metadata: {},
                // Checked below
                outOfBandInvitation: {
                    '@type': 'https://didcomm.org/out-of-band/1.1/invitation',
                    services: [
                        {
                            id: '#inline',
                            serviceEndpoint: 'https://example.com',
                            type: 'did-communication',
                            recipientKeys: ['did:key:z6MksYU4MHtfmNhNm1uGMvANr9j4CBv2FymjiJtRgA36bSVH'],
                        },
                    ],
                    '@id': '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                    label: 'test',
                    accept: ['didcomm/aip1', 'didcomm/aip2;env=rfc19'],
                    handshake_protocols: ['https://didcomm.org/connections/1.0'],
                },
                role: OutOfBandRole_1.OutOfBandRole.Sender,
                state: OutOfBandState_1.OutOfBandState.AwaitResponse,
                autoAcceptConnection: true,
                reusable: false,
                mediatorId: 'a-mediator-id',
                createdAt: connectionRecord.createdAt.toISOString(),
            });
        }));
        it('should create an OutOfBandRecord if an OutOfBandRecord with the invitation id already exists, but the recipientKeys are different', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionRecord = utils_1.JsonTransformer.fromJSON(connectionJsonNewDidStateRole, connections_1.ConnectionRecord);
            // Out of band record does not exist yet
            (0, helpers_1.mockFunction)(outOfBandRepository.findByQuery).mockResolvedValueOnce([]);
            yield testModule.migrateToOobRecord(agent, connectionRecord);
            expect(outOfBandRepository.findByQuery).toHaveBeenCalledTimes(1);
            expect(outOfBandRepository.findByQuery).toHaveBeenNthCalledWith(1, agentContext, {
                invitationId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                recipientKeyFingerprints: ['z6MksYU4MHtfmNhNm1uGMvANr9j4CBv2FymjiJtRgA36bSVH'],
                role: OutOfBandRole_1.OutOfBandRole.Sender,
            });
            // Expect the out of band record to be created
            expect(outOfBandRepository.save).toHaveBeenCalled();
        }));
        it('should not create an OutOfBandRecord if an OutOfBandRecord with the invitation id and recipientKeys already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionRecord = utils_1.JsonTransformer.fromJSON(connectionJsonNewDidStateRole, connections_1.ConnectionRecord);
            const outOfBandRecord = utils_1.JsonTransformer.fromJSON({
                id: '3c52cc26-577d-4200-8753-05f1f425c342',
                _tags: {},
                metadata: {},
                // Checked below
                outOfBandInvitation: {
                    '@type': 'https://didcomm.org/out-of-band/1.1/invitation',
                    services: [
                        {
                            id: '#inline',
                            serviceEndpoint: 'https://example.com',
                            type: 'did-communication',
                            recipientKeys: ['did:key:z6MksYU4MHtfmNhNm1uGMvANr9j4CBv2FymjiJtRgA36bSVH'],
                        },
                    ],
                    '@id': '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                    label: 'test',
                    accept: ['didcomm/aip1', 'didcomm/aip2;env=rfc19'],
                    handshake_protocols: ['https://didcomm.org/connections/1.0'],
                },
                role: OutOfBandRole_1.OutOfBandRole.Sender,
                state: OutOfBandState_1.OutOfBandState.AwaitResponse,
                autoAcceptConnection: true,
                did: didPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id,
                reusable: false,
                mediatorId: 'a-mediator-id',
                createdAt: connectionRecord.createdAt.toISOString(),
            }, repository_2.OutOfBandRecord);
            // Out of band record does not exist yet
            (0, helpers_1.mockFunction)(outOfBandRepository.findByQuery).mockResolvedValueOnce([outOfBandRecord]);
            yield testModule.migrateToOobRecord(agent, connectionRecord);
            expect(outOfBandRepository.findByQuery).toHaveBeenCalledTimes(1);
            expect(outOfBandRepository.findByQuery).toHaveBeenNthCalledWith(1, agentContext, {
                invitationId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                recipientKeyFingerprints: ['z6MksYU4MHtfmNhNm1uGMvANr9j4CBv2FymjiJtRgA36bSVH'],
                role: OutOfBandRole_1.OutOfBandRole.Sender,
            });
            expect(outOfBandRepository.save).not.toHaveBeenCalled();
            expect(connectionRecord.toJSON()).toEqual({
                _tags: {},
                metadata: {},
                createdAt: '2020-04-08T15:51:43.819Z',
                role: 'responder',
                state: 'invitation-sent',
                did: didPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id,
                theirDid: didPeer4kgVt6CidfKgo1MoWMqsQX_json_1.default.id,
                invitationDid: 'did:peer:2.SeyJzIjoiaHR0cHM6Ly9leGFtcGxlLmNvbSIsInQiOiJkaWQtY29tbXVuaWNhdGlvbiIsInByaW9yaXR5IjowLCJyZWNpcGllbnRLZXlzIjpbImRpZDprZXk6ejZNa3NZVTRNSHRmbU5oTm0xdUdNdkFOcjlqNENCdjJGeW1qaUp0UmdBMzZiU1ZII3o2TWtzWVU0TUh0Zm1OaE5tMXVHTXZBTnI5ajRDQnYyRnltamlKdFJnQTM2YlNWSCJdfQ',
                autoAcceptConnection: true,
                mediatorId: 'a-mediator-id',
                outOfBandId: outOfBandRecord.id,
                connectionTypes: [],
            });
        }));
        it('should update the existing out of band record to reusable and state await response if the connection record is a multiUseInvitation', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionRecord = utils_1.JsonTransformer.fromJSON(Object.assign(Object.assign({}, connectionJsonNewDidStateRole), { multiUseInvitation: true }), connections_1.ConnectionRecord);
            const outOfBandRecord = utils_1.JsonTransformer.fromJSON({
                id: '3c52cc26-577d-4200-8753-05f1f425c342',
                _tags: {},
                metadata: {},
                // Checked below
                outOfBandInvitation: {
                    '@type': 'https://didcomm.org/out-of-band/1.1/invitation',
                    services: [
                        {
                            id: '#inline',
                            serviceEndpoint: 'https://example.com',
                            type: 'did-communication',
                            recipientKeys: ['did:key:z6MksYU4MHtfmNhNm1uGMvANr9j4CBv2FymjiJtRgA36bSVH'],
                        },
                    ],
                    '@id': '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                    label: 'test',
                    accept: ['didcomm/aip1', 'didcomm/aip2;env=rfc19'],
                    handshake_protocols: ['https://didcomm.org/connections/1.0'],
                },
                role: OutOfBandRole_1.OutOfBandRole.Sender,
                state: OutOfBandState_1.OutOfBandState.AwaitResponse,
                autoAcceptConnection: true,
                did: didPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id,
                reusable: false,
                mediatorId: 'a-mediator-id',
                createdAt: connectionRecord.createdAt.toISOString(),
            }, repository_2.OutOfBandRecord);
            // Out of band record already exists
            (0, helpers_1.mockFunction)(outOfBandRepository.findByQuery).mockResolvedValueOnce([outOfBandRecord]);
            yield testModule.migrateToOobRecord(agent, connectionRecord);
            expect(outOfBandRepository.findByQuery).toHaveBeenCalledTimes(1);
            expect(outOfBandRepository.findByQuery).toHaveBeenNthCalledWith(1, agentContext, {
                invitationId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                recipientKeyFingerprints: ['z6MksYU4MHtfmNhNm1uGMvANr9j4CBv2FymjiJtRgA36bSVH'],
                role: OutOfBandRole_1.OutOfBandRole.Sender,
            });
            expect(outOfBandRepository.save).not.toHaveBeenCalled();
            expect(outOfBandRepository.update).toHaveBeenCalledWith(agentContext, outOfBandRecord);
            expect(connectionRepository.delete).toHaveBeenCalledWith(agentContext, connectionRecord);
            expect(outOfBandRecord.toJSON()).toEqual({
                id: '3c52cc26-577d-4200-8753-05f1f425c342',
                _tags: {},
                metadata: {},
                outOfBandInvitation: {
                    '@type': 'https://didcomm.org/out-of-band/1.1/invitation',
                    services: [
                        {
                            id: '#inline',
                            serviceEndpoint: 'https://example.com',
                            type: 'did-communication',
                            recipientKeys: ['did:key:z6MksYU4MHtfmNhNm1uGMvANr9j4CBv2FymjiJtRgA36bSVH'],
                        },
                    ],
                    '@id': '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                    label: 'test',
                    accept: ['didcomm/aip1', 'didcomm/aip2;env=rfc19'],
                    handshake_protocols: ['https://didcomm.org/connections/1.0'],
                },
                role: OutOfBandRole_1.OutOfBandRole.Sender,
                state: OutOfBandState_1.OutOfBandState.AwaitResponse,
                autoAcceptConnection: true,
                did: didPeerR1xKJw17sUoXhejEpugMYJ_json_1.default.id,
                reusable: true,
                mediatorId: 'a-mediator-id',
                createdAt: connectionRecord.createdAt.toISOString(),
            });
        }));
    });
    describe('oobStateFromDidExchangeRoleAndState', () => {
        it('should return the correct state for all connection role and state combinations', () => {
            expect(testModule.oobStateFromDidExchangeRoleAndState(connections_1.DidExchangeRole.Responder, connections_1.DidExchangeState.InvitationSent)).toEqual(OutOfBandState_1.OutOfBandState.AwaitResponse);
            expect(testModule.oobStateFromDidExchangeRoleAndState(connections_1.DidExchangeRole.Responder, connections_1.DidExchangeState.RequestReceived)).toEqual(OutOfBandState_1.OutOfBandState.Done);
            expect(testModule.oobStateFromDidExchangeRoleAndState(connections_1.DidExchangeRole.Responder, connections_1.DidExchangeState.ResponseSent)).toEqual(OutOfBandState_1.OutOfBandState.Done);
            expect(testModule.oobStateFromDidExchangeRoleAndState(connections_1.DidExchangeRole.Responder, connections_1.DidExchangeState.Completed)).toEqual(OutOfBandState_1.OutOfBandState.Done);
            expect(testModule.oobStateFromDidExchangeRoleAndState(connections_1.DidExchangeRole.Responder, connections_1.DidExchangeState.Abandoned)).toEqual(OutOfBandState_1.OutOfBandState.Done);
            expect(testModule.oobStateFromDidExchangeRoleAndState(connections_1.DidExchangeRole.Requester, connections_1.DidExchangeState.Start)).toEqual(OutOfBandState_1.OutOfBandState.PrepareResponse);
            expect(testModule.oobStateFromDidExchangeRoleAndState(connections_1.DidExchangeRole.Requester, connections_1.DidExchangeState.InvitationReceived)).toEqual(OutOfBandState_1.OutOfBandState.PrepareResponse);
            expect(testModule.oobStateFromDidExchangeRoleAndState(connections_1.DidExchangeRole.Requester, connections_1.DidExchangeState.RequestSent)).toEqual(OutOfBandState_1.OutOfBandState.Done);
            expect(testModule.oobStateFromDidExchangeRoleAndState(connections_1.DidExchangeRole.Requester, connections_1.DidExchangeState.ResponseReceived)).toEqual(OutOfBandState_1.OutOfBandState.Done);
            expect(testModule.oobStateFromDidExchangeRoleAndState(connections_1.DidExchangeRole.Requester, connections_1.DidExchangeState.Completed)).toEqual(OutOfBandState_1.OutOfBandState.Done);
            expect(testModule.oobStateFromDidExchangeRoleAndState(connections_1.DidExchangeRole.Requester, connections_1.DidExchangeState.Abandoned)).toEqual(OutOfBandState_1.OutOfBandState.Done);
            expect(testModule.oobStateFromDidExchangeRoleAndState(connections_1.DidExchangeRole.Responder, connections_1.DidExchangeState.Start)).toEqual(OutOfBandState_1.OutOfBandState.AwaitResponse);
        });
    });
    describe('didExchangeStateAndRoleFromRoleAndState', () => {
        it('should return the correct state for all connection role and state combinations', () => {
            expect(testModule.didExchangeStateAndRoleFromRoleAndState(connections_1.ConnectionRole.Inviter, connections_1.ConnectionState.Invited)).toEqual([connections_1.DidExchangeRole.Responder, connections_1.DidExchangeState.InvitationSent]);
            expect(testModule.didExchangeStateAndRoleFromRoleAndState(connections_1.ConnectionRole.Inviter, connections_1.ConnectionState.Requested)).toEqual([connections_1.DidExchangeRole.Responder, connections_1.DidExchangeState.RequestReceived]);
            expect(testModule.didExchangeStateAndRoleFromRoleAndState(connections_1.ConnectionRole.Inviter, connections_1.ConnectionState.Responded)).toEqual([connections_1.DidExchangeRole.Responder, connections_1.DidExchangeState.ResponseSent]);
            expect(testModule.didExchangeStateAndRoleFromRoleAndState(connections_1.ConnectionRole.Inviter, connections_1.ConnectionState.Complete)).toEqual([connections_1.DidExchangeRole.Responder, connections_1.DidExchangeState.Completed]);
            expect(testModule.didExchangeStateAndRoleFromRoleAndState(connections_1.ConnectionRole.Invitee, connections_1.ConnectionState.Invited)).toEqual([connections_1.DidExchangeRole.Requester, connections_1.DidExchangeState.InvitationReceived]);
            expect(testModule.didExchangeStateAndRoleFromRoleAndState(connections_1.ConnectionRole.Invitee, connections_1.ConnectionState.Requested)).toEqual([connections_1.DidExchangeRole.Requester, connections_1.DidExchangeState.RequestSent]);
            expect(testModule.didExchangeStateAndRoleFromRoleAndState(connections_1.ConnectionRole.Invitee, connections_1.ConnectionState.Responded)).toEqual([connections_1.DidExchangeRole.Requester, connections_1.DidExchangeState.ResponseReceived]);
            expect(testModule.didExchangeStateAndRoleFromRoleAndState(connections_1.ConnectionRole.Invitee, connections_1.ConnectionState.Complete)).toEqual([connections_1.DidExchangeRole.Requester, connections_1.DidExchangeState.Completed]);
        });
        it('should return did exchange role if role is already did exchange role', () => {
            expect(testModule.didExchangeStateAndRoleFromRoleAndState(connections_1.DidExchangeRole.Responder, connections_1.DidExchangeState.RequestSent)).toEqual([connections_1.DidExchangeRole.Responder, expect.anything()]);
            expect(testModule.didExchangeStateAndRoleFromRoleAndState(connections_1.DidExchangeRole.Requester, connections_1.ConnectionState.Requested)).toEqual([connections_1.DidExchangeRole.Requester, expect.anything()]);
        });
        it('should return the input state if state is not a valid connection state', () => {
            expect(testModule.didExchangeStateAndRoleFromRoleAndState(connections_1.DidExchangeRole.Responder, 'something-weird')).toEqual([connections_1.DidExchangeRole.Responder, 'something-weird']);
        });
    });
});
