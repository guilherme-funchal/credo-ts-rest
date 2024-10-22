"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const JwtPayload_1 = require("../JwtPayload");
describe('JwtPayload', () => {
    test('create JwtPayload from json', () => {
        const jwtPayload = JwtPayload_1.JwtPayload.fromJson({
            iss: 'issuer',
            sub: 'subject',
            aud: 'audience',
            exp: 123,
            nbf: 123,
            iat: 123,
            jti: 'jwtid',
            someAdditional: 'claim',
            and: {
                another: 'claim',
            },
        });
        expect(jwtPayload.iss).toBe('issuer');
        expect(jwtPayload.sub).toBe('subject');
        expect(jwtPayload.aud).toBe('audience');
        expect(jwtPayload.exp).toBe(123);
        expect(jwtPayload.nbf).toBe(123);
        expect(jwtPayload.iat).toBe(123);
        expect(jwtPayload.jti).toBe('jwtid');
        expect(jwtPayload.additionalClaims).toEqual({
            someAdditional: 'claim',
            and: {
                another: 'claim',
            },
        });
    });
    test('validate jwt payload', () => {
        const jwtPayload = JwtPayload_1.JwtPayload.fromJson({});
        jwtPayload.exp = 123;
        expect(() => jwtPayload.validate({ now: 200, skewTime: 1 })).toThrowError('JWT expired at 123');
        expect(() => jwtPayload.validate({ now: 100, skewTime: 1 })).not.toThrow();
        jwtPayload.nbf = 80;
        expect(() => jwtPayload.validate({ now: 75, skewTime: 1 })).toThrowError('JWT not valid before 80');
        expect(() => jwtPayload.validate({ now: 100, skewTime: 1 })).not.toThrow();
        jwtPayload.iat = 90;
        expect(() => jwtPayload.validate({ now: 85, skewTime: 1 })).toThrowError('JWT issued in the future at 90');
        expect(() => jwtPayload.validate({ now: 100, skewTime: 1 })).not.toThrow();
    });
    test('throws error for invalid values', () => {
        expect(() => JwtPayload_1.JwtPayload.fromJson({ iss: {} })).toThrowError('JWT payload iss must be a string');
        expect(() => JwtPayload_1.JwtPayload.fromJson({ sub: {} })).toThrowError('JWT payload sub must be a string');
        expect(() => JwtPayload_1.JwtPayload.fromJson({ aud: {} })).toThrowError('JWT payload aud must be a string or an array of strings');
        expect(() => JwtPayload_1.JwtPayload.fromJson({ aud: [1, 'string'] })).toThrowError('JWT payload aud must be a string or an array of strings');
        expect(() => JwtPayload_1.JwtPayload.fromJson({ exp: '10' })).toThrowError('JWT payload exp must be a positive number');
        expect(() => JwtPayload_1.JwtPayload.fromJson({ exp: -1 })).toThrowError('JWT payload exp must be a positive number');
        expect(() => JwtPayload_1.JwtPayload.fromJson({ nbf: '10' })).toThrowError('JWT payload nbf must be a positive number');
        expect(() => JwtPayload_1.JwtPayload.fromJson({ nbf: -1 })).toThrowError('JWT payload nbf must be a positive number');
        expect(() => JwtPayload_1.JwtPayload.fromJson({ iat: '10' })).toThrowError('JWT payload iat must be a positive number');
        expect(() => JwtPayload_1.JwtPayload.fromJson({ iat: -1 })).toThrowError('JWT payload iat must be a positive number');
        expect(() => JwtPayload_1.JwtPayload.fromJson({ jti: {} })).toThrowError('JWT payload jti must be a string');
    });
    test('correctly outputs json', () => {
        const jwtPayload = new JwtPayload_1.JwtPayload({
            iss: 'issuer',
            sub: 'subject',
            aud: 'audience',
            exp: 123,
            nbf: 123,
            iat: 123,
            jti: 'jwtid',
            additionalClaims: {
                someAdditional: 'claim',
                and: {
                    another: 'claim',
                },
            },
        });
        expect(jwtPayload.toJson()).toEqual({
            iss: 'issuer',
            sub: 'subject',
            aud: 'audience',
            exp: 123,
            nbf: 123,
            iat: 123,
            jti: 'jwtid',
            someAdditional: 'claim',
            and: {
                another: 'claim',
            },
        });
    });
});
