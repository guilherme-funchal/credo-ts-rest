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
const ed25519_1 = require("@stablelib/ed25519");
const helpers_1 = require("../../core/tests/helpers");
const setup_1 = require("./setup");
const setupCheqdModule_1 = require("./setupCheqdModule");
const agentOptions = (0, helpers_1.getAgentOptions)('Faber Dids Registrar', {}, (0, setupCheqdModule_1.getCheqdModules)());
describe('Cheqd DID registrar', () => {
    let agent;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = new core_1.Agent(agentOptions);
        yield agent.initialize();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    it('should create a did:cheqd did', () => __awaiter(void 0, void 0, void 0, function* () {
        // Generate a seed and the cheqd did. This allows us to create a new did every time
        // but still check if the created output document is as expected.
        const privateKey = core_1.TypedArrayEncoder.fromString(Array(32 + 1)
            .join((Math.random().toString(36) + '00000000000000000').slice(2, 18))
            .slice(0, 32));
        const publicKeyEd25519 = (0, ed25519_1.generateKeyPairFromSeed)(privateKey).publicKey;
        const ed25519PublicKeyBase58 = core_1.TypedArrayEncoder.toBase58(publicKeyEd25519);
        const did = yield agent.dids.create({
            method: 'cheqd',
            secret: {
                verificationMethod: {
                    id: 'key-1',
                    type: 'Ed25519VerificationKey2018',
                    privateKey,
                },
            },
            options: {
                network: 'testnet',
                methodSpecificIdAlgo: 'base58btc',
            },
        });
        expect(did).toMatchObject({
            didState: {
                state: 'finished',
                didDocument: {
                    verificationMethod: [
                        {
                            type: 'Ed25519VerificationKey2018',
                            publicKeyBase58: ed25519PublicKeyBase58,
                        },
                    ],
                },
            },
        });
    }));
    it('should create a did:cheqd using Ed25519VerificationKey2020', () => __awaiter(void 0, void 0, void 0, function* () {
        const did = yield agent.dids.create({
            method: 'cheqd',
            secret: {
                verificationMethod: {
                    id: 'key-1',
                    type: 'Ed25519VerificationKey2020',
                },
            },
            options: {
                network: 'testnet',
                methodSpecificIdAlgo: 'uuid',
            },
        });
        expect(did.didState).toMatchObject({ state: 'finished' });
    }));
    it('should create a did:cheqd using JsonWebKey2020', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const createResult = yield agent.dids.create({
            method: 'cheqd',
            secret: {
                verificationMethod: {
                    id: 'key-11',
                    type: 'JsonWebKey2020',
                },
            },
            options: {
                network: 'testnet',
                methodSpecificIdAlgo: 'base58btc',
            },
        });
        expect(createResult).toMatchObject({
            didState: {
                state: 'finished',
                didDocument: {
                    verificationMethod: [{ type: 'JsonWebKey2020' }],
                },
            },
        });
        expect(createResult.didState.did).toBeDefined();
        const did = createResult.didState.did;
        const didDocument = createResult.didState.didDocument;
        didDocument.service = [(0, setup_1.validService)(did)];
        const updateResult = yield agent.dids.update({
            did,
            didDocument,
        });
        expect(updateResult).toMatchObject({
            didState: {
                state: 'finished',
                didDocument,
            },
        });
        const deactivateResult = yield agent.dids.deactivate({ did });
        expect((_a = deactivateResult.didState.didDocument) === null || _a === void 0 ? void 0 : _a.toJSON()).toMatchObject(didDocument.toJSON());
        expect(deactivateResult.didState.state).toEqual('finished');
        const resolvedDocument = yield agent.dids.resolve(did);
        expect(resolvedDocument.didDocumentMetadata.deactivated).toBe(true);
    }));
});
