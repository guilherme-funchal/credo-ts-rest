"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndySdkModules = exports.getIndySdkModuleConfig = exports.indySdk = void 0;
const core_1 = require("@aries-framework/core");
const indy_sdk_1 = __importDefault(require("indy-sdk"));
exports.indySdk = indy_sdk_1.default;
const helpers_1 = require("../../core/tests/helpers");
const src_1 = require("../src");
const getIndySdkModuleConfig = () => new src_1.IndySdkModuleConfig({
    indySdk: indy_sdk_1.default,
    networks: [
        {
            id: `localhost-${core_1.utils.uuid()}`,
            isProduction: false,
            genesisPath: helpers_1.genesisPath,
            indyNamespace: 'pool:localtest',
            transactionAuthorAgreement: { version: helpers_1.taaVersion, acceptanceMechanism: helpers_1.taaAcceptanceMechanism },
        },
    ],
});
exports.getIndySdkModuleConfig = getIndySdkModuleConfig;
const getIndySdkModules = () => ({
    indySdk: new src_1.IndySdkModule((0, exports.getIndySdkModuleConfig)()),
    dids: new core_1.DidsModule({
        registrars: [new src_1.IndySdkIndyDidRegistrar()],
        resolvers: [new src_1.IndySdkSovDidResolver(), new src_1.IndySdkIndyDidResolver()],
    }),
});
exports.getIndySdkModules = getIndySdkModules;
