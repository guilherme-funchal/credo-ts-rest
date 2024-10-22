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
exports.getAskarAnonCredsIndyModules = exports.getLegacyAnonCredsModules = void 0;
exports.presentLegacyAnonCredsProof = presentLegacyAnonCredsProof;
exports.issueLegacyAnonCredsCredential = issueLegacyAnonCredsCredential;
exports.setupAnonCredsTests = setupAnonCredsTests;
exports.prepareForAnonCredsIssuance = prepareForAnonCredsIssuance;
const core_1 = require("@aries-framework/core");
const crypto_1 = require("crypto");
const src_1 = require("../../anoncreds-rs/src");
const helpers_1 = require("../../anoncreds-rs/tests/helpers");
const src_2 = require("../../askar/src");
const helpers_2 = require("../../askar/tests/helpers");
const sleep_1 = require("../../core/src/utils/sleep");
const tests_1 = require("../../core/tests");
const helpers_3 = require("../../core/tests/helpers");
const logger_1 = __importDefault(require("../../core/tests/logger"));
const src_3 = require("../../indy-sdk/src");
const setupIndySdkModule_1 = require("../../indy-sdk/tests/setupIndySdkModule");
const src_4 = require("../../indy-vdr/src");
const helpers_4 = require("../../indy-vdr/tests/helpers");
const src_5 = require("../src");
const getLegacyAnonCredsModules = ({ autoAcceptCredentials, autoAcceptProofs, } = {}) => {
    const indyCredentialFormat = new src_5.LegacyIndyCredentialFormatService();
    const indyProofFormat = new src_5.LegacyIndyProofFormatService();
    // Register the credential and proof protocols
    const modules = {
        credentials: new core_1.CredentialsModule({
            autoAcceptCredentials,
            credentialProtocols: [
                new src_5.V1CredentialProtocol({ indyCredentialFormat }),
                new core_1.V2CredentialProtocol({
                    credentialFormats: [indyCredentialFormat],
                }),
            ],
        }),
        proofs: new core_1.ProofsModule({
            autoAcceptProofs,
            proofProtocols: [
                new src_5.V1ProofProtocol({ indyProofFormat }),
                new core_1.V2ProofProtocol({
                    proofFormats: [indyProofFormat],
                }),
            ],
        }),
        anoncreds: new src_5.AnonCredsModule({
            registries: [new src_3.IndySdkAnonCredsRegistry()],
        }),
        dids: new core_1.DidsModule({
            resolvers: [new src_3.IndySdkSovDidResolver(), new src_3.IndySdkIndyDidResolver()],
            registrars: [new src_3.IndySdkIndyDidRegistrar()],
        }),
        indySdk: new src_3.IndySdkModule((0, setupIndySdkModule_1.getIndySdkModuleConfig)()),
        cache: new core_1.CacheModule({
            cache: new core_1.InMemoryLruCache({ limit: 100 }),
        }),
    };
    return modules;
};
exports.getLegacyAnonCredsModules = getLegacyAnonCredsModules;
const getAskarAnonCredsIndyModules = ({ autoAcceptCredentials, autoAcceptProofs, } = {}) => {
    const legacyIndyCredentialFormatService = new src_5.LegacyIndyCredentialFormatService();
    const legacyIndyProofFormatService = new src_5.LegacyIndyProofFormatService();
    const modules = {
        credentials: new core_1.CredentialsModule({
            autoAcceptCredentials,
            credentialProtocols: [
                new src_5.V1CredentialProtocol({
                    indyCredentialFormat: legacyIndyCredentialFormatService,
                }),
                new core_1.V2CredentialProtocol({
                    credentialFormats: [legacyIndyCredentialFormatService],
                }),
            ],
        }),
        proofs: new core_1.ProofsModule({
            autoAcceptProofs,
            proofProtocols: [
                new src_5.V1ProofProtocol({
                    indyProofFormat: legacyIndyProofFormatService,
                }),
                new core_1.V2ProofProtocol({
                    proofFormats: [legacyIndyProofFormatService],
                }),
            ],
        }),
        anoncreds: new src_5.AnonCredsModule({
            registries: [new src_4.IndyVdrAnonCredsRegistry()],
        }),
        anoncredsRs: new src_1.AnonCredsRsModule({
            anoncreds: helpers_1.anoncreds,
        }),
        indyVdr: new src_4.IndyVdrModule(helpers_4.indyVdrModuleConfig),
        dids: new core_1.DidsModule({
            resolvers: [new src_4.IndyVdrSovDidResolver(), new src_4.IndyVdrIndyDidResolver()],
            registrars: [new src_4.IndyVdrIndyDidRegistrar()],
        }),
        askar: new src_2.AskarModule(helpers_2.askarModuleConfig),
        cache: new core_1.CacheModule({
            cache: new core_1.InMemoryLruCache({ limit: 100 }),
        }),
    };
    return modules;
};
exports.getAskarAnonCredsIndyModules = getAskarAnonCredsIndyModules;
function presentLegacyAnonCredsProof(_a) {
    return __awaiter(this, arguments, void 0, function* ({ verifierAgent, verifierReplay, holderAgent, holderReplay, verifierHolderConnectionId, request: { attributes, predicates }, }) {
        let holderProofExchangeRecordPromise = (0, helpers_3.waitForProofExchangeRecordSubject)(holderReplay, {
            state: core_1.ProofState.RequestReceived,
        });
        let verifierProofExchangeRecord = yield verifierAgent.proofs.requestProof({
            connectionId: verifierHolderConnectionId,
            proofFormats: {
                indy: {
                    name: 'Test Proof Request',
                    requested_attributes: attributes,
                    requested_predicates: predicates,
                    version: '1.0',
                },
            },
            protocolVersion: 'v2',
        });
        let holderProofExchangeRecord = yield holderProofExchangeRecordPromise;
        const selectedCredentials = yield holderAgent.proofs.selectCredentialsForRequest({
            proofRecordId: holderProofExchangeRecord.id,
        });
        const verifierProofExchangeRecordPromise = (0, helpers_3.waitForProofExchangeRecordSubject)(verifierReplay, {
            threadId: holderProofExchangeRecord.threadId,
            state: core_1.ProofState.PresentationReceived,
        });
        yield holderAgent.proofs.acceptRequest({
            proofRecordId: holderProofExchangeRecord.id,
            proofFormats: { indy: selectedCredentials.proofFormats.indy },
        });
        verifierProofExchangeRecord = yield verifierProofExchangeRecordPromise;
        // assert presentation is valid
        expect(verifierProofExchangeRecord.isVerified).toBe(true);
        holderProofExchangeRecordPromise = (0, helpers_3.waitForProofExchangeRecordSubject)(holderReplay, {
            threadId: holderProofExchangeRecord.threadId,
            state: core_1.ProofState.Done,
        });
        verifierProofExchangeRecord = yield verifierAgent.proofs.acceptPresentation({
            proofRecordId: verifierProofExchangeRecord.id,
        });
        holderProofExchangeRecord = yield holderProofExchangeRecordPromise;
        return {
            verifierProofExchangeRecord,
            holderProofExchangeRecord,
        };
    });
}
function issueLegacyAnonCredsCredential(_a) {
    return __awaiter(this, arguments, void 0, function* ({ issuerAgent, issuerReplay, holderAgent, holderReplay, issuerHolderConnectionId, offer, }) {
        let issuerCredentialExchangeRecord = yield issuerAgent.credentials.offerCredential({
            comment: 'some comment about credential',
            connectionId: issuerHolderConnectionId,
            protocolVersion: 'v1',
            credentialFormats: {
                indy: offer,
            },
            autoAcceptCredential: core_1.AutoAcceptCredential.ContentApproved,
        });
        let holderCredentialExchangeRecord = yield (0, helpers_3.waitForCredentialRecordSubject)(holderReplay, {
            threadId: issuerCredentialExchangeRecord.threadId,
            state: core_1.CredentialState.OfferReceived,
        });
        yield holderAgent.credentials.acceptOffer({
            credentialRecordId: holderCredentialExchangeRecord.id,
            autoAcceptCredential: core_1.AutoAcceptCredential.ContentApproved,
        });
        // Because we use auto-accept it can take a while to have the whole credential flow finished
        // Both parties need to interact with the ledger and sign/verify the credential
        holderCredentialExchangeRecord = yield (0, helpers_3.waitForCredentialRecordSubject)(holderReplay, {
            threadId: issuerCredentialExchangeRecord.threadId,
            state: core_1.CredentialState.Done,
        });
        issuerCredentialExchangeRecord = yield (0, helpers_3.waitForCredentialRecordSubject)(issuerReplay, {
            threadId: issuerCredentialExchangeRecord.threadId,
            state: core_1.CredentialState.Done,
        });
        return {
            issuerCredentialExchangeRecord,
            holderCredentialExchangeRecord,
        };
    });
}
function setupAnonCredsTests(_a) {
    return __awaiter(this, arguments, void 0, function* ({ issuerName, holderName, verifierName, autoAcceptCredentials, autoAcceptProofs, attributeNames, createConnections, }) {
        const issuerAgent = new core_1.Agent((0, helpers_3.getAgentOptions)(issuerName, {
            endpoints: ['rxjs:issuer'],
        }, (0, exports.getLegacyAnonCredsModules)({
            autoAcceptCredentials,
            autoAcceptProofs,
        })));
        const holderAgent = new core_1.Agent((0, helpers_3.getAgentOptions)(holderName, {
            endpoints: ['rxjs:holder'],
        }, (0, exports.getLegacyAnonCredsModules)({
            autoAcceptCredentials,
            autoAcceptProofs,
        })));
        const verifierAgent = verifierName
            ? new core_1.Agent((0, helpers_3.getAgentOptions)(verifierName, {
                endpoints: ['rxjs:verifier'],
            }, (0, exports.getLegacyAnonCredsModules)({
                autoAcceptCredentials,
                autoAcceptProofs,
            })))
            : undefined;
        (0, tests_1.setupSubjectTransports)(verifierAgent ? [issuerAgent, holderAgent, verifierAgent] : [issuerAgent, holderAgent]);
        const [issuerReplay, holderReplay, verifierReplay] = (0, tests_1.setupEventReplaySubjects)(verifierAgent ? [issuerAgent, holderAgent, verifierAgent] : [issuerAgent, holderAgent], [core_1.CredentialEventTypes.CredentialStateChanged, core_1.ProofEventTypes.ProofStateChanged]);
        yield issuerAgent.initialize();
        yield holderAgent.initialize();
        if (verifierAgent)
            yield verifierAgent.initialize();
        const { credentialDefinition, schema } = yield prepareForAnonCredsIssuance(issuerAgent, {
            attributeNames,
        });
        let issuerHolderConnection;
        let holderIssuerConnection;
        let verifierHolderConnection;
        let holderVerifierConnection;
        if (createConnections !== null && createConnections !== void 0 ? createConnections : true) {
            ;
            [issuerHolderConnection, holderIssuerConnection] = yield (0, helpers_3.makeConnection)(issuerAgent, holderAgent);
            if (verifierAgent) {
                ;
                [holderVerifierConnection, verifierHolderConnection] = yield (0, helpers_3.makeConnection)(holderAgent, verifierAgent);
            }
        }
        return {
            issuerAgent,
            issuerReplay,
            holderAgent,
            holderReplay,
            verifierAgent: verifierName ? verifierAgent : undefined,
            verifierReplay: verifierName ? verifierReplay : undefined,
            credentialDefinitionId: credentialDefinition.credentialDefinitionId,
            schemaId: schema.schemaId,
            issuerHolderConnectionId: issuerHolderConnection === null || issuerHolderConnection === void 0 ? void 0 : issuerHolderConnection.id,
            holderIssuerConnectionId: holderIssuerConnection === null || holderIssuerConnection === void 0 ? void 0 : holderIssuerConnection.id,
            holderVerifierConnectionId: holderVerifierConnection === null || holderVerifierConnection === void 0 ? void 0 : holderVerifierConnection.id,
            verifierHolderConnectionId: verifierHolderConnection === null || verifierHolderConnection === void 0 ? void 0 : verifierHolderConnection.id,
        };
    });
}
function prepareForAnonCredsIssuance(agent_1, _a) {
    return __awaiter(this, arguments, void 0, function* (agent, { attributeNames }) {
        // Add existing endorser did to the wallet
        const unqualifiedDid = yield (0, helpers_3.importExistingIndyDidFromPrivateKey)(agent, core_1.TypedArrayEncoder.fromString(helpers_3.publicDidSeed));
        const didIndyDid = `did:indy:pool:localtest:${unqualifiedDid}`;
        const schema = yield registerSchema(agent, {
            // TODO: update attrNames to attributeNames
            attrNames: attributeNames,
            name: `Schema ${(0, crypto_1.randomUUID)()}`,
            version: '1.0',
            issuerId: didIndyDid,
        });
        // Wait some time pass to let ledger settle the object
        yield (0, sleep_1.sleep)(1000);
        const credentialDefinition = yield registerCredentialDefinition(agent, {
            schemaId: schema.schemaId,
            issuerId: didIndyDid,
            tag: 'default',
        });
        const s = (0, src_5.parseIndySchemaId)(schema.schemaId);
        const cd = (0, src_5.parseIndyCredentialDefinitionId)(credentialDefinition.credentialDefinitionId);
        const legacySchemaId = (0, src_5.getUnqualifiedSchemaId)(s.namespaceIdentifier, s.schemaName, s.schemaVersion);
        const legacyCredentialDefinitionId = (0, src_5.getUnqualifiedCredentialDefinitionId)(cd.namespaceIdentifier, cd.schemaSeqNo, cd.tag);
        // Wait some time pass to let ledger settle the object
        yield (0, sleep_1.sleep)(1000);
        // NOTE: we return the legacy schema and credential definition ids here because that's what currently expected
        // in all tests. If we also support did:indy in tests we probably want to return the qualified identifiers here
        // and transform them to the legacy variant in the specific tests that need it.
        return {
            schema: Object.assign(Object.assign({}, schema), { schemaId: legacySchemaId }),
            credentialDefinition: Object.assign(Object.assign({}, credentialDefinition), { credentialDefinitionId: legacyCredentialDefinitionId }),
        };
    });
}
function registerSchema(agent, schema) {
    return __awaiter(this, void 0, void 0, function* () {
        const { schemaState } = yield agent.modules.anoncreds.registerSchema({
            schema,
            options: {},
        });
        logger_1.default.test(`created schema with id ${schemaState.schemaId}`, schema);
        if (schemaState.state !== 'finished') {
            throw new core_1.AriesFrameworkError(`Schema not created: ${schemaState.state === 'failed' ? schemaState.reason : 'Not finished'}`);
        }
        return schemaState;
    });
}
function registerCredentialDefinition(agent, credentialDefinition) {
    return __awaiter(this, void 0, void 0, function* () {
        const { credentialDefinitionState } = yield agent.modules.anoncreds.registerCredentialDefinition({
            credentialDefinition,
            options: {},
        });
        if (credentialDefinitionState.state !== 'finished') {
            throw new core_1.AriesFrameworkError(`Credential definition not created: ${credentialDefinitionState.state === 'failed' ? credentialDefinitionState.reason : 'Not finished'}`);
        }
        return credentialDefinitionState;
    });
}
