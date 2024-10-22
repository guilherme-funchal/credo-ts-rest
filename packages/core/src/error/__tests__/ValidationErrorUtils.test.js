"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const ValidationErrorUtils_1 = require("../ValidationErrorUtils");
describe('ValidationErrorUtils', () => {
    test('returns true for an array of ValidationErrors', () => {
        const error = new class_validator_1.ValidationError();
        const errorArray = [error, error];
        const isErrorArray = (0, ValidationErrorUtils_1.isValidationErrorArray)(errorArray);
        expect(isErrorArray).toBeTruthy;
    });
    test('returns false for an array of strings', () => {
        const errorArray = ['hello', 'world'];
        const isErrorArray = (0, ValidationErrorUtils_1.isValidationErrorArray)(errorArray);
        expect(isErrorArray).toBeFalsy;
    });
    test('returns false for a non array', () => {
        const error = new class_validator_1.ValidationError();
        const isErrorArray = (0, ValidationErrorUtils_1.isValidationErrorArray)(error);
        expect(isErrorArray).toBeFalsy;
    });
});
