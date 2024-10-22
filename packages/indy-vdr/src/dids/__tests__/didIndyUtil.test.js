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
const core_1 = require("@aries-framework/core");
const didIndyUtil_1 = require("../didIndyUtil");
const didExample123_json_1 = __importDefault(require("./__fixtures__/didExample123.json"));
const didExample123base_json_1 = __importDefault(require("./__fixtures__/didExample123base.json"));
const didExample123extracontent_json_1 = __importDefault(require("./__fixtures__/didExample123extracontent.json"));
describe('didIndyUtil', () => {
    describe('combineDidDocumentWithJson', () => {
        it('should correctly combine a base DIDDoc with extra contents from a JSON object', () => __awaiter(void 0, void 0, void 0, function* () {
            const didDocument = core_1.JsonTransformer.fromJSON(didExample123base_json_1.default, core_1.DidDocument);
            expect((0, didIndyUtil_1.combineDidDocumentWithJson)(didDocument, didExample123extracontent_json_1.default).toJSON()).toEqual(didExample123_json_1.default);
        }));
    });
    describe('deepObjectDiff', () => {
        it('should correctly show the diff between a base DidDocument and a full DidDocument', () => __awaiter(void 0, void 0, void 0, function* () {
            expect((0, didIndyUtil_1.didDocDiff)(didExample123_json_1.default, didExample123base_json_1.default)).toMatchObject(didExample123extracontent_json_1.default);
        }));
    });
});
