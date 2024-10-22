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
exports.FeatureRegistry = void 0;
const tsyringe_1 = require("tsyringe");
let FeatureRegistry = (() => {
    let _classDecorators = [(0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var FeatureRegistry = _classThis = class {
        constructor() {
            this.features = [];
        }
        /**
         * Register a single or set of Features on the registry
         *
         * @param features set of {Feature} objects or any inherited class
         */
        register(...features) {
            for (const feature of features) {
                const index = this.features.findIndex((item) => item.type === feature.type && item.id === feature.id);
                if (index > -1) {
                    this.features[index] = this.features[index].combine(feature);
                }
                else {
                    this.features.push(feature);
                }
            }
        }
        /**
         * Perform a set of queries in the registry, supporting wildcards (*) as
         * expressed in Aries RFC 0557.
         *
         * @see https://github.com/hyperledger/aries-rfcs/blob/560ffd23361f16a01e34ccb7dcc908ec28c5ddb1/features/0557-discover-features-v2/README.md
         *
         * @param queries set of {FeatureQuery} objects to query features
         * @returns array containing all matching features (can be empty)
         */
        query(...queries) {
            const output = [];
            for (const query of queries) {
                const items = this.features.filter((item) => item.type === query.featureType);
                // An * will return all features of a given type (e.g. all protocols, all goal codes, all AIP configs)
                if (query.match === '*') {
                    output.push(...items);
                    // An string ending with * will return a family of features of a certain type
                    // (e.g. all versions of a given protocol, all subsets of an AIP, etc.)
                }
                else if (query.match.endsWith('*')) {
                    const match = query.match.slice(0, -1);
                    output.push(...items.filter((m) => m.id.startsWith(match)));
                    // Exact matching (single feature)
                }
                else {
                    output.push(...items.filter((m) => m.id === query.match));
                }
            }
            return output;
        }
    };
    __setFunctionName(_classThis, "FeatureRegistry");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FeatureRegistry = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FeatureRegistry = _classThis;
})();
exports.FeatureRegistry = FeatureRegistry;
