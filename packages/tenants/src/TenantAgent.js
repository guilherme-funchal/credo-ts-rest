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
exports.TenantAgent = void 0;
const core_1 = require("@aries-framework/core");
class TenantAgent extends core_1.BaseAgent {
    constructor(agentContext) {
        super(agentContext.config, agentContext.dependencyManager);
        this.sessionHasEnded = false;
    }
    initialize() {
        const _super = Object.create(null, {
            initialize: { get: () => super.initialize }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sessionHasEnded) {
                throw new core_1.AriesFrameworkError("Can't initialize agent after tenant sessions has been ended.");
            }
            yield _super.initialize.call(this);
            this._isInitialized = true;
        });
    }
    endSession() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace(`Ending session for agent context with contextCorrelationId '${this.agentContext.contextCorrelationId}'`);
            yield this.agentContext.endSession();
            this._isInitialized = false;
            this.sessionHasEnded = true;
        });
    }
}
exports.TenantAgent = TenantAgent;
