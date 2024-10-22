"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionsSelectors = void 0;
const core_1 = require("@credo-ts/core");
const toolkit_1 = require("@reduxjs/toolkit");
const connectionsStateSelector = (state) => state.connections.connections;
/**
 * Namespace that holds all ConnectionRecord related selectors.
 */
const ConnectionsSelectors = {
    /**
     * Selector that retrieves the entire **connections** store object.
     */
    connectionsStateSelector,
    /**
     * Selector that retrieves all ConnectionRecords from the store.
     */
    connectionRecordsSelector: (0, toolkit_1.createSelector)(connectionsStateSelector, (connectionsState) => connectionsState.records.map((c) => core_1.JsonTransformer.fromJSON(c, core_1.ConnectionRecord))),
    /**
     * Selector that retrieves all ConnectionRecords from the store with specified {@link ConnectionState}.
     */
    connectionRecordsByStateSelector: (state) => (0, toolkit_1.createSelector)(connectionsStateSelector, (connectionsState) => connectionsState.records
        .filter((record) => record.state === state)
        .map((c) => core_1.JsonTransformer.fromJSON(c, core_1.ConnectionRecord))),
    /**
     * Selector that retrieves the entire **invitation** store object.
     */
    invitationStateSelector: (state) => core_1.JsonTransformer.fromJSON(state.connections.invitation, core_1.ConnectionInvitationMessage),
    /**
     * Selector that fetches a ConnectionRecord by id from the state.
     */
    connectionRecordByIdSelector: (connectionRecordId) => (0, toolkit_1.createSelector)(connectionsStateSelector, (connectionsState) => {
        const record = connectionsState.records.find((r) => r.id === connectionRecordId);
        return record ? core_1.JsonTransformer.fromJSON(record, core_1.ConnectionRecord) : null;
    }),
};
exports.ConnectionsSelectors = ConnectionsSelectors;
