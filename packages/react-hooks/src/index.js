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
exports.useCredentialsFormatData = exports.useCredentialFormatDataById = exports.useProofFormatDataById = exports.useProofsFormatData = exports.useProofsByConnectionId = exports.useExchangesByConnectionId = exports.useExchanges = exports.useQuestionAnswerById = exports.useQuestionAnswerByConnectionId = exports.useQuestionAnswer = exports.useProofNotInState = exports.useProofByState = exports.useProofById = exports.useProofs = exports.useCredentialsByConnectionId = exports.useCredentialNotInState = exports.useCredentialByState = exports.useCredentialById = exports.useCredentials = exports.useConnectionById = exports.useConnections = exports.useBasicMessagesByConnectionId = exports.useBasicMessages = exports.useAgent = void 0;
const AgentProvider_1 = __importStar(require("./AgentProvider"));
Object.defineProperty(exports, "useAgent", { enumerable: true, get: function () { return AgentProvider_1.useAgent; } });
const BasicMessageProvider_1 = require("./BasicMessageProvider");
Object.defineProperty(exports, "useBasicMessages", { enumerable: true, get: function () { return BasicMessageProvider_1.useBasicMessages; } });
Object.defineProperty(exports, "useBasicMessagesByConnectionId", { enumerable: true, get: function () { return BasicMessageProvider_1.useBasicMessagesByConnectionId; } });
const ConnectionProvider_1 = require("./ConnectionProvider");
Object.defineProperty(exports, "useConnections", { enumerable: true, get: function () { return ConnectionProvider_1.useConnections; } });
Object.defineProperty(exports, "useConnectionById", { enumerable: true, get: function () { return ConnectionProvider_1.useConnectionById; } });
const CredentialFormatDataProvider_1 = require("./CredentialFormatDataProvider");
Object.defineProperty(exports, "useCredentialsFormatData", { enumerable: true, get: function () { return CredentialFormatDataProvider_1.useCredentialsFormatData; } });
Object.defineProperty(exports, "useCredentialFormatDataById", { enumerable: true, get: function () { return CredentialFormatDataProvider_1.useCredentialFormatDataById; } });
const CredentialProvider_1 = require("./CredentialProvider");
Object.defineProperty(exports, "useCredentials", { enumerable: true, get: function () { return CredentialProvider_1.useCredentials; } });
Object.defineProperty(exports, "useCredentialById", { enumerable: true, get: function () { return CredentialProvider_1.useCredentialById; } });
Object.defineProperty(exports, "useCredentialByState", { enumerable: true, get: function () { return CredentialProvider_1.useCredentialByState; } });
Object.defineProperty(exports, "useCredentialNotInState", { enumerable: true, get: function () { return CredentialProvider_1.useCredentialNotInState; } });
Object.defineProperty(exports, "useCredentialsByConnectionId", { enumerable: true, get: function () { return CredentialProvider_1.useCredentialsByConnectionId; } });
const ExchangesProvider_1 = require("./ExchangesProvider");
Object.defineProperty(exports, "useExchanges", { enumerable: true, get: function () { return ExchangesProvider_1.useExchanges; } });
Object.defineProperty(exports, "useExchangesByConnectionId", { enumerable: true, get: function () { return ExchangesProvider_1.useExchangesByConnectionId; } });
const ProofFormatDataProvider_1 = require("./ProofFormatDataProvider");
Object.defineProperty(exports, "useProofsFormatData", { enumerable: true, get: function () { return ProofFormatDataProvider_1.useProofsFormatData; } });
Object.defineProperty(exports, "useProofFormatDataById", { enumerable: true, get: function () { return ProofFormatDataProvider_1.useProofFormatDataById; } });
const ProofProvider_1 = require("./ProofProvider");
Object.defineProperty(exports, "useProofs", { enumerable: true, get: function () { return ProofProvider_1.useProofs; } });
Object.defineProperty(exports, "useProofById", { enumerable: true, get: function () { return ProofProvider_1.useProofById; } });
Object.defineProperty(exports, "useProofByState", { enumerable: true, get: function () { return ProofProvider_1.useProofByState; } });
Object.defineProperty(exports, "useProofNotInState", { enumerable: true, get: function () { return ProofProvider_1.useProofNotInState; } });
Object.defineProperty(exports, "useProofsByConnectionId", { enumerable: true, get: function () { return ProofProvider_1.useProofsByConnectionId; } });
const QuestionAnswerProvider_1 = require("./QuestionAnswerProvider");
Object.defineProperty(exports, "useQuestionAnswer", { enumerable: true, get: function () { return QuestionAnswerProvider_1.useQuestionAnswer; } });
Object.defineProperty(exports, "useQuestionAnswerByConnectionId", { enumerable: true, get: function () { return QuestionAnswerProvider_1.useQuestionAnswerByConnectionId; } });
Object.defineProperty(exports, "useQuestionAnswerById", { enumerable: true, get: function () { return QuestionAnswerProvider_1.useQuestionAnswerById; } });
exports.default = AgentProvider_1.default;
