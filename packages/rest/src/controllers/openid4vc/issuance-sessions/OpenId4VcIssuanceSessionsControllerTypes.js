"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openId4VcIssuanceSessionRecordToApiModel = openId4VcIssuanceSessionRecordToApiModel;
function openId4VcIssuanceSessionRecordToApiModel(record) {
    return {
        // Base Record
        id: record.id,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        type: record.type,
        publicIssuerId: record.issuerId,
        state: record.state,
        cNonce: record.cNonce,
        cNonceExpiresAt: record.cNonceExpiresAt,
        preAuthorizedCode: record.preAuthorizedCode,
        userPin: record.userPin,
        issuanceMetadata: record.issuanceMetadata,
        credentialOfferPayload: record.credentialOfferPayload,
        credentialOfferUri: record.credentialOfferUri,
        errorMessage: record.errorMessage,
    };
}
