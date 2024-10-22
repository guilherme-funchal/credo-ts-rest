"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
const TestMessage_1 = require("../../../tests/TestMessage");
const ClassValidationError_1 = require("../../error/ClassValidationError");
const utils_1 = require("../../utils");
const messageType_1 = require("../../utils/messageType");
const AgentMessage_1 = require("../AgentMessage");
let CustomProtocolMessage = (() => {
    var _a;
    let _classSuper = AgentMessage_1.AgentMessage;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    return _a = class CustomProtocolMessage extends _classSuper {
            constructor() {
                super(...arguments);
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                __runInitializers(this, _type_extraInitializers);
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _type_decorators = [(0, messageType_1.IsValidMessageType)(CustomProtocolMessage.type)];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, messageType_1.parseMessageType)('https://didcomm.org/fake-protocol/1.5/message'),
        _a;
})();
let LegacyDidSovPrefixMessage = (() => {
    var _a;
    let _classSuper = AgentMessage_1.AgentMessage;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    return _a = class LegacyDidSovPrefixMessage extends _classSuper {
            constructor() {
                super(...arguments);
                this.allowDidSovPrefix = true;
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                __runInitializers(this, _type_extraInitializers);
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _type_decorators = [(0, messageType_1.IsValidMessageType)(LegacyDidSovPrefixMessage.type)];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, messageType_1.parseMessageType)('https://didcomm.org/fake-protocol/1.5/another-message'),
        _a;
})();
describe('AgentMessage', () => {
    describe('toJSON', () => {
        it('should only use did:sov message prefix if useDidSovPrefixWhereAllowed and allowDidSovPrefix are both true', () => {
            const message = new TestMessage_1.TestMessage();
            const legacyPrefixMessage = new LegacyDidSovPrefixMessage();
            // useDidSovPrefixWhereAllowed & allowDidSovPrefix are both false
            let testMessageJson = message.toJSON();
            expect(testMessageJson['@type']).toBe('https://didcomm.org/connections/1.0/invitation');
            // useDidSovPrefixWhereAllowed is true, but allowDidSovPrefix is false
            testMessageJson = message.toJSON({ useDidSovPrefixWhereAllowed: true });
            expect(testMessageJson['@type']).toBe('https://didcomm.org/connections/1.0/invitation');
            // useDidSovPrefixWhereAllowed is false, but allowDidSovPrefix is true
            testMessageJson = legacyPrefixMessage.toJSON();
            expect(testMessageJson['@type']).toBe('https://didcomm.org/fake-protocol/1.5/another-message');
            // useDidSovPrefixWhereAllowed & allowDidSovPrefix are both true
            testMessageJson = legacyPrefixMessage.toJSON({ useDidSovPrefixWhereAllowed: true });
            expect(testMessageJson['@type']).toBe('did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/fake-protocol/1.5/another-message');
        });
    });
    describe('@IsValidMessageType', () => {
        it('successfully validates if the message type is exactly the supported message type', () => __awaiter(void 0, void 0, void 0, function* () {
            const json = {
                '@id': 'd61c7e3d-d4af-469b-8d42-33fd14262e17',
                '@type': 'https://didcomm.org/fake-protocol/1.5/message',
            };
            const message = utils_1.JsonTransformer.fromJSON(json, CustomProtocolMessage);
            expect(message).toBeInstanceOf(CustomProtocolMessage);
        }));
        it('successfully validates if the message type minor version is lower than the supported message type', () => __awaiter(void 0, void 0, void 0, function* () {
            const json = {
                '@id': 'd61c7e3d-d4af-469b-8d42-33fd14262e17',
                '@type': 'https://didcomm.org/fake-protocol/1.2/message',
            };
            const message = utils_1.JsonTransformer.fromJSON(json, CustomProtocolMessage);
            expect(message).toBeInstanceOf(CustomProtocolMessage);
        }));
        it('successfully validates if the message type minor version is higher than the supported message type', () => {
            const json = {
                '@id': 'd61c7e3d-d4af-469b-8d42-33fd14262e17',
                '@type': 'https://didcomm.org/fake-protocol/1.8/message',
            };
            const message = utils_1.JsonTransformer.fromJSON(json, CustomProtocolMessage);
            expect(message).toBeInstanceOf(CustomProtocolMessage);
        });
        it('throws a validation error if the message type major version differs from the supported message type', () => {
            const json = {
                '@id': 'd61c7e3d-d4af-469b-8d42-33fd14262e17',
                '@type': 'https://didcomm.org/fake-protocol/2.0/message',
            };
            expect(() => utils_1.JsonTransformer.fromJSON(json, CustomProtocolMessage)).toThrowError(ClassValidationError_1.ClassValidationError);
            try {
                utils_1.JsonTransformer.fromJSON(json, CustomProtocolMessage);
            }
            catch (error) {
                const thrownError = error;
                expect(thrownError.message).toEqual('CustomProtocolMessage: Failed to validate class.\nAn instance of CustomProtocolMessage has failed the validation:\n - property type has failed the following constraints: type does not match the expected message type (only minor version may be lower) \n');
                expect(thrownError.validationErrors).toMatchObject([
                    {
                        target: {
                            appendedAttachments: undefined,
                            id: 'd61c7e3d-d4af-469b-8d42-33fd14262e17',
                            l10n: undefined,
                            pleaseAck: undefined,
                            service: undefined,
                            thread: undefined,
                            timing: undefined,
                            transport: undefined,
                            type: 'https://didcomm.org/fake-protocol/2.0/message',
                        },
                        value: 'https://didcomm.org/fake-protocol/2.0/message',
                        property: 'type',
                        children: [],
                        constraints: {
                            isValidMessageType: 'type does not match the expected message type (only minor version may be lower)',
                        },
                    },
                ]);
            }
        });
    });
});
