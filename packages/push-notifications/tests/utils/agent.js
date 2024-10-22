"use strict";
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
exports.setupAgentApns = exports.setupAgentFcm = void 0;
const askar_1 = require("@credo-ts/askar");
const core_1 = require("@credo-ts/core");
const node_1 = require("@credo-ts/node");
const aries_askar_nodejs_1 = require("@hyperledger/aries-askar-nodejs");
const src_1 = require("../../src");
const setupAgentFcm = (_a) => __awaiter(void 0, [_a], void 0, function* ({ name }) {
    const agentConfig = {
        label: name,
        walletConfig: {
            id: name,
            key: 'someKey',
        },
        autoUpdateStorageOnStartup: true,
    };
    const agent = new core_1.Agent({
        config: agentConfig,
        dependencies: node_1.agentDependencies,
        modules: {
            askar: new askar_1.AskarModule({
                ariesAskar: aries_askar_nodejs_1.ariesAskar,
            }),
            pushNotificationsFcm: new src_1.PushNotificationsFcmModule(),
        },
    });
    agent.registerOutboundTransport(new core_1.HttpOutboundTransport());
    agent.registerOutboundTransport(new core_1.WsOutboundTransport());
    yield agent.initialize();
    return agent;
});
exports.setupAgentFcm = setupAgentFcm;
const setupAgentApns = (_a) => __awaiter(void 0, [_a], void 0, function* ({ name }) {
    const agentConfig = {
        label: name,
        walletConfig: {
            id: name,
            key: 'someKey',
        },
        autoUpdateStorageOnStartup: true,
    };
    const agent = new core_1.Agent({
        config: agentConfig,
        dependencies: node_1.agentDependencies,
        modules: {
            askar: new askar_1.AskarModule({
                ariesAskar: aries_askar_nodejs_1.ariesAskar,
            }),
            pushNotificationsApns: new src_1.PushNotificationsApnsModule(),
        },
    });
    agent.registerOutboundTransport(new core_1.HttpOutboundTransport());
    agent.registerOutboundTransport(new core_1.WsOutboundTransport());
    yield agent.initialize();
    return agent;
});
exports.setupAgentApns = setupAgentApns;
