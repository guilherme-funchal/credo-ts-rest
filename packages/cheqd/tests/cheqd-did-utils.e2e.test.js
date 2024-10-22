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
const core_1 = require("@aries-framework/core");
const didCheqdUtil_1 = require("../src/dids/didCheqdUtil");
const setup_1 = require("./setup");
describe('Test Cheqd Did Utils', () => {
    it('should validate did spec compliant payload', () => {
        const didDoc = (0, setup_1.validDidDoc)();
        const result = (0, didCheqdUtil_1.validateSpecCompliantPayload)(didDoc);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });
    it('should detect invalid verification method', () => {
        const result = (0, didCheqdUtil_1.validateSpecCompliantPayload)(new core_1.DidDocument({
            id: setup_1.validDid,
            verificationMethod: [
                {
                    id: setup_1.validDid + '#key-1',
                    publicKeyBase58: 'asca12e3as',
                    type: 'JsonWebKey2020',
                    controller: setup_1.validDid,
                },
            ],
        }));
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
    });
    it('should create MsgCreateDidDocPayloadToSign', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, didCheqdUtil_1.createMsgCreateDidDocPayloadToSign)((0, setup_1.validDidDoc)().toJSON(), '1.0');
        expect(result).toBeDefined();
    }));
    it('should create MsgDeactivateDidDocPayloadToSign', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = (0, didCheqdUtil_1.createMsgDeactivateDidDocPayloadToSign)({ id: setup_1.validDid }, '2.0');
        expect(result).toBeDefined();
    }));
});
