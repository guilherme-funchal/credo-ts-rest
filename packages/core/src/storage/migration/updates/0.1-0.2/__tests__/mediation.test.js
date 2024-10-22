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
const routing_1 = require("../../../../../modules/routing");
const MediationRepository_1 = require("../../../../../modules/routing/repository/MediationRepository");
const utils_1 = require("../../../../../utils");
const testModule = __importStar(require("../mediation"));
const agentConfig = (0, helpers_1.getAgentConfig)('Migration MediationRecord 0.1-0.2');
const agentContext = (0, helpers_1.getAgentContext)();
jest.mock('../../../../../modules/routing/repository/MediationRepository');
const MediationRepositoryMock = MediationRepository_1.MediationRepository;
const mediationRepository = new MediationRepositoryMock();
jest.mock('../../../../../agent/Agent', () => {
    return {
        Agent: jest.fn(() => ({
            config: agentConfig,
            context: agentContext,
            dependencyManager: {
                resolve: jest.fn(() => mediationRepository),
            },
        })),
    };
});
// Mock typed object
const AgentMock = Agent_1.Agent;
describe('0.1-0.2 | Mediation', () => {
    let agent;
    beforeEach(() => {
        agent = new AgentMock();
    });
    describe('migrateMediationRecordToV0_2()', () => {
        it('should fetch all records and apply the needed updates ', () => __awaiter(void 0, void 0, void 0, function* () {
            const records = [
                getMediationRecord({
                    role: routing_1.MediationRole.Mediator,
                    endpoint: 'firstEndpoint',
                }),
                getMediationRecord({
                    role: routing_1.MediationRole.Recipient,
                    endpoint: 'secondEndpoint',
                }),
            ];
            (0, helpers_1.mockFunction)(mediationRepository.getAll).mockResolvedValue(records);
            yield testModule.migrateMediationRecordToV0_2(agent, {
                mediationRoleUpdateStrategy: 'allMediator',
            });
            expect(mediationRepository.getAll).toHaveBeenCalledTimes(1);
            expect(mediationRepository.update).toHaveBeenCalledTimes(records.length);
            // Check second object is transformed correctly
            expect(mediationRepository.update).toHaveBeenNthCalledWith(2, agentContext, getMediationRecord({
                role: routing_1.MediationRole.Mediator,
                endpoint: 'secondEndpoint',
            }));
            expect(records).toMatchObject([
                {
                    role: routing_1.MediationRole.Mediator,
                    endpoint: 'firstEndpoint',
                },
                {
                    role: routing_1.MediationRole.Mediator,
                    endpoint: 'secondEndpoint',
                },
            ]);
        }));
    });
    describe('updateMediationRole()', () => {
        it(`should update the role to ${routing_1.MediationRole.Mediator} if no endpoint exists on the record and mediationRoleUpdateStrategy is 'recipientIfEndpoint'`, () => __awaiter(void 0, void 0, void 0, function* () {
            const mediationRecord = getMediationRecord({
                role: routing_1.MediationRole.Recipient,
            });
            yield testModule.updateMediationRole(agent, mediationRecord, {
                mediationRoleUpdateStrategy: 'recipientIfEndpoint',
            });
            expect(mediationRecord).toMatchObject({
                role: routing_1.MediationRole.Mediator,
            });
        }));
        it(`should update the role to ${routing_1.MediationRole.Recipient} if an endpoint exists on the record and mediationRoleUpdateStrategy is 'recipientIfEndpoint'`, () => __awaiter(void 0, void 0, void 0, function* () {
            const mediationRecord = getMediationRecord({
                role: routing_1.MediationRole.Mediator,
                endpoint: 'something',
            });
            yield testModule.updateMediationRole(agent, mediationRecord, {
                mediationRoleUpdateStrategy: 'recipientIfEndpoint',
            });
            expect(mediationRecord).toMatchObject({
                role: routing_1.MediationRole.Recipient,
                endpoint: 'something',
            });
        }));
        it(`should not update the role if mediationRoleUpdateStrategy is 'doNotChange'`, () => __awaiter(void 0, void 0, void 0, function* () {
            const mediationRecordMediator = getMediationRecord({
                role: routing_1.MediationRole.Mediator,
                endpoint: 'something',
            });
            const mediationRecordRecipient = getMediationRecord({
                role: routing_1.MediationRole.Recipient,
                endpoint: 'something',
            });
            yield testModule.updateMediationRole(agent, mediationRecordMediator, {
                mediationRoleUpdateStrategy: 'doNotChange',
            });
            expect(mediationRecordMediator).toMatchObject({
                role: routing_1.MediationRole.Mediator,
                endpoint: 'something',
            });
            yield testModule.updateMediationRole(agent, mediationRecordRecipient, {
                mediationRoleUpdateStrategy: 'doNotChange',
            });
            expect(mediationRecordRecipient).toMatchObject({
                role: routing_1.MediationRole.Recipient,
                endpoint: 'something',
            });
        }));
        it(`should update the role to ${routing_1.MediationRole.Recipient} if mediationRoleUpdateStrategy is 'allRecipient'`, () => __awaiter(void 0, void 0, void 0, function* () {
            const mediationRecord = getMediationRecord({
                role: routing_1.MediationRole.Mediator,
                endpoint: 'something',
            });
            yield testModule.updateMediationRole(agent, mediationRecord, {
                mediationRoleUpdateStrategy: 'allRecipient',
            });
            expect(mediationRecord).toMatchObject({
                role: routing_1.MediationRole.Recipient,
                endpoint: 'something',
            });
        }));
        it(`should update the role to ${routing_1.MediationRole.Mediator} if mediationRoleUpdateStrategy is 'allMediator'`, () => __awaiter(void 0, void 0, void 0, function* () {
            const mediationRecord = getMediationRecord({
                role: routing_1.MediationRole.Recipient,
                endpoint: 'something',
            });
            yield testModule.updateMediationRole(agent, mediationRecord, {
                mediationRoleUpdateStrategy: 'allMediator',
            });
            expect(mediationRecord).toMatchObject({
                role: routing_1.MediationRole.Mediator,
                endpoint: 'something',
            });
        }));
    });
});
function getMediationRecord({ role, endpoint }) {
    return utils_1.JsonTransformer.fromJSON({
        role,
        endpoint,
    }, routing_1.MediationRecord);
}
