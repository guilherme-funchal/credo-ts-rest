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
exports.HttpOutboundTransport = void 0;
const abort_controller_1 = require("abort-controller");
const Events_1 = require("../agent/Events");
const AriesFrameworkError_1 = require("../error/AriesFrameworkError");
const utils_1 = require("../utils");
class HttpOutboundTransport {
    constructor() {
        this.supportedSchemes = ['http', 'https'];
    }
    start(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            this.agent = agent;
            this.logger = this.agent.config.logger;
            this.fetch = this.agent.config.agentDependencies.fetch;
            this.logger.debug('Starting HTTP outbound transport');
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('Stopping HTTP outbound transport');
            // Nothing required to stop HTTP
        });
    }
    sendMessage(outboundPackage) {
        return __awaiter(this, void 0, void 0, function* () {
            const { payload, endpoint } = outboundPackage;
            if (!endpoint) {
                throw new AriesFrameworkError_1.AriesFrameworkError(`Missing endpoint. I don't know how and where to send the message.`);
            }
            this.logger.debug(`Sending outbound message to endpoint '${outboundPackage.endpoint}'`, {
                payload: outboundPackage.payload,
            });
            try {
                const abortController = new abort_controller_1.AbortController();
                const id = setTimeout(() => abortController.abort(), 15000);
                let response;
                let responseMessage;
                try {
                    response = yield this.fetch(endpoint, {
                        method: 'POST',
                        body: JSON.stringify(payload),
                        headers: { 'Content-Type': this.agent.config.didCommMimeType },
                        signal: abortController.signal,
                    });
                    clearTimeout(id);
                    responseMessage = yield response.text();
                }
                catch (error) {
                    // Request is aborted after 15 seconds, but that doesn't necessarily mean the request
                    // went wrong. ACA-Py keeps the socket alive until it has a response message. So we assume
                    // that if the error was aborted and we had return routing enabled, we should ignore the error.
                    if (error.name == 'AbortError' && outboundPackage.responseRequested) {
                        this.logger.debug('Request was aborted due to timeout. Not throwing error due to return routing on sent message');
                    }
                    else {
                        throw error;
                    }
                }
                // TODO: do we just want to ignore messages that were returned if we didn't request it?
                // TODO: check response header type (and also update inbound transports to use the correct headers types)
                if (response && responseMessage) {
                    this.logger.debug(`Response received`, { responseMessage, status: response.status });
                    try {
                        const encryptedMessage = utils_1.JsonEncoder.fromString(responseMessage);
                        if (!(0, utils_1.isValidJweStructure)(encryptedMessage)) {
                            this.logger.error(`Received a response from the other agent but the structure of the incoming message is not a DIDComm message: ${responseMessage}`);
                            return;
                        }
                        // Emit event with the received agent message.
                        this.agent.events.emit(this.agent.context, {
                            type: Events_1.AgentEventTypes.AgentMessageReceived,
                            payload: {
                                message: encryptedMessage,
                            },
                        });
                    }
                    catch (error) {
                        this.logger.debug('Unable to parse response message');
                    }
                }
                else {
                    this.logger.debug(`No response received.`);
                }
            }
            catch (error) {
                this.logger.error(`Error sending message to ${endpoint}: ${error.message}`, {
                    error,
                    message: error.message,
                    body: payload,
                    didCommMimeType: this.agent.config.didCommMimeType,
                });
                throw new AriesFrameworkError_1.AriesFrameworkError(`Error sending message to ${endpoint}: ${error.message}`, { cause: error });
            }
        });
    }
}
exports.HttpOutboundTransport = HttpOutboundTransport;
