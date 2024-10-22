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
exports.SigningProviderRegistry = exports.SigningProviderToken = void 0;
const error_1 = require("../../error");
const plugins_1 = require("../../plugins");
exports.SigningProviderToken = Symbol('SigningProviderToken');
let SigningProviderRegistry = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SigningProviderRegistry = _classThis = class {
        constructor(signingKeyProviders) {
            // This is a really ugly hack to make tsyringe work without any SigningProviders registered
            // It is currently impossible to use @injectAll if there are no instances registered for the
            // token. We register a value of `default` by default and will filter that out in the registry.
            // Once we have a signing provider that should always be registered we can remove this. We can make an ed25519
            // signer using the @stablelib/ed25519 library.
            this.signingKeyProviders = signingKeyProviders.filter((provider) => provider !== 'default');
        }
        hasProviderForKeyType(keyType) {
            const signingKeyProvider = this.signingKeyProviders.find((x) => x.keyType === keyType);
            return signingKeyProvider !== undefined;
        }
        getProviderForKeyType(keyType) {
            const signingKeyProvider = this.signingKeyProviders.find((x) => x.keyType === keyType);
            if (!signingKeyProvider) {
                throw new error_1.AriesFrameworkError(`No signing key provider for key type: ${keyType}`);
            }
            return signingKeyProvider;
        }
        get supportedKeyTypes() {
            return Array.from(new Set(this.signingKeyProviders.map((provider) => provider.keyType)));
        }
    };
    __setFunctionName(_classThis, "SigningProviderRegistry");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SigningProviderRegistry = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SigningProviderRegistry = _classThis;
})();
exports.SigningProviderRegistry = SigningProviderRegistry;
