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
exports.proofExchangeRecordToApiModel = proofExchangeRecordToApiModel;
exports.transformApiProofFormatToCredo = transformApiProofFormatToCredo;
const maybeMapValues_1 = require("../../../utils/maybeMapValues");
function proofExchangeRecordToApiModel(record) {
    return {
        // Base Record
        id: record.id,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        type: record.type,
        // Proof
        connectionId: record.connectionId,
        threadId: record.threadId,
        parentThreadId: record.parentThreadId,
        state: record.state,
        role: record.role,
        autoAcceptProof: record.autoAcceptProof,
        errorMessage: record.errorMessage,
        protocolVersion: record.protocolVersion,
    };
}
// Below method help with transforming API request models to Credo/AnonCreds models
function transformApiAttributeMarkersToCredo(attributes) {
    if (!attributes) {
        return undefined;
    }
    return Object.entries(attributes).reduce((acc, [attr, val]) => (Object.assign({ [`attr::${attr}::marker`]: val ? '1' : '0' }, acc)), {});
}
function transformApiAttributeValuesToCredo(attributeValues) {
    if (!attributeValues) {
        return undefined;
    }
    return Object.entries(attributeValues).reduce((acc, [attr, val]) => (Object.assign({ [`attr::${attr}::value`]: val }, acc)), {});
}
function transformApiRestrictionToCredo(_a) {
    var { attributeValues, attributeMarkers } = _a, others = __rest(_a, ["attributeValues", "attributeMarkers"]);
    return Object.assign(Object.assign(Object.assign({}, transformApiAttributeMarkersToCredo(attributeMarkers)), transformApiAttributeValuesToCredo(attributeValues)), others);
}
function transformApiProofFormatToCredo(proofFormat) {
    if (!proofFormat) {
        return undefined;
    }
    const { requested_attributes, requested_predicates } = proofFormat, rest = __rest(proofFormat, ["requested_attributes", "requested_predicates"]);
    return Object.assign(Object.assign({}, rest), { requested_attributes: (0, maybeMapValues_1.maybeMapValues)((_a) => {
            var { restrictions } = _a, other = __rest(_a, ["restrictions"]);
            return (Object.assign({ restrictions: restrictions === null || restrictions === void 0 ? void 0 : restrictions.map(transformApiRestrictionToCredo) }, other));
        }, requested_attributes), requested_predicates: (0, maybeMapValues_1.maybeMapValues)((_a) => {
            var { restrictions } = _a, other = __rest(_a, ["restrictions"]);
            return (Object.assign({ restrictions: restrictions === null || restrictions === void 0 ? void 0 : restrictions.map(transformApiRestrictionToCredo) }, other));
        }, requested_predicates) });
}
