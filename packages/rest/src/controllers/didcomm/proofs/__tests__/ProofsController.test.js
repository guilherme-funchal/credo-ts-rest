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
const core_1 = require("@credo-ts/core");
const express_1 = __importDefault(require("express"));
const rxjs_1 = require("rxjs");
const supertest_1 = __importDefault(require("supertest"));
const helpers_1 = require("../../../../../tests/utils/helpers");
const setupApp_1 = require("../../../../setup/setupApp");
const fixtures_1 = require("../../../anoncreds/__tests__/fixtures");
describe('ProofsController', () => {
    const app = (0, express_1.default)();
    let agent;
    let inviterConnectionId;
    let receiverConnectionId;
    let credentialDefinitionId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = yield (0, helpers_1.getTestAgent)('DIDComm Proofs REST Agent Test');
        yield (0, setupApp_1.setupApp)({ agent, adminPort: 3000, baseApp: app });
        const inviterOutOfBandRecord = yield agent.oob.createInvitation();
        let { connectionRecord: receiverConnection } = yield agent.oob.receiveInvitation(inviterOutOfBandRecord.outOfBandInvitation);
        receiverConnection = yield agent.connections.returnWhenIsConnected(receiverConnection.id);
        const [inviterConnection] = yield agent.connections.findAllByOutOfBandId(inviterOutOfBandRecord.id);
        inviterConnectionId = inviterConnection.id;
        receiverConnectionId = receiverConnection.id;
        const registerDefinitionResult = yield agent.modules.anoncreds.registerCredentialDefinition({
            credentialDefinition: {
                issuerId: fixtures_1.testAnonCredsSchema.schema.issuerId,
                schemaId: fixtures_1.testAnonCredsSchema.schemaId,
                tag: 'test',
            },
            options: {
                supportRevocation: false,
            },
        });
        if (registerDefinitionResult.credentialDefinitionState.state !== 'finished') {
            throw new Error('Credential definition registration failed');
        }
        credentialDefinitionId = registerDefinitionResult.credentialDefinitionState.credentialDefinitionId;
        const offerReceived = (0, rxjs_1.firstValueFrom)(agent.events.observable(core_1.CredentialEventTypes.CredentialStateChanged).pipe((0, rxjs_1.filter)((event) => event.payload.credentialRecord.role === core_1.CredentialRole.Holder &&
            event.payload.credentialRecord.connectionId === receiverConnectionId &&
            event.payload.credentialRecord.state === core_1.CredentialState.OfferReceived), (0, rxjs_1.first)(), (0, rxjs_1.timeout)(10000)));
        const offered = yield agent.credentials.offerCredential({
            protocolVersion: 'v2',
            autoAcceptCredential: core_1.AutoAcceptCredential.ContentApproved,
            connectionId: inviterConnectionId,
            credentialFormats: {
                anoncreds: {
                    credentialDefinitionId,
                    attributes: [
                        {
                            name: 'prop1',
                            value: 'Alice',
                        },
                        {
                            name: 'prop2',
                            value: 'Bob',
                        },
                    ],
                },
            },
        });
        yield offerReceived;
        const [received] = yield agent.credentials.findAllByQuery({
            state: core_1.CredentialState.OfferReceived,
            threadId: offered.threadId,
        });
        const credentialIssued = (0, rxjs_1.firstValueFrom)(agent.events.observable(core_1.CredentialEventTypes.CredentialStateChanged).pipe((0, rxjs_1.filter)((event) => event.payload.credentialRecord.role === core_1.CredentialRole.Issuer &&
            event.payload.credentialRecord.connectionId === inviterConnectionId &&
            event.payload.credentialRecord.state === core_1.CredentialState.Done), (0, rxjs_1.first)(), (0, rxjs_1.timeout)(10000)));
        yield agent.credentials.acceptOffer({
            credentialRecordId: received.id,
        });
        yield credentialIssued;
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    test('Request proof', () => __awaiter(void 0, void 0, void 0, function* () {
        const requestReceived = (0, rxjs_1.firstValueFrom)(agent.events.observable(core_1.ProofEventTypes.ProofStateChanged).pipe((0, rxjs_1.filter)((event) => event.payload.proofRecord.role === core_1.ProofRole.Prover &&
            event.payload.proofRecord.connectionId === receiverConnectionId &&
            event.payload.proofRecord.state === core_1.ProofState.RequestReceived), (0, rxjs_1.first)(), (0, rxjs_1.timeout)(10000)));
        const response = yield (0, supertest_1.default)(app)
            .post(`/didcomm/proofs/request-proof`)
            .send({
            connectionId: inviterConnectionId,
            protocolVersion: 'v2',
            proofFormats: {
                anoncreds: {
                    name: 'proof',
                    version: '1.0',
                    requested_attributes: {
                        prop1: {
                            name: 'prop1',
                            restrictions: [
                                {
                                    cred_def_id: credentialDefinitionId,
                                },
                            ],
                        },
                    },
                },
            },
            autoAcceptProof: 'contentApproved',
        });
        expect(response.statusCode).toBe(200);
        // Wait for request to be received
        yield requestReceived;
        const receiverExchangeResponse = yield (0, supertest_1.default)(app).get(`/didcomm/proofs`).query({
            state: core_1.ProofState.RequestReceived,
            threadId: response.body.threadId,
        });
        expect(receiverExchangeResponse.statusCode).toBe(200);
        expect(receiverExchangeResponse.body).toHaveLength(1);
        const proofAcked = (0, rxjs_1.firstValueFrom)(agent.events.observable(core_1.ProofEventTypes.ProofStateChanged).pipe((0, rxjs_1.filter)((event) => event.payload.proofRecord.role === core_1.ProofRole.Prover &&
            event.payload.proofRecord.connectionId === receiverConnectionId &&
            event.payload.proofRecord.state === core_1.ProofState.Done), (0, rxjs_1.first)(), (0, rxjs_1.timeout)(10000)));
        const acceptResponse = yield (0, supertest_1.default)(app)
            .post(`/didcomm/proofs/${receiverExchangeResponse.body[0].id}/accept-request`)
            .send({});
        expect(acceptResponse.statusCode).toBe(200);
        yield proofAcked;
        const formatData = yield (0, supertest_1.default)(app).get(`/didcomm/proofs/${receiverExchangeResponse.body[0].id}/format-data`);
        expect(formatData.body).toEqual({
            request: {
                anoncreds: {
                    name: 'proof',
                    version: '1.0',
                    nonce: expect.any(String),
                    requested_attributes: {
                        prop1: {
                            restrictions: [
                                {
                                    cred_def_id: 'credential-definition:_p5hLM-uQa1zWnn3tBlSZjLHN3_jrHOq48HZg9x0WNU',
                                },
                            ],
                            name: 'prop1',
                        },
                    },
                    requested_predicates: {},
                },
            },
            presentation: {
                anoncreds: {
                    proof: {
                        proofs: [
                            {
                                primary_proof: {
                                    eq_proof: {
                                        revealed_attrs: {
                                            prop1: expect.any(String),
                                        },
                                        a_prime: expect.any(String),
                                        e: expect.any(String),
                                        v: expect.any(String),
                                        m: {
                                            prop2: expect.any(String),
                                            master_secret: expect.any(String),
                                        },
                                        m2: expect.any(String),
                                    },
                                    ge_proofs: [],
                                },
                                non_revoc_proof: null,
                            },
                        ],
                        aggregated_proof: {
                            c_hash: expect.any(String),
                            c_list: [expect.any(Array)],
                        },
                    },
                    requested_proof: {
                        revealed_attrs: {
                            prop1: {
                                sub_proof_index: 0,
                                raw: 'Alice',
                                encoded: '27034640024117331033063128044004318218486816931520886405535659934417438781507',
                            },
                        },
                        self_attested_attrs: {},
                        unrevealed_attrs: {},
                        predicates: {},
                    },
                    identifiers: [
                        {
                            schema_id: 'schema:gSl0JkGIcmRif593Q6XYGsJndHGOzm1jWRFa-Lwrz9o',
                            cred_def_id: 'credential-definition:_p5hLM-uQa1zWnn3tBlSZjLHN3_jrHOq48HZg9x0WNU',
                            rev_reg_id: null,
                            timestamp: null,
                        },
                    ],
                },
            },
        });
    }));
});
