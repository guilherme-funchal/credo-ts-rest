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
const core_1 = require("@aries-framework/core");
const helpers_1 = require("../../../../../../core/tests/helpers");
const logger_1 = __importDefault(require("../../../../../../core/tests/logger"));
const legacyAnonCredsSetup_1 = require("../../../../../tests/legacyAnonCredsSetup");
const messages_1 = require("../messages");
describe('V1 Credentials', () => {
    let faberAgent;
    let aliceAgent;
    let credentialDefinitionId;
    let aliceConnectionId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        ;
        ({
            issuerAgent: faberAgent,
            holderAgent: aliceAgent,
            credentialDefinitionId,
            holderIssuerConnectionId: aliceConnectionId,
        } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber Agent Credentials V1',
            holderName: 'Alice Agent Credentials V1',
            attributeNames: ['name', 'age', 'x-ray', 'profile_picture'],
        }));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('Alice starts with V1 credential proposal to Faber', () => __awaiter(void 0, void 0, void 0, function* () {
        const credentialPreview = messages_1.V1CredentialPreview.fromRecord({
            name: 'John',
            age: '99',
            'x-ray': 'some x-ray',
            profile_picture: 'profile picture',
        });
        logger_1.default.test('Alice sends (v1) credential proposal to Faber');
        const credentialExchangeRecord = yield aliceAgent.credentials.proposeCredential({
            connectionId: aliceConnectionId,
            protocolVersion: 'v1',
            credentialFormats: {
                indy: {
                    attributes: credentialPreview.attributes,
                    schemaIssuerDid: 'GMm4vMw8LLrLJjp81kRRLp',
                    schemaName: 'ahoy',
                    schemaVersion: '1.0',
                    schemaId: 'q7ATwTYbQDgiigVijUAej:2:test:1.0',
                    issuerDid: 'GMm4vMw8LLrLJjp81kRRLp',
                    credentialDefinitionId: 'GMm4vMw8LLrLJjp81kRRLp:3:CL:12:tag',
                },
            },
            comment: 'v1 propose credential test',
        });
        expect(credentialExchangeRecord).toMatchObject({
            connectionId: aliceConnectionId,
            protocolVersion: 'v1',
            state: core_1.CredentialState.ProposalSent,
            threadId: expect.any(String),
        });
        logger_1.default.test('Faber waits for credential proposal from Alice');
        let faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(faberAgent, {
            threadId: credentialExchangeRecord.threadId,
            state: core_1.CredentialState.ProposalReceived,
        });
        logger_1.default.test('Faber sends credential offer to Alice');
        yield faberAgent.credentials.acceptProposal({
            credentialRecordId: faberCredentialRecord.id,
            comment: 'V1 Indy Proposal',
            credentialFormats: {
                indy: {
                    credentialDefinitionId: credentialDefinitionId,
                    attributes: credentialPreview.attributes,
                },
            },
        });
        logger_1.default.test('Alice waits for credential offer from Faber');
        let aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
            threadId: faberCredentialRecord.threadId,
            state: core_1.CredentialState.OfferReceived,
        });
        const didCommMessageRepository = faberAgent.dependencyManager.resolve(core_1.DidCommMessageRepository);
        const offerMessageRecord = yield didCommMessageRepository.findAgentMessage(faberAgent.context, {
            associatedRecordId: faberCredentialRecord.id,
            messageClass: messages_1.V1OfferCredentialMessage,
        });
        expect(core_1.JsonTransformer.toJSON(offerMessageRecord)).toMatchObject({
            '@id': expect.any(String),
            '@type': 'https://didcomm.org/issue-credential/1.0/offer-credential',
            comment: 'V1 Indy Proposal',
            credential_preview: {
                '@type': 'https://didcomm.org/issue-credential/1.0/credential-preview',
                attributes: [
                    {
                        name: 'name',
                        'mime-type': 'text/plain',
                        value: 'John',
                    },
                    {
                        name: 'age',
                        'mime-type': 'text/plain',
                        value: '99',
                    },
                    {
                        name: 'x-ray',
                        'mime-type': 'text/plain',
                        value: 'some x-ray',
                    },
                    {
                        name: 'profile_picture',
                        'mime-type': 'text/plain',
                        value: 'profile picture',
                    },
                ],
            },
            'offers~attach': expect.any(Array),
        });
        expect(aliceCredentialRecord).toMatchObject({
            id: expect.any(String),
            connectionId: expect.any(String),
            type: core_1.CredentialExchangeRecord.type,
        });
        // below values are not in json object
        expect(aliceCredentialRecord.getTags()).toEqual({
            threadId: faberCredentialRecord.threadId,
            connectionId: aliceCredentialRecord.connectionId,
            state: aliceCredentialRecord.state,
            credentialIds: [],
        });
        const offerCredentialExchangeRecord = yield aliceAgent.credentials.acceptOffer({
            credentialRecordId: aliceCredentialRecord.id,
        });
        expect(offerCredentialExchangeRecord).toMatchObject({
            connectionId: aliceConnectionId,
            protocolVersion: 'v1',
            state: core_1.CredentialState.RequestSent,
            threadId: expect.any(String),
        });
        logger_1.default.test('Faber waits for credential request from Alice');
        faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(faberAgent, {
            threadId: aliceCredentialRecord.threadId,
            state: core_1.CredentialState.RequestReceived,
        });
        logger_1.default.test('Faber sends credential to Alice');
        yield faberAgent.credentials.acceptRequest({
            credentialRecordId: faberCredentialRecord.id,
            comment: 'V1 Indy Credential',
        });
        logger_1.default.test('Alice waits for credential from Faber');
        aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
            threadId: faberCredentialRecord.threadId,
            state: core_1.CredentialState.CredentialReceived,
        });
        yield aliceAgent.credentials.acceptCredential({
            credentialRecordId: aliceCredentialRecord.id,
        });
        logger_1.default.test('Faber waits for state done');
        yield (0, helpers_1.waitForCredentialRecord)(faberAgent, {
            threadId: faberCredentialRecord.threadId,
            state: core_1.CredentialState.Done,
        });
        const proposalMessage = yield aliceAgent.credentials.findProposalMessage(aliceCredentialRecord.id);
        const offerMessage = yield aliceAgent.credentials.findOfferMessage(aliceCredentialRecord.id);
        const requestMessage = yield aliceAgent.credentials.findRequestMessage(aliceCredentialRecord.id);
        const credentialMessage = yield aliceAgent.credentials.findCredentialMessage(aliceCredentialRecord.id);
        expect(proposalMessage).toBeInstanceOf(messages_1.V1ProposeCredentialMessage);
        expect(offerMessage).toBeInstanceOf(messages_1.V1OfferCredentialMessage);
        expect(requestMessage).toBeInstanceOf(messages_1.V1RequestCredentialMessage);
        expect(credentialMessage).toBeInstanceOf(messages_1.V1IssueCredentialMessage);
        const formatData = yield aliceAgent.credentials.getFormatData(aliceCredentialRecord.id);
        expect(formatData).toMatchObject({
            proposalAttributes: [
                {
                    name: 'name',
                    mimeType: 'text/plain',
                    value: 'John',
                },
                {
                    name: 'age',
                    mimeType: 'text/plain',
                    value: '99',
                },
                {
                    name: 'x-ray',
                    mimeType: 'text/plain',
                    value: 'some x-ray',
                },
                {
                    name: 'profile_picture',
                    mimeType: 'text/plain',
                    value: 'profile picture',
                },
            ],
            proposal: {
                indy: {
                    schema_issuer_did: expect.any(String),
                    schema_id: expect.any(String),
                    schema_name: expect.any(String),
                    schema_version: expect.any(String),
                    cred_def_id: expect.any(String),
                    issuer_did: expect.any(String),
                },
            },
            offer: {
                indy: {
                    schema_id: expect.any(String),
                    cred_def_id: expect.any(String),
                    key_correctness_proof: expect.any(Object),
                    nonce: expect.any(String),
                },
            },
            offerAttributes: [
                {
                    name: 'name',
                    mimeType: 'text/plain',
                    value: 'John',
                },
                {
                    name: 'age',
                    mimeType: 'text/plain',
                    value: '99',
                },
                {
                    name: 'x-ray',
                    mimeType: 'text/plain',
                    value: 'some x-ray',
                },
                {
                    name: 'profile_picture',
                    mimeType: 'text/plain',
                    value: 'profile picture',
                },
            ],
            request: {
                indy: {
                    prover_did: expect.any(String),
                    cred_def_id: expect.any(String),
                    blinded_ms: expect.any(Object),
                    blinded_ms_correctness_proof: expect.any(Object),
                    nonce: expect.any(String),
                },
            },
            credential: {
                indy: {
                    schema_id: expect.any(String),
                    cred_def_id: expect.any(String),
                    rev_reg_id: null,
                    values: {
                        age: { raw: '99', encoded: '99' },
                        profile_picture: {
                            raw: 'profile picture',
                            encoded: '28661874965215723474150257281172102867522547934697168414362313592277831163345',
                        },
                        name: {
                            raw: 'John',
                            encoded: '76355713903561865866741292988746191972523015098789458240077478826513114743258',
                        },
                        'x-ray': {
                            raw: 'some x-ray',
                            encoded: '43715611391396952879378357808399363551139229809726238083934532929974486114650',
                        },
                    },
                    signature: expect.any(Object),
                    signature_correctness_proof: expect.any(Object),
                    rev_reg: null,
                    witness: null,
                },
            },
        });
    }));
});
