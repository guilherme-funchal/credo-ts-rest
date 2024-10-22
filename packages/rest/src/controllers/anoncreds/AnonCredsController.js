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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsController = void 0;
const tsoa_1 = require("tsoa");
const tsyringe_1 = require("tsyringe");
const response_1 = require("../../utils/response");
const AnonCredsControllerExamples_1 = require("./AnonCredsControllerExamples");
let AnonCredsController = (() => {
    let _classDecorators = [(0, tsoa_1.Tags)('AnonCreds'), (0, tsoa_1.Route)('/anoncreds'), (0, tsoa_1.Security)('tenants', ['tenant']), (0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = tsoa_1.Controller;
    let _instanceExtraInitializers = [];
    let _getSchemaById_decorators;
    let _registerSchema_decorators;
    let _getCredentialDefinitionById_decorators;
    let _registerCredentialDefinition_decorators;
    var AnonCredsController = _classThis = class extends _classSuper {
        /**
         * Retrieve schema by schema id
         */
        getSchemaById(request, schemaId) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const schemaResult = yield request.user.agent.modules.anoncreds.getSchema(schemaId);
                const error = (_a = schemaResult.resolutionMetadata) === null || _a === void 0 ? void 0 : _a.error;
                if (schemaResult.resolutionMetadata.error === 'notFound') {
                    this.setStatus(404);
                    return (0, response_1.alternativeResponse)(schemaResult);
                }
                if (error === 'invalid' || error === 'unsupportedAnonCredsMethod') {
                    this.setStatus(400);
                    return (0, response_1.alternativeResponse)(schemaResult);
                }
                if (error !== undefined || schemaResult.schema === undefined) {
                    this.setStatus(500);
                    return (0, response_1.alternativeResponse)(schemaResult);
                }
                return schemaResult;
            });
        }
        /**
         * Creates a new AnonCreds schema and registers the schema in the AnonCreds registry
         */
        registerSchema(request, body) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const registerSchemaResult = yield request.user.agent.modules.anoncreds.registerSchema({
                    schema: body.schema,
                    options: (_a = body.options) !== null && _a !== void 0 ? _a : {},
                });
                if (registerSchemaResult.schemaState.state === 'failed') {
                    this.setStatus(500);
                    return (0, response_1.alternativeResponse)(Object.assign(Object.assign({}, registerSchemaResult), { schemaState: registerSchemaResult.schemaState }));
                }
                if (registerSchemaResult.schemaState.state === 'wait') {
                    // The request has been accepted for processing, but the processing has not been completed.
                    this.setStatus(202);
                    return (0, response_1.alternativeResponse)(Object.assign(Object.assign({}, registerSchemaResult), { schemaState: registerSchemaResult.schemaState }));
                }
                if (registerSchemaResult.schemaState.state === 'action') {
                    return (0, response_1.alternativeResponse)(Object.assign(Object.assign({}, registerSchemaResult), { schemaState: registerSchemaResult.schemaState }));
                }
                return Object.assign(Object.assign({}, registerSchemaResult), { schemaState: registerSchemaResult.schemaState });
            });
        }
        /**
         * Retrieve credentialDefinition by credentialDefinition id
         */
        getCredentialDefinitionById(request, credentialDefinitionId) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const credentialDefinitionResult = yield request.user.agent.modules.anoncreds.getCredentialDefinition(credentialDefinitionId);
                const error = (_a = credentialDefinitionResult.resolutionMetadata) === null || _a === void 0 ? void 0 : _a.error;
                if (((_b = credentialDefinitionResult.resolutionMetadata) === null || _b === void 0 ? void 0 : _b.error) === 'notFound') {
                    this.setStatus(404);
                    return (0, response_1.alternativeResponse)(credentialDefinitionResult);
                }
                if (error === 'invalid' || error === 'unsupportedAnonCredsMethod') {
                    this.setStatus(400);
                    return (0, response_1.alternativeResponse)(credentialDefinitionResult);
                }
                if (error !== undefined || credentialDefinitionResult.credentialDefinition === undefined) {
                    this.setStatus(500);
                    return (0, response_1.alternativeResponse)(credentialDefinitionResult);
                }
                return credentialDefinitionResult;
            });
        }
        /**
         * Creates a new AnonCreds credentialDefinition and registers the credentialDefinition in the AnonCreds registry
         */
        registerCredentialDefinition(request, body) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const registerCredentialDefinitionResult = yield request.user.agent.modules.anoncreds.registerCredentialDefinition({
                    credentialDefinition: body.credentialDefinition,
                    options: (_a = body.options) !== null && _a !== void 0 ? _a : {},
                });
                if (registerCredentialDefinitionResult.credentialDefinitionState.state === 'failed') {
                    this.setStatus(500);
                    return (0, response_1.alternativeResponse)(Object.assign(Object.assign({}, registerCredentialDefinitionResult), { credentialDefinitionState: registerCredentialDefinitionResult.credentialDefinitionState }));
                }
                if (registerCredentialDefinitionResult.credentialDefinitionState.state === 'wait') {
                    // The request has been accepted for processing, but the processing has not been completed.
                    this.setStatus(202);
                    return (0, response_1.alternativeResponse)(Object.assign(Object.assign({}, registerCredentialDefinitionResult), { credentialDefinitionState: registerCredentialDefinitionResult.credentialDefinitionState }));
                }
                if (registerCredentialDefinitionResult.credentialDefinitionState.state === 'action') {
                    return (0, response_1.alternativeResponse)(Object.assign(Object.assign({}, registerCredentialDefinitionResult), { credentialDefinitionState: registerCredentialDefinitionResult.credentialDefinitionState }));
                }
                return Object.assign(Object.assign({}, registerCredentialDefinitionResult), { credentialDefinitionState: registerCredentialDefinitionResult.credentialDefinitionState });
            });
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _instanceExtraInitializers);
        }
    };
    __setFunctionName(_classThis, "AnonCredsController");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _getSchemaById_decorators = [(0, tsoa_1.Example)(AnonCredsControllerExamples_1.anonCredsGetSchemaSuccessExample), (0, tsoa_1.Response)(404, 'Schema not found', AnonCredsControllerExamples_1.anonCredsGetSchemaFailedExample), (0, tsoa_1.Response)(400, 'Invalid schemaId or unknown AnonCreds method provided', AnonCredsControllerExamples_1.anonCredsGetSchemaFailedExample), (0, tsoa_1.Response)(500, 'Unknown error retrieving schema', AnonCredsControllerExamples_1.anonCredsGetSchemaFailedExample), (0, tsoa_1.Get)('/schemas/:schemaId')];
        _registerSchema_decorators = [(0, tsoa_1.Example)(AnonCredsControllerExamples_1.anonCredsRegisterSchemaSuccessExample), (0, tsoa_1.Response)(500, 'Unknown error registering schema', AnonCredsControllerExamples_1.anonCredsRegisterSchemaFailedExample), (0, tsoa_1.Response)(200, 'Action required'), (0, tsoa_1.Response)(202, 'Wait for action to complete'), (0, tsoa_1.Post)('/schemas')];
        _getCredentialDefinitionById_decorators = [(0, tsoa_1.Example)(AnonCredsControllerExamples_1.anonCredsGetCredentialDefinitionSuccessExample), (0, tsoa_1.Response)(404, 'CredentialDefinition not found', AnonCredsControllerExamples_1.anonCredsGetCredentialDefinitionFailedExample), (0, tsoa_1.Response)(400, 'Invalid credentialDefinitionId or unknown AnonCreds method provided', AnonCredsControllerExamples_1.anonCredsGetCredentialDefinitionFailedExample), (0, tsoa_1.Response)(500, 'Unknown error retrieving credentialDefinition', AnonCredsControllerExamples_1.anonCredsGetCredentialDefinitionFailedExample), (0, tsoa_1.Get)('/credential-definitions/:credentialDefinitionId')];
        _registerCredentialDefinition_decorators = [(0, tsoa_1.Example)(AnonCredsControllerExamples_1.anonCredsRegisterCredentialDefinitionSuccessExample), (0, tsoa_1.Response)(500, 'Unknown error registering credentialDefinition', AnonCredsControllerExamples_1.anonCredsRegisterCredentialDefinitionFailedExample), (0, tsoa_1.Response)(200, 'Action required'), (0, tsoa_1.Response)(202, 'Wait for action to complete'), (0, tsoa_1.Post)('/credential-definitions')];
        __esDecorate(_classThis, null, _getSchemaById_decorators, { kind: "method", name: "getSchemaById", static: false, private: false, access: { has: obj => "getSchemaById" in obj, get: obj => obj.getSchemaById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _registerSchema_decorators, { kind: "method", name: "registerSchema", static: false, private: false, access: { has: obj => "registerSchema" in obj, get: obj => obj.registerSchema }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCredentialDefinitionById_decorators, { kind: "method", name: "getCredentialDefinitionById", static: false, private: false, access: { has: obj => "getCredentialDefinitionById" in obj, get: obj => obj.getCredentialDefinitionById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _registerCredentialDefinition_decorators, { kind: "method", name: "registerCredentialDefinition", static: false, private: false, access: { has: obj => "registerCredentialDefinition" in obj, get: obj => obj.registerCredentialDefinition }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AnonCredsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AnonCredsController = _classThis;
})();
exports.AnonCredsController = AnonCredsController;
