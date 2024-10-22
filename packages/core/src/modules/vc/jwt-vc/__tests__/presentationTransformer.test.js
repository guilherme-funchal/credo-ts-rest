"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("../../../../crypto/jose/jwt");
const utils_1 = require("../../../../utils");
const models_1 = require("../../models");
const W3cJwtVerifiableCredential_1 = require("../W3cJwtVerifiableCredential");
const presentationTransformer_1 = require("../presentationTransformer");
const afj_jwt_vc_1 = require("./fixtures/afj-jwt-vc");
describe('presentationTransformer', () => {
    describe('getJwtPayloadFromPresentation', () => {
        test('extracts jwt payload from presentation', () => {
            const presentation = new models_1.W3cPresentation({
                id: 'urn:123',
                holder: 'did:example:123',
                verifiableCredential: [W3cJwtVerifiableCredential_1.W3cJwtVerifiableCredential.fromSerializedJwt(afj_jwt_vc_1.AfjEs256DidJwkJwtVc)],
            });
            const jwtPayload = (0, presentationTransformer_1.getJwtPayloadFromPresentation)(presentation);
            expect(jwtPayload.toJson()).toEqual({
                vp: {
                    '@context': ['https://www.w3.org/2018/credentials/v1'],
                    type: ['VerifiablePresentation'],
                    verifiableCredential: [afj_jwt_vc_1.AfjEs256DidJwkJwtVc],
                },
                iss: 'did:example:123',
                jti: 'urn:123',
                sub: undefined,
                aud: undefined,
                exp: undefined,
                iat: undefined,
            });
        });
    });
    describe('getPresentationFromJwtPayload', () => {
        test('extracts presentation from jwt payload', () => {
            const vp = {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                type: ['VerifiablePresentation'],
                verifiableCredential: [afj_jwt_vc_1.AfjEs256DidJwkJwtVc],
                id: 'urn:123',
                holder: 'did:example:123',
            };
            const jwtPayload = new jwt_1.JwtPayload({
                iss: 'did:example:123',
                nbf: undefined,
                exp: undefined,
                sub: undefined,
                jti: 'urn:123',
                additionalClaims: {
                    vp,
                },
            });
            const presentation = utils_1.JsonTransformer.toJSON((0, presentationTransformer_1.getPresentationFromJwtPayload)(jwtPayload));
            expect(presentation).toEqual({
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                type: ['VerifiablePresentation'],
                id: 'urn:123',
                holder: 'did:example:123',
                verifiableCredential: [afj_jwt_vc_1.AfjEs256DidJwkJwtVc],
            });
        });
        test(`throw error if jwt payload does not contain 'vp' property or it is not an object`, () => {
            const jwtPayload = new jwt_1.JwtPayload({});
            expect(() => (0, presentationTransformer_1.getPresentationFromJwtPayload)(jwtPayload)).toThrowError("JWT does not contain a valid 'vp' claim");
            jwtPayload.additionalClaims.vp = 'invalid';
            expect(() => (0, presentationTransformer_1.getPresentationFromJwtPayload)(jwtPayload)).toThrowError("JWT does not contain a valid 'vp' claim");
        });
        test(`throw error if jwt vp has an id and it does not match the jti`, () => {
            const vp = {
                id: '13',
            };
            const jwtPayload = new jwt_1.JwtPayload({
                jti: '12',
                additionalClaims: {
                    vp,
                },
            });
            expect(() => (0, presentationTransformer_1.getPresentationFromJwtPayload)(jwtPayload)).toThrowError('JWT jti and vp.id do not match');
        });
        test(`throw error if jwt vp has an holder id and it does not match the iss`, () => {
            const vp = {
                holder: '123',
            };
            const jwtPayload = new jwt_1.JwtPayload({
                iss: 'iss',
                additionalClaims: {
                    vp,
                },
            });
            expect(() => (0, presentationTransformer_1.getPresentationFromJwtPayload)(jwtPayload)).toThrowError('JWT iss and vp.holder(.id) do not match');
            // nested holder object
            vp.holder = { id: '123' };
            expect(() => (0, presentationTransformer_1.getPresentationFromJwtPayload)(jwtPayload)).toThrowError('JWT iss and vp.holder(.id) do not match');
        });
        test(`throw validation error if vp is not a valid w3c vp`, () => {
            const vp = {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                type: ['VerifiablePresentation2'],
                verifiableCredential: [afj_jwt_vc_1.AfjEs256DidJwkJwtVc],
            };
            const jwtPayload = new jwt_1.JwtPayload({
                additionalClaims: {
                    vp,
                },
            });
            expect(() => (0, presentationTransformer_1.getPresentationFromJwtPayload)(jwtPayload)).toThrowError('property type has failed the following constraints: type must be an array of strings which includes "VerifiablePresentation"');
        });
    });
});
