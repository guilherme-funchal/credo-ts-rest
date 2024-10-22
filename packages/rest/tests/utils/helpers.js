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
exports.getTestAgent = getTestAgent;
const crypto_1 = require("crypto");
const src_1 = require("../../src");
const InMemoryAnonCredsRegistry_1 = require("../../src/controllers/anoncreds/__tests__/InMemoryAnonCredsRegistry");
const fixtures_1 = require("../../src/controllers/anoncreds/__tests__/fixtures");
const InternalOutboundTransport_1 = require("../InternalOutboundTransport");
function getTestAgent(name, port, multiTenant) {
    return __awaiter(this, void 0, void 0, function* () {
        const agent = yield (0, src_1.createRestAgent)({
            // we need http endpoint for openid base url. We probably need to separate didcomm endpoint from openid endpoint
            endpoints: port ? [`http://localhost:${port}`] : ['internal', 'http://localhost:random'],
            inboundTransports: port ? [{ transport: 'http', port }] : [],
            // add some randomness to ensure test isolation
            label: `${name} (${(0, crypto_1.randomUUID)()})`,
            walletConfig: {
                id: `${name} (${(0, crypto_1.randomUUID)()})`,
                key: `${name} (${(0, crypto_1.randomUUID)()})`,
            },
            outboundTransports: ['ws', 'http'],
            multiTenant,
        });
        // Add extra anoncreds registry
        agent.modules.anoncreds.config.registries.push(new InMemoryAnonCredsRegistry_1.InMemoryAnonCredsRegistry({
            schemas: {
                [fixtures_1.testAnonCredsSchema.schemaId]: fixtures_1.testAnonCredsSchema.schema,
            },
            credentialDefinitions: {
                [fixtures_1.testAnonCredsCredentialDefinition.credentialDefinitionId]: fixtures_1.testAnonCredsCredentialDefinition.credentialDefinition,
            },
        }));
        if (!port) {
            const internalOutboundTransport = new InternalOutboundTransport_1.InternalOutboundTransport();
            yield internalOutboundTransport.start(agent);
            agent.registerOutboundTransport(internalOutboundTransport);
        }
        return agent;
    });
}
