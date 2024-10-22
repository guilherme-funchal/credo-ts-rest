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
exports.BaseRecord = void 0;
const class_transformer_1 = require("class-transformer");
const JsonTransformer_1 = require("../utils/JsonTransformer");
const transformers_1 = require("../utils/transformers");
const Metadata_1 = require("./Metadata");
let BaseRecord = (() => {
    var _a;
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _metadata_decorators;
    let _metadata_initializers = [];
    let _metadata_extraInitializers = [];
    return _a = class BaseRecord {
            /**
             * Set the value for a tag
             * @param name name of the tag
             * @param value value of the tag
             */
            setTag(name, value) {
                this._tags[name] = value;
            }
            /**
             * Get the value for a tag
             * @param name name of the tag
             * @returns The tag value, or undefined if not found
             */
            getTag(name) {
                return this.getTags()[name];
            }
            /**
             * Set custom tags. This will merge the tags object with passed in tag properties
             *
             * @param tags the tags to set
             */
            setTags(tags) {
                this._tags = Object.assign(Object.assign({}, this._tags), tags);
            }
            /**
             * Replace tags. This will replace the whole tags object.
             * Default tags will still be overridden when retrieving tags
             *
             * @param tags the tags to set
             */
            replaceTags(tags) {
                this._tags = tags;
            }
            toJSON() {
                return JsonTransformer_1.JsonTransformer.toJSON(this);
            }
            /**
             * Clones the record.
             */
            clone() {
                return JsonTransformer_1.JsonTransformer.clone(this);
            }
            constructor() {
                this._tags = {};
                this.createdAt = __runInitializers(this, _createdAt_initializers, void 0);
                this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
                this.type = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _type_initializers, _a.type));
                /** @inheritdoc {Metadata#Metadata} */
                this.metadata = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _metadata_initializers, new Metadata_1.Metadata({})
                /**
                 * Get all tags. This is includes custom and default tags
                 * @returns tags object
                 */
                ));
                __runInitializers(this, _metadata_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _createdAt_decorators = [(0, transformers_1.DateTransformer)()];
            _updatedAt_decorators = [(0, transformers_1.DateTransformer)()];
            _type_decorators = [(0, class_transformer_1.Exclude)()];
            _metadata_decorators = [(0, transformers_1.MetadataTransformer)()];
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: obj => "metadata" in obj, get: obj => obj.metadata, set: (obj, value) => { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a.type = 'BaseRecord',
        _a;
})();
exports.BaseRecord = BaseRecord;
