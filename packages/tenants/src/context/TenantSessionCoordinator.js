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
exports.TenantSessionCoordinator = void 0;
const core_1 = require("@aries-framework/core");
const async_mutex_1 = require("async-mutex");
const TenantSessionMutex_1 = require("./TenantSessionMutex");
/**
 * Coordinates all agent context instance for tenant sessions.
 *
 * This class keeps a mapping of tenant ids (context correlation ids) to agent context sessions mapping. Each mapping contains the agent context,
 * the current session count and a mutex for making operations against the session mapping (opening / closing an agent context). The mutex ensures
 * we're not susceptible to race conditions where multiple calls to open/close an agent context are made at the same time. Even though JavaScript is
 * single threaded, promises can introduce race conditions as one process can stop and another process can be picked up.
 *
 * NOTE: the implementation doesn't yet cache agent context objects after they aren't being used for any sessions anymore. This means if a wallet is being used
 * often in a short time it will be opened/closed very often. This is an improvement to be made in the near future.
 */
let TenantSessionCoordinator = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TenantSessionCoordinator = _classThis = class {
        constructor(rootAgentContext, logger, tenantsModuleConfig) {
            this.tenantAgentContextMapping = {};
            this.rootAgentContext = rootAgentContext;
            this.logger = logger;
            this.tenantsModuleConfig = tenantsModuleConfig;
            // TODO: we should make the timeout and the session limit configurable, but until we have the modularization in place with
            // module specific config, it's not easy to do so. Keeping it hardcoded for now
            this.sessionMutex = new TenantSessionMutex_1.TenantSessionMutex(this.logger, this.tenantsModuleConfig.sessionLimit, this.tenantsModuleConfig.sessionAcquireTimeout);
        }
        /**
         * Get agent context to use for a session. If an agent context for this tenant does not exist yet
         * it will create it and store it for later use. If the agent context does already exist it will
         * be returned.
         */
        getContextForSession(tenantRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Getting context for session with tenant '${tenantRecord.id}'`);
                // Wait for a session to be available
                yield this.sessionMutex.acquireSession();
                try {
                    return yield this.mutexForTenant(tenantRecord.id).runExclusive(() => __awaiter(this, void 0, void 0, function* () {
                        this.logger.debug(`Acquired lock for tenant '${tenantRecord.id}' to get context`);
                        const tenantSessions = this.getTenantSessionsMapping(tenantRecord.id);
                        // If we don't have an agent context already, create one and initialize it
                        if (!tenantSessions.agentContext) {
                            this.logger.debug(`No agent context has been initialized for tenant '${tenantRecord.id}', creating one`);
                            tenantSessions.agentContext = yield this.createAgentContext(tenantRecord);
                        }
                        // If we already have a context with sessions in place return the context and increment
                        // the session count.
                        tenantSessions.sessionCount++;
                        this.logger.debug(`Increased agent context session count for tenant '${tenantRecord.id}' to ${tenantSessions.sessionCount}`);
                        return tenantSessions.agentContext;
                    }));
                }
                catch (error) {
                    this.logger.debug(`Releasing session because an error occurred while getting the context for tenant ${tenantRecord.id}`, {
                        errorMessage: error.message,
                    });
                    // If there was an error acquiring the session, we MUST release it, otherwise this will lead to deadlocks over time.
                    this.sessionMutex.releaseSession();
                    // Re-throw error
                    throw error;
                }
            });
        }
        /**
         * End a session for the provided agent context. It will decrease the session count for the agent context.
         * If the number of sessions is zero after the context for this session has been ended, the agent context will be closed.
         */
        endAgentContextSession(agentContext) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Ending session for agent context with contextCorrelationId ${agentContext.contextCorrelationId}'`);
                const hasTenantSessionMapping = this.hasTenantSessionMapping(agentContext.contextCorrelationId);
                // Custom handling for the root agent context. We don't keep track of the total number of sessions for the root
                // agent context, and we always keep the dependency manager intact.
                if (!hasTenantSessionMapping && agentContext.contextCorrelationId === this.rootAgentContext.contextCorrelationId) {
                    this.logger.debug('Ending session for root agent context. Not disposing dependency manager');
                    return;
                }
                // This should not happen
                if (!hasTenantSessionMapping) {
                    this.logger.error(`Unknown agent context with contextCorrelationId '${agentContext.contextCorrelationId}'.  Cannot end session`);
                    throw new core_1.AriesFrameworkError(`Unknown agent context with contextCorrelationId '${agentContext.contextCorrelationId}'. Cannot end session`);
                }
                yield this.mutexForTenant(agentContext.contextCorrelationId).runExclusive(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.debug(`Acquired lock for tenant '${agentContext.contextCorrelationId}' to end session context`);
                    const tenantSessions = this.getTenantSessionsMapping(agentContext.contextCorrelationId);
                    // TODO: check if session count is already 0
                    tenantSessions.sessionCount--;
                    this.logger.debug(`Decreased agent context session count for tenant '${agentContext.contextCorrelationId}' to ${tenantSessions.sessionCount}`);
                    if (tenantSessions.sessionCount <= 0 && tenantSessions.agentContext) {
                        yield this.closeAgentContext(tenantSessions.agentContext);
                        delete this.tenantAgentContextMapping[agentContext.contextCorrelationId];
                    }
                }));
                // Release a session so new sessions can be acquired
                this.sessionMutex.releaseSession();
            });
        }
        hasTenantSessionMapping(tenantId) {
            return this.tenantAgentContextMapping[tenantId] !== undefined;
        }
        getTenantSessionsMapping(tenantId) {
            let tenantSessionMapping = this.tenantAgentContextMapping[tenantId];
            if (tenantSessionMapping)
                return tenantSessionMapping;
            tenantSessionMapping = {
                sessionCount: 0,
                mutex: (0, async_mutex_1.withTimeout)(new async_mutex_1.Mutex(), 
                // NOTE: It can take a while to create an indy wallet. We're using RAW key derivation which should
                // be fast enough to not cause a problem. This wil also only be problem when the wallet is being created
                // for the first time or being acquired while wallet initialization is in progress.
                this.tenantsModuleConfig.sessionAcquireTimeout, new core_1.AriesFrameworkError(`Error acquiring lock for tenant ${tenantId}. Wallet initialization or shutdown took too long.`)),
            };
            this.tenantAgentContextMapping[tenantId] = tenantSessionMapping;
            return tenantSessionMapping;
        }
        mutexForTenant(tenantId) {
            const tenantSessions = this.getTenantSessionsMapping(tenantId);
            return tenantSessions.mutex;
        }
        createAgentContext(tenantRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const tenantDependencyManager = this.rootAgentContext.dependencyManager.createChild();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const _c = (_b = (_a = this.rootAgentContext.config) === null || _a === void 0 ? void 0 : _a.walletConfig) !== null && _b !== void 0 ? _b : {}, { id, key, keyDerivationMethod } = _c, strippedWalletConfig = __rest(_c, ["id", "key", "keyDerivationMethod"]);
                const tenantConfig = this.rootAgentContext.config.extend(Object.assign(Object.assign({}, tenantRecord.config), { walletConfig: Object.assign(Object.assign({}, strippedWalletConfig), tenantRecord.config.walletConfig) }));
                const agentContext = new core_1.AgentContext({
                    contextCorrelationId: tenantRecord.id,
                    dependencyManager: tenantDependencyManager,
                });
                tenantDependencyManager.registerInstance(core_1.AgentContext, agentContext);
                tenantDependencyManager.registerInstance(core_1.AgentConfig, tenantConfig);
                // NOTE: we're using the wallet api here because that correctly handle creating if it doesn't exist yet
                // and will also write the storage version to the storage, which is needed by the update assistant. We either
                // need to move this out of the module, or just keep using the module here.
                const walletApi = agentContext.dependencyManager.resolve(core_1.WalletApi);
                if (!tenantConfig.walletConfig) {
                    throw new core_1.WalletError('Cannot initialize tenant without Wallet config.');
                }
                yield walletApi.initialize(tenantConfig.walletConfig);
                return agentContext;
            });
        }
        closeAgentContext(agentContext) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Closing agent context for tenant '${agentContext.contextCorrelationId}'`);
                yield agentContext.dependencyManager.dispose();
            });
        }
    };
    __setFunctionName(_classThis, "TenantSessionCoordinator");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TenantSessionCoordinator = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TenantSessionCoordinator = _classThis;
})();
exports.TenantSessionCoordinator = TenantSessionCoordinator;
