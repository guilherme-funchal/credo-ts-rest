"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DidController = void 0;
const core_1 = require("@credo-ts/core");
const tsoa_1 = require("tsoa");
const tsyringe_1 = require("tsyringe");
const response_1 = require("../../utils/response");
const DidsControllerExamples_1 = require("./DidsControllerExamples");
let DidController = (() => {
    let _classDecorators = [(0, tsoa_1.Tags)('Dids'), (0, tsoa_1.Route)('/dids'), (0, tsyringe_1.injectable)(), (0, tsoa_1.Security)('tenants', ['tenant'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = tsoa_1.Controller;
    let _instanceExtraInitializers = [];
    let _resolveDid_decorators;
    let _importDid_decorators;
    let _createDid_decorators;
    var DidController = _classThis = class extends _classSuper {
        /**
         * Resolves did and returns did resolution result
         */
        resolveDid(request, did) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const resolveResult = yield request.user.agent.dids.resolve(did);
                const response = Object.assign(Object.assign({}, resolveResult), { didDocument: (_a = resolveResult.didDocument) === null || _a === void 0 ? void 0 : _a.toJSON() });
                if (resolveResult.didResolutionMetadata.error === 'notFound') {
                    this.setStatus(404);
                    return (0, response_1.alternativeResponse)(response);
                }
                if (!resolveResult.didDocument) {
                    this.setStatus(500);
                    return (0, response_1.alternativeResponse)(response);
                }
                return response;
            });
        }
        /**
         * Import a did (with optional did document).
         *
         * If no did document is provided, the did will be resolved to fetch the did document.
         */
        importDid(request, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    yield request.user.agent.dids.import({
                        did: options.did,
                        didDocument: options.didDocument ? core_1.JsonTransformer.fromJSON(options.didDocument, core_1.DidDocument) : undefined,
                        overwrite: options.overwrite,
                        privateKeys: (_a = options.privateKeys) === null || _a === void 0 ? void 0 : _a.map(({ keyType, privateKeyBase58 }) => ({
                            keyType,
                            privateKey: core_1.TypedArrayEncoder.fromBase58(privateKeyBase58),
                        })),
                    });
                }
                catch (error) {
                    this.setStatus(500);
                    return (0, response_1.alternativeResponse)({
                        message: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            });
        }
        /**
         * Create a new did.
         */
        createDid(request, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const didResult = yield request.user.agent.dids.create(Object.assign(Object.assign({}, options), { didDocument: 'didDocument' in options && options.didDocument
                        ? core_1.JsonTransformer.fromJSON(options.didDocument, core_1.DidDocument)
                        : undefined, secret: Object.assign(Object.assign({}, options.secret), { seed: typeof ((_a = options.secret) === null || _a === void 0 ? void 0 : _a.seedBase58) === 'string'
                            ? core_1.TypedArrayEncoder.fromBase58(options.secret.seedBase58)
                            : undefined, privateKey: typeof ((_b = options.secret) === null || _b === void 0 ? void 0 : _b.privateKeyBase58) === 'string'
                            ? core_1.TypedArrayEncoder.fromBase58(options.secret.privateKeyBase58)
                            : undefined }) }));
                const didDocumentJson = (_c = didResult.didState.didDocument) === null || _c === void 0 ? void 0 : _c.toJSON();
                const copiedSecret = __rest(didResult.didState.secret, []);
                copiedSecret.seedBase58 = copiedSecret.seed
                    ? core_1.TypedArrayEncoder.toBase58(copiedSecret.seed)
                    : undefined;
                copiedSecret.privateKeyBase58 = copiedSecret.privateKey
                    ? core_1.TypedArrayEncoder.toBase58(copiedSecret.privateKey)
                    : undefined;
                delete copiedSecret.seed;
                delete copiedSecret.privateKey;
                if (didResult.didState.state === 'failed') {
                    this.setStatus(500);
                    return (0, response_1.alternativeResponse)(Object.assign(Object.assign({}, didResult), { didState: Object.assign(Object.assign({}, didResult.didState), { didDocument: didDocumentJson, secret: copiedSecret }) }));
                }
                if (didResult.didState.state === 'wait') {
                    this.setStatus(2002);
                    return (0, response_1.alternativeResponse)(Object.assign(Object.assign({}, didResult), { didState: Object.assign(Object.assign({}, didResult.didState), { didDocument: didDocumentJson, secret: copiedSecret }) }));
                }
                if (didResult.didState.state === 'action') {
                    return (0, response_1.alternativeResponse)(Object.assign(Object.assign({}, didResult), { didState: Object.assign(Object.assign({}, didResult.didState), { didDocument: didDocumentJson, secret: copiedSecret }) }));
                }
                return Object.assign(Object.assign({}, didResult), { didState: Object.assign(Object.assign({}, didResult.didState), { didDocument: didDocumentJson, secret: copiedSecret }) });
            });
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _instanceExtraInitializers);
        }
    };
    __setFunctionName(_classThis, "DidController");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _resolveDid_decorators = [(0, tsoa_1.Example)(DidsControllerExamples_1.didResolveSuccessResponseExample), (0, tsoa_1.Response)(404, 'Did not found', DidsControllerExamples_1.didResolveFailedResponseExample), (0, tsoa_1.Response)(500, 'Error resolving did', DidsControllerExamples_1.didResolveFailedResponseExample), (0, tsoa_1.Get)('/:did')];
        _importDid_decorators = [(0, tsoa_1.Post)('/import'), (0, tsoa_1.SuccessResponse)(201, 'Did imported successfully')];
        _createDid_decorators = [(0, tsoa_1.Example)(DidsControllerExamples_1.didCreateFinishedResponseExample), (0, tsoa_1.Response)(500, 'Error creating did'), (0, tsoa_1.Response)(200, 'Action required'), (0, tsoa_1.Response)(202, 'Wait for action to complete'), (0, tsoa_1.Post)('/create')];
        __esDecorate(_classThis, null, _resolveDid_decorators, { kind: "method", name: "resolveDid", static: false, private: false, access: { has: obj => "resolveDid" in obj, get: obj => obj.resolveDid }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _importDid_decorators, { kind: "method", name: "importDid", static: false, private: false, access: { has: obj => "importDid" in obj, get: obj => obj.importDid }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createDid_decorators, { kind: "method", name: "createDid", static: false, private: false, access: { has: obj => "createDid" in obj, get: obj => obj.createDid }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DidController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DidController = _classThis;
})();
exports.DidController = DidController;
