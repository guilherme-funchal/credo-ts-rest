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
exports.HttpTransportSession = exports.HttpInboundTransport = void 0;
const core_1 = require("@aries-framework/core");
const express_1 = __importStar(require("express"));
const supportedContentTypes = [core_1.DidCommMimeType.V0, core_1.DidCommMimeType.V1];
class HttpInboundTransport {
    get server() {
        return this._server;
    }
    constructor({ app, path, port }) {
        this.port = port;
        // Create Express App
        this.app = app !== null && app !== void 0 ? app : (0, express_1.default)();
        this.path = path !== null && path !== void 0 ? path : '/';
        this.app.use((0, express_1.text)({ type: supportedContentTypes, limit: '5mb' }));
    }
    start(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            const transportService = agent.dependencyManager.resolve(core_1.TransportService);
            const messageReceiver = agent.dependencyManager.resolve(core_1.MessageReceiver);
            agent.config.logger.debug(`Starting HTTP inbound transport`, {
                port: this.port,
            });
            this.app.post(this.path, (req, res) => __awaiter(this, void 0, void 0, function* () {
                const contentType = req.headers['content-type'];
                if (!contentType || !supportedContentTypes.includes(contentType)) {
                    return res
                        .status(415)
                        .send('Unsupported content-type. Supported content-types are: ' + supportedContentTypes.join(', '));
                }
                const session = new HttpTransportSession(core_1.utils.uuid(), req, res);
                try {
                    const message = req.body;
                    const encryptedMessage = JSON.parse(message);
                    yield messageReceiver.receiveMessage(encryptedMessage, {
                        session,
                    });
                    // If agent did not use session when processing message we need to send response here.
                    if (!res.headersSent) {
                        res.status(200).end();
                    }
                }
                catch (error) {
                    agent.config.logger.error(`Error processing inbound message: ${error.message}`, error);
                    if (!res.headersSent) {
                        res.status(500).send('Error processing message');
                    }
                }
                finally {
                    transportService.removeSession(session);
                }
            }));
            this._server = this.app.listen(this.port);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            (_a = this._server) === null || _a === void 0 ? void 0 : _a.close();
        });
    }
}
exports.HttpInboundTransport = HttpInboundTransport;
class HttpTransportSession {
    constructor(id, req, res) {
        this.type = 'http';
        this.id = id;
        this.req = req;
        this.res = res;
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.res.headersSent) {
                this.res.status(200).end();
            }
        });
    }
    send(agentContext, encryptedMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.res.headersSent) {
                throw new core_1.AriesFrameworkError(`${this.type} transport session has been closed.`);
            }
            // By default we take the agent config's default DIDComm content-type
            let responseMimeType = agentContext.config.didCommMimeType;
            // However, if the request mime-type is a mime-type that is supported by us, we use that
            // to minimize the chance of interoperability issues
            const requestMimeType = this.req.headers['content-type'];
            if (requestMimeType && supportedContentTypes.includes(requestMimeType)) {
                responseMimeType = requestMimeType;
            }
            this.res.status(200).contentType(responseMimeType).json(encryptedMessage).end();
        });
    }
}
exports.HttpTransportSession = HttpTransportSession;
