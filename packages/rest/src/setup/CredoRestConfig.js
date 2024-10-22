"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outboundTransportMapping = exports.inboundTransportMapping = void 0;
const core_1 = require("@credo-ts/core");
const node_1 = require("@credo-ts/node");
exports.inboundTransportMapping = {
    http: node_1.HttpInboundTransport,
    ws: node_1.WsInboundTransport,
};
exports.outboundTransportMapping = {
    http: core_1.HttpOutboundTransport,
    ws: core_1.WsOutboundTransport,
};
