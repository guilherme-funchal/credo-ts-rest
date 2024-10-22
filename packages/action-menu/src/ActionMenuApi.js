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
exports.ActionMenuApi = void 0;
const core_1 = require("@aries-framework/core");
const ActionMenuRole_1 = require("./ActionMenuRole");
const handlers_1 = require("./handlers");
/**
 * @public
 */
let ActionMenuApi = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ActionMenuApi = _classThis = class {
        constructor(connectionService, messageSender, actionMenuService, agentContext) {
            this.connectionService = connectionService;
            this.messageSender = messageSender;
            this.actionMenuService = actionMenuService;
            this.agentContext = agentContext;
            this.agentContext.dependencyManager.registerMessageHandlers([
                new handlers_1.ActionMenuProblemReportHandler(this.actionMenuService),
                new handlers_1.MenuMessageHandler(this.actionMenuService),
                new handlers_1.MenuRequestMessageHandler(this.actionMenuService),
                new handlers_1.PerformMessageHandler(this.actionMenuService),
            ]);
        }
        /**
         * Start Action Menu protocol as requester, asking for root menu. Any active menu will be cleared.
         *
         * @param options options for requesting menu
         * @returns Action Menu record associated to this new request
         */
        requestMenu(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const connection = yield this.connectionService.getById(this.agentContext, options.connectionId);
                const { message, record } = yield this.actionMenuService.createRequest(this.agentContext, {
                    connection,
                });
                const outboundMessageContext = yield (0, core_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    associatedRecord: record,
                    connectionRecord: connection,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return record;
            });
        }
        /**
         * Send a new Action Menu as responder. This menu will be sent as response if there is an
         * existing menu thread.
         *
         * @param options options for sending menu
         * @returns Action Menu record associated to this action
         */
        sendMenu(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const connection = yield this.connectionService.getById(this.agentContext, options.connectionId);
                const { message, record } = yield this.actionMenuService.createMenu(this.agentContext, {
                    connection,
                    menu: options.menu,
                });
                const outboundMessageContext = yield (0, core_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    associatedRecord: record,
                    connectionRecord: connection,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return record;
            });
        }
        /**
         * Perform action in active Action Menu, as a requester. The related
         * menu will be closed.
         *
         * @param options options for requesting menu
         * @returns Action Menu record associated to this selection
         */
        performAction(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const connection = yield this.connectionService.getById(this.agentContext, options.connectionId);
                const actionMenuRecord = yield this.actionMenuService.find(this.agentContext, {
                    connectionId: connection.id,
                    role: ActionMenuRole_1.ActionMenuRole.Requester,
                });
                if (!actionMenuRecord) {
                    throw new core_1.AriesFrameworkError(`No active menu found for connection id ${options.connectionId}`);
                }
                const { message, record } = yield this.actionMenuService.createPerform(this.agentContext, {
                    actionMenuRecord,
                    performedAction: options.performedAction,
                });
                const outboundMessageContext = yield (0, core_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    associatedRecord: record,
                    connectionRecord: connection,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return record;
            });
        }
        /**
         * Find the current active menu for a given connection and the specified role.
         *
         * @param options options for requesting active menu
         * @returns Active Action Menu record, or null if no active menu found
         */
        findActiveMenu(options) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.actionMenuService.find(this.agentContext, {
                    connectionId: options.connectionId,
                    role: options.role,
                });
            });
        }
        /**
         * Clears the current active menu for a given connection and the specified role.
         *
         * @param options options for clearing active menu
         * @returns Active Action Menu record, or null if no active menu record found
         */
        clearActiveMenu(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const actionMenuRecord = yield this.actionMenuService.find(this.agentContext, {
                    connectionId: options.connectionId,
                    role: options.role,
                });
                return actionMenuRecord ? yield this.actionMenuService.clearMenu(this.agentContext, { actionMenuRecord }) : null;
            });
        }
    };
    __setFunctionName(_classThis, "ActionMenuApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ActionMenuApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ActionMenuApi = _classThis;
})();
exports.ActionMenuApi = ActionMenuApi;
