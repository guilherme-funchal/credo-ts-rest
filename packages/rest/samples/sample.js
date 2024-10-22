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
const src_1 = require("../src");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const { start } = yield (0, src_1.setupApp)({
        adminPort: 3000,
        enableCors: true,
        agent: {
            label: 'Aries Test Agent',
            inboundTransports: [
                {
                    transport: 'http',
                    port: 3001,
                },
            ],
            logLevel: core_1.LogLevel.debug,
            endpoints: ['http://localhost:3001'],
            walletConfig: {
                id: 'test-agent',
                key: 'test-agent',
            },
        },
    });
    start();
});
run();
