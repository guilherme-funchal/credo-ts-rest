"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Attachment_1 = require("../../../decorators/attachment/Attachment");
const utils_1 = require("../../../utils");
const connections_1 = require("../../connections");
const domain_1 = require("../domain");
const helpers_1 = require("../helpers");
const messages_1 = require("../messages");
describe('convertToNewInvitation', () => {
    it('should convert a connection invitation with service to an out of band invitation', () => {
        const connectionInvitation = new connections_1.ConnectionInvitationMessage({
            id: 'd88ff8fd-6c43-4683-969e-11a87a572cf2',
            imageUrl: 'https://my-image.com',
            label: 'a-label',
            recipientKeys: ['8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K'],
            serviceEndpoint: 'https://my-agent.com',
            routingKeys: ['6fioC1zcDPyPEL19pXRS2E4iJ46zH7xP6uSgAaPdwDrx'],
            appendedAttachments: [
                new Attachment_1.Attachment({
                    id: 'attachment-1',
                    mimeType: 'text/plain',
                    description: 'attachment description',
                    filename: 'test.jpg',
                    data: {
                        json: {
                            text: 'sample',
                            value: 1,
                        },
                    },
                }),
            ],
        });
        const oobInvitation = (0, helpers_1.convertToNewInvitation)(connectionInvitation);
        expect(oobInvitation).toMatchObject({
            id: 'd88ff8fd-6c43-4683-969e-11a87a572cf2',
            imageUrl: 'https://my-image.com',
            label: 'a-label',
            services: [
                {
                    id: '#inline',
                    recipientKeys: ['did:key:z6MkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th'],
                    routingKeys: ['did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL'],
                    serviceEndpoint: 'https://my-agent.com',
                },
            ],
            appendedAttachments: [
                {
                    id: 'attachment-1',
                    description: 'attachment description',
                    filename: 'test.jpg',
                    mimeType: 'text/plain',
                    data: { json: { text: 'sample', value: 1 } },
                },
            ],
        });
    });
    it('should convert a connection invitation with public did to an out of band invitation', () => {
        const connectionInvitation = new connections_1.ConnectionInvitationMessage({
            id: 'd88ff8fd-6c43-4683-969e-11a87a572cf2',
            imageUrl: 'https://my-image.com',
            label: 'a-label',
            did: 'did:sov:a-did',
            appendedAttachments: [
                new Attachment_1.Attachment({
                    id: 'attachment-1',
                    mimeType: 'text/plain',
                    description: 'attachment description',
                    filename: 'test.jpg',
                    data: {
                        json: {
                            text: 'sample',
                            value: 1,
                        },
                    },
                }),
            ],
        });
        const oobInvitation = (0, helpers_1.convertToNewInvitation)(connectionInvitation);
        expect(oobInvitation).toMatchObject({
            id: 'd88ff8fd-6c43-4683-969e-11a87a572cf2',
            imageUrl: 'https://my-image.com',
            label: 'a-label',
            services: ['did:sov:a-did'],
            appendedAttachments: [
                {
                    id: 'attachment-1',
                    description: 'attachment description',
                    filename: 'test.jpg',
                    mimeType: 'text/plain',
                    data: { json: { text: 'sample', value: 1 } },
                },
            ],
        });
    });
    it('throws an error when no did and serviceEndpoint/routingKeys are present in the connection invitation', () => {
        const connectionInvitation = utils_1.JsonTransformer.fromJSON({
            '@id': 'd88ff8fd-6c43-4683-969e-11a87a572cf2',
            '@type': 'https://didcomm.org/connections/1.0/invitation',
            label: 'a-label',
            imageUrl: 'https://my-image.com',
        }, connections_1.ConnectionInvitationMessage, 
        // Don't validate because we want this to be mal-formatted
        { validate: false });
        expect(() => (0, helpers_1.convertToNewInvitation)(connectionInvitation)).toThrowError();
    });
});
describe('convertToOldInvitation', () => {
    it('should convert an out of band invitation with inline service to a connection invitation', () => {
        const oobInvitation = new messages_1.OutOfBandInvitation({
            id: 'd88ff8fd-6c43-4683-969e-11a87a572cf2',
            imageUrl: 'https://my-image.com',
            label: 'a-label',
            services: [
                new domain_1.OutOfBandDidCommService({
                    id: '#inline',
                    recipientKeys: ['did:key:z6MkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th'],
                    routingKeys: ['did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL'],
                    serviceEndpoint: 'https://my-agent.com',
                }),
            ],
        });
        const connectionInvitation = (0, helpers_1.convertToOldInvitation)(oobInvitation);
        expect(connectionInvitation).toMatchObject({
            id: 'd88ff8fd-6c43-4683-969e-11a87a572cf2',
            imageUrl: 'https://my-image.com',
            label: 'a-label',
            recipientKeys: ['8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K'],
            routingKeys: ['6fioC1zcDPyPEL19pXRS2E4iJ46zH7xP6uSgAaPdwDrx'],
            serviceEndpoint: 'https://my-agent.com',
        });
    });
    it('should convert an out of band invitation with did service to a connection invitation', () => {
        const oobInvitation = new messages_1.OutOfBandInvitation({
            id: 'd88ff8fd-6c43-4683-969e-11a87a572cf2',
            imageUrl: 'https://my-image.com',
            label: 'a-label',
            services: ['did:sov:a-did'],
        });
        const connectionInvitation = (0, helpers_1.convertToOldInvitation)(oobInvitation);
        expect(connectionInvitation).toMatchObject({
            id: 'd88ff8fd-6c43-4683-969e-11a87a572cf2',
            imageUrl: 'https://my-image.com',
            label: 'a-label',
            did: 'did:sov:a-did',
        });
    });
});
