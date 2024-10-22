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
const CredentialRepository_1 = require("../../../../../core/src/modules/credentials/repository/CredentialRepository");
const tests_1 = require("../../../../../core/tests");
const credentialExchangeRecord_1 = require("../credentialExchangeRecord");
const testModule = __importStar(require("../credentialExchangeRecord"));
const agentConfig = (0, tests_1.getAgentConfig)('AnonCreds Migration - Credential Exchange Record - 0.3.1-0.4.0');
const agentContext = (0, tests_1.getAgentContext)();
jest.mock('../../../../../core/src/modules/credentials/repository/CredentialRepository');
const CredentialRepositoryMock = CredentialRepository_1.CredentialRepository;
const credentialRepository = new CredentialRepositoryMock();
jest.mock('../../../../../core/src/agent/Agent', () => {
    return {
        Agent: jest.fn(() => ({
            config: agentConfig,
            context: agentContext,
            dependencyManager: {
                resolve: jest.fn(() => credentialRepository),
            },
        })),
    };
});
// Mock typed object
const AgentMock = Agent_1.Agent;
describe('0.3.1-0.4.0 | AnonCreds Migration | Credential Exchange Record', () => {
    let agent;
    beforeEach(() => {
        agent = new AgentMock();
    });
    describe('migrateCredentialExchangeRecordToV0_4()', () => {
        it('should fetch all records and apply the needed updates ', () => __awaiter(void 0, void 0, void 0, function* () {
            const records = [
                getCredentialRecord({
                    metadata: {
                        '_internal/indyCredential': { some: 'value' },
                        '_internal/indyRequest': { nonce: 'nonce', master_secret_name: 'ms', master_secret_blinding_data: 'msbd' },
                    },
                    credentials: [
                        {
                            credentialRecordId: 'credential-id',
                            credentialRecordType: 'indy',
                        },
                        {
                            credentialRecordId: 'credential-id2',
                            credentialRecordType: 'jsonld',
                        },
                    ],
                }),
            ];
            (0, tests_1.mockFunction)(credentialRepository.getAll).mockResolvedValue(records);
            yield testModule.migrateCredentialExchangeRecordToV0_4(agent);
            expect(credentialRepository.getAll).toHaveBeenCalledTimes(1);
            expect(credentialRepository.update).toHaveBeenCalledTimes(1);
            const [, credentialRecord] = (0, tests_1.mockFunction)(credentialRepository.update).mock.calls[0];
            expect(credentialRecord.toJSON()).toMatchObject({
                metadata: {
                    '_anoncreds/credential': { some: 'value' },
                    '_anoncreds/credentialRequest': { nonce: 'nonce', link_secret_name: 'ms', link_secret_blinding_data: 'msbd' },
                },
                credentials: [
                    {
                        credentialRecordId: 'credential-id',
                        credentialRecordType: 'anoncreds',
                    },
                    {
                        credentialRecordId: 'credential-id2',
                        credentialRecordType: 'jsonld',
                    },
                ],
            });
        }));
    });
    describe('migrateIndyCredentialMetadataToAnonCredsMetadata()', () => {
        test('updates indy metadata to anoncreds metadata', () => {
            const record = getCredentialRecord({
                metadata: {
                    '_internal/indyCredential': { some: 'value' },
                    '_internal/indyRequest': { nonce: 'nonce', master_secret_name: 'ms', master_secret_blinding_data: 'msbd' },
                },
            });
            (0, credentialExchangeRecord_1.migrateIndyCredentialMetadataToAnonCredsMetadata)(agent, record);
            expect(record.toJSON()).toMatchObject({
                metadata: {
                    '_anoncreds/credential': { some: 'value' },
                    '_anoncreds/credentialRequest': { nonce: 'nonce', link_secret_name: 'ms', link_secret_blinding_data: 'msbd' },
                },
            });
        });
    });
    describe('migrateIndyCredentialTypeToAnonCredsCredential()', () => {
        test('updates indy credential record binding to anoncreds binding', () => {
            const record = getCredentialRecord({
                credentials: [
                    {
                        credentialRecordId: 'credential-id',
                        credentialRecordType: 'indy',
                    },
                    {
                        credentialRecordId: 'credential-id2',
                        credentialRecordType: 'jsonld',
                    },
                ],
            });
            (0, credentialExchangeRecord_1.migrateIndyCredentialTypeToAnonCredsCredential)(agent, record);
            expect(record.toJSON()).toMatchObject({
                credentials: [
                    {
                        credentialRecordId: 'credential-id',
                        credentialRecordType: 'anoncreds',
                    },
                    {
                        credentialRecordId: 'credential-id2',
                        credentialRecordType: 'jsonld',
                    },
                ],
            });
        });
    });
});
function getCredentialRecord({ id, metadata, credentials, }) {
    return src_1.JsonTransformer.fromJSON({
        id: id !== null && id !== void 0 ? id : 'credential-id',
        metadata,
        credentials,
    }, src_1.CredentialExchangeRecord);
}
