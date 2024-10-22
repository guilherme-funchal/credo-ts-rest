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
const src_1 = require("../../../../../indy-sdk/src");
const tests_1 = require("../../../../tests");
const Agent_1 = require("../../../agent/Agent");
const utils_1 = require("../../../utils");
const W3cCredentialService_1 = require("../W3cCredentialService");
const W3cCredentialsModule_1 = require("../W3cCredentialsModule");
const documentLoader_1 = require("../data-integrity/__tests__/documentLoader");
const fixtures_1 = require("../data-integrity/__tests__/fixtures");
const models_1 = require("../data-integrity/models");
const repository_1 = require("../repository");
const modules = {
    indySdk: new src_1.IndySdkModule({
        indySdk: tests_1.indySdk,
    }),
    w3cCredentials: new W3cCredentialsModule_1.W3cCredentialsModule({
        documentLoader: documentLoader_1.customDocumentLoader,
    }),
};
const agentOptions = (0, tests_1.getAgentOptions)('W3cCredentialsApi', {}, modules);
const agent = new Agent_1.Agent(agentOptions);
let w3cCredentialRepository;
let w3cCredentialService;
const testCredential = utils_1.JsonTransformer.fromJSON(fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED, models_1.W3cJsonLdVerifiableCredential);
describe('W3cCredentialsApi', () => {
    beforeAll(() => {
        w3cCredentialRepository = agent.dependencyManager.resolve(repository_1.W3cCredentialRepository);
        w3cCredentialService = agent.dependencyManager.resolve(W3cCredentialService_1.W3cCredentialService);
    });
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.initialize();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    it('Should successfully store a credential', () => __awaiter(void 0, void 0, void 0, function* () {
        const repoSpy = jest.spyOn(w3cCredentialRepository, 'save');
        const serviceSpy = jest.spyOn(w3cCredentialService, 'storeCredential');
        yield agent.w3cCredentials.storeCredential({
            credential: testCredential,
        });
        expect(repoSpy).toHaveBeenCalledTimes(1);
        expect(serviceSpy).toHaveBeenCalledTimes(1);
    }));
    it('Should successfully retrieve a credential by id', () => __awaiter(void 0, void 0, void 0, function* () {
        const repoSpy = jest.spyOn(w3cCredentialRepository, 'getById');
        const serviceSpy = jest.spyOn(w3cCredentialService, 'getCredentialRecordById');
        const storedCredential = yield agent.w3cCredentials.storeCredential({
            credential: testCredential,
        });
        const retrievedCredential = yield agent.w3cCredentials.getCredentialRecordById(storedCredential.id);
        expect(storedCredential.id).toEqual(retrievedCredential.id);
        expect(repoSpy).toHaveBeenCalledTimes(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(repoSpy).toHaveBeenCalledWith(agent.agentContext, storedCredential.id);
        expect(serviceSpy).toHaveBeenCalledTimes(1);
    }));
    it('Should successfully remove a credential by id', () => __awaiter(void 0, void 0, void 0, function* () {
        const repoSpy = jest.spyOn(w3cCredentialRepository, 'deleteById');
        const serviceSpy = jest.spyOn(w3cCredentialService, 'removeCredentialRecord');
        const storedCredential = yield agent.w3cCredentials.storeCredential({
            credential: testCredential,
        });
        yield agent.w3cCredentials.removeCredentialRecord(storedCredential.id);
        expect(repoSpy).toHaveBeenCalledTimes(1);
        expect(serviceSpy).toHaveBeenCalledTimes(1);
        expect(serviceSpy).toHaveBeenCalledWith(agent.context, storedCredential.id);
        const allCredentials = yield agent.w3cCredentials.getAllCredentialRecords();
        expect(allCredentials).toHaveLength(0);
    }));
});
