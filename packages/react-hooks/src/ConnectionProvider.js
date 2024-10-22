"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.useConnectionById = exports.useConnections = void 0;
const core_1 = require("@credo-ts/core");
const react_1 = require("react");
const React = __importStar(require("react"));
const recordUtils_1 = require("./recordUtils");
const ConnectionContext = (0, react_1.createContext)(undefined);
/**
 * This method retrieves the connection context for the current agent.
 * From this you can access all connection records for the agent.
 * @param options options for useConnections hook, lets us filter out specific types and limit states
 * @returns a connection context containing information about the agents connections
 */
const useConnections = (options = {}) => {
    const connectionContext = (0, react_1.useContext)(ConnectionContext);
    let connections = connectionContext === null || connectionContext === void 0 ? void 0 : connectionContext.records;
    connections = (0, react_1.useMemo)(() => {
        if (!connections) {
            throw new Error('useConnections must be used within a ConnectionContextProvider');
        }
        // do not filter if not filter options are provided to save on a loop
        if (!options.connectionState && !options.excludedTypes)
            return connections;
        return connections.filter((record) => {
            // By default we include this connection
            // Filter by state (if connectionState is defined)
            if (options.connectionState && options.connectionState !== record.state)
                return false;
            // Exclude records with certain connection types (if defined)
            const recordTypes = record.connectionTypes;
            if (options.excludedTypes && recordTypes && recordTypes.length !== 0) {
                return recordTypes.some((connectionType) => { var _a; return !((_a = options.excludedTypes) === null || _a === void 0 ? void 0 : _a.includes(connectionType)); });
            }
            return true;
        });
    }, [connections, options.connectionState, options.excludedTypes]);
    return Object.assign(Object.assign({}, connectionContext), { records: connections });
};
exports.useConnections = useConnections;
const useConnectionById = (id) => {
    const { records: connections } = (0, exports.useConnections)();
    return connections.find((c) => c.id === id);
};
exports.useConnectionById = useConnectionById;
const ConnectionProvider = ({ agent, children }) => {
    const [state, setState] = (0, react_1.useState)({
        records: [],
        loading: true,
    });
    const setInitialState = () => __awaiter(void 0, void 0, void 0, function* () {
        const records = yield agent.connections.getAll();
        setState({ records, loading: false });
    });
    (0, react_1.useEffect)(() => {
        setInitialState();
    }, [agent]);
    (0, react_1.useEffect)(() => {
        if (state.loading)
            return;
        const connectionAdded$ = (0, recordUtils_1.recordsAddedByType)(agent, core_1.ConnectionRecord).subscribe((record) => setState((0, recordUtils_1.addRecord)(record, state)));
        const connectionUpdated$ = (0, recordUtils_1.recordsUpdatedByType)(agent, core_1.ConnectionRecord).subscribe((record) => setState((0, recordUtils_1.updateRecord)(record, state)));
        const connectionRemoved$ = (0, recordUtils_1.recordsRemovedByType)(agent, core_1.ConnectionRecord).subscribe((record) => setState((0, recordUtils_1.removeRecord)(record, state)));
        return () => {
            connectionAdded$.unsubscribe();
            connectionUpdated$.unsubscribe();
            connectionRemoved$.unsubscribe();
        };
    }, [state, agent]);
    return <ConnectionContext.Provider value={state}>{children}</ConnectionContext.Provider>;
};
exports.default = ConnectionProvider;
