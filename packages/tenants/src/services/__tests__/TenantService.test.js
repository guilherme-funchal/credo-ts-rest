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
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aries-framework/core");
const helpers_1 = require("../../../../core/tests/helpers");
const repository_1 = require("../../repository");
const TenantRepository_1 = require("../../repository/TenantRepository");
const TenantRoutingRepository_1 = require("../../repository/TenantRoutingRepository");
const TenantRecordService_1 = require("../TenantRecordService");
jest.mock('../../repository/TenantRepository');
const TenantRepositoryMock = TenantRepository_1.TenantRepository;
jest.mock('../../repository/TenantRoutingRepository');
const TenantRoutingRepositoryMock = TenantRoutingRepository_1.TenantRoutingRepository;
const wallet = {
    generateWalletKey: jest.fn(() => Promise.resolve('walletKey')),
};
const tenantRepository = new TenantRepositoryMock();
const tenantRoutingRepository = new TenantRoutingRepositoryMock();
const agentContext = (0, helpers_1.getAgentContext)({ wallet });
const tenantRecordService = new TenantRecordService_1.TenantRecordService(tenantRepository, tenantRoutingRepository);
describe('TenantRecordService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('createTenant', () => {
        test('creates a tenant record and stores it in the tenant repository', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantRecord = yield tenantRecordService.createTenant(agentContext, {
                label: 'Test Tenant',
                connectionImageUrl: 'https://example.com/connection.png',
            });
            expect(tenantRecord).toMatchObject({
                id: expect.any(String),
                config: {
                    label: 'Test Tenant',
                    connectionImageUrl: 'https://example.com/connection.png',
                    walletConfig: {
                        id: expect.any(String),
                        key: 'walletKey',
                    },
                },
            });
            expect(agentContext.wallet.generateWalletKey).toHaveBeenCalled();
            expect(tenantRepository.save).toHaveBeenCalledWith(agentContext, tenantRecord);
        }));
    });
    describe('getTenantById', () => {
        test('returns value from tenant repository get by id', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantRecord = jest.fn();
            (0, helpers_1.mockFunction)(tenantRepository.getById).mockResolvedValue(tenantRecord);
            const returnedTenantRecord = yield tenantRecordService.getTenantById(agentContext, 'tenantId');
            expect(returnedTenantRecord).toBe(tenantRecord);
        }));
    });
    describe('deleteTenantById', () => {
        test('retrieves the tenant record and calls delete on the tenant repository', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantRecord = new repository_1.TenantRecord({
                id: 'tenant-id',
                config: {
                    label: 'Test Tenant',
                    walletConfig: {
                        id: 'tenant-wallet-id',
                        key: 'tenant-wallet-key',
                    },
                },
            });
            (0, helpers_1.mockFunction)(tenantRepository.getById).mockResolvedValue(tenantRecord);
            (0, helpers_1.mockFunction)(tenantRoutingRepository.findByQuery).mockResolvedValue([]);
            yield tenantRecordService.deleteTenantById(agentContext, 'tenant-id');
            expect(tenantRepository.delete).toHaveBeenCalledWith(agentContext, tenantRecord);
        }));
        test('deletes associated tenant routing records', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantRecord = new repository_1.TenantRecord({
                id: 'tenant-id',
                config: {
                    label: 'Test Tenant',
                    walletConfig: {
                        id: 'tenant-wallet-id',
                        key: 'tenant-wallet-key',
                    },
                },
            });
            const tenantRoutingRecords = [
                new repository_1.TenantRoutingRecord({
                    recipientKeyFingerprint: '1',
                    tenantId: 'tenant-id',
                }),
                new repository_1.TenantRoutingRecord({
                    recipientKeyFingerprint: '2',
                    tenantId: 'tenant-id',
                }),
            ];
            (0, helpers_1.mockFunction)(tenantRepository.getById).mockResolvedValue(tenantRecord);
            (0, helpers_1.mockFunction)(tenantRoutingRepository.findByQuery).mockResolvedValue(tenantRoutingRecords);
            yield tenantRecordService.deleteTenantById(agentContext, 'tenant-id');
            expect(tenantRoutingRepository.findByQuery).toHaveBeenCalledWith(agentContext, {
                tenantId: 'tenant-id',
            });
            expect(tenantRoutingRepository.delete).toHaveBeenCalledTimes(2);
            expect(tenantRoutingRepository.delete).toHaveBeenNthCalledWith(1, agentContext, tenantRoutingRecords[0]);
            expect(tenantRoutingRepository.delete).toHaveBeenNthCalledWith(2, agentContext, tenantRoutingRecords[1]);
        }));
    });
    describe('findTenantRoutingRecordByRecipientKey', () => {
        test('returns value from tenant routing repository findByRecipientKey', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantRoutingRecord = jest.fn();
            (0, helpers_1.mockFunction)(tenantRoutingRepository.findByRecipientKey).mockResolvedValue(tenantRoutingRecord);
            const recipientKey = core_1.Key.fromFingerprint('z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL');
            const returnedTenantRoutingRecord = yield tenantRecordService.findTenantRoutingRecordByRecipientKey(agentContext, recipientKey);
            expect(tenantRoutingRepository.findByRecipientKey).toHaveBeenCalledWith(agentContext, recipientKey);
            expect(returnedTenantRoutingRecord).toBe(tenantRoutingRecord);
        }));
    });
    describe('addTenantRoutingRecord', () => {
        test('creates a tenant routing record and stores it in the tenant routing repository', () => __awaiter(void 0, void 0, void 0, function* () {
            const recipientKey = core_1.Key.fromFingerprint('z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL');
            const tenantRoutingRecord = yield tenantRecordService.addTenantRoutingRecord(agentContext, 'tenant-id', recipientKey);
            expect(tenantRoutingRepository.save).toHaveBeenCalledWith(agentContext, tenantRoutingRecord);
            expect(tenantRoutingRecord).toMatchObject({
                id: expect.any(String),
                tenantId: 'tenant-id',
                recipientKeyFingerprint: 'z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
            });
        }));
    });
});
