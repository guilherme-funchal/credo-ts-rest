"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aries-framework/core");
const BbsModule_1 = require("../BbsModule");
const Bls12381g2SigningProvider_1 = require("../Bls12381g2SigningProvider");
const signature_suites_1 = require("../signature-suites");
const dependencyManager = {
    registerInstance: jest.fn(),
    registerSingleton: jest.fn(),
    resolve: jest.fn().mockReturnValue({ logger: { warn: jest.fn() } }),
};
describe('BbsModule', () => {
    test('registers dependencies on the dependency manager', () => {
        const bbsModule = new BbsModule_1.BbsModule();
        bbsModule.register(dependencyManager);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(core_1.SigningProviderToken, Bls12381g2SigningProvider_1.Bls12381g2SigningProvider);
        expect(dependencyManager.registerInstance).toHaveBeenCalledTimes(2);
        expect(dependencyManager.registerInstance).toHaveBeenCalledWith(core_1.SignatureSuiteToken, {
            suiteClass: signature_suites_1.BbsBlsSignature2020,
            proofType: 'BbsBlsSignature2020',
            verificationMethodTypes: [core_1.VERIFICATION_METHOD_TYPE_BLS12381G2_KEY_2020],
            keyTypes: [core_1.KeyType.Bls12381g2],
        });
        expect(dependencyManager.registerInstance).toHaveBeenCalledWith(core_1.SignatureSuiteToken, {
            suiteClass: signature_suites_1.BbsBlsSignatureProof2020,
            proofType: 'BbsBlsSignatureProof2020',
            verificationMethodTypes: [core_1.VERIFICATION_METHOD_TYPE_BLS12381G2_KEY_2020],
            keyTypes: [core_1.KeyType.Bls12381g2],
        });
    });
});
