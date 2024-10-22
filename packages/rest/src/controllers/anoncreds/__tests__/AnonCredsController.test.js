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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const helpers_1 = require("../../../../tests/utils/helpers");
const setupApp_1 = require("../../../setup/setupApp");
const fixtures_1 = require("./fixtures");
describe('AnonCredsController', () => {
    const app = (0, express_1.default)();
    let agent;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = yield (0, helpers_1.getTestAgent)('AnonCredsController REST Agent Test');
        yield (0, setupApp_1.setupApp)({ agent, adminPort: 3000, baseApp: app });
    }));
    afterEach(() => {
        jest.clearAllMocks();
    });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    describe('get schema by id', () => {
        test('should return schema', () => __awaiter(void 0, void 0, void 0, function* () {
            // FIXME: we need to encode the schema-id to make it work ....
            const response = yield (0, supertest_1.default)(app).get(`/anoncreds/schemas/${encodeURIComponent(fixtures_1.testAnonCredsSchema.schemaId)}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(Object.assign(Object.assign({}, fixtures_1.testAnonCredsSchema), { schemaMetadata: {}, resolutionMetadata: {} }));
        }));
        test('should return 400 BadRequest when id has invalid anoncreds method', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get(`/anoncreds/schemas/x`);
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                resolutionMetadata: {
                    error: 'unsupportedAnonCredsMethod',
                    message: 'Unable to resolve schema x: No registry found for identifier x',
                },
                schemaId: 'x',
                schemaMetadata: {},
            });
        }));
        test('should return 404 NotFound when schema not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get(`/anoncreds/schemas/uri:random-id`);
            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({
                resolutionMetadata: {
                    error: 'notFound',
                    message: 'Schema not found',
                },
                schemaId: 'uri:random-id',
                schemaMetadata: {},
            });
        }));
    });
    describe('create schema', () => {
        test('should return created schema ', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post(`/anoncreds/schemas`).send({
                schema: fixtures_1.testAnonCredsSchema.schema,
            });
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                schemaState: Object.assign({ state: 'finished' }, fixtures_1.testAnonCredsSchema),
                registrationMetadata: {},
                schemaMetadata: {},
            });
        }));
        test('should return 422 when props missing ', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post(`/anoncreds/schemas`)
                .send(Object.assign(Object.assign({}, fixtures_1.testAnonCredsSchema.schema), { issuerId: undefined }));
            expect(response.statusCode).toBe(422);
        }));
    });
    describe('get credential definition by id', () => {
        test('should return credential definition ', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get(`/anoncreds/credential-definitions/${encodeURIComponent(fixtures_1.testAnonCredsCredentialDefinition.credentialDefinitionId)}`);
            // expect(response.statusCode).toBe(200)
            expect(response.body).toEqual(Object.assign(Object.assign({}, fixtures_1.testAnonCredsCredentialDefinition), { credentialDefinitionMetadata: {}, resolutionMetadata: {} }));
        }));
        test('should return 400 BadRequest when id has invalid structure', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(agent.modules.anoncreds, 'getCredentialDefinition').mockResolvedValueOnce({
                credentialDefinitionId: 'x',
                credentialDefinitionMetadata: {},
                resolutionMetadata: {
                    error: 'invalid',
                },
            });
            const response = yield (0, supertest_1.default)(app).get(`/anoncreds/credential-definitions/x`);
            expect(response.statusCode).toBe(400);
        }));
        test('should return 400 BadRequest when id has invalid anoncreds method', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(agent.modules.anoncreds, 'getCredentialDefinition').mockResolvedValueOnce({
                credentialDefinitionId: 'x',
                credentialDefinitionMetadata: {},
                resolutionMetadata: {
                    error: 'unsupportedAnonCredsMethod',
                },
            });
            const response = yield (0, supertest_1.default)(app).get(`/anoncreds/credential-definitions/x`);
            expect(response.statusCode).toBe(400);
        }));
        test('should return 404 NotFound when credential definition not found', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(agent.modules.anoncreds, 'getCredentialDefinition').mockResolvedValueOnce({
                credentialDefinitionId: 'x',
                credentialDefinitionMetadata: {},
                resolutionMetadata: {
                    error: 'notFound',
                },
            });
            const response = yield (0, supertest_1.default)(app).get(`/anoncreds/credential-definitions/WgWxqztrNooG92RXvxSTWv:3:CL:20:tag`);
            expect(response.statusCode).toBe(404);
        }));
    });
    describe('create credential definition', () => {
        test('should return created credential definition ', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(agent.modules.anoncreds, 'registerCredentialDefinition').mockResolvedValueOnce({
                credentialDefinitionState: {
                    state: 'finished',
                    credentialDefinition: fixtures_1.testAnonCredsCredentialDefinition.credentialDefinition,
                    credentialDefinitionId: fixtures_1.testAnonCredsCredentialDefinition.credentialDefinitionId,
                },
                credentialDefinitionMetadata: {},
                registrationMetadata: {},
            });
            jest.spyOn(agent.modules.anoncreds, 'getSchema').mockResolvedValueOnce({
                resolutionMetadata: {},
                schemaMetadata: {},
                schemaId: fixtures_1.testAnonCredsSchema.schemaId,
                schema: fixtures_1.testAnonCredsSchema.schema,
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/anoncreds/credential-definitions`)
                .send({
                credentialDefinition: {
                    issuerId: fixtures_1.testAnonCredsCredentialDefinition.credentialDefinition.issuerId,
                    schemaId: fixtures_1.testAnonCredsCredentialDefinition.credentialDefinition.schemaId,
                    tag: fixtures_1.testAnonCredsCredentialDefinition.credentialDefinition.tag,
                },
                options: {
                    supportRevocation: false,
                },
            });
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                credentialDefinitionState: Object.assign({ state: 'finished' }, fixtures_1.testAnonCredsCredentialDefinition),
                registrationMetadata: {},
                credentialDefinitionMetadata: {},
            });
        }));
    });
});
