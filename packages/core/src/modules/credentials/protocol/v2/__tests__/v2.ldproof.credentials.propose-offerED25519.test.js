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
const crypto_1 = require("crypto");
const src_1 = require("../../../../../../../anoncreds/src");
const legacyAnonCredsSetup_1 = require("../../../../../../../anoncreds/tests/legacyAnonCredsSetup");
const src_2 = require("../../../../../../../indy-sdk/src");
const setupIndySdkModule_1 = require("../../../../../../../indy-sdk/tests/setupIndySdkModule");
const tests_1 = require("../../../../../../tests");
const Agent_1 = require("../../../../../agent/Agent");
const crypto_2 = require("../../../../../crypto");
const utils_1 = require("../../../../../utils");
const JsonTransformer_1 = require("../../../../../utils/JsonTransformer");
const cache_1 = require("../../../../cache");
const dids_1 = require("../../../../dids");
const proofs_1 = require("../../../../proofs");
const vc_1 = require("../../../../vc");
const documentLoader_1 = require("../../../../vc/data-integrity/__tests__/documentLoader");
const CredentialEvents_1 = require("../../../CredentialEvents");
const CredentialsModule_1 = require("../../../CredentialsModule");
const formats_1 = require("../../../formats");
const models_1 = require("../../../models");
const CredentialExchangeRecord_1 = require("../../../repository/CredentialExchangeRecord");
const V2CredentialProtocol_1 = require("../V2CredentialProtocol");
const messages_1 = require("../messages");
const signCredentialOptions = {
    credential: {
        '@context': [
            'https://www.w3.org/2018/credentials/v1',
            'https://w3id.org/citizenship/v1',
            'https://w3id.org/security/bbs/v1',
        ],
        id: 'https://issuer.oidp.uscis.gov/credentials/83627465',
        type: ['VerifiableCredential', 'PermanentResidentCard'],
        issuer: 'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL',
        issuanceDate: '2019-12-03T12:19:52Z',
        expirationDate: '2029-12-03T12:19:52Z',
        identifier: '83627465',
        name: 'Permanent Resident Card',
        credentialSubject: {
            id: 'did:example:b34ca6cd37bbf23',
            type: ['PermanentResident', 'Person'],
            givenName: 'JOHN',
            familyName: 'SMITH',
            gender: 'Male',
            image: 'data:image/png;base64,iVBORw0KGgokJggg==',
            residentSince: '2015-01-01',
            description: 'Government of Example Permanent Resident Card.',
            lprCategory: 'C09',
            lprNumber: '999-999-999',
            commuterClassification: 'C1',
            birthCountry: 'Bahamas',
            birthDate: '1958-07-17',
        },
    },
    options: {
        proofType: 'Ed25519Signature2018',
        proofPurpose: 'assertionMethod',
    },
};
const indyCredentialFormat = new src_1.LegacyIndyCredentialFormatService();
const jsonLdCredentialFormat = new formats_1.JsonLdCredentialFormatService();
const indyProofFormat = new src_1.LegacyIndyProofFormatService();
const getIndyJsonLdModules = () => ({
    credentials: new CredentialsModule_1.CredentialsModule({
        credentialProtocols: [
            new src_1.V1CredentialProtocol({ indyCredentialFormat }),
            new V2CredentialProtocol_1.V2CredentialProtocol({
                credentialFormats: [indyCredentialFormat, jsonLdCredentialFormat],
            }),
        ],
    }),
    proofs: new proofs_1.ProofsModule({
        proofProtocols: [
            new src_1.V1ProofProtocol({ indyProofFormat }),
            new proofs_1.V2ProofProtocol({
                proofFormats: [indyProofFormat],
            }),
        ],
    }),
    anoncreds: new src_1.AnonCredsModule({
        registries: [new src_2.IndySdkAnonCredsRegistry()],
    }),
    dids: new dids_1.DidsModule({
        resolvers: [new src_2.IndySdkSovDidResolver(), new src_2.IndySdkIndyDidResolver()],
        registrars: [new src_2.IndySdkIndyDidRegistrar()],
    }),
    indySdk: new src_2.IndySdkModule({
        indySdk: setupIndySdkModule_1.indySdk,
        networks: [
            {
                isProduction: false,
                genesisPath: tests_1.genesisPath,
                id: (0, crypto_1.randomUUID)(),
                indyNamespace: `pool:localtest`,
                transactionAuthorAgreement: { version: tests_1.taaVersion, acceptanceMechanism: tests_1.taaAcceptanceMechanism },
            },
        ],
    }),
    cache: new cache_1.CacheModule({
        cache: new cache_1.InMemoryLruCache({ limit: 100 }),
    }),
    w3cCredentials: new vc_1.W3cCredentialsModule({
        documentLoader: documentLoader_1.customDocumentLoader,
    }),
});
// TODO: extract these very specific tests to the jsonld format
describe('V2 Credentials - JSON-LD - Ed25519', () => {
    let faberAgent;
    let faberReplay;
    let aliceAgent;
    let aliceReplay;
    let aliceConnectionId;
    let credentialDefinitionId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        faberAgent = new Agent_1.Agent((0, tests_1.getAgentOptions)('Faber Agent Indy/JsonLD', {
            endpoints: ['rxjs:faber'],
        }, getIndyJsonLdModules()));
        aliceAgent = new Agent_1.Agent((0, tests_1.getAgentOptions)('Alice Agent Indy/JsonLD', {
            endpoints: ['rxjs:alice'],
        }, getIndyJsonLdModules()));
        (0, tests_1.setupSubjectTransports)([faberAgent, aliceAgent]);
        [faberReplay, aliceReplay] = (0, tests_1.setupEventReplaySubjects)([faberAgent, aliceAgent], [CredentialEvents_1.CredentialEventTypes.CredentialStateChanged, proofs_1.ProofEventTypes.ProofStateChanged]);
        yield faberAgent.initialize();
        yield aliceAgent.initialize();
        [, { id: aliceConnectionId }] = yield (0, tests_1.makeConnection)(faberAgent, aliceAgent);
        const { credentialDefinition } = yield (0, legacyAnonCredsSetup_1.prepareForAnonCredsIssuance)(faberAgent, {
            attributeNames: ['name', 'age', 'profile_picture', 'x-ray'],
        });
        credentialDefinitionId = credentialDefinition.credentialDefinitionId;
        yield faberAgent.context.wallet.createKey({
            privateKey: utils_1.TypedArrayEncoder.fromString('testseed000000000000000000000001'),
            keyType: crypto_2.KeyType.Ed25519,
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('Alice starts with V2 (ld format, Ed25519 signature) credential proposal to Faber', () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Alice sends (v2 jsonld) credential proposal to Faber');
        const credentialExchangeRecord = yield aliceAgent.credentials.proposeCredential({
            connectionId: aliceConnectionId,
            protocolVersion: 'v2',
            credentialFormats: {
                jsonld: signCredentialOptions,
            },
            comment: 'v2 propose credential test for W3C Credentials',
        });
        expect(credentialExchangeRecord.connectionId).toEqual(aliceConnectionId);
        expect(credentialExchangeRecord.protocolVersion).toEqual('v2');
        expect(credentialExchangeRecord.state).toEqual(models_1.CredentialState.ProposalSent);
        expect(credentialExchangeRecord.threadId).not.toBeNull();
        tests_1.testLogger.test('Faber waits for credential proposal from Alice');
        let faberCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: credentialExchangeRecord.threadId,
            state: models_1.CredentialState.ProposalReceived,
        });
        tests_1.testLogger.test('Faber sends credential offer to Alice');
        yield faberAgent.credentials.acceptProposal({
            credentialRecordId: faberCredentialRecord.id,
            comment: 'V2 W3C Offer',
        });
        tests_1.testLogger.test('Alice waits for credential offer from Faber');
        let aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: models_1.CredentialState.OfferReceived,
        });
        const offerMessage = yield aliceAgent.credentials.findOfferMessage(aliceCredentialRecord.id);
        expect(JsonTransformer_1.JsonTransformer.toJSON(offerMessage)).toMatchObject({
            '@type': 'https://didcomm.org/issue-credential/2.0/offer-credential',
            '@id': expect.any(String),
            comment: 'V2 W3C Offer',
            formats: [
                {
                    attach_id: expect.any(String),
                    format: 'aries/ld-proof-vc-detail@v1.0',
                },
            ],
            'offers~attach': [
                {
                    '@id': expect.any(String),
                    'mime-type': 'application/json',
                    data: expect.any(Object),
                    lastmod_time: undefined,
                    byte_count: undefined,
                },
            ],
            '~thread': {
                thid: expect.any(String),
                pthid: undefined,
                sender_order: undefined,
                received_orders: undefined,
            },
            '~service': undefined,
            '~attach': undefined,
            '~please_ack': undefined,
            '~timing': undefined,
            '~transport': undefined,
            '~l10n': undefined,
            credential_preview: expect.any(Object),
            replacement_id: undefined,
        });
        expect(aliceCredentialRecord.id).not.toBeNull();
        expect(aliceCredentialRecord.type).toBe(CredentialExchangeRecord_1.CredentialExchangeRecord.type);
        const offerCredentialExchangeRecord = yield aliceAgent.credentials.acceptOffer({
            credentialRecordId: aliceCredentialRecord.id,
            credentialFormats: {
                jsonld: {},
            },
        });
        expect(offerCredentialExchangeRecord.connectionId).toEqual(aliceConnectionId);
        expect(offerCredentialExchangeRecord.protocolVersion).toEqual('v2');
        expect(offerCredentialExchangeRecord.state).toEqual(models_1.CredentialState.RequestSent);
        expect(offerCredentialExchangeRecord.threadId).not.toBeNull();
        tests_1.testLogger.test('Faber waits for credential request from Alice');
        yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: aliceCredentialRecord.threadId,
            state: models_1.CredentialState.RequestReceived,
        });
        tests_1.testLogger.test('Faber sends credential to Alice');
        yield faberAgent.credentials.acceptRequest({
            credentialRecordId: faberCredentialRecord.id,
            comment: 'V2 Indy Credential',
        });
        tests_1.testLogger.test('Alice waits for credential from Faber');
        aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: models_1.CredentialState.CredentialReceived,
        });
        tests_1.testLogger.test('Alice sends credential ack to Faber');
        yield aliceAgent.credentials.acceptCredential({ credentialRecordId: aliceCredentialRecord.id });
        tests_1.testLogger.test('Faber waits for credential ack from Alice');
        faberCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: faberCredentialRecord.threadId,
            state: models_1.CredentialState.Done,
        });
        expect(aliceCredentialRecord).toMatchObject({
            type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            threadId: expect.any(String),
            connectionId: expect.any(String),
            state: models_1.CredentialState.CredentialReceived,
        });
        const credentialMessage = yield faberAgent.credentials.findCredentialMessage(faberCredentialRecord.id);
        expect(JsonTransformer_1.JsonTransformer.toJSON(credentialMessage)).toMatchObject({
            '@type': 'https://didcomm.org/issue-credential/2.0/issue-credential',
            '@id': expect.any(String),
            comment: 'V2 Indy Credential',
            formats: [
                {
                    attach_id: expect.any(String),
                    format: 'aries/ld-proof-vc@v1.0',
                },
            ],
            'credentials~attach': [
                {
                    '@id': expect.any(String),
                    'mime-type': 'application/json',
                    data: expect.any(Object),
                    lastmod_time: undefined,
                    byte_count: undefined,
                },
            ],
            '~thread': {
                thid: expect.any(String),
                pthid: undefined,
                sender_order: undefined,
                received_orders: undefined,
            },
            '~please_ack': { on: ['RECEIPT'] },
            '~service': undefined,
            '~attach': undefined,
            '~timing': undefined,
            '~transport': undefined,
            '~l10n': undefined,
        });
    }));
    test('Multiple Formats: Alice starts with V2 (both ld and indy formats) credential proposal to Faber', () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Alice sends (v2 jsonld) credential proposal to Faber');
        // set the propose options - using both indy and ld credential formats here
        const credentialPreview = messages_1.V2CredentialPreview.fromRecord({
            name: 'John',
            age: '99',
            'x-ray': 'some x-ray',
            profile_picture: 'profile picture',
        });
        tests_1.testLogger.test('Alice sends (v2, Indy) credential proposal to Faber');
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
                jsonld: signCredentialOptions,
            },
            comment: 'v2 propose credential test',
        });
        expect(credentialExchangeRecord.connectionId).toEqual(aliceConnectionId);
        expect(credentialExchangeRecord.protocolVersion).toEqual('v2');
        expect(credentialExchangeRecord.state).toEqual(models_1.CredentialState.ProposalSent);
        expect(credentialExchangeRecord.threadId).not.toBeNull();
        tests_1.testLogger.test('Faber waits for credential proposal from Alice');
        let faberCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: credentialExchangeRecord.threadId,
            state: models_1.CredentialState.ProposalReceived,
        });
        tests_1.testLogger.test('Faber sends credential offer to Alice');
        yield faberAgent.credentials.acceptProposal({
            credentialRecordId: faberCredentialRecord.id,
            comment: 'V2 W3C & INDY Proposals',
            credentialFormats: {
                indy: {
                    credentialDefinitionId,
                    attributes: credentialPreview.attributes,
                },
                jsonld: {}, // this is to ensure both services are formatted
            },
        });
        tests_1.testLogger.test('Alice waits for credential offer from Faber');
        let aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: models_1.CredentialState.OfferReceived,
        });
        const offerMessage = yield faberAgent.credentials.findOfferMessage(faberCredentialRecord.id);
        const credentialOfferJson = offerMessage === null || offerMessage === void 0 ? void 0 : offerMessage.offerAttachments[1].getDataAsJson();
        expect(credentialOfferJson).toMatchObject({
            credential: {
                '@context': [
                    'https://www.w3.org/2018/credentials/v1',
                    'https://w3id.org/citizenship/v1',
                    'https://w3id.org/security/bbs/v1',
                ],
                id: 'https://issuer.oidp.uscis.gov/credentials/83627465',
                type: ['VerifiableCredential', 'PermanentResidentCard'],
                issuer: 'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL',
                issuanceDate: '2019-12-03T12:19:52Z',
                expirationDate: '2029-12-03T12:19:52Z',
                identifier: '83627465',
                name: 'Permanent Resident Card',
                credentialSubject: {
                    id: 'did:example:b34ca6cd37bbf23',
                    type: expect.any(Array),
                    givenName: 'JOHN',
                    familyName: 'SMITH',
                    gender: 'Male',
                    image: 'data:image/png;base64,iVBORw0KGgokJggg==',
                    description: 'Government of Example Permanent Resident Card.',
                    residentSince: '2015-01-01',
                    lprCategory: 'C09',
                    lprNumber: '999-999-999',
                    commuterClassification: 'C1',
                    birthCountry: 'Bahamas',
                    birthDate: '1958-07-17',
                },
            },
            options: {
                proofType: 'Ed25519Signature2018',
                proofPurpose: 'assertionMethod',
            },
        });
        expect(JsonTransformer_1.JsonTransformer.toJSON(offerMessage)).toMatchObject({
            '@type': 'https://didcomm.org/issue-credential/2.0/offer-credential',
            '@id': expect.any(String),
            comment: 'V2 W3C & INDY Proposals',
            formats: [
                {
                    attach_id: expect.any(String),
                    format: 'hlindy/cred-abstract@v2.0',
                },
                {
                    attach_id: expect.any(String),
                    format: 'aries/ld-proof-vc-detail@v1.0',
                },
            ],
            credential_preview: {
                '@type': 'https://didcomm.org/issue-credential/2.0/credential-preview',
                attributes: expect.any(Array),
            },
            'offers~attach': [
                {
                    '@id': expect.any(String),
                    'mime-type': 'application/json',
                    data: expect.any(Object),
                    lastmod_time: undefined,
                    byte_count: undefined,
                },
                {
                    '@id': expect.any(String),
                    'mime-type': 'application/json',
                    data: expect.any(Object),
                    lastmod_time: undefined,
                    byte_count: undefined,
                },
            ],
            '~thread': {
                thid: expect.any(String),
                pthid: undefined,
                sender_order: undefined,
                received_orders: undefined,
            },
            '~service': undefined,
            '~attach': undefined,
            '~please_ack': undefined,
            '~timing': undefined,
            '~transport': undefined,
            '~l10n': undefined,
            replacement_id: undefined,
        });
        expect(aliceCredentialRecord.id).not.toBeNull();
        expect(aliceCredentialRecord.type).toBe(CredentialExchangeRecord_1.CredentialExchangeRecord.type);
        const offerCredentialExchangeRecord = yield aliceAgent.credentials.acceptOffer({
            credentialRecordId: aliceCredentialRecord.id,
        });
        expect(offerCredentialExchangeRecord.connectionId).toEqual(aliceConnectionId);
        expect(offerCredentialExchangeRecord.protocolVersion).toEqual('v2');
        expect(offerCredentialExchangeRecord.state).toEqual(models_1.CredentialState.RequestSent);
        expect(offerCredentialExchangeRecord.threadId).not.toBeNull();
        tests_1.testLogger.test('Faber waits for credential request from Alice');
        yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: aliceCredentialRecord.threadId,
            state: models_1.CredentialState.RequestReceived,
        });
        tests_1.testLogger.test('Faber sends credential to Alice');
        yield faberAgent.credentials.acceptRequest({
            credentialRecordId: faberCredentialRecord.id,
            comment: 'V2 Indy Credential',
        });
        tests_1.testLogger.test('Alice waits for credential from Faber');
        aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: models_1.CredentialState.CredentialReceived,
        });
        tests_1.testLogger.test('Alice sends credential ack to Faber');
        yield aliceAgent.credentials.acceptCredential({ credentialRecordId: aliceCredentialRecord.id });
        tests_1.testLogger.test('Faber waits for credential ack from Alice');
        faberCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: faberCredentialRecord.threadId,
            state: models_1.CredentialState.Done,
        });
        expect(aliceCredentialRecord).toMatchObject({
            type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            threadId: expect.any(String),
            connectionId: expect.any(String),
            state: models_1.CredentialState.CredentialReceived,
        });
        const credentialMessage = yield faberAgent.credentials.findCredentialMessage(faberCredentialRecord.id);
        const w3cCredential = credentialMessage === null || credentialMessage === void 0 ? void 0 : credentialMessage.credentialAttachments[1].getDataAsJson();
        expect(w3cCredential).toMatchObject({
            '@context': [
                'https://www.w3.org/2018/credentials/v1',
                'https://w3id.org/citizenship/v1',
                'https://w3id.org/security/bbs/v1',
            ],
            id: 'https://issuer.oidp.uscis.gov/credentials/83627465',
            type: ['VerifiableCredential', 'PermanentResidentCard'],
            issuer: 'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL',
            issuanceDate: '2019-12-03T12:19:52Z',
            expirationDate: '2029-12-03T12:19:52Z',
            identifier: '83627465',
            name: 'Permanent Resident Card',
            credentialSubject: {
                id: 'did:example:b34ca6cd37bbf23',
                type: ['PermanentResident', 'Person'],
                givenName: 'JOHN',
                familyName: 'SMITH',
                gender: 'Male',
                image: 'data:image/png;base64,iVBORw0KGgokJggg==',
                residentSince: '2015-01-01',
                description: 'Government of Example Permanent Resident Card.',
                lprCategory: 'C09',
                lprNumber: '999-999-999',
                commuterClassification: 'C1',
                birthCountry: 'Bahamas',
                birthDate: '1958-07-17',
            },
            proof: {
                type: 'Ed25519Signature2018',
                created: expect.any(String),
                verificationMethod: 'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL#z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL',
                proofPurpose: 'assertionMethod',
            },
        });
        expect(JsonTransformer_1.JsonTransformer.toJSON(credentialMessage)).toMatchObject({
            '@type': 'https://didcomm.org/issue-credential/2.0/issue-credential',
            '@id': expect.any(String),
            comment: 'V2 Indy Credential',
            formats: [
                {
                    attach_id: expect.any(String),
                    format: 'hlindy/cred@v2.0',
                },
                {
                    attach_id: expect.any(String),
                    format: 'aries/ld-proof-vc@v1.0',
                },
            ],
            'credentials~attach': [
                {
                    '@id': expect.any(String),
                    'mime-type': 'application/json',
                    data: expect.any(Object),
                    lastmod_time: undefined,
                    byte_count: undefined,
                },
                {
                    '@id': expect.any(String),
                    'mime-type': 'application/json',
                    data: expect.any(Object),
                    lastmod_time: undefined,
                    byte_count: undefined,
                },
            ],
            '~thread': {
                thid: expect.any(String),
                pthid: undefined,
                sender_order: undefined,
                received_orders: undefined,
            },
            '~please_ack': { on: ['RECEIPT'] },
            '~service': undefined,
            '~attach': undefined,
            '~timing': undefined,
            '~transport': undefined,
            '~l10n': undefined,
        });
    }));
});
