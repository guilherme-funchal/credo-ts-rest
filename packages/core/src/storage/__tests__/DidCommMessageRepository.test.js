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
const InMemoryStorageService_1 = require("../../../../../tests/InMemoryStorageService");
const helpers_1 = require("../../../tests/helpers");
const EventEmitter_1 = require("../../agent/EventEmitter");
const connections_1 = require("../../modules/connections");
const JsonTransformer_1 = require("../../utils/JsonTransformer");
const didcomm_1 = require("../didcomm");
jest.mock('../../../../../tests/InMemoryStorageService');
const StorageMock = InMemoryStorageService_1.InMemoryStorageService;
const invitationJson = {
    '@type': 'https://didcomm.org/connections/1.0/invitation',
    '@id': '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
    recipientKeys: ['recipientKeyOne', 'recipientKeyTwo'],
    serviceEndpoint: 'https://example.com',
    label: 'test',
};
const config = (0, helpers_1.getAgentConfig)('DidCommMessageRepository');
const agentContext = (0, helpers_1.getAgentContext)();
describe('DidCommMessageRepository', () => {
    let repository;
    let storageMock;
    let eventEmitter;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        storageMock = new StorageMock();
        eventEmitter = new EventEmitter_1.EventEmitter(config.agentDependencies, new rxjs_1.Subject());
        repository = new didcomm_1.DidCommMessageRepository(storageMock, eventEmitter);
    }));
    const getRecord = ({ id } = {}) => {
        return new didcomm_1.DidCommMessageRecord({
            id,
            message: invitationJson,
            role: didcomm_1.DidCommMessageRole.Receiver,
            associatedRecordId: '16ca6665-29f6-4333-a80e-d34db6bfe0b0',
        });
    };
    describe('getAgentMessage()', () => {
        it('should get the record using the storage service', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = getRecord({ id: 'test-id' });
            (0, helpers_1.mockFunction)(storageMock.findByQuery).mockReturnValue(Promise.resolve([record]));
            const invitation = yield repository.findAgentMessage(agentContext, {
                messageClass: connections_1.ConnectionInvitationMessage,
                associatedRecordId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
            });
            expect(storageMock.findByQuery).toBeCalledWith(agentContext, didcomm_1.DidCommMessageRecord, {
                associatedRecordId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                messageName: 'invitation',
                protocolName: 'connections',
                protocolMajorVersion: '1',
            });
            expect(invitation).toBeInstanceOf(connections_1.ConnectionInvitationMessage);
        }));
    });
    describe('findAgentMessage()', () => {
        it('should get the record using the storage service', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = getRecord({ id: 'test-id' });
            (0, helpers_1.mockFunction)(storageMock.findByQuery).mockReturnValue(Promise.resolve([record]));
            const invitation = yield repository.findAgentMessage(agentContext, {
                messageClass: connections_1.ConnectionInvitationMessage,
                associatedRecordId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
            });
            expect(storageMock.findByQuery).toBeCalledWith(agentContext, didcomm_1.DidCommMessageRecord, {
                associatedRecordId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                messageName: 'invitation',
                protocolName: 'connections',
                protocolMajorVersion: '1',
            });
            expect(invitation).toBeInstanceOf(connections_1.ConnectionInvitationMessage);
        }));
        it("should return null because the record doesn't exist", () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(storageMock.findByQuery).mockReturnValue(Promise.resolve([]));
            const invitation = yield repository.findAgentMessage(agentContext, {
                messageClass: connections_1.ConnectionInvitationMessage,
                associatedRecordId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
            });
            expect(storageMock.findByQuery).toBeCalledWith(agentContext, didcomm_1.DidCommMessageRecord, {
                associatedRecordId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                messageName: 'invitation',
                protocolName: 'connections',
                protocolMajorVersion: '1',
            });
            expect(invitation).toBeNull();
        }));
    });
    describe('saveAgentMessage()', () => {
        it('should transform and save the agent message', () => __awaiter(void 0, void 0, void 0, function* () {
            yield repository.saveAgentMessage(agentContext, {
                role: didcomm_1.DidCommMessageRole.Receiver,
                agentMessage: JsonTransformer_1.JsonTransformer.fromJSON(invitationJson, connections_1.ConnectionInvitationMessage),
                associatedRecordId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
            });
            expect(storageMock.save).toBeCalledWith(agentContext, expect.objectContaining({
                role: didcomm_1.DidCommMessageRole.Receiver,
                message: invitationJson,
                associatedRecordId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
            }));
        }));
    });
    describe('saveOrUpdateAgentMessage()', () => {
        it('should transform and save the agent message', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(storageMock.findByQuery).mockReturnValue(Promise.resolve([]));
            yield repository.saveOrUpdateAgentMessage(agentContext, {
                role: didcomm_1.DidCommMessageRole.Receiver,
                agentMessage: JsonTransformer_1.JsonTransformer.fromJSON(invitationJson, connections_1.ConnectionInvitationMessage),
                associatedRecordId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
            });
            expect(storageMock.save).toBeCalledWith(agentContext, expect.objectContaining({
                role: didcomm_1.DidCommMessageRole.Receiver,
                message: invitationJson,
                associatedRecordId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
            }));
        }));
        it('should transform and update the agent message', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = getRecord({ id: 'test-id' });
            (0, helpers_1.mockFunction)(storageMock.findByQuery).mockReturnValue(Promise.resolve([record]));
            yield repository.saveOrUpdateAgentMessage(agentContext, {
                role: didcomm_1.DidCommMessageRole.Receiver,
                agentMessage: JsonTransformer_1.JsonTransformer.fromJSON(invitationJson, connections_1.ConnectionInvitationMessage),
                associatedRecordId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
            });
            expect(storageMock.findByQuery).toBeCalledWith(agentContext, didcomm_1.DidCommMessageRecord, {
                associatedRecordId: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                messageName: 'invitation',
                protocolName: 'connections',
                protocolMajorVersion: '1',
            });
            expect(storageMock.update).toBeCalledWith(agentContext, record);
        }));
    });
});
