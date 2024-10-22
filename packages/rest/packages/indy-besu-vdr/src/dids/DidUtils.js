"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationKeyPurpose = exports.VerificationKeyType = exports.CONTEXT_SECURITY_SUITES_ED25519_2018_V1 = exports.VERIFICATION_METHOD_TYPE_ECDSA_SECP256K1_RECOVERY_2020 = void 0;
exports.buildDid = buildDid;
exports.getEcdsaSecp256k1RecoveryMethod2020 = getEcdsaSecp256k1RecoveryMethod2020;
exports.failedResult = failedResult;
exports.getVerificationMaterialPropertyName = getVerificationMaterialPropertyName;
exports.getVerificationMaterial = getVerificationMaterial;
exports.getVerificationPurpose = getVerificationPurpose;
exports.getVerificationMethod = getVerificationMethod;
exports.getKeyContext = getKeyContext;
exports.buildDidDocument = buildDidDocument;
const core_1 = require("@credo-ts/core");
const ethers_1 = require("ethers");
exports.VERIFICATION_METHOD_TYPE_ECDSA_SECP256K1_RECOVERY_2020 = 'EcdsaSecp256k1RecoveryMethod2020';
exports.CONTEXT_SECURITY_SUITES_ED25519_2018_V1 = 'https://w3id.org/security/suites/ed25519-2018/v1';
var VerificationKeyType;
(function (VerificationKeyType) {
    VerificationKeyType[VerificationKeyType["Ed25519VerificationKey2018"] = 0] = "Ed25519VerificationKey2018";
    VerificationKeyType[VerificationKeyType["X25519KeyAgreementKey2020"] = 1] = "X25519KeyAgreementKey2020";
    VerificationKeyType[VerificationKeyType["EcdsaSecp256k1RecoveryMethod2020"] = 2] = "EcdsaSecp256k1RecoveryMethod2020";
})(VerificationKeyType || (exports.VerificationKeyType = VerificationKeyType = {}));
var VerificationKeyPurpose;
(function (VerificationKeyPurpose) {
    VerificationKeyPurpose[VerificationKeyPurpose["AssertionMethod"] = 0] = "AssertionMethod";
    VerificationKeyPurpose[VerificationKeyPurpose["Authentication"] = 1] = "Authentication";
    VerificationKeyPurpose[VerificationKeyPurpose["keyAgreement"] = 2] = "keyAgreement";
})(VerificationKeyPurpose || (exports.VerificationKeyPurpose = VerificationKeyPurpose = {}));
function buildDid(method, key) {
    const namespaceIdentifier = (0, ethers_1.computeAddress)(`0x${core_1.TypedArrayEncoder.toHex(key)}`);
    return `did:${method}:${namespaceIdentifier}`;
}
function getEcdsaSecp256k1RecoveryMethod2020({ id, key, controller, }) {
    const address = (0, ethers_1.computeAddress)(`0x${core_1.TypedArrayEncoder.toHex(key.publicKey)}`);
    //TODO: Replace hardcoded chain ID 1337, it should be extracted from configurations
    return new core_1.VerificationMethod({
        id,
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller,
        blockchainAccountId: `eip155:1337:${address}`,
    });
}
function failedResult(reason) {
    return {
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
        didState: {
            state: 'failed',
            reason: reason,
        },
    };
}
function getVerificationMaterialPropertyName(type) {
    switch (type) {
        case VerificationKeyType.Ed25519VerificationKey2018:
        case VerificationKeyType.X25519KeyAgreementKey2020:
            return 'publicKeyBase58';
        case VerificationKeyType.EcdsaSecp256k1RecoveryMethod2020:
            return 'blockchainAccountId';
    }
}
function getVerificationMaterial(type, key) {
    switch (type) {
        case VerificationKeyType.Ed25519VerificationKey2018:
        case VerificationKeyType.X25519KeyAgreementKey2020:
            return key.publicKeyBase58;
        case VerificationKeyType.EcdsaSecp256k1RecoveryMethod2020:
            const address = (0, ethers_1.computeAddress)(`0x${core_1.TypedArrayEncoder.toHex(key.publicKey)}`);
            //TODO: Replace hardcoded chain ID 1337, it should be extracted from configurations
            return `eip155:1337:${address}`;
    }
}
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
function getVerificationMethod(id, type, key, controller) {
    switch (type) {
        case VerificationKeyType.Ed25519VerificationKey2018:
            return (0, core_1.getEd25519VerificationKey2018)({ id, key, controller });
        case VerificationKeyType.X25519KeyAgreementKey2020:
            return (0, core_1.getX25519KeyAgreementKey2019)({ id, key, controller });
        case VerificationKeyType.EcdsaSecp256k1RecoveryMethod2020:
            return getEcdsaSecp256k1RecoveryMethod2020({ id, key, controller });
    }
}
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
function buildDidDocument(did, key, endpoints, verificationKeys) {
    const context = [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/secp256k1recovery-2020/v2',
        // 'https://w3id.org/security/v3-unstable',
    ];
    const verificationMethod = getEcdsaSecp256k1RecoveryMethod2020({
        key: key,
        id: `${did}#controller`,
        controller: did,
    });
    const didDocumentBuilder = new core_1.DidDocumentBuilder(did)
        .addVerificationMethod(verificationMethod)
        .addAuthentication(verificationMethod.id)
        .addAssertionMethod(verificationMethod.id);
    // add key security context
    verificationKeys === null || verificationKeys === void 0 ? void 0 : verificationKeys.map((value) => value.type).map((value) => getKeyContext(value)).forEach((value) => {
        if (!context.includes(value)) {
            context.push(value);
        }
    });
    // add verification methods
    verificationKeys === null || verificationKeys === void 0 ? void 0 : verificationKeys.forEach((value, index) => {
        const id = `${did}#delegate-${index + 1}`;
        const verificationMethod = getVerificationMethod(id, value.type, value.key, did);
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
    endpoints === null || endpoints === void 0 ? void 0 : endpoints.forEach((value, index) => {
        const service = new core_1.DidDocumentService({
            id: `${did}#service-${index + 1}`,
            serviceEndpoint: value.endpoint,
            type: value.type,
        });
        didDocumentBuilder.addService(service);
    });
    const didDocument = didDocumentBuilder.build();
    didDocument.context = context;
    return didDocument;
}
