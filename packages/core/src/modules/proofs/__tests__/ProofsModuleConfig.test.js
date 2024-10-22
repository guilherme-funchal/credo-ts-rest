"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProofsModuleConfig_1 = require("../ProofsModuleConfig");
const models_1 = require("../models");
describe('ProofsModuleConfig', () => {
    test('sets default values', () => {
        const config = new ProofsModuleConfig_1.ProofsModuleConfig({
            proofProtocols: [],
        });
        expect(config.autoAcceptProofs).toBe(models_1.AutoAcceptProof.Never);
        expect(config.proofProtocols).toEqual([]);
    });
    test('sets values', () => {
        const proofProtocol = jest.fn();
        const config = new ProofsModuleConfig_1.ProofsModuleConfig({
            autoAcceptProofs: models_1.AutoAcceptProof.Always,
            proofProtocols: [proofProtocol],
        });
        expect(config.autoAcceptProofs).toBe(models_1.AutoAcceptProof.Always);
        expect(config.proofProtocols).toEqual([proofProtocol]);
    });
});
