"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openId4vcVerifierRecordToApiModel = openId4vcVerifierRecordToApiModel;
function openId4vcVerifierRecordToApiModel(record) {
    return {
        // Base Record
        id: record.id,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        type: record.type,
        publicVerifierId: record.verifierId,
    };
}
