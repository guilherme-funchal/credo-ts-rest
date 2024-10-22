"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const helpers_1 = require("../../../../../../tests/helpers");
const Agent_1 = require("../../../../../agent/Agent");
const testModule = __importStar(require("../cache"));
const agentConfig = (0, helpers_1.getAgentConfig)('Migration Cache 0.3.1-0.4');
const agentContext = (0, helpers_1.getAgentContext)();
const storageService = {
    getAll: jest.fn(),
    deleteById: jest.fn(),
};
jest.mock('../../../../../agent/Agent', () => {
    return {
        Agent: jest.fn(() => ({
            config: agentConfig,
            context: agentContext,
            dependencyManager: {
                resolve: jest.fn(() => storageService),
            },
        })),
    };
});
// Mock typed object
const AgentMock = Agent_1.Agent;
describe('0.3.1-0.4 | Cache', () => {
    let agent;
    beforeEach(() => {
        agent = new AgentMock();
    });
    describe('migrateCacheToV0_4()', () => {
        it('should fetch all cache records and remove them ', () => __awaiter(void 0, void 0, void 0, function* () {
            const records = [{ id: 'first' }, { id: 'second' }];
            (0, helpers_1.mockFunction)(storageService.getAll).mockResolvedValue(records);
            yield testModule.migrateCacheToV0_4(agent);
            expect(storageService.getAll).toHaveBeenCalledTimes(1);
            expect(storageService.getAll).toHaveBeenCalledWith(agent.context, expect.anything());
            expect(storageService.deleteById).toHaveBeenCalledTimes(2);
            const [, , firstId] = (0, helpers_1.mockFunction)(storageService.deleteById).mock.calls[0];
            const [, , secondId] = (0, helpers_1.mockFunction)(storageService.deleteById).mock.calls[1];
            expect(firstId).toEqual('first');
            expect(secondId).toEqual('second');
        }));
    });
});
