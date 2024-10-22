"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validDid = void 0;
exports.validVerificationMethod = validVerificationMethod;
exports.validService = validService;
exports.validDidDoc = validDidDoc;
jest.setTimeout(60000);
const core_1 = require("@aries-framework/core");
exports.validDid = 'did:cheqd:testnet:SiVQgrFZ7jFZFrTGstT4ZD';
function validVerificationMethod(did) {
    return new core_1.VerificationMethod({
        id: did + '#key-1',
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyMultibase: 'z6MkkBaWtQKyx7Mr54XaXyMAEpNKqphK4x7ztuBpSfR6Wqwr',
    });
}
function validService(did) {
    return new core_1.DidDocumentService({
        id: did + '#service-1',
        type: 'DIDCommMessaging',
        serviceEndpoint: 'https://rand.io',
    });
}
function validDidDoc() {
    const service = [validService(exports.validDid)];
    const verificationMethod = [validVerificationMethod(exports.validDid)];
    return new core_1.DidDocument({
        id: exports.validDid,
        verificationMethod,
        service,
    });
}
