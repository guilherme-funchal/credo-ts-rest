"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const version_1 = require("../version");
describe('version', () => {
    describe('parseVersionString()', () => {
        it('parses a version string to a tuple', () => {
            expect((0, version_1.parseVersionString)('1.0')).toStrictEqual([1, 0, 0]);
            expect((0, version_1.parseVersionString)('2.12')).toStrictEqual([2, 12, 0]);
            expect((0, version_1.parseVersionString)('2.3.1')).toStrictEqual([2, 3, 1]);
            expect((0, version_1.parseVersionString)('0.2.1')).toStrictEqual([0, 2, 1]);
            expect((0, version_1.parseVersionString)('0.0')).toStrictEqual([0, 0, 0]);
        });
    });
    describe('isFirstVersionHigherThanSecond()', () => {
        it('returns true if the major version digit of the first version is higher than the second', () => {
            expect((0, version_1.isFirstVersionHigherThanSecond)([2, 0, 0], [1, 0, 0])).toBe(true);
            expect((0, version_1.isFirstVersionHigherThanSecond)([2, 1, 0], [1, 1, 1])).toBe(true);
        });
        it('returns false if the major version digit of the first version is lower than the second', () => {
            expect((0, version_1.isFirstVersionHigherThanSecond)([1, 0, 0], [2, 0, 0])).toBe(false);
            expect((0, version_1.isFirstVersionHigherThanSecond)([1, 10, 2], [2, 1, 0])).toBe(false);
        });
        it('returns true if the major version digit of both versions are equal, but the minor version of the first version is higher', () => {
            expect((0, version_1.isFirstVersionHigherThanSecond)([1, 10, 0], [1, 0, 0])).toBe(true);
            expect((0, version_1.isFirstVersionHigherThanSecond)([2, 11, 0], [2, 10, 0])).toBe(true);
        });
        it('returns false if the major version digit of both versions are equal, but the minor version of the second version is higher', () => {
            expect((0, version_1.isFirstVersionHigherThanSecond)([1, 0, 0], [1, 10, 0])).toBe(false);
            expect((0, version_1.isFirstVersionHigherThanSecond)([2, 10, 0], [2, 11, 0])).toBe(false);
        });
        it('returns false if the major, minor and patch version digit of both versions are equal', () => {
            expect((0, version_1.isFirstVersionHigherThanSecond)([1, 0, 0], [1, 0, 0])).toBe(false);
            expect((0, version_1.isFirstVersionHigherThanSecond)([2, 10, 0], [2, 10, 0])).toBe(false);
        });
        it('returns true if the major and minor version digit of both versions are equal but patch version is higher', () => {
            expect((0, version_1.isFirstVersionHigherThanSecond)([1, 0, 1], [1, 0, 0])).toBe(true);
            expect((0, version_1.isFirstVersionHigherThanSecond)([2, 10, 3], [2, 10, 2])).toBe(true);
        });
        it('returns false if the major and minor version digit of both versions are equal but patch version is lower', () => {
            expect((0, version_1.isFirstVersionHigherThanSecond)([1, 0, 0], [1, 0, 1])).toBe(false);
            expect((0, version_1.isFirstVersionHigherThanSecond)([2, 10, 2], [2, 10, 3])).toBe(false);
        });
    });
    describe('isFirstVersionEqualToSecond()', () => {
        it('returns false if the major version digit of the first version is lower than the second', () => {
            expect((0, version_1.isFirstVersionEqualToSecond)([2, 0, 0], [1, 0, 0])).toBe(false);
            expect((0, version_1.isFirstVersionEqualToSecond)([2, 1, 0], [1, 10, 0])).toBe(false);
        });
        it('returns false if the major version digit of the first version is higher than the second', () => {
            expect((0, version_1.isFirstVersionEqualToSecond)([1, 0, 0], [2, 0, 0])).toBe(false);
            expect((0, version_1.isFirstVersionEqualToSecond)([1, 10, 0], [2, 1, 0])).toBe(false);
        });
        it('returns false if the major version digit of both versions are equal, but the minor version of the first version is lower', () => {
            expect((0, version_1.isFirstVersionEqualToSecond)([1, 10, 0], [1, 0, 0])).toBe(false);
            expect((0, version_1.isFirstVersionEqualToSecond)([2, 11, 0], [2, 10, 0])).toBe(false);
        });
        it('returns false if the major version digit of both versions are equal, but the minor version of the second version is lower', () => {
            expect((0, version_1.isFirstVersionEqualToSecond)([1, 0, 0], [1, 10, 0])).toBe(false);
            expect((0, version_1.isFirstVersionEqualToSecond)([2, 10, 0], [2, 11, 0])).toBe(false);
        });
        it('returns true if the major, minor and patch version digit of both versions are equal', () => {
            expect((0, version_1.isFirstVersionEqualToSecond)([1, 0, 0], [1, 0, 0])).toBe(true);
            expect((0, version_1.isFirstVersionEqualToSecond)([2, 10, 0], [2, 10, 0])).toBe(true);
        });
        it('returns false if the patch version digit of both versions are different', () => {
            expect((0, version_1.isFirstVersionEqualToSecond)([1, 0, 1], [1, 0, 0])).toBe(false);
            expect((0, version_1.isFirstVersionEqualToSecond)([2, 10, 0], [2, 10, 4])).toBe(false);
        });
    });
});
