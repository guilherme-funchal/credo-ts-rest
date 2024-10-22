"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediationSelectors = void 0;
const core_1 = require("@credo-ts/core");
const toolkit_1 = require("@reduxjs/toolkit");
const mediationStateSelector = (state) => state.mediation.mediation;
/**
 * Namespace that holds all MediationRecord related selectors.
 */
const MediationSelectors = {
    /**
     * Selector that retrieves the entire **mediation** store object.
     */
    mediationStateSelector,
    /**
     * Selector that retrieves all MediationRecord from the state.
     */
    mediationRecordsSelector: (0, toolkit_1.createSelector)(mediationStateSelector, (mediationState) => mediationState.records.map((r) => core_1.JsonTransformer.fromJSON(r, core_1.MediationRecord))),
    /**
     * Selector that retrieves all MediationRecord from the store by specified state.
     */
    mediationRecordsByStateSelector: (state) => (0, toolkit_1.createSelector)(mediationStateSelector, (mediationState) => mediationState.records.filter((r) => r.state === state)),
    /**
     * Selector that fetches a MediationRecord by id from the state.
     */
    mediationRecordByIdSelector: (mediationRecordId) => (0, toolkit_1.createSelector)(mediationStateSelector, (mediationState) => {
        const record = mediationState.records.find((r) => r.id === mediationRecordId);
        return record ? core_1.JsonTransformer.fromJSON(record, core_1.MediationRecord) : null;
    }),
};
exports.MediationSelectors = MediationSelectors;
