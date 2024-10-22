"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HashlinkEncoder_1 = require("../HashlinkEncoder");
const buffer_1 = require("../buffer");
const validData = {
    data: buffer_1.Buffer.from('Hello World!'),
    metadata: {
        urls: ['https://example.org/hw.txt'],
        contentType: 'text/plain',
    },
};
const invalidData = {
    data: buffer_1.Buffer.from('Hello World!'),
    metadata: {
        unknownKey: 'unkownValue',
        contentType: 'image/png',
    },
};
const validHashlink = 'hl:zQmWvQxTqbG2Z9HPJgG57jjwR154cKhbtJenbyYTWkjgF3e:zCwPSdabLuj3jue1qYujzunnKwpL4myKdyeqySyFhnzZ8qeLeC1U6N5eycFD';
const invalidHashlink = 'hl:gQmWvQxTqbqwlkhhhhh9w8e7rJenbyYTWkjgF3e:z51a94WAQfNv1KEcPeoV3V2isZFPFqSzE9ghNFQ8DuQu4hTHtFRug8SDgug14Ff';
const invalidMetadata = 'hl:zQmWvQxTqbG2Z9HPJgG57jjwR154cKhbtJenbyYTWkjgF3e:zHCwSqQisPgCc2sMSNmHWyQtCKu4kgQVD6Q1Nhxff7uNRqN6r';
describe('HashlinkEncoder', () => {
    describe('encode()', () => {
        it('Encodes string to hashlink', () => {
            const hashlink = HashlinkEncoder_1.HashlinkEncoder.encode(validData.data, 'sha2-256');
            expect(hashlink).toEqual('hl:zQmWvQxTqbG2Z9HPJgG57jjwR154cKhbtJenbyYTWkjgF3e');
        });
        it('Encodes string and metadata to hashlink', () => {
            const hashlink = HashlinkEncoder_1.HashlinkEncoder.encode(validData.data, 'sha2-256', 'base58btc', validData.metadata);
            expect(hashlink).toEqual(validHashlink);
        });
        it('Encodes invalid metadata in hashlink', () => {
            expect(() => {
                HashlinkEncoder_1.HashlinkEncoder.encode(validData.data, 'sha2-256', 'base58btc', invalidData.metadata);
            }).toThrow(/^Invalid metadata: /);
        });
    });
    describe('decode()', () => {
        it('Decodes hashlink', () => {
            const decodedHashlink = HashlinkEncoder_1.HashlinkEncoder.decode(validHashlink);
            expect(decodedHashlink).toEqual({
                checksum: 'zQmWvQxTqbG2Z9HPJgG57jjwR154cKhbtJenbyYTWkjgF3e',
                metadata: { contentType: 'text/plain', urls: ['https://example.org/hw.txt'] },
            });
        });
        it('Decodes invalid hashlink', () => {
            expect(() => {
                HashlinkEncoder_1.HashlinkEncoder.decode(invalidHashlink);
            }).toThrow(/^Invalid hashlink: /);
        });
        it('Decodes invalid metadata in hashlink', () => {
            expect(() => {
                HashlinkEncoder_1.HashlinkEncoder.decode(invalidMetadata);
            }).toThrow(/^Invalid metadata: /);
        });
    });
    describe('isValid()', () => {
        it('Validate hashlink', () => {
            expect(HashlinkEncoder_1.HashlinkEncoder.isValid(validHashlink)).toEqual(true);
        });
        it('Validate invalid hashlink', () => {
            expect(HashlinkEncoder_1.HashlinkEncoder.isValid(invalidHashlink)).toEqual(false);
        });
    });
});
