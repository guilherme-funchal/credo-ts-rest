"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openId4VcVerificationSessionRecordToApiModel = openId4VcVerificationSessionRecordToApiModel;
function openId4VcVerificationSessionRecordToApiModel(record) {
    return {
        // Base Record
        id: record.id,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        type: record.type,
        publicVerifierId: record.verifierId,
        state: record.state,
        errorMessage: record.errorMessage,
        authorizationRequestJwt: record.authorizationRequestJwt,
        authorizationRequestUri: record.authorizationRequestUri,
        authorizationResponsePayload: record.authorizationResponsePayload,
    };
}
