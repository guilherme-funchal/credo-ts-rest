"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentThunks = exports.agentSlice = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const initialState = {
    isInitializing: false,
    isInitialized: false,
    error: null,
};
const AgentThunks = {
    initializeAgent: (0, toolkit_1.createAsyncThunk)('agent/initialize', (_, thunkApi) => __awaiter(void 0, void 0, void 0, function* () {
        yield thunkApi.extra.agent.initialize();
        return true;
    })),
};
exports.AgentThunks = AgentThunks;
const agentSlice = (0, toolkit_1.createSlice)({
    name: 'agent',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(AgentThunks.initializeAgent.pending, (state) => {
            state.isInitializing = true;
        })
            .addCase(AgentThunks.initializeAgent.rejected, (state, action) => {
            state.isInitializing = false;
            state.isInitialized = false;
            state.error = action.error;
        })
            .addCase(AgentThunks.initializeAgent.fulfilled, (state) => {
            state.isInitializing = false;
            state.isInitialized = true;
        });
    },
});
exports.agentSlice = agentSlice;
