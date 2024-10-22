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
const tests_1 = require("../../core/tests");
const src_1 = require("../../indy-sdk/src");
const helpers_1 = require("./helpers");
const action_menu_1 = require("@aries-framework/action-menu");
const modules = {
    actionMenu: new action_menu_1.ActionMenuModule(),
    indySdk: new src_1.IndySdkModule({
        indySdk: tests_1.indySdk,
    }),
};
const faberAgentOptions = (0, tests_1.getAgentOptions)('Faber Action Menu', {
    endpoints: ['rxjs:faber'],
}, modules);
const aliceAgentOptions = (0, tests_1.getAgentOptions)('Alice Action Menu', {
    endpoints: ['rxjs:alice'],
}, modules);
describe('Action Menu', () => {
    let faberAgent;
    let aliceAgent;
    let faberConnection;
    let aliceConnection;
    const rootMenu = new action_menu_1.ActionMenu({
        title: 'Welcome',
        description: 'This is the root menu',
        options: [
            {
                name: 'option-1',
                description: 'Option 1 description',
                title: 'Option 1',
            },
            {
                name: 'option-2',
                description: 'Option 2 description',
                title: 'Option 2',
            },
        ],
    });
    const submenu1 = new action_menu_1.ActionMenu({
        title: 'Menu 1',
        description: 'This is first submenu',
        options: [
            {
                name: 'option-1-1',
                description: '1-1 desc',
                title: '1-1 title',
            },
            {
                name: 'option-1-2',
                description: '1-1 desc',
                title: '1-1 title',
            },
        ],
    });
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        faberAgent = new core_1.Agent(faberAgentOptions);
        aliceAgent = new core_1.Agent(aliceAgentOptions);
        (0, tests_1.setupSubjectTransports)([faberAgent, aliceAgent]);
        yield faberAgent.initialize();
        yield aliceAgent.initialize();
        [aliceConnection, faberConnection] = yield (0, tests_1.makeConnection)(aliceAgent, faberAgent);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('Alice requests menu to Faber and selects an option once received', () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Alice sends menu request to Faber');
        let aliceActionMenuRecord = yield aliceAgent.modules.actionMenu.requestMenu({ connectionId: aliceConnection.id });
        tests_1.testLogger.test('Faber waits for menu request from Alice');
        yield (0, helpers_1.waitForActionMenuRecord)(faberAgent, {
            state: action_menu_1.ActionMenuState.PreparingRootMenu,
        });
        tests_1.testLogger.test('Faber sends root menu to Alice');
        yield faberAgent.modules.actionMenu.sendMenu({ connectionId: faberConnection.id, menu: rootMenu });
        tests_1.testLogger.test('Alice waits until she receives menu');
        aliceActionMenuRecord = yield (0, helpers_1.waitForActionMenuRecord)(aliceAgent, {
            state: action_menu_1.ActionMenuState.PreparingSelection,
        });
        expect(aliceActionMenuRecord.menu).toEqual(rootMenu);
        const faberActiveMenu = yield faberAgent.modules.actionMenu.findActiveMenu({
            connectionId: faberConnection.id,
            role: action_menu_1.ActionMenuRole.Responder,
        });
        expect(faberActiveMenu).toBeInstanceOf(action_menu_1.ActionMenuRecord);
        expect(faberActiveMenu === null || faberActiveMenu === void 0 ? void 0 : faberActiveMenu.state).toBe(action_menu_1.ActionMenuState.AwaitingSelection);
        tests_1.testLogger.test('Alice selects menu item');
        yield aliceAgent.modules.actionMenu.performAction({
            connectionId: aliceConnection.id,
            performedAction: { name: 'option-1' },
        });
        tests_1.testLogger.test('Faber waits for menu selection from Alice');
        yield (0, helpers_1.waitForActionMenuRecord)(faberAgent, {
            state: action_menu_1.ActionMenuState.Done,
        });
        // As Alice has responded, menu should be closed (done state)
        const aliceActiveMenu = yield aliceAgent.modules.actionMenu.findActiveMenu({
            connectionId: aliceConnection.id,
            role: action_menu_1.ActionMenuRole.Requester,
        });
        expect(aliceActiveMenu).toBeInstanceOf(action_menu_1.ActionMenuRecord);
        expect(aliceActiveMenu === null || aliceActiveMenu === void 0 ? void 0 : aliceActiveMenu.state).toBe(action_menu_1.ActionMenuState.Done);
    }));
    test('Faber sends root menu and Alice selects an option', () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Faber sends root menu to Alice');
        yield faberAgent.modules.actionMenu.sendMenu({ connectionId: faberConnection.id, menu: rootMenu });
        tests_1.testLogger.test('Alice waits until she receives menu');
        const aliceActionMenuRecord = yield (0, helpers_1.waitForActionMenuRecord)(aliceAgent, {
            state: action_menu_1.ActionMenuState.PreparingSelection,
        });
        expect(aliceActionMenuRecord.menu).toEqual(rootMenu);
        const faberActiveMenu = yield faberAgent.modules.actionMenu.findActiveMenu({
            connectionId: faberConnection.id,
            role: action_menu_1.ActionMenuRole.Responder,
        });
        expect(faberActiveMenu).toBeInstanceOf(action_menu_1.ActionMenuRecord);
        expect(faberActiveMenu === null || faberActiveMenu === void 0 ? void 0 : faberActiveMenu.state).toBe(action_menu_1.ActionMenuState.AwaitingSelection);
        tests_1.testLogger.test('Alice selects menu item');
        yield aliceAgent.modules.actionMenu.performAction({
            connectionId: aliceConnection.id,
            performedAction: { name: 'option-1' },
        });
        tests_1.testLogger.test('Faber waits for menu selection from Alice');
        yield (0, helpers_1.waitForActionMenuRecord)(faberAgent, {
            state: action_menu_1.ActionMenuState.Done,
        });
        // As Alice has responded, menu should be closed (done state)
        const aliceActiveMenu = yield aliceAgent.modules.actionMenu.findActiveMenu({
            connectionId: aliceConnection.id,
            role: action_menu_1.ActionMenuRole.Requester,
        });
        expect(aliceActiveMenu).toBeInstanceOf(action_menu_1.ActionMenuRecord);
        expect(aliceActiveMenu === null || aliceActiveMenu === void 0 ? void 0 : aliceActiveMenu.state).toBe(action_menu_1.ActionMenuState.Done);
    }));
    test('Menu navigation', () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Faber sends root menu ');
        let faberActionMenuRecord = yield faberAgent.modules.actionMenu.sendMenu({
            connectionId: faberConnection.id,
            menu: rootMenu,
        });
        const rootThreadId = faberActionMenuRecord.threadId;
        tests_1.testLogger.test('Alice waits until she receives menu');
        let aliceActionMenuRecord = yield (0, helpers_1.waitForActionMenuRecord)(aliceAgent, {
            state: action_menu_1.ActionMenuState.PreparingSelection,
        });
        expect(aliceActionMenuRecord.menu).toEqual(rootMenu);
        expect(aliceActionMenuRecord.threadId).toEqual(rootThreadId);
        tests_1.testLogger.test('Alice selects menu item 1');
        yield aliceAgent.modules.actionMenu.performAction({
            connectionId: aliceConnection.id,
            performedAction: { name: 'option-1' },
        });
        tests_1.testLogger.test('Faber waits for menu selection from Alice');
        faberActionMenuRecord = yield (0, helpers_1.waitForActionMenuRecord)(faberAgent, {
            state: action_menu_1.ActionMenuState.Done,
        });
        // As Alice has responded, menu should be closed (done state)
        let aliceActiveMenu = yield aliceAgent.modules.actionMenu.findActiveMenu({
            connectionId: aliceConnection.id,
            role: action_menu_1.ActionMenuRole.Requester,
        });
        expect(aliceActiveMenu).toBeInstanceOf(action_menu_1.ActionMenuRecord);
        expect(aliceActiveMenu === null || aliceActiveMenu === void 0 ? void 0 : aliceActiveMenu.state).toBe(action_menu_1.ActionMenuState.Done);
        expect(aliceActiveMenu === null || aliceActiveMenu === void 0 ? void 0 : aliceActiveMenu.threadId).toEqual(rootThreadId);
        tests_1.testLogger.test('Faber sends submenu to Alice');
        faberActionMenuRecord = yield faberAgent.modules.actionMenu.sendMenu({
            connectionId: faberConnection.id,
            menu: submenu1,
        });
        tests_1.testLogger.test('Alice waits until she receives submenu');
        aliceActionMenuRecord = yield (0, helpers_1.waitForActionMenuRecord)(aliceAgent, {
            state: action_menu_1.ActionMenuState.PreparingSelection,
        });
        expect(aliceActionMenuRecord.menu).toEqual(submenu1);
        expect(aliceActionMenuRecord.threadId).toEqual(rootThreadId);
        tests_1.testLogger.test('Alice selects menu item 1-1');
        yield aliceAgent.modules.actionMenu.performAction({
            connectionId: aliceConnection.id,
            performedAction: { name: 'option-1-1' },
        });
        tests_1.testLogger.test('Faber waits for menu selection from Alice');
        faberActionMenuRecord = yield (0, helpers_1.waitForActionMenuRecord)(faberAgent, {
            state: action_menu_1.ActionMenuState.Done,
        });
        // As Alice has responded, menu should be closed (done state)
        aliceActiveMenu = yield aliceAgent.modules.actionMenu.findActiveMenu({
            connectionId: aliceConnection.id,
            role: action_menu_1.ActionMenuRole.Requester,
        });
        expect(aliceActiveMenu).toBeInstanceOf(action_menu_1.ActionMenuRecord);
        expect(aliceActiveMenu === null || aliceActiveMenu === void 0 ? void 0 : aliceActiveMenu.state).toBe(action_menu_1.ActionMenuState.Done);
        expect(aliceActiveMenu === null || aliceActiveMenu === void 0 ? void 0 : aliceActiveMenu.threadId).toEqual(rootThreadId);
        tests_1.testLogger.test('Alice sends menu request to Faber');
        aliceActionMenuRecord = yield aliceAgent.modules.actionMenu.requestMenu({ connectionId: aliceConnection.id });
        tests_1.testLogger.test('Faber waits for menu request from Alice');
        faberActionMenuRecord = yield (0, helpers_1.waitForActionMenuRecord)(faberAgent, {
            state: action_menu_1.ActionMenuState.PreparingRootMenu,
        });
        tests_1.testLogger.test('This new menu request must have a different thread Id');
        expect(faberActionMenuRecord.menu).toBeUndefined();
        expect(aliceActionMenuRecord.threadId).not.toEqual(rootThreadId);
        expect(faberActionMenuRecord.threadId).toEqual(aliceActionMenuRecord.threadId);
    }));
    test('Menu clearing', () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Faber sends root menu to Alice');
        yield faberAgent.modules.actionMenu.sendMenu({ connectionId: faberConnection.id, menu: rootMenu });
        tests_1.testLogger.test('Alice waits until she receives menu');
        let aliceActionMenuRecord = yield (0, helpers_1.waitForActionMenuRecord)(aliceAgent, {
            state: action_menu_1.ActionMenuState.PreparingSelection,
        });
        expect(aliceActionMenuRecord.menu).toEqual(rootMenu);
        let faberActiveMenu = yield faberAgent.modules.actionMenu.findActiveMenu({
            connectionId: faberConnection.id,
            role: action_menu_1.ActionMenuRole.Responder,
        });
        expect(faberActiveMenu).toBeInstanceOf(action_menu_1.ActionMenuRecord);
        expect(faberActiveMenu === null || faberActiveMenu === void 0 ? void 0 : faberActiveMenu.state).toBe(action_menu_1.ActionMenuState.AwaitingSelection);
        yield faberAgent.modules.actionMenu.clearActiveMenu({
            connectionId: faberConnection.id,
            role: action_menu_1.ActionMenuRole.Responder,
        });
        tests_1.testLogger.test('Alice selects menu item');
        yield aliceAgent.modules.actionMenu.performAction({
            connectionId: aliceConnection.id,
            performedAction: { name: 'option-1' },
        });
        // Exception
        tests_1.testLogger.test('Faber rejects selection, as menu has been cleared');
        // Faber sends error report to Alice, meaning that her Menu flow will be cleared
        aliceActionMenuRecord = yield (0, helpers_1.waitForActionMenuRecord)(aliceAgent, {
            state: action_menu_1.ActionMenuState.Null,
            role: action_menu_1.ActionMenuRole.Requester,
        });
        tests_1.testLogger.test('Alice request a new menu');
        yield aliceAgent.modules.actionMenu.requestMenu({
            connectionId: aliceConnection.id,
        });
        tests_1.testLogger.test('Faber waits for menu request from Alice');
        yield (0, helpers_1.waitForActionMenuRecord)(faberAgent, {
            state: action_menu_1.ActionMenuState.PreparingRootMenu,
        });
        tests_1.testLogger.test('Faber sends root menu to Alice');
        yield faberAgent.modules.actionMenu.sendMenu({ connectionId: faberConnection.id, menu: rootMenu });
        tests_1.testLogger.test('Alice waits until she receives menu');
        aliceActionMenuRecord = yield (0, helpers_1.waitForActionMenuRecord)(aliceAgent, {
            state: action_menu_1.ActionMenuState.PreparingSelection,
        });
        expect(aliceActionMenuRecord.menu).toEqual(rootMenu);
        faberActiveMenu = yield faberAgent.modules.actionMenu.findActiveMenu({
            connectionId: faberConnection.id,
            role: action_menu_1.ActionMenuRole.Responder,
        });
        expect(faberActiveMenu).toBeInstanceOf(action_menu_1.ActionMenuRecord);
        expect(faberActiveMenu === null || faberActiveMenu === void 0 ? void 0 : faberActiveMenu.state).toBe(action_menu_1.ActionMenuState.AwaitingSelection);
        tests_1.testLogger.test('Alice selects menu item');
        yield aliceAgent.modules.actionMenu.performAction({
            connectionId: aliceConnection.id,
            performedAction: { name: 'option-1' },
        });
        tests_1.testLogger.test('Faber waits for menu selection from Alice');
        yield (0, helpers_1.waitForActionMenuRecord)(faberAgent, {
            state: action_menu_1.ActionMenuState.Done,
        });
    }));
});
