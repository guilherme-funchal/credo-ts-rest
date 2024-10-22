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
const src_1 = require("../../../../indy-sdk/src");
const setupIndySdkModule_1 = require("../../../../indy-sdk/tests/setupIndySdkModule");
const helpers_1 = require("../../../tests/helpers");
const crypto_1 = require("../../crypto");
const signing_provider_1 = require("../../crypto/signing-provider");
const utils_1 = require("../../utils");
const SignatureDecorator_1 = require("./SignatureDecorator");
const SignatureDecoratorUtils_1 = require("./SignatureDecoratorUtils");
jest.mock('../../utils/timestamp', () => {
    return {
        __esModule: true,
        default: jest.fn(() => Uint8Array.of(0, 0, 0, 0, 0, 0, 0, 0)),
    };
});
describe('Decorators | Signature | SignatureDecoratorUtils', () => {
    const data = {
        did: 'did',
        did_doc: {
            '@context': 'https://w3id.org/did/v1',
            service: [
                {
                    id: 'did:example:123456789abcdefghi#did-communication',
                    type: 'did-communication',
                    priority: 0,
                    recipientKeys: ['someVerkey'],
                    routingKeys: [],
                    serviceEndpoint: 'https://agent.example.com/',
                },
            ],
        },
    };
    const signedData = new SignatureDecorator_1.SignatureDecorator({
        signatureType: 'https://didcomm.org/signature/1.0/ed25519Sha512_single',
        signature: 'zOSmKNCHKqOJGDJ6OlfUXTPJiirEAXrFn1kPiFDZfvG5hNTBKhsSzqAvlg44apgWBu7O57vGWZsXBF2BWZ5JAw',
        signatureData: 'AAAAAAAAAAB7ImRpZCI6ImRpZCIsImRpZF9kb2MiOnsiQGNvbnRleHQiOiJodHRwczovL3czaWQub3JnL2RpZC92MSIsInNlcnZpY2UiOlt7ImlkIjoiZGlkOmV4YW1wbGU6MTIzNDU2Nzg5YWJjZGVmZ2hpI2RpZC1jb21tdW5pY2F0aW9uIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicHJpb3JpdHkiOjAsInJlY2lwaWVudEtleXMiOlsic29tZVZlcmtleSJdLCJyb3V0aW5nS2V5cyI6W10sInNlcnZpY2VFbmRwb2ludCI6Imh0dHBzOi8vYWdlbnQuZXhhbXBsZS5jb20vIn1dfX0',
        signer: 'GjZWsBLgZCR18aL468JAT7w9CZRiBnpxUPPgyQxh4voa',
    });
    let wallet;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const config = (0, helpers_1.getAgentConfig)('SignatureDecoratorUtilsTest');
        wallet = new src_1.IndySdkWallet(setupIndySdkModule_1.indySdk, config.logger, new signing_provider_1.SigningProviderRegistry([]));
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        yield wallet.createAndOpen(config.walletConfig);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield wallet.delete();
    }));
    test('signData signs json object and returns SignatureDecorator', () => __awaiter(void 0, void 0, void 0, function* () {
        const privateKey = utils_1.TypedArrayEncoder.fromString('00000000000000000000000000000My1');
        const key = yield wallet.createKey({ privateKey, keyType: crypto_1.KeyType.Ed25519 });
        const result = yield (0, SignatureDecoratorUtils_1.signData)(data, wallet, key.publicKeyBase58);
        expect(result).toEqual(signedData);
    }));
    test('unpackAndVerifySignatureDecorator unpacks signature decorator and verifies signature', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, SignatureDecoratorUtils_1.unpackAndVerifySignatureDecorator)(signedData, wallet);
        expect(result).toEqual(data);
    }));
    test('unpackAndVerifySignatureDecorator throws when signature is not valid', () => __awaiter(void 0, void 0, void 0, function* () {
        const wrongSignature = '6sblL1+OMlTFB3KhIQ8HKKZga8te7NAJAmBVPg2WzNYjMHVjfm+LJP6ZS1GUc2FRtfczRyLEfXrXb86SnzBmBA==';
        const wronglySignedData = new SignatureDecorator_1.SignatureDecorator(Object.assign(Object.assign({}, signedData), { signature: wrongSignature }));
        expect.assertions(1);
        try {
            yield (0, SignatureDecoratorUtils_1.unpackAndVerifySignatureDecorator)(wronglySignedData, wallet);
        }
        catch (error) {
            expect(error.message).toEqual('Signature is not valid');
        }
    }));
});
