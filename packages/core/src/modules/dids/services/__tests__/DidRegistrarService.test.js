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
const helpers_1 = require("../../../../../tests/helpers");
const DidsModuleConfig_1 = require("../../DidsModuleConfig");
const DidRegistrarService_1 = require("../DidRegistrarService");
const agentConfig = (0, helpers_1.getAgentConfig)('DidResolverService');
const agentContext = (0, helpers_1.getAgentContext)();
const didRegistrarMock = {
    supportedMethods: ['key'],
    create: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
};
const didRegistrarService = new DidRegistrarService_1.DidRegistrarService(agentConfig.logger, new DidsModuleConfig_1.DidsModuleConfig({
    registrars: [didRegistrarMock],
}));
describe('DidResolverService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('create', () => {
        it('should correctly find and call the correct registrar for a specified did', () => __awaiter(void 0, void 0, void 0, function* () {
            const returnValue = {
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: ':(',
                },
            };
            (0, helpers_1.mockFunction)(didRegistrarMock.create).mockResolvedValue(returnValue);
            const result = yield didRegistrarService.create(agentContext, { did: 'did:key:xxxx' });
            expect(result).toEqual(returnValue);
            expect(didRegistrarMock.create).toHaveBeenCalledTimes(1);
            expect(didRegistrarMock.create).toHaveBeenCalledWith(agentContext, { did: 'did:key:xxxx' });
        }));
        it('should return error state failed if no did or method is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield didRegistrarService.create(agentContext, {});
            expect(result).toEqual({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    did: undefined,
                    reason: 'Either did OR method must be specified',
                },
            });
        }));
        it('should return error state failed if both did and method are provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield didRegistrarService.create(agentContext, { did: 'did:key:xxxx', method: 'key' });
            expect(result).toEqual({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    did: 'did:key:xxxx',
                    reason: 'Either did OR method must be specified',
                },
            });
        }));
        it('should return error state failed if no method could be extracted from the did or method', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield didRegistrarService.create(agentContext, { did: 'did:a' });
            expect(result).toEqual({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    did: 'did:a',
                    reason: 'Could not extract method from did did:a',
                },
            });
        }));
        it('should return error with state failed if the did has no registrar', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield didRegistrarService.create(agentContext, { did: 'did:something:123' });
            expect(result).toEqual({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    did: 'did:something:123',
                    reason: "Unsupported did method: 'something'",
                },
            });
        }));
    });
    describe('update', () => {
        it('should correctly find and call the correct registrar for a specified did', () => __awaiter(void 0, void 0, void 0, function* () {
            const returnValue = {
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: ':(',
                },
            };
            (0, helpers_1.mockFunction)(didRegistrarMock.update).mockResolvedValue(returnValue);
            const didDocument = {};
            const result = yield didRegistrarService.update(agentContext, { did: 'did:key:xxxx', didDocument });
            expect(result).toEqual(returnValue);
            expect(didRegistrarMock.update).toHaveBeenCalledTimes(1);
            expect(didRegistrarMock.update).toHaveBeenCalledWith(agentContext, { did: 'did:key:xxxx', didDocument });
        }));
        it('should return error state failed if no method could be extracted from the did', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield didRegistrarService.update(agentContext, { did: 'did:a', didDocument: {} });
            expect(result).toEqual({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    did: 'did:a',
                    reason: 'Could not extract method from did did:a',
                },
            });
        }));
        it('should return error with state failed if the did has no registrar', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield didRegistrarService.update(agentContext, {
                did: 'did:something:123',
                didDocument: {},
            });
            expect(result).toEqual({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    did: 'did:something:123',
                    reason: "Unsupported did method: 'something'",
                },
            });
        }));
    });
    describe('deactivate', () => {
        it('should correctly find and call the correct registrar for a specified did', () => __awaiter(void 0, void 0, void 0, function* () {
            const returnValue = {
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: ':(',
                },
            };
            (0, helpers_1.mockFunction)(didRegistrarMock.deactivate).mockResolvedValue(returnValue);
            const result = yield didRegistrarService.deactivate(agentContext, { did: 'did:key:xxxx' });
            expect(result).toEqual(returnValue);
            expect(didRegistrarMock.deactivate).toHaveBeenCalledTimes(1);
            expect(didRegistrarMock.deactivate).toHaveBeenCalledWith(agentContext, { did: 'did:key:xxxx' });
        }));
        it('should return error state failed if no method could be extracted from the did', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield didRegistrarService.deactivate(agentContext, { did: 'did:a' });
            expect(result).toEqual({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    did: 'did:a',
                    reason: 'Could not extract method from did did:a',
                },
            });
        }));
        it('should return error with state failed if the did has no registrar', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield didRegistrarService.deactivate(agentContext, { did: 'did:something:123' });
            expect(result).toEqual({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    did: 'did:something:123',
                    reason: "Unsupported did method: 'something'",
                },
            });
        }));
    });
});
