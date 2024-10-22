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
const core_1 = require("@credo-ts/core");
const crypto_1 = __importDefault(require("crypto"));
const helpers_1 = require("../../core/tests/helpers");
const indy_bese_test_utils_1 = require("./indy-bese-test-utils");
const DidUtils_1 = require("../src/dids/DidUtils");
const agentOptions = (0, helpers_1.getAgentOptions)('Faber', {}, (0, indy_bese_test_utils_1.getBesuIndyModules)());
describe('Indy-Besu DID', () => {
    let agent;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = new core_1.Agent(agentOptions);
        yield agent.initialize();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    it('create and resolve a did:ethr', () => __awaiter(void 0, void 0, void 0, function* () {
        const didPrivateKey = core_1.Buffer.from(crypto_1.default.randomBytes(32));
        const assertKey = yield agent.wallet.createKey({ keyType: core_1.KeyType.Ed25519 });
        const createResult = yield agent.dids.create({
            method: 'ethr',
            options: {
                endpoints: [
                    {
                        type: 'endpoint',
                        endpoint: 'https://example.com/endpoint',
                    },
                ],
                verificationKeys: [
                    {
                        type: DidUtils_1.VerificationKeyType.Ed25519VerificationKey2018,
                        key: assertKey,
                        purpose: DidUtils_1.VerificationKeyPurpose.AssertionMethod,
                    },
                ],
            },
            secret: {
                didPrivateKey,
            },
        });
        console.log(JSON.stringify(createResult));
        expect(createResult.didState).toMatchObject({ state: 'finished' });
        const id = createResult.didState.did;
        const namespaceIdentifier = id.split(':').pop();
        const document = createResult.didState.didDocument;
        expect(core_1.JsonTransformer.toJSON(document)).toMatchObject({
            '@context': [
                'https://www.w3.org/ns/did/v1',
                'https://w3id.org/security/suites/secp256k1recovery-2020/v2',
                // 'https://w3id.org/security/v3-unstable',
                'https://w3id.org/security/suites/ed25519-2018/v1',
            ],
            verificationMethod: [
                {
                    id: `${id}#controller`,
                    type: 'EcdsaSecp256k1RecoveryMethod2020',
                    controller: id,
                    blockchainAccountId: `eip155:1337:${namespaceIdentifier}`,
                },
                {
                    id: `${id}#delegate-1`,
                    type: 'Ed25519VerificationKey2018',
                    controller: id,
                    publicKeyBase58: assertKey.publicKeyBase58,
                },
            ],
            service: [
                {
                    id: `${id}#service-1`,
                    serviceEndpoint: 'https://example.com/endpoint',
                    type: 'endpoint',
                },
            ],
            authentication: [`${id}#controller`],
            assertionMethod: [`${id}#controller`, `${id}#delegate-1`],
        });
        const resolvedDid = yield agent.dids.resolve(id);
        console.log(JSON.stringify(resolvedDid));
        expect(core_1.JsonTransformer.toJSON(resolvedDid.didDocument)).toMatchObject(core_1.JsonTransformer.toJSON(document));
    }));
});
