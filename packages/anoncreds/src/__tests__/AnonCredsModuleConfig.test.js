"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AnonCredsModuleConfig_1 = require("../AnonCredsModuleConfig");
describe('AnonCredsModuleConfig', () => {
    test('sets values', () => {
        const registry = {};
        const config = new AnonCredsModuleConfig_1.AnonCredsModuleConfig({
            registries: [registry],
        });
        expect(config.registries).toEqual([registry]);
    });
});
