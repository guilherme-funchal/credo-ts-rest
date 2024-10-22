"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRecordInState = exports.addRecordInState = exports.removeRecordInState = exports.startRecordListeners = exports.removeRecord = exports.updateRecord = exports.addRecord = void 0;
const core_1 = require("@credo-ts/core");
const toolkit_1 = require("@reduxjs/toolkit");
const utils_1 = require("./utils");
exports.addRecord = (0, toolkit_1.createAction)('record/add');
exports.updateRecord = (0, toolkit_1.createAction)('record/update');
exports.removeRecord = (0, toolkit_1.createAction)('record/remove');
/**
 * Starts an EventListener that listens for record events
 * and dispatches actions based on the events. Slices can integrate with
 * the actions and update the store accordingly.
 *
 * This function **must** be called. If you don't, the store won't be updated.
 */
const startRecordListeners = (agent, store) => {
    const onDeleted = (event) => {
        const record = event.payload.record;
        store.dispatch((0, exports.removeRecord)(record));
    };
    const onSaved = (event) => {
        store.dispatch((0, exports.addRecord)(event.payload.record));
    };
    const onUpdated = (event) => {
        store.dispatch((0, exports.updateRecord)(event.payload.record));
    };
    agent.events.on(core_1.RepositoryEventTypes.RecordDeleted, onDeleted);
    agent.events.on(core_1.RepositoryEventTypes.RecordSaved, onSaved);
    agent.events.on(core_1.RepositoryEventTypes.RecordUpdated, onUpdated);
    return () => {
        agent.events.off(core_1.RepositoryEventTypes.RecordDeleted, onDeleted);
        agent.events.off(core_1.RepositoryEventTypes.RecordSaved, onSaved);
        agent.events.off(core_1.RepositoryEventTypes.RecordUpdated, onUpdated);
    };
};
exports.startRecordListeners = startRecordListeners;
const removeRecordInState = (recordType, records, record) => {
    // We're only interested in events for the recordType
    if (!(0, utils_1.isRecordType)(record, recordType))
        return;
    const index = records.findIndex((r) => r.id === record.id);
    // Record does not exist, not needed to remove anything
    if (index === -1)
        return;
    records.splice(index, 1);
};
exports.removeRecordInState = removeRecordInState;
const addRecordInState = (recordType, records, record) => {
    // We're only interested in events for the recordType
    if (!(0, utils_1.isRecordType)(record, recordType))
        return;
    records.push(core_1.JsonTransformer.toJSON(record));
};
exports.addRecordInState = addRecordInState;
const updateRecordInState = (recordType, records, record) => {
    // We're only interested in events for the recordType
    if (!(0, utils_1.isRecordType)(record, recordType))
        return;
    const index = records.findIndex((r) => r.id === record.id);
    // Record does not exist, add it
    if (index === -1) {
        records.push(core_1.JsonTransformer.toJSON(record));
    }
    else {
        records[index] = core_1.JsonTransformer.toJSON(record);
    }
};
exports.updateRecordInState = updateRecordInState;
