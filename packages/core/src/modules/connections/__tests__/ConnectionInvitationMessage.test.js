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
const class_validator_1 = require("class-validator");
const query_string_1 = require("query-string");
const Attachment_1 = require("../../../decorators/attachment/Attachment");
const ClassValidationError_1 = require("../../../error/ClassValidationError");
const JsonEncoder_1 = require("../../../utils/JsonEncoder");
const JsonTransformer_1 = require("../../../utils/JsonTransformer");
const ConnectionInvitationMessage_1 = require("../messages/ConnectionInvitationMessage");
describe('ConnectionInvitationMessage', () => {
    it('should allow routingKeys to be left out of inline invitation', () => __awaiter(void 0, void 0, void 0, function* () {
        const json = {
            '@type': ConnectionInvitationMessage_1.ConnectionInvitationMessage.type.messageTypeUri,
            '@id': '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
            recipientKeys: ['recipientKeyOne', 'recipientKeyTwo'],
            serviceEndpoint: 'https://example.com',
            label: 'test',
        };
        const invitation = JsonTransformer_1.JsonTransformer.fromJSON(json, ConnectionInvitationMessage_1.ConnectionInvitationMessage);
        expect(invitation).toBeInstanceOf(ConnectionInvitationMessage_1.ConnectionInvitationMessage);
    }));
    it('should throw error if both did and inline keys / endpoint are missing', () => __awaiter(void 0, void 0, void 0, function* () {
        const json = {
            '@type': ConnectionInvitationMessage_1.ConnectionInvitationMessage.type.messageTypeUri,
            '@id': '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
            label: 'test',
        };
        expect(() => JsonTransformer_1.JsonTransformer.fromJSON(json, ConnectionInvitationMessage_1.ConnectionInvitationMessage)).toThrowError(ClassValidationError_1.ClassValidationError);
    }));
    it('should replace legacy did:sov:BzCbsNYhMrjHiqZDTUASHg;spec prefix with https://didcomm.org in message type', () => __awaiter(void 0, void 0, void 0, function* () {
        const json = {
            '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation',
            '@id': '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
            recipientKeys: ['recipientKeyOne', 'recipientKeyTwo'],
            serviceEndpoint: 'https://example.com',
            label: 'test',
        };
        const invitation = JsonTransformer_1.JsonTransformer.fromJSON(json, ConnectionInvitationMessage_1.ConnectionInvitationMessage);
        // Assert type
        expect(invitation.type).toBe('https://didcomm.org/connections/1.0/invitation');
        // Assert validation also works with the transformation
        expect(invitation).toBeInstanceOf(ConnectionInvitationMessage_1.ConnectionInvitationMessage);
    }));
    describe('toUrl', () => {
        it('should correctly include the base64 encoded invitation in the url as the c_i query parameter', () => __awaiter(void 0, void 0, void 0, function* () {
            const domain = 'https://example.com/ssi';
            const json = {
                '@type': 'https://didcomm.org/connections/1.0/invitation',
                '@id': '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                recipientKeys: ['recipientKeyOne', 'recipientKeyTwo'],
                serviceEndpoint: 'https://example.com',
                label: 'test',
            };
            const invitation = JsonTransformer_1.JsonTransformer.fromJSON(json, ConnectionInvitationMessage_1.ConnectionInvitationMessage);
            const invitationUrl = invitation.toUrl({
                domain,
            });
            expect(invitationUrl).toBe(`${domain}?c_i=${JsonEncoder_1.JsonEncoder.toBase64URL(json)}`);
        }));
        it('should use did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation as type if useDidSovPrefixWhereAllowed is set to true', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const invitation = new ConnectionInvitationMessage_1.ConnectionInvitationMessage({
                id: '04a2c382-999e-4de9-a1d2-9dec0b2fa5e4',
                recipientKeys: ['recipientKeyOne', 'recipientKeyTwo'],
                serviceEndpoint: 'https://example.com',
                label: 'test',
                imageUrl: 'test-image-path',
                appendedAttachments: [
                    new Attachment_1.Attachment({
                        id: 'test-attachment',
                        data: {
                            json: {
                                value: 'test',
                            },
                        },
                    }),
                ],
            });
            const invitationUrl = invitation.toUrl({
                domain: 'https://example.com',
                useDidSovPrefixWhereAllowed: true,
            });
            const parsedUrl = (0, query_string_1.parseUrl)(invitationUrl).query;
            const encodedInvitation = ((_a = parsedUrl['c_i']) !== null && _a !== void 0 ? _a : parsedUrl['d_m']);
            expect(JsonEncoder_1.JsonEncoder.fromBase64(encodedInvitation)['@type']).toBe('did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation');
        }));
    });
    describe('fromUrl', () => {
        it('should correctly convert a valid invitation url to a `ConnectionInvitationMessage` with `d_m` as parameter', () => {
            const invitationUrl = 'https://trinsic.studio/link/?d_m=eyJsYWJlbCI6InRlc3QiLCJpbWFnZVVybCI6Imh0dHBzOi8vdHJpbnNpY2FwaWFzc2V0cy5henVyZWVkZ2UubmV0L2ZpbGVzL2IyODhkMTE3LTNjMmMtNGFjNC05MzVhLWE1MDBkODQzYzFlOV9kMGYxN2I0OS0wNWQ5LTQ4ZDAtODJlMy1jNjg3MGI4MjNjMTUucG5nIiwic2VydmljZUVuZHBvaW50IjoiaHR0cHM6Ly9hcGkucG9ydGFsLnN0cmVldGNyZWQuaWQvYWdlbnQvTVZob1VaQjlHdUl6bVJzSTNIWUNuZHpBcXVKY1ZNdFUiLCJyb3V0aW5nS2V5cyI6WyJCaFZRdEZHdGJ4NzZhMm13Y3RQVkJuZWtLaG1iMTdtUHdFMktXWlVYTDFNaSJdLCJyZWNpcGllbnRLZXlzIjpbIkcyOVF6bXBlVXN0dUVHYzlXNzlYNnV2aUhTUTR6UlV2VWFFOHpXV2VZYjduIl0sIkBpZCI6IjgxYzZiNDUzLWNkMTUtNDQwMC04MWU5LTkwZTJjM2NhY2I1NCIsIkB0eXBlIjoiZGlkOnNvdjpCekNic05ZaE1yakhpcVpEVFVBU0hnO3NwZWMvY29ubmVjdGlvbnMvMS4wL2ludml0YXRpb24ifQ%3D%3D&orig=https://trinsic.studio/url/6dd56daf-e153-40dd-b849-2b345b6853f6';
            const invitation = ConnectionInvitationMessage_1.ConnectionInvitationMessage.fromUrl(invitationUrl);
            expect((0, class_validator_1.validateOrReject)(invitation)).resolves.toBeUndefined();
        });
        it('should correctly convert a valid invitation url to a `ConnectionInvitationMessage` with `c_i` as parameter', () => {
            const invitationUrl = 'https://example.com?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiZmM3ODFlMDItMjA1YS00NGUzLWE5ZTQtYjU1Y2U0OTE5YmVmIiwgInNlcnZpY2VFbmRwb2ludCI6ICJodHRwczovL2RpZGNvbW0uZmFiZXIuYWdlbnQuYW5pbW8uaWQiLCAibGFiZWwiOiAiQW5pbW8gRmFiZXIgQWdlbnQiLCAicmVjaXBpZW50S2V5cyI6IFsiR0hGczFQdFRabjdmYU5LRGVnMUFzU3B6QVAyQmpVckVjZlR2bjc3SnBRTUQiXX0=';
            const invitation = ConnectionInvitationMessage_1.ConnectionInvitationMessage.fromUrl(invitationUrl);
            expect((0, class_validator_1.validateOrReject)(invitation)).resolves.toBeUndefined();
        });
        it('should throw error if url does not contain `c_i` or `d_m`', () => {
            const invitationUrl = 'https://example.com?param=123';
            expect(() => ConnectionInvitationMessage_1.ConnectionInvitationMessage.fromUrl(invitationUrl)).toThrowError();
        });
    });
});