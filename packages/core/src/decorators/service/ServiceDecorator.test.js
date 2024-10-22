"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseMessage_1 = require("../../agent/BaseMessage");
const JsonTransformer_1 = require("../../utils/JsonTransformer");
const mixins_1 = require("../../utils/mixins");
const ServiceDecoratorExtension_1 = require("./ServiceDecoratorExtension");
describe('Decorators | ServiceDecoratorExtension', () => {
    class TestMessage extends (0, mixins_1.Compose)(BaseMessage_1.BaseMessage, [ServiceDecoratorExtension_1.ServiceDecorated]) {
        toJSON() {
            return JsonTransformer_1.JsonTransformer.toJSON(this);
        }
    }
    const service = {
        recipientKeys: ['test', 'test'],
        routingKeys: ['test', 'test'],
        serviceEndpoint: 'https://example.com',
    };
    test('transforms ServiceDecorator class to JSON', () => {
        const message = new TestMessage();
        message.setService(service);
        expect(message.toJSON()).toEqual({ '~service': service });
    });
    test('transforms Json to ServiceDecorator class', () => {
        const transformed = JsonTransformer_1.JsonTransformer.fromJSON({ '@id': 'randomID', '@type': 'https://didcomm.org/fake-protocol/1.5/message', '~service': service }, TestMessage);
        expect(transformed.service).toEqual(service);
        expect(transformed).toBeInstanceOf(TestMessage);
    });
});
