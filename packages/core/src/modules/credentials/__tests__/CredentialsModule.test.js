"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FeatureRegistry_1 = require("../../../agent/FeatureRegistry");
const Protocol_1 = require("../../../agent/models/features/Protocol");
const DependencyManager_1 = require("../../../plugins/DependencyManager");
const CredentialsApi_1 = require("../CredentialsApi");
const CredentialsModule_1 = require("../CredentialsModule");
const CredentialsModuleConfig_1 = require("../CredentialsModuleConfig");
const protocol_1 = require("../protocol");
const services_1 = require("../protocol/revocation-notification/services");
const repository_1 = require("../repository");
jest.mock('../../../plugins/DependencyManager');
const DependencyManagerMock = DependencyManager_1.DependencyManager;
const dependencyManager = new DependencyManagerMock();
jest.mock('../../../agent/FeatureRegistry');
const FeatureRegistryMock = FeatureRegistry_1.FeatureRegistry;
const featureRegistry = new FeatureRegistryMock();
describe('CredentialsModule', () => {
    test('registers dependencies on the dependency manager', () => {
        const credentialsModule = new CredentialsModule_1.CredentialsModule({
            credentialProtocols: [],
        });
        credentialsModule.register(dependencyManager, featureRegistry);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledWith(CredentialsApi_1.CredentialsApi);
        expect(dependencyManager.registerInstance).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerInstance).toHaveBeenCalledWith(CredentialsModuleConfig_1.CredentialsModuleConfig, credentialsModule.config);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(2);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(services_1.RevocationNotificationService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.CredentialRepository);
        expect(featureRegistry.register).toHaveBeenCalledTimes(1);
        expect(featureRegistry.register).toHaveBeenCalledWith(new Protocol_1.Protocol({
            id: 'https://didcomm.org/revocation_notification/1.0',
            roles: ['holder'],
        }), new Protocol_1.Protocol({
            id: 'https://didcomm.org/revocation_notification/2.0',
            roles: ['holder'],
        }));
    });
    test('registers V2CredentialProtocol if no credentialProtocols are configured', () => {
        const credentialsModule = new CredentialsModule_1.CredentialsModule();
        expect(credentialsModule.config.credentialProtocols).toEqual([expect.any(protocol_1.V2CredentialProtocol)]);
    });
    test('calls register on the provided CredentialProtocols', () => {
        const registerMock = jest.fn();
        const credentialProtocol = {
            register: registerMock,
        };
        const credentialsModule = new CredentialsModule_1.CredentialsModule({
            credentialProtocols: [credentialProtocol],
        });
        expect(credentialsModule.config.credentialProtocols).toEqual([credentialProtocol]);
        credentialsModule.register(dependencyManager, featureRegistry);
        expect(registerMock).toHaveBeenCalledTimes(1);
        expect(registerMock).toHaveBeenCalledWith(dependencyManager, featureRegistry);
    });
});
