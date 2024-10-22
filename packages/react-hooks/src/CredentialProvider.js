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
exports.useCredentialNotInState = exports.useCredentialByState = exports.useCredentialById = exports.useCredentialsByConnectionId = exports.useCredentials = void 0;
const core_1 = require("@credo-ts/core");
const react_1 = require("react");
const React = __importStar(require("react"));
const recordUtils_1 = require("./recordUtils");
const CredentialContext = (0, react_1.createContext)(undefined);
const useCredentials = () => {
    const credentialContext = (0, react_1.useContext)(CredentialContext);
    if (!credentialContext) {
        throw new Error('useCredentials must be used within a CredentialContextProvider');
    }
    return credentialContext;
};
exports.useCredentials = useCredentials;
const useCredentialsByConnectionId = (connectionId) => {
    const { records: credentials } = (0, exports.useCredentials)();
    return (0, react_1.useMemo)(() => credentials.filter((credential) => credential.connectionId === connectionId), [credentials, connectionId]);
};
exports.useCredentialsByConnectionId = useCredentialsByConnectionId;
const useCredentialById = (id) => {
    const { records: credentials } = (0, exports.useCredentials)();
    return credentials.find((c) => c.id === id);
};
exports.useCredentialById = useCredentialById;
const useCredentialByState = (state) => {
    const states = (0, react_1.useMemo)(() => (typeof state === 'string' ? [state] : state), [state]);
    const { records: credentials } = (0, exports.useCredentials)();
    const filteredCredentials = (0, react_1.useMemo)(() => credentials.filter((r) => states.includes(r.state)), [credentials]);
    return filteredCredentials;
};
exports.useCredentialByState = useCredentialByState;
const useCredentialNotInState = (state) => {
    const states = (0, react_1.useMemo)(() => (typeof state === 'string' ? [state] : state), [state]);
    const { records: credentials } = (0, exports.useCredentials)();
    const filteredCredentials = (0, react_1.useMemo)(() => credentials.filter((r) => !states.includes(r.state)), [credentials]);
    return filteredCredentials;
};
exports.useCredentialNotInState = useCredentialNotInState;
const CredentialProvider = ({ agent, children }) => {
    const [state, setState] = (0, react_1.useState)({
        records: [],
        loading: true,
    });
    const setInitialState = () => __awaiter(void 0, void 0, void 0, function* () {
        const records = yield agent.credentials.getAll();
        setState({ records, loading: false });
    });
    (0, react_1.useEffect)(() => {
        setInitialState();
    }, [agent]);
    (0, react_1.useEffect)(() => {
        if (state.loading)
            return;
        const credentialAdded$ = (0, recordUtils_1.recordsAddedByType)(agent, core_1.CredentialExchangeRecord).subscribe((record) => setState((0, recordUtils_1.addRecord)(record, state)));
        const credentialUpdated$ = (0, recordUtils_1.recordsUpdatedByType)(agent, core_1.CredentialExchangeRecord).subscribe((record) => setState((0, recordUtils_1.updateRecord)(record, state)));
        const credentialRemoved$ = (0, recordUtils_1.recordsRemovedByType)(agent, core_1.CredentialExchangeRecord).subscribe((record) => setState((0, recordUtils_1.removeRecord)(record, state)));
        return () => {
            credentialAdded$ === null || credentialAdded$ === void 0 ? void 0 : credentialAdded$.unsubscribe();
            credentialUpdated$ === null || credentialUpdated$ === void 0 ? void 0 : credentialUpdated$.unsubscribe();
            credentialRemoved$ === null || credentialRemoved$ === void 0 ? void 0 : credentialRemoved$.unsubscribe();
        };
    }, [state, agent]);
    return <CredentialContext.Provider value={state}>{children}</CredentialContext.Provider>;
};
exports.default = CredentialProvider;
