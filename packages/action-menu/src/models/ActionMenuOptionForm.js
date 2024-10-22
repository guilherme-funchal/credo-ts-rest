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
exports.ActionMenuForm = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const ActionMenuOptionFormParameter_1 = require("./ActionMenuOptionFormParameter");
/**
 * @public
 */
let ActionMenuForm = (() => {
    var _a;
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _submitLabel_decorators;
    let _submitLabel_initializers = [];
    let _submitLabel_extraInitializers = [];
    let _params_decorators;
    let _params_initializers = [];
    let _params_extraInitializers = [];
    return _a = class ActionMenuForm {
            constructor(options) {
                this.description = __runInitializers(this, _description_initializers, void 0);
                this.submitLabel = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _submitLabel_initializers, void 0));
                this.params = (__runInitializers(this, _submitLabel_extraInitializers), __runInitializers(this, _params_initializers, void 0));
                __runInitializers(this, _params_extraInitializers);
                if (options) {
                    this.description = options.description;
                    this.params = options.params.map((p) => new ActionMenuOptionFormParameter_1.ActionMenuFormParameter(p));
                    this.submitLabel = options.submitLabel;
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _description_decorators = [(0, class_validator_1.IsString)()];
            _submitLabel_decorators = [(0, class_transformer_1.Expose)({ name: 'submit-label' }), (0, class_validator_1.IsString)()];
            _params_decorators = [(0, class_validator_1.IsInstance)(ActionMenuOptionFormParameter_1.ActionMenuFormParameter, { each: true }), (0, class_transformer_1.Type)(() => ActionMenuOptionFormParameter_1.ActionMenuFormParameter)];
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _submitLabel_decorators, { kind: "field", name: "submitLabel", static: false, private: false, access: { has: obj => "submitLabel" in obj, get: obj => obj.submitLabel, set: (obj, value) => { obj.submitLabel = value; } }, metadata: _metadata }, _submitLabel_initializers, _submitLabel_extraInitializers);
            __esDecorate(null, null, _params_decorators, { kind: "field", name: "params", static: false, private: false, access: { has: obj => "params" in obj, get: obj => obj.params, set: (obj, value) => { obj.params = value; } }, metadata: _metadata }, _params_initializers, _params_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.ActionMenuForm = ActionMenuForm;
