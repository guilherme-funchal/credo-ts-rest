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
const helpers_1 = require("../../../../../../tests/helpers");
const crypto_1 = require("../../../../../crypto");
const Key_1 = require("../../../../../crypto/Key");
const utils_1 = require("../../../../../utils");
const JsonTransformer_1 = require("../../../../../utils/JsonTransformer");
const error_1 = require("../../../../../wallet/error");
const DidDocumentRole_1 = require("../../../domain/DidDocumentRole");
const DidRepository_1 = require("../../../repository/DidRepository");
const KeyDidRegistrar_1 = require("../KeyDidRegistrar");
const didKeyz6MksLe_json_1 = __importDefault(require("./__fixtures__/didKeyz6MksLe.json"));
jest.mock('../../../repository/DidRepository');
const DidRepositoryMock = DidRepository_1.DidRepository;
const walletMock = {
    createKey: jest.fn(() => Key_1.Key.fromFingerprint('z6MksLeew51QS6Ca6tVKM56LQNbxCNVcLHv4xXj4jMkAhPWU')),
};
const didRepositoryMock = new DidRepositoryMock();
const keyDidRegistrar = new KeyDidRegistrar_1.KeyDidRegistrar();
const agentContext = (0, helpers_1.getAgentContext)({
    wallet: walletMock,
    registerInstances: [[DidRepository_1.DidRepository, didRepositoryMock]],
});
describe('DidRegistrar', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('KeyDidRegistrar', () => {
        it('should correctly create a did:key document using Ed25519 key type', () => __awaiter(void 0, void 0, void 0, function* () {
            const privateKey = utils_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c712fd969598e');
            const result = yield keyDidRegistrar.create(agentContext, {
                method: 'key',
                options: {
                    keyType: crypto_1.KeyType.Ed25519,
                },
                secret: {
                    privateKey,
                },
            });
            expect(JsonTransformer_1.JsonTransformer.toJSON(result)).toMatchObject({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'finished',
                    did: 'did:key:z6MksLeew51QS6Ca6tVKM56LQNbxCNVcLHv4xXj4jMkAhPWU',
                    didDocument: didKeyz6MksLe_json_1.default,
                    secret: {
                        privateKey,
                    },
                },
            });
            expect(walletMock.createKey).toHaveBeenCalledWith({ keyType: crypto_1.KeyType.Ed25519, privateKey });
        }));
        it('should return an error state if no key type is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield keyDidRegistrar.create(agentContext, {
                method: 'key',
                // @ts-expect-error - key type is required in interface
                options: {},
            });
            expect(JsonTransformer_1.JsonTransformer.toJSON(result)).toMatchObject({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: 'Missing key type',
                },
            });
        }));
        it('should return an error state if a key creation error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(walletMock.createKey).mockRejectedValueOnce(new error_1.WalletError('Invalid private key provided'));
            const result = yield keyDidRegistrar.create(agentContext, {
                method: 'key',
                options: {
                    keyType: crypto_1.KeyType.Ed25519,
                },
                secret: {
                    privateKey: utils_1.TypedArrayEncoder.fromString('invalid'),
                },
            });
            expect(JsonTransformer_1.JsonTransformer.toJSON(result)).toMatchObject({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: expect.stringContaining('Invalid private key provided'),
                },
            });
        }));
        it('should store the did document', () => __awaiter(void 0, void 0, void 0, function* () {
            const privateKey = utils_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c712fd969598e');
            const did = 'did:key:z6MksLeew51QS6Ca6tVKM56LQNbxCNVcLHv4xXj4jMkAhPWU';
            yield keyDidRegistrar.create(agentContext, {
                method: 'key',
                options: {
                    keyType: crypto_1.KeyType.Ed25519,
                },
                secret: {
                    privateKey,
                },
            });
            expect(didRepositoryMock.save).toHaveBeenCalledTimes(1);
            const [, didRecord] = (0, helpers_1.mockFunction)(didRepositoryMock.save).mock.calls[0];
            expect(didRecord).toMatchObject({
                did,
                role: DidDocumentRole_1.DidDocumentRole.Created,
                didDocument: undefined,
            });
        }));
        it('should return an error state when calling update', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield keyDidRegistrar.update();
            expect(result).toEqual({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: `notSupported: cannot update did:key did`,
                },
            });
        }));
        it('should return an error state when calling deactivate', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield keyDidRegistrar.deactivate();
            expect(result).toEqual({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: `notSupported: cannot deactivate did:key did`,
                },
            });
        }));
    });
});
