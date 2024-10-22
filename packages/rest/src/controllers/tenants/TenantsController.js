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
exports.TenantsController = void 0;
const tsoa_1 = require("tsoa");
const tsyringe_1 = require("tsyringe");
const TenantControllerExamples_1 = require("./TenantControllerExamples");
const TenantsControllerTypes_1 = require("./TenantsControllerTypes");
let TenantsController = (() => {
    let _classDecorators = [(0, tsoa_1.Tags)('Tenants'), (0, tsoa_1.Route)('/tenants'), (0, tsoa_1.Security)('tenants', ['admin']), (0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = tsoa_1.Controller;
    let _instanceExtraInitializers = [];
    let _createTenant_decorators;
    let _getTenant_decorators;
    let _updateTenant_decorators;
    let _deleteTenant_decorators;
    let _getTenantsByQuery_decorators;
    var TenantsController = _classThis = class extends _classSuper {
        /**
         * create new tenant
         */
        createTenant(request, body) {
            return __awaiter(this, void 0, void 0, function* () {
                const tenant = yield request.user.agent.modules.tenants.createTenant({
                    config: body.config,
                });
                return (0, TenantsControllerTypes_1.tenantRecordToApiModel)(tenant);
            });
        }
        /**
         * get tenant by id
         */
        getTenant(request, tenantId) {
            return __awaiter(this, void 0, void 0, function* () {
                const tenant = yield request.user.agent.modules.tenants.getTenantById(tenantId);
                return (0, TenantsControllerTypes_1.tenantRecordToApiModel)(tenant);
            });
        }
        /**
         * update tenant by id.
         *
         * NOTE: this does not overwrite the entire tenant record, only the properties that are passed in the body.
         * If you want to unset an non-required value, you can pass `null`.
         */
        updateTenant(request, tenantId, body) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                const tenantRecord = yield request.user.agent.modules.tenants.getTenantById(tenantId);
                tenantRecord.config = Object.assign({}, tenantRecord.config);
                // Set to value, or if null was provided, to undefined
                if (((_a = body.config) === null || _a === void 0 ? void 0 : _a.connectionImageUrl) !== undefined) {
                    tenantRecord.config.connectionImageUrl = (_b = body.config.connectionImageUrl) !== null && _b !== void 0 ? _b : undefined;
                }
                // Overwrite if value was provided
                tenantRecord.config.label = (_d = (_c = body.config) === null || _c === void 0 ? void 0 : _c.label) !== null && _d !== void 0 ? _d : tenantRecord.config.label;
                yield request.user.agent.modules.tenants.updateTenant(tenantRecord);
                return (0, TenantsControllerTypes_1.tenantRecordToApiModel)(tenantRecord);
            });
        }
        /**
         * delete tenant by id
         */
        deleteTenant(request, tenantId) {
            return __awaiter(this, void 0, void 0, function* () {
                this.setStatus(204);
                yield request.user.agent.modules.tenants.deleteTenantById(tenantId);
            });
        }
        /**
         * get tenants by query
         */
        getTenantsByQuery(request, label, storageVersion) {
            return __awaiter(this, void 0, void 0, function* () {
                const tenants = yield request.user.agent.modules.tenants.findTenantsByQuery({
                    label,
                    storageVersion: storageVersion,
                });
                return tenants.map(TenantsControllerTypes_1.tenantRecordToApiModel);
            });
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _instanceExtraInitializers);
        }
    };
    __setFunctionName(_classThis, "TenantsController");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _createTenant_decorators = [(0, tsoa_1.Post)('/'), (0, tsoa_1.Example)(TenantControllerExamples_1.tenantRecordExample)];
        _getTenant_decorators = [(0, tsoa_1.Get)('/{tenantId}'), (0, tsoa_1.Example)(TenantControllerExamples_1.tenantRecordExample)];
        _updateTenant_decorators = [(0, tsoa_1.Put)('/{tenantId}'), (0, tsoa_1.Example)(TenantControllerExamples_1.tenantRecordExample)];
        _deleteTenant_decorators = [(0, tsoa_1.Delete)('/{tenantId}')];
        _getTenantsByQuery_decorators = [(0, tsoa_1.Get)('/'), (0, tsoa_1.Example)([TenantControllerExamples_1.tenantRecordExample])];
        __esDecorate(_classThis, null, _createTenant_decorators, { kind: "method", name: "createTenant", static: false, private: false, access: { has: obj => "createTenant" in obj, get: obj => obj.createTenant }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTenant_decorators, { kind: "method", name: "getTenant", static: false, private: false, access: { has: obj => "getTenant" in obj, get: obj => obj.getTenant }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateTenant_decorators, { kind: "method", name: "updateTenant", static: false, private: false, access: { has: obj => "updateTenant" in obj, get: obj => obj.updateTenant }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteTenant_decorators, { kind: "method", name: "deleteTenant", static: false, private: false, access: { has: obj => "deleteTenant" in obj, get: obj => obj.deleteTenant }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTenantsByQuery_decorators, { kind: "method", name: "getTenantsByQuery", static: false, private: false, access: { has: obj => "getTenantsByQuery" in obj, get: obj => obj.getTenantsByQuery }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TenantsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TenantsController = _classThis;
})();
exports.TenantsController = TenantsController;
