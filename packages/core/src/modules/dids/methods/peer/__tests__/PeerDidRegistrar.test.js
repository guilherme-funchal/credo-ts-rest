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
const domain_1 = require("../../../domain");
const DidDocumentRole_1 = require("../../../domain/DidDocumentRole");
const DidRepository_1 = require("../../../repository/DidRepository");
const PeerDidRegistrar_1 = require("../PeerDidRegistrar");
const didPeer_1 = require("../didPeer");
const didPeer0z6MksLe_json_1 = __importDefault(require("./__fixtures__/didPeer0z6MksLe.json"));
jest.mock('../../../repository/DidRepository');
const DidRepositoryMock = DidRepository_1.DidRepository;
const walletMock = {
    createKey: jest.fn(() => Key_1.Key.fromFingerprint('z6MksLeew51QS6Ca6tVKM56LQNbxCNVcLHv4xXj4jMkAhPWU')),
};
const didRepositoryMock = new DidRepositoryMock();
const agentContext = (0, helpers_1.getAgentContext)({ wallet: walletMock, registerInstances: [[DidRepository_1.DidRepository, didRepositoryMock]] });
const peerDidRegistrar = new PeerDidRegistrar_1.PeerDidRegistrar();
describe('DidRegistrar', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('PeerDidRegistrar', () => {
        describe('did:peer:0', () => {
            it('should correctly create a did:peer:0 document using Ed25519 key type', () => __awaiter(void 0, void 0, void 0, function* () {
                const privateKey = utils_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c712fd969598e');
                const result = yield peerDidRegistrar.create(agentContext, {
                    method: 'peer',
                    options: {
                        keyType: crypto_1.KeyType.Ed25519,
                        numAlgo: didPeer_1.PeerDidNumAlgo.InceptionKeyWithoutDoc,
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
                        did: 'did:peer:0z6MksLeew51QS6Ca6tVKM56LQNbxCNVcLHv4xXj4jMkAhPWU',
                        didDocument: didPeer0z6MksLe_json_1.default,
                        secret: {
                            privateKey,
                        },
                    },
                });
            }));
            it('should return an error state if no key type is provided', () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield peerDidRegistrar.create(agentContext, {
                    method: 'peer',
                    // @ts-expect-error - key type is required in interface
                    options: {
                        numAlgo: didPeer_1.PeerDidNumAlgo.InceptionKeyWithoutDoc,
                    },
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
                const result = yield peerDidRegistrar.create(agentContext, {
                    method: 'peer',
                    options: {
                        keyType: crypto_1.KeyType.Ed25519,
                        numAlgo: didPeer_1.PeerDidNumAlgo.InceptionKeyWithoutDoc,
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
            it('should store the did without the did document', () => __awaiter(void 0, void 0, void 0, function* () {
                const privateKey = utils_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c712fd969598e');
                const did = 'did:peer:0z6MksLeew51QS6Ca6tVKM56LQNbxCNVcLHv4xXj4jMkAhPWU';
                yield peerDidRegistrar.create(agentContext, {
                    method: 'peer',
                    options: {
                        keyType: crypto_1.KeyType.Ed25519,
                        numAlgo: didPeer_1.PeerDidNumAlgo.InceptionKeyWithoutDoc,
                    },
                    secret: {
                        privateKey,
                    },
                });
                expect(didRepositoryMock.save).toHaveBeenCalledTimes(1);
                const [, didRecord] = (0, helpers_1.mockFunction)(didRepositoryMock.save).mock.calls[0];
                expect(didRecord).toMatchObject({
                    did: did,
                    role: DidDocumentRole_1.DidDocumentRole.Created,
                    _tags: {
                        recipientKeyFingerprints: [],
                    },
                    didDocument: undefined,
                });
            }));
        });
        describe('did:peer:1', () => {
            const verificationMethod = (0, domain_1.getEd25519VerificationKey2018)({
                key: Key_1.Key.fromFingerprint('z6LShxJc8afmt8L1HKjUE56hXwmAkUhdQygrH1VG2jmb1WRz'),
                // controller in method 1 did should be #id
                controller: '#id',
                id: '#41fb2ec7-1f8b-42bf-91a2-4ef9092ddc16',
            });
            const didDocument = new domain_1.DidDocumentBuilder('')
                .addVerificationMethod(verificationMethod)
                .addAuthentication(verificationMethod.id)
                .addService(new domain_1.DidCommV1Service({
                id: '#service-0',
                recipientKeys: [verificationMethod.id],
                serviceEndpoint: 'https://example.com',
                accept: ['didcomm/aip2;env=rfc19'],
            }))
                .build();
            it('should correctly create a did:peer:1 document from a did document', () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield peerDidRegistrar.create(agentContext, {
                    method: 'peer',
                    didDocument: didDocument,
                    options: {
                        numAlgo: didPeer_1.PeerDidNumAlgo.GenesisDoc,
                    },
                });
                expect(JsonTransformer_1.JsonTransformer.toJSON(result)).toMatchObject({
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'finished',
                        did: 'did:peer:1zQmUTNcSy2J2sAmX6Ad2bdPvhVnHPUaod8Skpt8DWPpZaiL',
                        didDocument: {
                            '@context': ['https://w3id.org/did/v1'],
                            alsoKnownAs: undefined,
                            controller: undefined,
                            verificationMethod: [
                                {
                                    id: '#41fb2ec7-1f8b-42bf-91a2-4ef9092ddc16',
                                    type: 'Ed25519VerificationKey2018',
                                    controller: '#id',
                                    publicKeyBase58: '7H8ScGrunfcGBwMhhRakDMYguLAWiNWhQ2maYH84J8fE',
                                },
                            ],
                            service: [
                                {
                                    id: '#service-0',
                                    serviceEndpoint: 'https://example.com',
                                    type: 'did-communication',
                                    priority: 0,
                                    recipientKeys: ['#41fb2ec7-1f8b-42bf-91a2-4ef9092ddc16'],
                                    accept: ['didcomm/aip2;env=rfc19'],
                                },
                            ],
                            authentication: ['#41fb2ec7-1f8b-42bf-91a2-4ef9092ddc16'],
                            assertionMethod: undefined,
                            keyAgreement: undefined,
                            capabilityInvocation: undefined,
                            capabilityDelegation: undefined,
                            id: 'did:peer:1zQmUTNcSy2J2sAmX6Ad2bdPvhVnHPUaod8Skpt8DWPpZaiL',
                        },
                    },
                });
            }));
            it('should store the did with the did document', () => __awaiter(void 0, void 0, void 0, function* () {
                const did = 'did:peer:1zQmUTNcSy2J2sAmX6Ad2bdPvhVnHPUaod8Skpt8DWPpZaiL';
                const { didState } = yield peerDidRegistrar.create(agentContext, {
                    method: 'peer',
                    didDocument,
                    options: {
                        numAlgo: didPeer_1.PeerDidNumAlgo.GenesisDoc,
                    },
                });
                expect(didRepositoryMock.save).toHaveBeenCalledTimes(1);
                const [, didRecord] = (0, helpers_1.mockFunction)(didRepositoryMock.save).mock.calls[0];
                expect(didRecord).toMatchObject({
                    did: did,
                    didDocument: didState.didDocument,
                    role: DidDocumentRole_1.DidDocumentRole.Created,
                    _tags: {
                        recipientKeyFingerprints: didDocument.recipientKeys.map((key) => key.fingerprint),
                    },
                });
            }));
        });
        describe('did:peer:2', () => {
            const key = Key_1.Key.fromFingerprint('z6LShxJc8afmt8L1HKjUE56hXwmAkUhdQygrH1VG2jmb1WRz');
            const verificationMethod = (0, domain_1.getEd25519VerificationKey2018)({
                key,
                // controller in method 1 did should be #id
                controller: '#id',
                // Use relative id for peer dids
                id: '#41fb2ec7-1f8b-42bf-91a2-4ef9092ddc16',
            });
            const didDocument = new domain_1.DidDocumentBuilder('')
                .addVerificationMethod(verificationMethod)
                .addAuthentication(verificationMethod.id)
                .addService(new domain_1.DidCommV1Service({
                id: '#service-0',
                recipientKeys: [verificationMethod.id],
                serviceEndpoint: 'https://example.com',
                accept: ['didcomm/aip2;env=rfc19'],
            }))
                .build();
            it('should correctly create a did:peer:2 document from a did document', () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield peerDidRegistrar.create(agentContext, {
                    method: 'peer',
                    didDocument: didDocument,
                    options: {
                        numAlgo: didPeer_1.PeerDidNumAlgo.MultipleInceptionKeyWithoutDoc,
                    },
                });
                expect(JsonTransformer_1.JsonTransformer.toJSON(result)).toMatchObject({
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'finished',
                        did: 'did:peer:2.Vz6MkkjPVCX7M8D6jJSCQNzYb4T6giuSN8Fm463gWNZ65DMSc.SeyJzIjoiaHR0cHM6Ly9leGFtcGxlLmNvbSIsInQiOiJkaWQtY29tbXVuaWNhdGlvbiIsInByaW9yaXR5IjowLCJyZWNpcGllbnRLZXlzIjpbIiM0MWZiMmVjNy0xZjhiLTQyYmYtOTFhMi00ZWY5MDkyZGRjMTYiXSwiYSI6WyJkaWRjb21tL2FpcDI7ZW52PXJmYzE5Il19',
                        didDocument: {
                            '@context': ['https://w3id.org/did/v1'],
                            id: 'did:peer:2.Vz6MkkjPVCX7M8D6jJSCQNzYb4T6giuSN8Fm463gWNZ65DMSc.SeyJzIjoiaHR0cHM6Ly9leGFtcGxlLmNvbSIsInQiOiJkaWQtY29tbXVuaWNhdGlvbiIsInByaW9yaXR5IjowLCJyZWNpcGllbnRLZXlzIjpbIiM0MWZiMmVjNy0xZjhiLTQyYmYtOTFhMi00ZWY5MDkyZGRjMTYiXSwiYSI6WyJkaWRjb21tL2FpcDI7ZW52PXJmYzE5Il19',
                            service: [
                                {
                                    serviceEndpoint: 'https://example.com',
                                    type: 'did-communication',
                                    priority: 0,
                                    recipientKeys: ['#41fb2ec7-1f8b-42bf-91a2-4ef9092ddc16'],
                                    accept: ['didcomm/aip2;env=rfc19'],
                                    id: '#service-0',
                                },
                            ],
                            verificationMethod: [
                                {
                                    id: '#41fb2ec7-1f8b-42bf-91a2-4ef9092ddc16',
                                    type: 'Ed25519VerificationKey2018',
                                    controller: '#id',
                                    publicKeyBase58: '7H8ScGrunfcGBwMhhRakDMYguLAWiNWhQ2maYH84J8fE',
                                },
                            ],
                            authentication: ['#41fb2ec7-1f8b-42bf-91a2-4ef9092ddc16'],
                        },
                        secret: {},
                    },
                });
            }));
            it('should store the did without the did document', () => __awaiter(void 0, void 0, void 0, function* () {
                const did = 'did:peer:2.Vz6MkkjPVCX7M8D6jJSCQNzYb4T6giuSN8Fm463gWNZ65DMSc.SeyJzIjoiaHR0cHM6Ly9leGFtcGxlLmNvbSIsInQiOiJkaWQtY29tbXVuaWNhdGlvbiIsInByaW9yaXR5IjowLCJyZWNpcGllbnRLZXlzIjpbIiM0MWZiMmVjNy0xZjhiLTQyYmYtOTFhMi00ZWY5MDkyZGRjMTYiXSwiYSI6WyJkaWRjb21tL2FpcDI7ZW52PXJmYzE5Il19';
                yield peerDidRegistrar.create(agentContext, {
                    method: 'peer',
                    didDocument,
                    options: {
                        numAlgo: didPeer_1.PeerDidNumAlgo.MultipleInceptionKeyWithoutDoc,
                    },
                });
                expect(didRepositoryMock.save).toHaveBeenCalledTimes(1);
                const [, didRecord] = (0, helpers_1.mockFunction)(didRepositoryMock.save).mock.calls[0];
                expect(didRecord).toMatchObject({
                    did: did,
                    role: DidDocumentRole_1.DidDocumentRole.Created,
                    _tags: {
                        recipientKeyFingerprints: didDocument.recipientKeys.map((key) => key.fingerprint),
                    },
                    didDocument: undefined,
                });
            }));
        });
        it('should return an error state if an unsupported numAlgo is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield peerDidRegistrar.create(agentContext, 
            // @ts-expect-error - this is not a valid numAlgo
            {
                method: 'peer',
                options: {
                    numAlgo: 4,
                },
            });
            expect(JsonTransformer_1.JsonTransformer.toJSON(result)).toMatchObject({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: 'Missing or incorrect numAlgo provided',
                },
            });
        }));
        it('should return an error state when calling update', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield peerDidRegistrar.update();
            expect(result).toEqual({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: `notImplemented: updating did:peer not implemented yet`,
                },
            });
        }));
        it('should return an error state when calling deactivate', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield peerDidRegistrar.deactivate();
            expect(result).toEqual({
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: `notImplemented: deactivating did:peer not implemented yet`,
                },
            });
        }));
    });
});
