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
exports.ActionMenuRecord = void 0;
const core_1 = require("@aries-framework/core");
const class_transformer_1 = require("class-transformer");
const models_1 = require("../models");
/**
 * @public
 */
let ActionMenuRecord = (() => {
    var _a;
    let _classSuper = core_1.BaseRecord;
    let _menu_decorators;
    let _menu_initializers = [];
    let _menu_extraInitializers = [];
    let _performedAction_decorators;
    let _performedAction_initializers = [];
    let _performedAction_extraInitializers = [];
    return _a = class ActionMenuRecord extends _classSuper {
            constructor(props) {
                var _b, _c, _d;
                super();
                this.menu = __runInitializers(this, _menu_initializers, void 0);
                this.performedAction = (__runInitializers(this, _menu_extraInitializers), __runInitializers(this, _performedAction_initializers, void 0));
                this.type = (__runInitializers(this, _performedAction_extraInitializers), _a.type);
                if (props) {
                    this.id = (_b = props.id) !== null && _b !== void 0 ? _b : core_1.utils.uuid();
                    this.createdAt = (_c = props.createdAt) !== null && _c !== void 0 ? _c : new Date();
                    this.connectionId = props.connectionId;
                    this.threadId = props.threadId;
                    this.state = props.state;
                    this.role = props.role;
                    this.menu = props.menu;
                    this.performedAction = props.performedAction;
                    this._tags = (_d = props.tags) !== null && _d !== void 0 ? _d : {};
                }
            }
            getTags() {
                return Object.assign(Object.assign({}, this._tags), { role: this.role, connectionId: this.connectionId, threadId: this.threadId });
            }
            assertState(expectedStates) {
                if (!Array.isArray(expectedStates)) {
                    expectedStates = [expectedStates];
                }
                if (!expectedStates.includes(this.state)) {
                    throw new core_1.AriesFrameworkError(`Action Menu record is in invalid state ${this.state}. Valid states are: ${expectedStates.join(', ')}.`);
                }
            }
            assertRole(expectedRole) {
                if (this.role !== expectedRole) {
                    throw new core_1.AriesFrameworkError(`Action Menu record has invalid role ${this.role}. Expected role ${expectedRole}.`);
                }
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _menu_decorators = [(0, class_transformer_1.Type)(() => models_1.ActionMenu)];
            _performedAction_decorators = [(0, class_transformer_1.Type)(() => models_1.ActionMenuSelection)];
            __esDecorate(null, null, _menu_decorators, { kind: "field", name: "menu", static: false, private: false, access: { has: obj => "menu" in obj, get: obj => obj.menu, set: (obj, value) => { obj.menu = value; } }, metadata: _metadata }, _menu_initializers, _menu_extraInitializers);
            __esDecorate(null, null, _performedAction_decorators, { kind: "field", name: "performedAction", static: false, private: false, access: { has: obj => "performedAction" in obj, get: obj => obj.performedAction, set: (obj, value) => { obj.performedAction = value; } }, metadata: _metadata }, _performedAction_initializers, _performedAction_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = 'ActionMenuRecord',
        _a;
})();
exports.ActionMenuRecord = ActionMenuRecord;
