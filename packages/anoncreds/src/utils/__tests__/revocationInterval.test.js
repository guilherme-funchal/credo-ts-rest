"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
describe('assertBestPracticeRevocationInterval', () => {
    test("throws if no 'to' value is specified", () => {
        expect(() => (0, utils_1.assertBestPracticeRevocationInterval)({
            from: 10,
        })).toThrow();
    });
    test("throws if a 'from' value is specified and it is different from 'to'", () => {
        expect(() => (0, utils_1.assertBestPracticeRevocationInterval)({
            to: 5,
            from: 10,
        })).toThrow();
    });
    test('does not throw if only to is provided', () => {
        expect(() => (0, utils_1.assertBestPracticeRevocationInterval)({
            to: 5,
        })).not.toThrow();
    });
    test('does not throw if from and to are equal', () => {
        expect(() => (0, utils_1.assertBestPracticeRevocationInterval)({
            to: 10,
            from: 10,
        })).not.toThrow();
    });
});
