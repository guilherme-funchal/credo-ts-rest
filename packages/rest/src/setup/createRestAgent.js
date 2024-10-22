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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRestAgent = createRestAgent;
const core_1 = require("@credo-ts/core");
const node_1 = require("@credo-ts/node");
const agent_1 = require("../utils/agent");
const logger_1 = require("../utils/logger");
const CredoRestConfig_1 = require("./CredoRestConfig");
function createRestAgent(config) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { logLevel, inboundTransports = [], outboundTransports = [], indyLedgers = [], cheqdLedgers = [], autoAcceptConnections = true, autoAcceptCredentials = core_1.AutoAcceptCredential.ContentApproved, autoAcceptMediationRequests = true, autoAcceptProofs = core_1.AutoAcceptProof.ContentApproved, multiTenant = false } = config, credoConfig = __rest(config, ["logLevel", "inboundTransports", "outboundTransports", "indyLedgers", "cheqdLedgers", "autoAcceptConnections", "autoAcceptCredentials", "autoAcceptMediationRequests", "autoAcceptProofs", "multiTenant"]);
        const logger = new logger_1.TsLogger(logLevel !== null && logLevel !== void 0 ? logLevel : core_1.LogLevel.error);
        const agentConfig = Object.assign(Object.assign({}, credoConfig), { logger });
        const httpEndpoint = (_a = credoConfig.endpoints) === null || _a === void 0 ? void 0 : _a.find((endpoint) => endpoint.startsWith('http://') || endpoint.startsWith('https://'));
        if (!httpEndpoint) {
            throw new Error('No http endpoint found in config, unable to set up OpenID4VC modules.');
        }
        const maybeIndyLedgers = indyLedgers.length > 0 ? indyLedgers : undefined;
        const maybeCheqdLedgers = cheqdLedgers.length > 0 ? cheqdLedgers : undefined;
        const modules = (0, agent_1.getAgentModules)({
            autoAcceptConnections,
            autoAcceptProofs,
            autoAcceptCredentials,
            autoAcceptMediationRequests,
            indyLedgers: maybeIndyLedgers,
            cheqdLedgers: maybeCheqdLedgers,
            multiTenant,
            baseUrl: httpEndpoint,
        });
        const agent = new core_1.Agent({
            config: agentConfig,
            dependencies: node_1.agentDependencies,
            modules,
        });
        // Register outbound transports
        for (const outboundTransport of outboundTransports) {
            const OutboundTransport = CredoRestConfig_1.outboundTransportMapping[outboundTransport];
            agent.registerOutboundTransport(new OutboundTransport());
        }
        // Register inbound transports
        for (const inboundTransport of inboundTransports) {
            const InboundTransport = CredoRestConfig_1.inboundTransportMapping[inboundTransport.transport];
            const transport = new InboundTransport({ port: inboundTransport.port });
            agent.registerInboundTransport(transport);
            // Configure the oid4vc routers on the http inbound transport
            if (transport instanceof node_1.HttpInboundTransport) {
                transport.app.use('/oid4vci', modules.openId4VcIssuer.config.router);
                transport.app.use('/siop', modules.openId4VcVerifier.config.router);
            }
        }
        yield agent.initialize();
        return agent;
    });
}
