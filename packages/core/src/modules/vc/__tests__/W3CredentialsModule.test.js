"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("../../../crypto");
const DependencyManager_1 = require("../../../plugins/DependencyManager");
const W3cCredentialService_1 = require("../W3cCredentialService");
const W3cCredentialsApi_1 = require("../W3cCredentialsApi");
const W3cCredentialsModule_1 = require("../W3cCredentialsModule");
const W3cCredentialsModuleConfig_1 = require("../W3cCredentialsModuleConfig");
const SignatureSuiteRegistry_1 = require("../data-integrity/SignatureSuiteRegistry");
const W3cJsonLdCredentialService_1 = require("../data-integrity/W3cJsonLdCredentialService");
const signature_suites_1 = require("../data-integrity/signature-suites");
const jwt_vc_1 = require("../jwt-vc");
const repository_1 = require("../repository");
jest.mock('../../../plugins/DependencyManager');
const DependencyManagerMock = DependencyManager_1.DependencyManager;
const dependencyManager = new DependencyManagerMock();
describe('W3cCredentialsModule', () => {
    test('registers dependencies on the dependency manager', () => {
        const module = new W3cCredentialsModule_1.W3cCredentialsModule();
        module.register(dependencyManager);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledWith(W3cCredentialsApi_1.W3cCredentialsApi);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(5);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(W3cCredentialService_1.W3cCredentialService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(W3cJsonLdCredentialService_1.W3cJsonLdCredentialService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(jwt_vc_1.W3cJwtCredentialService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(repository_1.W3cCredentialRepository);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(SignatureSuiteRegistry_1.SignatureSuiteRegistry);
        expect(dependencyManager.registerInstance).toHaveBeenCalledTimes(2);
        expect(dependencyManager.registerInstance).toHaveBeenCalledWith(W3cCredentialsModuleConfig_1.W3cCredentialsModuleConfig, module.config);
        expect(dependencyManager.registerInstance).toHaveBeenCalledWith(SignatureSuiteRegistry_1.SignatureSuiteToken, {
            suiteClass: signature_suites_1.Ed25519Signature2018,
            verificationMethodTypes: ['Ed25519VerificationKey2018', 'Ed25519VerificationKey2020'],
            proofType: 'Ed25519Signature2018',
            keyTypes: [crypto_1.KeyType.Ed25519],
        });
    });
});
