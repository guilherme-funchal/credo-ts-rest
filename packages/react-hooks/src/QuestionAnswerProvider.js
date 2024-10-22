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
exports.useQuestionAnswerById = exports.useQuestionAnswerByConnectionId = exports.useQuestionAnswer = void 0;
const question_answer_1 = require("@credo-ts/question-answer");
const react_1 = require("react");
const React = __importStar(require("react"));
const QuestionAnswerContext = (0, react_1.createContext)(undefined);
const useQuestionAnswer = () => {
    const questionAnswerContext = (0, react_1.useContext)(QuestionAnswerContext);
    if (!questionAnswerContext) {
        throw new Error('useQuestionAnswer must be used within a QuestionAnswerContextProvider');
    }
    return questionAnswerContext;
};
exports.useQuestionAnswer = useQuestionAnswer;
const useQuestionAnswerByConnectionId = (connectionId) => {
    const { questionAnswerMessages } = (0, exports.useQuestionAnswer)();
    const messages = (0, react_1.useMemo)(() => questionAnswerMessages.filter((m) => m.connectionId === connectionId), [questionAnswerMessages, connectionId]);
    return messages;
};
exports.useQuestionAnswerByConnectionId = useQuestionAnswerByConnectionId;
const useQuestionAnswerById = (id) => {
    const { questionAnswerMessages } = (0, exports.useQuestionAnswer)();
    return questionAnswerMessages.find((c) => c.id === id);
};
exports.useQuestionAnswerById = useQuestionAnswerById;
const QuestionAnswerProvider = ({ agent, children }) => {
    const [questionAnswerState, setQuestionAnswerState] = (0, react_1.useState)({
        questionAnswerMessages: [],
        loading: true,
    });
    const setInitialState = () => __awaiter(void 0, void 0, void 0, function* () {
        const questAnswerApi = agent.dependencyManager.resolve(question_answer_1.QuestionAnswerApi);
        const questionAnswerMessages = yield questAnswerApi.getAll();
        setQuestionAnswerState({ questionAnswerMessages, loading: false });
    });
    (0, react_1.useEffect)(() => {
        setInitialState();
    }, [agent]);
    (0, react_1.useEffect)(() => {
        if (questionAnswerState.loading)
            return;
        const listener = (event) => {
            const newQuestionAnswerState = [...questionAnswerState.questionAnswerMessages];
            const index = newQuestionAnswerState.findIndex((questionAnswerMessage) => questionAnswerMessage.id === event.payload.questionAnswerRecord.id);
            if (index > -1) {
                newQuestionAnswerState[index] = event.payload.questionAnswerRecord;
            }
            else {
                newQuestionAnswerState.unshift(event.payload.questionAnswerRecord);
            }
            setQuestionAnswerState({
                loading: questionAnswerState.loading,
                questionAnswerMessages: newQuestionAnswerState,
            });
        };
        agent.events.on(question_answer_1.QuestionAnswerEventTypes.QuestionAnswerStateChanged, listener);
        return () => {
            agent.events.off(question_answer_1.QuestionAnswerEventTypes.QuestionAnswerStateChanged, listener);
        };
    }, [questionAnswerState, agent]);
    return <QuestionAnswerContext.Provider value={questionAnswerState}>{children}</QuestionAnswerContext.Provider>;
};
exports.default = QuestionAnswerProvider;
