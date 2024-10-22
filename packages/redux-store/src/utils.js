"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRecordType = void 0;
exports.createAsyncAgentThunk = createAsyncAgentThunk;
const toolkit_1 = require("@reduxjs/toolkit");
function createAsyncAgentThunk(typePrefix, payloadCreator) {
    return (0, toolkit_1.createAsyncThunk)(typePrefix, (thunkArg, thunkApi) => {
        if (!thunkApi.extra.agent)
            return thunkApi.rejectWithValue('Agent not set');
        if (!thunkApi.extra.agent.isInitialized)
            return thunkApi.rejectWithValue('Agent not initialized, call agent.init()');
        return payloadCreator(thunkArg, thunkApi);
    });
}
const isRecordType = (record, expectedRecordType) => {
    return record.type === expectedRecordType.type;
};
exports.isRecordType = isRecordType;
