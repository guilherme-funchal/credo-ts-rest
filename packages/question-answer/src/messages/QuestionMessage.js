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
exports.QuestionMessage = void 0;
const core_1 = require("@aries-framework/core");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const models_1 = require("../models");
let QuestionMessage = (() => {
    var _a;
    let _classSuper = core_1.AgentMessage;
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _nonce_decorators;
    let _nonce_initializers = [];
    let _nonce_extraInitializers = [];
    let _signatureRequired_decorators;
    let _signatureRequired_initializers = [];
    let _signatureRequired_extraInitializers = [];
    let _validResponses_decorators;
    let _validResponses_initializers = [];
    let _validResponses_extraInitializers = [];
    let _questionText_decorators;
    let _questionText_initializers = [];
    let _questionText_extraInitializers = [];
    let _questionDetail_decorators;
    let _questionDetail_initializers = [];
    let _questionDetail_extraInitializers = [];
    return _a = class QuestionMessage extends _classSuper {
            /**
             * Create new QuestionMessage instance.
             * @param options
             */
            constructor(options) {
                super();
                this.type = __runInitializers(this, _type_initializers, _a.type.messageTypeUri);
                this.nonce = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _nonce_initializers, void 0));
                this.signatureRequired = (__runInitializers(this, _nonce_extraInitializers), __runInitializers(this, _signatureRequired_initializers, void 0));
                this.validResponses = (__runInitializers(this, _signatureRequired_extraInitializers), __runInitializers(this, _validResponses_initializers, void 0));
                this.questionText = (__runInitializers(this, _validResponses_extraInitializers), __runInitializers(this, _questionText_initializers, void 0));
                this.questionDetail = (__runInitializers(this, _questionText_extraInitializers), __runInitializers(this, _questionDetail_initializers, void 0));
                __runInitializers(this, _questionDetail_extraInitializers);
                if (options) {
                    this.id = options.id || this.generateId();
                    this.nonce = options.nonce;
                    this.questionText = options.questionText;
                    this.questionDetail = options.questionDetail;
                    this.signatureRequired = options.signatureRequired;
                    this.validResponses = options.validResponses;
                }
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _type_decorators = [(0, core_1.IsValidMessageType)(QuestionMessage.type)];
            _nonce_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _signatureRequired_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)(), (0, class_transformer_1.Expose)({ name: 'signature_required' })];
            _validResponses_decorators = [(0, class_transformer_1.Expose)({ name: 'valid_responses' }), (0, class_transformer_1.Type)(() => models_1.ValidResponse), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_validator_1.IsInstance)(models_1.ValidResponse, { each: true })];
            _questionText_decorators = [(0, class_transformer_1.Expose)({ name: 'question_text' }), (0, class_validator_1.IsString)()];
            _questionDetail_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Expose)({ name: 'question_detail' }), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _nonce_decorators, { kind: "field", name: "nonce", static: false, private: false, access: { has: obj => "nonce" in obj, get: obj => obj.nonce, set: (obj, value) => { obj.nonce = value; } }, metadata: _metadata }, _nonce_initializers, _nonce_extraInitializers);
            __esDecorate(null, null, _signatureRequired_decorators, { kind: "field", name: "signatureRequired", static: false, private: false, access: { has: obj => "signatureRequired" in obj, get: obj => obj.signatureRequired, set: (obj, value) => { obj.signatureRequired = value; } }, metadata: _metadata }, _signatureRequired_initializers, _signatureRequired_extraInitializers);
            __esDecorate(null, null, _validResponses_decorators, { kind: "field", name: "validResponses", static: false, private: false, access: { has: obj => "validResponses" in obj, get: obj => obj.validResponses, set: (obj, value) => { obj.validResponses = value; } }, metadata: _metadata }, _validResponses_initializers, _validResponses_extraInitializers);
            __esDecorate(null, null, _questionText_decorators, { kind: "field", name: "questionText", static: false, private: false, access: { has: obj => "questionText" in obj, get: obj => obj.questionText, set: (obj, value) => { obj.questionText = value; } }, metadata: _metadata }, _questionText_initializers, _questionText_extraInitializers);
            __esDecorate(null, null, _questionDetail_decorators, { kind: "field", name: "questionDetail", static: false, private: false, access: { has: obj => "questionDetail" in obj, get: obj => obj.questionDetail, set: (obj, value) => { obj.questionDetail = value; } }, metadata: _metadata }, _questionDetail_initializers, _questionDetail_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = (0, core_1.parseMessageType)('https://didcomm.org/questionanswer/1.0/question'),
        _a;
})();
exports.QuestionMessage = QuestionMessage;
