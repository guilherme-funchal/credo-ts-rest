"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sovDidDocumentFromDid = sovDidDocumentFromDid;
exports.addServicesFromEndpointsAttrib = addServicesFromEndpointsAttrib;
const core_1 = require("@aries-framework/core");
const did_1 = require("../utils/did");
/**
 * Get a base did:sov did document based on the provided did and verkey
 * https://sovrin-foundation.github.io/sovrin/spec/did-method-spec-template.html#crud-operation-definitions
 */
function sovDidDocumentFromDid(fullDid, verkey) {
    const verificationMethodId = `${fullDid}#key-1`;
    const keyAgreementId = `${fullDid}#key-agreement-1`;
    const publicKeyBase58 = (0, did_1.getFullVerkey)(fullDid, verkey);
    const publicKeyX25519 = core_1.TypedArrayEncoder.toBase58((0, core_1.convertPublicKeyToX25519)(core_1.TypedArrayEncoder.fromBase58(publicKeyBase58)));
    const builder = new core_1.DidDocumentBuilder(fullDid)
        .addContext('https://w3id.org/security/suites/ed25519-2018/v1')
        .addContext('https://w3id.org/security/suites/x25519-2019/v1')
        .addVerificationMethod({
        controller: fullDid,
        id: verificationMethodId,
        publicKeyBase58: publicKeyBase58,
        type: 'Ed25519VerificationKey2018',
    })
        .addVerificationMethod({
        controller: fullDid,
        id: keyAgreementId,
        publicKeyBase58: publicKeyX25519,
        type: 'X25519KeyAgreementKey2019',
    })
        .addAuthentication(verificationMethodId)
        .addAssertionMethod(verificationMethodId)
        .addKeyAgreement(keyAgreementId);
    return builder;
}
// Process Indy Attrib Endpoint Types according to: https://sovrin-foundation.github.io/sovrin/spec/did-method-spec-template.html > Read (Resolve) > DID Service Endpoint
function processEndpointTypes(types) {
    const expectedTypes = ['endpoint', 'did-communication', 'DIDComm'];
    const defaultTypes = ['endpoint', 'did-communication'];
    // Return default types if types "is NOT present [or] empty"
    if (!types || types.length <= 0) {
        return defaultTypes;
    }
    // Return default types if types "contain any other values"
    for (const type of types) {
        if (!expectedTypes.includes(type)) {
            return defaultTypes;
        }
    }
    // Return provided types
    return types;
}
function addServicesFromEndpointsAttrib(builder, did, endpoints, keyAgreementId) {
    const { endpoint, routingKeys, types } = endpoints, otherEndpoints = __rest(endpoints, ["endpoint", "routingKeys", "types"]);
    if (endpoint) {
        const processedTypes = processEndpointTypes(types);
        // If 'endpoint' included in types, add id to the services array
        if (processedTypes.includes('endpoint')) {
            builder.addService(new core_1.DidDocumentService({
                id: `${did}#endpoint`,
                serviceEndpoint: endpoint,
                type: 'endpoint',
            }));
        }
        // If 'did-communication' included in types, add DIDComm v1 entry
        if (processedTypes.includes('did-communication')) {
            builder.addService(new core_1.DidCommV1Service({
                id: `${did}#did-communication`,
                serviceEndpoint: endpoint,
                priority: 0,
                routingKeys: routingKeys !== null && routingKeys !== void 0 ? routingKeys : [],
                recipientKeys: [keyAgreementId],
                accept: ['didcomm/aip2;env=rfc19'],
            }));
            // If 'DIDComm' included in types, add DIDComm v2 entry
            if (processedTypes.includes('DIDComm')) {
                builder
                    .addService(new core_1.DidCommV2Service({
                    id: `${did}#didcomm-1`,
                    serviceEndpoint: endpoint,
                    routingKeys: routingKeys !== null && routingKeys !== void 0 ? routingKeys : [],
                    accept: ['didcomm/v2'],
                }))
                    .addContext('https://didcomm.org/messaging/contexts/v2');
            }
        }
    }
    // Add other endpoint types
    for (const [type, endpoint] of Object.entries(otherEndpoints)) {
        builder.addService(new core_1.DidDocumentService({
            id: `${did}#${type}`,
            serviceEndpoint: endpoint,
            type,
        }));
    }
}
