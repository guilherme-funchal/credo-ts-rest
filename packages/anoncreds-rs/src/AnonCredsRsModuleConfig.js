"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsRsModuleConfig = void 0;
/**
 * @public
 */
class AnonCredsRsModuleConfig {
    constructor(options) {
        this.options = options;
    }
    get anoncreds() {
        return this.options.anoncreds;
    }
    /** See {@link AnonCredsModuleConfigOptions.autoCreateLinkSecret} */
    get autoCreateLinkSecret() {
        var _a;
        return (_a = this.options.autoCreateLinkSecret) !== null && _a !== void 0 ? _a : true;
    }
}
exports.AnonCredsRsModuleConfig = AnonCredsRsModuleConfig;
