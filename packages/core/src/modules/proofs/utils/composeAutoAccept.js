"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeAutoAccept = composeAutoAccept;
const models_1 = require("../models");
/**
 * Returns the proof auto accept config based on priority:
 *	- The record config takes first priority
 *	- Otherwise the agent config
 *	- Otherwise {@link AutoAcceptProof.Never} is returned
 */
function composeAutoAccept(recordConfig, agentConfig) {
    var _a;
    return (_a = recordConfig !== null && recordConfig !== void 0 ? recordConfig : agentConfig) !== null && _a !== void 0 ? _a : models_1.AutoAcceptProof.Never;
}
