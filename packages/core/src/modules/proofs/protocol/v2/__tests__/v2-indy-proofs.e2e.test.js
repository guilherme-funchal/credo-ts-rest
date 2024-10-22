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
const tests_1 = require("../../../../../../tests");
const logger_1 = __importDefault(require("../../../../../../tests/logger"));
const Attachment_1 = require("../../../../../decorators/attachment/Attachment");
const LinkedAttachment_1 = require("../../../../../utils/LinkedAttachment");
const models_1 = require("../../../models");
const repository_1 = require("../../../repository");
const messages_1 = require("../messages");
describe('Present Proof', () => {
    let faberAgent;
    let faberReplay;
    let aliceAgent;
    let aliceReplay;
    let credentialDefinitionId;
    let aliceConnectionId;
    let faberConnectionId;
    let faberProofExchangeRecord;
    let aliceProofExchangeRecord;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.test('Initializing the agents');
        ({
            issuerAgent: faberAgent,
            issuerReplay: faberReplay,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            credentialDefinitionId,
            issuerHolderConnectionId: faberConnectionId,
            holderIssuerConnectionId: aliceConnectionId,
        } = yield (0, legacyAnonCredsSetup_1.setupAnonCredsTests)({
            issuerName: 'Faber agent indy proofs',
            holderName: 'Alice agent indy proofs',
            attributeNames: ['name', 'age', 'image_0', 'image_1'],
        }));
        yield (0, legacyAnonCredsSetup_1.issueLegacyAnonCredsCredential)({
            issuerAgent: faberAgent,
            holderAgent: aliceAgent,
            holderReplay: aliceReplay,
            issuerReplay: faberReplay,
            issuerHolderConnectionId: faberConnectionId,
            offer: {
                credentialDefinitionId,
                attributes: [
                    {
                        name: 'name',
                        value: 'John',
                    },
                    {
                        name: 'age',
                        value: '99',
                    },
                ],
                linkedAttachments: [
                    new LinkedAttachment_1.LinkedAttachment({
                        name: 'image_0',
                        attachment: new Attachment_1.Attachment({
                            filename: 'picture-of-a-cat.png',
                            data: new Attachment_1.AttachmentData({ base64: 'cGljdHVyZSBvZiBhIGNhdA==' }),
                        }),
                    }),
                    new LinkedAttachment_1.LinkedAttachment({
                        name: 'image_1',
                        attachment: new Attachment_1.Attachment({
                            filename: 'picture-of-a-dog.png',
                            data: new Attachment_1.AttachmentData({ base64: 'UGljdHVyZSBvZiBhIGRvZw==' }),
                        }),
                    }),
                ],
            },
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.test('Shutting down both agents');
        yield faberAgent.shutdown();
        yield faberAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('Alice starts with proof proposal to Faber', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        // Alice sends a presentation proposal to Faber
        logger_1.default.test('Alice sends a presentation proposal to Faber');
        let faberProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(faberAgent, {
            state: models_1.ProofState.ProposalReceived,
        });
        aliceProofExchangeRecord = yield aliceAgent.proofs.proposeProof({
            connectionId: aliceConnectionId,
            protocolVersion: 'v2',
            proofFormats: {
                indy: {
                    name: 'abc',
                    version: '1.0',
                    attributes: [
                        {
                            name: 'name',
                            value: 'Alice',
                            credentialDefinitionId,
                        },
                    ],
                    predicates: [
                        {
                            name: 'age',
                            predicate: '>=',
                            threshold: 50,
                            credentialDefinitionId,
                        },
                    ],
                },
            },
        });
        // Faber waits for a presentation proposal from Alice
        logger_1.default.test('Faber waits for a presentation proposal from Alice');
        faberProofExchangeRecord = yield faberProofExchangeRecordPromise;
        const proposal = yield faberAgent.proofs.findProposalMessage(faberProofExchangeRecord.id);
        expect(proposal).toMatchObject({
            type: 'https://didcomm.org/present-proof/2.0/propose-presentation',
            formats: [
                {
                    attachmentId: expect.any(String),
                    format: 'hlindy/proof-req@v2.0',
                },
            ],
            proposalAttachments: [
                {
                    id: expect.any(String),
                    mimeType: 'application/json',
                    data: {
                        base64: expect.any(String),
                    },
                },
            ],
            id: expect.any(String),
        });
        expect(faberProofExchangeRecord.id).not.toBeNull();
        expect(faberProofExchangeRecord).toMatchObject({
            threadId: faberProofExchangeRecord.threadId,
            state: models_1.ProofState.ProposalReceived,
            protocolVersion: 'v2',
        });
        let aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
            state: models_1.ProofState.RequestReceived,
        });
        // Faber accepts the presentation proposal from Alice
        logger_1.default.test('Faber accepts presentation proposal from Alice');
        faberProofExchangeRecord = yield faberAgent.proofs.acceptProposal({
            proofRecordId: faberProofExchangeRecord.id,
        });
        // Alice waits for presentation request from Faber
        logger_1.default.test('Alice waits for presentation request from Faber');
        aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
        const request = yield faberAgent.proofs.findRequestMessage(faberProofExchangeRecord.id);
        expect(request).toMatchObject({
            type: 'https://didcomm.org/present-proof/2.0/request-presentation',
            formats: [
                {
                    attachmentId: expect.any(String),
                    format: 'hlindy/proof-req@v2.0',
                },
            ],
            requestAttachments: [
                {
                    id: expect.any(String),
                    mimeType: 'application/json',
                    data: {
                        base64: expect.any(String),
                    },
                },
            ],
            id: expect.any(String),
            thread: {
                threadId: faberProofExchangeRecord.threadId,
            },
        });
        // Alice retrieves the requested credentials and accepts the presentation request
        logger_1.default.test('Alice accepts presentation request from Faber');
        const requestedCredentials = yield aliceAgent.proofs.selectCredentialsForRequest({
            proofRecordId: aliceProofExchangeRecord.id,
        });
        faberProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(faberAgent, {
            threadId: aliceProofExchangeRecord.threadId,
            state: models_1.ProofState.PresentationReceived,
        });
        yield aliceAgent.proofs.acceptRequest({
            proofRecordId: aliceProofExchangeRecord.id,
            proofFormats: { indy: requestedCredentials.proofFormats.indy },
        });
        // Faber waits for the presentation from Alice
        logger_1.default.test('Faber waits for presentation from Alice');
        faberProofExchangeRecord = yield faberProofExchangeRecordPromise;
        const presentation = yield faberAgent.proofs.findPresentationMessage(faberProofExchangeRecord.id);
        expect(presentation).toMatchObject({
            type: 'https://didcomm.org/present-proof/2.0/presentation',
            formats: [
                {
                    attachmentId: expect.any(String),
                    format: 'hlindy/proof@v2.0',
                },
            ],
            presentationAttachments: [
                {
                    id: expect.any(String),
                    mimeType: 'application/json',
                    data: {
                        base64: expect.any(String),
                    },
                },
            ],
            id: expect.any(String),
            thread: {
                threadId: faberProofExchangeRecord.threadId,
            },
        });
        expect(faberProofExchangeRecord.id).not.toBeNull();
        expect(faberProofExchangeRecord).toMatchObject({
            threadId: faberProofExchangeRecord.threadId,
            state: models_1.ProofState.PresentationReceived,
            protocolVersion: 'v2',
        });
        aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
            threadId: aliceProofExchangeRecord.threadId,
            state: models_1.ProofState.Done,
        });
        // Faber accepts the presentation provided by Alice
        logger_1.default.test('Faber accepts the presentation provided by Alice');
        yield faberAgent.proofs.acceptPresentation({ proofRecordId: faberProofExchangeRecord.id });
        // Alice waits until she received a presentation acknowledgement
        logger_1.default.test('Alice waits until she receives a presentation acknowledgement');
        aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
        expect(faberProofExchangeRecord).toMatchObject({
            type: repository_1.ProofExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            threadId: aliceProofExchangeRecord.threadId,
            connectionId: expect.any(String),
            isVerified: true,
            state: models_1.ProofState.PresentationReceived,
        });
        expect(aliceProofExchangeRecord).toMatchObject({
            type: repository_1.ProofExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            threadId: faberProofExchangeRecord.threadId,
            connectionId: expect.any(String),
            state: models_1.ProofState.Done,
        });
        const proposalMessage = yield aliceAgent.proofs.findProposalMessage(aliceProofExchangeRecord.id);
        const requestMessage = yield aliceAgent.proofs.findRequestMessage(aliceProofExchangeRecord.id);
        const presentationMessage = yield aliceAgent.proofs.findPresentationMessage(aliceProofExchangeRecord.id);
        expect(proposalMessage).toBeInstanceOf(messages_1.V2ProposePresentationMessage);
        expect(requestMessage).toBeInstanceOf(messages_1.V2RequestPresentationMessage);
        expect(presentationMessage).toBeInstanceOf(messages_1.V2PresentationMessage);
        const formatData = yield aliceAgent.proofs.getFormatData(aliceProofExchangeRecord.id);
        expect(formatData).toMatchObject({
            proposal: {
                indy: {
                    name: 'abc',
                    version: '1.0',
                    nonce: expect.any(String),
                    requested_attributes: {
                        [Object.keys((_c = (_b = (_a = formatData.proposal) === null || _a === void 0 ? void 0 : _a.indy) === null || _b === void 0 ? void 0 : _b.requested_attributes) !== null && _c !== void 0 ? _c : {})[0]]: {
                            name: 'name',
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                    },
                    requested_predicates: {
                        [Object.keys((_f = (_e = (_d = formatData.proposal) === null || _d === void 0 ? void 0 : _d.indy) === null || _e === void 0 ? void 0 : _e.requested_predicates) !== null && _f !== void 0 ? _f : {})[0]]: {
                            name: 'age',
                            p_type: '>=',
                            p_value: 50,
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                    },
                },
            },
            request: {
                indy: {
                    name: 'abc',
                    version: '1.0',
                    nonce: expect.any(String),
                    requested_attributes: {
                        [Object.keys((_j = (_h = (_g = formatData.request) === null || _g === void 0 ? void 0 : _g.indy) === null || _h === void 0 ? void 0 : _h.requested_attributes) !== null && _j !== void 0 ? _j : {})[0]]: {
                            name: 'name',
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                    },
                    requested_predicates: {
                        [Object.keys((_m = (_l = (_k = formatData.request) === null || _k === void 0 ? void 0 : _k.indy) === null || _l === void 0 ? void 0 : _l.requested_predicates) !== null && _m !== void 0 ? _m : {})[0]]: {
                            name: 'age',
                            p_type: '>=',
                            p_value: 50,
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                    },
                },
            },
            presentation: {
                indy: {
                    proof: {
                        proofs: [
                            {
                                primary_proof: expect.any(Object),
                                non_revoc_proof: null,
                            },
                        ],
                        aggregated_proof: {
                            c_hash: expect.any(String),
                            c_list: expect.any(Array),
                        },
                    },
                    requested_proof: expect.any(Object),
                    identifiers: expect.any(Array),
                },
            },
        });
    }));
    test('Faber starts with proof request to Alice', () => __awaiter(void 0, void 0, void 0, function* () {
        let aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
            state: models_1.ProofState.RequestReceived,
        });
        // Faber sends a presentation request to Alice
        logger_1.default.test('Faber sends a presentation request to Alice');
        faberProofExchangeRecord = yield faberAgent.proofs.requestProof({
            protocolVersion: 'v2',
            connectionId: faberConnectionId,
            proofFormats: {
                indy: {
                    name: 'Proof Request',
                    version: '1.0.0',
                    requested_attributes: {
                        name: {
                            name: 'name',
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                        image_0: {
                            name: 'image_0',
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                    },
                    requested_predicates: {
                        age: {
                            name: 'age',
                            p_type: '>=',
                            p_value: 50,
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                    },
                },
            },
        });
        // Alice waits for presentation request from Faber
        logger_1.default.test('Alice waits for presentation request from Faber');
        aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
        const request = yield faberAgent.proofs.findRequestMessage(faberProofExchangeRecord.id);
        expect(request).toMatchObject({
            type: 'https://didcomm.org/present-proof/2.0/request-presentation',
            formats: [
                {
                    attachmentId: expect.any(String),
                    format: 'hlindy/proof-req@v2.0',
                },
            ],
            requestAttachments: [
                {
                    id: expect.any(String),
                    mimeType: 'application/json',
                    data: {
                        base64: expect.any(String),
                    },
                },
            ],
            id: expect.any(String),
        });
        expect(aliceProofExchangeRecord.id).not.toBeNull();
        expect(aliceProofExchangeRecord).toMatchObject({
            threadId: aliceProofExchangeRecord.threadId,
            state: models_1.ProofState.RequestReceived,
            protocolVersion: 'v2',
        });
        // Alice retrieves the requested credentials and accepts the presentation request
        logger_1.default.test('Alice accepts presentation request from Faber');
        const requestedCredentials = yield aliceAgent.proofs.selectCredentialsForRequest({
            proofRecordId: aliceProofExchangeRecord.id,
        });
        const faberProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(faberAgent, {
            threadId: aliceProofExchangeRecord.threadId,
            state: models_1.ProofState.PresentationReceived,
        });
        yield aliceAgent.proofs.acceptRequest({
            proofRecordId: aliceProofExchangeRecord.id,
            proofFormats: { indy: requestedCredentials.proofFormats.indy },
        });
        // Faber waits until it receives a presentation from Alice
        logger_1.default.test('Faber waits for presentation from Alice');
        faberProofExchangeRecord = yield faberProofExchangeRecordPromise;
        const presentation = yield faberAgent.proofs.findPresentationMessage(faberProofExchangeRecord.id);
        expect(presentation).toMatchObject({
            type: 'https://didcomm.org/present-proof/2.0/presentation',
            formats: [
                {
                    attachmentId: expect.any(String),
                    format: 'hlindy/proof@v2.0',
                },
            ],
            presentationAttachments: [
                {
                    id: expect.any(String),
                    mimeType: 'application/json',
                    data: {
                        base64: expect.any(String),
                    },
                },
            ],
            id: expect.any(String),
            thread: {
                threadId: faberProofExchangeRecord.threadId,
            },
        });
        expect(faberProofExchangeRecord.id).not.toBeNull();
        expect(faberProofExchangeRecord).toMatchObject({
            threadId: faberProofExchangeRecord.threadId,
            state: models_1.ProofState.PresentationReceived,
            protocolVersion: 'v2',
        });
        aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
            threadId: aliceProofExchangeRecord.threadId,
            state: models_1.ProofState.Done,
        });
        // Faber accepts the presentation
        logger_1.default.test('Faber accept the presentation from Alice');
        yield faberAgent.proofs.acceptPresentation({ proofRecordId: faberProofExchangeRecord.id });
        // Alice waits until she receives a presentation acknowledgement
        logger_1.default.test('Alice waits for acceptance by Faber');
        aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
        expect(faberProofExchangeRecord).toMatchObject({
            type: repository_1.ProofExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            threadId: aliceProofExchangeRecord.threadId,
            connectionId: expect.any(String),
            isVerified: true,
            state: models_1.ProofState.PresentationReceived,
        });
        expect(aliceProofExchangeRecord).toMatchObject({
            type: repository_1.ProofExchangeRecord.type,
            id: expect.any(String),
            createdAt: expect.any(Date),
            threadId: faberProofExchangeRecord.threadId,
            connectionId: expect.any(String),
            state: models_1.ProofState.Done,
        });
    }));
    test('Alice provides credentials via call to getRequestedCredentials', () => __awaiter(void 0, void 0, void 0, function* () {
        const aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
            state: models_1.ProofState.RequestReceived,
        });
        // Faber sends a presentation request to Alice
        logger_1.default.test('Faber sends a presentation request to Alice');
        faberProofExchangeRecord = yield faberAgent.proofs.requestProof({
            protocolVersion: 'v2',
            connectionId: faberConnectionId,
            proofFormats: {
                indy: {
                    name: 'Proof Request',
                    version: '1.0.0',
                    requested_attributes: {
                        name: {
                            name: 'name',
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                        image_0: {
                            name: 'image_0',
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                    },
                    requested_predicates: {
                        age: {
                            name: 'age',
                            p_type: '>=',
                            p_value: 50,
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                    },
                },
            },
        });
        // Alice waits for presentation request from Faber
        logger_1.default.test('Alice waits for presentation request from Faber');
        aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
        const retrievedCredentials = yield aliceAgent.proofs.getCredentialsForRequest({
            proofRecordId: aliceProofExchangeRecord.id,
        });
        expect(retrievedCredentials).toMatchObject({
            proofFormats: {
                indy: {
                    attributes: {
                        name: [
                            {
                                credentialId: expect.any(String),
                                revealed: true,
                                credentialInfo: {
                                    credentialId: expect.any(String),
                                    attributes: {
                                        image_0: 'hl:zQmfDXo7T3J43j3CTkEZaz7qdHuABhWktksZ7JEBueZ5zUS',
                                        image_1: 'hl:zQmRHBT9rDs5QhsnYuPY3mNpXxgLcnNXkhjWJvTSAPMmcVd',
                                        name: 'John',
                                        age: '99',
                                    },
                                    schemaId: expect.any(String),
                                    credentialDefinitionId: expect.any(String),
                                    revocationRegistryId: null,
                                    credentialRevocationId: null,
                                },
                            },
                        ],
                        image_0: [
                            {
                                credentialId: expect.any(String),
                                revealed: true,
                                credentialInfo: {
                                    credentialId: expect.any(String),
                                    attributes: {
                                        age: '99',
                                        image_0: 'hl:zQmfDXo7T3J43j3CTkEZaz7qdHuABhWktksZ7JEBueZ5zUS',
                                        image_1: 'hl:zQmRHBT9rDs5QhsnYuPY3mNpXxgLcnNXkhjWJvTSAPMmcVd',
                                        name: 'John',
                                    },
                                    schemaId: expect.any(String),
                                    credentialDefinitionId: expect.any(String),
                                    revocationRegistryId: null,
                                    credentialRevocationId: null,
                                },
                            },
                        ],
                    },
                    predicates: {
                        age: [
                            {
                                credentialId: expect.any(String),
                                credentialInfo: {
                                    credentialId: expect.any(String),
                                    attributes: {
                                        image_1: 'hl:zQmRHBT9rDs5QhsnYuPY3mNpXxgLcnNXkhjWJvTSAPMmcVd',
                                        image_0: 'hl:zQmfDXo7T3J43j3CTkEZaz7qdHuABhWktksZ7JEBueZ5zUS',
                                        name: 'John',
                                        age: '99',
                                    },
                                    schemaId: expect.any(String),
                                    credentialDefinitionId: expect.any(String),
                                    revocationRegistryId: null,
                                    credentialRevocationId: null,
                                },
                            },
                        ],
                    },
                },
            },
        });
    }));
    test('Faber starts with proof request to Alice but gets Problem Reported', () => __awaiter(void 0, void 0, void 0, function* () {
        const aliceProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(aliceAgent, {
            state: models_1.ProofState.RequestReceived,
        });
        // Faber sends a presentation request to Alice
        logger_1.default.test('Faber sends a presentation request to Alice');
        faberProofExchangeRecord = yield faberAgent.proofs.requestProof({
            protocolVersion: 'v2',
            connectionId: faberConnectionId,
            proofFormats: {
                indy: {
                    name: 'proof-request',
                    version: '1.0',
                    requested_attributes: {
                        name: {
                            name: 'name',
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                        image_0: {
                            name: 'image_0',
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                    },
                    requested_predicates: {
                        age: {
                            name: 'age',
                            p_type: '>=',
                            p_value: 50,
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                    },
                },
            },
        });
        // Alice waits for presentation request from Faber
        logger_1.default.test('Alice waits for presentation request from Faber');
        aliceProofExchangeRecord = yield aliceProofExchangeRecordPromise;
        const request = yield faberAgent.proofs.findRequestMessage(faberProofExchangeRecord.id);
        expect(request).toMatchObject({
            type: 'https://didcomm.org/present-proof/2.0/request-presentation',
            formats: [
                {
                    attachmentId: expect.any(String),
                    format: 'hlindy/proof-req@v2.0',
                },
            ],
            requestAttachments: [
                {
                    id: expect.any(String),
                    mimeType: 'application/json',
                    data: {
                        base64: expect.any(String),
                    },
                },
            ],
            id: expect.any(String),
        });
        expect(aliceProofExchangeRecord.id).not.toBeNull();
        expect(aliceProofExchangeRecord).toMatchObject({
            threadId: aliceProofExchangeRecord.threadId,
            state: models_1.ProofState.RequestReceived,
            protocolVersion: 'v2',
        });
        const faberProofExchangeRecordPromise = (0, tests_1.waitForProofExchangeRecord)(faberAgent, {
            threadId: aliceProofExchangeRecord.threadId,
            state: models_1.ProofState.Abandoned,
        });
        aliceProofExchangeRecord = yield aliceAgent.proofs.sendProblemReport({
            description: 'Problem inside proof request',
            proofRecordId: aliceProofExchangeRecord.id,
        });
        faberProofExchangeRecord = yield faberProofExchangeRecordPromise;
        expect(faberProofExchangeRecord).toMatchObject({
            threadId: aliceProofExchangeRecord.threadId,
            state: models_1.ProofState.Abandoned,
            protocolVersion: 'v2',
        });
    }));
});
