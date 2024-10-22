"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIsModuleRegistered = exports.isModuleRegistered = exports.recordsRemovedByType = exports.recordsUpdatedByType = exports.recordsAddedByType = exports.removeRecord = exports.updateRecord = exports.addRecord = void 0;
const core_1 = require("@credo-ts/core");
const react_1 = require("react");
const rxjs_1 = require("rxjs");
const addRecord = (record, state) => {
    const newRecordsState = [...state.records];
    newRecordsState.unshift(record);
    return {
        loading: state.loading,
        records: newRecordsState,
    };
};
exports.addRecord = addRecord;
const updateRecord = (record, state) => {
    const newRecordsState = [...state.records];
    const index = newRecordsState.findIndex((r) => r.id === record.id);
    if (index > -1) {
        newRecordsState[index] = record;
    }
    return {
        loading: state.loading,
        records: newRecordsState,
    };
};
exports.updateRecord = updateRecord;
const removeRecord = (record, state) => {
    const newRecordsState = state.records.filter((r) => r.id !== record.id);
    return {
        loading: state.loading,
        records: newRecordsState,
    };
};
exports.removeRecord = removeRecord;
const filterByType = (recordClass) => {
    return (0, rxjs_1.pipe)((0, rxjs_1.map)((event) => event.payload.record), (0, rxjs_1.filter)((record) => record.type === recordClass.type));
};
const recordsAddedByType = (agent, recordClass) => {
    if (!agent) {
        throw new Error('Agent is required to check record type');
    }
    if (!recordClass) {
        throw new Error("The recordClass can't be undefined");
    }
    return agent === null || agent === void 0 ? void 0 : agent.events.observable(core_1.RepositoryEventTypes.RecordSaved).pipe(filterByType(recordClass));
};
exports.recordsAddedByType = recordsAddedByType;
const recordsUpdatedByType = (agent, recordClass) => {
    if (!agent) {
        throw new Error('Agent is required to update record type');
    }
    if (!recordClass) {
        throw new Error("The recordClass can't be undefined");
    }
    return agent === null || agent === void 0 ? void 0 : agent.events.observable(core_1.RepositoryEventTypes.RecordUpdated).pipe(filterByType(recordClass));
};
exports.recordsUpdatedByType = recordsUpdatedByType;
const recordsRemovedByType = (agent, recordClass) => {
    if (!agent) {
        throw new Error('Agent is required to remove records by type');
    }
    if (!recordClass) {
        throw new Error("The recordClass can't be undefined");
    }
    return agent === null || agent === void 0 ? void 0 : agent.events.observable(core_1.RepositoryEventTypes.RecordDeleted).pipe(filterByType(recordClass));
};
exports.recordsRemovedByType = recordsRemovedByType;
const isModuleRegistered = (agent, ModuleClass) => {
    if (!agent) {
        throw new Error('Agent is required to check if a module is enabled');
    }
    const foundModule = Object.values(agent.dependencyManager.registeredModules).find((module) => module instanceof ModuleClass);
    return foundModule !== undefined;
};
exports.isModuleRegistered = isModuleRegistered;
const useIsModuleRegistered = (agent, ModuleClass) => {
    return (0, react_1.useMemo)(() => (0, exports.isModuleRegistered)(agent, ModuleClass), [agent, ModuleClass]);
};
exports.useIsModuleRegistered = useIsModuleRegistered;
