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
const helpers_1 = require("../../../../../core/tests/helpers");
const AnonCredsModuleConfig_1 = require("../../../AnonCredsModuleConfig");
const error_1 = require("../../../error");
const AnonCredsRegistryService_1 = require("../AnonCredsRegistryService");
const registryOne = {
    supportedIdentifier: /a/,
};
const registryTwo = {
    supportedIdentifier: /b/,
};
const agentContext = (0, helpers_1.getAgentContext)({
    registerInstances: [
        [
            AnonCredsModuleConfig_1.AnonCredsModuleConfig,
            new AnonCredsModuleConfig_1.AnonCredsModuleConfig({
                registries: [registryOne, registryTwo],
            }),
        ],
    ],
});
const anonCredsRegistryService = new AnonCredsRegistryService_1.AnonCredsRegistryService();
describe('AnonCredsRegistryService', () => {
    test('returns the registry for an identifier based on the supportedMethods regex', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(anonCredsRegistryService.getRegistryForIdentifier(agentContext, 'a')).toEqual(registryOne);
        expect(anonCredsRegistryService.getRegistryForIdentifier(agentContext, 'b')).toEqual(registryTwo);
    }));
    test('throws AnonCredsError if no registry is found for the given identifier', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(() => anonCredsRegistryService.getRegistryForIdentifier(agentContext, 'c')).toThrow(error_1.AnonCredsError);
    }));
});
