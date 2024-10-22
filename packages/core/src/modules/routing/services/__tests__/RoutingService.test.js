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
const rxjs_1 = require("rxjs");
const helpers_1 = require("../../../../../tests/helpers");
const EventEmitter_1 = require("../../../../agent/EventEmitter");
const crypto_1 = require("../../../../crypto");
const RoutingEvents_1 = require("../../RoutingEvents");
const MediationRecipientService_1 = require("../MediationRecipientService");
const RoutingService_1 = require("../RoutingService");
jest.mock('../MediationRecipientService');
const MediationRecipientServiceMock = MediationRecipientService_1.MediationRecipientService;
const recipientKey = crypto_1.Key.fromFingerprint('z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL');
const agentConfig = (0, helpers_1.getAgentConfig)('RoutingService', {
    endpoints: ['http://endpoint.com'],
});
const eventEmitter = new EventEmitter_1.EventEmitter(agentConfig.agentDependencies, new rxjs_1.Subject());
const wallet = {
    createKey: jest.fn().mockResolvedValue(recipientKey),
    // with satisfies Partial<Wallet> we still get type errors when the interface changes
};
const agentContext = (0, helpers_1.getAgentContext)({
    wallet: wallet,
    agentConfig,
});
const mediationRecipientService = new MediationRecipientServiceMock();
const routingService = new RoutingService_1.RoutingService(mediationRecipientService, eventEmitter);
const routing = {
    endpoints: ['http://endpoint.com'],
    recipientKey,
    routingKeys: [],
};
(0, helpers_1.mockFunction)(mediationRecipientService.addMediationRouting).mockResolvedValue(routing);
describe('RoutingService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('getRouting', () => {
        test('calls mediation recipient service', () => __awaiter(void 0, void 0, void 0, function* () {
            const routing = yield routingService.getRouting(agentContext, {
                mediatorId: 'mediator-id',
                useDefaultMediator: true,
            });
            expect(mediationRecipientService.addMediationRouting).toHaveBeenCalledWith(agentContext, routing, {
                mediatorId: 'mediator-id',
                useDefaultMediator: true,
            });
        }));
        test('emits RoutingCreatedEvent', () => __awaiter(void 0, void 0, void 0, function* () {
            const routingListener = jest.fn();
            eventEmitter.on(RoutingEvents_1.RoutingEventTypes.RoutingCreatedEvent, routingListener);
            const routing = yield routingService.getRouting(agentContext);
            expect(routing).toEqual(routing);
            expect(routingListener).toHaveBeenCalledWith({
                type: RoutingEvents_1.RoutingEventTypes.RoutingCreatedEvent,
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    routing,
                },
            });
        }));
    });
});
