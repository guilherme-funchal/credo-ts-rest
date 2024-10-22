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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useExchangesByConnectionId = exports.useExchanges = void 0;
const react_1 = require("react");
const React = __importStar(require("react"));
const BasicMessageProvider_1 = require("./BasicMessageProvider");
const CredentialProvider_1 = require("./CredentialProvider");
const ProofProvider_1 = require("./ProofProvider");
const ExchangesContext = (0, react_1.createContext)(undefined);
const useExchanges = () => {
    const exchangesContext = (0, react_1.useContext)(ExchangesContext);
    if (!ExchangesContext) {
        throw new Error('useExchanges must be used within a ExchangesContextProvider');
    }
    return exchangesContext;
};
exports.useExchanges = useExchanges;
const useExchangesByConnectionId = (connectionId) => {
    const basicMessages = (0, BasicMessageProvider_1.useBasicMessagesByConnectionId)(connectionId);
    const proofMessages = (0, ProofProvider_1.useProofsByConnectionId)(connectionId);
    const credentialMessages = (0, CredentialProvider_1.useCredentialsByConnectionId)(connectionId);
    return [...basicMessages, ...proofMessages, ...credentialMessages];
};
exports.useExchangesByConnectionId = useExchangesByConnectionId;
const ExchangesProvider = ({ agent, children }) => {
    const [state, setState] = (0, react_1.useState)({
        records: [],
        loading: true,
    });
    const setInitialState = () => {
        const { records: basicMessages } = (0, BasicMessageProvider_1.useBasicMessages)();
        const { records: proofs } = (0, ProofProvider_1.useProofs)();
        const { records: credentials } = (0, CredentialProvider_1.useCredentials)();
        const records = [...basicMessages, ...proofs, ...credentials];
        setState({ records, loading: false });
    };
    (0, react_1.useEffect)(() => {
        setInitialState();
    }, [agent]);
    return <ExchangesContext.Provider value={state}>{children}</ExchangesContext.Provider>;
};
exports.default = ExchangesProvider;
