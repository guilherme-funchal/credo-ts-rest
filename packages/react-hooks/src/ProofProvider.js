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
exports.useProofNotInState = exports.useProofByState = exports.useProofById = exports.useProofsByConnectionId = exports.useProofs = void 0;
const core_1 = require("@credo-ts/core");
const react_1 = require("react");
const React = __importStar(require("react"));
const recordUtils_1 = require("./recordUtils");
const ProofContext = (0, react_1.createContext)(undefined);
const useProofs = () => {
    const proofContext = (0, react_1.useContext)(ProofContext);
    if (!proofContext) {
        throw new Error('useProofs must be used within a ProofContextProvider');
    }
    return proofContext;
};
exports.useProofs = useProofs;
const useProofsByConnectionId = (connectionId) => {
    const { records: proofs } = (0, exports.useProofs)();
    return (0, react_1.useMemo)(() => proofs.filter((proof) => proof.connectionId === connectionId), [proofs, connectionId]);
};
exports.useProofsByConnectionId = useProofsByConnectionId;
const useProofById = (id) => {
    const { records: proofs } = (0, exports.useProofs)();
    return proofs.find((p) => p.id === id);
};
exports.useProofById = useProofById;
const useProofByState = (state) => {
    const states = (0, react_1.useMemo)(() => (typeof state === 'string' ? [state] : state), [state]);
    const { records: proofs } = (0, exports.useProofs)();
    const filteredProofs = (0, react_1.useMemo)(() => proofs.filter((r) => {
        if (states.includes(r.state))
            return r;
    }), [proofs]);
    return filteredProofs;
};
exports.useProofByState = useProofByState;
const useProofNotInState = (state) => {
    const states = (0, react_1.useMemo)(() => (typeof state === 'string' ? [state] : state), [state]);
    const { records: proofs } = (0, exports.useProofs)();
    const filteredProofs = (0, react_1.useMemo)(() => proofs.filter((r) => {
        if (!states.includes(r.state))
            return r;
    }), [proofs]);
    return filteredProofs;
};
exports.useProofNotInState = useProofNotInState;
const ProofProvider = ({ agent, children }) => {
    const [state, setState] = (0, react_1.useState)({
        records: [],
        loading: true,
    });
    const setInitialState = () => __awaiter(void 0, void 0, void 0, function* () {
        const records = yield agent.proofs.getAll();
        setState({ records, loading: false });
    });
    (0, react_1.useEffect)(() => {
        setInitialState();
    }, [agent]);
    (0, react_1.useEffect)(() => {
        if (state.loading)
            return;
        const proofAdded$ = (0, recordUtils_1.recordsAddedByType)(agent, core_1.ProofExchangeRecord).subscribe((record) => setState((0, recordUtils_1.addRecord)(record, state)));
        const proofUpdated$ = (0, recordUtils_1.recordsUpdatedByType)(agent, core_1.ProofExchangeRecord).subscribe((record) => setState((0, recordUtils_1.updateRecord)(record, state)));
        const proofRemoved$ = (0, recordUtils_1.recordsRemovedByType)(agent, core_1.ProofExchangeRecord).subscribe((record) => setState((0, recordUtils_1.removeRecord)(record, state)));
        return () => {
            proofAdded$ === null || proofAdded$ === void 0 ? void 0 : proofAdded$.unsubscribe();
            proofUpdated$ === null || proofUpdated$ === void 0 ? void 0 : proofUpdated$.unsubscribe();
            proofRemoved$ === null || proofRemoved$ === void 0 ? void 0 : proofRemoved$.unsubscribe();
        };
    }, [state, agent]);
    return <ProofContext.Provider value={state}>{children}</ProofContext.Provider>;
};
exports.default = ProofProvider;
