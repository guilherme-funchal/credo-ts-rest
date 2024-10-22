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
exports.getJsonLdModules = void 0;
exports.setupJsonLdTests = setupJsonLdTests;
const BbsModule_1 = require("../../bbs-signatures/src/BbsModule");
const src_1 = require("../../indy-sdk/src");
const setupIndySdkModule_1 = require("../../indy-sdk/tests/setupIndySdkModule");
const src_2 = require("../src");
const documentLoader_1 = require("../src/modules/vc/data-integrity/__tests__/documentLoader");
const events_1 = require("./events");
const helpers_1 = require("./helpers");
const transport_1 = require("./transport");
const getJsonLdModules = ({ autoAcceptCredentials, autoAcceptProofs, } = {}) => ({
    credentials: new src_2.CredentialsModule({
        credentialProtocols: [new src_2.V2CredentialProtocol({ credentialFormats: [new src_2.JsonLdCredentialFormatService()] })],
        autoAcceptCredentials,
    }),
    w3cCredentials: new src_2.W3cCredentialsModule({
        documentLoader: documentLoader_1.customDocumentLoader,
    }),
    proofs: new src_2.ProofsModule({
        autoAcceptProofs,
    }),
    cache: new src_2.CacheModule({
        cache: new src_2.InMemoryLruCache({ limit: 100 }),
    }),
    indySdk: new src_1.IndySdkModule({
        indySdk: setupIndySdkModule_1.indySdk,
    }),
    bbs: new BbsModule_1.BbsModule(),
});
exports.getJsonLdModules = getJsonLdModules;
function setupJsonLdTests(_a) {
    return __awaiter(this, arguments, void 0, function* ({ issuerName, holderName, verifierName, autoAcceptCredentials, autoAcceptProofs, createConnections, }) {
        const modules = (0, exports.getJsonLdModules)({
            autoAcceptCredentials,
            autoAcceptProofs,
        });
        const issuerAgent = new src_2.Agent((0, helpers_1.getAgentOptions)(issuerName, {
            endpoints: ['rxjs:issuer'],
        }, modules));
        const holderAgent = new src_2.Agent((0, helpers_1.getAgentOptions)(holderName, {
            endpoints: ['rxjs:holder'],
        }, modules));
        const verifierAgent = verifierName
            ? new src_2.Agent((0, helpers_1.getAgentOptions)(verifierName, {
                endpoints: ['rxjs:verifier'],
            }, modules))
            : undefined;
        (0, transport_1.setupSubjectTransports)(verifierAgent ? [issuerAgent, holderAgent, verifierAgent] : [issuerAgent, holderAgent]);
        const [issuerReplay, holderReplay, verifierReplay] = (0, events_1.setupEventReplaySubjects)(verifierAgent ? [issuerAgent, holderAgent, verifierAgent] : [issuerAgent, holderAgent], [src_2.CredentialEventTypes.CredentialStateChanged, src_2.ProofEventTypes.ProofStateChanged]);
        yield issuerAgent.initialize();
        yield holderAgent.initialize();
        if (verifierAgent)
            yield verifierAgent.initialize();
        let issuerHolderConnection;
        let holderIssuerConnection;
        let verifierHolderConnection;
        let holderVerifierConnection;
        if (createConnections !== null && createConnections !== void 0 ? createConnections : true) {
            ;
            [issuerHolderConnection, holderIssuerConnection] = yield (0, helpers_1.makeConnection)(issuerAgent, holderAgent);
            if (verifierAgent) {
                ;
                [holderVerifierConnection, verifierHolderConnection] = yield (0, helpers_1.makeConnection)(holderAgent, verifierAgent);
            }
        }
        return {
            issuerAgent,
            issuerReplay,
            holderAgent,
            holderReplay,
            verifierAgent: verifierName ? verifierAgent : undefined,
            verifierReplay: verifierName ? verifierReplay : undefined,
            issuerHolderConnectionId: issuerHolderConnection === null || issuerHolderConnection === void 0 ? void 0 : issuerHolderConnection.id,
            holderIssuerConnectionId: holderIssuerConnection === null || holderIssuerConnection === void 0 ? void 0 : holderIssuerConnection.id,
            holderVerifierConnectionId: holderVerifierConnection === null || holderVerifierConnection === void 0 ? void 0 : holderVerifierConnection.id,
            verifierHolderConnectionId: verifierHolderConnection === null || verifierHolderConnection === void 0 ? void 0 : verifierHolderConnection.id,
        };
    });
}
