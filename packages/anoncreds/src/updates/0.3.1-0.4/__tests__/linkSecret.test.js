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
const Agent_1 = require("../../../../../core/src/agent/Agent");
const tests_1 = require("../../../../../core/tests");
const repository_1 = require("../../../repository");
const AnonCredsLinkSecretRepository_1 = require("../../../repository/AnonCredsLinkSecretRepository");
const testModule = __importStar(require("../linkSecret"));
const agentConfig = (0, tests_1.getAgentConfig)('AnonCreds Migration - Link Secret - 0.3.1-0.4.0');
const agentContext = (0, tests_1.getAgentContext)();
jest.mock('../../../repository/AnonCredsLinkSecretRepository');
const AnonCredsLinkSecretRepositoryMock = AnonCredsLinkSecretRepository_1.AnonCredsLinkSecretRepository;
const linkSecretRepository = new AnonCredsLinkSecretRepositoryMock();
jest.mock('../../../../../core/src/agent/Agent', () => {
    return {
        Agent: jest.fn(() => ({
            config: agentConfig,
            context: agentContext,
            wallet: {
                walletConfig: {
                    id: 'wallet-id',
                },
            },
            dependencyManager: {
                resolve: jest.fn(() => linkSecretRepository),
            },
        })),
    };
});
// Mock typed object
const AgentMock = Agent_1.Agent;
describe('0.3.1-0.4.0 | AnonCreds Migration | Link Secret', () => {
    let agent;
    beforeEach(() => {
        agent = new AgentMock();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('migrateLinkSecretToV0_4()', () => {
        test('creates default link secret record based on wallet id if no default link secret exists', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, tests_1.mockFunction)(linkSecretRepository.findDefault).mockResolvedValue(null);
            yield testModule.migrateLinkSecretToV0_4(agent);
            expect(linkSecretRepository.findDefault).toHaveBeenCalledTimes(1);
            expect(linkSecretRepository.save).toHaveBeenCalledTimes(1);
            const [, linkSecretRecord] = (0, tests_1.mockFunction)(linkSecretRepository.save).mock.calls[0];
            expect(linkSecretRecord.toJSON()).toMatchObject({
                linkSecretId: 'wallet-id',
            });
            expect(linkSecretRecord.getTags()).toMatchObject({
                isDefault: true,
            });
        }));
        test('does not create default link secret record if default link secret record already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, tests_1.mockFunction)(linkSecretRepository.findDefault).mockResolvedValue(new repository_1.AnonCredsLinkSecretRecord({
                linkSecretId: 'some-link-secret-id',
            }));
            yield testModule.migrateLinkSecretToV0_4(agent);
            expect(linkSecretRepository.findDefault).toHaveBeenCalledTimes(1);
            expect(linkSecretRepository.update).toHaveBeenCalledTimes(0);
        }));
    });
});
