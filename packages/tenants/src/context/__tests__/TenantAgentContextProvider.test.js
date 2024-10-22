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
const EventEmitter_1 = require("../../../../core/src/agent/EventEmitter");
const helpers_1 = require("../../../../core/tests/helpers");
const repository_1 = require("../../repository");
const TenantRecordService_1 = require("../../services/TenantRecordService");
const TenantAgentContextProvider_1 = require("../TenantAgentContextProvider");
const TenantSessionCoordinator_1 = require("../TenantSessionCoordinator");
jest.mock('../../../../core/src/agent/EventEmitter');
jest.mock('../../services/TenantRecordService');
jest.mock('../TenantSessionCoordinator');
const EventEmitterMock = EventEmitter_1.EventEmitter;
const TenantRecordServiceMock = TenantRecordService_1.TenantRecordService;
const TenantSessionCoordinatorMock = TenantSessionCoordinator_1.TenantSessionCoordinator;
const tenantRecordService = new TenantRecordServiceMock();
const tenantSessionCoordinator = new TenantSessionCoordinatorMock();
const rootAgentContext = (0, helpers_1.getAgentContext)();
const agentConfig = (0, helpers_1.getAgentConfig)('TenantAgentContextProvider');
const eventEmitter = new EventEmitterMock();
const tenantAgentContextProvider = new TenantAgentContextProvider_1.TenantAgentContextProvider(tenantRecordService, rootAgentContext, eventEmitter, tenantSessionCoordinator, agentConfig.logger);
const inboundMessage = {
    protected: 'eyJlbmMiOiJ4Y2hhY2hhMjBwb2x5MTMwNV9pZXRmIiwidHlwIjoiSldNLzEuMCIsImFsZyI6IkF1dGhjcnlwdCIsInJlY2lwaWVudHMiOlt7ImVuY3J5cHRlZF9rZXkiOiIta3AzRlREbzdNTnlqSVlvWkhFdFhzMzRLTlpEODBIc2tEVTcxSVg5ejJpdVphUy1PVHhNc21KUWNCeDN1Y1lVIiwiaGVhZGVyIjp7ImtpZCI6IjdQd0ZrMXB2V2JOTkUyUDRDTFlnWW5jUXJMc0VSRUx2cDZmQVRaTktVZnpXIiwiaXYiOiJBSElTQk94MWhrWk5obkVwWndJNFlWZ09HNnQ3RDhlQiIsInNlbmRlciI6IjRMTnFHWGJ3SGlPU01uQThsV1M3bEpocER6aGY5UUIyYjNPUVZyWkkyeEctWWJkT1BUamR6WWRGamdpbFo4MF95bXhKSHpoWmp1bHhPeEVvek81VUhDQzJ3bnV3MHo3OVRRWjE5MFgzUFI2WWlrSUVIcms2N3A4V09WTT0ifX1dfQ==',
    iv: 'CfsDEiS63uOJRZa-',
    ciphertext: 'V6V23nNdKSn2a0jqrjQoU8cj6Ks9w9_4eqE0_856hjd_gxYxqT4W0M9sZ5ov1zlOptrBz6wGDK-BoEbOzvgNqHmiUS5h_VvVuEIevpp9xYrCLlNigrXJEtoDGWkVVpYq3i14l5XGMYCu2zTL7QJxHqDrzRAG-5Iqht0FY45u4L471CMvj31XuZps6I_wl-TJWfeZbAS1Knp_dEnElqtbkcctOKjnvaosk2WYaIrQXRiJxk-4URGnmMAQxjSSt5KuzE3LQ_fa_u5PQLC0EaOsg5M9fYBSIB1_090fQ0QTPXLB69pyiFzLmb016vHGIG5nAbqNKS7fmkhxo7iMkOBlR5d5FpCAguXln4Fg4Q4tZgEaPXVkqmayTvLyeJqXa22dbNDhaPGrvjlNimn8moP8qSC0Avoozn4BDdLrSQxs5daYcH0JYhqz7VII2Mrb2gp2LMsQsoy-UrChTZSBeyjWdapqOzMc8yOhKYXwA_du0RfSaPFe8VJyMo4X73LC6-i1QU5xg3fZKiKJWRrTUazLvdNEXm79DV76LxylodY7OeCGH6E2amF1k10VC2eYwNCI3CfXS8uvjDEIQGgsVETCqwclWKxD-AhQEwZFRlNhZjlfbUyOKH8WAoikloN75T2AZiTivzlE5ZvnPUU_z4LJI02z-vpIMEjkHKcgjx0jDFi3VkfLPiOG4P6btZpxjISfZvWcCiebAhs5jAGX2zNjYiPErJx33zOclHYS8KEZB3fdAdpAZKdYlPyAOFpN8r21kn6HPYjm-3NmTqrHAjDIMgt0mJ6AI58XOnoqRWN7Hl1HWhy9qkt0AqRVJZIIoyFefvKRJvotsv9aj1ZGPqnrkR2Hpj7u-K8VOKreIg4kWYyVbAF8Oift9CrqJ4olOOSUOQZ_NL36qGJc1RCR_wRnTWikoRR_o4h4fDZtxTQG9nUgbAoaAumJAbp5mxrYBW6KVZ-Jm9rhdNnRRnvvd1e_uW-X66_9B5g0GM3BmsXK-ARpJP6ZYmpQYiVFjrDxOSrvq1gD3aPi0SCP6mYoNvemGoXFhGTPMTGQvy1RAwY9t_BosZNEMZMfYTzHxWhN55yXd0861uv5nFe_aLKQcdin8QySW-FS0jcExnRostY922fqT5JYPBINqAr59u8gpzX-N9DgczL1WjuKkwyezLrcCR1IaG9gZrEIJxLDRGHvBno6ZkqmLiuAx3LZxgrT5yN2fI7WjO5HHQMVLn7rVF-THmpLNTZmmsoJ2ZU9ZGeAMKBpcfIYIHgKHF1vumr_h2uCbvxlwqigm5A-dSmto0Fv9xewfDhZ5TvE-TKwHpwmb0OG4kZqC3CnMmzh_oSOK0Cc6ovldiVOUvXdVZJiSD9KEFxn1YmDNbsdMDP9GAAWAknFmdBp5x7DCCt6sMjCVuw1hbELAGXusipfdvfb4htSN5FR4k72efenEr0glFtDk7s5EvWTWsBZyv92P5et-70MjTKGtMJaC4uCBL3li3ty397yKKcJly2Fog5N0phqPHPHg_-CGZ8YpkcM_q3Ijcc8db701K2TShiG97AjOdCZCSgK8OGv_UFXxXXxiwrdQOM0Jfg0TCz_ESxQLAlepK4JQplE_kR8k3jDf5nH4SMueobioPfkLQ92lCFXBOCX3ugoJJnnb49CbQfi-49PAHsGaTopLXxZoEdf6kgJ8phFakBoMmbLE1zIV43oVR8T-zZYsr377q6c6LY46PyYusP7CB5wgXbG4nyJZ_zGZHvY_hnbcE2-EuysmzQV4-6rJdLdT8FSyX_Xo-K2ZmX-riFUcKamoFWmO3CDtexn-ZgtAIJpdjAApWHFxZWLI6xx67OgHl8GT2HIs_BdoetFvmj4tJ_Aw8_Mmb9W37B4Esom1Tg3XxxfLqj24s7UlgUwYFblkYtB1L9-9DkNlZZWkYJz-A28WW6OSqIYNw0ASyNDEp3Mwy0SHDUYh10NUmQ4C476QRNmr32Jv_6AiTGj1thibFg_Ewd_kdvvo0E7VL6gktZNh9kIT-EPgFAobR5IpG0_V1dJ7pEQPKN-n7nc6gWgry7kxNIfS4LcbPwVDsUzJiJ4Qlw=',
    tag: 'goWiDaoxy4mHHRnkPiux4Q==',
};
describe('TenantAgentContextProvider', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('getAgentContextForContextCorrelationId', () => {
        test('retrieves the tenant and calls tenant session coordinator', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantRecord = new repository_1.TenantRecord({
                id: 'tenant1',
                config: {
                    label: 'Test Tenant',
                    walletConfig: {
                        id: 'test-wallet',
                        key: 'test-wallet-key',
                    },
                },
            });
            const tenantAgentContext = jest.fn();
            (0, helpers_1.mockFunction)(tenantRecordService.getTenantById).mockResolvedValue(tenantRecord);
            (0, helpers_1.mockFunction)(tenantSessionCoordinator.getContextForSession).mockResolvedValue(tenantAgentContext);
            const returnedAgentContext = yield tenantAgentContextProvider.getAgentContextForContextCorrelationId('tenant1');
            expect(tenantRecordService.getTenantById).toHaveBeenCalledWith(rootAgentContext, 'tenant1');
            expect(tenantSessionCoordinator.getContextForSession).toHaveBeenCalledWith(tenantRecord);
            expect(returnedAgentContext).toBe(tenantAgentContext);
        }));
    });
    describe('getContextForInboundMessage', () => {
        test('directly calls get agent context if tenant id has been provided in the contextCorrelationId', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantRecord = new repository_1.TenantRecord({
                id: 'tenant1',
                config: {
                    label: 'Test Tenant',
                    walletConfig: {
                        id: 'test-wallet',
                        key: 'test-wallet-key',
                    },
                },
            });
            const tenantAgentContext = jest.fn();
            (0, helpers_1.mockFunction)(tenantRecordService.getTenantById).mockResolvedValue(tenantRecord);
            (0, helpers_1.mockFunction)(tenantSessionCoordinator.getContextForSession).mockResolvedValue(tenantAgentContext);
            const returnedAgentContext = yield tenantAgentContextProvider.getContextForInboundMessage({}, { contextCorrelationId: 'tenant1' });
            expect(tenantRecordService.getTenantById).toHaveBeenCalledWith(rootAgentContext, 'tenant1');
            expect(tenantSessionCoordinator.getContextForSession).toHaveBeenCalledWith(tenantRecord);
            expect(returnedAgentContext).toBe(tenantAgentContext);
            expect(tenantRecordService.findTenantRoutingRecordByRecipientKey).not.toHaveBeenCalled();
        }));
        test('throws an error if not contextCorrelationId is provided and no tenant id could be extracted from the inbound message', () => __awaiter(void 0, void 0, void 0, function* () {
            // no routing records found
            (0, helpers_1.mockFunction)(tenantRecordService.findTenantRoutingRecordByRecipientKey).mockResolvedValue(null);
            yield expect(tenantAgentContextProvider.getContextForInboundMessage(inboundMessage)).rejects.toThrowError("Couldn't determine tenant id for inbound message. Unable to create context");
        }));
        test('finds the tenant id based on the inbound message recipient keys and calls get agent context', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantRoutingRecord = new repository_1.TenantRoutingRecord({
                recipientKeyFingerprint: 'z6MkkrCJLG5Mr8rqLXDksuWXPtAQfv95q7bHW7a6HqLLPtmt',
                tenantId: 'tenant1',
            });
            const tenantRecord = new repository_1.TenantRecord({
                id: 'tenant1',
                config: {
                    label: 'Test Tenant',
                    walletConfig: {
                        id: 'test-wallet',
                        key: 'test-wallet-key',
                    },
                },
            });
            const tenantAgentContext = jest.fn();
            (0, helpers_1.mockFunction)(tenantRecordService.findTenantRoutingRecordByRecipientKey).mockResolvedValue(tenantRoutingRecord);
            (0, helpers_1.mockFunction)(tenantRecordService.getTenantById).mockResolvedValue(tenantRecord);
            (0, helpers_1.mockFunction)(tenantSessionCoordinator.getContextForSession).mockResolvedValue(tenantAgentContext);
            const returnedAgentContext = yield tenantAgentContextProvider.getContextForInboundMessage(inboundMessage);
            expect(tenantRecordService.getTenantById).toHaveBeenCalledWith(rootAgentContext, 'tenant1');
            expect(tenantSessionCoordinator.getContextForSession).toHaveBeenCalledWith(tenantRecord);
            expect(returnedAgentContext).toBe(tenantAgentContext);
            expect(tenantRecordService.findTenantRoutingRecordByRecipientKey).toHaveBeenCalledWith(rootAgentContext, expect.any(core_1.Key));
            const actualKey = (0, helpers_1.mockFunction)(tenantRecordService.findTenantRoutingRecordByRecipientKey).mock.calls[0][1];
            // Based on the recipient key from the inboundMessage protected header above
            expect(actualKey.fingerprint).toBe('z6MkkrCJLG5Mr8rqLXDksuWXPtAQfv95q7bHW7a6HqLLPtmt');
        }));
    });
    describe('disposeAgentContext', () => {
        test('calls disposeAgentContextSession on tenant session coordinator', () => __awaiter(void 0, void 0, void 0, function* () {
            const tenantAgentContext = jest.fn();
            yield tenantAgentContextProvider.endSessionForAgentContext(tenantAgentContext);
            expect(tenantSessionCoordinator.endAgentContextSession).toHaveBeenCalledWith(tenantAgentContext);
        }));
    });
});
