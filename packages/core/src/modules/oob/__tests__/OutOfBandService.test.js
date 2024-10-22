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
const helpers_1 = require("../../../../tests/helpers");
const EventEmitter_1 = require("../../../agent/EventEmitter");
const InboundMessageContext_1 = require("../../../agent/models/InboundMessageContext");
const crypto_1 = require("../../../crypto");
const error_1 = require("../../../error");
const models_1 = require("../../connections/models");
const OutOfBandService_1 = require("../OutOfBandService");
const OutOfBandEvents_1 = require("../domain/OutOfBandEvents");
const OutOfBandRole_1 = require("../domain/OutOfBandRole");
const OutOfBandState_1 = require("../domain/OutOfBandState");
const messages_1 = require("../messages");
const HandshakeReuseAcceptedMessage_1 = require("../messages/HandshakeReuseAcceptedMessage");
const repository_1 = require("../repository");
jest.mock('../repository/OutOfBandRepository');
const OutOfBandRepositoryMock = repository_1.OutOfBandRepository;
const key = crypto_1.Key.fromPublicKeyBase58('8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K', crypto_1.KeyType.Ed25519);
const agentContext = (0, helpers_1.getAgentContext)();
describe('OutOfBandService', () => {
    let outOfBandRepository;
    let outOfBandService;
    let didCommDocumentService;
    let eventEmitter;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        eventEmitter = new EventEmitter_1.EventEmitter(helpers_1.agentDependencies, new rxjs_1.Subject());
        outOfBandRepository = new OutOfBandRepositoryMock();
        didCommDocumentService = {};
        outOfBandService = new OutOfBandService_1.OutOfBandService(outOfBandRepository, eventEmitter, didCommDocumentService);
    }));
    describe('processHandshakeReuse', () => {
        test('throw error when no parentThreadId is present', () => __awaiter(void 0, void 0, void 0, function* () {
            const reuseMessage = new messages_1.HandshakeReuseMessage({
                parentThreadId: 'parentThreadId',
            });
            reuseMessage.setThread({
                parentThreadId: undefined,
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(reuseMessage, {
                agentContext,
                senderKey: key,
                recipientKey: key,
            });
            yield expect(outOfBandService.processHandshakeReuse(messageContext)).rejects.toThrowError(new error_1.AriesFrameworkError('handshake-reuse message must have a parent thread id'));
        }));
        test('throw error when no out of band record is found for parentThreadId', () => __awaiter(void 0, void 0, void 0, function* () {
            const reuseMessage = new messages_1.HandshakeReuseMessage({
                parentThreadId: 'parentThreadId',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(reuseMessage, {
                agentContext,
                senderKey: key,
                recipientKey: key,
            });
            yield expect(outOfBandService.processHandshakeReuse(messageContext)).rejects.toThrowError(new error_1.AriesFrameworkError('No out of band record found for handshake-reuse message'));
        }));
        test('throw error when role or state is incorrect ', () => __awaiter(void 0, void 0, void 0, function* () {
            const reuseMessage = new messages_1.HandshakeReuseMessage({
                parentThreadId: 'parentThreadId',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(reuseMessage, {
                agentContext,
                senderKey: key,
                recipientKey: key,
            });
            // Correct state, incorrect role
            const mockOob = (0, helpers_1.getMockOutOfBand)({
                state: OutOfBandState_1.OutOfBandState.AwaitResponse,
                role: OutOfBandRole_1.OutOfBandRole.Receiver,
            });
            (0, helpers_1.mockFunction)(outOfBandRepository.findSingleByQuery).mockResolvedValue(mockOob);
            yield expect(outOfBandService.processHandshakeReuse(messageContext)).rejects.toThrowError(new error_1.AriesFrameworkError('Invalid out-of-band record role receiver, expected is sender.'));
            mockOob.state = OutOfBandState_1.OutOfBandState.PrepareResponse;
            mockOob.role = OutOfBandRole_1.OutOfBandRole.Sender;
            yield expect(outOfBandService.processHandshakeReuse(messageContext)).rejects.toThrowError(new error_1.AriesFrameworkError('Invalid out-of-band record state prepare-response, valid states are: await-response.'));
        }));
        test('throw error when the out of band record has request messages ', () => __awaiter(void 0, void 0, void 0, function* () {
            const reuseMessage = new messages_1.HandshakeReuseMessage({
                parentThreadId: 'parentThreadId',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(reuseMessage, {
                agentContext,
                senderKey: key,
                recipientKey: key,
            });
            const mockOob = (0, helpers_1.getMockOutOfBand)({
                state: OutOfBandState_1.OutOfBandState.AwaitResponse,
                role: OutOfBandRole_1.OutOfBandRole.Sender,
            });
            mockOob.outOfBandInvitation.addRequest(reuseMessage);
            (0, helpers_1.mockFunction)(outOfBandRepository.findSingleByQuery).mockResolvedValue(mockOob);
            yield expect(outOfBandService.processHandshakeReuse(messageContext)).rejects.toThrowError(new error_1.AriesFrameworkError('Handshake reuse should only be used when no requests are present'));
        }));
        test("throw error when the message context doesn't have a ready connection", () => __awaiter(void 0, void 0, void 0, function* () {
            const reuseMessage = new messages_1.HandshakeReuseMessage({
                parentThreadId: 'parentThreadId',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(reuseMessage, {
                agentContext,
                senderKey: key,
                recipientKey: key,
            });
            const mockOob = (0, helpers_1.getMockOutOfBand)({
                state: OutOfBandState_1.OutOfBandState.AwaitResponse,
                role: OutOfBandRole_1.OutOfBandRole.Sender,
            });
            (0, helpers_1.mockFunction)(outOfBandRepository.findSingleByQuery).mockResolvedValue(mockOob);
            yield expect(outOfBandService.processHandshakeReuse(messageContext)).rejects.toThrowError(new error_1.AriesFrameworkError(`No connection associated with incoming message ${reuseMessage.type}`));
        }));
        test('emits handshake reused event ', () => __awaiter(void 0, void 0, void 0, function* () {
            const reuseMessage = new messages_1.HandshakeReuseMessage({
                parentThreadId: 'parentThreadId',
            });
            const reuseListener = jest.fn();
            const connection = (0, helpers_1.getMockConnection)({ state: models_1.DidExchangeState.Completed });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(reuseMessage, {
                agentContext,
                senderKey: key,
                recipientKey: key,
                connection,
            });
            const mockOob = (0, helpers_1.getMockOutOfBand)({
                state: OutOfBandState_1.OutOfBandState.AwaitResponse,
                role: OutOfBandRole_1.OutOfBandRole.Sender,
            });
            (0, helpers_1.mockFunction)(outOfBandRepository.findSingleByQuery).mockResolvedValue(mockOob);
            eventEmitter.on(OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused, reuseListener);
            yield outOfBandService.processHandshakeReuse(messageContext);
            eventEmitter.off(OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused, reuseListener);
            expect(reuseListener).toHaveBeenCalledTimes(1);
            const [[reuseEvent]] = reuseListener.mock.calls;
            expect(reuseEvent).toMatchObject({
                type: OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused,
                payload: {
                    connectionRecord: connection,
                    outOfBandRecord: mockOob,
                    reuseThreadId: reuseMessage.threadId,
                },
            });
        }));
        it('updates state to done if out of band record is not reusable', () => __awaiter(void 0, void 0, void 0, function* () {
            const reuseMessage = new messages_1.HandshakeReuseMessage({
                parentThreadId: 'parentThreadId',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(reuseMessage, {
                agentContext,
                senderKey: key,
                recipientKey: key,
                connection: (0, helpers_1.getMockConnection)({ state: models_1.DidExchangeState.Completed }),
            });
            const mockOob = (0, helpers_1.getMockOutOfBand)({
                state: OutOfBandState_1.OutOfBandState.AwaitResponse,
                role: OutOfBandRole_1.OutOfBandRole.Sender,
                reusable: true,
            });
            (0, helpers_1.mockFunction)(outOfBandRepository.findSingleByQuery).mockResolvedValue(mockOob);
            const updateStateSpy = jest.spyOn(outOfBandService, 'updateState');
            // Reusable shouldn't update state
            yield outOfBandService.processHandshakeReuse(messageContext);
            expect(updateStateSpy).not.toHaveBeenCalled();
            // Non-reusable should update state
            mockOob.reusable = false;
            yield outOfBandService.processHandshakeReuse(messageContext);
            expect(updateStateSpy).toHaveBeenCalledWith(agentContext, mockOob, OutOfBandState_1.OutOfBandState.Done);
        }));
        it('returns a handshake-reuse-accepted message', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const reuseMessage = new messages_1.HandshakeReuseMessage({
                parentThreadId: 'parentThreadId',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(reuseMessage, {
                agentContext,
                senderKey: key,
                recipientKey: key,
                connection: (0, helpers_1.getMockConnection)({ state: models_1.DidExchangeState.Completed }),
            });
            const mockOob = (0, helpers_1.getMockOutOfBand)({
                state: OutOfBandState_1.OutOfBandState.AwaitResponse,
                role: OutOfBandRole_1.OutOfBandRole.Sender,
            });
            (0, helpers_1.mockFunction)(outOfBandRepository.findSingleByQuery).mockResolvedValue(mockOob);
            const reuseAcceptedMessage = yield outOfBandService.processHandshakeReuse(messageContext);
            expect(reuseAcceptedMessage).toBeInstanceOf(HandshakeReuseAcceptedMessage_1.HandshakeReuseAcceptedMessage);
            expect(reuseAcceptedMessage.thread).toMatchObject({
                threadId: reuseMessage.id,
                parentThreadId: (_a = reuseMessage.thread) === null || _a === void 0 ? void 0 : _a.parentThreadId,
            });
        }));
    });
    describe('processHandshakeReuseAccepted', () => {
        test('throw error when no parentThreadId is present', () => __awaiter(void 0, void 0, void 0, function* () {
            const reuseAcceptedMessage = new HandshakeReuseAcceptedMessage_1.HandshakeReuseAcceptedMessage({
                threadId: 'threadId',
                parentThreadId: 'parentThreadId',
            });
            reuseAcceptedMessage.setThread({
                parentThreadId: undefined,
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(reuseAcceptedMessage, {
                agentContext,
                senderKey: key,
                recipientKey: key,
            });
            yield expect(outOfBandService.processHandshakeReuseAccepted(messageContext)).rejects.toThrowError(new error_1.AriesFrameworkError('handshake-reuse-accepted message must have a parent thread id'));
        }));
        test('throw error when no out of band record is found for parentThreadId', () => __awaiter(void 0, void 0, void 0, function* () {
            const reuseAcceptedMessage = new HandshakeReuseAcceptedMessage_1.HandshakeReuseAcceptedMessage({
                parentThreadId: 'parentThreadId',
                threadId: 'threadId',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(reuseAcceptedMessage, {
                agentContext,
                senderKey: key,
                recipientKey: key,
            });
            yield expect(outOfBandService.processHandshakeReuseAccepted(messageContext)).rejects.toThrowError(new error_1.AriesFrameworkError('No out of band record found for handshake-reuse-accepted message'));
        }));
        test('throw error when role or state is incorrect ', () => __awaiter(void 0, void 0, void 0, function* () {
            const reuseAcceptedMessage = new HandshakeReuseAcceptedMessage_1.HandshakeReuseAcceptedMessage({
                parentThreadId: 'parentThreadId',
                threadId: 'threadId',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(reuseAcceptedMessage, {
                agentContext,
                senderKey: key,
                recipientKey: key,
            });
            // Correct state, incorrect role
            const mockOob = (0, helpers_1.getMockOutOfBand)({
                state: OutOfBandState_1.OutOfBandState.PrepareResponse,
                role: OutOfBandRole_1.OutOfBandRole.Sender,
            });
            (0, helpers_1.mockFunction)(outOfBandRepository.findSingleByQuery).mockResolvedValue(mockOob);
            yield expect(outOfBandService.processHandshakeReuseAccepted(messageContext)).rejects.toThrowError(new error_1.AriesFrameworkError('Invalid out-of-band record role sender, expected is receiver.'));
            mockOob.state = OutOfBandState_1.OutOfBandState.AwaitResponse;
            mockOob.role = OutOfBandRole_1.OutOfBandRole.Receiver;
            yield expect(outOfBandService.processHandshakeReuseAccepted(messageContext)).rejects.toThrowError(new error_1.AriesFrameworkError('Invalid out-of-band record state await-response, valid states are: prepare-response.'));
        }));
        test("throw error when the message context doesn't have a ready connection", () => __awaiter(void 0, void 0, void 0, function* () {
            const reuseAcceptedMessage = new HandshakeReuseAcceptedMessage_1.HandshakeReuseAcceptedMessage({
                parentThreadId: 'parentThreadId',
                threadId: 'threadId',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(reuseAcceptedMessage, {
                agentContext,
                senderKey: key,
                recipientKey: key,
            });
            const mockOob = (0, helpers_1.getMockOutOfBand)({
                state: OutOfBandState_1.OutOfBandState.PrepareResponse,
                role: OutOfBandRole_1.OutOfBandRole.Receiver,
            });
            (0, helpers_1.mockFunction)(outOfBandRepository.findSingleByQuery).mockResolvedValue(mockOob);
            yield expect(outOfBandService.processHandshakeReuseAccepted(messageContext)).rejects.toThrowError(new error_1.AriesFrameworkError(`No connection associated with incoming message ${reuseAcceptedMessage.type}`));
        }));
        test("throw error when the reuseConnectionId on the oob record doesn't match with the inbound message connection id", () => __awaiter(void 0, void 0, void 0, function* () {
            const reuseAcceptedMessage = new HandshakeReuseAcceptedMessage_1.HandshakeReuseAcceptedMessage({
                parentThreadId: 'parentThreadId',
                threadId: 'threadId',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(reuseAcceptedMessage, {
                agentContext,
                senderKey: key,
                recipientKey: key,
                connection: (0, helpers_1.getMockConnection)({ state: models_1.DidExchangeState.Completed, id: 'connectionId' }),
            });
            const mockOob = (0, helpers_1.getMockOutOfBand)({
                state: OutOfBandState_1.OutOfBandState.PrepareResponse,
                role: OutOfBandRole_1.OutOfBandRole.Receiver,
                reuseConnectionId: 'anotherConnectionId',
            });
            (0, helpers_1.mockFunction)(outOfBandRepository.findSingleByQuery).mockResolvedValue(mockOob);
            yield expect(outOfBandService.processHandshakeReuseAccepted(messageContext)).rejects.toThrowError(new error_1.AriesFrameworkError(`handshake-reuse-accepted is not in response to a handshake-reuse message.`));
        }));
        test('emits handshake reused event ', () => __awaiter(void 0, void 0, void 0, function* () {
            const reuseAcceptedMessage = new HandshakeReuseAcceptedMessage_1.HandshakeReuseAcceptedMessage({
                parentThreadId: 'parentThreadId',
                threadId: 'threadId',
            });
            const reuseListener = jest.fn();
            const connection = (0, helpers_1.getMockConnection)({ state: models_1.DidExchangeState.Completed, id: 'connectionId' });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(reuseAcceptedMessage, {
                agentContext,
                senderKey: key,
                recipientKey: key,
                connection,
            });
            const mockOob = (0, helpers_1.getMockOutOfBand)({
                state: OutOfBandState_1.OutOfBandState.PrepareResponse,
                role: OutOfBandRole_1.OutOfBandRole.Receiver,
                reuseConnectionId: 'connectionId',
            });
            (0, helpers_1.mockFunction)(outOfBandRepository.findSingleByQuery).mockResolvedValue(mockOob);
            eventEmitter.on(OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused, reuseListener);
            yield outOfBandService.processHandshakeReuseAccepted(messageContext);
            eventEmitter.off(OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused, reuseListener);
            expect(reuseListener).toHaveBeenCalledTimes(1);
            const [[reuseEvent]] = reuseListener.mock.calls;
            expect(reuseEvent).toMatchObject({
                type: OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused,
                payload: {
                    connectionRecord: connection,
                    outOfBandRecord: mockOob,
                    reuseThreadId: reuseAcceptedMessage.threadId,
                },
            });
        }));
        it('updates state to done', () => __awaiter(void 0, void 0, void 0, function* () {
            const reuseAcceptedMessage = new HandshakeReuseAcceptedMessage_1.HandshakeReuseAcceptedMessage({
                parentThreadId: 'parentThreadId',
                threadId: 'threadId',
            });
            const messageContext = new InboundMessageContext_1.InboundMessageContext(reuseAcceptedMessage, {
                agentContext,
                senderKey: key,
                recipientKey: key,
                connection: (0, helpers_1.getMockConnection)({ state: models_1.DidExchangeState.Completed, id: 'connectionId' }),
            });
            const mockOob = (0, helpers_1.getMockOutOfBand)({
                state: OutOfBandState_1.OutOfBandState.PrepareResponse,
                role: OutOfBandRole_1.OutOfBandRole.Receiver,
                reusable: true,
                reuseConnectionId: 'connectionId',
            });
            (0, helpers_1.mockFunction)(outOfBandRepository.findSingleByQuery).mockResolvedValue(mockOob);
            const updateStateSpy = jest.spyOn(outOfBandService, 'updateState');
            yield outOfBandService.processHandshakeReuseAccepted(messageContext);
            expect(updateStateSpy).toHaveBeenCalledWith(agentContext, mockOob, OutOfBandState_1.OutOfBandState.Done);
        }));
    });
    describe('updateState', () => {
        test('updates the state on the out of band record', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockOob = (0, helpers_1.getMockOutOfBand)({
                state: OutOfBandState_1.OutOfBandState.Initial,
            });
            yield outOfBandService.updateState(agentContext, mockOob, OutOfBandState_1.OutOfBandState.Done);
            expect(mockOob.state).toEqual(OutOfBandState_1.OutOfBandState.Done);
        }));
        test('updates the record in the out of band repository', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockOob = (0, helpers_1.getMockOutOfBand)({
                state: OutOfBandState_1.OutOfBandState.Initial,
            });
            yield outOfBandService.updateState(agentContext, mockOob, OutOfBandState_1.OutOfBandState.Done);
            expect(outOfBandRepository.update).toHaveBeenCalledWith(agentContext, mockOob);
        }));
        test('emits an OutOfBandStateChangedEvent', () => __awaiter(void 0, void 0, void 0, function* () {
            const stateChangedListener = jest.fn();
            const mockOob = (0, helpers_1.getMockOutOfBand)({
                state: OutOfBandState_1.OutOfBandState.Initial,
            });
            eventEmitter.on(OutOfBandEvents_1.OutOfBandEventTypes.OutOfBandStateChanged, stateChangedListener);
            yield outOfBandService.updateState(agentContext, mockOob, OutOfBandState_1.OutOfBandState.Done);
            eventEmitter.off(OutOfBandEvents_1.OutOfBandEventTypes.OutOfBandStateChanged, stateChangedListener);
            expect(stateChangedListener).toHaveBeenCalledTimes(1);
            const [[stateChangedEvent]] = stateChangedListener.mock.calls;
            expect(stateChangedEvent).toMatchObject({
                type: OutOfBandEvents_1.OutOfBandEventTypes.OutOfBandStateChanged,
                payload: {
                    outOfBandRecord: mockOob,
                    previousState: OutOfBandState_1.OutOfBandState.Initial,
                },
            });
        }));
    });
    describe('repository methods', () => {
        it('getById should return value from outOfBandRepository.getById', () => __awaiter(void 0, void 0, void 0, function* () {
            const expected = (0, helpers_1.getMockOutOfBand)();
            (0, helpers_1.mockFunction)(outOfBandRepository.getById).mockReturnValue(Promise.resolve(expected));
            const result = yield outOfBandService.getById(agentContext, expected.id);
            expect(outOfBandRepository.getById).toBeCalledWith(agentContext, expected.id);
            expect(result).toBe(expected);
        }));
        it('findById should return value from outOfBandRepository.findById', () => __awaiter(void 0, void 0, void 0, function* () {
            const expected = (0, helpers_1.getMockOutOfBand)();
            (0, helpers_1.mockFunction)(outOfBandRepository.findById).mockReturnValue(Promise.resolve(expected));
            const result = yield outOfBandService.findById(agentContext, expected.id);
            expect(outOfBandRepository.findById).toBeCalledWith(agentContext, expected.id);
            expect(result).toBe(expected);
        }));
        it('getAll should return value from outOfBandRepository.getAll', () => __awaiter(void 0, void 0, void 0, function* () {
            const expected = [(0, helpers_1.getMockOutOfBand)(), (0, helpers_1.getMockOutOfBand)()];
            (0, helpers_1.mockFunction)(outOfBandRepository.getAll).mockReturnValue(Promise.resolve(expected));
            const result = yield outOfBandService.getAll(agentContext);
            expect(outOfBandRepository.getAll).toBeCalledWith(agentContext);
            expect(result).toEqual(expect.arrayContaining(expected));
        }));
        it('findAllByQuery should return value from outOfBandRepository.findByQuery', () => __awaiter(void 0, void 0, void 0, function* () {
            const expected = [(0, helpers_1.getMockOutOfBand)(), (0, helpers_1.getMockOutOfBand)()];
            (0, helpers_1.mockFunction)(outOfBandRepository.findByQuery).mockReturnValue(Promise.resolve(expected));
            const result = yield outOfBandService.findAllByQuery(agentContext, { state: OutOfBandState_1.OutOfBandState.Initial });
            expect(outOfBandRepository.findByQuery).toBeCalledWith(agentContext, { state: OutOfBandState_1.OutOfBandState.Initial });
            expect(result).toEqual(expect.arrayContaining(expected));
        }));
    });
});
