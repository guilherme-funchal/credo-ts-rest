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
const logger_1 = __importDefault(require("../../../../../../tests/logger"));
const crypto_1 = require("../../../../../crypto");
const utils_1 = require("../../../../../utils");
const constants_1 = require("../../../../vc/constants");
const models_1 = require("../../../models");
const repository_1 = require("../../../repository");
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
describe('credentials', () => {
    let faberAgent;
    let faberReplay;
    let aliceAgent;
    let aliceReplay;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        ;
        ({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
        } = yield (0, tests_1.setupJsonLdTests)({
            issuerName: 'Faber LD connection-less Credentials V2',
            holderName: 'Alice LD connection-less Credentials V2',
            createConnections: false,
        }));
        yield faberAgent.context.wallet.createKey({
            privateKey: utils_1.TypedArrayEncoder.fromString('testseed000000000000000000000001'),
            keyType: crypto_1.KeyType.Ed25519,
        });
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('Faber starts with V2 W3C connection-less credential offer to Alice', () => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.test('Faber sends credential offer to Alice');
        // eslint-disable-next-line prefer-const
        let { message, credentialRecord: faberCredentialRecord } = yield faberAgent.credentials.createOffer({
            comment: 'V2 Out of Band offer (W3C)',
            credentialFormats: {
                jsonld: signCredentialOptions,
            },
            protocolVersion: 'v2',
        });
        const offerMessage = message;
        const attachment = offerMessage === null || offerMessage === void 0 ? void 0 : offerMessage.offerAttachments[0];
        expect(attachment === null || attachment === void 0 ? void 0 : attachment.getDataAsJson()).toMatchObject({
            credential: {
                '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
                type: ['VerifiableCredential', 'UniversityDegreeCredential'],
                issuer: 'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL',
                issuanceDate: '2017-10-22T12:23:48Z',
                credentialSubject: {
                    degree: {
                        name: 'Bachelor of Science and Arts',
                        type: 'BachelorDegree',
                    },
                },
            },
            options: {
                proofType: 'Ed25519Signature2018',
                proofPurpose: 'assertionMethod',
            },
        });
        const { message: connectionlessOfferMessage } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
            recordId: faberCredentialRecord.id,
            message,
            domain: 'https://a-domain.com',
        });
        yield aliceAgent.receiveMessage(connectionlessOfferMessage.toJSON());
        let aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: models_1.CredentialState.OfferReceived,
        });
        logger_1.default.test('Alice sends credential request to Faber');
        const credentialRecord = yield aliceAgent.credentials.acceptOffer({
            credentialRecordId: aliceCredentialRecord.id,
        });
        logger_1.default.test('Faber waits for credential request from Alice');
        faberCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: credentialRecord.threadId,
            state: models_1.CredentialState.RequestReceived,
        });
        logger_1.default.test('Faber sends credential to Alice');
        faberCredentialRecord = yield faberAgent.credentials.acceptRequest({
            credentialRecordId: faberCredentialRecord.id,
            comment: 'V2 Indy Credential',
        });
        logger_1.default.test('Alice waits for credential from Faber');
        aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: models_1.CredentialState.CredentialReceived,
        });
        logger_1.default.test('Alice sends credential ack to Faber');
        aliceCredentialRecord = yield aliceAgent.credentials.acceptCredential({
            credentialRecordId: aliceCredentialRecord.id,
        });
        logger_1.default.test('Faber waits for credential ack from Alice');
        faberCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: faberCredentialRecord.threadId,
            state: models_1.CredentialState.Done,
        });
        expect(aliceCredentialRecord).toMatchObject({
            type: repository_1.CredentialExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            state: models_1.CredentialState.Done,
            threadId: expect.any(String),
        });
        expect(faberCredentialRecord).toMatchObject({
            type: repository_1.CredentialExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            state: models_1.CredentialState.Done,
            threadId: expect.any(String),
        });
    }));
});
