"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const indy_vdr_nodejs_1 = require("@hyperledger/indy-vdr-nodejs");
const IndyVdrModuleConfig_1 = require("../IndyVdrModuleConfig");
describe('IndyVdrModuleConfig', () => {
    test('sets values', () => {
        const networkConfig = {};
        const config = new IndyVdrModuleConfig_1.IndyVdrModuleConfig({
            indyVdr: indy_vdr_nodejs_1.indyVdr,
            networks: [networkConfig],
        });
        expect(config.networks).toEqual([networkConfig]);
    });
});
