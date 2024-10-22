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
exports.OutOfBandRecord = void 0;
const class_transformer_1 = require("class-transformer");
const error_1 = require("../../../error");
const BaseRecord_1 = require("../../../storage/BaseRecord");
const thread_1 = require("../../../utils/thread");
const uuid_1 = require("../../../utils/uuid");
const messages_1 = require("../messages");
let OutOfBandRecord = (() => {
    var _a;
    let _classSuper = BaseRecord_1.BaseRecord;
    let _outOfBandInvitation_decorators;
    let _outOfBandInvitation_initializers = [];
    let _outOfBandInvitation_extraInitializers = [];
    return _a = class OutOfBandRecord extends _classSuper {
            constructor(props) {
                var _b, _c, _d, _e;
                super();
                this.outOfBandInvitation = __runInitializers(this, _outOfBandInvitation_initializers, void 0);
                this.role = __runInitializers(this, _outOfBandInvitation_extraInitializers);
                this.type = _a.type;
                if (props) {
                    this.id = (_b = props.id) !== null && _b !== void 0 ? _b : (0, uuid_1.uuid)();
                    this.createdAt = (_c = props.createdAt) !== null && _c !== void 0 ? _c : new Date();
                    this.outOfBandInvitation = props.outOfBandInvitation;
                    this.role = props.role;
                    this.state = props.state;
                    this.alias = props.alias;
                    this.autoAcceptConnection = props.autoAcceptConnection;
                    this.reusable = (_d = props.reusable) !== null && _d !== void 0 ? _d : false;
                    this.mediatorId = props.mediatorId;
                    this.reuseConnectionId = props.reuseConnectionId;
                    this._tags = (_e = props.tags) !== null && _e !== void 0 ? _e : { recipientKeyFingerprints: [] };
                }
            }
            getTags() {
                var _b;
                return Object.assign(Object.assign({}, this._tags), { role: this.role, state: this.state, invitationId: this.outOfBandInvitation.id, threadId: this.outOfBandInvitation.threadId, invitationRequestsThreadIds: (_b = this.outOfBandInvitation
                        .getRequests()) === null || _b === void 0 ? void 0 : _b.map((r) => (0, thread_1.getThreadIdFromPlainTextMessage)(r)) });
            }
            assertRole(expectedRole) {
                if (this.role !== expectedRole) {
                    throw new error_1.AriesFrameworkError(`Invalid out-of-band record role ${this.role}, expected is ${expectedRole}.`);
                }
            }
            assertState(expectedStates) {
                if (!Array.isArray(expectedStates)) {
                    expectedStates = [expectedStates];
                }
                if (!expectedStates.includes(this.state)) {
                    throw new error_1.AriesFrameworkError(`Invalid out-of-band record state ${this.state}, valid states are: ${expectedStates.join(', ')}.`);
                }
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _outOfBandInvitation_decorators = [(0, class_transformer_1.Type)(() => messages_1.OutOfBandInvitation)];
            __esDecorate(null, null, _outOfBandInvitation_decorators, { kind: "field", name: "outOfBandInvitation", static: false, private: false, access: { has: obj => "outOfBandInvitation" in obj, get: obj => obj.outOfBandInvitation, set: (obj, value) => { obj.outOfBandInvitation = value; } }, metadata: _metadata }, _outOfBandInvitation_initializers, _outOfBandInvitation_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = 'OutOfBandRecord',
        _a;
})();
exports.OutOfBandRecord = OutOfBandRecord;
