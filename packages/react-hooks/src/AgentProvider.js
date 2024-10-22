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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAgent = void 0;
const question_answer_1 = require("@credo-ts/question-answer");
const React = __importStar(require("react"));
const react_1 = require("react");
const BasicMessageProvider_1 = __importDefault(require("./BasicMessageProvider"));
const ConnectionProvider_1 = __importDefault(require("./ConnectionProvider"));
const CredentialFormatDataProvider_1 = __importDefault(require("./CredentialFormatDataProvider"));
const CredentialProvider_1 = __importDefault(require("./CredentialProvider"));
const ProofFormatDataProvider_1 = __importDefault(require("./ProofFormatDataProvider"));
const ProofProvider_1 = __importDefault(require("./ProofProvider"));
const QuestionAnswerProvider_1 = __importDefault(require("./QuestionAnswerProvider"));
const recordUtils_1 = require("./recordUtils");
const AgentContext = (0, react_1.createContext)(undefined);
const useAgent = () => {
    const agentContext = (0, react_1.useContext)(AgentContext);
    if (!agentContext) {
        throw new Error('useAgent must be used within a AgentContextProvider');
    }
    return agentContext;
};
exports.useAgent = useAgent;
const AgentProvider = ({ agent, children }) => {
    const isQaRegistered = (0, recordUtils_1.useIsModuleRegistered)(agent, question_answer_1.QuestionAnswerModule);
    const [agentState] = (0, react_1.useState)({
        loading: false,
        agent,
    });
    return (<AgentContext.Provider value={agentState}>
      <ConnectionProvider_1.default agent={agent}>
        <CredentialProvider_1.default agent={agent}>
          <ProofProvider_1.default agent={agent}>
            <CredentialFormatDataProvider_1.default agent={agent}>
              <ProofFormatDataProvider_1.default agent={agent}>
                <BasicMessageProvider_1.default agent={agent}>
                  {isQaRegistered ? (<QuestionAnswerProvider_1.default agent={agent}>{children} </QuestionAnswerProvider_1.default>) : (children)}
                </BasicMessageProvider_1.default>
              </ProofFormatDataProvider_1.default>
            </CredentialFormatDataProvider_1.default>
          </ProofProvider_1.default>
        </CredentialProvider_1.default>
      </ConnectionProvider_1.default>
    </AgentContext.Provider>);
};
exports.default = AgentProvider;
