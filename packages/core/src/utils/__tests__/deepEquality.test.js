"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Metadata_1 = require("../../storage/Metadata");
const deepEquality_1 = require("../deepEquality");
describe('deepEquality', () => {
    test('evaluates to true with equal maps', () => {
        const a = new Map([
            ['foo', 1],
            ['bar', 2],
            ['baz', 3],
        ]);
        const b = new Map([
            ['foo', 1],
            ['bar', 2],
            ['baz', 3],
        ]);
        expect((0, deepEquality_1.deepEquality)(a, b)).toBe(true);
    });
    test('evaluates to false with unequal maps', () => {
        const c = new Map([
            ['foo', 1],
            ['baz', 3],
            ['bar', 2],
        ]);
        const d = new Map([
            ['foo', 1],
            ['bar', 2],
            ['qux', 3],
        ]);
        expect((0, deepEquality_1.deepEquality)(c, d)).toBe(false);
    });
    test('evaluates to true with equal maps with different order', () => {
        const a = new Map([
            ['baz', 3],
            ['bar', 2],
            ['foo', 1],
        ]);
        const b = new Map([
            ['foo', 1],
            ['bar', 2],
            ['baz', 3],
        ]);
        expect((0, deepEquality_1.deepEquality)(a, b)).toBe(true);
    });
    test('evaluates to true with equal primitives', () => {
        expect((0, deepEquality_1.deepEquality)(1, 1)).toBe(true);
        expect((0, deepEquality_1.deepEquality)(true, true)).toBe(true);
        expect((0, deepEquality_1.deepEquality)('a', 'a')).toBe(true);
    });
    test('evaluates to false with unequal primitives', () => {
        expect((0, deepEquality_1.deepEquality)(1, 2)).toBe(false);
        expect((0, deepEquality_1.deepEquality)(true, false)).toBe(false);
        expect((0, deepEquality_1.deepEquality)('a', 'b')).toBe(false);
    });
    test('evaluates to true with equal complex types', () => {
        const fn = () => 'hello World!';
        expect((0, deepEquality_1.deepEquality)(fn, fn)).toBe(true);
        expect((0, deepEquality_1.deepEquality)({}, {})).toBe(true);
        expect((0, deepEquality_1.deepEquality)({ foo: 'bar' }, { foo: 'bar' })).toBe(true);
        expect((0, deepEquality_1.deepEquality)({ foo: 'baz', bar: 'bar' }, { bar: 'bar', foo: 'baz' })).toBe(true);
        expect((0, deepEquality_1.deepEquality)(Metadata_1.Metadata, Metadata_1.Metadata)).toBe(true);
        expect((0, deepEquality_1.deepEquality)(new Metadata_1.Metadata({}), new Metadata_1.Metadata({}))).toBe(true);
    });
    test('evaluates to false with unequal complex types', () => {
        const fn = () => 'hello World!';
        const fnTwo = () => 'Goodbye World!';
        class Bar {
            constructor() {
                'yes';
            }
        }
        expect((0, deepEquality_1.deepEquality)(fn, fnTwo)).toBe(false);
        expect((0, deepEquality_1.deepEquality)({ bar: 'foo' }, { a: 'b' })).toBe(false);
        expect((0, deepEquality_1.deepEquality)({ b: 'a' }, { b: 'a', c: 'd' })).toBe(false);
        expect((0, deepEquality_1.deepEquality)(Metadata_1.Metadata, Bar)).toBe(false);
        expect((0, deepEquality_1.deepEquality)(new Metadata_1.Metadata({}), new Bar())).toBe(false);
    });
});
