"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionsSlice = void 0;
const core_1 = require("@credo-ts/core");
const toolkit_1 = require("@reduxjs/toolkit");
const recordListener_1 = require("../../recordListener");
const connectionsThunks_1 = require("./connectionsThunks");
const initialState = {
    connections: {
        records: [],
        isLoading: false,
        error: null,
    },
    invitation: {
        message: null,
        connectionRecordId: null,
        isLoading: false,
        error: null,
    },
};
const connectionsSlice = (0, toolkit_1.createSlice)({
    name: 'connections',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetchAllConnections
            .addCase(connectionsThunks_1.ConnectionThunks.getAllConnections.pending, (state) => {
            state.connections.isLoading = true;
        })
            .addCase(connectionsThunks_1.ConnectionThunks.getAllConnections.rejected, (state, action) => {
            state.connections.isLoading = false;
            state.connections.error = action.error;
        })
            .addCase(connectionsThunks_1.ConnectionThunks.getAllConnections.fulfilled, (state, action) => {
            state.connections.isLoading = false;
            state.connections.records = action.payload.map(core_1.JsonTransformer.toJSON);
        })
            // record event
            .addCase(recordListener_1.addRecord, (state, action) => (0, recordListener_1.addRecordInState)(core_1.ConnectionRecord, state.connections.records, action.payload))
            .addCase(recordListener_1.removeRecord, (state, action) => (0, recordListener_1.removeRecordInState)(core_1.ConnectionRecord, state.connections.records, action.payload))
            .addCase(recordListener_1.updateRecord, (state, action) => (0, recordListener_1.updateRecordInState)(core_1.ConnectionRecord, state.connections.records, action.payload));
    },
});
exports.connectionsSlice = connectionsSlice;
