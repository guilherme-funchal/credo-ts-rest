"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.WebSocketTransportSession = exports.WsInboundTransport = void 0;
const core_1 = require("@aries-framework/core");
const ws_1 = __importStar(require("ws"));
class WsInboundTransport {
    constructor({ server, port }) {
        // We're using a `socketId` just for the prevention of calling the connection handler twice.
        this.socketIds = {};
        this.socketServer = server !== null && server !== void 0 ? server : new ws_1.Server({ port });
    }
    start(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            const transportService = agent.dependencyManager.resolve(core_1.TransportService);
            this.logger = agent.config.logger;
            const wsEndpoint = agent.config.endpoints.find((e) => e.startsWith('ws'));
            this.logger.debug(`Starting WS inbound transport`, {
                endpoint: wsEndpoint,
            });
            this.socketServer.on('connection', (socket) => {
                const socketId = core_1.utils.uuid();
                this.logger.debug('Socket connected.');
                if (!this.socketIds[socketId]) {
                    this.logger.debug(`Saving new socket with id ${socketId}.`);
                    this.socketIds[socketId] = socket;
                    const session = new WebSocketTransportSession(socketId, socket, this.logger);
                    this.listenOnWebSocketMessages(agent, socket, session);
                    socket.on('close', () => {
                        this.logger.debug('Socket closed.');
                        transportService.removeSession(session);
                    });
                }
                else {
                    this.logger.debug(`Socket with id ${socketId} already exists.`);
                }
            });
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('Closing WebSocket Server');
            return new Promise((resolve, reject) => {
                this.socketServer.close((error) => {
                    if (error) {
                        reject(error);
                    }
                    resolve();
                });
            });
        });
    }
    listenOnWebSocketMessages(agent, socket, session) {
        const messageReceiver = agent.dependencyManager.resolve(core_1.MessageReceiver);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socket.addEventListener('message', (event) => __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('WebSocket message event received.', { url: event.target.url });
            try {
                yield messageReceiver.receiveMessage(JSON.parse(event.data), { session });
            }
            catch (error) {
                this.logger.error(`Error processing message: ${error}`);
            }
        }));
    }
}
exports.WsInboundTransport = WsInboundTransport;
class WebSocketTransportSession {
    constructor(id, socket, logger) {
        this.type = 'WebSocket';
        this.id = id;
        this.socket = socket;
        this.logger = logger;
    }
    send(agentContext, encryptedMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.socket.readyState !== ws_1.default.OPEN) {
                throw new core_1.AriesFrameworkError(`${this.type} transport session has been closed.`);
            }
            this.socket.send(JSON.stringify(encryptedMessage), (error) => {
                if (error != undefined) {
                    this.logger.debug(`Error sending message: ${error}`);
                    throw new core_1.AriesFrameworkError(`${this.type} send message failed.`, { cause: error });
                }
                else {
                    this.logger.debug(`${this.type} sent message successfully.`);
                }
            });
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.socket.readyState === ws_1.default.OPEN) {
                this.socket.close();
            }
        });
    }
}
exports.WebSocketTransportSession = WebSocketTransportSession;
