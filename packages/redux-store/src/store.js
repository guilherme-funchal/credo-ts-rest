"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAppSelector = exports.initializeStore = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const react_redux_1 = require("react-redux");
const slices_1 = require("./slices");
const rootReducer = (0, toolkit_1.combineReducers)({
    agent: slices_1.agentSlice.reducer,
    connections: slices_1.connectionsSlice.reducer,
    credentials: slices_1.credentialsSlice.reducer,
    proofs: slices_1.proofsSlice.reducer,
    mediation: slices_1.mediationSlice.reducer,
});
const useAppSelector = react_redux_1.useSelector;
exports.useAppSelector = useAppSelector;
const initializeStore = (agent) => {
    const store = (0, toolkit_1.configureStore)({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({
            thunk: {
                extraArgument: {
                    agent,
                },
            },
        }),
    });
    const useAppDispatch = () => (0, react_redux_1.useDispatch)();
    return {
        store,
        useAppDispatch,
    };
};
exports.initializeStore = initializeStore;
