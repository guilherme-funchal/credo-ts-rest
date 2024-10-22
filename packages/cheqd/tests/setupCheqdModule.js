"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCheqdModules = exports.getCheqdModuleConfig = exports.getIndySdkModuleConfig = void 0;
const core_1 = require("@aries-framework/core");
const indy_sdk_1 = require("@aries-framework/indy-sdk");
const indy_sdk_2 = __importDefault(require("indy-sdk"));
const src_1 = require("../src");
const getIndySdkModuleConfig = () => new indy_sdk_1.IndySdkModuleConfig({
    indySdk: indy_sdk_2.default,
});
exports.getIndySdkModuleConfig = getIndySdkModuleConfig;
const getCheqdModuleConfig = (seed, rpcUrl) => ({
    networks: [
        {
            rpcUrl: rpcUrl || 'http://localhost:26657',
            network: 'testnet',
            cosmosPayerSeed: seed ||
                'sketch mountain erode window enact net enrich smoke claim kangaroo another visual write meat latin bacon pulp similar forum guilt father state erase bright',
        },
    ],
});
exports.getCheqdModuleConfig = getCheqdModuleConfig;
const getCheqdModules = (seed, rpcUrl) => ({
    cheqdSdk: new src_1.CheqdModule((0, exports.getCheqdModuleConfig)(seed, rpcUrl)),
    dids: new core_1.DidsModule({
        registrars: [new src_1.CheqdDidRegistrar()],
        resolvers: [new src_1.CheqdDidResolver()],
    }),
    indySdk: new indy_sdk_1.IndySdkModule((0, exports.getIndySdkModuleConfig)()),
});
exports.getCheqdModules = getCheqdModules;
