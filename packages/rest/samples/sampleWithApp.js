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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@credo-ts/core");
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const index_1 = require("../src/index");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield (0, index_1.createRestAgent)({
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
    });
    const app = (0, express_1.default)();
    const jsonParser = body_parser_1.default.json();
    app.get('/greeting', jsonParser, (_, res) => {
        const config = agent.config;
        res.send(`Hello, ${config.label}!`);
    });
    const { start } = yield (0, index_1.setupApp)({
        baseApp: app,
        adminPort: 3000,
        enableCors: true,
        agent,
    });
    start();
});
run();
