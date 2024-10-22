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
const basic_messages_1 = require("../../modules/basic-messages");
const cache_1 = require("../../modules/cache");
const connections_1 = require("../../modules/connections");
const credentials_1 = require("../../modules/credentials");
const dids_1 = require("../../modules/dids");
const discover_features_1 = require("../../modules/discover-features");
const generic_records_1 = require("../../modules/generic-records");
const message_p_ckup_1 = require("../../modules/message-p\u00ECckup");
const oob_1 = require("../../modules/oob");
const proofs_1 = require("../../modules/proofs");
const routing_1 = require("../../modules/routing");
const vc_1 = require("../../modules/vc");
const plugins_1 = require("../../plugins");
const wallet_1 = require("../../wallet");
const AgentModules_1 = require("../AgentModules");
let MyApi = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MyApi = _classThis = class {
    };
    __setFunctionName(_classThis, "MyApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MyApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MyApi = _classThis;
})();
class MyModuleWithApi {
    constructor() {
        this.api = MyApi;
    }
    register(dependencyManager) {
        dependencyManager.registerContextScoped(MyApi);
    }
}
class MyModuleWithoutApi {
    register() {
        // nothing to register
    }
}
describe('AgentModules', () => {
    describe('getAgentApi', () => {
        test('returns object with all api instances for modules with public api in dependency manager', () => {
            const dependencyManager = new plugins_1.DependencyManager();
            dependencyManager.registerModules({
                withApi: new MyModuleWithApi(),
                withoutApi: new MyModuleWithoutApi(),
            });
            const api = (0, AgentModules_1.getAgentApi)(dependencyManager);
            expect(api).toEqual({
                withApi: expect.any(MyApi),
            });
        });
    });
    describe('extendModulesWithDefaultModules', () => {
        test('returns default modules if no modules were provided', () => {
            const extendedModules = (0, AgentModules_1.extendModulesWithDefaultModules)();
            expect(extendedModules).toEqual({
                connections: expect.any(connections_1.ConnectionsModule),
                credentials: expect.any(credentials_1.CredentialsModule),
                proofs: expect.any(proofs_1.ProofsModule),
                mediator: expect.any(routing_1.MediatorModule),
                mediationRecipient: expect.any(routing_1.MediationRecipientModule),
                messagePickup: expect.any(message_p_ckup_1.MessagePickupModule),
                basicMessages: expect.any(basic_messages_1.BasicMessagesModule),
                genericRecords: expect.any(generic_records_1.GenericRecordsModule),
                discovery: expect.any(discover_features_1.DiscoverFeaturesModule),
                dids: expect.any(dids_1.DidsModule),
                wallet: expect.any(wallet_1.WalletModule),
                oob: expect.any(oob_1.OutOfBandModule),
                w3cCredentials: expect.any(vc_1.W3cCredentialsModule),
                cache: expect.any(cache_1.CacheModule),
            });
        });
        test('returns custom and default modules if custom modules are provided', () => {
            const myModule = new MyModuleWithApi();
            const extendedModules = (0, AgentModules_1.extendModulesWithDefaultModules)({
                myModule,
            });
            expect(extendedModules).toEqual({
                connections: expect.any(connections_1.ConnectionsModule),
                credentials: expect.any(credentials_1.CredentialsModule),
                proofs: expect.any(proofs_1.ProofsModule),
                mediator: expect.any(routing_1.MediatorModule),
                mediationRecipient: expect.any(routing_1.MediationRecipientModule),
                messagePickup: expect.any(message_p_ckup_1.MessagePickupModule),
                basicMessages: expect.any(basic_messages_1.BasicMessagesModule),
                genericRecords: expect.any(generic_records_1.GenericRecordsModule),
                discovery: expect.any(discover_features_1.DiscoverFeaturesModule),
                dids: expect.any(dids_1.DidsModule),
                wallet: expect.any(wallet_1.WalletModule),
                oob: expect.any(oob_1.OutOfBandModule),
                w3cCredentials: expect.any(vc_1.W3cCredentialsModule),
                cache: expect.any(cache_1.CacheModule),
                myModule,
            });
        });
        test('does not override default module if provided as custom module', () => {
            const myModule = new MyModuleWithApi();
            const connections = new connections_1.ConnectionsModule();
            const extendedModules = (0, AgentModules_1.extendModulesWithDefaultModules)({
                myModule,
                connections,
            });
            expect(extendedModules).toEqual({
                connections: connections,
                credentials: expect.any(credentials_1.CredentialsModule),
                proofs: expect.any(proofs_1.ProofsModule),
                mediator: expect.any(routing_1.MediatorModule),
                mediationRecipient: expect.any(routing_1.MediationRecipientModule),
                messagePickup: expect.any(message_p_ckup_1.MessagePickupModule),
                basicMessages: expect.any(basic_messages_1.BasicMessagesModule),
                genericRecords: expect.any(generic_records_1.GenericRecordsModule),
                discovery: expect.any(discover_features_1.DiscoverFeaturesModule),
                dids: expect.any(dids_1.DidsModule),
                wallet: expect.any(wallet_1.WalletModule),
                oob: expect.any(oob_1.OutOfBandModule),
                w3cCredentials: expect.any(vc_1.W3cCredentialsModule),
                cache: expect.any(cache_1.CacheModule),
                myModule,
            });
        });
    });
});
