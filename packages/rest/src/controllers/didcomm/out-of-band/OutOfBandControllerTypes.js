"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outOfBandRecordToApiModel = outOfBandRecordToApiModel;
function outOfBandRecordToApiModel(record) {
    return {
        // Base Record
        id: record.id,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        type: record.type,
        // OOB
        outOfBandInvitation: record.outOfBandInvitation.toJSON(),
        reusable: record.reusable,
        role: record.role,
        state: record.state,
        alias: record.alias,
        autoAcceptConnection: record.autoAcceptConnection,
        mediatorId: record.mediatorId,
        reuseConnectionId: record.reuseConnectionId,
    };
}
