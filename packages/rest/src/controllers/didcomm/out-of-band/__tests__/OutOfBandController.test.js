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
const crypto_1 = require("crypto");
const express_1 = __importDefault(require("express"));
const rxjs_1 = require("rxjs");
const supertest_1 = __importDefault(require("supertest"));
const helpers_1 = require("../../../../../tests/utils/helpers");
const setupApp_1 = require("../../../../setup/setupApp");
describe('OutOfBandController', () => {
    const app = (0, express_1.default)();
    let agent;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = yield (0, helpers_1.getTestAgent)('DIDComm Out Of Band REST Agent Test');
        yield (0, setupApp_1.setupApp)({ agent, adminPort: 3000, baseApp: app });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    test('Create connection using oob', () => __awaiter(void 0, void 0, void 0, function* () {
        const alias = (0, crypto_1.randomUUID)();
        const connectionCreated = (0, rxjs_1.firstValueFrom)(agent.events.observable(core_1.ConnectionEventTypes.ConnectionStateChanged).pipe((0, rxjs_1.filter)((event) => event.payload.connectionRecord.alias === alias &&
            event.payload.connectionRecord.state === core_1.DidExchangeState.Completed), (0, rxjs_1.first)(), (0, rxjs_1.timeout)(10000)));
        const createResponse = yield (0, supertest_1.default)(app).post(`/didcomm/out-of-band/create-invitation`).send({
            alias,
        });
        expect(createResponse.statusCode).toBe(200);
        const receiveResponse = yield (0, supertest_1.default)(app).post(`/didcomm/out-of-band/receive-invitation`).send({
            invitation: createResponse.body.invitationUrl,
        });
        expect(receiveResponse.statusCode).toBe(200);
        yield connectionCreated;
    }));
});
