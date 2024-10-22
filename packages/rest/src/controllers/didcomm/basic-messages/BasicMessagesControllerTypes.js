"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicMessageRecordToApiModel = basicMessageRecordToApiModel;
function basicMessageRecordToApiModel(record) {
    return {
        // Base Record
        id: record.id,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        type: record.type,
        // Basic Message
        connectionId: record.connectionId,
        role: record.role,
        content: record.content,
        sentTime: record.sentTime,
        threadId: record.threadId,
        parentThreadId: record.parentThreadId,
    };
}
