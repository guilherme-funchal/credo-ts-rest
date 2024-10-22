"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const didJwsz6Mkf = __importStar(require("../../../crypto/__tests__/__fixtures__/didJwsz6Mkf"));
const didJwsz6Mkv = __importStar(require("../../../crypto/__tests__/__fixtures__/didJwsz6Mkv"));
const JsonEncoder_1 = require("../../../utils/JsonEncoder");
const JsonTransformer_1 = require("../../../utils/JsonTransformer");
const Attachment_1 = require("../Attachment");
const mockJson = {
    '@id': 'ceffce22-6471-43e4-8945-b604091981c9',
    description: 'A small picture of a cat',
    filename: 'cat.png',
    'mime-type': 'text/plain',
    lastmod_time: new Date(),
    byte_count: 9200,
    data: {
        json: {
            hello: 'world!',
        },
        sha256: '00d7b2068a0b237f14a7979bbfc01ad62f60792e459467bfc4a7d3b9a6dbbe3e',
    },
};
const mockJsonBase64 = {
    '@id': 'ceffce22-6471-43e4-8945-b604091981c9',
    description: 'A small picture of a cat',
    filename: 'cat.png',
    'mime-type': 'text/plain',
    lastmod_time: new Date(),
    byte_count: 9200,
    data: {
        base64: JsonEncoder_1.JsonEncoder.toBase64(mockJson.data.json),
    },
};
const id = 'ceffce22-6471-43e4-8945-b604091981c9';
const description = 'A small picture of a cat';
const filename = 'cat.png';
const mimeType = 'text/plain';
const lastmodTime = new Date();
const byteCount = 9200;
const data = {
    json: {
        hello: 'world!',
    },
    sha256: '00d7b2068a0b237f14a7979bbfc01ad62f60792e459467bfc4a7d3b9a6dbbe3e',
};
const dataInstance = new Attachment_1.AttachmentData(data);
describe('Decorators | Attachment', () => {
    it('should correctly transform Json to Attachment class', () => {
        const decorator = JsonTransformer_1.JsonTransformer.fromJSON(mockJson, Attachment_1.Attachment);
        expect(decorator.id).toBe(mockJson['@id']);
        expect(decorator.description).toBe(mockJson.description);
        expect(decorator.filename).toBe(mockJson.filename);
        expect(decorator.lastmodTime).toEqual(mockJson.lastmod_time);
        expect(decorator.byteCount).toEqual(mockJson.byte_count);
        expect(decorator.data).toMatchObject(mockJson.data);
    });
    it('should correctly transform Attachment class to Json', () => {
        const decorator = new Attachment_1.Attachment({
            id,
            description,
            filename,
            mimeType,
            lastmodTime,
            byteCount,
            data: dataInstance,
        });
        const json = JsonTransformer_1.JsonTransformer.toJSON(decorator);
        const transformed = {
            '@id': id,
            description,
            filename,
            'mime-type': mimeType,
            lastmod_time: lastmodTime,
            byte_count: byteCount,
            data,
        };
        expect(json).toMatchObject(transformed);
    });
    it('should return the data correctly if only JSON exists', () => {
        const decorator = JsonTransformer_1.JsonTransformer.fromJSON(mockJson, Attachment_1.Attachment);
        const gotData = decorator.getDataAsJson();
        expect(decorator.data.json).toEqual(gotData);
    });
    it('should return the data correctly if only Base64 exists', () => {
        const decorator = JsonTransformer_1.JsonTransformer.fromJSON(mockJsonBase64, Attachment_1.Attachment);
        const gotData = decorator.getDataAsJson();
        expect(mockJson.data.json).toEqual(gotData);
    });
    describe('addJws', () => {
        it('correctly adds the jws to the data', () => __awaiter(void 0, void 0, void 0, function* () {
            const base64 = JsonEncoder_1.JsonEncoder.toBase64(didJwsz6Mkf.DATA_JSON);
            const attachment = new Attachment_1.Attachment({
                id: 'some-uuid',
                data: new Attachment_1.AttachmentData({
                    base64,
                }),
            });
            expect(attachment.data.jws).toBeUndefined();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _a = didJwsz6Mkf.JWS_JSON, { payload } = _a, detachedJws = __rest(_a, ["payload"]);
            attachment.addJws(didJwsz6Mkf.JWS_JSON);
            expect(attachment.data.jws).toEqual(detachedJws);
            attachment.addJws(didJwsz6Mkv.JWS_JSON);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _b = didJwsz6Mkv.JWS_JSON, { payload: payload2 } = _b, detachedJws2 = __rest(_b, ["payload"]);
            expect(attachment.data.jws).toEqual({ signatures: [detachedJws, detachedJws2] });
            expect(JsonTransformer_1.JsonTransformer.toJSON(attachment)).toMatchObject({
                '@id': 'some-uuid',
                data: {
                    base64: JsonEncoder_1.JsonEncoder.toBase64(didJwsz6Mkf.DATA_JSON),
                    jws: { signatures: [detachedJws, detachedJws2] },
                },
            });
        }));
    });
});
