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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInvitationShortUrl = exports.oobInvitationFromShortUrl = exports.parseInvitationUrl = exports.parseInvitationJson = void 0;
const abort_controller_1 = require("abort-controller");
const query_string_1 = require("query-string");
const AgentMessage_1 = require("../agent/AgentMessage");
const error_1 = require("../error");
const connections_1 = require("../modules/connections");
const OutOfBandDidCommService_1 = require("../modules/oob/domain/OutOfBandDidCommService");
const helpers_1 = require("../modules/oob/helpers");
const messages_1 = require("../modules/oob/messages");
const JsonEncoder_1 = require("./JsonEncoder");
const JsonTransformer_1 = require("./JsonTransformer");
const MessageValidator_1 = require("./MessageValidator");
const messageType_1 = require("./messageType");
const fetchShortUrl = (invitationUrl, dependencies) => __awaiter(void 0, void 0, void 0, function* () {
    const abortController = new abort_controller_1.AbortController();
    const id = setTimeout(() => abortController.abort(), 15000);
    let response;
    try {
        response = yield dependencies.fetch(invitationUrl, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });
    }
    catch (error) {
        throw new error_1.AriesFrameworkError(`Get request failed on provided url: ${error.message}`, { cause: error });
    }
    clearTimeout(id);
    return response;
});
/**
 * Parses a JSON containing an invitation message and returns an OutOfBandInvitation instance
 *
 * @param invitationJson JSON object containing message
 * @returns OutOfBandInvitation
 */
const parseInvitationJson = (invitationJson) => {
    const messageType = invitationJson['@type'];
    if (!messageType) {
        throw new error_1.AriesFrameworkError('Invitation is not a valid DIDComm message');
    }
    const parsedMessageType = (0, messageType_1.parseMessageType)(messageType);
    if ((0, messageType_1.supportsIncomingMessageType)(parsedMessageType, messages_1.OutOfBandInvitation.type)) {
        const invitation = JsonTransformer_1.JsonTransformer.fromJSON(invitationJson, messages_1.OutOfBandInvitation);
        MessageValidator_1.MessageValidator.validateSync(invitation);
        invitation.invitationType = messages_1.InvitationType.OutOfBand;
        return invitation;
    }
    else if ((0, messageType_1.supportsIncomingMessageType)(parsedMessageType, connections_1.ConnectionInvitationMessage.type)) {
        const invitation = JsonTransformer_1.JsonTransformer.fromJSON(invitationJson, connections_1.ConnectionInvitationMessage);
        MessageValidator_1.MessageValidator.validateSync(invitation);
        const outOfBandInvitation = (0, helpers_1.convertToNewInvitation)(invitation);
        outOfBandInvitation.invitationType = messages_1.InvitationType.Connection;
        return outOfBandInvitation;
    }
    else {
        throw new error_1.AriesFrameworkError(`Invitation with '@type' ${parsedMessageType.messageTypeUri} not supported.`);
    }
};
exports.parseInvitationJson = parseInvitationJson;
/**
 * Parses URL containing encoded invitation and returns invitation message.
 *
 * @param invitationUrl URL containing encoded invitation
 *
 * @returns OutOfBandInvitation
 */
const parseInvitationUrl = (invitationUrl) => {
    var _a, _b;
    const parsedUrl = (0, query_string_1.parseUrl)(invitationUrl).query;
    const encodedInvitation = (_b = (_a = parsedUrl['oob']) !== null && _a !== void 0 ? _a : parsedUrl['c_i']) !== null && _b !== void 0 ? _b : parsedUrl['d_m'];
    if (typeof encodedInvitation === 'string') {
        const invitationJson = JsonEncoder_1.JsonEncoder.fromBase64(encodedInvitation);
        return (0, exports.parseInvitationJson)(invitationJson);
    }
    throw new error_1.AriesFrameworkError('InvitationUrl is invalid. It needs to contain one, and only one, of the following parameters: `oob`, `c_i` or `d_m`.');
};
exports.parseInvitationUrl = parseInvitationUrl;
// This currently does not follow the RFC because of issues with fetch, currently uses a janky work around
const oobInvitationFromShortUrl = (response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (response) {
        if (((_a = response.headers.get('Content-Type')) === null || _a === void 0 ? void 0 : _a.startsWith('application/json')) && response.ok) {
            const invitationJson = yield response.json();
            return (0, exports.parseInvitationJson)(invitationJson);
        }
        else if (response['url']) {
            // The following if else is for here for trinsic shorten urls
            // Because the redirect targets a deep link the automatic redirect does not occur
            let responseUrl;
            const location = response.headers.get('Location');
            if ((response.status === 302 || response.status === 301) && location)
                responseUrl = location;
            else
                responseUrl = response['url'];
            return (0, exports.parseInvitationUrl)(responseUrl);
        }
    }
    throw new error_1.AriesFrameworkError('HTTP request time out or did not receive valid response');
});
exports.oobInvitationFromShortUrl = oobInvitationFromShortUrl;
/**
 * Parses URL containing encoded invitation and returns invitation message. Compatible with
 * parsing short Urls
 *
 * @param invitationUrl URL containing encoded invitation
 *
 * @param dependencies Agent dependencies containing fetch
 *
 * @returns OutOfBandInvitation
 */
const parseInvitationShortUrl = (invitationUrl, dependencies) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedUrl = (0, query_string_1.parseUrl)(invitationUrl).query;
    if (parsedUrl['oob'] || parsedUrl['c_i']) {
        return (0, exports.parseInvitationUrl)(invitationUrl);
    }
    // Legacy connectionless invitation
    else if (parsedUrl['d_m']) {
        const messageJson = JsonEncoder_1.JsonEncoder.fromBase64(parsedUrl['d_m']);
        const agentMessage = JsonTransformer_1.JsonTransformer.fromJSON(messageJson, AgentMessage_1.AgentMessage);
        // ~service is required for legacy connectionless invitations
        if (!agentMessage.service) {
            throw new error_1.AriesFrameworkError('Invalid legacy connectionless invitation url. Missing ~service decorator.');
        }
        // This destructuring removes the ~service property from the message, and
        // we can can use messageWithoutService to create the out of band invitation
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { '~service': service } = messageJson, messageWithoutService = __rest(messageJson
        // transform into out of band invitation
        , ['~service']);
        // transform into out of band invitation
        const invitation = new messages_1.OutOfBandInvitation({
            // The label is currently required by the OutOfBandInvitation class, but not according to the specification.
            // FIXME: In 0.5.0 we will make this optional: https://github.com/hyperledger/aries-framework-javascript/issues/1524
            label: '',
            services: [OutOfBandDidCommService_1.OutOfBandDidCommService.fromResolvedDidCommService(agentMessage.service.resolvedDidCommService)],
        });
        invitation.invitationType = messages_1.InvitationType.Connectionless;
        invitation.addRequest(JsonTransformer_1.JsonTransformer.fromJSON(messageWithoutService, AgentMessage_1.AgentMessage));
        return invitation;
    }
    else {
        try {
            const outOfBandInvitation = yield (0, exports.oobInvitationFromShortUrl)(yield fetchShortUrl(invitationUrl, dependencies));
            outOfBandInvitation.invitationType = messages_1.InvitationType.OutOfBand;
            return outOfBandInvitation;
        }
        catch (error) {
            throw new error_1.AriesFrameworkError('InvitationUrl is invalid. It needs to contain one, and only one, of the following parameters: `oob`, `c_i` or `d_m`, or be valid shortened URL');
        }
    }
});
exports.parseInvitationShortUrl = parseInvitationShortUrl;
