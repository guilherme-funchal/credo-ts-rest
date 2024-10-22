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
const tests_1 = require("../../../../../../tests");
const helpers_1 = require("../../../../../../tests/helpers");
const logger_1 = __importDefault(require("../../../../../../tests/logger"));
const crypto_1 = require("../../../../../crypto");
const AriesFrameworkError_1 = require("../../../../../error/AriesFrameworkError");
const utils_1 = require("../../../../../utils");
const constants_1 = require("../../../../vc/constants");
const models_1 = require("../../../models");
const CredentialExchangeRecord_1 = require("../../../repository/CredentialExchangeRecord");
const signCredentialOptions = {
    credential: {
        '@context': [constants_1.CREDENTIALS_CONTEXT_V1_URL, 'https://www.w3.org/2018/credentials/examples/v1'],
        type: ['VerifiableCredential', 'UniversityDegreeCredential'],
        issuer: 'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL',
        issuanceDate: '2017-10-22T12:23:48Z',
        credentialSubject: {
            degree: {
                type: 'BachelorDegree',
                name: 'Bachelor of Science and Arts',
            },
        },
    },
    options: {
        proofType: 'Ed25519Signature2018',
        proofPurpose: 'assertionMethod',
    },
};
describe('V2 Credentials - JSON-LD - Auto Accept Always', () => {
    let faberAgent;
    let aliceAgent;
    let faberConnectionId;
    let aliceConnectionId;
    describe("Auto accept on 'always'", () => {
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            ;
            ({
                issuerAgent: faberAgent,
                holderAgent: aliceAgent,
                issuerHolderConnectionId: faberConnectionId,
                holderIssuerConnectionId: aliceConnectionId,
            } = yield (0, tests_1.setupJsonLdTests)({
                issuerName: 'faber agent: always v2 jsonld',
                holderName: 'alice agent: always v2 jsonld',
                autoAcceptCredentials: models_1.AutoAcceptCredential.Always,
            }));
            yield faberAgent.context.wallet.createKey({
                privateKey: utils_1.TypedArrayEncoder.fromString('testseed000000000000000000000001'),
                keyType: crypto_1.KeyType.Ed25519,
            });
        }));
        afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield faberAgent.shutdown();
            yield faberAgent.wallet.delete();
            yield aliceAgent.shutdown();
            yield aliceAgent.wallet.delete();
        }));
        test("Alice starts with V2 credential proposal to Faber, both with autoAcceptCredential on 'always'", () => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.default.test('Alice sends credential proposal to Faber');
            const aliceCredentialExchangeRecord = yield aliceAgent.credentials.proposeCredential({
                connectionId: aliceConnectionId,
                protocolVersion: 'v2',
                credentialFormats: {
                    jsonld: signCredentialOptions,
                },
                comment: 'v2 propose credential test',
            });
            logger_1.default.test('Alice waits for credential from Faber');
            let aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                threadId: aliceCredentialExchangeRecord.threadId,
                state: models_1.CredentialState.CredentialReceived,
            });
            logger_1.default.test('Faber waits for credential ack from Alice');
            aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(faberAgent, {
                threadId: aliceCredentialRecord.threadId,
                state: models_1.CredentialState.Done,
            });
            expect(aliceCredentialRecord).toMatchObject({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                metadata: {},
                state: models_1.CredentialState.Done,
            });
        }));
        test("Faber starts with V2 credential offer to Alice, both with autoAcceptCredential on 'always'", () => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.default.test('Faber sends V2 credential offer to Alice as start of protocol process');
            const faberCredentialExchangeRecord = yield faberAgent.credentials.offerCredential({
                comment: 'some comment about credential',
                connectionId: faberConnectionId,
                credentialFormats: {
                    jsonld: signCredentialOptions,
                },
                protocolVersion: 'v2',
            });
            logger_1.default.test('Alice waits for credential from Faber');
            let aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: models_1.CredentialState.OfferReceived,
            });
            logger_1.default.test('Alice waits for credential from Faber');
            aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: models_1.CredentialState.CredentialReceived,
            });
            logger_1.default.test('Faber waits for credential ack from Alice');
            const faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(faberAgent, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: models_1.CredentialState.Done,
            });
            expect(aliceCredentialRecord).toMatchObject({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                metadata: {},
                state: models_1.CredentialState.CredentialReceived,
            });
            expect(faberCredentialRecord).toMatchObject({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                state: models_1.CredentialState.Done,
            });
        }));
    });
    describe("Auto accept on 'contentApproved'", () => {
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            ;
            ({
                issuerAgent: faberAgent,
                holderAgent: aliceAgent,
                issuerHolderConnectionId: faberConnectionId,
                holderIssuerConnectionId: aliceConnectionId,
            } = yield (0, tests_1.setupJsonLdTests)({
                issuerName: 'faber agent: ContentApproved v2 jsonld',
                holderName: 'alice agent: ContentApproved v2 jsonld',
                autoAcceptCredentials: models_1.AutoAcceptCredential.ContentApproved,
            }));
            yield faberAgent.context.wallet.createKey({
                privateKey: utils_1.TypedArrayEncoder.fromString('testseed000000000000000000000001'),
                keyType: crypto_1.KeyType.Ed25519,
            });
        }));
        afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield faberAgent.shutdown();
            yield faberAgent.wallet.delete();
            yield aliceAgent.shutdown();
            yield aliceAgent.wallet.delete();
        }));
        test("Alice starts with V2 credential proposal to Faber, both with autoAcceptCredential on 'contentApproved'", () => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.default.test('Alice sends credential proposal to Faber');
            const aliceCredentialExchangeRecord = yield aliceAgent.credentials.proposeCredential({
                connectionId: aliceConnectionId,
                protocolVersion: 'v2',
                credentialFormats: {
                    jsonld: signCredentialOptions,
                },
                comment: 'v2 propose credential test',
            });
            logger_1.default.test('Faber waits for credential proposal from Alice');
            let faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(faberAgent, {
                threadId: aliceCredentialExchangeRecord.threadId,
                state: models_1.CredentialState.ProposalReceived,
            });
            logger_1.default.test('Faber sends credential offer to Alice');
            const faberCredentialExchangeRecord = yield faberAgent.credentials.acceptProposal({
                credentialRecordId: faberCredentialRecord.id,
                comment: 'V2 JsonLd Offer',
            });
            logger_1.default.test('Alice waits for credential from Faber');
            const aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: models_1.CredentialState.CredentialReceived,
            });
            logger_1.default.test('Faber waits for credential ack from Alice');
            faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(faberAgent, {
                threadId: faberCredentialRecord.threadId,
                state: models_1.CredentialState.Done,
            });
            expect(aliceCredentialRecord).toMatchObject({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                metadata: {},
                state: models_1.CredentialState.CredentialReceived,
            });
            expect(faberCredentialRecord).toMatchObject({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                metadata: {},
                state: models_1.CredentialState.Done,
            });
        }));
        test("Faber starts with V2 credential offer to Alice, both with autoAcceptCredential on 'contentApproved'", () => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.default.test('Faber sends credential offer to Alice');
            let faberCredentialExchangeRecord = yield faberAgent.credentials.offerCredential({
                comment: 'some comment about credential',
                connectionId: faberConnectionId,
                credentialFormats: {
                    jsonld: signCredentialOptions,
                },
                protocolVersion: 'v2',
            });
            logger_1.default.test('Alice waits for credential offer from Faber');
            let aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: models_1.CredentialState.OfferReceived,
            });
            // below values are not in json object
            expect(aliceCredentialRecord.id).not.toBeNull();
            expect(aliceCredentialRecord.getTags()).toEqual({
                threadId: aliceCredentialRecord.threadId,
                state: aliceCredentialRecord.state,
                connectionId: aliceConnectionId,
                credentialIds: [],
            });
            expect(aliceCredentialRecord.type).toBe(CredentialExchangeRecord_1.CredentialExchangeRecord.type);
            if (!aliceCredentialRecord.connectionId) {
                throw new AriesFrameworkError_1.AriesFrameworkError('missing alice connection id');
            }
            // we do not need to specify connection id in this object
            // it is either connectionless or included in the offer message
            logger_1.default.test('Alice sends credential request to faber');
            faberCredentialExchangeRecord = yield aliceAgent.credentials.acceptOffer({
                credentialRecordId: aliceCredentialRecord.id,
            });
            logger_1.default.test('Alice waits for credential from Faber');
            aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: models_1.CredentialState.CredentialReceived,
            });
            logger_1.default.test('Faber waits for credential ack from Alice');
            const faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(faberAgent, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: models_1.CredentialState.Done,
            });
            expect(aliceCredentialRecord).toMatchObject({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                metadata: {},
                state: models_1.CredentialState.CredentialReceived,
            });
            expect(faberCredentialRecord).toMatchObject({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                state: models_1.CredentialState.Done,
            });
        }));
        test("Faber starts with V2 credential offer to Alice, both have autoAcceptCredential on 'contentApproved' and attributes did change", () => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.default.test('Faber sends credential offer to Alice');
            const faberCredentialExchangeRecord = yield faberAgent.credentials.offerCredential({
                comment: 'some comment about credential',
                connectionId: faberConnectionId,
                credentialFormats: {
                    jsonld: signCredentialOptions,
                },
                protocolVersion: 'v2',
            });
            logger_1.default.test('Alice waits for credential from Faber');
            let aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: models_1.CredentialState.OfferReceived,
            });
            // below values are not in json object
            expect(aliceCredentialRecord.id).not.toBeNull();
            expect(aliceCredentialRecord.getTags()).toEqual({
                threadId: aliceCredentialRecord.threadId,
                state: aliceCredentialRecord.state,
                connectionId: aliceConnectionId,
                credentialIds: [],
            });
            expect(aliceCredentialRecord.type).toBe(CredentialExchangeRecord_1.CredentialExchangeRecord.type);
            logger_1.default.test('Alice sends credential request to Faber');
            const aliceExchangeCredentialRecord = yield aliceAgent.credentials.negotiateOffer({
                credentialRecordId: aliceCredentialRecord.id,
                credentialFormats: {
                    // Send a different object
                    jsonld: Object.assign(Object.assign({}, signCredentialOptions), { credential: Object.assign(Object.assign({}, signCredentialOptions.credential), { credentialSubject: Object.assign(Object.assign({}, signCredentialOptions.credential.credentialSubject), { name: 'Different Property' }) }) }),
                },
                comment: 'v2 propose credential test',
            });
            logger_1.default.test('Faber waits for credential proposal from Alice');
            const faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(faberAgent, {
                threadId: aliceExchangeCredentialRecord.threadId,
                state: models_1.CredentialState.ProposalReceived,
            });
            // Check if the state of faber credential record did not change
            const faberRecord = yield faberAgent.credentials.getById(faberCredentialRecord.id);
            faberRecord.assertState(models_1.CredentialState.ProposalReceived);
            aliceCredentialRecord = yield aliceAgent.credentials.getById(aliceCredentialRecord.id);
            aliceCredentialRecord.assertState(models_1.CredentialState.ProposalSent);
        }));
        test("Alice starts with V2 credential proposal to Faber, both have autoAcceptCredential on 'contentApproved' and attributes did change", () => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.default.test('Alice sends credential proposal to Faber');
            const aliceCredentialExchangeRecord = yield aliceAgent.credentials.proposeCredential({
                connectionId: aliceConnectionId,
                protocolVersion: 'v2',
                credentialFormats: {
                    jsonld: signCredentialOptions,
                },
                comment: 'v2 propose credential test',
            });
            logger_1.default.test('Faber waits for credential proposal from Alice');
            let faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(faberAgent, {
                threadId: aliceCredentialExchangeRecord.threadId,
                state: models_1.CredentialState.ProposalReceived,
            });
            yield faberAgent.credentials.negotiateProposal({
                credentialRecordId: faberCredentialRecord.id,
                credentialFormats: {
                    // Send a different object
                    jsonld: Object.assign(Object.assign({}, signCredentialOptions), { credential: Object.assign(Object.assign({}, signCredentialOptions.credential), { credentialSubject: Object.assign(Object.assign({}, signCredentialOptions.credential.credentialSubject), { name: 'Different Property' }) }) }),
                },
            });
            logger_1.default.test('Alice waits for credential offer from Faber');
            const record = yield (0, helpers_1.waitForCredentialRecord)(aliceAgent, {
                threadId: faberCredentialRecord.threadId,
                state: models_1.CredentialState.OfferReceived,
            });
            // below values are not in json object
            expect(record.id).not.toBeNull();
            expect(record.getTags()).toEqual({
                threadId: record.threadId,
                state: record.state,
                connectionId: aliceConnectionId,
                credentialIds: [],
            });
            expect(record.type).toBe(CredentialExchangeRecord_1.CredentialExchangeRecord.type);
            // Check if the state of the credential records did not change
            faberCredentialRecord = yield faberAgent.credentials.getById(faberCredentialRecord.id);
            faberCredentialRecord.assertState(models_1.CredentialState.OfferSent);
            const aliceRecord = yield aliceAgent.credentials.getById(record.id);
            aliceRecord.assertState(models_1.CredentialState.OfferReceived);
        }));
    });
});
