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
const TenantRoutingRecord_1 = require("../TenantRoutingRecord");
const TenantRoutingRepository_1 = require("../TenantRoutingRepository");
const storageServiceMock = {
    findByQuery: jest.fn(),
};
const eventEmitter = jest.fn();
const agentContext = (0, helpers_1.getAgentContext)();
const tenantRoutingRepository = new TenantRoutingRepository_1.TenantRoutingRepository(storageServiceMock, eventEmitter);
describe('TenantRoutingRepository', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('findByRecipientKey', () => {
        test('it should correctly transform the key to a fingerprint and return the routing record', () => __awaiter(void 0, void 0, void 0, function* () {
            const key = core_1.Key.fromFingerprint('z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL');
            const tenantRoutingRecord = new TenantRoutingRecord_1.TenantRoutingRecord({
                recipientKeyFingerprint: key.fingerprint,
                tenantId: 'tenant-id',
            });
            (0, helpers_1.mockFunction)(storageServiceMock.findByQuery).mockResolvedValue([tenantRoutingRecord]);
            const returnedRecord = yield tenantRoutingRepository.findByRecipientKey(agentContext, key);
            expect(storageServiceMock.findByQuery).toHaveBeenCalledWith(agentContext, TenantRoutingRecord_1.TenantRoutingRecord, {
                recipientKeyFingerprint: 'z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
            });
            expect(returnedRecord).toBe(tenantRoutingRecord);
        }));
    });
});
