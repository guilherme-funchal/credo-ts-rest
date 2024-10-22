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
const legacyAnonCredsSetup_1 = require("../../../../../../../anoncreds/tests/legacyAnonCredsSetup");
const helpers_1 = require("../../../../../../tests/helpers");
const logger_1 = __importDefault(require("../../../../../../tests/logger"));
const CredentialAutoAcceptType_1 = require("../../../models/CredentialAutoAcceptType");
const CredentialState_1 = require("../../../models/CredentialState");
const CredentialExchangeRecord_1 = require("../../../repository/CredentialExchangeRecord");
const V2CredentialPreview_1 = require("../messages/V2CredentialPreview");
describe('V2 Credentials Auto Accept', () => {
    let faberAgent;
    let faberReplay;
    let aliceAgent;
    let aliceReplay;
    let credentialDefinitionId;
    let schemaId;
    let faberConnectionId;
    let aliceConnectionId;
    const credentialPreview = V2CredentialPreview_1.V2CredentialPreview.fromRecord({
        name: 'John',
        age: '99',
        'x-ray': 'some x-ray',
        profile_picture: 'profile picture',
    });
    const newCredentialPreview = V2CredentialPreview_1.V2CredentialPreview.fromRecord({
        name: 'John',
        age: '99',
        'x-ray': 'another x-ray value',
        profile_picture: 'another profile picture',
    });
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
                issuerName: 'faber agent: always v2',
                holderName: 'alice agent: always v2',
                autoAcceptCredentials: CredentialAutoAcceptType_1.AutoAcceptCredential.Always,
                attributeNames: ['name', 'age', 'x-ray', 'profile_picture'],
            }));
        }));
        afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield faberAgent.shutdown();
            yield faberAgent.wallet.delete();
            yield aliceAgent.shutdown();
            yield aliceAgent.wallet.delete();
        }));
        test("Alice starts with V2 credential proposal to Faber, both with autoAcceptCredential on 'always'", () => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.default.test('Alice sends credential proposal to Faber');
            let aliceCredentialRecord = yield aliceAgent.credentials.proposeCredential({
                connectionId: aliceConnectionId,
                protocolVersion: 'v2',
                credentialFormats: {
                    indy: {
                        attributes: credentialPreview.attributes,
                        credentialDefinitionId: credentialDefinitionId,
                    },
                },
                comment: 'v2 propose credential test',
            });
            logger_1.default.test('Alice waits for credential from Faber');
            aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(aliceReplay, {
                state: CredentialState_1.CredentialState.Done,
                threadId: aliceCredentialRecord.threadId,
            });
            logger_1.default.test('Faber waits for credential ack from Alice');
            yield (0, helpers_1.waitForCredentialRecordSubject)(faberReplay, {
                state: CredentialState_1.CredentialState.Done,
                threadId: aliceCredentialRecord.threadId,
            });
            expect(aliceCredentialRecord).toMatchObject({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
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
                state: CredentialState_1.CredentialState.Done,
            });
        }));
        test("Faber starts with V2 credential offer to Alice, both with autoAcceptCredential on 'always'", () => __awaiter(void 0, void 0, void 0, function* () {
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
            logger_1.default.test('Alice waits for credential from Faber');
            const aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(aliceReplay, {
                state: CredentialState_1.CredentialState.CredentialReceived,
                threadId: faberCredentialRecord.threadId,
            });
            expect(aliceCredentialRecord).toMatchObject({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
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
                state: CredentialState_1.CredentialState.CredentialReceived,
            });
            logger_1.default.test('Faber waits for credential ack from Alice');
            faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(faberReplay, {
                state: CredentialState_1.CredentialState.Done,
                threadId: faberCredentialRecord.threadId,
            });
            expect(faberCredentialRecord).toMatchObject({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                state: CredentialState_1.CredentialState.Done,
            });
        }));
    });
    describe("Auto accept on 'contentApproved'", () => {
        // FIXME: we don't need to set up the agent and create all schemas/credential definitions again, just change the auto accept credential setting
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
                issuerName: 'Faber Agent: Always V2',
                holderName: 'Alice Agent: Always V2',
                autoAcceptCredentials: CredentialAutoAcceptType_1.AutoAcceptCredential.ContentApproved,
                attributeNames: ['name', 'age', 'x-ray', 'profile_picture'],
            }));
        }));
        afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield faberAgent.shutdown();
            yield faberAgent.wallet.delete();
            yield aliceAgent.shutdown();
            yield aliceAgent.wallet.delete();
        }));
        test("Alice starts with V2 credential proposal to Faber, both with autoAcceptCredential on 'contentApproved'", () => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.default.test('Alice sends credential proposal to Faber');
            let aliceCredentialRecord = yield aliceAgent.credentials.proposeCredential({
                connectionId: aliceConnectionId,
                protocolVersion: 'v2',
                credentialFormats: {
                    indy: {
                        attributes: credentialPreview.attributes,
                        credentialDefinitionId: credentialDefinitionId,
                    },
                },
            });
            logger_1.default.test('Faber waits for credential proposal from Alice');
            let faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(faberReplay, {
                state: CredentialState_1.CredentialState.ProposalReceived,
                threadId: aliceCredentialRecord.threadId,
            });
            logger_1.default.test('Faber sends credential offer to Alice');
            yield faberAgent.credentials.acceptProposal({
                credentialRecordId: faberCredentialRecord.id,
                comment: 'V2 Indy Offer',
                credentialFormats: {
                    indy: {
                        credentialDefinitionId: credentialDefinitionId,
                        attributes: credentialPreview.attributes,
                    },
                },
            });
            logger_1.default.test('Alice waits for credential from Faber');
            aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(aliceReplay, {
                state: CredentialState_1.CredentialState.Done,
                threadId: faberCredentialRecord.threadId,
            });
            faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecord)(faberAgent, {
                threadId: faberCredentialRecord.threadId,
                state: CredentialState_1.CredentialState.Done,
            });
            expect(aliceCredentialRecord).toMatchObject({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
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
                state: CredentialState_1.CredentialState.Done,
            });
            expect(faberCredentialRecord).toMatchObject({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
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
                state: CredentialState_1.CredentialState.Done,
            });
        }));
        test("Faber starts with V2 credential offer to Alice, both with autoAcceptCredential on 'contentApproved'", () => __awaiter(void 0, void 0, void 0, function* () {
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
            let aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(aliceReplay, {
                state: CredentialState_1.CredentialState.OfferReceived,
                threadId: faberCredentialRecord.threadId,
            });
            // below values are not in json object
            expect(aliceCredentialRecord.id).not.toBeNull();
            expect(aliceCredentialRecord.getTags()).toEqual({
                threadId: aliceCredentialRecord.threadId,
                state: aliceCredentialRecord.state,
                connectionId: aliceConnectionId,
                credentialIds: [],
            });
            logger_1.default.test('Alice received credential offer from Faber');
            logger_1.default.test('alice sends credential request to faber');
            yield aliceAgent.credentials.acceptOffer({
                credentialRecordId: aliceCredentialRecord.id,
            });
            logger_1.default.test('Alice waits for credential from Faber');
            aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(aliceReplay, {
                state: CredentialState_1.CredentialState.Done,
                threadId: faberCredentialRecord.threadId,
            });
            expect(aliceCredentialRecord).toMatchObject({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
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
                state: CredentialState_1.CredentialState.Done,
            });
            logger_1.default.test('Faber waits for credential ack from Alice');
            faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(faberReplay, {
                threadId: faberCredentialRecord.threadId,
                state: CredentialState_1.CredentialState.Done,
            });
            expect(faberCredentialRecord).toMatchObject({
                type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
                id: expect.any(String),
                createdAt: expect.any(Date),
                state: CredentialState_1.CredentialState.Done,
            });
        }));
        test("Alice starts with V2 credential proposal to Faber, both have autoAcceptCredential on 'contentApproved' and attributes did change", () => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.default.test('Alice sends credential proposal to Faber');
            let aliceCredentialRecord = yield aliceAgent.credentials.proposeCredential({
                connectionId: aliceConnectionId,
                protocolVersion: 'v2',
                credentialFormats: {
                    indy: {
                        attributes: credentialPreview.attributes,
                        credentialDefinitionId: credentialDefinitionId,
                    },
                },
                comment: 'v2 propose credential test',
            });
            expect(aliceCredentialRecord.state).toBe(CredentialState_1.CredentialState.ProposalSent);
            logger_1.default.test('Faber waits for credential proposal from Alice');
            let faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(faberReplay, {
                state: CredentialState_1.CredentialState.ProposalReceived,
                threadId: aliceCredentialRecord.threadId,
            });
            logger_1.default.test('Faber negotiated proposal, sending credential offer to Alice');
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
            aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(aliceReplay, {
                state: CredentialState_1.CredentialState.OfferReceived,
                threadId: faberCredentialRecord.threadId,
            });
            // below values are not in json object
            expect(aliceCredentialRecord.id).not.toBeNull();
            expect(aliceCredentialRecord.getTags()).toEqual({
                threadId: aliceCredentialRecord.threadId,
                state: aliceCredentialRecord.state,
                connectionId: aliceConnectionId,
                credentialIds: [],
            });
        }));
        test("Faber starts with V2 credential offer to Alice, both have autoAcceptCredential on 'contentApproved' and attributes did change", () => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.default.test('Faber sends credential offer to Alice');
            const faberCredentialRecord = yield faberAgent.credentials.offerCredential({
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
            const aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(aliceReplay, {
                state: CredentialState_1.CredentialState.OfferReceived,
                threadId: faberCredentialRecord.threadId,
            });
            // below values are not in json object
            expect(aliceCredentialRecord.id).not.toBeNull();
            expect(aliceCredentialRecord.getTags()).toEqual({
                threadId: aliceCredentialRecord.threadId,
                state: aliceCredentialRecord.state,
                connectionId: aliceConnectionId,
                credentialIds: [],
            });
            logger_1.default.test('Alice sends credential request to Faber');
            yield aliceAgent.credentials.negotiateOffer({
                credentialRecordId: aliceCredentialRecord.id,
                credentialFormats: {
                    indy: {
                        attributes: newCredentialPreview.attributes,
                        credentialDefinitionId: credentialDefinitionId,
                    },
                },
                comment: 'v2 propose credential test',
            });
            yield (0, helpers_1.waitForCredentialRecordSubject)(faberReplay, {
                state: CredentialState_1.CredentialState.ProposalReceived,
                threadId: aliceCredentialRecord.threadId,
            });
        }));
    });
});
