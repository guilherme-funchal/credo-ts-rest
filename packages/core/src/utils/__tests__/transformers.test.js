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
Object.defineProperty(exports, "__esModule", { value: true });
const JsonTransformer_1 = require("../JsonTransformer");
const transformers_1 = require("../transformers");
let TestDateTransformer = (() => {
    var _a;
    let _date_decorators;
    let _date_initializers = [];
    let _date_extraInitializers = [];
    return _a = class TestDateTransformer {
            constructor(date) {
                this.date = __runInitializers(this, _date_initializers, void 0);
                __runInitializers(this, _date_extraInitializers);
                this.date = date;
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _date_decorators = [(0, transformers_1.DateTransformer)()];
            __esDecorate(null, null, _date_decorators, { kind: "field", name: "date", static: false, private: false, access: { has: obj => "date" in obj, get: obj => obj.date, set: (obj, value) => { obj.date = value; } }, metadata: _metadata }, _date_initializers, _date_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
describe('transformers', () => {
    describe('DateTransformer', () => {
        it('converts ISO date string to Date when using fromJSON', () => {
            const testDate = JsonTransformer_1.JsonTransformer.fromJSON({ date: '2020-01-01T00:00:00.000Z' }, TestDateTransformer);
            expect(testDate.date).toBeInstanceOf(Date);
            expect(testDate.date.getTime()).toEqual(1577836800000);
        });
        it('converts Date to ISO string when using toJSON', () => {
            const testDateJson = JsonTransformer_1.JsonTransformer.toJSON(new TestDateTransformer(new Date('2020-01-01T00:00:00.000Z')));
            expect(testDateJson.date).toBe('2020-01-01T00:00:00.000Z');
        });
        it('clones the Date to a new Date instance when using clone', () => {
            const oldDate = new Date('2020-01-01T00:00:00.000Z');
            const date = JsonTransformer_1.JsonTransformer.clone(new TestDateTransformer(oldDate));
            expect(date.date).not.toBe(oldDate);
            expect(date.date.getTime()).toEqual(oldDate.getTime());
            expect(date.date.toISOString()).toBe('2020-01-01T00:00:00.000Z');
        });
    });
});
