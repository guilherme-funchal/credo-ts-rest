"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentContext = void 0;
const constants_1 = require("../../constants");
const AgentConfig_1 = require("../AgentConfig");
class AgentContext {
    constructor({ dependencyManager, contextCorrelationId, }) {
        this.dependencyManager = dependencyManager;
        this.contextCorrelationId = contextCorrelationId;
    }
    /**
     * Convenience method to access the agent config for the current context.
     */
    get config() {
        return this.dependencyManager.resolve(AgentConfig_1.AgentConfig);
    }
    /**
     * Convenience method to access the wallet for the current context.
     */
    get wallet() {
        return this.dependencyManager.resolve(constants_1.InjectionSymbols.Wallet);
    }
    /**
     * End session the current agent context
     */
    endSession() {
        return __awaiter(this, void 0, void 0, function* () {
            const agentContextProvider = this.dependencyManager.resolve(constants_1.InjectionSymbols.AgentContextProvider);
            yield agentContextProvider.endSessionForAgentContext(this);
        });
    }
    toJSON() {
        return {
            contextCorrelationId: this.contextCorrelationId,
        };
    }
}
exports.AgentContext = AgentContext;
