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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../../../utils");
const OutOfBandDidCommService_1 = require("../../../../oob/domain/OutOfBandDidCommService");
const domain_1 = require("../../../domain");
const peerDidNumAlgo2_1 = require("../peerDidNumAlgo2");
const didPeer2Ez6L_json_1 = __importDefault(require("./__fixtures__/didPeer2Ez6L.json"));
const didPeer2Ez6LMoreServices_json_1 = __importDefault(require("./__fixtures__/didPeer2Ez6LMoreServices.json"));
describe('peerDidNumAlgo2', () => {
    describe('didDocumentToNumAlgo2Did', () => {
        test('transforms method 2 peer did to a did document', () => __awaiter(void 0, void 0, void 0, function* () {
            expect((0, peerDidNumAlgo2_1.didToNumAlgo2DidDocument)(didPeer2Ez6L_json_1.default.id).toJSON()).toMatchObject(didPeer2Ez6L_json_1.default);
            expect((0, peerDidNumAlgo2_1.didToNumAlgo2DidDocument)(didPeer2Ez6LMoreServices_json_1.default.id).toJSON()).toMatchObject(didPeer2Ez6LMoreServices_json_1.default);
        }));
    });
    describe('didDocumentToNumAlgo2Did', () => {
        test('transforms method 2 peer did document to a did', () => __awaiter(void 0, void 0, void 0, function* () {
            const expectedDid = didPeer2Ez6L_json_1.default.id;
            const didDocument = utils_1.JsonTransformer.fromJSON(didPeer2Ez6L_json_1.default, domain_1.DidDocument);
            expect((0, peerDidNumAlgo2_1.didDocumentToNumAlgo2Did)(didDocument)).toBe(expectedDid);
        }));
    });
    describe('outOfBandServiceToNumAlgo2Did', () => {
        test('transforms a did comm service into a valid method 2 did', () => {
            const service = new OutOfBandDidCommService_1.OutOfBandDidCommService({
                id: '#service-0',
                serviceEndpoint: 'https://example.com/endpoint',
                recipientKeys: ['did:key:z6MkqRYqQiSgvZQdnBytw86Qbs2ZWUkGv22od935YF4s8M7V'],
                routingKeys: ['did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH'],
                accept: ['didcomm/v2', 'didcomm/aip2;env=rfc587'],
            });
            const peerDid = (0, peerDidNumAlgo2_1.outOfBandServiceToNumAlgo2Did)(service);
            const peerDidDocument = (0, peerDidNumAlgo2_1.didToNumAlgo2DidDocument)(peerDid);
            expect(peerDid).toBe('did:peer:2.SeyJzIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9lbmRwb2ludCIsInQiOiJkaWQtY29tbXVuaWNhdGlvbiIsInByaW9yaXR5IjowLCJyZWNpcGllbnRLZXlzIjpbImRpZDprZXk6ejZNa3FSWXFRaVNndlpRZG5CeXR3ODZRYnMyWldVa0d2MjJvZDkzNVlGNHM4TTdWI3o2TWtxUllxUWlTZ3ZaUWRuQnl0dzg2UWJzMlpXVWtHdjIyb2Q5MzVZRjRzOE03ViJdLCJyIjpbImRpZDprZXk6ejZNa3BUSFI4Vk5zQnhZQUFXSHV0MkdlYWRkOWpTd3VCVjh4Um9BbndXc2R2a3RII3o2TWtwVEhSOFZOc0J4WUFBV0h1dDJHZWFkZDlqU3d1QlY4eFJvQW53V3Nkdmt0SCJdLCJhIjpbImRpZGNvbW0vdjIiLCJkaWRjb21tL2FpcDI7ZW52PXJmYzU4NyJdfQ');
            expect(peerDid).toBe(peerDidDocument.id);
        });
    });
});
