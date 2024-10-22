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
const rxjs_1 = require("rxjs");
const setupIndySdkModule_1 = require("../../indy-sdk/tests/setupIndySdkModule");
const src_1 = require("../src");
const Agent_1 = require("../src/agent/Agent");
const Events_1 = require("../src/agent/Events");
const models_1 = require("../src/agent/models");
const helpers_1 = require("./helpers");
const transport_1 = require("./transport");
const aliceAgentOptions = (0, helpers_1.getAgentOptions)('Multi Protocol Versions - Alice', {
    endpoints: ['rxjs:alice'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
const bobAgentOptions = (0, helpers_1.getAgentOptions)('Multi Protocol Versions - Bob', {
    endpoints: ['rxjs:bob'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
describe('multi version protocols', () => {
    let aliceAgent;
    let bobAgent;
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield bobAgent.shutdown();
        yield bobAgent.wallet.delete();
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('should successfully handle a message with a lower minor version than the currently supported version', () => __awaiter(void 0, void 0, void 0, function* () {
        bobAgent = new Agent_1.Agent(bobAgentOptions);
        aliceAgent = new Agent_1.Agent(aliceAgentOptions);
        (0, transport_1.setupSubjectTransports)([aliceAgent, bobAgent]);
        // Register the test handler with the v1.3 version of the message
        const mockHandle = jest.fn();
        aliceAgent.dependencyManager.registerMessageHandlers([{ supportedMessages: [TestMessageV13], handle: mockHandle }]);
        yield aliceAgent.initialize();
        yield bobAgent.initialize();
        const { outOfBandInvitation, id } = yield aliceAgent.oob.createInvitation();
        let { connectionRecord: bobConnection } = yield bobAgent.oob.receiveInvitation(outOfBandInvitation, {
            autoAcceptConnection: true,
            autoAcceptInvitation: true,
        });
        if (!bobConnection) {
            throw new Error('No connection for bob');
        }
        bobConnection = yield bobAgent.connections.returnWhenIsConnected(bobConnection.id);
        let [aliceConnection] = yield aliceAgent.connections.findAllByOutOfBandId(id);
        aliceConnection = yield aliceAgent.connections.returnWhenIsConnected(aliceConnection.id);
        expect(aliceConnection).toBeConnectedWith(bobConnection);
        expect(bobConnection).toBeConnectedWith(aliceConnection);
        const bobMessageSender = bobAgent.dependencyManager.resolve(src_1.MessageSender);
        // Start event listener for message processed
        const agentMessageV11ProcessedPromise = (0, rxjs_1.firstValueFrom)(aliceAgent.events.observable(Events_1.AgentEventTypes.AgentMessageProcessed).pipe((0, rxjs_1.filter)((event) => event.payload.message.type === TestMessageV11.type.messageTypeUri), (0, rxjs_1.timeout)(8000)));
        yield bobMessageSender.sendMessage(new models_1.OutboundMessageContext(new TestMessageV11(), { agentContext: bobAgent.context, connection: bobConnection }));
        // Wait for the agent message processed event to be called
        yield agentMessageV11ProcessedPromise;
        expect(mockHandle).toHaveBeenCalledTimes(1);
        // Start event listener for message processed
        const agentMessageV15ProcessedPromise = (0, rxjs_1.firstValueFrom)(aliceAgent.events.observable(Events_1.AgentEventTypes.AgentMessageProcessed).pipe((0, rxjs_1.filter)((event) => event.payload.message.type === TestMessageV15.type.messageTypeUri), (0, rxjs_1.timeout)(8000)));
        yield bobMessageSender.sendMessage(new models_1.OutboundMessageContext(new TestMessageV15(), { agentContext: bobAgent.context, connection: bobConnection }));
        yield agentMessageV15ProcessedPromise;
        expect(mockHandle).toHaveBeenCalledTimes(2);
    }));
});
let TestMessageV11 = (() => {
    var _a;
    let _classSuper = src_1.AgentMessage;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    return _a = class TestMessageV11 extends _classSuper {
            constructor() {
                super();
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                __runInitializers(this, _type_extraInitializers);
                this.id = this.generateId();
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _type_decorators = [(0, src_1.IsValidMessageType)(TestMessageV11.type)];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, src_1.parseMessageType)('https://didcomm.org/custom-protocol/1.1/test-message'),
        _a;
})();
let TestMessageV13 = (() => {
    var _a;
    let _classSuper = src_1.AgentMessage;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    return _a = class TestMessageV13 extends _classSuper {
            constructor() {
                super();
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                __runInitializers(this, _type_extraInitializers);
                this.id = this.generateId();
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _type_decorators = [(0, src_1.IsValidMessageType)(TestMessageV13.type)];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, src_1.parseMessageType)('https://didcomm.org/custom-protocol/1.3/test-message'),
        _a;
})();
let TestMessageV15 = (() => {
    var _a;
    let _classSuper = src_1.AgentMessage;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    return _a = class TestMessageV15 extends _classSuper {
            constructor() {
                super();
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                __runInitializers(this, _type_extraInitializers);
                this.id = this.generateId();
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _type_decorators = [(0, src_1.IsValidMessageType)(TestMessageV15.type)];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, src_1.parseMessageType)('https://didcomm.org/custom-protocol/1.5/test-message'),
        _a;
})();
