"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proofsSlice = void 0;
const core_1 = require("@credo-ts/core");
const toolkit_1 = require("@reduxjs/toolkit");
const recordListener_1 = require("../../recordListener");
const proofsThunks_1 = require("./proofsThunks");
const initialState = {
    proofs: {
        records: [],
        isLoading: false,
    },
    error: null,
};
const proofsSlice = (0, toolkit_1.createSlice)({
    name: 'proofs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // getAllProofs
            .addCase(proofsThunks_1.ProofsThunks.getAllProofs.pending, (state) => {
            state.proofs.isLoading = true;
        })
            .addCase(proofsThunks_1.ProofsThunks.getAllProofs.rejected, (state, action) => {
            state.proofs.isLoading = false;
            state.error = action.error;
        })
            .addCase(proofsThunks_1.ProofsThunks.getAllProofs.fulfilled, (state, action) => {
            state.proofs.isLoading = false;
            state.proofs.records = action.payload.map((p) => core_1.JsonTransformer.toJSON(p));
        })
            // record events
            .addCase(recordListener_1.addRecord, (state, action) => (0, recordListener_1.addRecordInState)(core_1.ProofExchangeRecord, state.proofs.records, action.payload))
            .addCase(recordListener_1.removeRecord, (state, action) => (0, recordListener_1.removeRecordInState)(core_1.ProofExchangeRecord, state.proofs.records, action.payload))
            .addCase(recordListener_1.updateRecord, (state, action) => (0, recordListener_1.updateRecordInState)(core_1.ProofExchangeRecord, state.proofs.records, action.payload));
    },
});
exports.proofsSlice = proofsSlice;
