"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JsonTransformer_1 = require("../../utils/JsonTransformer");
const L10nDecorator_1 = require("./L10nDecorator");
describe('Decorators | L10nDecorator', () => {
    it('should correctly transform Json to L10nDecorator class', () => {
        const locale = 'en';
        const decorator = JsonTransformer_1.JsonTransformer.fromJSON({ locale }, L10nDecorator_1.L10nDecorator);
        expect(decorator.locale).toBe(locale);
    });
    it('should correctly transform L10nDecorator class to Json', () => {
        const locale = 'nl';
        const decorator = new L10nDecorator_1.L10nDecorator({
            locale,
        });
        const json = JsonTransformer_1.JsonTransformer.toJSON(decorator);
        const transformed = {
            locale,
        };
        expect(json).toEqual(transformed);
    });
});
