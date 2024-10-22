"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediationSlice = void 0;
const core_1 = require("@credo-ts/core");
const toolkit_1 = require("@reduxjs/toolkit");
const recordListener_1 = require("../../recordListener");
const mediationThunks_1 = require("./mediationThunks");
const initialState = {
    mediation: {
        records: [],
        isLoading: false,
    },
    error: null,
};
const mediationSlice = (0, toolkit_1.createSlice)({
    name: 'mediation',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // getAllMediators
            .addCase(mediationThunks_1.MediationThunks.getAllMediationRecords.pending, (state) => {
            state.mediation.isLoading = true;
        })
            .addCase(mediationThunks_1.MediationThunks.getAllMediationRecords.rejected, (state, action) => {
            state.mediation.isLoading = false;
            state.error = action.error;
        })
            .addCase(mediationThunks_1.MediationThunks.getAllMediationRecords.fulfilled, (state, action) => {
            state.mediation.isLoading = false;
            state.mediation.records = action.payload.map(core_1.JsonTransformer.toJSON);
        })
            // record events
            .addCase(recordListener_1.addRecord, (state, action) => (0, recordListener_1.addRecordInState)(core_1.MediationRecord, state.mediation.records, action.payload))
            .addCase(recordListener_1.removeRecord, (state, action) => (0, recordListener_1.removeRecordInState)(core_1.MediationRecord, state.mediation.records, action.payload))
            .addCase(recordListener_1.updateRecord, (state, action) => (0, recordListener_1.updateRecordInState)(core_1.MediationRecord, state.mediation.records, action.payload));
    },
});
exports.mediationSlice = mediationSlice;
