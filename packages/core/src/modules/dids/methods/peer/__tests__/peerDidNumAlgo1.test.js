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
const peerDidNumAlgo1_1 = require("../peerDidNumAlgo1");
const didPeer1zQmR_json_1 = __importDefault(require("./__fixtures__/didPeer1zQmR.json"));
const didPeer1zQmZ_json_1 = __importDefault(require("./__fixtures__/didPeer1zQmZ.json"));
describe('peerDidNumAlgo1', () => {
    describe('didDocumentJsonToNumAlgo1Did', () => {
        test('transforms a did document into a valid method 1 did', () => __awaiter(void 0, void 0, void 0, function* () {
            expect((0, peerDidNumAlgo1_1.didDocumentJsonToNumAlgo1Did)(didPeer1zQmR_json_1.default)).toEqual(didPeer1zQmR_json_1.default.id);
        }));
        // FIXME: we need some input data from AFGO for this test to succeed (we create a hash of the document, so any inconsistency is fatal)
        xtest('transforms a did document from aries-framework-go into a valid method 1 did', () => {
            expect((0, peerDidNumAlgo1_1.didDocumentJsonToNumAlgo1Did)(didPeer1zQmZ_json_1.default)).toEqual(didPeer1zQmZ_json_1.default.id);
        });
    });
});