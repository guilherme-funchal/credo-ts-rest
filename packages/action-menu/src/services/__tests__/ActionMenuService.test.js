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
const core_1 = require("@aries-framework/core");
const rxjs_1 = require("rxjs");
const helpers_1 = require("../../../../core/tests/helpers");
const ActionMenuEvents_1 = require("../../ActionMenuEvents");
const ActionMenuRole_1 = require("../../ActionMenuRole");
const ActionMenuState_1 = require("../../ActionMenuState");
const ActionMenuProblemReportError_1 = require("../../errors/ActionMenuProblemReportError");
const ActionMenuProblemReportReason_1 = require("../../errors/ActionMenuProblemReportReason");
const messages_1 = require("../../messages");
const models_1 = require("../../models");
const repository_1 = require("../../repository");
const ActionMenuService_1 = require("../ActionMenuService");
jest.mock('../../repository/ActionMenuRepository');
const ActionMenuRepositoryMock = repository_1.ActionMenuRepository;
describe('ActionMenuService', () => {
    const mockConnectionRecord = (0, helpers_1.getMockConnection)({
        id: 'd3849ac3-c981-455b-a1aa-a10bea6cead8',
        did: 'did:sov:C2SsBf5QUQpqSAQfhu3sd2',
        state: core_1.DidExchangeState.Completed,
    });
    let actionMenuRepository;
    let actionMenuService;
    let eventEmitter;
    let agentConfig;
    let agentContext;
    const mockActionMenuRecord = (options) => {
        return new repository_1.ActionMenuRecord({
            connectionId: options.connectionId,
            role: options.role,
            state: options.state,
            threadId: options.threadId,
            menu: options.menu,
            performedAction: options.performedAction,
        });
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agentConfig = (0, helpers_1.getAgentConfig)('ActionMenuServiceTest');
        agentContext = (0, helpers_1.getAgentContext)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        actionMenuRepository = new ActionMenuRepositoryMock();
        eventEmitter = new core_1.EventEmitter(helpers_1.agentDependencies, new rxjs_1.Subject());
        actionMenuService = new ActionMenuService_1.ActionMenuService(actionMenuRepository, agentConfig, eventEmitter);
    }));
    describe('createMenu', () => {
        let testMenu;
        beforeAll(() => {
            testMenu = new models_1.ActionMenu({
                description: 'menu-description',
                title: 'menu-title',
                options: [{ name: 'opt1', title: 'opt1-title', description: 'opt1-desc' }],
            });
        });
        it(`throws an error when duplicated options are specified`, () => __awaiter(void 0, void 0, void 0, function* () {
            expect(actionMenuService.createMenu(agentContext, {
                connection: mockConnectionRecord,
                menu: {
                    title: 'menu-title',
                    description: 'menu-description',
                    options: [
                        { name: 'opt1', description: 'desc1', title: 'title1' },
                        { name: 'opt2', description: 'desc2', title: 'title2' },
                        { name: 'opt1', description: 'desc3', title: 'title3' },
                        { name: 'opt4', description: 'desc4', title: 'title4' },
                    ],
                },
            })).rejects.toThrowError('Action Menu contains duplicated options');
        }));
        it(`no previous menu: emits a menu with title, description and options`, () => __awaiter(void 0, void 0, void 0, function* () {
            // No previous menu
            (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(null));
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            yield actionMenuService.createMenu(agentContext, {
                connection: mockConnectionRecord,
                menu: testMenu,
            });
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: null,
                    actionMenuRecord: expect.objectContaining({
                        connectionId: mockConnectionRecord.id,
                        role: ActionMenuRole_1.ActionMenuRole.Responder,
                        state: ActionMenuState_1.ActionMenuState.AwaitingSelection,
                        menu: expect.objectContaining({
                            description: 'menu-description',
                            title: 'menu-title',
                            options: [{ name: 'opt1', title: 'opt1-title', description: 'opt1-desc' }],
                        }),
                    }),
                },
            });
        }));
        it(`existing menu: emits a menu with title, description, options and thread`, () => __awaiter(void 0, void 0, void 0, function* () {
            // Previous menu is in Done state
            const previousMenuDone = mockActionMenuRecord({
                connectionId: mockConnectionRecord.id,
                role: ActionMenuRole_1.ActionMenuRole.Responder,
                state: ActionMenuState_1.ActionMenuState.Done,
                threadId: 'threadId-1',
            });
            (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(previousMenuDone));
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            yield actionMenuService.createMenu(agentContext, {
                connection: mockConnectionRecord,
                menu: testMenu,
            });
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: ActionMenuState_1.ActionMenuState.Done,
                    actionMenuRecord: expect.objectContaining({
                        connectionId: mockConnectionRecord.id,
                        threadId: 'threadId-1',
                        role: ActionMenuRole_1.ActionMenuRole.Responder,
                        state: ActionMenuState_1.ActionMenuState.AwaitingSelection,
                        menu: expect.objectContaining({
                            description: 'menu-description',
                            title: 'menu-title',
                            options: [{ name: 'opt1', title: 'opt1-title', description: 'opt1-desc' }],
                        }),
                    }),
                },
            });
        }));
        it(`existing menu, cleared: emits a menu with title, description, options and new thread`, () => __awaiter(void 0, void 0, void 0, function* () {
            // Previous menu is in Done state
            const previousMenuClear = mockActionMenuRecord({
                connectionId: mockConnectionRecord.id,
                role: ActionMenuRole_1.ActionMenuRole.Responder,
                state: ActionMenuState_1.ActionMenuState.Null,
                threadId: 'threadId-1',
            });
            (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(previousMenuClear));
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            yield actionMenuService.createMenu(agentContext, {
                connection: mockConnectionRecord,
                menu: testMenu,
            });
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: ActionMenuState_1.ActionMenuState.Null,
                    actionMenuRecord: expect.objectContaining({
                        connectionId: mockConnectionRecord.id,
                        threadId: expect.not.stringMatching('threadId-1'),
                        role: ActionMenuRole_1.ActionMenuRole.Responder,
                        state: ActionMenuState_1.ActionMenuState.AwaitingSelection,
                        menu: expect.objectContaining({
                            description: 'menu-description',
                            title: 'menu-title',
                            options: [{ name: 'opt1', title: 'opt1-title', description: 'opt1-desc' }],
                        }),
                    }),
                },
            });
        }));
    });
    describe('createPerform', () => {
        let mockRecord;
        beforeEach(() => {
            const testMenu = new models_1.ActionMenu({
                description: 'menu-description',
                title: 'menu-title',
                options: [
                    { name: 'opt1', title: 'opt1-title', description: 'opt1-desc' },
                    { name: 'opt2', title: 'opt2-title', description: 'opt2-desc' },
                ],
            });
            mockRecord = mockActionMenuRecord({
                connectionId: mockConnectionRecord.id,
                role: ActionMenuRole_1.ActionMenuRole.Requester,
                state: ActionMenuState_1.ActionMenuState.PreparingSelection,
                threadId: '123',
                menu: testMenu,
            });
        });
        it(`throws an error when invalid selection is provided`, () => __awaiter(void 0, void 0, void 0, function* () {
            expect(actionMenuService.createPerform(agentContext, {
                actionMenuRecord: mockRecord,
                performedAction: { name: 'fake' },
            })).rejects.toThrowError('Selection does not match valid actions');
        }));
        it(`throws an error when state is not preparing-selection`, () => __awaiter(void 0, void 0, void 0, function* () {
            for (const state of Object.values(ActionMenuState_1.ActionMenuState).filter((state) => state !== ActionMenuState_1.ActionMenuState.PreparingSelection)) {
                mockRecord.state = state;
                expect(actionMenuService.createPerform(agentContext, {
                    actionMenuRecord: mockRecord,
                    performedAction: { name: 'opt1' },
                })).rejects.toThrowError(`Action Menu record is in invalid state ${state}. Valid states are: preparing-selection.`);
            }
        }));
        it(`emits a menu with a valid selection and action menu record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockRecord));
            yield actionMenuService.createPerform(agentContext, {
                actionMenuRecord: mockRecord,
                performedAction: { name: 'opt2' },
            });
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: ActionMenuState_1.ActionMenuState.PreparingSelection,
                    actionMenuRecord: expect.objectContaining({
                        connectionId: mockConnectionRecord.id,
                        role: ActionMenuRole_1.ActionMenuRole.Requester,
                        state: ActionMenuState_1.ActionMenuState.Done,
                        performedAction: { name: 'opt2' },
                    }),
                },
            });
        }));
    });
    describe('createRequest', () => {
        let mockRecord;
        beforeEach(() => {
            const testMenu = new models_1.ActionMenu({
                description: 'menu-description',
                title: 'menu-title',
                options: [
                    { name: 'opt1', title: 'opt1-title', description: 'opt1-desc' },
                    { name: 'opt2', title: 'opt2-title', description: 'opt2-desc' },
                ],
            });
            mockRecord = mockActionMenuRecord({
                connectionId: mockConnectionRecord.id,
                role: ActionMenuRole_1.ActionMenuRole.Requester,
                state: ActionMenuState_1.ActionMenuState.PreparingSelection,
                threadId: '123',
                menu: testMenu,
            });
        });
        it(`no existing record: emits event and creates new request and record`, () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(null));
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            const { message, record } = yield actionMenuService.createRequest(agentContext, {
                connection: mockConnectionRecord,
            });
            const expectedRecord = {
                id: expect.any(String),
                connectionId: mockConnectionRecord.id,
                role: ActionMenuRole_1.ActionMenuRole.Requester,
                threadId: message.threadId,
                state: ActionMenuState_1.ActionMenuState.AwaitingRootMenu,
                menu: undefined,
                performedAction: undefined,
            };
            expect(record).toMatchObject(expectedRecord);
            expect(actionMenuRepository.save).toHaveBeenCalledWith(agentContext, expect.objectContaining(expectedRecord));
            expect(actionMenuRepository.update).not.toHaveBeenCalled();
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: null,
                    actionMenuRecord: expect.objectContaining(expectedRecord),
                },
            });
        }));
        it(`already existing record: emits event, creates new request and updates record`, () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockRecord));
            const previousState = mockRecord.state;
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            const { message, record } = yield actionMenuService.createRequest(agentContext, {
                connection: mockConnectionRecord,
            });
            const expectedRecord = {
                id: expect.any(String),
                connectionId: mockConnectionRecord.id,
                role: ActionMenuRole_1.ActionMenuRole.Requester,
                threadId: message.threadId,
                state: ActionMenuState_1.ActionMenuState.AwaitingRootMenu,
                menu: undefined,
                performedAction: undefined,
            };
            expect(record).toMatchObject(expectedRecord);
            expect(actionMenuRepository.update).toHaveBeenCalledWith(agentContext, expect.objectContaining(expectedRecord));
            expect(actionMenuRepository.save).not.toHaveBeenCalled();
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState,
                    actionMenuRecord: expect.objectContaining(expectedRecord),
                },
            });
        }));
    });
    describe('clearMenu', () => {
        let mockRecord;
        beforeEach(() => {
            const testMenu = new models_1.ActionMenu({
                description: 'menu-description',
                title: 'menu-title',
                options: [
                    { name: 'opt1', title: 'opt1-title', description: 'opt1-desc' },
                    { name: 'opt2', title: 'opt2-title', description: 'opt2-desc' },
                ],
            });
            mockRecord = mockActionMenuRecord({
                connectionId: mockConnectionRecord.id,
                role: ActionMenuRole_1.ActionMenuRole.Requester,
                state: ActionMenuState_1.ActionMenuState.PreparingSelection,
                threadId: '123',
                menu: testMenu,
                performedAction: { name: 'opt1' },
            });
        });
        it(`requester role: emits a cleared menu`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            mockRecord.role = ActionMenuRole_1.ActionMenuRole.Requester;
            (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockRecord));
            yield actionMenuService.clearMenu(agentContext, {
                actionMenuRecord: mockRecord,
            });
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: ActionMenuState_1.ActionMenuState.PreparingSelection,
                    actionMenuRecord: expect.objectContaining({
                        connectionId: mockConnectionRecord.id,
                        role: ActionMenuRole_1.ActionMenuRole.Requester,
                        state: ActionMenuState_1.ActionMenuState.Null,
                        menu: undefined,
                        performedAction: undefined,
                    }),
                },
            });
        }));
        it(`responder role: emits a cleared menu`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            mockRecord.state = ActionMenuState_1.ActionMenuState.AwaitingSelection;
            mockRecord.role = ActionMenuRole_1.ActionMenuRole.Responder;
            (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockRecord));
            yield actionMenuService.clearMenu(agentContext, {
                actionMenuRecord: mockRecord,
            });
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: ActionMenuState_1.ActionMenuState.AwaitingSelection,
                    actionMenuRecord: expect.objectContaining({
                        connectionId: mockConnectionRecord.id,
                        role: ActionMenuRole_1.ActionMenuRole.Responder,
                        state: ActionMenuState_1.ActionMenuState.Null,
                        menu: undefined,
                        performedAction: undefined,
                    }),
                },
            });
        }));
    });
    describe('processMenu', () => {
        let mockRecord;
        let mockMenuMessage;
        beforeEach(() => {
            mockRecord = mockActionMenuRecord({
                connectionId: mockConnectionRecord.id,
                role: ActionMenuRole_1.ActionMenuRole.Requester,
                state: ActionMenuState_1.ActionMenuState.PreparingSelection,
                threadId: '123',
                menu: new models_1.ActionMenu({
                    description: 'menu-description',
                    title: 'menu-title',
                    options: [
                        { name: 'opt1', title: 'opt1-title', description: 'opt1-desc' },
                        { name: 'opt2', title: 'opt2-title', description: 'opt2-desc' },
                    ],
                }),
                performedAction: { name: 'opt1' },
            });
            mockMenuMessage = new messages_1.MenuMessage({
                title: 'incoming title',
                description: 'incoming description',
                options: [
                    {
                        title: 'incoming option 1 title',
                        description: 'incoming option 1 description',
                        name: 'incoming option 1 name',
                    },
                ],
            });
        });
        it(`emits event and creates record when no previous record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const messageContext = new core_1.InboundMessageContext(mockMenuMessage, {
                agentContext,
                connection: mockConnectionRecord,
            });
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(null));
            yield actionMenuService.processMenu(messageContext);
            const expectedRecord = {
                connectionId: mockConnectionRecord.id,
                role: ActionMenuRole_1.ActionMenuRole.Requester,
                state: ActionMenuState_1.ActionMenuState.PreparingSelection,
                threadId: messageContext.message.threadId,
                menu: expect.objectContaining({
                    title: 'incoming title',
                    description: 'incoming description',
                    options: [
                        {
                            title: 'incoming option 1 title',
                            description: 'incoming option 1 description',
                            name: 'incoming option 1 name',
                        },
                    ],
                }),
                performedAction: undefined,
            };
            expect(actionMenuRepository.save).toHaveBeenCalledWith(agentContext, expect.objectContaining(expectedRecord));
            expect(actionMenuRepository.update).not.toHaveBeenCalled();
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: null,
                    actionMenuRecord: expect.objectContaining(expectedRecord),
                },
            });
        }));
        it(`emits event and updates record when existing record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const messageContext = new core_1.InboundMessageContext(mockMenuMessage, {
                agentContext,
                connection: mockConnectionRecord,
            });
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            // It should accept any previous state
            for (const state of Object.values(ActionMenuState_1.ActionMenuState)) {
                mockRecord.state = state;
                const previousState = state;
                (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockRecord));
                yield actionMenuService.processMenu(messageContext);
                const expectedRecord = {
                    connectionId: mockConnectionRecord.id,
                    role: ActionMenuRole_1.ActionMenuRole.Requester,
                    state: ActionMenuState_1.ActionMenuState.PreparingSelection,
                    threadId: messageContext.message.threadId,
                    menu: expect.objectContaining({
                        title: 'incoming title',
                        description: 'incoming description',
                        options: [
                            {
                                title: 'incoming option 1 title',
                                description: 'incoming option 1 description',
                                name: 'incoming option 1 name',
                            },
                        ],
                    }),
                    performedAction: undefined,
                };
                expect(actionMenuRepository.update).toHaveBeenCalledWith(agentContext, expect.objectContaining(expectedRecord));
                expect(actionMenuRepository.save).not.toHaveBeenCalled();
                expect(eventListenerMock).toHaveBeenCalledWith({
                    type: ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged,
                    metadata: {
                        contextCorrelationId: 'mock',
                    },
                    payload: {
                        previousState,
                        actionMenuRecord: expect.objectContaining(expectedRecord),
                    },
                });
            }
        }));
    });
    describe('processPerform', () => {
        let mockRecord;
        beforeEach(() => {
            mockRecord = mockActionMenuRecord({
                connectionId: mockConnectionRecord.id,
                role: ActionMenuRole_1.ActionMenuRole.Responder,
                state: ActionMenuState_1.ActionMenuState.AwaitingSelection,
                threadId: '123',
                menu: new models_1.ActionMenu({
                    description: 'menu-description',
                    title: 'menu-title',
                    options: [
                        { name: 'opt1', title: 'opt1-title', description: 'opt1-desc' },
                        { name: 'opt2', title: 'opt2-title', description: 'opt2-desc' },
                    ],
                }),
            });
        });
        it(`emits event and saves record when valid selection and thread Id`, () => __awaiter(void 0, void 0, void 0, function* () {
            const mockPerformMessage = new messages_1.PerformMessage({
                name: 'opt1',
                threadId: '123',
            });
            const messageContext = new core_1.InboundMessageContext(mockPerformMessage, {
                agentContext,
                connection: mockConnectionRecord,
            });
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockRecord));
            yield actionMenuService.processPerform(messageContext);
            const expectedRecord = {
                connectionId: mockConnectionRecord.id,
                role: ActionMenuRole_1.ActionMenuRole.Responder,
                state: ActionMenuState_1.ActionMenuState.Done,
                threadId: messageContext.message.threadId,
                menu: expect.objectContaining({
                    description: 'menu-description',
                    title: 'menu-title',
                    options: [
                        { name: 'opt1', title: 'opt1-title', description: 'opt1-desc' },
                        { name: 'opt2', title: 'opt2-title', description: 'opt2-desc' },
                    ],
                }),
                performedAction: { name: 'opt1' },
            };
            expect(actionMenuRepository.findSingleByQuery).toHaveBeenCalledWith(agentContext, expect.objectContaining({
                connectionId: mockConnectionRecord.id,
                role: ActionMenuRole_1.ActionMenuRole.Responder,
                threadId: messageContext.message.threadId,
            }));
            expect(actionMenuRepository.update).toHaveBeenCalledWith(agentContext, expect.objectContaining(expectedRecord));
            expect(actionMenuRepository.save).not.toHaveBeenCalled();
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: ActionMenuState_1.ActionMenuState.AwaitingSelection,
                    actionMenuRecord: expect.objectContaining(expectedRecord),
                },
            });
        }));
        it(`throws error when invalid selection`, () => __awaiter(void 0, void 0, void 0, function* () {
            const mockPerformMessage = new messages_1.PerformMessage({
                name: 'fake',
                threadId: '123',
            });
            const messageContext = new core_1.InboundMessageContext(mockPerformMessage, {
                agentContext,
                connection: mockConnectionRecord,
            });
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockRecord));
            expect(actionMenuService.processPerform(messageContext)).rejects.toThrowError('Selection does not match valid actions');
            expect(actionMenuRepository.update).not.toHaveBeenCalled();
            expect(actionMenuRepository.save).not.toHaveBeenCalled();
            expect(eventListenerMock).not.toHaveBeenCalled();
        }));
        it(`throws error when record not found`, () => __awaiter(void 0, void 0, void 0, function* () {
            const mockPerformMessage = new messages_1.PerformMessage({
                name: 'opt1',
                threadId: '122',
            });
            const messageContext = new core_1.InboundMessageContext(mockPerformMessage, {
                agentContext,
                connection: mockConnectionRecord,
            });
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(null));
            expect(actionMenuService.processPerform(messageContext)).rejects.toThrowError(`No Action Menu found with thread id ${mockPerformMessage.threadId}`);
            expect(actionMenuRepository.update).not.toHaveBeenCalled();
            expect(actionMenuRepository.save).not.toHaveBeenCalled();
            expect(eventListenerMock).not.toHaveBeenCalled();
        }));
        it(`throws error when invalid state`, () => __awaiter(void 0, void 0, void 0, function* () {
            const mockPerformMessage = new messages_1.PerformMessage({
                name: 'opt1',
                threadId: '123',
            });
            const messageContext = new core_1.InboundMessageContext(mockPerformMessage, {
                agentContext,
                connection: mockConnectionRecord,
            });
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            mockRecord.state = ActionMenuState_1.ActionMenuState.Done;
            (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockRecord));
            expect(actionMenuService.processPerform(messageContext)).rejects.toThrowError(`Action Menu record is in invalid state ${mockRecord.state}. Valid states are: ${ActionMenuState_1.ActionMenuState.AwaitingSelection}.`);
            expect(actionMenuRepository.update).not.toHaveBeenCalled();
            expect(actionMenuRepository.save).not.toHaveBeenCalled();
            expect(eventListenerMock).not.toHaveBeenCalled();
        }));
        it(`throws problem report error when menu has been cleared`, () => __awaiter(void 0, void 0, void 0, function* () {
            const mockPerformMessage = new messages_1.PerformMessage({
                name: 'opt1',
                threadId: '123',
            });
            const messageContext = new core_1.InboundMessageContext(mockPerformMessage, {
                agentContext,
                connection: mockConnectionRecord,
            });
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            mockRecord.state = ActionMenuState_1.ActionMenuState.Null;
            (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockRecord));
            expect(actionMenuService.processPerform(messageContext)).rejects.toThrowError(new ActionMenuProblemReportError_1.ActionMenuProblemReportError('Action Menu has been cleared by the responder', {
                problemCode: ActionMenuProblemReportReason_1.ActionMenuProblemReportReason.Timeout,
            }));
            expect(actionMenuRepository.update).not.toHaveBeenCalled();
            expect(actionMenuRepository.save).not.toHaveBeenCalled();
            expect(eventListenerMock).not.toHaveBeenCalled();
        }));
    });
    describe('processRequest', () => {
        let mockRecord;
        let mockMenuRequestMessage;
        beforeEach(() => {
            mockRecord = mockActionMenuRecord({
                connectionId: mockConnectionRecord.id,
                role: ActionMenuRole_1.ActionMenuRole.Responder,
                state: ActionMenuState_1.ActionMenuState.PreparingRootMenu,
                threadId: '123',
                menu: new models_1.ActionMenu({
                    description: 'menu-description',
                    title: 'menu-title',
                    options: [
                        { name: 'opt1', title: 'opt1-title', description: 'opt1-desc' },
                        { name: 'opt2', title: 'opt2-title', description: 'opt2-desc' },
                    ],
                }),
                performedAction: { name: 'opt1' },
            });
            mockMenuRequestMessage = new messages_1.MenuRequestMessage({});
        });
        it(`emits event and creates record when no previous record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const messageContext = new core_1.InboundMessageContext(mockMenuRequestMessage, {
                agentContext,
                connection: mockConnectionRecord,
            });
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(null));
            yield actionMenuService.processRequest(messageContext);
            const expectedRecord = {
                connectionId: mockConnectionRecord.id,
                role: ActionMenuRole_1.ActionMenuRole.Responder,
                state: ActionMenuState_1.ActionMenuState.PreparingRootMenu,
                threadId: messageContext.message.threadId,
                menu: undefined,
                performedAction: undefined,
            };
            expect(actionMenuRepository.save).toHaveBeenCalledWith(agentContext, expect.objectContaining(expectedRecord));
            expect(actionMenuRepository.update).not.toHaveBeenCalled();
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    previousState: null,
                    actionMenuRecord: expect.objectContaining(expectedRecord),
                },
            });
        }));
        it(`emits event and updates record when existing record`, () => __awaiter(void 0, void 0, void 0, function* () {
            const messageContext = new core_1.InboundMessageContext(mockMenuRequestMessage, {
                agentContext,
                connection: mockConnectionRecord,
            });
            const eventListenerMock = jest.fn();
            eventEmitter.on(ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged, eventListenerMock);
            // It should accept any previous state
            for (const state of Object.values(ActionMenuState_1.ActionMenuState)) {
                mockRecord.state = state;
                const previousState = state;
                (0, helpers_1.mockFunction)(actionMenuRepository.findSingleByQuery).mockReturnValue(Promise.resolve(mockRecord));
                yield actionMenuService.processRequest(messageContext);
                const expectedRecord = {
                    connectionId: mockConnectionRecord.id,
                    role: ActionMenuRole_1.ActionMenuRole.Responder,
                    state: ActionMenuState_1.ActionMenuState.PreparingRootMenu,
                    threadId: messageContext.message.threadId,
                    menu: undefined,
                    performedAction: undefined,
                };
                expect(actionMenuRepository.update).toHaveBeenCalledWith(agentContext, expect.objectContaining(expectedRecord));
                expect(actionMenuRepository.save).not.toHaveBeenCalled();
                expect(eventListenerMock).toHaveBeenCalledWith({
                    type: ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged,
                    metadata: {
                        contextCorrelationId: 'mock',
                    },
                    payload: {
                        previousState,
                        actionMenuRecord: expect.objectContaining(expectedRecord),
                    },
                });
            }
        }));
    });
});
