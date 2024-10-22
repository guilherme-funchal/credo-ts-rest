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
const crypto_1 = require("../../../../crypto");
const dids_1 = require("../../../dids");
const helpers_2 = require("../../../dids/helpers");
const DidResolverService_1 = require("../../../dids/services/DidResolverService");
const DidCommDocumentService_1 = require("../DidCommDocumentService");
jest.mock('../../../dids/services/DidResolverService');
const DidResolverServiceMock = DidResolverService_1.DidResolverService;
describe('DidCommDocumentService', () => {
    let didCommDocumentService;
    let didResolverService;
    let agentContext;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        didResolverService = new DidResolverServiceMock();
        didCommDocumentService = new DidCommDocumentService_1.DidCommDocumentService(didResolverService);
        agentContext = (0, helpers_1.getAgentContext)();
    }));
    describe('resolveServicesFromDid', () => {
        test('throw error when resolveDidDocument fails', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('test');
            (0, helpers_1.mockFunction)(didResolverService.resolveDidDocument).mockRejectedValue(error);
            yield expect(didCommDocumentService.resolveServicesFromDid(agentContext, 'did')).rejects.toThrowError(error);
        }));
        test('resolves IndyAgentService', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(didResolverService.resolveDidDocument).mockResolvedValue(new dids_1.DidDocument({
                context: ['https://w3id.org/did/v1'],
                id: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h',
                service: [
                    new dids_1.IndyAgentService({
                        id: 'test-id',
                        serviceEndpoint: 'https://test.com',
                        recipientKeys: ['Q4zqM7aXqm7gDQkUVLng9h'],
                        routingKeys: ['DADEajsDSaksLng9h'],
                        priority: 5,
                    }),
                ],
            }));
            const resolved = yield didCommDocumentService.resolveServicesFromDid(agentContext, 'did:sov:Q4zqM7aXqm7gDQkUVLng9h');
            expect(didResolverService.resolveDidDocument).toHaveBeenCalledWith(agentContext, 'did:sov:Q4zqM7aXqm7gDQkUVLng9h');
            expect(resolved).toHaveLength(1);
            expect(resolved[0]).toMatchObject({
                id: 'test-id',
                serviceEndpoint: 'https://test.com',
                recipientKeys: [(0, helpers_2.verkeyToInstanceOfKey)('Q4zqM7aXqm7gDQkUVLng9h')],
                routingKeys: [(0, helpers_2.verkeyToInstanceOfKey)('DADEajsDSaksLng9h')],
            });
        }));
        test('resolves DidCommV1Service', () => __awaiter(void 0, void 0, void 0, function* () {
            const publicKeyBase58Ed25519 = 'GyYtYWU1vjwd5PFJM4VSX5aUiSV3TyZMuLBJBTQvfdF8';
            const publicKeyBase58X25519 = 'S3AQEEKkGYrrszT9D55ozVVX2XixYp8uynqVm4okbud';
            const Ed25519VerificationMethod = {
                type: 'Ed25519VerificationKey2018',
                controller: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h',
                id: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h#key-1',
                publicKeyBase58: publicKeyBase58Ed25519,
            };
            const X25519VerificationMethod = {
                type: 'X25519KeyAgreementKey2019',
                controller: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h',
                id: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h#key-agreement-1',
                publicKeyBase58: publicKeyBase58X25519,
            };
            (0, helpers_1.mockFunction)(didResolverService.resolveDidDocument).mockResolvedValue(new dids_1.DidDocument({
                context: [
                    'https://w3id.org/did/v1',
                    'https://w3id.org/security/suites/ed25519-2018/v1',
                    'https://w3id.org/security/suites/x25519-2019/v1',
                ],
                id: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h',
                verificationMethod: [Ed25519VerificationMethod, X25519VerificationMethod],
                authentication: [Ed25519VerificationMethod.id],
                keyAgreement: [X25519VerificationMethod.id],
                service: [
                    new dids_1.DidCommV1Service({
                        id: 'test-id',
                        serviceEndpoint: 'https://test.com',
                        recipientKeys: [X25519VerificationMethod.id],
                        routingKeys: [Ed25519VerificationMethod.id],
                        priority: 5,
                    }),
                ],
            }));
            const resolved = yield didCommDocumentService.resolveServicesFromDid(agentContext, 'did:sov:Q4zqM7aXqm7gDQkUVLng9h');
            expect(didResolverService.resolveDidDocument).toHaveBeenCalledWith(agentContext, 'did:sov:Q4zqM7aXqm7gDQkUVLng9h');
            const ed25519Key = crypto_1.Key.fromPublicKeyBase58(publicKeyBase58Ed25519, crypto_1.KeyType.Ed25519);
            expect(resolved).toHaveLength(1);
            expect(resolved[0]).toMatchObject({
                id: 'test-id',
                serviceEndpoint: 'https://test.com',
                recipientKeys: [ed25519Key],
                routingKeys: [ed25519Key],
            });
        }));
        test('resolves specific DidCommV1Service', () => __awaiter(void 0, void 0, void 0, function* () {
            const publicKeyBase58Ed25519 = 'GyYtYWU1vjwd5PFJM4VSX5aUiSV3TyZMuLBJBTQvfdF8';
            const publicKeyBase58X25519 = 'S3AQEEKkGYrrszT9D55ozVVX2XixYp8uynqVm4okbud';
            const Ed25519VerificationMethod = {
                type: 'Ed25519VerificationKey2018',
                controller: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h',
                id: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h#key-1',
                publicKeyBase58: publicKeyBase58Ed25519,
            };
            const X25519VerificationMethod = {
                type: 'X25519KeyAgreementKey2019',
                controller: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h',
                id: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h#key-agreement-1',
                publicKeyBase58: publicKeyBase58X25519,
            };
            (0, helpers_1.mockFunction)(didResolverService.resolveDidDocument).mockResolvedValue(new dids_1.DidDocument({
                context: [
                    'https://w3id.org/did/v1',
                    'https://w3id.org/security/suites/ed25519-2018/v1',
                    'https://w3id.org/security/suites/x25519-2019/v1',
                ],
                id: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h',
                verificationMethod: [Ed25519VerificationMethod, X25519VerificationMethod],
                authentication: [Ed25519VerificationMethod.id],
                keyAgreement: [X25519VerificationMethod.id],
                service: [
                    new dids_1.DidCommV1Service({
                        id: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h#test-id',
                        serviceEndpoint: 'https://test.com',
                        recipientKeys: [X25519VerificationMethod.id],
                        routingKeys: [Ed25519VerificationMethod.id],
                        priority: 5,
                    }),
                    new dids_1.DidCommV1Service({
                        id: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h#test-id-2',
                        serviceEndpoint: 'wss://test.com',
                        recipientKeys: [X25519VerificationMethod.id],
                        routingKeys: [Ed25519VerificationMethod.id],
                        priority: 6,
                    }),
                ],
            }));
            let resolved = yield didCommDocumentService.resolveServicesFromDid(agentContext, 'did:sov:Q4zqM7aXqm7gDQkUVLng9h#test-id');
            expect(didResolverService.resolveDidDocument).toHaveBeenCalledWith(agentContext, 'did:sov:Q4zqM7aXqm7gDQkUVLng9h#test-id');
            let ed25519Key = crypto_1.Key.fromPublicKeyBase58(publicKeyBase58Ed25519, crypto_1.KeyType.Ed25519);
            expect(resolved).toHaveLength(1);
            expect(resolved[0]).toMatchObject({
                id: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h#test-id',
                serviceEndpoint: 'https://test.com',
                recipientKeys: [ed25519Key],
                routingKeys: [ed25519Key],
            });
            resolved = yield didCommDocumentService.resolveServicesFromDid(agentContext, 'did:sov:Q4zqM7aXqm7gDQkUVLng9h#test-id-2');
            expect(didResolverService.resolveDidDocument).toHaveBeenCalledWith(agentContext, 'did:sov:Q4zqM7aXqm7gDQkUVLng9h#test-id-2');
            ed25519Key = crypto_1.Key.fromPublicKeyBase58(publicKeyBase58Ed25519, crypto_1.KeyType.Ed25519);
            expect(resolved).toHaveLength(1);
            expect(resolved[0]).toMatchObject({
                id: 'did:sov:Q4zqM7aXqm7gDQkUVLng9h#test-id-2',
                serviceEndpoint: 'wss://test.com',
                recipientKeys: [ed25519Key],
                routingKeys: [ed25519Key],
            });
        }));
    });
});
