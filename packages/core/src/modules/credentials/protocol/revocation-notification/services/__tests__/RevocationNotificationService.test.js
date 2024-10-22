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
const __1 = require("../../../../../..");
const helpers_1 = require("../../../../../../../tests/helpers");
const EventEmitter_1 = require("../../../../../../agent/EventEmitter");
const MessageHandlerRegistry_1 = require("../../../../../../agent/MessageHandlerRegistry");
const connections_1 = require("../../../../../connections");
const CredentialEvents_1 = require("../../../../CredentialEvents");
const CredentialRepository_1 = require("../../../../repository/CredentialRepository");
const messages_1 = require("../../messages");
const RevocationNotificationService_1 = require("../RevocationNotificationService");
jest.mock('../../../../repository/CredentialRepository');
const CredentialRepositoryMock = CredentialRepository_1.CredentialRepository;
const credentialRepository = new CredentialRepositoryMock();
jest.mock('../../../../../../agent/MessageHandlerRegistry');
const MessageHandlerRegistryMock = MessageHandlerRegistry_1.MessageHandlerRegistry;
const messageHandlerRegistry = new MessageHandlerRegistryMock();
const connection = (0, helpers_1.getMockConnection)({
    state: connections_1.DidExchangeState.Completed,
});
describe('RevocationNotificationService', () => {
    let revocationNotificationService;
    let agentContext;
    let eventEmitter;
    beforeEach(() => {
        const agentConfig = (0, helpers_1.getAgentConfig)('RevocationNotificationService');
        agentContext = (0, helpers_1.getAgentContext)();
        eventEmitter = new EventEmitter_1.EventEmitter(agentConfig.agentDependencies, new rxjs_1.Subject());
        revocationNotificationService = new RevocationNotificationService_1.RevocationNotificationService(credentialRepository, eventEmitter, messageHandlerRegistry, agentConfig.logger);
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('v1ProcessRevocationNotification', () => {
        test('emits revocation notification event if credential record exists for indy thread', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(CredentialEvents_1.CredentialEventTypes.RevocationNotificationReceived, eventListenerMock);
            const date = new Date('2020-01-01T00:00:00.000Z');
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => date);
            const credentialRecord = new __1.CredentialExchangeRecord({
                threadId: 'thread-id',
                protocolVersion: 'v1',
                state: __1.CredentialState.Done,
            });
            const metadata = {
                revocationRegistryId: 'AsB27X6KRrJFsqZ3unNAH6:4:AsB27X6KRrJFsqZ3unNAH6:3:cl:48187:default:CL_ACCUM:3b24a9b0-a979-41e0-9964-2292f2b1b7e9',
                credentialRevocationId: '1',
            };
            // Set required tags
            credentialRecord.setTag('anonCredsRevocationRegistryId', metadata.revocationRegistryId);
            credentialRecord.setTag('anonCredsCredentialRevocationId', metadata.credentialRevocationId);
            (0, helpers_1.mockFunction)(credentialRepository.getSingleByQuery).mockResolvedValueOnce(credentialRecord);
            const revocationNotificationThreadId = `indy::${metadata.revocationRegistryId}::${metadata.credentialRevocationId}`;
            const revocationNotificationMessage = new messages_1.V1RevocationNotificationMessage({
                issueThread: revocationNotificationThreadId,
                comment: 'Credential has been revoked',
            });
            const messageContext = new __1.InboundMessageContext(revocationNotificationMessage, {
                connection,
                agentContext,
            });
            yield revocationNotificationService.v1ProcessRevocationNotification(messageContext);
            const clonedCredentialRecord = eventListenerMock.mock.calls[0][0].payload.credentialRecord;
            expect(clonedCredentialRecord.toJSON()).toEqual(credentialRecord.toJSON());
            expect(credentialRecord.revocationNotification).toMatchObject({
                revocationDate: date,
                comment: 'Credential has been revoked',
            });
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'RevocationNotificationReceived',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    credentialRecord: expect.any(__1.CredentialExchangeRecord),
                },
            });
            dateSpy.mockRestore();
        }));
        test('does not emit revocation notification event if no credential record exists for indy thread', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(CredentialEvents_1.CredentialEventTypes.RevocationNotificationReceived, eventListenerMock);
            const revocationRegistryId = 'ABC12D3EFgHIjKL4mnOPQ5:4:AsB27X6KRrJFsqZ3unNAH6:3:cl:48187:default:CL_ACCUM:3b24a9b0-a979-41e0-9964-2292f2b1b7e9';
            const credentialRevocationId = '2';
            const revocationNotificationThreadId = `indy::${revocationRegistryId}::${credentialRevocationId}`;
            (0, helpers_1.mockFunction)(credentialRepository.getSingleByQuery).mockRejectedValueOnce(new Error('Could not find record'));
            const revocationNotificationMessage = new messages_1.V1RevocationNotificationMessage({
                issueThread: revocationNotificationThreadId,
                comment: 'Credential has been revoked',
            });
            const messageContext = new __1.InboundMessageContext(revocationNotificationMessage, { connection, agentContext });
            yield revocationNotificationService.v1ProcessRevocationNotification(messageContext);
            expect(eventListenerMock).not.toHaveBeenCalled();
        }));
        test('does not emit revocation notification event if invalid threadId is passed', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(CredentialEvents_1.CredentialEventTypes.RevocationNotificationReceived, eventListenerMock);
            const revocationNotificationThreadId = 'notIndy::invalidRevRegId::invalidCredRevId';
            const revocationNotificationMessage = new messages_1.V1RevocationNotificationMessage({
                issueThread: revocationNotificationThreadId,
                comment: 'Credential has been revoked',
            });
            const messageContext = new __1.InboundMessageContext(revocationNotificationMessage, { agentContext });
            yield revocationNotificationService.v1ProcessRevocationNotification(messageContext);
            expect(eventListenerMock).not.toHaveBeenCalled();
        }));
    });
    describe('v2ProcessRevocationNotification', () => {
        test('emits revocation notification event if credential record exists for indy thread', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(CredentialEvents_1.CredentialEventTypes.RevocationNotificationReceived, eventListenerMock);
            const date = new Date('2020-01-01T00:00:00.000Z');
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => date);
            const credentialRecord = new __1.CredentialExchangeRecord({
                threadId: 'thread-id',
                protocolVersion: 'v2',
                state: __1.CredentialState.Done,
            });
            const metadata = {
                revocationRegistryId: 'AsB27X6KRrJFsqZ3unNAH6:4:AsB27X6KRrJFsqZ3unNAH6:3:cl:48187:default:CL_ACCUM:3b24a9b0-a979-41e0-9964-2292f2b1b7e9',
                credentialRevocationId: '1',
            };
            (0, helpers_1.mockFunction)(credentialRepository.getSingleByQuery).mockResolvedValueOnce(credentialRecord);
            const revocationNotificationCredentialId = `${metadata.revocationRegistryId}::${metadata.credentialRevocationId}`;
            const revocationNotificationMessage = new messages_1.V2RevocationNotificationMessage({
                credentialId: revocationNotificationCredentialId,
                revocationFormat: 'indy-anoncreds',
                comment: 'Credential has been revoked',
            });
            const messageContext = new __1.InboundMessageContext(revocationNotificationMessage, { agentContext, connection });
            yield revocationNotificationService.v2ProcessRevocationNotification(messageContext);
            const clonedCredentialRecord = eventListenerMock.mock.calls[0][0].payload.credentialRecord;
            expect(clonedCredentialRecord.toJSON()).toEqual(credentialRecord.toJSON());
            expect(credentialRecord.revocationNotification).toMatchObject({
                revocationDate: date,
                comment: 'Credential has been revoked',
            });
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'RevocationNotificationReceived',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    credentialRecord: expect.any(__1.CredentialExchangeRecord),
                },
            });
            dateSpy.mockRestore();
        }));
        test('does not emit revocation notification event if no credential record exists for indy thread', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(CredentialEvents_1.CredentialEventTypes.RevocationNotificationReceived, eventListenerMock);
            const revocationRegistryId = 'ABC12D3EFgHIjKL4mnOPQ5:4:AsB27X6KRrJFsqZ3unNAH6:3:cl:48187:default:CL_ACCUM:3b24a9b0-a979-41e0-9964-2292f2b1b7e9';
            const credentialRevocationId = '2';
            const credentialId = `${revocationRegistryId}::${credentialRevocationId}`;
            (0, helpers_1.mockFunction)(credentialRepository.getSingleByQuery).mockRejectedValueOnce(new Error('Could not find record'));
            const revocationNotificationMessage = new messages_1.V2RevocationNotificationMessage({
                credentialId,
                revocationFormat: 'indy-anoncreds',
                comment: 'Credential has been revoked',
            });
            const messageContext = new __1.InboundMessageContext(revocationNotificationMessage, { connection, agentContext });
            yield revocationNotificationService.v2ProcessRevocationNotification(messageContext);
            expect(eventListenerMock).not.toHaveBeenCalled();
        }));
        test('does not emit revocation notification event if invalid threadId is passed', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(CredentialEvents_1.CredentialEventTypes.RevocationNotificationReceived, eventListenerMock);
            const invalidCredentialId = 'notIndy::invalidRevRegId::invalidCredRevId';
            const revocationNotificationMessage = new messages_1.V2RevocationNotificationMessage({
                credentialId: invalidCredentialId,
                revocationFormat: 'indy-anoncreds',
                comment: 'Credential has been revoked',
            });
            const messageContext = new __1.InboundMessageContext(revocationNotificationMessage, { agentContext });
            yield revocationNotificationService.v2ProcessRevocationNotification(messageContext);
            expect(eventListenerMock).not.toHaveBeenCalled();
        }));
    });
});
