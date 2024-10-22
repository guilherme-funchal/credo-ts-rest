"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseMessage_1 = require("../../agent/BaseMessage");
const ClassValidationError_1 = require("../../error/ClassValidationError");
const JsonTransformer_1 = require("../../utils/JsonTransformer");
const MessageValidator_1 = require("../../utils/MessageValidator");
const mixins_1 = require("../../utils/mixins");
const AckDecorator_1 = require("./AckDecorator");
const AckDecoratorExtension_1 = require("./AckDecoratorExtension");
describe('Decorators | AckDecoratorExtension', () => {
    class TestMessage extends (0, mixins_1.Compose)(BaseMessage_1.BaseMessage, [AckDecoratorExtension_1.AckDecorated]) {
        toJSON() {
            return JsonTransformer_1.JsonTransformer.toJSON(this);
        }
    }
    test('transforms AckDecorator class to JSON', () => {
        const message = new TestMessage();
        message.setPleaseAck([AckDecorator_1.AckValues.Receipt]);
        expect(message.toJSON()).toEqual({
            '@id': undefined,
            '@type': undefined,
            '~please_ack': {
                on: ['RECEIPT'],
            },
        });
    });
    test('transforms Json to AckDecorator class', () => {
        const transformed = JsonTransformer_1.JsonTransformer.fromJSON({
            '~please_ack': {},
            '@id': '7517433f-1150-46f2-8495-723da61b872a',
            '@type': 'https://didcomm.org/test-protocol/1.0/test-message',
        }, TestMessage);
        expect(transformed).toEqual({
            id: '7517433f-1150-46f2-8495-723da61b872a',
            type: 'https://didcomm.org/test-protocol/1.0/test-message',
            pleaseAck: {
                on: ['RECEIPT'],
            },
        });
        expect(transformed).toBeInstanceOf(TestMessage);
    });
    // this covers the pre-aip 2 please ack decorator
    test('sets `on` value to `receipt` if `on` is not present in ack decorator', () => {
        const transformed = JsonTransformer_1.JsonTransformer.fromJSON({
            '~please_ack': {},
            '@id': '7517433f-1150-46f2-8495-723da61b872a',
            '@type': 'https://didcomm.org/test-protocol/1.0/test-message',
        }, TestMessage);
        expect(transformed).toEqual({
            id: '7517433f-1150-46f2-8495-723da61b872a',
            type: 'https://didcomm.org/test-protocol/1.0/test-message',
            pleaseAck: {
                on: ['RECEIPT'],
            },
        });
        expect(transformed).toBeInstanceOf(TestMessage);
    });
    test('successfully validates please ack decorator', () => __awaiter(void 0, void 0, void 0, function* () {
        const transformedWithDefault = JsonTransformer_1.JsonTransformer.fromJSON({
            '~please_ack': {},
            '@id': '7517433f-1150-46f2-8495-723da61b872a',
            '@type': 'https://didcomm.org/test-protocol/1.0/test-message',
        }, TestMessage);
        expect(MessageValidator_1.MessageValidator.validateSync(transformedWithDefault)).toBeUndefined();
    }));
    test('transforms Json to AckDecorator class', () => {
        const transformed = () => JsonTransformer_1.JsonTransformer.fromJSON({
            '~please_ack': {},
            '@id': undefined,
            '@type': undefined,
        }, TestMessage);
        expect(() => transformed()).toThrow(ClassValidationError_1.ClassValidationError);
        try {
            transformed();
        }
        catch (e) {
            const caughtError = e;
            expect(caughtError.message).toEqual('TestMessage: Failed to validate class.\nAn instance of TestMessage has failed the validation:\n - property id has failed the following constraints: id must match /[-_./a-zA-Z0-9]{8,64}/ regular expression \n\nAn instance of TestMessage has failed the validation:\n - property type has failed the following constraints: type must match /(.*?)([a-zA-Z0-9._-]+)\\/(\\d[^/]*)\\/([a-zA-Z0-9._-]+)$/ regular expression \n');
            expect(caughtError.validationErrors).toMatchObject([
                {
                    children: [],
                    constraints: {
                        matches: 'id must match /[-_./a-zA-Z0-9]{8,64}/ regular expression',
                    },
                    property: 'id',
                    target: {
                        pleaseAck: {
                            on: ['RECEIPT'],
                        },
                    },
                    value: undefined,
                },
                {
                    children: [],
                    constraints: {
                        matches: 'type must match /(.*?)([a-zA-Z0-9._-]+)\\/(\\d[^/]*)\\/([a-zA-Z0-9._-]+)$/ regular expression',
                    },
                    property: 'type',
                    target: {
                        pleaseAck: {
                            on: ['RECEIPT'],
                        },
                    },
                    value: undefined,
                },
            ]);
        }
    });
});
