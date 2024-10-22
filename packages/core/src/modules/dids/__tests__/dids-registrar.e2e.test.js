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
const helpers_1 = require("../../../../tests/helpers");
const Agent_1 = require("../../../agent/Agent");
const crypto_1 = require("../../../crypto");
const didPeer_1 = require("../methods/peer/didPeer");
const core_1 = require("@aries-framework/core");
const agentOptions = (0, helpers_1.getAgentOptions)('Faber Dids Registrar', {}, {
    indySdk: new src_1.IndySdkModule({
        indySdk: tests_1.indySdk,
    }),
});
describe('dids', () => {
    let agent;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = new Agent_1.Agent(agentOptions);
        yield agent.initialize();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    it('should create a did:key did', () => __awaiter(void 0, void 0, void 0, function* () {
        const did = yield agent.dids.create({
            method: 'key',
            options: {
                keyType: crypto_1.KeyType.Ed25519,
            },
            secret: {
                privateKey: core_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c7a0fd969598e'),
            },
        });
        // Same seed should resolve to same did:key
        expect(core_1.JsonTransformer.toJSON(did)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'finished',
                did: 'did:key:z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc',
                didDocument: {
                    '@context': [
                        'https://w3id.org/did/v1',
                        'https://w3id.org/security/suites/ed25519-2018/v1',
                        'https://w3id.org/security/suites/x25519-2019/v1',
                    ],
                    alsoKnownAs: undefined,
                    controller: undefined,
                    verificationMethod: [
                        {
                            id: 'did:key:z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc#z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc',
                            type: 'Ed25519VerificationKey2018',
                            controller: 'did:key:z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc',
                            publicKeyBase58: 'ApA26cozGW5Maa62TNTwtgcxrb7bYjAmf9aQ5cYruCDE',
                        },
                    ],
                    service: undefined,
                    authentication: [
                        'did:key:z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc#z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc',
                    ],
                    assertionMethod: [
                        'did:key:z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc#z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc',
                    ],
                    keyAgreement: [
                        {
                            id: 'did:key:z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc#z6LSjDbRQQKm9HM4qPBErYyX93BCSzSk1XkwP5EgDrL6eNhh',
                            type: 'X25519KeyAgreementKey2019',
                            controller: 'did:key:z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc',
                            publicKeyBase58: '8YRFt6Wu3pdKjzoUKuTZpSxibqudJvanW6WzjPgZvzvw',
                        },
                    ],
                    capabilityInvocation: [
                        'did:key:z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc#z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc',
                    ],
                    capabilityDelegation: [
                        'did:key:z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc#z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc',
                    ],
                    id: 'did:key:z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc',
                },
                secret: { privateKey: core_1.TypedArrayEncoder.fromString('96213c3d7fc8d4d6754c7a0fd969598e') },
            },
        });
    }));
    it('should create a did:peer did', () => __awaiter(void 0, void 0, void 0, function* () {
        const privateKey = core_1.TypedArrayEncoder.fromString('e008ef10b7c163114b3857542b3736eb');
        const did = yield agent.dids.create({
            method: 'peer',
            options: {
                keyType: crypto_1.KeyType.Ed25519,
                numAlgo: didPeer_1.PeerDidNumAlgo.InceptionKeyWithoutDoc,
            },
            secret: {
                privateKey,
            },
        });
        // Same seed should resolve to same did:peer
        expect(core_1.JsonTransformer.toJSON(did)).toMatchObject({
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'finished',
                did: 'did:peer:0z6Mkuo91yRhTWDrFkdNBcLXAbvtUiq2J9E4QQcfYZt4hevkh',
                didDocument: {
                    '@context': [
                        'https://w3id.org/did/v1',
                        'https://w3id.org/security/suites/ed25519-2018/v1',
                        'https://w3id.org/security/suites/x25519-2019/v1',
                    ],
                    alsoKnownAs: undefined,
                    controller: undefined,
                    verificationMethod: [
                        {
                            id: 'did:peer:0z6Mkuo91yRhTWDrFkdNBcLXAbvtUiq2J9E4QQcfYZt4hevkh#z6Mkuo91yRhTWDrFkdNBcLXAbvtUiq2J9E4QQcfYZt4hevkh',
                            type: 'Ed25519VerificationKey2018',
                            controller: 'did:peer:0z6Mkuo91yRhTWDrFkdNBcLXAbvtUiq2J9E4QQcfYZt4hevkh',
                            publicKeyBase58: 'GLsyPBT2AgMne8XUvmZKkqLUuFkSjLp3ibkcjc6gjhyK',
                        },
                    ],
                    service: undefined,
                    authentication: [
                        'did:peer:0z6Mkuo91yRhTWDrFkdNBcLXAbvtUiq2J9E4QQcfYZt4hevkh#z6Mkuo91yRhTWDrFkdNBcLXAbvtUiq2J9E4QQcfYZt4hevkh',
                    ],
                    assertionMethod: [
                        'did:peer:0z6Mkuo91yRhTWDrFkdNBcLXAbvtUiq2J9E4QQcfYZt4hevkh#z6Mkuo91yRhTWDrFkdNBcLXAbvtUiq2J9E4QQcfYZt4hevkh',
                    ],
                    keyAgreement: [
                        {
                            id: 'did:peer:0z6Mkuo91yRhTWDrFkdNBcLXAbvtUiq2J9E4QQcfYZt4hevkh#z6LSdqscQpQy12kNU1kYf7odtabo2Nhr3x3coUjsUZgwxwCj',
                            type: 'X25519KeyAgreementKey2019',
                            controller: 'did:peer:0z6Mkuo91yRhTWDrFkdNBcLXAbvtUiq2J9E4QQcfYZt4hevkh',
                            publicKeyBase58: '3AhStWc6ua2dNdNn8UHgZzPKBEAjMLsTvW2Bz73RFZRy',
                        },
                    ],
                    capabilityInvocation: [
                        'did:peer:0z6Mkuo91yRhTWDrFkdNBcLXAbvtUiq2J9E4QQcfYZt4hevkh#z6Mkuo91yRhTWDrFkdNBcLXAbvtUiq2J9E4QQcfYZt4hevkh',
                    ],
                    capabilityDelegation: [
                        'did:peer:0z6Mkuo91yRhTWDrFkdNBcLXAbvtUiq2J9E4QQcfYZt4hevkh#z6Mkuo91yRhTWDrFkdNBcLXAbvtUiq2J9E4QQcfYZt4hevkh',
                    ],
                    id: 'did:peer:0z6Mkuo91yRhTWDrFkdNBcLXAbvtUiq2J9E4QQcfYZt4hevkh',
                },
                secret: { privateKey },
            },
        });
    }));
});
