"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CITIZENSHIP_V2 = void 0;
exports.CITIZENSHIP_V2 = {
    '@context': {
        '@version': 1.1,
        '@protected': true,
        name: 'http://schema.org/name',
        description: 'http://schema.org/description',
        identifier: 'http://schema.org/identifier',
        image: { '@id': 'http://schema.org/image', '@type': '@id' },
        PermanentResidentCard: {
            '@id': 'https://w3id.org/citizenship#PermanentResidentCard',
            '@context': {
                '@version': 1.1,
                '@protected': true,
                id: '@id',
                type: '@type',
                description: 'http://schema.org/description',
                name: 'http://schema.org/name',
                identifier: 'http://schema.org/identifier',
                image: { '@id': 'http://schema.org/image', '@type': '@id' },
            },
        },
        PermanentResident: {
            '@id': 'https://w3id.org/citizenship#PermanentResident',
            '@context': {
                '@version': 1.1,
                '@protected': true,
                id: '@id',
                type: '@type',
                ctzn: 'https://w3id.org/citizenship#',
                schema: 'http://schema.org/',
                xsd: 'http://www.w3.org/2001/XMLSchema#',
                birthCountry: 'ctzn:birthCountry',
                birthDate: { '@id': 'schema:birthDate', '@type': 'xsd:dateTime' },
                commuterClassification: 'ctzn:commuterClassification',
                familyName: 'schema:familyName',
                gender: 'schema:gender',
                givenName: 'schema:givenName',
                lprCategory: 'ctzn:lprCategory',
                lprNumber: 'ctzn:lprNumber',
                residentSince: { '@id': 'ctzn:residentSince', '@type': 'xsd:dateTime' },
            },
        },
        Person: 'http://schema.org/Person',
    },
};
