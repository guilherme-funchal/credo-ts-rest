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
const core_1 = require("@credo-ts/core");
const src_1 = require("../src");
const ConnectionsControllerTypes_1 = require("../src/controllers/didcomm/connections/ConnectionsControllerTypes");
const CredentialsControllerTypes_1 = require("../src/controllers/didcomm/credentials/CredentialsControllerTypes");
const ProofsControllerTypes_1 = require("../src/controllers/didcomm/proofs/ProofsControllerTypes");
const helpers_1 = require("./utils/helpers");
const webhook_1 = require("./utils/webhook");
describe('WebhookTests', () => {
    let agent;
    let server;
    const webhooks = [];
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = yield (0, helpers_1.getTestAgent)('Webhook REST Agent Test');
        server = yield (0, webhook_1.webhookListener)(3044, webhooks);
        yield (0, src_1.setupApp)({
            agent: agent,
            adminPort: 3042,
            webhookUrl: 'http://localhost:3044',
        });
    }));
    test('should return a webhook event when basic message state changed', () => __awaiter(void 0, void 0, void 0, function* () {
        const basicMessageRecord = new core_1.BasicMessageRecord({
            id: '8220e065-d884-4df4-88d8-9c33e9b2f788',
            connectionId: 'random',
            content: 'Hello!',
            role: core_1.BasicMessageRole.Sender,
            sentTime: 'now',
            threadId: 'randomt',
        });
        agent.events.emit(agent.context, {
            type: core_1.BasicMessageEventTypes.BasicMessageStateChanged,
            payload: {
                message: new core_1.BasicMessage({
                    content: 'Hello!',
                }),
                basicMessageRecord,
            },
        });
        const webhook = yield (0, webhook_1.waitForHook)(webhooks, (webhook) => webhook.body.type === core_1.BasicMessageEventTypes.BasicMessageStateChanged);
        expect(webhook === null || webhook === void 0 ? void 0 : webhook.body).toMatchObject({
            payload: {
                basicMessageRecord: {
                    threadId: 'randomt',
                    role: core_1.BasicMessageRole.Sender,
                },
            },
        });
    }));
    test('should return a webhook event when connection state changed', () => __awaiter(void 0, void 0, void 0, function* () {
        const connectionRecord = new core_1.ConnectionRecord({
            id: '8220e065-d884-4df4-88d8-9c33e9b2f788',
            role: core_1.DidExchangeRole.Requester,
            state: core_1.DidExchangeState.Completed,
            alias: 'test',
        });
        agent.events.emit(agent.context, {
            type: core_1.ConnectionEventTypes.ConnectionStateChanged,
            payload: {
                previousState: null,
                connectionRecord,
            },
        });
        const webhook = yield (0, webhook_1.waitForHook)(webhooks, (webhook) => webhook.body.type === core_1.ConnectionEventTypes.ConnectionStateChanged &&
            webhook.body.payload.connectionRecord.id === connectionRecord.id &&
            webhook.body.payload.connectionRecord.state === connectionRecord.state);
        expect(webhook === null || webhook === void 0 ? void 0 : webhook.body).toMatchObject({
            payload: { connectionRecord: JSON.parse(JSON.stringify((0, ConnectionsControllerTypes_1.connectionRecordToApiModel)(connectionRecord))) },
        });
    }));
    test('should return a webhook event when credential state changed', () => __awaiter(void 0, void 0, void 0, function* () {
        const credentialRecord = new core_1.CredentialExchangeRecord({
            id: 'testest',
            state: core_1.CredentialState.OfferSent,
            threadId: 'random',
            protocolVersion: 'v1',
            role: core_1.CredentialRole.Holder,
        });
        agent.events.emit(agent.context, {
            type: core_1.CredentialEventTypes.CredentialStateChanged,
            payload: {
                previousState: null,
                credentialRecord,
            },
        });
        const webhook = yield (0, webhook_1.waitForHook)(webhooks, (webhook) => webhook.body.type === core_1.CredentialEventTypes.CredentialStateChanged &&
            webhook.body.payload.credentialExchange.id === credentialRecord.id &&
            webhook.body.payload.credentialExchange.state === credentialRecord.state);
        expect(webhook === null || webhook === void 0 ? void 0 : webhook.body).toMatchObject({
            payload: { credentialExchange: JSON.parse(JSON.stringify((0, CredentialsControllerTypes_1.credentialExchangeRecordToApiModel)(credentialRecord))) },
        });
    }));
    test('should return a webhook event when proof state changed', () => __awaiter(void 0, void 0, void 0, function* () {
        const proofRecord = new core_1.ProofExchangeRecord({
            id: 'testest',
            protocolVersion: 'v2',
            state: core_1.ProofState.ProposalSent,
            threadId: 'random',
            role: core_1.ProofRole.Prover,
        });
        agent.events.emit(agent.context, {
            type: core_1.ProofEventTypes.ProofStateChanged,
            payload: {
                previousState: null,
                proofRecord,
            },
        });
        const webhook = yield (0, webhook_1.waitForHook)(webhooks, (webhook) => webhook.body.type === core_1.ProofEventTypes.ProofStateChanged &&
            webhook.body.payload.proofExchange.id === proofRecord.id &&
            webhook.body.payload.proofExchange.state === proofRecord.state);
        expect(webhook === null || webhook === void 0 ? void 0 : webhook.body).toMatchObject({
            payload: { proofExchange: JSON.parse(JSON.stringify((0, ProofsControllerTypes_1.proofExchangeRecordToApiModel)(proofRecord))) },
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
        server.close();
    }));
});
