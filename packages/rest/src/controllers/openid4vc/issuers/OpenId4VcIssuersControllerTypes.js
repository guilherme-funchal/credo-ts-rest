"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openId4VcIssuerRecordToApiModel = openId4VcIssuerRecordToApiModel;
function openId4VcIssuerRecordToApiModel(record) {
    return {
        // Base Record
        id: record.id,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        type: record.type,
        publicIssuerId: record.issuerId,
        accessTokenPublicKeyFingerprint: record.accessTokenPublicKeyFingerprint,
        credentialsSupported: record.credentialsSupported,
        display: record.display,
    };
}
