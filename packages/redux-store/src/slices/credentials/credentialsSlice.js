"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentialsSlice = void 0;
const core_1 = require("@credo-ts/core");
const toolkit_1 = require("@reduxjs/toolkit");
const recordListener_1 = require("../../recordListener");
const credentialsThunks_1 = require("./credentialsThunks");
const initialState = {
    credentials: {
        records: [],
        isLoading: false,
    },
    error: null,
};
const credentialsSlice = (0, toolkit_1.createSlice)({
    name: 'credentials',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // getAllCredentials
            .addCase(credentialsThunks_1.CredentialsThunks.getAllCredentials.pending, (state) => {
            state.credentials.isLoading = true;
        })
            .addCase(credentialsThunks_1.CredentialsThunks.getAllCredentials.rejected, (state, action) => {
            state.credentials.isLoading = false;
            state.error = action.error;
        })
            .addCase(credentialsThunks_1.CredentialsThunks.getAllCredentials.fulfilled, (state, action) => {
            state.credentials.isLoading = false;
            state.credentials.records = action.payload.map(core_1.JsonTransformer.toJSON);
        })
            // record events
            .addCase(recordListener_1.addRecord, (state, action) => (0, recordListener_1.addRecordInState)(core_1.CredentialExchangeRecord, state.credentials.records, action.payload))
            .addCase(recordListener_1.removeRecord, (state, action) => (0, recordListener_1.removeRecordInState)(core_1.CredentialExchangeRecord, state.credentials.records, action.payload))
            .addCase(recordListener_1.updateRecord, (state, action) => (0, recordListener_1.updateRecordInState)(core_1.CredentialExchangeRecord, state.credentials.records, action.payload));
    },
});
exports.credentialsSlice = credentialsSlice;
