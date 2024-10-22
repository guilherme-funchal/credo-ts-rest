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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsApi = void 0;
const core_1 = require("@aries-framework/core");
const TenantAgent_1 = require("./TenantAgent");
let TenantsApi = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TenantsApi = _classThis = class {
        constructor(tenantRecordService, agentContext, agentContextProvider, logger) {
            this.tenantRecordService = tenantRecordService;
            this.agentContext = agentContext;
            this.agentContextProvider = agentContextProvider;
            this.logger = logger;
        }
        getTenantAgent(_a) {
            return __awaiter(this, arguments, void 0, function* ({ tenantId }) {
                this.logger.debug(`Getting tenant agent for tenant '${tenantId}'`);
                const tenantContext = yield this.agentContextProvider.getAgentContextForContextCorrelationId(tenantId);
                this.logger.trace(`Got tenant context for tenant '${tenantId}'`);
                const tenantAgent = new TenantAgent_1.TenantAgent(tenantContext);
                yield tenantAgent.initialize();
                this.logger.trace(`Initializing tenant agent for tenant '${tenantId}'`);
                return tenantAgent;
            });
        }
        withTenantAgent(options, withTenantAgentCallback) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Getting tenant agent for tenant '${options.tenantId}' in with tenant agent callback`);
                const tenantAgent = yield this.getTenantAgent(options);
                try {
                    this.logger.debug(`Calling tenant agent callback for tenant '${options.tenantId}'`);
                    yield withTenantAgentCallback(tenantAgent);
                }
                catch (error) {
                    this.logger.error(`Error in tenant agent callback for tenant '${options.tenantId}'`, { error });
                    throw error;
                }
                finally {
                    this.logger.debug(`Ending tenant agent session for tenant '${options.tenantId}'`);
                    yield tenantAgent.endSession();
                }
            });
        }
        createTenant(options) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Creating tenant with label ${options.config.label}`);
                const tenantRecord = yield this.tenantRecordService.createTenant(this.agentContext, options.config);
                // This initializes the tenant agent, creates the wallet etc...
                const tenantAgent = yield this.getTenantAgent({ tenantId: tenantRecord.id });
                yield tenantAgent.endSession();
                this.logger.info(`Successfully created tenant '${tenantRecord.id}'`);
                return tenantRecord;
            });
        }
        getTenantById(tenantId) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Getting tenant by id '${tenantId}'`);
                return this.tenantRecordService.getTenantById(this.agentContext, tenantId);
            });
        }
        deleteTenantById(tenantId) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Deleting tenant by id '${tenantId}'`);
                // TODO: force remove context from the context provider (or session manager)
                const tenantAgent = yield this.getTenantAgent({ tenantId });
                this.logger.trace(`Deleting wallet for tenant '${tenantId}'`);
                yield tenantAgent.wallet.delete();
                this.logger.trace(`Shutting down agent for tenant '${tenantId}'`);
                yield tenantAgent.endSession();
                return this.tenantRecordService.deleteTenantById(this.agentContext, tenantId);
            });
        }
    };
    __setFunctionName(_classThis, "TenantsApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TenantsApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TenantsApi = _classThis;
})();
exports.TenantsApi = TenantsApi;
