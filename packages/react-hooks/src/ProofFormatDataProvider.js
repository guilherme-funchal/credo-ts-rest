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
exports.useProofFormatDataById = exports.useProofsFormatData = void 0;
const core_1 = require("@credo-ts/core");
const react_1 = require("react");
const React = __importStar(require("react"));
const recordUtils_1 = require("./recordUtils");
const addRecord = (record, state) => {
    const newRecordsState = [...state.formattedData];
    newRecordsState.unshift(record);
    return {
        loading: state.loading,
        formattedData: newRecordsState,
    };
};
const updateRecord = (record, state) => {
    const newRecordsState = [...state.formattedData];
    const index = newRecordsState.findIndex((r) => r.id === record.id);
    if (index > -1) {
        newRecordsState[index] = record;
    }
    return {
        loading: state.loading,
        formattedData: newRecordsState,
    };
};
const removeRecord = (record, state) => {
    const newRecordsState = state.formattedData.filter((r) => r.id !== record.id);
    return {
        loading: state.loading,
        formattedData: newRecordsState,
    };
};
const ProofFormatDataContext = (0, react_1.createContext)(undefined);
const useProofsFormatData = () => {
    const proofFormatDataContext = (0, react_1.useContext)(ProofFormatDataContext);
    if (!proofFormatDataContext) {
        throw new Error('useProofFormatData must be used within a ProofFormatDataContextProvider');
    }
    return proofFormatDataContext;
};
exports.useProofsFormatData = useProofsFormatData;
const useProofFormatDataById = (id) => {
    const { formattedData } = (0, exports.useProofsFormatData)();
    return formattedData.find((c) => c.id === id);
};
exports.useProofFormatDataById = useProofFormatDataById;
const ProofFormatDataProvider = ({ agent, children }) => {
    const [state, setState] = (0, react_1.useState)({
        formattedData: [],
        loading: true,
    });
    const setInitialState = () => __awaiter(void 0, void 0, void 0, function* () {
        const records = yield agent.proofs.getAll();
        const formattedData = [];
        for (const record of records) {
            const formatData = yield agent.proofs.getFormatData(record.id);
            formattedData.push(Object.assign(Object.assign({}, formatData), { id: record.id }));
        }
        setState({ formattedData, loading: false });
    });
    (0, react_1.useEffect)(() => {
        void setInitialState();
    }, [agent]);
    (0, react_1.useEffect)(() => {
        if (state.loading)
            return;
        const proofAdded$ = (0, recordUtils_1.recordsAddedByType)(agent, core_1.ProofExchangeRecord).subscribe((record) => __awaiter(void 0, void 0, void 0, function* () {
            const formatData = yield agent.proofs.getFormatData(record.id);
            setState(addRecord(Object.assign(Object.assign({}, formatData), { id: record.id }), state));
        }));
        const proofUpdate$ = (0, recordUtils_1.recordsUpdatedByType)(agent, core_1.ProofExchangeRecord).subscribe((record) => __awaiter(void 0, void 0, void 0, function* () {
            const formatData = yield agent.proofs.getFormatData(record.id);
            setState(updateRecord(Object.assign(Object.assign({}, formatData), { id: record.id }), state));
        }));
        const proofRemove$ = (0, recordUtils_1.recordsRemovedByType)(agent, core_1.ProofExchangeRecord).subscribe((record) => setState(removeRecord(record, state)));
        return () => {
            proofAdded$.unsubscribe();
            proofUpdate$.unsubscribe();
            proofRemove$.unsubscribe();
        };
    }, [state, agent]);
    return <ProofFormatDataContext.Provider value={state}>{children}</ProofFormatDataContext.Provider>;
};
exports.default = ProofFormatDataProvider;
