"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionMenuService = void 0;
const core_1 = require("@aries-framework/core");
const ActionMenuEvents_1 = require("../ActionMenuEvents");
const ActionMenuRole_1 = require("../ActionMenuRole");
const ActionMenuState_1 = require("../ActionMenuState");
const ActionMenuProblemReportError_1 = require("../errors/ActionMenuProblemReportError");
const ActionMenuProblemReportReason_1 = require("../errors/ActionMenuProblemReportReason");
const messages_1 = require("../messages");
const models_1 = require("../models");
const repository_1 = require("../repository");
/**
 * @internal
 */
let ActionMenuService = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ActionMenuService = _classThis = class {
        constructor(actionMenuRepository, agentConfig, eventEmitter) {
            this.actionMenuRepository = actionMenuRepository;
            this.eventEmitter = eventEmitter;
            this.logger = agentConfig.logger;
        }
        createRequest(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                // Assert
                options.connection.assertReady();
                // Create message
                const menuRequestMessage = new messages_1.MenuRequestMessage({});
                // Create record if not existent for connection/role
                let actionMenuRecord = yield this.find(agentContext, {
                    connectionId: options.connection.id,
                    role: ActionMenuRole_1.ActionMenuRole.Requester,
                });
                if (actionMenuRecord) {
                    // Protocol will be restarted and menu cleared
                    const previousState = actionMenuRecord.state;
                    actionMenuRecord.state = ActionMenuState_1.ActionMenuState.AwaitingRootMenu;
                    actionMenuRecord.threadId = menuRequestMessage.id;
                    actionMenuRecord.menu = undefined;
                    actionMenuRecord.performedAction = undefined;
                    yield this.actionMenuRepository.update(agentContext, actionMenuRecord);
                    this.emitStateChangedEvent(agentContext, actionMenuRecord, previousState);
                }
                else {
                    actionMenuRecord = new repository_1.ActionMenuRecord({
                        connectionId: options.connection.id,
                        role: ActionMenuRole_1.ActionMenuRole.Requester,
                        state: ActionMenuState_1.ActionMenuState.AwaitingRootMenu,
                        threadId: menuRequestMessage.threadId,
                    });
                    yield this.actionMenuRepository.save(agentContext, actionMenuRecord);
                    this.emitStateChangedEvent(agentContext, actionMenuRecord, null);
                }
                return { message: menuRequestMessage, record: actionMenuRecord };
            });
        }
        processRequest(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const { message: menuRequestMessage, agentContext } = messageContext;
                this.logger.debug(`Processing menu request with id ${menuRequestMessage.id}`);
                // Assert
                const connection = messageContext.assertReadyConnection();
                let actionMenuRecord = yield this.find(agentContext, {
                    connectionId: connection.id,
                    role: ActionMenuRole_1.ActionMenuRole.Responder,
                });
                if (actionMenuRecord) {
                    // Protocol will be restarted and menu cleared
                    const previousState = actionMenuRecord.state;
                    actionMenuRecord.state = ActionMenuState_1.ActionMenuState.PreparingRootMenu;
                    actionMenuRecord.threadId = menuRequestMessage.id;
                    actionMenuRecord.menu = undefined;
                    actionMenuRecord.performedAction = undefined;
                    yield this.actionMenuRepository.update(agentContext, actionMenuRecord);
                    this.emitStateChangedEvent(agentContext, actionMenuRecord, previousState);
                }
                else {
                    // Create record
                    actionMenuRecord = new repository_1.ActionMenuRecord({
                        connectionId: connection.id,
                        role: ActionMenuRole_1.ActionMenuRole.Responder,
                        state: ActionMenuState_1.ActionMenuState.PreparingRootMenu,
                        threadId: menuRequestMessage.threadId,
                    });
                    yield this.actionMenuRepository.save(agentContext, actionMenuRecord);
                    this.emitStateChangedEvent(agentContext, actionMenuRecord, null);
                }
                return actionMenuRecord;
            });
        }
        createMenu(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                // Assert connection ready
                options.connection.assertReady();
                const uniqueNames = new Set(options.menu.options.map((v) => v.name));
                if (uniqueNames.size < options.menu.options.length) {
                    throw new core_1.AriesFrameworkError('Action Menu contains duplicated options');
                }
                // Create message
                const menuMessage = new messages_1.MenuMessage({
                    title: options.menu.title,
                    description: options.menu.description,
                    options: options.menu.options,
                });
                // Check if there is an existing menu for this connection and role
                let actionMenuRecord = yield this.find(agentContext, {
                    connectionId: options.connection.id,
                    role: ActionMenuRole_1.ActionMenuRole.Responder,
                });
                // If so, continue existing flow
                if (actionMenuRecord) {
                    actionMenuRecord.assertState([ActionMenuState_1.ActionMenuState.Null, ActionMenuState_1.ActionMenuState.PreparingRootMenu, ActionMenuState_1.ActionMenuState.Done]);
                    // The new menu will be bound to the existing thread
                    // unless it is in null state (protocol reset)
                    if (actionMenuRecord.state !== ActionMenuState_1.ActionMenuState.Null) {
                        menuMessage.setThread({ threadId: actionMenuRecord.threadId });
                    }
                    const previousState = actionMenuRecord.state;
                    actionMenuRecord.menu = options.menu;
                    actionMenuRecord.state = ActionMenuState_1.ActionMenuState.AwaitingSelection;
                    actionMenuRecord.threadId = menuMessage.threadId;
                    yield this.actionMenuRepository.update(agentContext, actionMenuRecord);
                    this.emitStateChangedEvent(agentContext, actionMenuRecord, previousState);
                }
                else {
                    // Create record
                    actionMenuRecord = new repository_1.ActionMenuRecord({
                        connectionId: options.connection.id,
                        role: ActionMenuRole_1.ActionMenuRole.Responder,
                        state: ActionMenuState_1.ActionMenuState.AwaitingSelection,
                        menu: options.menu,
                        threadId: menuMessage.threadId,
                    });
                    yield this.actionMenuRepository.save(agentContext, actionMenuRecord);
                    this.emitStateChangedEvent(agentContext, actionMenuRecord, null);
                }
                return { message: menuMessage, record: actionMenuRecord };
            });
        }
        processMenu(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const { message: menuMessage, agentContext } = messageContext;
                this.logger.debug(`Processing action menu with id ${menuMessage.id}`);
                // Assert
                const connection = messageContext.assertReadyConnection();
                // Check if there is an existing menu for this connection and role
                const record = yield this.find(agentContext, {
                    connectionId: connection.id,
                    role: ActionMenuRole_1.ActionMenuRole.Requester,
                });
                if (record) {
                    // Record found: update with menu details
                    const previousState = record.state;
                    record.state = ActionMenuState_1.ActionMenuState.PreparingSelection;
                    record.menu = new models_1.ActionMenu({
                        title: menuMessage.title,
                        description: menuMessage.description,
                        options: menuMessage.options,
                    });
                    record.threadId = menuMessage.threadId;
                    record.performedAction = undefined;
                    yield this.actionMenuRepository.update(agentContext, record);
                    this.emitStateChangedEvent(agentContext, record, previousState);
                }
                else {
                    // Record not found: create it
                    const actionMenuRecord = new repository_1.ActionMenuRecord({
                        connectionId: connection.id,
                        role: ActionMenuRole_1.ActionMenuRole.Requester,
                        state: ActionMenuState_1.ActionMenuState.PreparingSelection,
                        threadId: menuMessage.threadId,
                        menu: new models_1.ActionMenu({
                            title: menuMessage.title,
                            description: menuMessage.description,
                            options: menuMessage.options,
                        }),
                    });
                    yield this.actionMenuRepository.save(agentContext, actionMenuRecord);
                    this.emitStateChangedEvent(agentContext, actionMenuRecord, null);
                }
            });
        }
        createPerform(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { actionMenuRecord: record, performedAction: performedSelection } = options;
                // Assert
                record.assertRole(ActionMenuRole_1.ActionMenuRole.Requester);
                record.assertState([ActionMenuState_1.ActionMenuState.PreparingSelection]);
                const validSelection = (_a = record.menu) === null || _a === void 0 ? void 0 : _a.options.some((item) => item.name === performedSelection.name);
                if (!validSelection) {
                    throw new core_1.AriesFrameworkError('Selection does not match valid actions');
                }
                const previousState = record.state;
                // Create message
                const menuMessage = new messages_1.PerformMessage({
                    name: performedSelection.name,
                    params: performedSelection.params,
                    threadId: record.threadId,
                });
                // Update record
                record.performedAction = options.performedAction;
                record.state = ActionMenuState_1.ActionMenuState.Done;
                yield this.actionMenuRepository.update(agentContext, record);
                this.emitStateChangedEvent(agentContext, record, previousState);
                return { message: menuMessage, record };
            });
        }
        processPerform(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { message: performMessage, agentContext } = messageContext;
                this.logger.debug(`Processing action menu perform with id ${performMessage.id}`);
                const connection = messageContext.assertReadyConnection();
                // Check if there is an existing menu for this connection and role
                const record = yield this.find(agentContext, {
                    connectionId: connection.id,
                    role: ActionMenuRole_1.ActionMenuRole.Responder,
                    threadId: performMessage.threadId,
                });
                if (record) {
                    // Record found: check state and update with menu details
                    // A Null state means that menu has been cleared by the responder.
                    // Requester should be informed in order to request another menu
                    if (record.state === ActionMenuState_1.ActionMenuState.Null) {
                        throw new ActionMenuProblemReportError_1.ActionMenuProblemReportError('Action Menu has been cleared by the responder', {
                            problemCode: ActionMenuProblemReportReason_1.ActionMenuProblemReportReason.Timeout,
                        });
                    }
                    record.assertState([ActionMenuState_1.ActionMenuState.AwaitingSelection]);
                    const validSelection = (_a = record.menu) === null || _a === void 0 ? void 0 : _a.options.some((item) => item.name === performMessage.name);
                    if (!validSelection) {
                        throw new core_1.AriesFrameworkError('Selection does not match valid actions');
                    }
                    const previousState = record.state;
                    record.state = ActionMenuState_1.ActionMenuState.Done;
                    record.performedAction = new models_1.ActionMenuSelection({ name: performMessage.name, params: performMessage.params });
                    yield this.actionMenuRepository.update(agentContext, record);
                    this.emitStateChangedEvent(agentContext, record, previousState);
                }
                else {
                    throw new core_1.AriesFrameworkError(`No Action Menu found with thread id ${messageContext.message.threadId}`);
                }
            });
        }
        clearMenu(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { actionMenuRecord: record } = options;
                const previousState = record.state;
                // Update record
                record.state = ActionMenuState_1.ActionMenuState.Null;
                record.menu = undefined;
                record.performedAction = undefined;
                yield this.actionMenuRepository.update(agentContext, record);
                this.emitStateChangedEvent(agentContext, record, previousState);
                return record;
            });
        }
        processProblemReport(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const { message: actionMenuProblemReportMessage, agentContext } = messageContext;
                const connection = messageContext.assertReadyConnection();
                this.logger.debug(`Processing problem report with id ${actionMenuProblemReportMessage.id}`);
                const actionMenuRecord = yield this.find(agentContext, {
                    role: ActionMenuRole_1.ActionMenuRole.Requester,
                    connectionId: connection.id,
                });
                if (!actionMenuRecord) {
                    throw new core_1.AriesFrameworkError(`Unable to process action menu problem: record not found for connection id ${connection.id}`);
                }
                // Clear menu to restart flow
                return yield this.clearMenu(agentContext, { actionMenuRecord });
            });
        }
        findById(agentContext, actionMenuRecordId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.actionMenuRepository.findById(agentContext, actionMenuRecordId);
            });
        }
        find(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.actionMenuRepository.findSingleByQuery(agentContext, {
                    connectionId: options.connectionId,
                    role: options.role,
                    threadId: options.threadId,
                });
            });
        }
        findAllByQuery(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.actionMenuRepository.findByQuery(agentContext, options);
            });
        }
        emitStateChangedEvent(agentContext, actionMenuRecord, previousState) {
            this.eventEmitter.emit(agentContext, {
                type: ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged,
                payload: {
                    actionMenuRecord: actionMenuRecord.clone(),
                    previousState: previousState,
                },
            });
        }
    };
    __setFunctionName(_classThis, "ActionMenuService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ActionMenuService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ActionMenuService = _classThis;
})();
exports.ActionMenuService = ActionMenuService;
