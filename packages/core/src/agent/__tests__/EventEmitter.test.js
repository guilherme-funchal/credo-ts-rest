"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const helpers_1 = require("../../../tests/helpers");
const EventEmitter_1 = require("../EventEmitter");
const mockEmit = jest.fn();
const mockOn = jest.fn();
const mockOff = jest.fn();
const mock = jest.fn().mockImplementation(() => {
    return { emit: mockEmit, on: mockOn, off: mockOff };
});
const eventEmitter = new EventEmitter_1.EventEmitter(Object.assign(Object.assign({}, helpers_1.agentDependencies), { EventEmitterClass: mock }), new rxjs_1.Subject());
const agentContext = (0, helpers_1.getAgentContext)({});
describe('EventEmitter', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('emit', () => {
        test("calls 'emit' on native event emitter instance", () => {
            eventEmitter.emit(agentContext, {
                payload: { some: 'payload' },
                type: 'some-event',
            });
            expect(mockEmit).toHaveBeenCalledWith('some-event', {
                payload: { some: 'payload' },
                type: 'some-event',
                metadata: {
                    contextCorrelationId: agentContext.contextCorrelationId,
                },
            });
        });
    });
    describe('on', () => {
        test("calls 'on' on native event emitter instance", () => {
            const listener = jest.fn();
            eventEmitter.on('some-event', listener);
            expect(mockOn).toHaveBeenCalledWith('some-event', listener);
        });
    });
    describe('off', () => {
        test("calls 'off' on native event emitter instance", () => {
            const listener = jest.fn();
            eventEmitter.off('some-event', listener);
            expect(mockOff).toHaveBeenCalledWith('some-event', listener);
        });
    });
});
