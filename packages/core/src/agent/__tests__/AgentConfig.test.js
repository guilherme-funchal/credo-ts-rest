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
const helpers_1 = require("../../../tests/helpers");
const AgentConfig_1 = require("../AgentConfig");
describe('AgentConfig', () => {
    describe('endpoints', () => {
        it('should return the config endpoint if no inbound connection is available', () => {
            const endpoint = 'https://local-url.com';
            const agentConfig = (0, helpers_1.getAgentConfig)('AgentConfig Test', {
                endpoints: [endpoint],
            });
            expect(agentConfig.endpoints).toEqual([endpoint]);
        });
        it("should return ['didcomm:transport/queue'] if no inbound connection or config endpoint or host/port is available", () => {
            const agentConfig = (0, helpers_1.getAgentConfig)('AgentConfig Test');
            expect(agentConfig.endpoints).toStrictEqual(['didcomm:transport/queue']);
        });
        it('should return the new config endpoint after setter is called', () => {
            const endpoint = 'https://local-url.com';
            const newEndpoint = 'https://new-local-url.com';
            const agentConfig = (0, helpers_1.getAgentConfig)('AgentConfig Test', {
                endpoints: [endpoint],
            });
            agentConfig.endpoints = [newEndpoint];
            expect(agentConfig.endpoints).toEqual([newEndpoint]);
        });
    });
    describe('label', () => {
        it('should return new label after setter is called', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(2);
            const newLabel = 'Agent: Agent Class Test 2';
            const agentConfig = (0, helpers_1.getAgentConfig)('AgentConfig Test', {
                label: 'Test',
            });
            expect(agentConfig.label).toBe('Test');
            agentConfig.label = newLabel;
            expect(agentConfig.label).toBe(newLabel);
        }));
    });
    describe('extend()', () => {
        it('extends the existing AgentConfig', () => {
            const agentConfig = new AgentConfig_1.AgentConfig({
                label: 'hello',
            }, helpers_1.agentDependencies);
            const newAgentConfig = agentConfig.extend({});
            expect(newAgentConfig).toMatchObject({
                label: 'hello',
            });
        });
        it('takes the init config from the extend method', () => {
            const agentConfig = new AgentConfig_1.AgentConfig({
                label: 'hello',
            }, helpers_1.agentDependencies);
            const newAgentConfig = agentConfig.extend({
                label: 'anotherLabel',
            });
            expect(newAgentConfig).toMatchObject({
                label: 'anotherLabel',
            });
        });
    });
});
