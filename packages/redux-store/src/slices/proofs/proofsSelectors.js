"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProofsSelectors = void 0;
const core_1 = require("@credo-ts/core");
const toolkit_1 = require("@reduxjs/toolkit");
const proofsStateSelector = (state) => state.proofs.proofs;
/**
 * Namespace that holds all ProofRecords related selectors.
 */
const ProofsSelectors = {
    /**
     * Selector that retrieves the entire **proofs** store object.
     */
    proofsStateSelector,
    /**
     * Selector that retrieves all ProofRecords from the state.
     */
    proofRecordsSelector: (0, toolkit_1.createSelector)(proofsStateSelector, (proofsState) => proofsState.records.map((r) => core_1.JsonTransformer.fromJSON(r, core_1.ProofExchangeRecord))),
    /**
     * Selector that retrieves all ProofRecords from the store by specified state.
     */
    proofRecordsByStateSelector: (state) => (0, toolkit_1.createSelector)(proofsStateSelector, (proofsState) => proofsState.records.filter((r) => r.state === state).map((r) => core_1.JsonTransformer.fromJSON(r, core_1.ProofExchangeRecord))),
    /**
     * Selector that fetches a ProofRecord by id from the state.
     */
    proofRecordByIdSelector: (proofRecordId) => (0, toolkit_1.createSelector)(proofsStateSelector, (proofsState) => {
        const record = proofsState.records.find((r) => r.id === proofRecordId);
        return record ? core_1.JsonTransformer.fromJSON(record, core_1.ProofExchangeRecord) : null;
    }),
};
exports.ProofsSelectors = ProofsSelectors;
