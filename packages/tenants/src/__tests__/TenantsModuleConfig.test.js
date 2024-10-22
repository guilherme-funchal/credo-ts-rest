"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TenantsModuleConfig_1 = require("../TenantsModuleConfig");
describe('TenantsModuleConfig', () => {
    test('sets default values', () => {
        const config = new TenantsModuleConfig_1.TenantsModuleConfig();
        expect(config.sessionLimit).toBe(100);
        expect(config.sessionAcquireTimeout).toBe(1000);
    });
    test('sets values', () => {
        const config = new TenantsModuleConfig_1.TenantsModuleConfig({
            sessionAcquireTimeout: 12,
            sessionLimit: 42,
        });
        expect(config.sessionAcquireTimeout).toBe(12);
        expect(config.sessionLimit).toBe(42);
    });
});
