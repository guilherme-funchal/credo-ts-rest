"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialsSelectors = void 0;
const core_1 = require("@credo-ts/core");
const toolkit_1 = require("@reduxjs/toolkit");
const credentialsStateSelector = (state) => state.credentials.credentials;
/**
 * Namespace that holds all CredentialRecord related selectors.
 */
const CredentialsSelectors = {
    /**
     * Selector that retrieves the entire **credentials** store object.
     */
    credentialsStateSelector,
    /**
     * Selector that retrieves all CredentialRecords from the store.
     */
    credentialRecordsSelector: (0, toolkit_1.createSelector)(credentialsStateSelector, (credentialsState) => credentialsState.records.map((r) => core_1.JsonTransformer.fromJSON(r, core_1.CredentialExchangeRecord))),
    /**
     * Selector that retrieves all CredentialRecords from the store by specified credential state.
     */
    credentialsRecordsByStateSelector: (state) => (0, toolkit_1.createSelector)(credentialsStateSelector, (credentialsState) => credentialsState.records
        .filter((r) => r.state === state)
        .map((c) => core_1.JsonTransformer.fromJSON(c, core_1.CredentialExchangeRecord))),
    /**
     * Selector that fetches a CredentialRecord by id from the state.
     */
    credentialRecordByIdSelector: (credentialRecordId) => (0, toolkit_1.createSelector)(credentialsStateSelector, (credentialsState) => {
        const record = credentialsState.records.find((r) => r.id === credentialRecordId);
        return record ? core_1.JsonTransformer.fromJSON(record, core_1.CredentialExchangeRecord) : null;
    }),
};
exports.CredentialsSelectors = CredentialsSelectors;
