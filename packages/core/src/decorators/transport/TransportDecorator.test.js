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
const ClassValidationError_1 = require("../../error/ClassValidationError");
const JsonTransformer_1 = require("../../utils/JsonTransformer");
const MessageValidator_1 = require("../../utils/MessageValidator");
const TransportDecorator_1 = require("./TransportDecorator");
const validTransport = (transportJson) => MessageValidator_1.MessageValidator.validateSync(JsonTransformer_1.JsonTransformer.fromJSON(transportJson, TransportDecorator_1.TransportDecorator));
const expectValid = (transportJson) => expect(validTransport(transportJson)).toBeUndefined();
const expectInvalid = (transportJson) => expect(() => validTransport(transportJson)).toThrowError(ClassValidationError_1.ClassValidationError);
const valid = {
    all: {
        return_route: 'all',
    },
    none: {
        return_route: 'none',
    },
    thread: {
        return_route: 'thread',
        return_route_thread: '7d5d797c-db60-489f-8787-87bbd1acdb7e',
    },
};
const invalid = {
    random: {
        return_route: 'random',
    },
    invalidThreadId: {
        return_route: 'thread',
        return_route_thread: 'invalid',
    },
    missingThreadId: {
        return_route: 'thread',
    },
};
describe('Decorators | TransportDecorator', () => {
    it('should correctly transform Json to TransportDecorator class', () => {
        const decorator = JsonTransformer_1.JsonTransformer.fromJSON(valid.thread, TransportDecorator_1.TransportDecorator);
        expect(decorator.returnRoute).toBe(valid.thread.return_route);
        expect(decorator.returnRouteThread).toBe(valid.thread.return_route_thread);
    });
    it('should correctly transform TransportDecorator class to Json', () => {
        const id = 'f6ce6225-087b-46c1-834a-3e7e24116a00';
        const decorator = new TransportDecorator_1.TransportDecorator({
            returnRoute: TransportDecorator_1.ReturnRouteTypes.thread,
            returnRouteThread: id,
        });
        const json = JsonTransformer_1.JsonTransformer.toJSON(decorator);
        const transformed = {
            return_route: 'thread',
            return_route_thread: id,
        };
        expect(json).toEqual(transformed);
    });
    it('should only allow correct return_route values', () => {
        expect.assertions(4);
        expectValid(valid.all);
        expectValid(valid.none);
        expectValid(valid.thread);
        expectInvalid(invalid.random);
    });
    it('should require return_route_thread when return_route is thread', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(3);
        expectValid(valid.thread);
        expectInvalid(invalid.invalidThreadId);
        expectInvalid(invalid.missingThreadId);
    }));
});
