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
exports.MediationRecord = void 0;
const class_transformer_1 = require("class-transformer");
const error_1 = require("../../../error");
const BaseRecord_1 = require("../../../storage/BaseRecord");
const uuid_1 = require("../../../utils/uuid");
const MediatorPickupStrategy_1 = require("../MediatorPickupStrategy");
const MediationState_1 = require("../models/MediationState");
let MediationRecord = (() => {
    var _a;
    let _classSuper = BaseRecord_1.BaseRecord;
    let _pickupStrategy_decorators;
    let _pickupStrategy_initializers = [];
    let _pickupStrategy_extraInitializers = [];
    return _a = class MediationRecord extends _classSuper {
            constructor(props) {
                var _b, _c, _d, _e;
                super();
                this.pickupStrategy = __runInitializers(this, _pickupStrategy_initializers, void 0);
                this.type = (__runInitializers(this, _pickupStrategy_extraInitializers), _a.type);
                if (props) {
                    this.id = (_b = props.id) !== null && _b !== void 0 ? _b : (0, uuid_1.uuid)();
                    this.createdAt = (_c = props.createdAt) !== null && _c !== void 0 ? _c : new Date();
                    this.connectionId = props.connectionId;
                    this.threadId = props.threadId;
                    this.recipientKeys = props.recipientKeys || [];
                    this.routingKeys = props.routingKeys || [];
                    this.state = props.state;
                    this.role = props.role;
                    this.endpoint = (_d = props.endpoint) !== null && _d !== void 0 ? _d : undefined;
                    this.pickupStrategy = props.pickupStrategy;
                    this._tags = (_e = props.tags) !== null && _e !== void 0 ? _e : {};
                }
            }
            getTags() {
                return Object.assign(Object.assign({}, this._tags), { state: this.state, role: this.role, connectionId: this.connectionId, threadId: this.threadId, recipientKeys: this.recipientKeys });
            }
            addRecipientKey(recipientKey) {
                this.recipientKeys.push(recipientKey);
            }
            removeRecipientKey(recipientKey) {
                const index = this.recipientKeys.indexOf(recipientKey, 0);
                if (index > -1) {
                    this.recipientKeys.splice(index, 1);
                    return true;
                }
                return false;
            }
            get isReady() {
                return this.state === MediationState_1.MediationState.Granted;
            }
            assertReady() {
                if (!this.isReady) {
                    throw new error_1.AriesFrameworkError(`Mediation record is not ready to be used. Expected ${MediationState_1.MediationState.Granted}, found invalid state ${this.state}`);
                }
            }
            assertState(expectedStates) {
                if (!Array.isArray(expectedStates)) {
                    expectedStates = [expectedStates];
                }
                if (!expectedStates.includes(this.state)) {
                    throw new error_1.AriesFrameworkError(`Mediation record is in invalid state ${this.state}. Valid states are: ${expectedStates.join(', ')}.`);
                }
            }
            assertRole(expectedRole) {
                if (this.role !== expectedRole) {
                    throw new error_1.AriesFrameworkError(`Mediation record has invalid role ${this.role}. Expected role ${expectedRole}.`);
                }
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _pickupStrategy_decorators = [(0, class_transformer_1.Transform)(({ value }) => {
                    if (value === 'Explicit') {
                        return MediatorPickupStrategy_1.MediatorPickupStrategy.PickUpV1;
                    }
                    else {
                        return value;
                    }
                })];
            __esDecorate(null, null, _pickupStrategy_decorators, { kind: "field", name: "pickupStrategy", static: false, private: false, access: { has: obj => "pickupStrategy" in obj, get: obj => obj.pickupStrategy, set: (obj, value) => { obj.pickupStrategy = value; } }, metadata: _metadata }, _pickupStrategy_initializers, _pickupStrategy_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = 'MediationRecord',
        _a;
})();
exports.MediationRecord = MediationRecord;
