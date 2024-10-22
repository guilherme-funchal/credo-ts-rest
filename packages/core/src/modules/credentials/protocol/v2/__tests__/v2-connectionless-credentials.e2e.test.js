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
const rxjs_1 = require("rxjs");
const SubjectInboundTransport_1 = require("../../../../../../../../tests/transport/SubjectInboundTransport");
const SubjectOutboundTransport_1 = require("../../../../../../../../tests/transport/SubjectOutboundTransport");
const legacyAnonCredsSetup_1 = require("../../../../../../../anoncreds/tests/legacyAnonCredsSetup");
const helpers_1 = require("../../../../../../tests/helpers");
const logger_1 = __importDefault(require("../../../../../../tests/logger"));
const Agent_1 = require("../../../../../agent/Agent");
const CredentialEvents_1 = require("../../../CredentialEvents");
const CredentialAutoAcceptType_1 = require("../../../models/CredentialAutoAcceptType");
const CredentialState_1 = require("../../../models/CredentialState");
const CredentialExchangeRecord_1 = require("../../../repository/CredentialExchangeRecord");
const messages_1 = require("../messages");
const faberAgentOptions = (0, helpers_1.getAgentOptions)('Faber connection-less Credentials V2', {
    endpoints: ['rxjs:faber'],
}, (0, legacyAnonCredsSetup_1.getLegacyAnonCredsModules)());
const aliceAgentOptions = (0, helpers_1.getAgentOptions)('Alice connection-less Credentials V2', {
    endpoints: ['rxjs:alice'],
}, (0, legacyAnonCredsSetup_1.getLegacyAnonCredsModules)());
const credentialPreview = messages_1.V2CredentialPreview.fromRecord({
    name: 'John',
    age: '99',
});
describe('V2 Connectionless Credentials', () => {
    let faberAgent;
    let aliceAgent;
    let faberReplay;
    let aliceReplay;
    let credentialDefinitionId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const faberMessages = new rxjs_1.Subject();
        const aliceMessages = new rxjs_1.Subject();
        const subjectMap = {
            'rxjs:faber': faberMessages,
            'rxjs:alice': aliceMessages,
        };
        faberAgent = new Agent_1.Agent(faberAgentOptions);
        faberAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(faberMessages));
        faberAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield faberAgent.initialize();
        aliceAgent = new Agent_1.Agent(aliceAgentOptions);
        aliceAgent.registerInboundTransport(new SubjectInboundTransport_1.SubjectInboundTransport(aliceMessages));
        aliceAgent.registerOutboundTransport(new SubjectOutboundTransport_1.SubjectOutboundTransport(subjectMap));
        yield aliceAgent.initialize();
        const { credentialDefinition } = yield (0, legacyAnonCredsSetup_1.prepareForAnonCredsIssuance)(faberAgent, {
            attributeNames: ['name', 'age'],
        });
        credentialDefinitionId = credentialDefinition.credentialDefinitionId;
        faberReplay = new rxjs_1.ReplaySubject();
        aliceReplay = new rxjs_1.ReplaySubject();
        faberAgent.events
            .observable(CredentialEvents_1.CredentialEventTypes.CredentialStateChanged)
            .subscribe(faberReplay);
        aliceAgent.events
            .observable(CredentialEvents_1.CredentialEventTypes.CredentialStateChanged)
            .subscribe(aliceReplay);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('Faber starts with connection-less credential offer to Alice', () => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.test('Faber sends credential offer to Alice');
        // eslint-disable-next-line prefer-const
        let { message, credentialRecord: faberCredentialRecord } = yield faberAgent.credentials.createOffer({
            comment: 'V2 Out of Band offer',
            credentialFormats: {
                indy: {
                    attributes: credentialPreview.attributes,
                    credentialDefinitionId,
                },
            },
            protocolVersion: 'v2',
        });
        const { message: offerMessage } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
            recordId: faberCredentialRecord.id,
            message,
            domain: 'https://a-domain.com',
        });
        yield aliceAgent.receiveMessage(offerMessage.toJSON());
        let aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.OfferReceived,
        });
        logger_1.default.test('Alice sends credential request to Faber');
        const acceptOfferOptions = {
            credentialRecordId: aliceCredentialRecord.id,
        };
        const credentialRecord = yield aliceAgent.credentials.acceptOffer(acceptOfferOptions);
        logger_1.default.test('Faber waits for credential request from Alice');
        faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: credentialRecord.threadId,
            state: CredentialState_1.CredentialState.RequestReceived,
        });
        logger_1.default.test('Faber sends credential to Alice');
        const options = {
            credentialRecordId: faberCredentialRecord.id,
            comment: 'V2 Indy Credential',
        };
        faberCredentialRecord = yield faberAgent.credentials.acceptRequest(options);
        logger_1.default.test('Alice waits for credential from Faber');
        aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.CredentialReceived,
        });
        logger_1.default.test('Alice sends credential ack to Faber');
        aliceCredentialRecord = yield aliceAgent.credentials.acceptCredential({
            credentialRecordId: aliceCredentialRecord.id,
        });
        logger_1.default.test('Faber waits for credential ack from Alice');
        faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.Done,
        });
        expect(aliceCredentialRecord).toMatchObject({
            type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            metadata: {
                data: {
                    '_anoncreds/credential': {
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
            state: CredentialState_1.CredentialState.Done,
            threadId: expect.any(String),
        });
        expect(faberCredentialRecord).toMatchObject({
            type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            metadata: {
                data: {
                    '_anoncreds/credential': {
                        credentialDefinitionId,
                    },
                },
            },
            state: CredentialState_1.CredentialState.Done,
            threadId: expect.any(String),
        });
    }));
    test('Faber starts with connection-less credential offer to Alice with auto-accept enabled', () => __awaiter(void 0, void 0, void 0, function* () {
        // eslint-disable-next-line prefer-const
        let { message, credentialRecord: faberCredentialRecord } = yield faberAgent.credentials.createOffer({
            comment: 'V2 Out of Band offer',
            credentialFormats: {
                indy: {
                    attributes: credentialPreview.attributes,
                    credentialDefinitionId,
                },
            },
            protocolVersion: 'v2',
            autoAcceptCredential: CredentialAutoAcceptType_1.AutoAcceptCredential.ContentApproved,
        });
        const { message: offerMessage } = yield faberAgent.oob.createLegacyConnectionlessInvitation({
            recordId: faberCredentialRecord.id,
            message,
            domain: 'https://a-domain.com',
        });
        // Receive Message
        yield aliceAgent.receiveMessage(offerMessage.toJSON());
        // Wait for it to be processed
        let aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.OfferReceived,
        });
        yield aliceAgent.credentials.acceptOffer({
            credentialRecordId: aliceCredentialRecord.id,
            autoAcceptCredential: CredentialAutoAcceptType_1.AutoAcceptCredential.ContentApproved,
        });
        aliceCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(aliceReplay, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.Done,
        });
        faberCredentialRecord = yield (0, helpers_1.waitForCredentialRecordSubject)(faberReplay, {
            threadId: faberCredentialRecord.threadId,
            state: CredentialState_1.CredentialState.Done,
        });
        expect(aliceCredentialRecord).toMatchObject({
            type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            metadata: {
                data: {
                    '_anoncreds/credential': {
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
            threadId: expect.any(String),
        });
        expect(faberCredentialRecord).toMatchObject({
            type: CredentialExchangeRecord_1.CredentialExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            state: CredentialState_1.CredentialState.Done,
            threadId: expect.any(String),
        });
    }));
});
