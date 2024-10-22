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
const rxjs_1 = require("rxjs");
const InMemoryStorageService_1 = require("../../../../../../tests/InMemoryStorageService");
const src_1 = require("../../../../../indy-sdk/src");
const setupIndySdkModule_1 = require("../../../../../indy-sdk/tests/setupIndySdkModule");
const helpers_1 = require("../../../../tests/helpers");
const EventEmitter_1 = require("../../../agent/EventEmitter");
const constants_1 = require("../../../constants");
const crypto_1 = require("../../../crypto");
const signing_provider_1 = require("../../../crypto/signing-provider");
const utils_1 = require("../../../utils");
const DidsModuleConfig_1 = require("../DidsModuleConfig");
const domain_1 = require("../domain");
const DidDocumentRole_1 = require("../domain/DidDocumentRole");
const methods_1 = require("../methods");
const key_1 = require("../methods/key");
const didPeer_1 = require("../methods/peer/didPeer");
const peerDidNumAlgo1_1 = require("../methods/peer/peerDidNumAlgo1");
const repository_1 = require("../repository");
const services_1 = require("../services");
const didPeer1zQmY_json_1 = __importDefault(require("./__fixtures__/didPeer1zQmY.json"));
describe('peer dids', () => {
    const config = (0, helpers_1.getAgentConfig)('Peer DIDs Lifecycle');
    let didRepository;
    let didResolverService;
    let wallet;
    let agentContext;
    let eventEmitter;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        wallet = new src_1.IndySdkWallet(setupIndySdkModule_1.indySdk, config.logger, new signing_provider_1.SigningProviderRegistry([]));
        const storageService = new InMemoryStorageService_1.InMemoryStorageService();
        eventEmitter = new EventEmitter_1.EventEmitter(config.agentDependencies, new rxjs_1.Subject());
        didRepository = new repository_1.DidRepository(storageService, eventEmitter);
        agentContext = (0, helpers_1.getAgentContext)({
            wallet,
            registerInstances: [
                [repository_1.DidRepository, didRepository],
                [constants_1.InjectionSymbols.StorageService, storageService],
            ],
        });
        yield wallet.createAndOpen(config.walletConfig);
        didResolverService = new services_1.DidResolverService(config.logger, new DidsModuleConfig_1.DidsModuleConfig({ resolvers: [new methods_1.PeerDidResolver()] }));
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield wallet.delete();
    }));
    test('create a peer did method 1 document from ed25519 keys with a service', () => __awaiter(void 0, void 0, void 0, function* () {
        // The following scenario show how we could create a key and create a did document from it for DID Exchange
        const ed25519Key = yield wallet.createKey({
            privateKey: utils_1.TypedArrayEncoder.fromString('astringoftotalin32characterslong'),
            keyType: crypto_1.KeyType.Ed25519,
        });
        const mediatorEd25519Key = yield wallet.createKey({
            privateKey: utils_1.TypedArrayEncoder.fromString('anotherstringof32characterslong1'),
            keyType: crypto_1.KeyType.Ed25519,
        });
        const x25519Key = crypto_1.Key.fromPublicKey((0, domain_1.convertPublicKeyToX25519)(ed25519Key.publicKey), crypto_1.KeyType.X25519);
        const ed25519VerificationMethod = (0, domain_1.getEd25519VerificationKey2018)({
            // The id can either be the first 8 characters of the key data (for ed25519 it's publicKeyBase58)
            // uuid is easier as it is consistent between different key types. Normally you would dynamically
            // generate the uuid, but static for testing purposes
            id: `#d0d32199-851f-48e3-b178-6122bd4216a4`,
            key: ed25519Key,
            // For peer dids generated with method 1, the controller MUST be #id as we don't know the did yet
            controller: '#id',
        });
        const x25519VerificationMethod = (0, domain_1.getX25519KeyAgreementKey2019)({
            // The id can either be the first 8 characters of the key data (for ed25519 it's publicKeyBase58)
            // uuid is easier as it is consistent between different key types. Normally you would dynamically
            // generate the uuid, but static for testing purposes
            id: `#08673492-3c44-47fe-baa4-a1780c585d75`,
            key: x25519Key,
            // For peer dids generated with method 1, the controller MUST be #id as we don't know the did yet
            controller: '#id',
        });
        const mediatorEd25519DidKey = new key_1.DidKey(mediatorEd25519Key);
        const mediatorX25519Key = crypto_1.Key.fromPublicKey((0, domain_1.convertPublicKeyToX25519)(mediatorEd25519Key.publicKey), crypto_1.KeyType.X25519);
        // Use ed25519 did:key, which also includes the x25519 key used for didcomm
        const mediatorRoutingKey = `${mediatorEd25519DidKey.did}#${mediatorX25519Key.fingerprint}`;
        const service = new domain_1.DidCommV1Service({
            id: '#service-0',
            // Fixme: can we use relative reference (#id) instead of absolute reference here (did:example:123#id)?
            // We don't know the did yet
            recipientKeys: [ed25519VerificationMethod.id],
            serviceEndpoint: 'https://example.com',
            accept: ['didcomm/aip2;env=rfc19'],
            // It is important that we encode the routing keys as key references.
            // So instead of using plain verkeys, we should encode them as did:key dids
            routingKeys: [mediatorRoutingKey],
        });
        const didDocument = 
        // placeholder did, as it is generated from the did document
        new domain_1.DidDocumentBuilder('')
            // ed25519 authentication method for signatures
            .addAuthentication(ed25519VerificationMethod)
            // x25519 for key agreement
            .addKeyAgreement(x25519VerificationMethod)
            .addService(service)
            .build();
        const didDocumentJson = didDocument.toJSON();
        const did = (0, peerDidNumAlgo1_1.didDocumentJsonToNumAlgo1Did)(didDocumentJson);
        expect(did).toBe(didPeer1zQmY_json_1.default.id);
        // Set did after generating it
        didDocument.id = did;
        expect(didDocument.toJSON()).toMatchObject(didPeer1zQmY_json_1.default);
        // Save the record to storage
        const didDocumentRecord = new repository_1.DidRecord({
            did: didPeer1zQmY_json_1.default.id,
            role: DidDocumentRole_1.DidDocumentRole.Created,
            // It is important to take the did document from the PeerDid class
            // as it will have the id property
            didDocument: didDocument,
            tags: {
                // We need to save the recipientKeys, so we can find the associated did
                // of a key when we receive a message from another connection.
                recipientKeyFingerprints: didDocument.recipientKeys.map((key) => key.fingerprint),
            },
        });
        yield didRepository.save(agentContext, didDocumentRecord);
    }));
    test('receive a did and did document', () => __awaiter(void 0, void 0, void 0, function* () {
        // This flow assumes peer dids. When implementing for did exchange other did methods could be used
        // We receive the did and did document from the did exchange message (request or response)
        // It is important to not parse the did document to a DidDocument class yet as we need the raw json
        // to consistently verify the hash of the did document
        const did = didPeer1zQmY_json_1.default.id;
        const numAlgo = (0, didPeer_1.getNumAlgoFromPeerDid)(did);
        // Note that the did document could be undefined (if inlined did:peer or public did)
        const didDocument = utils_1.JsonTransformer.fromJSON(didPeer1zQmY_json_1.default, domain_1.DidDocument);
        // make sure the dids are valid by matching them against our encoded variants
        expect((0, peerDidNumAlgo1_1.didDocumentJsonToNumAlgo1Did)(didPeer1zQmY_json_1.default)).toBe(did);
        // If a did document was provided, we match it against the did document of the peer did
        // This validates whether we get the same did document
        if (didDocument) {
            expect(didDocument.toJSON()).toMatchObject(didPeer1zQmY_json_1.default);
        }
        const didDocumentRecord = new repository_1.DidRecord({
            did: did,
            role: DidDocumentRole_1.DidDocumentRole.Received,
            // If the method is a genesis doc (did:peer:1) we should store the document
            // Otherwise we only need to store the did itself (as the did can be generated)
            didDocument: numAlgo === didPeer_1.PeerDidNumAlgo.GenesisDoc ? didDocument : undefined,
            tags: {
                // We need to save the recipientKeys, so we can find the associated did
                // of a key when we receive a message from another connection.
                recipientKeyFingerprints: didDocument.recipientKeys.map((key) => key.fingerprint),
            },
        });
        yield didRepository.save(agentContext, didDocumentRecord);
        // Then we save the did (not the did document) in the connection record
        // connectionRecord.theirDid = didPeer.did
        // Then when we want to send a message we can resolve the did document
        const { didDocument: resolvedDidDocument } = yield didResolverService.resolve(agentContext, did);
        expect(resolvedDidDocument).toBeInstanceOf(domain_1.DidDocument);
        expect(resolvedDidDocument === null || resolvedDidDocument === void 0 ? void 0 : resolvedDidDocument.toJSON()).toMatchObject(didPeer1zQmY_json_1.default);
    }));
});
