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
const core_1 = require("@aries-framework/core");
const tests_1 = require("../../../../../../core/tests");
const legacyAnonCredsSetup_1 = require("../../../../../tests/legacyAnonCredsSetup");
const messages_1 = require("../messages");
const credentialPreview = messages_1.V1CredentialPreview.fromRecord({
    name: 'John',
    age: '99',
});
describe('V1 Connectionless Credentials', () => {
    let faberAgent;
    let aliceAgent;
    let faberReplay;
    let aliceReplay;
    let credentialDefinitionId;
    let schemaId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        ;
        ({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            credentialDefinitionId,
            schemaId,
        } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber connection-less Credentials V1',
            holderName: 'Alice connection-less Credentials V1',
            attributeNames: ['name', 'age'],
            createConnections: false,
        }));
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('Faber starts with connection-less credential offer to Alice', () => __awaiter(void 0, void 0, void 0, function* () {
        tests_1.testLogger.test('Faber sends credential offer to Alice');
        // eslint-disable-next-line prefer-const
        let { message, credentialRecord: faberCredentialRecord } = yield faberAgent.credentials.createOffer({
            comment: 'V1 Out of Band offer',
            credentialFormats: {
                indy: {
                    attributes: credentialPreview.attributes,
                    credentialDefinitionId,
                },
            },
            protocolVersion: 'v1',
        });
        const { invitationUrl } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
            recordId: faberCredentialRecord.id,
            message,
            domain: 'https://a-domain.com',
        });
        yield aliceAgent.oob.receiveInvitationFromUrl(invitationUrl);
        let aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: core_1.CredentialState.OfferReceived,
        });
        tests_1.testLogger.test('Alice sends credential request to Faber');
        const acceptOfferOptions = {
            credentialRecordId: aliceCredentialRecord.id,
        };
        const credentialRecord = yield aliceAgent.credentials.acceptOffer(acceptOfferOptions);
        tests_1.testLogger.test('Faber waits for credential request from Alice');
        faberCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: credentialRecord.threadId,
            state: core_1.CredentialState.RequestReceived,
        });
        tests_1.testLogger.test('Faber sends credential to Alice');
        const options = {
            credentialRecordId: faberCredentialRecord.id,
            comment: 'V1 Indy Credential',
        };
        faberCredentialRecord = yield faberAgent.credentials.acceptRequest(options);
        tests_1.testLogger.test('Alice waits for credential from Faber');
        aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: core_1.CredentialState.CredentialReceived,
        });
        tests_1.testLogger.test('Alice sends credential ack to Faber');
        aliceCredentialRecord = yield aliceAgent.credentials.acceptCredential({
            credentialRecordId: aliceCredentialRecord.id,
        });
        tests_1.testLogger.test('Faber waits for credential ack from Alice');
        faberCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: faberCredentialRecord.threadId,
            state: core_1.CredentialState.Done,
        });
        expect(aliceCredentialRecord).toMatchObject({
            type: core_1.CredentialExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            metadata: {
                data: {
                    '_anoncreds/credential': {
                        schemaId,
                        credentialDefinitionId,
                    },
                },
            },
            credentials: [
                {
                    credentialRecordType: 'anoncreds',
                    credentialRecordId: expect.any(String),
                },
            ],
            state: core_1.CredentialState.Done,
            threadId: expect.any(String),
        });
        expect(faberCredentialRecord).toMatchObject({
            type: core_1.CredentialExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            metadata: {
                data: {
                    '_anoncreds/credential': {
                        schemaId,
                        credentialDefinitionId,
                    },
                },
            },
            state: core_1.CredentialState.Done,
            threadId: expect.any(String),
        });
    }));
    test('Faber starts with connection-less credential offer to Alice with auto-accept enabled', () => __awaiter(void 0, void 0, void 0, function* () {
        // eslint-disable-next-line prefer-const
        let { message, credentialRecord: faberCredentialRecord } = yield faberAgent.credentials.createOffer({
            comment: 'V1 Out of Band offer',
            credentialFormats: {
                indy: {
                    attributes: credentialPreview.attributes,
                    credentialDefinitionId,
                },
            },
            protocolVersion: 'v1',
            autoAcceptCredential: core_1.AutoAcceptCredential.ContentApproved,
        });
        const { message: offerMessage } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
            message,
            domain: 'https://a-domain.com',
        });
        // Receive Message
        yield aliceAgent.receiveMessage(offerMessage.toJSON());
        // Wait for it to be processed
        let aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: core_1.CredentialState.OfferReceived,
        });
        yield aliceAgent.credentials.acceptOffer({
            credentialRecordId: aliceCredentialRecord.id,
            autoAcceptCredential: core_1.AutoAcceptCredential.ContentApproved,
        });
        aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: core_1.CredentialState.Done,
        });
        faberCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: faberCredentialRecord.threadId,
            state: core_1.CredentialState.Done,
        });
        expect(aliceCredentialRecord).toMatchObject({
            type: core_1.CredentialExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            metadata: {
                data: {
                    '_anoncreds/credential': {
                        schemaId,
                        credentialDefinitionId: credentialDefinitionId,
                    },
                },
            },
            credentials: [
                {
                    credentialRecordType: 'anoncreds',
                    credentialRecordId: expect.any(String),
                },
            ],
            state: core_1.CredentialState.Done,
            threadId: expect.any(String),
        });
        expect(faberCredentialRecord).toMatchObject({
            type: core_1.CredentialExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            state: core_1.CredentialState.Done,
            threadId: expect.any(String),
        });
    }));
});
