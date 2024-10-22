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
exports.ConnectionThunks = void 0;
const utils_1 = require("../../utils");
const ConnectionThunks = {
    /**
     * Retrieve all connections records
     */
    getAllConnections: (0, utils_1.createAsyncAgentThunk)('connections/getAll', (_, thunkApi) => __awaiter(void 0, void 0, void 0, function* () { return thunkApi.extra.agent.connections.getAll(); })),
};
exports.ConnectionThunks = ConnectionThunks;
