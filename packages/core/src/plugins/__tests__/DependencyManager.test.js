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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const FeatureRegistry_1 = require("../../agent/FeatureRegistry");
const DependencyManager_1 = require("../DependencyManager");
class Instance {
    constructor() {
        this.random = Math.random();
    }
}
const instance = new Instance();
describe('DependencyManager', () => {
    let container;
    let dependencyManager;
    beforeEach(() => {
        container = tsyringe_1.container.createChildContainer();
        dependencyManager = new DependencyManager_1.DependencyManager(container);
    });
    afterEach(() => {
        jest.resetAllMocks();
        container.reset();
    });
    describe('registerModules', () => {
        it('calls the register method for all module plugins', () => {
            let Module1 = (() => {
                let _classDecorators = [(0, tsyringe_1.injectable)()];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Module1 = _classThis = class {
                    constructor() {
                        this.register = jest.fn();
                    }
                };
                __setFunctionName(_classThis, "Module1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Module1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Module1 = _classThis;
            })();
            let Module2 = (() => {
                let _classDecorators = [(0, tsyringe_1.injectable)()];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Module2 = _classThis = class {
                    constructor() {
                        this.register = jest.fn();
                    }
                };
                __setFunctionName(_classThis, "Module2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Module2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Module2 = _classThis;
            })();
            const module1 = new Module1();
            const module2 = new Module2();
            const featureRegistry = container.resolve(FeatureRegistry_1.FeatureRegistry);
            dependencyManager.registerModules({ module1, module2 });
            expect(module1.register).toHaveBeenCalledTimes(1);
            expect(module1.register).toHaveBeenLastCalledWith(dependencyManager, featureRegistry);
            expect(module2.register).toHaveBeenCalledTimes(1);
            expect(module2.register).toHaveBeenLastCalledWith(dependencyManager, featureRegistry);
            expect(dependencyManager.registeredModules).toMatchObject({
                module1,
                module2,
            });
        });
    });
    describe('registerSingleton', () => {
        it('calls registerSingleton on the container', () => {
            class Singleton {
            }
            const registerSingletonSpy = jest.spyOn(container, 'registerSingleton');
            dependencyManager.registerSingleton(Singleton);
            expect(registerSingletonSpy).toHaveBeenLastCalledWith(Singleton, undefined);
            dependencyManager.registerSingleton(Singleton, 'Singleton');
            expect(registerSingletonSpy).toHaveBeenLastCalledWith(Singleton, 'Singleton');
        });
    });
    describe('resolve', () => {
        it('calls resolve on the container', () => {
            // FIXME: somehow this doesn't work if we don't create a child container
            const child = container.createChildContainer();
            const dependencyManager = new DependencyManager_1.DependencyManager(child);
            child.registerInstance(Instance, instance);
            const resolveSpy = jest.spyOn(child, 'resolve');
            expect(dependencyManager.resolve(Instance)).toBe(instance);
            expect(resolveSpy).toHaveBeenCalledWith(Instance);
        });
    });
    describe('isRegistered', () => {
        it('calls isRegistered on the container', () => {
            class Singleton {
            }
            const isRegisteredSpy = jest.spyOn(container, 'isRegistered');
            expect(dependencyManager.isRegistered(Singleton)).toBe(false);
            expect(isRegisteredSpy).toHaveBeenCalledTimes(1);
        });
    });
    describe('registerInstance', () => {
        it('calls registerInstance on the container', () => {
            class Instance {
            }
            const instance = new Instance();
            const registerInstanceSpy = jest.spyOn(container, 'registerInstance');
            dependencyManager.registerInstance(Instance, instance);
            expect(registerInstanceSpy).toHaveBeenCalledWith(Instance, instance);
        });
    });
    describe('registerContextScoped', () => {
        it('calls register on the container with Lifecycle.ContainerScoped', () => {
            class SomeService {
            }
            const registerSpy = jest.spyOn(container, 'register');
            dependencyManager.registerContextScoped(SomeService);
            expect(registerSpy).toHaveBeenCalledWith(SomeService, SomeService, { lifecycle: tsyringe_1.Lifecycle.ContainerScoped });
            registerSpy.mockClear();
            dependencyManager.registerContextScoped('SomeService', SomeService);
            expect(registerSpy).toHaveBeenCalledWith('SomeService', SomeService, { lifecycle: tsyringe_1.Lifecycle.ContainerScoped });
        });
    });
    describe('createChild', () => {
        it('calls createChildContainer on the container', () => {
            const createChildSpy = jest.spyOn(container, 'createChildContainer');
            const childDependencyManager = dependencyManager.createChild();
            expect(createChildSpy).toHaveBeenCalledTimes(1);
            expect(childDependencyManager.container).toBe(createChildSpy.mock.results[0].value);
        });
        it('inherits the registeredModules from the parent dependency manager', () => {
            const module = {
                register: jest.fn(),
            };
            dependencyManager.registerModules({
                module1: module,
                module2: module,
            });
            const childDependencyManager = dependencyManager.createChild();
            expect(childDependencyManager.registeredModules).toMatchObject({
                module1: module,
                module2: module,
            });
        });
    });
});
