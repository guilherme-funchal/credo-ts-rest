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
const core_1 = require("@aries-framework/core");
const rxjs_1 = require("rxjs");
const runInVersion_1 = require("../../../tests/runInVersion");
const SubjectInboundTransport_1 = require("../../../tests/transport/SubjectInboundTransport");
const SubjectOutboundTransport_1 = require("../../../tests/transport/SubjectOutboundTransport");
const helpers_1 = require("./helpers");
const storageConfig = {
    type: 'postgres',
    config: {
        host: 'localhost:5432',
    },
    credentials: {
        account: 'postgres',
        password: 'postgres',
    },
};
const alicePostgresAgentOptions = (0, helpers_1.getPostgresAgentOptions)('AgentsAlice', storageConfig, {
    endpoints: ['rxjs:alice'],
});
const bobPostgresAgentOptions = (0, helpers_1.getPostgresAgentOptions)('AgentsBob', storageConfig, {
    endpoints: ['rxjs:bob'],
});
// FIXME: Re-include in tests when Askar NodeJS wrapper performance is improved
(0, runInVersion_1.describeRunInNodeVersion)([18], 'Askar Postgres agents', () => {
    let aliceAgent;
    let bobAgent;
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (bobAgent) {
            yield bobAgent.shutdown();
            yield bobAgent.wallet.delete();
        }
        if (aliceAgent) {
            yield aliceAgent.shutdown();
            yield aliceAgent.wallet.delete();
        }
    }));
    test('Postgres Askar wallets E2E test', () => __awaiter(void 0, void 0, void 0, function* () {
        const aliceMessages = new rxjs_1.Subject();
        const bobMessages = new rxjs_1.Subject();
        const subjectMap = {
            'rxjs:alice': aliceMessages,
            'rxjs:bob': bobMessages,
        };
        aliceAgent = new core_1.Agent(alicePostgresAgentOptions);
        aliceAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(aliceMessages));
        aliceAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield aliceAgent.initialize();
        bobAgent = new core_1.Agent(bobPostgresAgentOptions);
        bobAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(bobMessages));
        bobAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield bobAgent.initialize();
        yield (0, helpers_1.e2eTest)(aliceAgent, bobAgent);
    }));
});
