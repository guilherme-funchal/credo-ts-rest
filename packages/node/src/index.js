"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndySdkPostgresWalletScheme = exports.loadIndySdkPostgresPlugin = exports.WsInboundTransport = exports.HttpInboundTransport = exports.agentDependencies = void 0;
const events_1 = require("events");
const node_fetch_1 = __importDefault(require("node-fetch"));
const ws_1 = __importDefault(require("ws"));
const NodeFileSystem_1 = require("./NodeFileSystem");
const PostgresPlugin_1 = require("./PostgresPlugin");
Object.defineProperty(exports, "loadIndySdkPostgresPlugin", { enumerable: true, get: function () { return PostgresPlugin_1.loadIndySdkPostgresPlugin; } });
Object.defineProperty(exports, "IndySdkPostgresWalletScheme", { enumerable: true, get: function () { return PostgresPlugin_1.IndySdkPostgresWalletScheme; } });
const HttpInboundTransport_1 = require("./transport/HttpInboundTransport");
Object.defineProperty(exports, "HttpInboundTransport", { enumerable: true, get: function () { return HttpInboundTransport_1.HttpInboundTransport; } });
const WsInboundTransport_1 = require("./transport/WsInboundTransport");
Object.defineProperty(exports, "WsInboundTransport", { enumerable: true, get: function () { return WsInboundTransport_1.WsInboundTransport; } });
const agentDependencies = {
    FileSystem: NodeFileSystem_1.NodeFileSystem,
    fetch: node_fetch_1.default,
    EventEmitterClass: events_1.EventEmitter,
    WebSocketClass: ws_1.default,
};
exports.agentDependencies = agentDependencies;
