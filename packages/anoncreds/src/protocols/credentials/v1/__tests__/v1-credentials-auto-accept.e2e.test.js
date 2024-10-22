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
    'x-ray': 'some x-ray',
    profile_picture: 'profile picture',
});
const newCredentialPreview = messages_1.V1CredentialPreview.fromRecord({
    name: 'John',
    age: '99',
    'x-ray': 'another x-ray value',
    profile_picture: 'another profile picture',
});
describe('V1 Credentials Auto Accept', () => {
    let faberAgent;
    let faberReplay;
    let aliceAgent;
    let aliceReplay;
    let credentialDefinitionId;
    let schemaId;
    let faberConnectionId;
    let aliceConnectionId;
    describe("Auto accept on 'always'", () => {
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            ;
            ({
                issuerAgent: faberAgent,
                issuerReplay: faberReplay,
                holderAgent: aliceAgent,
                holderReplay: aliceReplay,
                credentialDefinitionId,
                schemaId,
                issuerHolderConnectionId: faberConnectionId,
                holderIssuerConnectionId: aliceConnectionId,
            } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
                issuerName: 'Faber Credentials Auto Accept V1',
                holderName: 'Alice Credentials Auto Accept V1',
                attributeNames: ['name', 'age', 'x-ray', 'profile_picture'],
                autoAcceptCredentials: core_1.AutoAcceptCredential.Always,
            }));
        }));
        afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield faberAgent.shutdown();
            yield faberAgent.wallet.delete();
            yield aliceAgent.shutdown();
            yield aliceAgent.wallet.delete();
        }));
        test("Alice starts with V1 credential proposal to Faber, both with autoAcceptCredential on 'always'", () => __awaiter(void 0, void 0, void 0, function* () {
            tests_1.testLogger.test('Alice sends credential proposal to Faber');
            const aliceCredentialExchangeRecord = yield aliceAgent.credentials.proposeCredential({
                connectionId: aliceConnectionId,
                protocolVersion: 'v1',
                credentialFormats: {
                    indy: {
                        attributes: credentialPreview.attributes,
                        credentialDefinitionId: credentialDefinitionId,
                    },
                },
                comment: 'v1 propose credential test',
            });
            tests_1.testLogger.test('Alice waits for credential from Faber');
            let aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecord)(aliceAgent, {
                threadId: aliceCredentialExchangeRecord.threadId,
                state: core_1.CredentialState.CredentialReceived,
            });
            tests_1.testLogger.test('Faber waits for credential ack from Alice');
            aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecord)(faberAgent, {
                threadId: aliceCredentialRecord.threadId,
                state: core_1.CredentialState.Done,
            });
            expect(aliceCredentialRecord).toMatchObject({
                type: core_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                metadata: {
                    data: {
                        '_anoncreds/credential': {
                            schemaId: schemaId,
                            credentialDefinitionId: credentialDefinitionId,
                        },
                    },
                },
                state: core_1.CredentialState.Done,
            });
        }));
        test("Faber starts with V1 credential offer to Alice, both with autoAcceptCredential on 'always'", () => __awaiter(void 0, void 0, void 0, function* () {
            tests_1.testLogger.test('Faber sends credential offer to Alice');
            const faberCredentialExchangeRecord = yield faberAgent.credentials.offerCredential({
                comment: 'some comment about credential',
                connectionId: faberConnectionId,
                credentialFormats: {
                    indy: {
                        attributes: credentialPreview.attributes,
                        credentialDefinitionId: credentialDefinitionId,
                    },
                },
                protocolVersion: 'v1',
            });
            tests_1.testLogger.test('Alice waits for credential from Faber');
            const aliceCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: core_1.CredentialState.CredentialReceived,
            });
            tests_1.testLogger.test('Faber waits for credential ack from Alice');
            const faberCredentialRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: core_1.CredentialState.Done,
            });
            expect(aliceCredentialRecord).toMatchObject({
                type: core_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                metadata: {
                    data: {
                        '_anoncreds/credentialRequest': expect.any(Object),
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
                state: core_1.CredentialState.CredentialReceived,
            });
            expect(faberCredentialRecord).toMatchObject({
                type: core_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                state: core_1.CredentialState.Done,
            });
        }));
    });
    describe("Auto accept on 'contentApproved'", () => {
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            ;
            ({
                issuerAgent: faberAgent,
                issuerReplay: faberReplay,
                holderAgent: aliceAgent,
                holderReplay: aliceReplay,
                credentialDefinitionId,
                schemaId,
                issuerHolderConnectionId: faberConnectionId,
                holderIssuerConnectionId: aliceConnectionId,
            } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
                issuerName: 'faber agent: contentApproved v1',
                holderName: 'alice agent: contentApproved v1',
                attributeNames: ['name', 'age', 'x-ray', 'profile_picture'],
                autoAcceptCredentials: core_1.AutoAcceptCredential.ContentApproved,
            }));
        }));
        afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield faberAgent.shutdown();
            yield faberAgent.wallet.delete();
            yield aliceAgent.shutdown();
            yield aliceAgent.wallet.delete();
        }));
        // ==============================
        // TESTS v1 BEGIN
        // ==========================
        test("Alice starts with V1 credential proposal to Faber, both with autoAcceptCredential on 'contentApproved'", () => __awaiter(void 0, void 0, void 0, function* () {
            tests_1.testLogger.test('Alice sends credential proposal to Faber');
            let aliceCredentialExchangeRecord = yield aliceAgent.credentials.proposeCredential({
                connectionId: aliceConnectionId,
                protocolVersion: 'v1',
                credentialFormats: {
                    indy: {
                        attributes: credentialPreview.attributes,
                        credentialDefinitionId: credentialDefinitionId,
                    },
                },
            });
            tests_1.testLogger.test('Faber waits for credential proposal from Alice');
            let faberCredentialExchangeRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
                threadId: aliceCredentialExchangeRecord.threadId,
                state: core_1.CredentialState.ProposalReceived,
            });
            tests_1.testLogger.test('Faber sends credential offer to Alice');
            faberCredentialExchangeRecord = yield faberAgent.credentials.acceptProposal({
                credentialRecordId: faberCredentialExchangeRecord.id,
                comment: 'V1 Indy Offer',
                credentialFormats: {
                    indy: {
                        credentialDefinitionId: credentialDefinitionId,
                        attributes: credentialPreview.attributes,
                    },
                },
            });
            tests_1.testLogger.test('Alice waits for credential from Faber');
            aliceCredentialExchangeRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: core_1.CredentialState.CredentialReceived,
            });
            tests_1.testLogger.test('Faber waits for credential ack from Alice');
            faberCredentialExchangeRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: core_1.CredentialState.Done,
            });
            expect(aliceCredentialExchangeRecord).toMatchObject({
                type: core_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                metadata: {
                    data: {
                        '_anoncreds/credentialRequest': expect.any(Object),
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
                state: core_1.CredentialState.CredentialReceived,
            });
            expect(faberCredentialExchangeRecord).toMatchObject({
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
                state: core_1.CredentialState.Done,
            });
        }));
        test("Faber starts with V1 credential offer to Alice, both with autoAcceptCredential on 'contentApproved'", () => __awaiter(void 0, void 0, void 0, function* () {
            tests_1.testLogger.test('Faber sends credential offer to Alice');
            let faberCredentialExchangeRecord = yield faberAgent.credentials.offerCredential({
                comment: 'some comment about credential',
                connectionId: faberConnectionId,
                credentialFormats: {
                    indy: {
                        attributes: credentialPreview.attributes,
                        credentialDefinitionId: credentialDefinitionId,
                    },
                },
                protocolVersion: 'v1',
            });
            tests_1.testLogger.test('Alice waits for credential offer from Faber');
            let aliceCredentialExchangeRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: core_1.CredentialState.OfferReceived,
            });
            expect(core_1.JsonTransformer.toJSON(aliceCredentialExchangeRecord)).toMatchObject({
                state: core_1.CredentialState.OfferReceived,
            });
            // below values are not in json object
            expect(aliceCredentialExchangeRecord.id).not.toBeNull();
            expect(aliceCredentialExchangeRecord.getTags()).toEqual({
                threadId: aliceCredentialExchangeRecord.threadId,
                state: aliceCredentialExchangeRecord.state,
                connectionId: aliceConnectionId,
                credentialIds: [],
            });
            tests_1.testLogger.test('alice sends credential request to faber');
            faberCredentialExchangeRecord = yield aliceAgent.credentials.acceptOffer({
                credentialRecordId: aliceCredentialExchangeRecord.id,
            });
            tests_1.testLogger.test('Alice waits for credential from Faber');
            aliceCredentialExchangeRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: core_1.CredentialState.CredentialReceived,
            });
            tests_1.testLogger.test('Faber waits for credential ack from Alice');
            faberCredentialExchangeRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: core_1.CredentialState.Done,
            });
            expect(aliceCredentialExchangeRecord).toMatchObject({
                type: core_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                metadata: {
                    data: {
                        '_anoncreds/credentialRequest': expect.any(Object),
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
                state: core_1.CredentialState.CredentialReceived,
            });
            expect(faberCredentialExchangeRecord).toMatchObject({
                type: core_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                state: core_1.CredentialState.Done,
            });
        }));
        test("Faber starts with V1 credential offer to Alice, both have autoAcceptCredential on 'contentApproved' and attributes did change", () => __awaiter(void 0, void 0, void 0, function* () {
            tests_1.testLogger.test('Faber sends credential offer to Alice');
            let faberCredentialExchangeRecord = yield faberAgent.credentials.offerCredential({
                comment: 'some comment about credential',
                connectionId: faberConnectionId,
                credentialFormats: {
                    indy: {
                        attributes: credentialPreview.attributes,
                        credentialDefinitionId: credentialDefinitionId,
                    },
                },
                protocolVersion: 'v1',
            });
            tests_1.testLogger.test('Alice waits for credential offer from Faber');
            let aliceCredentialExchangeRecord = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: core_1.CredentialState.OfferReceived,
            });
            // below values are not in json object
            expect(aliceCredentialExchangeRecord.id).not.toBeNull();
            expect(aliceCredentialExchangeRecord.getTags()).toEqual({
                threadId: aliceCredentialExchangeRecord.threadId,
                state: aliceCredentialExchangeRecord.state,
                connectionId: aliceConnectionId,
                credentialIds: [],
            });
            tests_1.testLogger.test('Alice sends credential request to Faber');
            const aliceExchangeCredentialRecord = yield aliceAgent.credentials.negotiateOffer({
                credentialRecordId: aliceCredentialExchangeRecord.id,
                credentialFormats: {
                    indy: {
                        attributes: newCredentialPreview.attributes,
                        credentialDefinitionId: credentialDefinitionId,
                    },
                },
                comment: 'v1 propose credential test',
            });
            tests_1.testLogger.test('Faber waits for credential proposal from Alice');
            faberCredentialExchangeRecord = yield (0, tests_1.waitForCredentialRecord)(faberAgent, {
                threadId: aliceExchangeCredentialRecord.threadId,
                state: core_1.CredentialState.ProposalReceived,
            });
            // Check if the state of fabers credential record did not change
            const faberRecord = yield faberAgent.credentials.getById(faberCredentialExchangeRecord.id);
            faberRecord.assertState(core_1.CredentialState.ProposalReceived);
            aliceCredentialExchangeRecord = yield aliceAgent.credentials.getById(aliceCredentialExchangeRecord.id);
            aliceCredentialExchangeRecord.assertState(core_1.CredentialState.ProposalSent);
        }));
        test("Alice starts with V1 credential proposal to Faber, both have autoAcceptCredential on 'contentApproved' and attributes did change", () => __awaiter(void 0, void 0, void 0, function* () {
            tests_1.testLogger.test('Alice sends credential proposal to Faber');
            const aliceCredentialExchangeRecord = yield aliceAgent.credentials.proposeCredential({
                connectionId: aliceConnectionId,
                protocolVersion: 'v1',
                credentialFormats: {
                    indy: {
                        attributes: credentialPreview.attributes,
                        credentialDefinitionId: credentialDefinitionId,
                    },
                },
                comment: 'v1 propose credential test',
            });
            tests_1.testLogger.test('Faber waits for credential proposal from Alice');
            let faberCredentialExchangeRecord = yield (0, tests_1.waitForCredentialRecordSubject)(faberReplay, {
                threadId: aliceCredentialExchangeRecord.threadId,
                state: core_1.CredentialState.ProposalReceived,
            });
            yield faberAgent.credentials.negotiateProposal({
                credentialRecordId: faberCredentialExchangeRecord.id,
                credentialFormats: {
                    indy: {
                        credentialDefinitionId: credentialDefinitionId,
                        attributes: newCredentialPreview.attributes,
                    },
                },
            });
            tests_1.testLogger.test('Alice waits for credential offer from Faber');
            const record = yield (0, tests_1.waitForCredentialRecordSubject)(aliceReplay, {
                threadId: faberCredentialExchangeRecord.threadId,
                state: core_1.CredentialState.OfferReceived,
            });
            // below values are not in json object
            expect(record.id).not.toBeNull();
            expect(record.getTags()).toEqual({
                threadId: record.threadId,
                state: record.state,
                connectionId: aliceConnectionId,
                credentialIds: [],
            });
            // Check if the state of the credential records did not change
            faberCredentialExchangeRecord = yield faberAgent.credentials.getById(faberCredentialExchangeRecord.id);
            faberCredentialExchangeRecord.assertState(core_1.CredentialState.OfferSent);
            const aliceRecord = yield aliceAgent.credentials.getById(record.id);
            aliceRecord.assertState(core_1.CredentialState.OfferReceived);
        }));
    });
});
