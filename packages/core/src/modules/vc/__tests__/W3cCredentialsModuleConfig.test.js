"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const W3cCredentialsModuleConfig_1 = require("../W3cCredentialsModuleConfig");
const documentLoader_1 = require("../data-integrity/libraries/documentLoader");
describe('W3cCredentialsModuleConfig', () => {
    test('sets default values', () => {
        const config = new W3cCredentialsModuleConfig_1.W3cCredentialsModuleConfig();
        expect(config.documentLoader).toBe(documentLoader_1.defaultDocumentLoader);
    });
    test('sets values', () => {
        const documentLoader = jest.fn();
        const config = new W3cCredentialsModuleConfig_1.W3cCredentialsModuleConfig({
            documentLoader,
        });
        expect(config.documentLoader).toBe(documentLoader);
    });
});
