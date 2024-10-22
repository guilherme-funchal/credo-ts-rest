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
describe('BasicMessagesController', () => {
    const app = (0, express_1.default)();
    let agent;
    let inviterConnectionId;
    let receiverConnectionId;
    let credentialDefinitionId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = yield (0, helpers_1.getTestAgent)('DIDComm Credentials REST Agent Test');
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
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    test('Issue credential', () => __awaiter(void 0, void 0, void 0, function* () {
        const offerReceived = (0, rxjs_1.firstValueFrom)(agent.events.observable(core_1.CredentialEventTypes.CredentialStateChanged).pipe((0, rxjs_1.filter)((event) => event.payload.credentialRecord.role === core_1.CredentialRole.Holder &&
            event.payload.credentialRecord.connectionId === receiverConnectionId &&
            event.payload.credentialRecord.state === core_1.CredentialState.OfferReceived), (0, rxjs_1.first)(), (0, rxjs_1.timeout)(10000)));
        const response = yield (0, supertest_1.default)(app)
            .post(`/didcomm/credentials/offer-credential`)
            .send({
            connectionId: inviterConnectionId,
            protocolVersion: 'v2',
            credentialFormats: {
                anoncreds: {
                    credentialDefinitionId: credentialDefinitionId,
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
            autoAcceptCredential: 'contentApproved',
        });
        expect(response.statusCode).toBe(200);
        // Wait for offer to be received
        yield offerReceived;
        const receiverExchangeResponse = yield (0, supertest_1.default)(app).get(`/didcomm/credentials`).query({
            state: core_1.CredentialState.OfferReceived,
            threadId: response.body.threadId,
        });
        expect(receiverExchangeResponse.statusCode).toBe(200);
        expect(receiverExchangeResponse.body).toHaveLength(1);
        const credentialIssued = (0, rxjs_1.firstValueFrom)(agent.events.observable(core_1.CredentialEventTypes.CredentialStateChanged).pipe((0, rxjs_1.filter)((event) => event.payload.credentialRecord.role === core_1.CredentialRole.Issuer &&
            event.payload.credentialRecord.connectionId === inviterConnectionId &&
            event.payload.credentialRecord.state === core_1.CredentialState.Done), (0, rxjs_1.first)(), (0, rxjs_1.timeout)(10000)));
        const acceptResponse = yield (0, supertest_1.default)(app)
            .post(`/didcomm/credentials/${receiverExchangeResponse.body[0].id}/accept-offer`)
            .send({});
        expect(acceptResponse.statusCode).toBe(200);
        yield credentialIssued;
        const formatData = yield (0, supertest_1.default)(app).get(`/didcomm/credentials/${receiverExchangeResponse.body[0].id}/format-data`);
        expect(formatData.body).toEqual({
            credential: {
                anoncreds: {
                    cred_def_id: 'credential-definition:_p5hLM-uQa1zWnn3tBlSZjLHN3_jrHOq48HZg9x0WNU',
                    rev_reg: null,
                    rev_reg_id: null,
                    schema_id: 'schema:gSl0JkGIcmRif593Q6XYGsJndHGOzm1jWRFa-Lwrz9o',
                    signature: {
                        p_credential: expect.any(Object),
                        r_credential: null,
                    },
                    signature_correctness_proof: {
                        c: expect.any(String),
                        se: expect.any(String),
                    },
                    values: {
                        prop1: {
                            encoded: '27034640024117331033063128044004318218486816931520886405535659934417438781507',
                            raw: 'Alice',
                        },
                        prop2: {
                            encoded: '93006290325627508022776103386395994712401809437930957652111221015872244345185',
                            raw: 'Bob',
                        },
                    },
                    witness: null,
                },
            },
            offer: {
                anoncreds: {
                    cred_def_id: 'credential-definition:_p5hLM-uQa1zWnn3tBlSZjLHN3_jrHOq48HZg9x0WNU',
                    key_correctness_proof: {
                        c: expect.any(String),
                        xr_cap: expect.arrayContaining([
                            ['master_secret', expect.any(String)],
                            ['prop1', expect.any(String)],
                            ['prop2', expect.any(String)],
                        ]),
                        xz_cap: expect.any(String),
                    },
                    nonce: expect.any(String),
                    schema_id: 'schema:gSl0JkGIcmRif593Q6XYGsJndHGOzm1jWRFa-Lwrz9o',
                },
            },
            offerAttributes: [
                {
                    'mime-type': 'text/plain',
                    name: 'prop1',
                    value: 'Alice',
                },
                {
                    'mime-type': 'text/plain',
                    name: 'prop2',
                    value: 'Bob',
                },
            ],
            request: {
                anoncreds: {
                    blinded_ms: {
                        committed_attributes: {},
                        hidden_attributes: ['master_secret'],
                        u: expect.any(String),
                        ur: null,
                    },
                    blinded_ms_correctness_proof: {
                        c: expect.any(String),
                        m_caps: {
                            master_secret: expect.any(String),
                        },
                        r_caps: {},
                        v_dash_cap: expect.any(String),
                    },
                    cred_def_id: 'credential-definition:_p5hLM-uQa1zWnn3tBlSZjLHN3_jrHOq48HZg9x0WNU',
                    entropy: expect.any(String),
                    nonce: expect.any(String),
                },
            },
        });
    }));
});
