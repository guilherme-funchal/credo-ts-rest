"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MultiBaseEncoder_1 = require("../MultiBaseEncoder");
const TypedArrayEncoder_1 = require("../TypedArrayEncoder");
const buffer_1 = require("../buffer");
const validData = buffer_1.Buffer.from('Hello World!');
const validMultiBase = 'zKWfinQuRQ3ekD1danFHqvKRg9koFp8vpokUeREEgjSyHwweeKDFaxVHi';
const invalidMultiBase = 'gKWfinQuRQ3ekD1danFHqvKRg9koFp8vpokUeREEgjSyHwweeKDFaxVHi';
describe('MultiBaseEncoder', () => {
    describe('encode()', () => {
        it('Encodes valid multibase', () => {
            const multibase = MultiBaseEncoder_1.MultiBaseEncoder.encode(validData, 'base58btc');
            expect(multibase).toEqual('z2NEpo7TZRRrLZSi2U');
        });
    });
    describe('Decodes()', () => {
        it('Decodes multibase', () => {
            const { data, baseName } = MultiBaseEncoder_1.MultiBaseEncoder.decode(validMultiBase);
            expect(TypedArrayEncoder_1.TypedArrayEncoder.toUtf8String(data)).toEqual('This is a valid base58btc encoded string!');
            expect(baseName).toEqual('base58btc');
        });
        it('Decodes invalid multibase', () => {
            expect(() => {
                MultiBaseEncoder_1.MultiBaseEncoder.decode(invalidMultiBase);
            }).toThrow(/^No decoder found for multibase prefix/);
        });
    });
    describe('isValid()', () => {
        it('Validates valid multibase', () => {
            expect(MultiBaseEncoder_1.MultiBaseEncoder.isValid(validMultiBase)).toEqual(true);
        });
        it('Validates invalid multibase', () => {
            expect(MultiBaseEncoder_1.MultiBaseEncoder.isValid(invalidMultiBase)).toEqual(false);
        });
    });
});
