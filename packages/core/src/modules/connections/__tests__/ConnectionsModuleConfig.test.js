"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConnectionsModuleConfig_1 = require("../ConnectionsModuleConfig");
describe('ConnectionsModuleConfig', () => {
    test('sets default values', () => {
        const config = new ConnectionsModuleConfig_1.ConnectionsModuleConfig();
        expect(config.autoAcceptConnections).toBe(false);
    });
    test('sets values', () => {
        const config = new ConnectionsModuleConfig_1.ConnectionsModuleConfig({
            autoAcceptConnections: true,
        });
        expect(config.autoAcceptConnections).toBe(true);
    });
});
