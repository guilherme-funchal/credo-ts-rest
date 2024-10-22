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
const src_1 = require("../../../../../../../anoncreds/src");
const legacyAnonCredsSetup_1 = require("../../../../../../../anoncreds/tests/legacyAnonCredsSetup");
const tests_1 = require("../../../../../../tests");
const logger_1 = __importDefault(require("../../../../../../tests/logger"));
const storage_1 = require("../../../../../storage");
const utils_1 = require("../../../../../utils");
const CredentialState_1 = require("../../../models/CredentialState");
const CredentialExchangeRecord_1 = require("../../../repository/CredentialExchangeRecord");
const messages_1 = require("../messages");
const credentialPreview = messages_1.V2CredentialPreview.fromRecord({
    name: 'John',
    age: '99',
    'x-ray': 'some x-ray',
    profile_picture: 'profile picture',
});
describe('v2 credentials', () => {
    let faberAgent;
    let aliceAgent;
    let credentialDefinitionId;
    let faberConnectionId;
    let aliceConnectionId;
    let faberReplay;
    let aliceReplay;
    let indyCredentialProposal;
    const newCredentialPreview = messages_1.V2CredentialPreview.fromRecord({
        name: 'John',
        age: '99',
        'x-ray': 'another x-ray value',
        profile_picture: 'another profile picture',
    });
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        ;
        ({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            credentialDefinitionId,
            issuerHolderConnectionId: faberConnectionId,
            holderIssuerConnectionId: aliceConnectionId,
        } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber Agent Credentials v2',
            holderName: 'Alice Agent Credentials v2',
            attributeNames: ['name', 'age', 'x-ray', 'profile_picture'],
        }));
        indyCredentialProposal = {
            credentialDefinitionId: credentialDefinitionId,
            schemaIssuerDid: 'GMm4vMw8LLrLJjp81kRRLp',
            schemaName: 'ahoy',
            schemaVersion: '1.0',
            schemaId: 'q7ATwTYbQDgiigVijUAej:2:test:1.0',
            issuerDid: 'GMm4vMw8LLrLJjp81kRRLp',
        };
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('Alice starts with V2 credential proposal to Faber', () => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.test('Alice sends (v2) credential proposal to Faber');
        const credentialExchangeRecord = yield aliceAgent.credentials.proposeCredential({
            connectionId: aliceConnectionId,
            protocolVersion: 'v2',
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
            comment: 'v2 propose credential test',
        });
        expect(credentialExchangeRecord).toMatchObject({
            connectionId: aliceConnectionId,
            protocolVersion: 'v2',
            state: CredentialState_1.CredentialState.ProposalSent,
            threadId: expect.any(String),
        });
        logger_1.default.test('Faber waits for credential proposal from Alice');
        let faberCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: credentialExchangeRecord.threadId,
            state: CredentialState_1.CredentialState.ProposalReceived,
        });
        logger_1.default.test('Faber sends credential offer to Alice');
        yield faberAgent.credentials.acceptProposal({
            credentialRecordId: faberCredentialRecord.id,
            comment: 'V2 Indy Proposal',
            credentialFormats: {
                indy: {
                    credentialDefinitionId: credentialDefinitionId,
                    attributes: credentialPreview.attributes,
                },
            },
        });
        logger_1.default.test('Alice waits for credential offer from Faber');
        let aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.OfferReceived,
        });
        const didCommMessageRepository = faberAgent.dependencyManager.resolve(storage_1.DidCommMessageRepository);
        const offerMessage = yield didCommMessageRepository.findAgentMessage(faberAgent.context, {
            associatedRecordId: faberCredentialRecord.id,
            messageClass: messages_1.V2OfferCredentialMessage,
        });
        expect(utils_1.JsonTransformer.toJSON(offerMessage)).toMatchObject({
            '@id': expect.any(String),
            '@type': 'https://didcomm.org/issue-credential/2.0/offer-credential',
            comment: 'V2 Indy Proposal',
            credential_preview: {
                '@type': 'https://didcomm.org/issue-credential/2.0/credential-preview',
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
            type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
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
            protocolVersion: 'v2',
            state: CredentialState_1.CredentialState.RequestSent,
            threadId: expect.any(String),
        });
        logger_1.default.test('Faber waits for credential request from Alice');
        faberCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: aliceCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.RequestReceived,
        });
        logger_1.default.test('Faber sends credential to Alice');
        yield faberAgent.credentials.acceptRequest({
            credentialRecordId: faberCredentialRecord.id,
            comment: 'V2 Indy Credential',
        });
        logger_1.default.test('Alice waits for credential from Faber');
        aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.CredentialReceived,
        });
        yield aliceAgent.credentials.acceptCredential({
            credentialRecordId: aliceCredentialRecord.id,
        });
        logger_1.default.test('Faber waits for state done');
        yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.Done,
        });
    }));
    test('Faber issues credential which is then deleted from Alice`s wallet', () => __awaiter(void 0, void 0, void 0, function* () {
        const { holderCredentialExchangeRecord } = yield (0, legacyAnonCredsSetup_1.issueLegacyAnonCredsCredential)({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            issuerHolderConnectionId: faberConnectionId,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            offer: {
                credentialDefinitionId: credentialDefinitionId,
                attributes: credentialPreview.attributes,
            },
        });
        // test that delete credential removes from both repository and wallet
        // latter is tested by spying on holder service to
        // see if deleteCredential is called
        const holderService = aliceAgent.dependencyManager.resolve(src_1.AnonCredsHolderServiceSymbol);
        const deleteCredentialSpy = jest.spyOn(holderService, 'deleteCredential');
        yield aliceAgent.credentials.deleteById(holderCredentialExchangeRecord.id, {
            deleteAssociatedCredentials: true,
            deleteAssociatedDidCommMessages: true,
        });
        expect(deleteCredentialSpy).toHaveBeenNthCalledWith(1, aliceAgent.context, holderCredentialExchangeRecord.credentials[0].credentialRecordId);
        return expect(aliceAgent.credentials.getById(holderCredentialExchangeRecord.id)).rejects.toThrowError(`CredentialRecord: record with id ${holderCredentialExchangeRecord.id} not found.`);
    }));
    test('Alice starts with proposal, faber sends a counter offer, alice sends second proposal, faber sends second offer', () => __awaiter(void 0, void 0, void 0, function* () {
        // proposeCredential -> negotiateProposal -> negotiateOffer -> negotiateProposal -> acceptOffer -> acceptRequest -> DONE (credential issued)
        let faberCredentialRecordPromise = (0, tests_1.waitForCredentialRecord)(faberAgent, {
            state: CredentialState_1.CredentialState.ProposalReceived,
        });
        logger_1.default.test('Alice sends credential proposal to Faber');
        let aliceCredentialExchangeRecord = yield aliceAgent.credentials.proposeCredential({
            connectionId: aliceConnectionId,
            protocolVersion: 'v2',
            credentialFormats: {
                indy: Object.assign(Object.assign({}, indyCredentialProposal), { attributes: credentialPreview.attributes }),
            },
            comment: 'v2 propose credential test',
        });
        expect(aliceCredentialExchangeRecord.state).toBe(CredentialState_1.CredentialState.ProposalSent);
        logger_1.default.test('Faber waits for credential proposal from Alice');
        let faberCredentialRecord = yield faberCredentialRecordPromise;
        let aliceCredentialRecordPromise = (0, tests_1.waitForCredentialRecord)(aliceAgent, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.OfferReceived,
        });
        faberCredentialRecord = yield faberAgent.credentials.negotiateProposal({
            credentialRecordId: faberCredentialRecord.id,
            credentialFormats: {
                indy: {
                    credentialDefinitionId: credentialDefinitionId,
                    attributes: newCredentialPreview.attributes,
                },
            },
        });
        logger_1.default.test('Alice waits for credential offer from Faber');
        let aliceCredentialRecord = yield aliceCredentialRecordPromise;
        // Check if the state of the credential records did not change
        faberCredentialRecord = yield faberAgent.credentials.getById(faberCredentialRecord.id);
        faberCredentialRecord.assertState(CredentialState_1.CredentialState.OfferSent);
        aliceCredentialRecord = yield aliceAgent.credentials.getById(aliceCredentialRecord.id);
        aliceCredentialRecord.assertState(CredentialState_1.CredentialState.OfferReceived);
        faberCredentialRecordPromise = (0, tests_1.waitForCredentialRecord)(faberAgent, {
            threadId: aliceCredentialExchangeRecord.threadId,
            state: CredentialState_1.CredentialState.ProposalReceived,
        });
        // second proposal
        aliceCredentialExchangeRecord = yield aliceAgent.credentials.negotiateOffer({
            credentialRecordId: aliceCredentialRecord.id,
            credentialFormats: {
                indy: Object.assign(Object.assign({}, indyCredentialProposal), { attributes: newCredentialPreview.attributes }),
            },
        });
        expect(aliceCredentialExchangeRecord.state).toBe(CredentialState_1.CredentialState.ProposalSent);
        logger_1.default.test('Faber waits for credential proposal from Alice');
        faberCredentialRecord = yield faberCredentialRecordPromise;
        aliceCredentialRecordPromise = (0, tests_1.waitForCredentialRecord)(aliceAgent, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.OfferReceived,
        });
        faberCredentialRecord = yield faberAgent.credentials.negotiateProposal({
            credentialRecordId: faberCredentialRecord.id,
            credentialFormats: {
                indy: {
                    credentialDefinitionId: credentialDefinitionId,
                    attributes: newCredentialPreview.attributes,
                },
            },
        });
        logger_1.default.test('Alice waits for credential offer from Faber');
        aliceCredentialRecord = yield aliceCredentialRecordPromise;
        const offerCredentialExchangeRecord = yield aliceAgent.credentials.acceptOffer({
            credentialRecordId: aliceCredentialExchangeRecord.id,
        });
        expect(offerCredentialExchangeRecord).toMatchObject({
            connectionId: aliceConnectionId,
            state: CredentialState_1.CredentialState.RequestSent,
            protocolVersion: 'v2',
            threadId: aliceCredentialExchangeRecord.threadId,
        });
        logger_1.default.test('Faber waits for credential request from Alice');
        faberCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: aliceCredentialExchangeRecord.threadId,
            state: CredentialState_1.CredentialState.RequestReceived,
        });
        logger_1.default.test('Faber sends credential to Alice');
        yield faberAgent.credentials.acceptRequest({
            credentialRecordId: faberCredentialRecord.id,
            comment: 'V2 Indy Credential',
        });
        logger_1.default.test('Alice waits for credential from Faber');
        aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.CredentialReceived,
        });
        // testLogger.test('Alice sends credential ack to Faber')
        yield aliceAgent.credentials.acceptCredential({ credentialRecordId: aliceCredentialRecord.id });
        logger_1.default.test('Faber waits for credential ack from Alice');
        faberCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.Done,
        });
        expect(aliceCredentialRecord).toMatchObject({
            type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            threadId: expect.any(String),
            connectionId: expect.any(String),
            state: CredentialState_1.CredentialState.CredentialReceived,
        });
    }));
    test('Faber starts with offer, alice sends counter proposal, faber sends second offer, alice sends second proposal', () => __awaiter(void 0, void 0, void 0, function* () {
        let aliceCredentialRecordPromise = (0, tests_1.waitForCredentialRecord)(aliceAgent, {
            state: CredentialState_1.CredentialState.OfferReceived,
        });
        logger_1.default.test('Faber sends credential offer to Alice');
        let faberCredentialRecord = yield faberAgent.credentials.offerCredential({
            comment: 'some comment about credential',
            connectionId: faberConnectionId,
            credentialFormats: {
                indy: {
                    attributes: credentialPreview.attributes,
                    credentialDefinitionId: credentialDefinitionId,
                },
            },
            protocolVersion: 'v2',
        });
        logger_1.default.test('Alice waits for credential offer from Faber');
        let aliceCredentialRecord = yield aliceCredentialRecordPromise;
        let faberCredentialRecordPromise = (0, tests_1.waitForCredentialRecord)(faberAgent, {
            threadId: aliceCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.ProposalReceived,
        });
        aliceCredentialRecord = yield aliceAgent.credentials.negotiateOffer({
            credentialRecordId: aliceCredentialRecord.id,
            credentialFormats: {
                indy: Object.assign(Object.assign({}, indyCredentialProposal), { attributes: newCredentialPreview.attributes }),
            },
        });
        expect(aliceCredentialRecord.state).toBe(CredentialState_1.CredentialState.ProposalSent);
        logger_1.default.test('Faber waits for credential proposal from Alice');
        faberCredentialRecord = yield faberCredentialRecordPromise;
        aliceCredentialRecordPromise = (0, tests_1.waitForCredentialRecord)(aliceAgent, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.OfferReceived,
        });
        faberCredentialRecord = yield faberAgent.credentials.negotiateProposal({
            credentialRecordId: faberCredentialRecord.id,
            credentialFormats: {
                indy: {
                    credentialDefinitionId: credentialDefinitionId,
                    attributes: newCredentialPreview.attributes,
                },
            },
        });
        logger_1.default.test('Alice waits for credential offer from Faber');
        aliceCredentialRecord = yield aliceCredentialRecordPromise;
        faberCredentialRecordPromise = (0, tests_1.waitForCredentialRecord)(faberAgent, {
            threadId: aliceCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.ProposalReceived,
        });
        aliceCredentialRecord = yield aliceAgent.credentials.negotiateOffer({
            credentialRecordId: aliceCredentialRecord.id,
            credentialFormats: {
                indy: Object.assign(Object.assign({}, indyCredentialProposal), { attributes: newCredentialPreview.attributes }),
            },
        });
        expect(aliceCredentialRecord.state).toBe(CredentialState_1.CredentialState.ProposalSent);
        logger_1.default.test('Faber waits for credential proposal from Alice');
        faberCredentialRecord = yield faberCredentialRecordPromise;
        aliceCredentialRecordPromise = (0, tests_1.waitForCredentialRecord)(aliceAgent, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.OfferReceived,
        });
        logger_1.default.test('Faber sends credential offer to Alice');
        yield faberAgent.credentials.acceptProposal({
            credentialRecordId: faberCredentialRecord.id,
            comment: 'V2 Indy Proposal',
            credentialFormats: {
                indy: {
                    credentialDefinitionId: credentialDefinitionId,
                    attributes: credentialPreview.attributes,
                },
            },
        });
        logger_1.default.test('Alice waits for credential offer from Faber');
        aliceCredentialRecord = yield aliceCredentialRecordPromise;
        faberCredentialRecordPromise = (0, tests_1.waitForCredentialRecord)(faberAgent, {
            threadId: aliceCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.RequestReceived,
        });
        const offerCredentialExchangeRecord = yield aliceAgent.credentials.acceptOffer({
            credentialRecordId: aliceCredentialRecord.id,
        });
        expect(offerCredentialExchangeRecord).toMatchObject({
            connectionId: aliceConnectionId,
            state: CredentialState_1.CredentialState.RequestSent,
            protocolVersion: 'v2',
        });
        logger_1.default.test('Faber waits for credential request from Alice');
        faberCredentialRecord = yield faberCredentialRecordPromise;
        aliceCredentialRecordPromise = (0, tests_1.waitForCredentialRecord)(aliceAgent, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.CredentialReceived,
        });
        logger_1.default.test('Faber sends credential to Alice');
        yield faberAgent.credentials.acceptRequest({
            credentialRecordId: faberCredentialRecord.id,
            comment: 'V2 Indy Credential',
        });
        logger_1.default.test('Alice waits for credential from Faber');
        aliceCredentialRecord = yield aliceCredentialRecordPromise;
        const proposalMessage = yield aliceAgent.credentials.findProposalMessage(aliceCredentialRecord.id);
        const offerMessage = yield aliceAgent.credentials.findOfferMessage(aliceCredentialRecord.id);
        const requestMessage = yield aliceAgent.credentials.findRequestMessage(aliceCredentialRecord.id);
        const credentialMessage = yield aliceAgent.credentials.findCredentialMessage(aliceCredentialRecord.id);
        expect(proposalMessage).toBeInstanceOf(messages_1.V2ProposeCredentialMessage);
        expect(offerMessage).toBeInstanceOf(messages_1.V2OfferCredentialMessage);
        expect(requestMessage).toBeInstanceOf(messages_1.V2RequestCredentialMessage);
        expect(credentialMessage).toBeInstanceOf(messages_1.V2IssueCredentialMessage);
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
                    value: 'another x-ray value',
                },
                {
                    name: 'profile_picture',
                    mimeType: 'text/plain',
                    value: 'another profile picture',
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
    test('Faber starts with V2 offer, alice declines the offer', () => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.test('Faber sends credential offer to Alice');
        const faberCredentialExchangeRecord = yield faberAgent.credentials.offerCredential({
            comment: 'some comment about credential',
            connectionId: faberConnectionId,
            credentialFormats: {
                indy: {
                    attributes: credentialPreview.attributes,
                    credentialDefinitionId: credentialDefinitionId,
                },
            },
            protocolVersion: 'v2',
        });
        logger_1.default.test('Alice waits for credential offer from Faber');
        let aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialExchangeRecord.threadId,
            state: CredentialState_1.CredentialState.OfferReceived,
        });
        expect(aliceCredentialRecord).toMatchObject({
            id: expect.any(String),
            type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
        });
        logger_1.default.test('Alice declines offer');
        aliceCredentialRecord = yield aliceAgent.credentials.declineOffer(aliceCredentialRecord.id);
        expect(aliceCredentialRecord.state).toBe(CredentialState_1.CredentialState.Declined);
    }));
});
