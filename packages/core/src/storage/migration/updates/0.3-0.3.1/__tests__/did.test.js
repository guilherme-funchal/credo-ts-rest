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
const agent_1 = require("../../../../../agent");
const Agent_1 = require("../../../../../agent/Agent");
const dids_1 = require("../../../../../modules/dids");
const DidRepository_1 = require("../../../../../modules/dids/repository/DidRepository");
const utils_1 = require("../../../../../utils");
const Metadata_1 = require("../../../../Metadata");
const testModule = __importStar(require("../did"));
const agentConfig = (0, helpers_1.getAgentConfig)('Migration DidRecord 0.3-0.3.1');
const agentContext = (0, helpers_1.getAgentContext)();
jest.mock('../../../../../modules/dids/repository/DidRepository');
const DidRepositoryMock = DidRepository_1.DidRepository;
const didRepository = new DidRepositoryMock();
jest.mock('../../../../../agent/Agent', () => {
    return {
        Agent: jest.fn(() => ({
            config: agentConfig,
            context: agentContext,
            dependencyManager: {
                resolve: jest.fn(() => didRepository),
            },
        })),
    };
});
// Mock typed object
const AgentMock = Agent_1.Agent;
describe('0.3-0.3.1 | Did', () => {
    let agent;
    beforeEach(() => {
        agent = new AgentMock();
    });
    describe('migrateDidRecordToV0_3_1()', () => {
        it('should fetch all records and apply the needed updates ', () => __awaiter(void 0, void 0, void 0, function* () {
            const records = [getDid({ id: 'did:peer:123' })];
            (0, helpers_1.mockFunction)(didRepository.getAll).mockResolvedValue(records);
            yield testModule.migrateDidRecordToV0_3_1(agent);
            expect(didRepository.getAll).toHaveBeenCalledTimes(1);
            expect(didRepository.save).toHaveBeenCalledTimes(1);
            const [, didRecord] = (0, helpers_1.mockFunction)(didRepository.save).mock.calls[0];
            expect(didRecord).toEqual({
                type: 'DidRecord',
                id: expect.any(String),
                did: 'did:peer:123',
                metadata: expect.any(Metadata_1.Metadata),
                role: dids_1.DidDocumentRole.Created,
                _tags: {},
            });
            expect(didRepository.deleteById).toHaveBeenCalledTimes(1);
            expect(didRepository.deleteById).toHaveBeenCalledWith(expect.any(agent_1.AgentContext), 'did:peer:123');
        }));
    });
});
function getDid({ id }) {
    return utils_1.JsonTransformer.fromJSON({
        role: dids_1.DidDocumentRole.Created,
        id,
    }, dids_1.DidRecord);
}
