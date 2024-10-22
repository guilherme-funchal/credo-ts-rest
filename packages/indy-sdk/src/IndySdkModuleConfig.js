"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndySdkModuleConfig = void 0;
class IndySdkModuleConfig {
    constructor(options) {
        this.options = options;
    }
    /** See {@link IndySdkModuleConfigOptions.indySdk} */
    get indySdk() {
        return this.options.indySdk;
    }
    get networks() {
        var _a;
        return (_a = this.options.networks) !== null && _a !== void 0 ? _a : [];
    }
    /** See {@link AnonCredsModuleConfigOptions.autoCreateLinkSecret} */
    get autoCreateLinkSecret() {
        var _a;
        return (_a = this.options.autoCreateLinkSecret) !== null && _a !== void 0 ? _a : true;
    }
}
exports.IndySdkModuleConfig = IndySdkModuleConfig;
