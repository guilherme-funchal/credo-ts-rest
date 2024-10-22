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
exports.PushNotificationsApnsApi = void 0;
const core_1 = require("@credo-ts/core");
let PushNotificationsApnsApi = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PushNotificationsApnsApi = _classThis = class {
        constructor(messageSender, pushNotificationsService, connectionService, agentContext) {
            this.messageSender = messageSender;
            this.pushNotificationsService = pushNotificationsService;
            this.connectionService = connectionService;
            this.agentContext = agentContext;
        }
        /**
         * Sends a set request with the apns device info (token) to another agent via a `connectionId`
         *
         * @param connectionId The connection ID string
         * @param deviceInfo The APNS device info
         * @returns Promise<void>
         */
        setDeviceInfo(connectionId, deviceInfo) {
            return __awaiter(this, void 0, void 0, function* () {
                const connection = yield this.connectionService.getById(this.agentContext, connectionId);
                connection.assertReady();
                const message = this.pushNotificationsService.createSetDeviceInfo(deviceInfo);
                const outbound = new core_1.OutboundMessageContext(message, {
                    agentContext: this.agentContext,
                    connection: connection,
                });
                yield this.messageSender.sendMessage(outbound);
            });
        }
        /**
         * Sends the requested apns device info (token) to another agent via a `connectionId`
         * Response for `push-notifications-apns/get-device-info`
         *
         * @param connectionId The connection ID string
         * @param threadId get-device-info message ID
         * @param deviceInfo The APNS device info
         * @returns Promise<void>
         */
        deviceInfo(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { connectionId, threadId, deviceInfo } = options;
                const connection = yield this.connectionService.getById(this.agentContext, connectionId);
                connection.assertReady();
                const message = this.pushNotificationsService.createDeviceInfo({ threadId, deviceInfo });
                const outbound = new core_1.OutboundMessageContext(message, {
                    agentContext: this.agentContext,
                    connection: connection,
                });
                yield this.messageSender.sendMessage(outbound);
            });
        }
        /**
         * Gets the apns device info (token) from another agent via the `connectionId`
         *
         * @param connectionId The connection ID string
         * @returns Promise<void>
         */
        getDeviceInfo(connectionId) {
            return __awaiter(this, void 0, void 0, function* () {
                const connection = yield this.connectionService.getById(this.agentContext, connectionId);
                connection.assertReady();
                const message = this.pushNotificationsService.createGetDeviceInfo();
                const outbound = new core_1.OutboundMessageContext(message, {
                    agentContext: this.agentContext,
                    connection: connection,
                });
                yield this.messageSender.sendMessage(outbound);
            });
        }
    };
    __setFunctionName(_classThis, "PushNotificationsApnsApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PushNotificationsApnsApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PushNotificationsApnsApi = _classThis;
})();
exports.PushNotificationsApnsApi = PushNotificationsApnsApi;
