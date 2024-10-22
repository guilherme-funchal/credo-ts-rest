"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionRecordToApiModel = connectionRecordToApiModel;
function connectionRecordToApiModel(record) {
    return {
        // Base Record
        id: record.id,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        type: record.type,
        // Connection
        did: record.did,
        theirDid: record.theirDid,
        theirLabel: record.theirLabel,
        state: record.state,
        role: record.role,
        alias: record.alias,
        autoAcceptConnection: record.autoAcceptConnection,
        threadId: record.threadId,
        imageUrl: record.imageUrl,
        mediatorId: record.mediatorId,
        errorMessage: record.errorMessage,
        protocol: record.protocol,
        outOfBandId: record.outOfBandId,
        invitationDid: record.invitationDid,
        connectionTypes: record.connectionTypes,
        previousDids: record.previousDids,
        previousTheirDids: record.previousTheirDids,
    };
}
