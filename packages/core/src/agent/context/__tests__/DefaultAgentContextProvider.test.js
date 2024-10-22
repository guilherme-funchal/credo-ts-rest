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
const helpers_1 = require("../../../../tests/helpers");
const DefaultAgentContextProvider_1 = require("../DefaultAgentContextProvider");
const agentContext = (0, helpers_1.getAgentContext)();
describe('DefaultAgentContextProvider', () => {
    describe('getContextForInboundMessage()', () => {
        test('returns the agent context provided in the constructor', () => __awaiter(void 0, void 0, void 0, function* () {
            const agentContextProvider = new DefaultAgentContextProvider_1.DefaultAgentContextProvider(agentContext);
            const message = {};
            yield expect(agentContextProvider.getContextForInboundMessage(message)).resolves.toBe(agentContext);
        }));
        test('throws an error if the provided contextCorrelationId does not match with the contextCorrelationId from the constructor agent context', () => __awaiter(void 0, void 0, void 0, function* () {
            const agentContextProvider = new DefaultAgentContextProvider_1.DefaultAgentContextProvider(agentContext);
            const message = {};
            yield expect(agentContextProvider.getContextForInboundMessage(message, { contextCorrelationId: 'wrong' })).rejects.toThrowError(`Could not get agent context for contextCorrelationId 'wrong'. Only contextCorrelationId 'mock' is supported.`);
        }));
    });
    describe('getAgentContextForContextCorrelationId()', () => {
        test('returns the agent context provided in the constructor if contextCorrelationId matches', () => __awaiter(void 0, void 0, void 0, function* () {
            const agentContextProvider = new DefaultAgentContextProvider_1.DefaultAgentContextProvider(agentContext);
            yield expect(agentContextProvider.getAgentContextForContextCorrelationId('mock')).resolves.toBe(agentContext);
        }));
        test('throws an error if the contextCorrelationId does not match with the contextCorrelationId from the constructor agent context', () => __awaiter(void 0, void 0, void 0, function* () {
            const agentContextProvider = new DefaultAgentContextProvider_1.DefaultAgentContextProvider(agentContext);
            yield expect(agentContextProvider.getAgentContextForContextCorrelationId('wrong')).rejects.toThrowError(`Could not get agent context for contextCorrelationId 'wrong'. Only contextCorrelationId 'mock' is supported.`);
        }));
    });
    describe('endSessionForAgentContext()', () => {
        test('resolves when the correct agent context is passed', () => __awaiter(void 0, void 0, void 0, function* () {
            const agentContextProvider = new DefaultAgentContextProvider_1.DefaultAgentContextProvider(agentContext);
            yield expect(agentContextProvider.endSessionForAgentContext(agentContext)).resolves.toBeUndefined();
        }));
        test('throws an error if the contextCorrelationId does not match with the contextCorrelationId from the constructor agent context', () => __awaiter(void 0, void 0, void 0, function* () {
            const agentContextProvider = new DefaultAgentContextProvider_1.DefaultAgentContextProvider(agentContext);
            const agentContext2 = (0, helpers_1.getAgentContext)({
                contextCorrelationId: 'mock2',
            });
            yield expect(agentContextProvider.endSessionForAgentContext(agentContext2)).rejects.toThrowError(`Could not end session for agent context with contextCorrelationId 'mock2'. Only contextCorrelationId 'mock' is provided by this provider.`);
        }));
    });
});
