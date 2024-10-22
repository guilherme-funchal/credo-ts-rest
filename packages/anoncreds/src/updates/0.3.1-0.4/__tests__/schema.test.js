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
const src_1 = require("../../../../../core/src");
const Agent_1 = require("../../../../../core/src/agent/Agent");
const tests_1 = require("../../../../../core/tests");
const repository_1 = require("../../../repository");
const AnonCredsSchemaRepository_1 = require("../../../repository/AnonCredsSchemaRepository");
const testModule = __importStar(require("../schema"));
const agentConfig = (0, tests_1.getAgentConfig)('AnonCreds Migration - Credential Exchange Record - 0.3.1-0.4.0');
const agentContext = (0, tests_1.getAgentContext)();
jest.mock('../../../repository/AnonCredsSchemaRepository');
const AnonCredsSchemaRepositoryMock = AnonCredsSchemaRepository_1.AnonCredsSchemaRepository;
const schemaRepository = new AnonCredsSchemaRepositoryMock();
jest.mock('../../../../../core/src/agent/Agent', () => {
    return {
        Agent: jest.fn(() => ({
            config: agentConfig,
            context: agentContext,
            dependencyManager: {
                resolve: jest.fn(() => schemaRepository),
            },
        })),
    };
});
// Mock typed object
const AgentMock = Agent_1.Agent;
describe('0.3.1-0.4.0 | AnonCreds Migration | Schema Record', () => {
    let agent;
    beforeEach(() => {
        agent = new AgentMock();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('migrateAnonCredsSchemaRecordToV0_4()', () => {
        it('should fetch all records and apply the needed updates', () => __awaiter(void 0, void 0, void 0, function* () {
            const records = [
                getSchemaRecord({
                    schema: {
                        attrNames: ['name', 'age'],
                        id: 'did:indy:bcovrin:test:SDqTzbVuCowusqGBNbNDjH/anoncreds/v0/SCHEMA/schema-name/1.0',
                        name: 'schema-name',
                        seqNo: 1,
                        version: '1.0',
                        ver: '1.0',
                    },
                }),
            ];
            (0, tests_1.mockFunction)(schemaRepository.getAll).mockResolvedValue(records);
            yield testModule.migrateAnonCredsSchemaRecordToV0_4(agent);
            expect(schemaRepository.getAll).toHaveBeenCalledTimes(1);
            expect(schemaRepository.update).toHaveBeenCalledTimes(1);
            const [, schemaRecord] = (0, tests_1.mockFunction)(schemaRepository.update).mock.calls[0];
            expect(schemaRecord.toJSON()).toMatchObject({
                schemaId: 'did:indy:bcovrin:test:SDqTzbVuCowusqGBNbNDjH/anoncreds/v0/SCHEMA/schema-name/1.0',
                schema: {
                    attrNames: ['name', 'age'],
                    name: 'schema-name',
                    version: '1.0',
                    issuerId: 'did:indy:bcovrin:test:SDqTzbVuCowusqGBNbNDjH',
                },
            });
        }));
        it('should skip records that are already migrated to the 0.4.0 format', () => __awaiter(void 0, void 0, void 0, function* () {
            const records = [
                getSchemaRecord({
                    schema: {
                        attrNames: ['name', 'age'],
                        name: 'schema-name',
                        version: '1.0',
                        issuerId: 'did:indy:bcovrin:test:SDqTzbVuCowusqGBNbNDjH',
                    },
                    schemaId: 'did:indy:bcovrin:test:SDqTzbVuCowusqGBNbNDjH/anoncreds/v0/SCHEMA/schema-name/1.0',
                }),
            ];
            (0, tests_1.mockFunction)(schemaRepository.getAll).mockResolvedValue(records);
            yield testModule.migrateAnonCredsSchemaRecordToV0_4(agent);
            expect(schemaRepository.getAll).toHaveBeenCalledTimes(1);
            expect(schemaRepository.update).toHaveBeenCalledTimes(0);
        }));
    });
});
function getSchemaRecord({ id, schema, schemaId, }) {
    return src_1.JsonTransformer.fromJSON({
        id: id !== null && id !== void 0 ? id : 'schema-record-id',
        schema,
        schemaId,
    }, repository_1.AnonCredsSchemaRecord);
}
