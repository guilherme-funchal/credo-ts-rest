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
describe('BasicMessagesController', () => {
    const app = (0, express_1.default)();
    let agent;
    let inviterConnectionId;
    let receiverConnectionId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = yield (0, helpers_1.getTestAgent)('Basic Message REST Agent Test');
        yield (0, setupApp_1.setupApp)({ agent, adminPort: 3000, baseApp: app });
        const inviterOutOfBandRecord = yield agent.oob.createInvitation();
        let { connectionRecord: receiverConnection } = yield agent.oob.receiveInvitation(inviterOutOfBandRecord.outOfBandInvitation);
        receiverConnection = yield agent.connections.returnWhenIsConnected(receiverConnection.id);
        const [inviterConnection] = yield agent.connections.findAllByOutOfBandId(inviterOutOfBandRecord.id);
        inviterConnectionId = inviterConnection.id;
        receiverConnectionId = receiverConnection.id;
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    describe('Send basic message to connection', () => {
        test('should return 200 when message is sent', () => __awaiter(void 0, void 0, void 0, function* () {
            const messageReceived = (0, rxjs_1.firstValueFrom)(agent.events.observable(core_1.BasicMessageEventTypes.BasicMessageStateChanged).pipe((0, rxjs_1.filter)((event) => event.payload.basicMessageRecord.role === core_1.BasicMessageRole.Receiver &&
                event.payload.basicMessageRecord.connectionId === receiverConnectionId), (0, rxjs_1.first)(), (0, rxjs_1.timeout)(10000)));
            const response = yield (0, supertest_1.default)(app)
                .post(`/didcomm/basic-messages/send`)
                .send({ content: 'Hello!', connectionId: inviterConnectionId });
            expect(response.statusCode).toBe(200);
            yield messageReceived;
        }));
        test('should give 404 not found when connection is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post(`/basic-messages`)
                .send({ content: 'Hello!', connectionId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' });
            expect(response.statusCode).toBe(404);
        }));
    });
    describe('Get basic messages', () => {
        test('should return list of basic messages filtered by connection id', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get(`/didcomm/basic-messages`).query({ connectionId: inviterConnectionId });
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual([
                {
                    connectionId: inviterConnectionId,
                    content: 'Hello!',
                    createdAt: expect.any(String),
                    id: expect.any(String),
                    role: 'sender',
                    sentTime: expect.any(String),
                    threadId: expect.any(String),
                    type: 'BasicMessageRecord',
                    updatedAt: expect.any(String),
                },
            ]);
        }));
    });
});
