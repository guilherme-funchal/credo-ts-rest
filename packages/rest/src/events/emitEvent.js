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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitEvent = emitEvent;
exports.emitWebSocketEvent = emitWebSocketEvent;
const core_1 = require("@credo-ts/core");
const node_fetch_1 = __importDefault(require("node-fetch"));
const tsyringe_1 = require("tsyringe");
const ws_1 = __importDefault(require("ws"));
function emitEvent(payload, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const agent = tsyringe_1.container.resolve(core_1.Agent);
        const logger = agent.config.logger;
        // Only send webhook if webhook url is configured
        if (config.webhookUrl) {
            yield emitWebhookEvent(config.webhookUrl, payload, logger);
        }
        if (config.socketServer) {
            // Always emit websocket event to clients (could be 0)
            yield emitWebSocketEvent(config.socketServer, payload);
        }
    });
}
function emitWebhookEvent(webhookUrl, body, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, node_fetch_1.default)(webhookUrl, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            });
        }
        catch (error) {
            logger.error(`Error sending ${body.type} webhook event to ${webhookUrl}`, {
                cause: error,
            });
        }
    });
}
function emitWebSocketEvent(server, data) {
    return __awaiter(this, void 0, void 0, function* () {
        server.clients.forEach((client) => {
            if (client.readyState === ws_1.default.OPEN) {
                typeof data === 'string' ? client.send(data) : client.send(JSON.stringify(data));
            }
        });
    });
}
