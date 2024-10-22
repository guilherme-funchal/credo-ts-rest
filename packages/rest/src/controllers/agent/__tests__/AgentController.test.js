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
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const helpers_1 = require("../../../../tests/utils/helpers");
const setupApp_1 = require("../../../setup/setupApp");
describe('AgentController', () => {
    const app = (0, express_1.default)();
    let agent;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = yield (0, helpers_1.getTestAgent)('Agent REST Agent Test');
        yield (0, setupApp_1.setupApp)({ agent, adminPort: 3000, baseApp: app });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    describe('Get agent info', () => {
        test('should return agent information', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get('/agent');
            expect(response.body).toEqual({
                isInitialized: true,
                config: {
                    label: agent.config.label,
                    endpoints: ['internal', 'http://localhost:random'],
                },
            });
            expect(response.statusCode).toBe(200);
        }));
    });
});
