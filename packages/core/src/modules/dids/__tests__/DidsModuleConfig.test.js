"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DidsModuleConfig_1 = require("../DidsModuleConfig");
const methods_1 = require("../methods");
describe('DidsModuleConfig', () => {
    test('sets default values', () => {
        const config = new DidsModuleConfig_1.DidsModuleConfig();
        expect(config.registrars).toEqual([
            expect.any(methods_1.KeyDidRegistrar),
            expect.any(methods_1.PeerDidRegistrar),
            expect.any(methods_1.JwkDidRegistrar),
        ]);
        expect(config.resolvers).toEqual([
            expect.any(methods_1.WebDidResolver),
            expect.any(methods_1.KeyDidResolver),
            expect.any(methods_1.PeerDidResolver),
            expect.any(methods_1.JwkDidResolver),
        ]);
    });
    test('sets values', () => {
        const registrars = [new methods_1.PeerDidRegistrar(), new methods_1.KeyDidRegistrar(), {}];
        const resolvers = [new methods_1.PeerDidResolver(), new methods_1.KeyDidResolver(), {}];
        const config = new DidsModuleConfig_1.DidsModuleConfig({
            registrars,
            resolvers,
        });
        expect(config.registrars).toEqual(registrars);
        expect(config.resolvers).toEqual(resolvers);
    });
    test('adds peer and key did resolvers and registrars if not provided in config', () => {
        const registrar = {};
        const resolver = {};
        const config = new DidsModuleConfig_1.DidsModuleConfig({
            registrars: [registrar],
            resolvers: [resolver],
        });
        expect(config.registrars).toEqual([registrar, expect.any(methods_1.PeerDidRegistrar), expect.any(methods_1.KeyDidRegistrar)]);
        expect(config.resolvers).toEqual([resolver, expect.any(methods_1.PeerDidResolver), expect.any(methods_1.KeyDidResolver)]);
    });
    test('add resolver and registrar after creation', () => {
        const registrar = {};
        const resolver = {};
        const config = new DidsModuleConfig_1.DidsModuleConfig({
            resolvers: [],
            registrars: [],
        });
        expect(config.registrars).not.toContain(registrar);
        expect(config.resolvers).not.toContain(resolver);
        config.addRegistrar(registrar);
        config.addResolver(resolver);
        expect(config.registrars).toContain(registrar);
        expect(config.resolvers).toContain(resolver);
    });
});
