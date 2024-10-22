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
exports.ProblemReportMessage = exports.OtherStatus = exports.WhereStatus = exports.ImpactStatus = exports.WhoRetriesStatus = void 0;
// Create a base ProblemReportMessage message class and add it to the messages directory
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const AgentMessage_1 = require("../../../agent/AgentMessage");
const messageType_1 = require("../../../utils/messageType");
var WhoRetriesStatus;
(function (WhoRetriesStatus) {
    WhoRetriesStatus["You"] = "YOU";
    WhoRetriesStatus["Me"] = "ME";
    WhoRetriesStatus["Both"] = "BOTH";
    WhoRetriesStatus["None"] = "NONE";
})(WhoRetriesStatus || (exports.WhoRetriesStatus = WhoRetriesStatus = {}));
var ImpactStatus;
(function (ImpactStatus) {
    ImpactStatus["Message"] = "MESSAGE";
    ImpactStatus["Thread"] = "THREAD";
    ImpactStatus["Connection"] = "CONNECTION";
})(ImpactStatus || (exports.ImpactStatus = ImpactStatus = {}));
var WhereStatus;
(function (WhereStatus) {
    WhereStatus["Cloud"] = "CLOUD";
    WhereStatus["Edge"] = "EDGE";
    WhereStatus["Wire"] = "WIRE";
    WhereStatus["Agency"] = "AGENCY";
})(WhereStatus || (exports.WhereStatus = WhereStatus = {}));
var OtherStatus;
(function (OtherStatus) {
    OtherStatus["You"] = "YOU";
    OtherStatus["Me"] = "ME";
    OtherStatus["Other"] = "OTHER";
})(OtherStatus || (exports.OtherStatus = OtherStatus = {}));
/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/main/features/0035-report-problem/README.md
 */
let ProblemReportMessage = (() => {
    var _a;
    let _classSuper = AgentMessage_1.AgentMessage;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _problemItems_decorators;
    let _problemItems_initializers = [];
    let _problemItems_extraInitializers = [];
    let _whoRetries_decorators;
    let _whoRetries_initializers = [];
    let _whoRetries_extraInitializers = [];
    let _fixHint_decorators;
    let _fixHint_initializers = [];
    let _fixHint_extraInitializers = [];
    let _where_decorators;
    let _where_initializers = [];
    let _where_extraInitializers = [];
    let _impact_decorators;
    let _impact_initializers = [];
    let _impact_extraInitializers = [];
    let _noticedTime_decorators;
    let _noticedTime_initializers = [];
    let _noticedTime_extraInitializers = [];
    let _trackingUri_decorators;
    let _trackingUri_initializers = [];
    let _trackingUri_extraInitializers = [];
    let _escalationUri_decorators;
    let _escalationUri_initializers = [];
    let _escalationUri_extraInitializers = [];
    return _a = class ProblemReportMessage extends _classSuper {
            /**
             * Create new ReportProblem instance.
             * @param options
             */
            constructor(options) {
                super();
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                this.description = __runInitializers(this, _type_extraInitializers);
                this.problemItems = __runInitializers(this, _problemItems_initializers, void 0);
                this.whoRetries = (__runInitializers(this, _problemItems_extraInitializers), __runInitializers(this, _whoRetries_initializers, void 0));
                this.fixHint = (__runInitializers(this, _whoRetries_extraInitializers), __runInitializers(this, _fixHint_initializers, void 0));
                this.where = (__runInitializers(this, _fixHint_extraInitializers), __runInitializers(this, _where_initializers, void 0));
                this.impact = (__runInitializers(this, _where_extraInitializers), __runInitializers(this, _impact_initializers, void 0));
                this.noticedTime = (__runInitializers(this, _impact_extraInitializers), __runInitializers(this, _noticedTime_initializers, void 0));
                this.trackingUri = (__runInitializers(this, _noticedTime_extraInitializers), __runInitializers(this, _trackingUri_initializers, void 0));
                this.escalationUri = (__runInitializers(this, _trackingUri_extraInitializers), __runInitializers(this, _escalationUri_initializers, void 0));
                __runInitializers(this, _escalationUri_extraInitializers);
                if (options) {
                    this.id = options.id || this.generateId();
                    this.description = options.description;
                    this.problemItems = options.problemItems;
                    this.whoRetries = options.whoRetries;
                    this.fixHint = options.fixHint;
                    this.impact = options.impact;
                    this.where = options.where;
                    this.noticedTime = options.noticedTime;
                    this.trackingUri = options.trackingUri;
                    this.escalationUri = options.escalationUri;
                }
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _type_decorators = [(0, messageType_1.IsValidMessageType)(ProblemReportMessage.type)];
            _problemItems_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Expose)({ name: 'problem_items' })];
            _whoRetries_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(WhoRetriesStatus), (0, class_transformer_1.Expose)({ name: 'who_retries' })];
            _fixHint_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Expose)({ name: 'fix_hint' })];
            _where_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(WhereStatus)];
            _impact_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(ImpactStatus)];
            _noticedTime_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_transformer_1.Expose)({ name: 'noticed_time' })];
            _trackingUri_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_transformer_1.Expose)({ name: 'tracking_uri' })];
            _escalationUri_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_transformer_1.Expose)({ name: 'escalation_uri' })];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _problemItems_decorators, { kind: "field", name: "problemItems", static: false, private: false, access: { has: obj => "problemItems" in obj, get: obj => obj.problemItems, set: (obj, value) => { obj.problemItems = value; } }, metadata: _metadata }, _problemItems_initializers, _problemItems_extraInitializers);
            __esDecorate(null, null, _whoRetries_decorators, { kind: "field", name: "whoRetries", static: false, private: false, access: { has: obj => "whoRetries" in obj, get: obj => obj.whoRetries, set: (obj, value) => { obj.whoRetries = value; } }, metadata: _metadata }, _whoRetries_initializers, _whoRetries_extraInitializers);
            __esDecorate(null, null, _fixHint_decorators, { kind: "field", name: "fixHint", static: false, private: false, access: { has: obj => "fixHint" in obj, get: obj => obj.fixHint, set: (obj, value) => { obj.fixHint = value; } }, metadata: _metadata }, _fixHint_initializers, _fixHint_extraInitializers);
            __esDecorate(null, null, _where_decorators, { kind: "field", name: "where", static: false, private: false, access: { has: obj => "where" in obj, get: obj => obj.where, set: (obj, value) => { obj.where = value; } }, metadata: _metadata }, _where_initializers, _where_extraInitializers);
            __esDecorate(null, null, _impact_decorators, { kind: "field", name: "impact", static: false, private: false, access: { has: obj => "impact" in obj, get: obj => obj.impact, set: (obj, value) => { obj.impact = value; } }, metadata: _metadata }, _impact_initializers, _impact_extraInitializers);
            __esDecorate(null, null, _noticedTime_decorators, { kind: "field", name: "noticedTime", static: false, private: false, access: { has: obj => "noticedTime" in obj, get: obj => obj.noticedTime, set: (obj, value) => { obj.noticedTime = value; } }, metadata: _metadata }, _noticedTime_initializers, _noticedTime_extraInitializers);
            __esDecorate(null, null, _trackingUri_decorators, { kind: "field", name: "trackingUri", static: false, private: false, access: { has: obj => "trackingUri" in obj, get: obj => obj.trackingUri, set: (obj, value) => { obj.trackingUri = value; } }, metadata: _metadata }, _trackingUri_initializers, _trackingUri_extraInitializers);
            __esDecorate(null, null, _escalationUri_decorators, { kind: "field", name: "escalationUri", static: false, private: false, access: { has: obj => "escalationUri" in obj, get: obj => obj.escalationUri, set: (obj, value) => { obj.escalationUri = value; } }, metadata: _metadata }, _escalationUri_initializers, _escalationUri_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, messageType_1.parseMessageType)('https://didcomm.org/notification/1.0/problem-report'),
        _a;
})();
exports.ProblemReportMessage = ProblemReportMessage;
