"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CredentialsModuleConfig_1 = require("../CredentialsModuleConfig");
const models_1 = require("../models");
describe('CredentialsModuleConfig', () => {
    test('sets default values', () => {
        const config = new CredentialsModuleConfig_1.CredentialsModuleConfig({
            credentialProtocols: [],
        });
        expect(config.autoAcceptCredentials).toBe(models_1.AutoAcceptCredential.Never);
        expect(config.credentialProtocols).toEqual([]);
    });
    test('sets values', () => {
        const credentialProtocol = jest.fn();
        const config = new CredentialsModuleConfig_1.CredentialsModuleConfig({
            autoAcceptCredentials: models_1.AutoAcceptCredential.Always,
            credentialProtocols: [credentialProtocol],
        });
        expect(config.autoAcceptCredentials).toBe(models_1.AutoAcceptCredential.Always);
        expect(config.credentialProtocols).toEqual([credentialProtocol]);
    });
});
