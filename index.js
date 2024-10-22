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
const core_1 = require("@credo-ts/core");
const rest_1 = require("@credo-ts/rest");
const promises_1 = require("fs/promises");
const agentConfig = {
    label: "test-agent-ts",
    walletConfig: {
        id: "test-wallet-id-1",
        key: "testkey0000000000000000000000001",
        storage: {
            type: 'sqlite'
        }
    },
};
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agent = yield (0, rest_1.createRestAgent)(Object.assign(Object.assign({}, agentConfig), { inboundTransports: [
                {
                    transport: "http",
                    port: 3001,
                },
            ], outboundTransports: ["http"], logLevel: core_1.LogLevel.debug, endpoints: ["http://localhost:3001"], multiTenant: true, indyLedgers: [{
                    isProduction: false,
                    indyNamespace: 'bcovrin:test',
                    genesisTransactions: yield (0, promises_1.readFile)('./genesis.txt', 'utf-8'),
                    connectOnStartup: true
                }] }));
        const { start } = yield (0, rest_1.setupApp)({
            adminPort: 3000,
            enableCors: true,
            agent,
        });
        start();
    }
    catch (e) {
        console.error(`Something went wrong while setting up the app! Message: ${e}`);
    }
});
run();
