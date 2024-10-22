"use strict";
exports.__esModule = true;
exports.buildDidDocument = exports.getKeyContext = exports.getVerificationMethod = exports.getVerificationPurpose = exports.getVerificationMaterial = exports.getVerificationMaterialPropertyName = exports.failedResult = exports.getEcdsaSecp256k1RecoveryMethod2020 = exports.buildDid = exports.VerificationKeyPurpose = exports.VerificationKeyType = exports.CONTEXT_SECURITY_SUITES_ED25519_2018_V1 = exports.VERIFICATION_METHOD_TYPE_ECDSA_SECP256K1_RECOVERY_2020 = void 0;
var core_1 = require("@credo-ts/core");
var ethers_1 = require("ethers");
exports.VERIFICATION_METHOD_TYPE_ECDSA_SECP256K1_RECOVERY_2020 = 'EcdsaSecp256k1RecoveryMethod2020';
exports.CONTEXT_SECURITY_SUITES_ED25519_2018_V1 = 'https://w3id.org/security/suites/ed25519-2018/v1';
var VerificationKeyType;
(function (VerificationKeyType) {
    VerificationKeyType[VerificationKeyType["Ed25519VerificationKey2018"] = 0] = "Ed25519VerificationKey2018";
    VerificationKeyType[VerificationKeyType["X25519KeyAgreementKey2020"] = 1] = "X25519KeyAgreementKey2020";
    VerificationKeyType[VerificationKeyType["EcdsaSecp256k1RecoveryMethod2020"] = 2] = "EcdsaSecp256k1RecoveryMethod2020";
})(VerificationKeyType = exports.VerificationKeyType || (exports.VerificationKeyType = {}));
var VerificationKeyPurpose;
(function (VerificationKeyPurpose) {
    VerificationKeyPurpose[VerificationKeyPurpose["AssertionMethod"] = 0] = "AssertionMethod";
    VerificationKeyPurpose[VerificationKeyPurpose["Authentication"] = 1] = "Authentication";
    VerificationKeyPurpose[VerificationKeyPurpose["keyAgreement"] = 2] = "keyAgreement";
})(VerificationKeyPurpose = exports.VerificationKeyPurpose || (exports.VerificationKeyPurpose = {}));
function buildDid(method, key) {
    var namespaceIdentifier = (0, ethers_1.computeAddress)("0x".concat(core_1.TypedArrayEncoder.toHex(key)));
    return "did:".concat(method, ":").concat(namespaceIdentifier);
}
exports.buildDid = buildDid;
function getEcdsaSecp256k1RecoveryMethod2020(_a) {
    var id = _a.id, key = _a.key, controller = _a.controller;
    var address = (0, ethers_1.computeAddress)("0x".concat(core_1.TypedArrayEncoder.toHex(key.publicKey)));
    //TODO: Replace hardcoded chain ID 1337, it should be extracted from configurations
    return new core_1.VerificationMethod({
        id: id,
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: controller,
        blockchainAccountId: "eip155:1337:".concat(address)
    });
}
exports.getEcdsaSecp256k1RecoveryMethod2020 = getEcdsaSecp256k1RecoveryMethod2020;
function failedResult(reason) {
    return {
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
        didState: {
            state: 'failed',
            reason: reason
        }
    };
}
exports.failedResult = failedResult;
function getVerificationMaterialPropertyName(type) {
    switch (type) {
        case VerificationKeyType.Ed25519VerificationKey2018:
        case VerificationKeyType.X25519KeyAgreementKey2020:
            return 'publicKeyBase58';
        case VerificationKeyType.EcdsaSecp256k1RecoveryMethod2020:
            return 'blockchainAccountId';
    }
}
exports.getVerificationMaterialPropertyName = getVerificationMaterialPropertyName;
function getVerificationMaterial(type, key) {
    switch (type) {
        case VerificationKeyType.Ed25519VerificationKey2018:
        case VerificationKeyType.X25519KeyAgreementKey2020:
            return key.publicKeyBase58;
        case VerificationKeyType.EcdsaSecp256k1RecoveryMethod2020:
            var address = (0, ethers_1.computeAddress)("0x".concat(core_1.TypedArrayEncoder.toHex(key.publicKey)));
            //TODO: Replace hardcoded chain ID 1337, it should be extracted from configurations
            return "eip155:1337:".concat(address);
    }
}
exports.getVerificationMaterial = getVerificationMaterial;
function getVerificationPurpose(purpose) {
    switch (purpose) {
        case VerificationKeyPurpose.AssertionMethod:
            return 'veriKey';
        case VerificationKeyPurpose.Authentication:
            return 'sigAuth';
        case VerificationKeyPurpose.keyAgreement:
            return 'enc';
    }
}
exports.getVerificationPurpose = getVerificationPurpose;
function getVerificationMethod(id, type, key, controller) {
    switch (type) {
        case VerificationKeyType.Ed25519VerificationKey2018:
            return (0, core_1.getEd25519VerificationKey2018)({ id: id, key: key, controller: controller });
        case VerificationKeyType.X25519KeyAgreementKey2020:
            return (0, core_1.getX25519KeyAgreementKey2019)({ id: id, key: key, controller: controller });
        case VerificationKeyType.EcdsaSecp256k1RecoveryMethod2020:
            return getEcdsaSecp256k1RecoveryMethod2020({ id: id, key: key, controller: controller });
    }
}
exports.getVerificationMethod = getVerificationMethod;
function getKeyContext(type) {
    switch (type) {
        case VerificationKeyType.Ed25519VerificationKey2018:
            return 'https://w3id.org/security/suites/ed25519-2018/v1';
        case VerificationKeyType.X25519KeyAgreementKey2020:
            return 'https://w3id.org/security/suites/x25519-2020/v1';
        case VerificationKeyType.EcdsaSecp256k1RecoveryMethod2020:
            return 'https://w3id.org/security/suites/secp256k1recovery-2020/v2';
    }
}
exports.getKeyContext = getKeyContext;
function buildDidDocument(did, key, endpoints, verificationKeys) {
    var context = [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/secp256k1recovery-2020/v2',
        // 'https://w3id.org/security/v3-unstable',
    ];
    var verificationMethod = getEcdsaSecp256k1RecoveryMethod2020({
        key: key,
        id: "".concat(did, "#controller"),
        controller: did
    });
    var didDocumentBuilder = new core_1.DidDocumentBuilder(did)
        .addVerificationMethod(verificationMethod)
        .addAuthentication(verificationMethod.id)
        .addAssertionMethod(verificationMethod.id);
    // add key security context
    verificationKeys === null || verificationKeys === void 0 ? void 0 : verificationKeys.map(function (value) { return value.type; }).map(function (value) { return getKeyContext(value); }).forEach(function (value) {
        if (!context.includes(value)) {
            context.push(value);
        }
    });
    // add verification methods
    verificationKeys === null || verificationKeys === void 0 ? void 0 : verificationKeys.forEach(function (value, index) {
        var id = "".concat(did, "#delegate-").concat(index + 1);
        var verificationMethod = getVerificationMethod(id, value.type, value.key, did);
        didDocumentBuilder.addVerificationMethod(verificationMethod);
        switch (value.purpose) {
            case VerificationKeyPurpose.AssertionMethod:
                didDocumentBuilder.addAssertionMethod(id);
                break;
            case VerificationKeyPurpose.Authentication:
                didDocumentBuilder.addAuthentication(id);
                break;
            case VerificationKeyPurpose.keyAgreement:
                didDocumentBuilder.addKeyAgreement(id);
        }
    });
    // add services
    endpoints === null || endpoints === void 0 ? void 0 : endpoints.forEach(function (value, index) {
        var service = new core_1.DidDocumentService({
            id: "".concat(did, "#service-").concat(index + 1),
            serviceEndpoint: value.endpoint,
            type: value.type
        });
        didDocumentBuilder.addService(service);
    });
    var didDocument = didDocumentBuilder.build();
    didDocument.context = context;
    return didDocument;
}
exports.buildDidDocument = buildDidDocument;
