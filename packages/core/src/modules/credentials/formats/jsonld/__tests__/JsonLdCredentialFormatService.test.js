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
const helpers_1 = require("../../../../../../tests/helpers");
const Attachment_1 = require("../../../../../decorators/attachment/Attachment");
const utils_1 = require("../../../../../utils");
const JsonEncoder_1 = require("../../../../../utils/JsonEncoder");
const dids_1 = require("../../../../dids");
const DidResolverService_1 = require("../../../../dids/services/DidResolverService");
const vc_1 = require("../../../../vc");
const W3cCredentialService_1 = require("../../../../vc/W3cCredentialService");
const W3cJsonLdCredentialService_1 = require("../../../../vc/data-integrity/W3cJsonLdCredentialService");
const fixtures_1 = require("../../../../vc/data-integrity/__tests__/fixtures");
const models_1 = require("../../../models");
const messages_1 = require("../../../protocol/v2/messages");
const CredentialExchangeRecord_1 = require("../../../repository/CredentialExchangeRecord");
const JsonLdCredentialFormatService_1 = require("../JsonLdCredentialFormatService");
jest.mock('../../../../vc/W3cCredentialService');
jest.mock('../../../../vc/data-integrity/W3cJsonLdCredentialService');
jest.mock('../../../../dids/services/DidResolverService');
const W3cCredentialServiceMock = W3cCredentialService_1.W3cCredentialService;
const W3cJsonLdCredentialServiceMock = W3cJsonLdCredentialService_1.W3cJsonLdCredentialService;
const DidResolverServiceMock = DidResolverService_1.DidResolverService;
const didDocument = utils_1.JsonTransformer.fromJSON({
    '@context': [
        'https://w3id.org/did/v1',
        'https://w3id.org/security/suites/ed25519-2018/v1',
        'https://w3id.org/security/suites/x25519-2019/v1',
    ],
    id: 'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL',
    verificationMethod: [
        {
            id: 'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL#z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL',
            type: 'Ed25519VerificationKey2018',
            controller: 'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL',
            publicKeyBase58: '3Dn1SJNPaCXcvvJvSbsFWP2xaCjMom3can8CQNhWrTRx',
        },
    ],
    authentication: [
        'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL#z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL',
    ],
    assertionMethod: [
        'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL#z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL',
    ],
    keyAgreement: [
        {
            id: 'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL#z6LSbkodSr6SU2trs8VUgnrnWtSm7BAPG245ggrBmSrxbv1R',
            type: 'X25519KeyAgreementKey2019',
            controller: 'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL',
            publicKeyBase58: '5dTvYHaNaB7mk7iA9LqCJEHG2dGZQsvoi8WGzDRtYEf',
        },
    ],
}, dids_1.DidDocument);
const vcJson = Object.assign(Object.assign({}, fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED), { credentialSubject: Object.assign(Object.assign({}, fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED.credentialSubject), { alumniOf: 'oops' }) });
const vc = utils_1.JsonTransformer.fromJSON(vcJson, vc_1.W3cJsonLdVerifiableCredential);
const credentialPreview = messages_1.V2CredentialPreview.fromRecord({
    name: 'John',
    age: '99',
});
const offerAttachment = new Attachment_1.Attachment({
    mimeType: 'application/json',
    data: new Attachment_1.AttachmentData({
        base64: 'eyJzY2hlbWFfaWQiOiJhYWEiLCJjcmVkX2RlZl9pZCI6IlRoN01wVGFSWlZSWW5QaWFiZHM4MVk6MzpDTDoxNzpUQUciLCJub25jZSI6Im5vbmNlIiwia2V5X2NvcnJlY3RuZXNzX3Byb29mIjp7fX0',
    }),
});
const credentialAttachment = new Attachment_1.Attachment({
    mimeType: 'application/json',
    data: new Attachment_1.AttachmentData({
        base64: JsonEncoder_1.JsonEncoder.toBase64(vcJson),
    }),
});
// A record is deserialized to JSON when it's stored into the storage. We want to simulate this behaviour for `offer`
// object to test our service would behave correctly. We use type assertion for `offer` attribute to `any`.
const mockCredentialRecord = ({ state, threadId, connectionId, tags, id, credentialAttributes, } = {}) => {
    const credentialRecord = new CredentialExchangeRecord_1.CredentialExchangeRecord({
        id,
        credentialAttributes: credentialAttributes || credentialPreview.attributes,
        state: state || models_1.CredentialState.OfferSent,
        threadId: threadId !== null && threadId !== void 0 ? threadId : 'add7e1a0-109e-4f37-9caa-cfd0fcdfe540',
        connectionId: connectionId !== null && connectionId !== void 0 ? connectionId : '123',
        tags,
        protocolVersion: 'v2',
    });
    return credentialRecord;
};
const inputDocAsJson = {
    '@context': [vc_1.CREDENTIALS_CONTEXT_V1_URL, 'https://www.w3.org/2018/credentials/examples/v1'],
    type: ['VerifiableCredential', 'UniversityDegreeCredential'],
    issuer: 'did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL',
    issuanceDate: '2017-10-22T12:23:48Z',
    credentialSubject: {
        degree: {
            type: 'BachelorDegree',
            name: 'Bachelor of Science and Arts',
        },
        alumniOf: 'oops',
    },
};
const verificationMethod = `8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K#8HH5gYEeNc3z7PYXmd54d4x6qAfCNrqQqEB3nS7Zfu7K`;
const signCredentialOptions = {
    credential: inputDocAsJson,
    options: {
        proofPurpose: 'assertionMethod',
        proofType: 'Ed25519Signature2018',
    },
};
const requestAttachment = new Attachment_1.Attachment({
    mimeType: 'application/json',
    data: new Attachment_1.AttachmentData({
        base64: JsonEncoder_1.JsonEncoder.toBase64(signCredentialOptions),
    }),
});
let jsonLdFormatService;
let w3cCredentialService;
let w3cJsonLdCredentialService;
let didResolver;
describe('JsonLd CredentialFormatService', () => {
    let agentContext;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        w3cCredentialService = new W3cCredentialServiceMock();
        w3cJsonLdCredentialService = new W3cJsonLdCredentialServiceMock();
        didResolver = new DidResolverServiceMock();
        const agentConfig = (0, helpers_1.getAgentConfig)('JsonLdCredentialFormatServiceTest');
        agentContext = (0, helpers_1.getAgentContext)({
            registerInstances: [
                [DidResolverService_1.DidResolverService, didResolver],
                [W3cCredentialService_1.W3cCredentialService, w3cCredentialService],
                [W3cJsonLdCredentialService_1.W3cJsonLdCredentialService, w3cJsonLdCredentialService],
            ],
            agentConfig,
        });
        jsonLdFormatService = new JsonLdCredentialFormatService_1.JsonLdCredentialFormatService();
    }));
    describe('Create JsonLd Credential Proposal / Offer', () => {
        test(`Creates JsonLd Credential Proposal`, () => __awaiter(void 0, void 0, void 0, function* () {
            // when
            const { attachment, format } = yield jsonLdFormatService.createProposal(agentContext, {
                credentialRecord: mockCredentialRecord(),
                credentialFormats: {
                    jsonld: signCredentialOptions,
                },
            });
            // then
            expect(attachment).toMatchObject({
                id: expect.any(String),
                description: undefined,
                filename: undefined,
                mimeType: 'application/json',
                lastmodTime: undefined,
                byteCount: undefined,
                data: {
                    base64: 'eyJjcmVkZW50aWFsIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIiwiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvZXhhbXBsZXMvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIlVuaXZlcnNpdHlEZWdyZWVDcmVkZW50aWFsIl0sImlzc3VlciI6ImRpZDprZXk6ejZNa2dnMzQyWWNwdWsyNjNSOWQ4QXE2TVVheFBuMUREZUh5R28zOEVlZlhtZ0RMIiwiaXNzdWFuY2VEYXRlIjoiMjAxNy0xMC0yMlQxMjoyMzo0OFoiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJkZWdyZWUiOnsidHlwZSI6IkJhY2hlbG9yRGVncmVlIiwibmFtZSI6IkJhY2hlbG9yIG9mIFNjaWVuY2UgYW5kIEFydHMifSwiYWx1bW5pT2YiOiJvb3BzIn19LCJvcHRpb25zIjp7InByb29mUHVycG9zZSI6ImFzc2VydGlvbk1ldGhvZCIsInByb29mVHlwZSI6IkVkMjU1MTlTaWduYXR1cmUyMDE4In19',
                    json: undefined,
                    links: undefined,
                    jws: undefined,
                    sha256: undefined,
                },
            });
            expect(format).toMatchObject({
                attachmentId: expect.any(String),
                format: 'aries/ld-proof-vc-detail@v1.0',
            });
        }));
        test(`Creates JsonLd Credential Offer`, () => __awaiter(void 0, void 0, void 0, function* () {
            // when
            const { attachment, previewAttributes, format } = yield jsonLdFormatService.createOffer(agentContext, {
                credentialFormats: {
                    jsonld: signCredentialOptions,
                },
                credentialRecord: mockCredentialRecord(),
            });
            // then
            expect(attachment).toMatchObject({
                id: expect.any(String),
                description: undefined,
                filename: undefined,
                mimeType: 'application/json',
                lastmodTime: undefined,
                byteCount: undefined,
                data: {
                    base64: 'eyJjcmVkZW50aWFsIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIiwiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvZXhhbXBsZXMvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIlVuaXZlcnNpdHlEZWdyZWVDcmVkZW50aWFsIl0sImlzc3VlciI6ImRpZDprZXk6ejZNa2dnMzQyWWNwdWsyNjNSOWQ4QXE2TVVheFBuMUREZUh5R28zOEVlZlhtZ0RMIiwiaXNzdWFuY2VEYXRlIjoiMjAxNy0xMC0yMlQxMjoyMzo0OFoiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJkZWdyZWUiOnsidHlwZSI6IkJhY2hlbG9yRGVncmVlIiwibmFtZSI6IkJhY2hlbG9yIG9mIFNjaWVuY2UgYW5kIEFydHMifSwiYWx1bW5pT2YiOiJvb3BzIn19LCJvcHRpb25zIjp7InByb29mUHVycG9zZSI6ImFzc2VydGlvbk1ldGhvZCIsInByb29mVHlwZSI6IkVkMjU1MTlTaWduYXR1cmUyMDE4In19',
                    json: undefined,
                    links: undefined,
                    jws: undefined,
                    sha256: undefined,
                },
            });
            expect(previewAttributes).toBeUndefined();
            expect(format).toMatchObject({
                attachmentId: expect.any(String),
                format: 'aries/ld-proof-vc-detail@v1.0',
            });
        }));
    });
    describe('Accept Credential Offer', () => {
        test('returns credential request message base on existing credential offer message', () => __awaiter(void 0, void 0, void 0, function* () {
            // when
            const { attachment, format } = yield jsonLdFormatService.acceptOffer(agentContext, {
                credentialFormats: {
                    jsonld: undefined,
                },
                offerAttachment,
                credentialRecord: mockCredentialRecord({
                    state: models_1.CredentialState.OfferReceived,
                    threadId: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
                    connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
                }),
            });
            // then
            expect(attachment).toMatchObject({
                id: expect.any(String),
                description: undefined,
                filename: undefined,
                mimeType: 'application/json',
                lastmodTime: undefined,
                byteCount: undefined,
                data: {
                    base64: 'eyJzY2hlbWFfaWQiOiJhYWEiLCJjcmVkX2RlZl9pZCI6IlRoN01wVGFSWlZSWW5QaWFiZHM4MVk6MzpDTDoxNzpUQUciLCJub25jZSI6Im5vbmNlIiwia2V5X2NvcnJlY3RuZXNzX3Byb29mIjp7fX0=',
                    json: undefined,
                    links: undefined,
                    jws: undefined,
                    sha256: undefined,
                },
            });
            expect(format).toMatchObject({
                attachmentId: expect.any(String),
                format: 'aries/ld-proof-vc-detail@v1.0',
            });
        }));
    });
    describe('Accept Request', () => {
        const threadId = 'fd9c5ddb-ec11-4acd-bc32-540736249746';
        test('Derive Verification Method', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(didResolver.resolveDidDocument).mockReturnValue(Promise.resolve(didDocument));
            (0, helpers_1.mockFunction)(w3cJsonLdCredentialService.getVerificationMethodTypesByProofType).mockReturnValue([
                'Ed25519VerificationKey2018',
            ]);
            const service = jsonLdFormatService;
            const credentialRequest = requestAttachment.getDataAsJson();
            // calls private method in the format service
            const verificationMethod = yield service['deriveVerificationMethod'](agentContext, signCredentialOptions.credential, credentialRequest);
            expect(verificationMethod).toBe('did:key:z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL#z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL');
        }));
        test('Creates a credential', () => __awaiter(void 0, void 0, void 0, function* () {
            // given
            (0, helpers_1.mockFunction)(w3cJsonLdCredentialService.signCredential).mockReturnValue(Promise.resolve(vc));
            const credentialRecord = mockCredentialRecord({
                state: models_1.CredentialState.RequestReceived,
                threadId,
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
            });
            const { format, attachment } = yield jsonLdFormatService.acceptRequest(agentContext, {
                credentialRecord,
                credentialFormats: {
                    jsonld: {
                        verificationMethod,
                    },
                },
                requestAttachment,
                offerAttachment,
            });
            //then
            expect(w3cJsonLdCredentialService.signCredential).toHaveBeenCalledTimes(1);
            expect(attachment).toMatchObject({
                id: expect.any(String),
                description: undefined,
                filename: undefined,
                mimeType: 'application/json',
                lastmodTime: undefined,
                byteCount: undefined,
                data: {
                    base64: expect.any(String),
                    json: undefined,
                    links: undefined,
                    jws: undefined,
                    sha256: undefined,
                },
            });
            expect(format).toMatchObject({
                attachmentId: expect.any(String),
                format: 'aries/ld-proof-vc@v1.0',
            });
        }));
    });
    describe('Process Credential', () => {
        const credentialRecord = mockCredentialRecord({
            state: models_1.CredentialState.RequestSent,
        });
        let w3c;
        let signCredentialOptionsWithProperty;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            signCredentialOptionsWithProperty = signCredentialOptions;
            signCredentialOptionsWithProperty.options = {
                proofPurpose: 'assertionMethod',
                proofType: 'Ed25519Signature2018',
            };
            w3c = new vc_1.W3cCredentialRecord({
                id: 'foo',
                createdAt: new Date(),
                credential: vc,
                tags: {
                    expandedTypes: [
                        'https://www.w3.org/2018/credentials#VerifiableCredential',
                        'https://example.org/examples#UniversityDegreeCredential',
                    ],
                },
            });
        }));
        test('finds credential record by thread ID and saves credential attachment into the wallet', () => __awaiter(void 0, void 0, void 0, function* () {
            // given
            (0, helpers_1.mockFunction)(w3cCredentialService.storeCredential).mockReturnValue(Promise.resolve(w3c));
            // when
            yield jsonLdFormatService.processCredential(agentContext, {
                attachment: credentialAttachment,
                requestAttachment: requestAttachment,
                credentialRecord,
            });
            // then
            expect(w3cCredentialService.storeCredential).toHaveBeenCalledTimes(1);
            expect(credentialRecord.credentials.length).toBe(1);
            expect(credentialRecord.credentials[0].credentialRecordType).toBe('w3c');
            expect(credentialRecord.credentials[0].credentialRecordId).toBe('foo');
        }));
        test('throws error if credential subject not equal to request subject', () => __awaiter(void 0, void 0, void 0, function* () {
            const vcJson = Object.assign(Object.assign({}, fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED), { credentialSubject: Object.assign({}, fixtures_1.Ed25519Signature2018Fixtures.TEST_LD_DOCUMENT_SIGNED.credentialSubject) });
            const credentialAttachment = new Attachment_1.Attachment({
                mimeType: 'application/json',
                data: new Attachment_1.AttachmentData({
                    base64: JsonEncoder_1.JsonEncoder.toBase64(vcJson),
                }),
            });
            // given
            (0, helpers_1.mockFunction)(w3cCredentialService.storeCredential).mockReturnValue(Promise.resolve(w3c));
            // when/then
            yield expect(jsonLdFormatService.processCredential(agentContext, {
                attachment: credentialAttachment,
                requestAttachment: requestAttachment,
                credentialRecord,
            })).rejects.toThrow('Received credential does not match credential request');
        }));
        test('throws error if credential domain not equal to request domain', () => __awaiter(void 0, void 0, void 0, function* () {
            // this property is not supported yet by us, but could be in the credential we received
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            signCredentialOptionsWithProperty.options.domain = 'https://test.com';
            const requestAttachmentWithDomain = new Attachment_1.Attachment({
                mimeType: 'application/json',
                data: new Attachment_1.AttachmentData({
                    base64: JsonEncoder_1.JsonEncoder.toBase64(signCredentialOptionsWithProperty),
                }),
            });
            // given
            (0, helpers_1.mockFunction)(w3cCredentialService.storeCredential).mockReturnValue(Promise.resolve(w3c));
            // when/then
            yield expect(jsonLdFormatService.processCredential(agentContext, {
                attachment: credentialAttachment,
                requestAttachment: requestAttachmentWithDomain,
                credentialRecord,
            })).rejects.toThrow('Received credential proof domain does not match domain from credential request');
        }));
        test('throws error if credential challenge not equal to request challenge', () => __awaiter(void 0, void 0, void 0, function* () {
            // this property is not supported yet by us, but could be in the credential we received
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            signCredentialOptionsWithProperty.options.challenge = '7bf32d0b-39d4-41f3-96b6-45de52988e4c';
            const requestAttachmentWithChallenge = new Attachment_1.Attachment({
                mimeType: 'application/json',
                data: new Attachment_1.AttachmentData({
                    base64: JsonEncoder_1.JsonEncoder.toBase64(signCredentialOptionsWithProperty),
                }),
            });
            // given
            (0, helpers_1.mockFunction)(w3cCredentialService.storeCredential).mockReturnValue(Promise.resolve(w3c));
            // when/then
            yield expect(jsonLdFormatService.processCredential(agentContext, {
                attachment: credentialAttachment,
                requestAttachment: requestAttachmentWithChallenge,
                credentialRecord,
            })).rejects.toThrow('Received credential proof challenge does not match challenge from credential request');
        }));
        test('throws error if credential proof type not equal to request proof type', () => __awaiter(void 0, void 0, void 0, function* () {
            signCredentialOptionsWithProperty.options.proofType = 'Ed25519Signature2016';
            const requestAttachmentWithProofType = new Attachment_1.Attachment({
                mimeType: 'application/json',
                data: new Attachment_1.AttachmentData({
                    base64: JsonEncoder_1.JsonEncoder.toBase64(signCredentialOptionsWithProperty),
                }),
            });
            // given
            (0, helpers_1.mockFunction)(w3cCredentialService.storeCredential).mockReturnValue(Promise.resolve(w3c));
            // when/then
            yield expect(jsonLdFormatService.processCredential(agentContext, {
                attachment: credentialAttachment,
                requestAttachment: requestAttachmentWithProofType,
                credentialRecord,
            })).rejects.toThrow('Received credential proof type does not match proof type from credential request');
        }));
        test('throws error if credential proof purpose not equal to request proof purpose', () => __awaiter(void 0, void 0, void 0, function* () {
            signCredentialOptionsWithProperty.options.proofPurpose = 'authentication';
            const requestAttachmentWithProofPurpose = new Attachment_1.Attachment({
                mimeType: 'application/json',
                data: new Attachment_1.AttachmentData({
                    base64: JsonEncoder_1.JsonEncoder.toBase64(signCredentialOptionsWithProperty),
                }),
            });
            // given
            (0, helpers_1.mockFunction)(w3cCredentialService.storeCredential).mockReturnValue(Promise.resolve(w3c));
            // when/then
            yield expect(jsonLdFormatService.processCredential(agentContext, {
                attachment: credentialAttachment,
                requestAttachment: requestAttachmentWithProofPurpose,
                credentialRecord,
            })).rejects.toThrow('Received credential proof purpose does not match proof purpose from credential request');
        }));
        test('are credentials equal', () => __awaiter(void 0, void 0, void 0, function* () {
            const message1 = new Attachment_1.Attachment({
                id: 'cdb0669b-7cd6-46bc-b1c7-7034f86083ac',
                mimeType: 'application/json',
                data: new Attachment_1.AttachmentData({
                    base64: JsonEncoder_1.JsonEncoder.toBase64(inputDocAsJson),
                }),
            });
            const message2 = new Attachment_1.Attachment({
                id: '9a8ff4fb-ac86-478f-b7f9-fbf3f9cc60e6',
                mimeType: 'application/json',
                data: new Attachment_1.AttachmentData({
                    base64: JsonEncoder_1.JsonEncoder.toBase64(inputDocAsJson),
                }),
            });
            // indirectly test areCredentialsEqual as black box rather than expose that method in the API
            let areCredentialsEqual = yield jsonLdFormatService.shouldAutoRespondToProposal(agentContext, {
                credentialRecord,
                proposalAttachment: message1,
                offerAttachment: message2,
            });
            expect(areCredentialsEqual).toBe(true);
            const inputDoc2 = {
                '@context': [
                    'https://www.w3.org/2018/credentials/v1',
                    'https://w3id.org/citizenship/v1',
                    'https://w3id.org/security/bbs/v1',
                ],
            };
            message2.data = new Attachment_1.AttachmentData({
                base64: JsonEncoder_1.JsonEncoder.toBase64(inputDoc2),
            });
            areCredentialsEqual = yield jsonLdFormatService.shouldAutoRespondToProposal(agentContext, {
                credentialRecord,
                proposalAttachment: message1,
                offerAttachment: message2,
            });
            expect(areCredentialsEqual).toBe(false);
        }));
    });
});
