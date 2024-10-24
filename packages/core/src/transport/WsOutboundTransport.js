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
exports.WsOutboundTransport = void 0;
const Events_1 = require("../agent/Events");
const AriesFrameworkError_1 = require("../error/AriesFrameworkError");
const utils_1 = require("../utils");
const buffer_1 = require("../utils/buffer");
const TransportEventTypes_1 = require("./TransportEventTypes");
class WsOutboundTransport {
    constructor() {
        this.transportTable = new Map();
        this.supportedSchemes = ['ws', 'wss'];
        // NOTE: Because this method is passed to the event handler this must be a lambda method
        // so 'this' is scoped to the 'WsOutboundTransport' class instance
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.handleMessageEvent = (event) => {
            this.logger.trace('WebSocket message event received.', { url: event.target.url });
            const payload = utils_1.JsonEncoder.fromBuffer(event.data);
            if (!(0, utils_1.isValidJweStructure)(payload)) {
                throw new Error(`Received a response from the other agent but the structure of the incoming message is not a DIDComm message: ${payload}`);
            }
            this.logger.debug('Payload received from mediator:', payload);
            this.agent.events.emit(this.agent.context, {
                type: Events_1.AgentEventTypes.AgentMessageReceived,
                payload: {
                    message: payload,
                },
            });
        };
    }
    start(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            this.agent = agent;
            this.logger = agent.config.logger;
            this.logger.debug('Starting WS outbound transport');
            this.WebSocketClass = agent.config.agentDependencies.WebSocketClass;
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('Stopping WS outbound transport');
            this.transportTable.forEach((socket) => {
                socket.removeEventListener('message', this.handleMessageEvent);
                socket.close();
            });
        });
    }
    sendMessage(outboundPackage) {
        return __awaiter(this, void 0, void 0, function* () {
            const { payload, endpoint, connectionId } = outboundPackage;
            this.logger.debug(`Sending outbound message to endpoint '${endpoint}' over WebSocket transport.`, {
                payload,
            });
            if (!endpoint) {
                throw new AriesFrameworkError_1.AriesFrameworkError("Missing connection or endpoint. I don't know how and where to send the message.");
            }
            const socketId = `${endpoint}-${connectionId}`;
            const isNewSocket = !this.hasOpenSocket(socketId);
            const socket = yield this.resolveSocket({ socketId, endpoint, connectionId });
            socket.send(buffer_1.Buffer.from(JSON.stringify(payload)));
            // If the socket was created for this message and we don't have return routing enabled
            // We can close the socket as it shouldn't return messages anymore
            if (isNewSocket && !outboundPackage.responseRequested) {
                socket.close();
            }
        });
    }
    hasOpenSocket(socketId) {
        return this.transportTable.get(socketId) !== undefined;
    }
    resolveSocket(_a) {
        return __awaiter(this, arguments, void 0, function* ({ socketId, endpoint, connectionId, }) {
            // If we already have a socket connection use it
            let socket = this.transportTable.get(socketId);
            if (!socket || socket.readyState === this.WebSocketClass.CLOSING) {
                if (!endpoint) {
                    throw new AriesFrameworkError_1.AriesFrameworkError(`Missing endpoint. I don't know how and where to send the message.`);
                }
                socket = yield this.createSocketConnection({
                    endpoint,
                    socketId,
                    connectionId,
                });
                this.transportTable.set(socketId, socket);
                this.listenOnWebSocketMessages(socket);
            }
            if (socket.readyState !== this.WebSocketClass.OPEN) {
                throw new AriesFrameworkError_1.AriesFrameworkError('Socket is not open.');
            }
            return socket;
        });
    }
    listenOnWebSocketMessages(socket) {
        socket.addEventListener('message', this.handleMessageEvent);
    }
    createSocketConnection({ socketId, endpoint, connectionId, }) {
        return new Promise((resolve, reject) => {
            this.logger.debug(`Connecting to WebSocket ${endpoint}`);
            const socket = new this.WebSocketClass(endpoint);
            socket.onopen = () => {
                this.logger.debug(`Successfully connected to WebSocket ${endpoint}`);
                resolve(socket);
                this.agent.events.emit(this.agent.context, {
                    type: TransportEventTypes_1.TransportEventTypes.OutboundWebSocketOpenedEvent,
                    payload: {
                        socketId,
                        connectionId: connectionId,
                    },
                });
            };
            socket.onerror = (error) => {
                this.logger.debug(`Error while connecting to WebSocket ${endpoint}`, {
                    error,
                });
                reject(error);
            };
            socket.onclose = () => __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`WebSocket closing to ${endpoint}`);
                socket.removeEventListener('message', this.handleMessageEvent);
                this.transportTable.delete(socketId);
                this.agent.events.emit(this.agent.context, {
                    type: TransportEventTypes_1.TransportEventTypes.OutboundWebSocketClosedEvent,
                    payload: {
                        socketId,
                        connectionId: connectionId,
                    },
                });
            });
        });
    }
}
exports.WsOutboundTransport = WsOutboundTransport;
