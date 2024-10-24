"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsModuleConfig = void 0;
/**
 * @public
 */
class AnonCredsModuleConfig {
    constructor(options) {
        this.options = options;
    }
    /** See {@link AnonCredsModuleConfigOptions.registries} */
    get registries() {
        return this.options.registries;
    }
}
exports.AnonCredsModuleConfig = AnonCredsModuleConfig;
