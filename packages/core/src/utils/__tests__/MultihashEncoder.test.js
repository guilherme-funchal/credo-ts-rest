"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Hasher_1 = require("../Hasher");
const MultiHashEncoder_1 = require("../MultiHashEncoder");
const buffer_1 = require("../buffer");
const validData = buffer_1.Buffer.from('Hello World!');
const validMultiHash = new Uint8Array([
    18, 32, 127, 131, 177, 101, 127, 241, 252, 83, 185, 45, 193, 129, 72, 161, 214, 93, 252, 45, 75, 31, 163, 214, 119,
    40, 74, 221, 210, 0, 18, 109, 144, 105,
]);
const validHash = Hasher_1.Hasher.hash(validData, 'sha2-256');
const invalidMultiHash = new Uint8Array([99, 12, 72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]);
describe('MultiHashEncoder', () => {
    describe('encode()', () => {
        it('encodes multihash', () => {
            const multihash = MultiHashEncoder_1.MultiHashEncoder.encode(validData, 'sha2-256');
            expect(multihash.equals(buffer_1.Buffer.from(validMultiHash))).toBe(true);
        });
    });
    describe('decode()', () => {
        it('Decodes multihash', () => {
            const { data, hashName } = MultiHashEncoder_1.MultiHashEncoder.decode(validMultiHash);
            expect(hashName).toEqual('sha2-256');
            expect(data.equals(buffer_1.Buffer.from(validHash))).toBe(true);
        });
        it('Decodes invalid multihash', () => {
            expect(() => {
                MultiHashEncoder_1.MultiHashEncoder.decode(invalidMultiHash);
            }).toThrow();
        });
    });
    describe('isValid()', () => {
        it('Validates valid multihash', () => {
            expect(MultiHashEncoder_1.MultiHashEncoder.isValid(validMultiHash)).toEqual(true);
        });
        it('Validates invalid multihash', () => {
            expect(MultiHashEncoder_1.MultiHashEncoder.isValid(invalidMultiHash)).toEqual(false);
        });
    });
});
