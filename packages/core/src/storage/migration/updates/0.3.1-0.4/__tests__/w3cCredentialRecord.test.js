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
const vc_1 = require("../../../../../modules/vc");
const fixtures_1 = require("../../../../../modules/vc/data-integrity/__tests__/fixtures");
const utils_1 = require("../../../../../utils");
const testModule = __importStar(require("../w3cCredentialRecord"));
const agentConfig = (0, helpers_1.getAgentConfig)('Migration W3cCredentialRecord 0.3.1-0.4');
const agentContext = (0, helpers_1.getAgentContext)();
const repository = {
    getAll: jest.fn(),
    update: jest.fn(),
};
jest.mock('../../../../../agent/Agent', () => {
    return {
        Agent: jest.fn(() => ({
            config: agentConfig,
            context: agentContext,
            dependencyManager: {
                resolve: jest.fn(() => repository),
            },
        })),
    };
});
// Mock typed object
const AgentMock = Agent_1.Agent;
describe('0.3.1-0.4 | W3cCredentialRecord', () => {
    let agent;
    beforeEach(() => {
        agent = new AgentMock();
    });
    describe('migrateW3cCredentialRecordToV0_4()', () => {
        it('should fetch all w3c credential records and re-save them', () => __awaiter(void 0, void 0, void 0, function* () {
            const records = [
                new vc_1.W3cCredentialRecord({
                    tags: {},
                    id: '3b3cf6ca-fa09-4498-b891-e280fbbb7fa7',
                    credential: utils_1.JsonTransformer.fromJSON(fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED, vc_1.W3cJsonLdVerifiableCredential),
                }),
            ];
            (0, helpers_1.mockFunction)(repository.getAll).mockResolvedValue(records);
            yield testModule.migrateW3cCredentialRecordToV0_4(agent);
            expect(repository.getAll).toHaveBeenCalledTimes(1);
            expect(repository.getAll).toHaveBeenCalledWith(agent.context);
            expect(repository.update).toHaveBeenCalledTimes(1);
            const [, record] = (0, helpers_1.mockFunction)(repository.update).mock.calls[0];
            expect(record.getTags().claimFormat).toEqual('ldp_vc');
        }));
    });
});
