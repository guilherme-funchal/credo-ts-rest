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
const src_1 = require("../../core/src");
const crypto_1 = require("../../core/src/crypto");
const models_1 = require("../../core/src/modules/credentials/models");
const CredentialExchangeRecord_1 = require("../../core/src/modules/credentials/repository/CredentialExchangeRecord");
const vc_1 = require("../../core/src/modules/vc");
const JsonTransformer_1 = require("../../core/src/utils/JsonTransformer");
const tests_1 = require("../../core/tests");
const util_1 = require("./util");
let faberAgent;
let faberReplay;
let aliceAgent;
let aliceReplay;
let aliceConnectionId;
let aliceCredentialRecord;
let faberCredentialRecord;
const signCredentialOptions = {
    credential: {
        '@context': [vc_1.CREDENTIALS_CONTEXT_V1_URL, 'https://w3id.org/citizenship/v1', vc_1.SECURITY_CONTEXT_BBS_URL],
        id: 'https://issuer.oidp.uscis.gov/credentials/83627465',
        type: ['VerifiableCredential', 'PermanentResidentCard'],
        issuer: 'did:key:zUC72Q7XD4PE4CrMiDVXuvZng3sBvMmaGgNeTUJuzavH2BS7ThbHL9FhsZM9QYY5fqAQ4MB8M9oudz3tfuaX36Ajr97QRW7LBt6WWmrtESe6Bs5NYzFtLWEmeVtvRYVAgjFcJSa',
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
        proofType: 'BbsBlsSignature2020',
        proofPurpose: 'assertionMethod',
    },
};
(0, util_1.describeSkipNode17And18)('credentials, BBS+ signature', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        ;
        ({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            holderIssuerConnectionId: aliceConnectionId,
        } = yield (0, tests_1.setupJsonLdTests)({
            issuerName: 'Faber Agent Credentials LD BBS+',
            holderName: 'Alice Agent Credentials LD BBS+',
        }));
        yield faberAgent.context.wallet.createKey({
            keyType: crypto_1.KeyType.Ed25519,
            privateKey: src_1.TypedArrayEncoder.fromString('testseed000000000000000000000001'),
        });
        yield faberAgent.context.wallet.createKey({
            keyType: crypto_1.KeyType.Bls12381g2,
            seed: src_1.TypedArrayEncoder.fromString('testseed000000000000000000000001'),
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('Alice starts with V2 (ld format, BbsBlsSignature2020 signature) credential proposal to Faber', () => __awaiter(void 0, void 0, void 0, function* () {
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
        faberCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: credentialExchangeRecord.threadId,
            state: models_1.CredentialState.ProposalReceived,
        });
        tests_1.testLogger.test('Faber sends credential offer to Alice');
        yield faberAgent.credentials.acceptProposal({
            credentialRecordId: faberCredentialRecord.id,
            comment: 'V2 W3C Offer',
        });
        tests_1.testLogger.test('Alice waits for credential offer from Faber');
        aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: models_1.CredentialState.OfferReceived,
        });
        const offerMessage = yield faberAgent.credentials.findOfferMessage(faberCredentialRecord.id);
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
                jsonld: undefined,
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
            comment: 'V2 W3C Offer',
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
        const w3cCredential = credentialMessage.credentialAttachments[0].getDataAsJson();
        expect(w3cCredential).toMatchObject({
            '@context': [
                'https://www.w3.org/2018/credentials/v1',
                'https://w3id.org/citizenship/v1',
                'https://w3id.org/security/bbs/v1',
            ],
            id: 'https://issuer.oidp.uscis.gov/credentials/83627465',
            type: ['VerifiableCredential', 'PermanentResidentCard'],
            issuer: 'did:key:zUC72Q7XD4PE4CrMiDVXuvZng3sBvMmaGgNeTUJuzavH2BS7ThbHL9FhsZM9QYY5fqAQ4MB8M9oudz3tfuaX36Ajr97QRW7LBt6WWmrtESe6Bs5NYzFtLWEmeVtvRYVAgjFcJSa',
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
                type: 'BbsBlsSignature2020',
                created: expect.any(String),
                verificationMethod: 'did:key:zUC72Q7XD4PE4CrMiDVXuvZng3sBvMmaGgNeTUJuzavH2BS7ThbHL9FhsZM9QYY5fqAQ4MB8M9oudz3tfuaX36Ajr97QRW7LBt6WWmrtESe6Bs5NYzFtLWEmeVtvRYVAgjFcJSa#zUC72Q7XD4PE4CrMiDVXuvZng3sBvMmaGgNeTUJuzavH2BS7ThbHL9FhsZM9QYY5fqAQ4MB8M9oudz3tfuaX36Ajr97QRW7LBt6WWmrtESe6Bs5NYzFtLWEmeVtvRYVAgjFcJSa',
                proofPurpose: 'assertionMethod',
                proofValue: expect.any(String),
            },
        });
        expect(JsonTransformer_1.JsonTransformer.toJSON(credentialMessage)).toMatchObject({
            '@type': 'https://didcomm.org/issue-credential/2.0/issue-credential',
            '@id': expect.any(String),
            comment: 'V2 W3C Offer',
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
});
