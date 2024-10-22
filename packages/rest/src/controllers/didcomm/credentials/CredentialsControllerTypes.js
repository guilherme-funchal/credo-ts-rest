"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentialExchangeRecordToApiModel = credentialExchangeRecordToApiModel;
function credentialExchangeRecordToApiModel(record) {
    var _a;
    return {
        // Base Record
        id: record.id,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        type: record.type,
        connectionId: record.connectionId,
        threadId: record.threadId,
        parentThreadId: record.parentThreadId,
        state: record.state,
        role: record.role,
        autoAcceptCredential: record.autoAcceptCredential,
        revocationNotification: record.revocationNotification
            ? {
                revocationDate: record.revocationNotification.revocationDate,
                comment: record.revocationNotification.comment,
            }
            : undefined,
        errorMessage: record.errorMessage,
        protocolVersion: record.protocolVersion,
        credentials: record.credentials,
        credentialAttributes: (_a = record.credentialAttributes) === null || _a === void 0 ? void 0 : _a.map((a) => ({
            name: a.name,
            value: a.value,
            mimeType: a.mimeType,
        })),
    };
}
