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
const Attachment_1 = require("../../../decorators/attachment/Attachment");
const utils_1 = require("../../../utils");
const JsonEncoder_1 = require("../../../utils/JsonEncoder");
const JsonTransformer_1 = require("../../../utils/JsonTransformer");
const connections_1 = require("../../connections");
const domain_1 = require("../domain");
const OutOfBandInvitation_1 = require("../messages/OutOfBandInvitation");
describe('toUrl', () => {
    test('encode the message into the URL containing the base64 encoded invitation as the oob query parameter', () => __awaiter(void 0, void 0, void 0, function* () {
        const domain = 'https://example.com/ssi';
        const json = {
            '@type': 'https://didcomm.org/out-of-band/1.1/invitation',
            services: ['did:sov:LjgpST2rjsoxYegQDRm7EL'],
            '@id': '69212a3a-d068-4f9d-a2dd-4741bca89af3',
            label: 'Faber College',
            goal_code: 'issue-vc',
            goal: 'To issue a Faber College Graduate credential',
            handshake_protocols: ['https://didcomm.org/didexchange/1.0', 'https://didcomm.org/connections/1.0'],
        };
        const invitation = JsonTransformer_1.JsonTransformer.fromJSON(json, OutOfBandInvitation_1.OutOfBandInvitation);
        const invitationUrl = invitation.toUrl({
            domain,
        });
        expect(invitationUrl).toBe(`${domain}?oob=${JsonEncoder_1.JsonEncoder.toBase64URL(json)}`);
    }));
});
describe('validation', () => {
    test('Out-of-Band Invitation instance with did as service', () => __awaiter(void 0, void 0, void 0, function* () {
        const invitation = new OutOfBandInvitation_1.OutOfBandInvitation({
            id: '69212a3a-d068-4f9d-a2dd-4741bca89af3',
            label: 'Faber College',
            services: ['did:sov:LjgpST2rjsoxYegQDRm7EL'],
            handshakeProtocols: [connections_1.HandshakeProtocol.DidExchange],
        });
        expect(() => utils_1.MessageValidator.validateSync(invitation)).not.toThrow();
    }));
    test('Out-of-Band Invitation instance with object as service', () => __awaiter(void 0, void 0, void 0, function* () {
        const invitation = new OutOfBandInvitation_1.OutOfBandInvitation({
            id: '69212a3a-d068-4f9d-a2dd-4741bca89af3',
            label: 'Faber College',
            services: [
                new domain_1.OutOfBandDidCommService({
                    id: 'didcomm',
                    serviceEndpoint: 'http://endpoint',
                    recipientKeys: ['did:key:z6MkqgkLrRyLg6bqk27djwbbaQWgaSYgFVCKq9YKxZbNkpVv'],
                }),
            ],
            handshakeProtocols: [connections_1.HandshakeProtocol.DidExchange],
        });
        expect(() => utils_1.MessageValidator.validateSync(invitation)).not.toThrow();
    }));
    test('Out-of-Band Invitation instance with string and object as services', () => __awaiter(void 0, void 0, void 0, function* () {
        const invitation = new OutOfBandInvitation_1.OutOfBandInvitation({
            id: '69212a3a-d068-4f9d-a2dd-4741bca89af3',
            label: 'Faber College',
            services: [
                'did:sov:LjgpST2rjsoxYegQDRm7EL',
                new domain_1.OutOfBandDidCommService({
                    id: 'didcomm',
                    serviceEndpoint: 'http://endpoint',
                    recipientKeys: ['did:key:z6MkqgkLrRyLg6bqk27djwbbaQWgaSYgFVCKq9YKxZbNkpVv'],
                }),
            ],
            handshakeProtocols: [connections_1.HandshakeProtocol.DidExchange],
        });
        expect(() => utils_1.MessageValidator.validateSync(invitation)).not.toThrow();
    }));
});
describe('fromUrl', () => {
    test('decode the URL containing the base64 encoded invitation as the oob parameter into an `OutOfBandInvitation`', () => {
        const invitationUrl = 'http://example.com/ssi?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiI2OTIxMmEzYS1kMDY4LTRmOWQtYTJkZC00NzQxYmNhODlhZjMiLCJsYWJlbCI6IkZhYmVyIENvbGxlZ2UiLCJnb2FsX2NvZGUiOiJpc3N1ZS12YyIsImdvYWwiOiJUbyBpc3N1ZSBhIEZhYmVyIENvbGxlZ2UgR3JhZHVhdGUgY3JlZGVudGlhbCIsImhhbmRzaGFrZV9wcm90b2NvbHMiOlsiaHR0cHM6Ly9kaWRjb21tLm9yZy9kaWRleGNoYW5nZS8xLjAiLCJodHRwczovL2RpZGNvbW0ub3JnL2Nvbm5lY3Rpb25zLzEuMCJdLCJzZXJ2aWNlcyI6WyJkaWQ6c292OkxqZ3BTVDJyanNveFllZ1FEUm03RUwiXX0K';
        const invitation = OutOfBandInvitation_1.OutOfBandInvitation.fromUrl(invitationUrl);
        const json = JsonTransformer_1.JsonTransformer.toJSON(invitation);
        expect(json).toEqual({
            '@type': 'https://didcomm.org/out-of-band/1.1/invitation',
            '@id': '69212a3a-d068-4f9d-a2dd-4741bca89af3',
            label: 'Faber College',
            goal_code: 'issue-vc',
            goal: 'To issue a Faber College Graduate credential',
            handshake_protocols: ['https://didcomm.org/didexchange/1.0', 'https://didcomm.org/connections/1.0'],
            services: ['did:sov:LjgpST2rjsoxYegQDRm7EL'],
        });
    });
});
describe('fromJson', () => {
    test('create an instance of `OutOfBandInvitation` from JSON object', () => {
        const json = {
            '@type': 'https://didcomm.org/out-of-band/1.1/invitation',
            '@id': '69212a3a-d068-4f9d-a2dd-4741bca89af3',
            label: 'Faber College',
            goal_code: 'issue-vc',
            goal: 'To issue a Faber College Graduate credential',
            handshake_protocols: ['https://didcomm.org/didexchange/1.0', 'https://didcomm.org/connections/1.0'],
            services: ['did:sov:LjgpST2rjsoxYegQDRm7EL'],
        };
        const invitation = OutOfBandInvitation_1.OutOfBandInvitation.fromJson(json);
        expect(invitation).toBeDefined();
        expect(invitation).toBeInstanceOf(OutOfBandInvitation_1.OutOfBandInvitation);
    });
    test('create an instance of `OutOfBandInvitation` from JSON object with inline service', () => {
        const json = {
            '@type': 'https://didcomm.org/out-of-band/1.1/invitation',
            '@id': '69212a3a-d068-4f9d-a2dd-4741bca89af3',
            label: 'Faber College',
            goal_code: 'issue-vc',
            goal: 'To issue a Faber College Graduate credential',
            handshake_protocols: ['https://didcomm.org/didexchange/1.0', 'https://didcomm.org/connections/1.0'],
            services: [
                {
                    id: '#inline',
                    recipientKeys: ['did:key:z6MkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th'],
                    routingKeys: ['did:key:z6MkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th'],
                    serviceEndpoint: 'https://example.com/ssi',
                },
            ],
        };
        const invitation = OutOfBandInvitation_1.OutOfBandInvitation.fromJson(json);
        expect(invitation).toBeDefined();
        expect(invitation).toBeInstanceOf(OutOfBandInvitation_1.OutOfBandInvitation);
    });
    test('create an instance of `OutOfBandInvitation` from JSON object with appended attachments', () => {
        var _a;
        const json = {
            '@type': 'https://didcomm.org/out-of-band/1.1/invitation',
            '@id': '69212a3a-d068-4f9d-a2dd-4741bca89af3',
            label: 'Faber College',
            goal_code: 'issue-vc',
            goal: 'To issue a Faber College Graduate credential',
            handshake_protocols: ['https://didcomm.org/didexchange/1.0', 'https://didcomm.org/connections/1.0'],
            services: ['did:sov:LjgpST2rjsoxYegQDRm7EL'],
            '~attach': [
                {
                    '@id': 'view-1',
                    'mime-type': 'image/png',
                    filename: 'IMG1092348.png',
                    lastmod_time: '2018-12-24 18:24:07Z',
                    description: 'view from doorway, facing east, with lights off',
                    data: {
                        base64: 'dmlldyBmcm9tIGRvb3J3YXksIGZhY2luZyBlYXN0LCB3aXRoIGxpZ2h0cyBvZmY=',
                    },
                },
                {
                    '@id': 'view-2',
                    'mime-type': 'image/png',
                    filename: 'IMG1092349.png',
                    lastmod_time: '2018-12-24 18:25:49Z',
                    description: 'view with lamp in the background',
                    data: {
                        base64: 'dmlldyB3aXRoIGxhbXAgaW4gdGhlIGJhY2tncm91bmQ=',
                    },
                },
            ],
        };
        const invitation = OutOfBandInvitation_1.OutOfBandInvitation.fromJson(json);
        expect(invitation).toBeDefined();
        expect(invitation).toBeInstanceOf(OutOfBandInvitation_1.OutOfBandInvitation);
        expect(invitation.appendedAttachments).toBeDefined();
        expect((_a = invitation.appendedAttachments) === null || _a === void 0 ? void 0 : _a.length).toEqual(2);
        expect(invitation.getAppendedAttachmentById('view-1')).toEqual(new Attachment_1.Attachment({
            id: 'view-1',
            mimeType: 'image/png',
            filename: 'IMG1092348.png',
            lastmodTime: new Date('2018-12-24 18:24:07Z'),
            description: 'view from doorway, facing east, with lights off',
            data: {
                base64: 'dmlldyBmcm9tIGRvb3J3YXksIGZhY2luZyBlYXN0LCB3aXRoIGxpZ2h0cyBvZmY=',
            },
        }));
        expect(invitation.getAppendedAttachmentById('view-2')).toEqual(new Attachment_1.Attachment({
            id: 'view-2',
            mimeType: 'image/png',
            filename: 'IMG1092349.png',
            lastmodTime: new Date('2018-12-24 18:25:49Z'),
            description: 'view with lamp in the background',
            data: {
                base64: 'dmlldyB3aXRoIGxhbXAgaW4gdGhlIGJhY2tncm91bmQ=',
            },
        }));
    });
    test('throw validation error when services attribute is empty', () => {
        const json = {
            '@type': 'https://didcomm.org/out-of-band/1.1/invitation',
            '@id': '69212a3a-d068-4f9d-a2dd-4741bca89af3',
            label: 'Faber College',
            goal_code: 'issue-vc',
            goal: 'To issue a Faber College Graduate credential',
            handshake_protocols: ['https://didcomm.org/didexchange/1.0', 'https://didcomm.org/connections/1.0'],
            services: [],
        };
        expect.assertions(1);
        try {
            OutOfBandInvitation_1.OutOfBandInvitation.fromJson(json);
        }
        catch (error) {
            const firstError = error;
            expect(firstError.validationErrors[0]).toMatchObject({
                children: [],
                constraints: { arrayNotEmpty: 'services should not be empty' },
                property: 'services',
                target: {
                    goal: 'To issue a Faber College Graduate credential',
                    label: 'Faber College',
                    services: [],
                },
                value: [],
            });
        }
    });
    test('transforms legacy prefix message @type and handshake_protocols to https://didcomm.org prefix', () => {
        const json = {
            '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/out-of-band/1.1/invitation',
            '@id': '69212a3a-d068-4f9d-a2dd-4741bca89af3',
            label: 'Faber College',
            goal_code: 'issue-vc',
            goal: 'To issue a Faber College Graduate credential',
            handshake_protocols: [
                'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/didexchange/1.0',
                'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0',
            ],
            services: ['did:sov:123'],
        };
        const invitation = OutOfBandInvitation_1.OutOfBandInvitation.fromJson(json);
        expect(invitation.type).toBe('https://didcomm.org/out-of-band/1.1/invitation');
        expect(invitation.handshakeProtocols).toEqual([
            'https://didcomm.org/didexchange/1.0',
            'https://didcomm.org/connections/1.0',
        ]);
    });
    // Check if options @Transform for legacy did:sov prefix doesn't fail if handshake_protocols is not present
    test('should successfully transform if no handshake_protocols is present', () => {
        const json = {
            '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/out-of-band/1.1/invitation',
            '@id': '69212a3a-d068-4f9d-a2dd-4741bca89af3',
            label: 'Faber College',
            goal_code: 'issue-vc',
            goal: 'To issue a Faber College Graduate credential',
            services: ['did:sov:123'],
        };
        const invitation = OutOfBandInvitation_1.OutOfBandInvitation.fromJson(json);
        expect(invitation.type).toBe('https://didcomm.org/out-of-band/1.1/invitation');
        expect(invitation.handshakeProtocols).toBeUndefined();
    });
    test('throw validation error when incorrect service object present in services attribute', () => __awaiter(void 0, void 0, void 0, function* () {
        const json = {
            '@type': 'https://didcomm.org/out-of-band/1.1/invitation',
            '@id': '69212a3a-d068-4f9d-a2dd-4741bca89af3',
            label: 'Faber College',
            goal_code: 'issue-vc',
            goal: 'To issue a Faber College Graduate credential',
            handshake_protocols: ['https://didcomm.org/didexchange/1.0', 'https://didcomm.org/connections/1.0'],
            services: [
                {
                    id: '#inline',
                    routingKeys: ['did:sov:LjgpST2rjsoxYegQDRm7EL'],
                    serviceEndpoint: 'https://example.com/ssi',
                },
            ],
        };
        expect.assertions(1);
        try {
            OutOfBandInvitation_1.OutOfBandInvitation.fromJson(json);
        }
        catch (error) {
            const firstError = error;
            expect(firstError.validationErrors[0]).toMatchObject({
                children: [],
                constraints: {
                    arrayNotEmpty: 'recipientKeys should not be empty',
                    isDidKeyString: 'each value in recipientKeys must be a did:key string',
                },
                property: 'recipientKeys',
                target: {
                    id: '#inline',
                    routingKeys: ['did:sov:LjgpST2rjsoxYegQDRm7EL'],
                    serviceEndpoint: 'https://example.com/ssi',
                    type: 'did-communication',
                },
                value: undefined,
            });
        }
    }));
});
