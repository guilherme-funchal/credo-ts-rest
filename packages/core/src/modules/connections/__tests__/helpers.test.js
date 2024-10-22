"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dids_1 = require("../../dids");
const models_1 = require("../models");
const helpers_1 = require("../services/helpers");
const key = new models_1.Ed25119Sig2018({
    id: 'did:sov:SKJVx2kn373FNgvff1SbJo#4',
    controller: 'did:sov:SKJVx2kn373FNgvff1SbJo',
    publicKeyBase58: 'EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d',
});
const didDoc = new models_1.DidDoc({
    authentication: [
        new models_1.ReferencedAuthentication(key, 'Ed25519SignatureAuthentication2018'),
        new models_1.EmbeddedAuthentication(new models_1.Ed25119Sig2018({
            id: '#8',
            controller: 'did:sov:SKJVx2kn373FNgvff1SbJo',
            publicKeyBase58: '5UQ3drtEMMQXaLLmEywbciW92jZaQgRYgfuzXfonV8iz',
        })),
    ],
    id: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
    publicKey: [
        key,
        new models_1.RsaSig2018({
            id: '#3',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyPem: '-----BEGIN PUBLIC X...',
        }),
        new models_1.EddsaSaSigSecp256k1({
            id: '#6',
            controller: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            publicKeyHex: '-----BEGIN PUBLIC A...',
        }),
    ],
    service: [
        new dids_1.IndyAgentService({
            id: 'did:sov:SKJVx2kn373FNgvff1SbJo#service-1',
            serviceEndpoint: 'did:sov:SKJVx2kn373FNgvff1SbJo',
            recipientKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
            routingKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
            priority: 5,
        }),
        new dids_1.DidCommV1Service({
            id: '#service-2',
            serviceEndpoint: 'https://agent.com',
            recipientKeys: ['did:sov:SKJVx2kn373FNgvff1SbJo#4', '#8'],
            routingKeys: [
                'did:key:z6MktFXxTu8tHkoE1Jtqj4ApYEg1c44qmU1p7kq7QZXBtJv1#z6MktFXxTu8tHkoE1Jtqj4ApYEg1c44qmU1p7kq7QZXBtJv1',
            ],
            priority: 2,
        }),
    ],
});
describe('convertToNewDidDocument', () => {
    test('create a new DidDocument and with authentication, publicKey and service from DidDoc', () => {
        const oldDocument = didDoc;
        const newDocument = (0, helpers_1.convertToNewDidDocument)(oldDocument);
        expect(newDocument.authentication).toEqual(['#EoGusetS', '#5UQ3drtE']);
        expect(newDocument.verificationMethod).toEqual([
            new dids_1.VerificationMethod({
                id: '#5UQ3drtE',
                type: 'Ed25519VerificationKey2018',
                controller: '#id',
                publicKeyBase58: '5UQ3drtEMMQXaLLmEywbciW92jZaQgRYgfuzXfonV8iz',
            }),
            new dids_1.VerificationMethod({
                id: '#EoGusetS',
                type: 'Ed25519VerificationKey2018',
                controller: '#id',
                publicKeyBase58: 'EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d',
            }),
        ]);
        expect(newDocument.service).toEqual([
            new dids_1.IndyAgentService({
                id: '#service-1',
                serviceEndpoint: 'did:sov:SKJVx2kn373FNgvff1SbJo',
                recipientKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
                routingKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
                priority: 5,
            }),
            new dids_1.DidCommV1Service({
                id: '#service-2',
                serviceEndpoint: 'https://agent.com',
                recipientKeys: ['#EoGusetS', '#5UQ3drtE'],
                routingKeys: [
                    'did:key:z6MktFXxTu8tHkoE1Jtqj4ApYEg1c44qmU1p7kq7QZXBtJv1#z6MktFXxTu8tHkoE1Jtqj4ApYEg1c44qmU1p7kq7QZXBtJv1',
                ],
                priority: 2,
            }),
        ]);
    });
    test('will use ; as an id mark instead of # if the # is missing in a service id', () => {
        const oldDocument = new models_1.DidDoc({
            id: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            authentication: [],
            publicKey: [],
            service: [
                new dids_1.IndyAgentService({
                    id: 'did:sov:SKJVx2kn373FNgvff1SbJo;service-1',
                    serviceEndpoint: 'did:sov:SKJVx2kn373FNgvff1SbJo',
                    recipientKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
                    routingKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
                    priority: 5,
                }),
            ],
        });
        const newDocument = (0, helpers_1.convertToNewDidDocument)(oldDocument);
        expect(newDocument.service).toEqual([
            new dids_1.IndyAgentService({
                id: '#service-1',
                serviceEndpoint: 'did:sov:SKJVx2kn373FNgvff1SbJo',
                recipientKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
                routingKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
                priority: 5,
            }),
        ]);
    });
    test('will only split on the first ; or # and leave the other ones in place as id values', () => {
        const oldDocument = new models_1.DidDoc({
            id: 'did:sov:LjgpST2rjsoxYegQDRm7EL',
            authentication: [],
            publicKey: [],
            service: [
                new dids_1.IndyAgentService({
                    id: 'did:sov:SKJVx2kn373FNgvff1SbJo;service-1;something-extra',
                    serviceEndpoint: 'did:sov:SKJVx2kn373FNgvff1SbJo',
                    recipientKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
                    routingKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
                    priority: 6,
                }),
                new dids_1.IndyAgentService({
                    id: 'did:sov:SKJVx2kn373FNgvff1SbJo#service-2#something-extra',
                    serviceEndpoint: 'did:sov:SKJVx2kn373FNgvff1SbJo',
                    recipientKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
                    routingKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
                    priority: 5,
                }),
            ],
        });
        const newDocument = (0, helpers_1.convertToNewDidDocument)(oldDocument);
        expect(newDocument.service).toEqual([
            new dids_1.IndyAgentService({
                id: '#service-1;something-extra',
                serviceEndpoint: 'did:sov:SKJVx2kn373FNgvff1SbJo',
                recipientKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
                routingKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
                priority: 6,
            }),
            new dids_1.IndyAgentService({
                id: '#service-2#something-extra',
                serviceEndpoint: 'did:sov:SKJVx2kn373FNgvff1SbJo',
                recipientKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
                routingKeys: ['EoGusetSxDJktp493VCyh981nUnzMamTRjvBaHZAy68d'],
                priority: 5,
            }),
        ]);
    });
});
